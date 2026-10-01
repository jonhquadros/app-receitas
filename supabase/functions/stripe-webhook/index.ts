import Stripe from 'npm:stripe@^22';
import { createClient } from 'npm:@supabase/supabase-js@^2';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const webhookSecret =
  Deno.env.get('STRIPE_WEBHOOK_SECRET') ??
  Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') ??
  '';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

let secretKey = serviceRoleKey;
if (!secretKey && secretKeysRaw) {
  try {
    secretKey = JSON.parse(secretKeysRaw)?.default ?? '';
  } catch {
    console.error('SUPABASE_SECRET_KEYS inválido.');
  }
}

const stripe = new Stripe(stripeSecretKey);
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabaseAdmin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function stripeStatus(status: Stripe.Subscription.Status) {
  if (status === 'active') return 'active';
  if (status === 'trialing') return 'trialing';
  if (status === 'past_due') return 'past_due';
  return 'canceled';
}

async function syncSubscription(
  userId: string,
  customerId: string | null,
  subscriptionId: string,
  plan: string,
) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
  const status = stripeStatus(sub.status);

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('subscriptions')
    .select('manual_override')
    .eq('user_id', userId)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing?.manual_override) {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plano: plan,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
    return;
  }

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plano: plan,
        status,
        periodo_atual_fim: periodEnd,
        current_period_end: periodEnd,
        manual_override: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

  if (error) throw error;

  console.log(
    `Subscription sincronizada: user_id=${userId}, subscription=${subscriptionId}, status=${status}, period_end=${periodEnd}`,
  );
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !secretKey) {
    console.error('Webhook mal configurado:', {
      stripeSecretKey: Boolean(stripeSecretKey),
      webhookSecret: Boolean(webhookSecret),
      supabaseUrl: Boolean(supabaseUrl),
      supabaseAdminKey: Boolean(secretKey),
    });
    return Response.json({ error: 'Webhook não configurado no servidor.' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('Stripe-Signature ausente.');
    return new Response('Stripe-Signature ausente', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (error) {
    console.error('Falha na verificação da assinatura Stripe:', error);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  console.log(`Evento Stripe recebido: ${event.type} [${event.id}]`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.user_id;
        const plan = session.metadata?.plan ?? 'mensal';
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null;

        if (!userId) {
          throw new Error('checkout.session.completed sem user_id.');
        }
        if (!subscriptionId) {
          throw new Error('checkout.session.completed sem subscription_id.');
        }

        await syncSubscription(userId, customerId, subscriptionId, plan);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null;

        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        const { data: currentSub, error } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId ?? ''}`)
          .maybeSingle();

        if (error) throw error;

        if (currentSub && !currentSub.manual_override) {
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              periodo_atual_fim: periodEnd,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentSub.user_id);

          if (updateError) throw updateError;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null;

        if (!subscriptionId) break;

        const { data: currentSub, error } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId ?? ''}`)
          .maybeSingle();

        if (error) throw error;

        if (currentSub && !currentSub.manual_override) {
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentSub.user_id);

          if (updateError) throw updateError;
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;
        const userId = sub.metadata?.user_id;
        const plan = sub.metadata?.plan ?? 'mensal';

        if (userId) {
          const customerId =
            typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null;
          await syncSubscription(userId, customerId, subscriptionId, plan);
          break;
        }

        const { data: currentSub, error } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();

        if (error) throw error;

        if (currentSub && !currentSub.manual_override) {
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: stripeStatus(sub.status),
              periodo_atual_fim: periodEnd,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentSub.user_id);

          if (updateError) throw updateError;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const { data: currentSub, error } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();

        if (error) throw error;

        if (currentSub && !currentSub.manual_override) {
          const now = new Date().toISOString();
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              periodo_atual_fim: now,
              current_period_end: now,
              updated_at: now,
            })
            .eq('user_id', currentSub.user_id);

          if (updateError) throw updateError;
        }
        break;
      }

      default:
        console.log(`Evento ignorado: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error(`Erro processando evento ${event.type}:`, error);
    return Response.json({ error: 'Erro ao processar webhook.' }, { status: 500 });
  }
});
