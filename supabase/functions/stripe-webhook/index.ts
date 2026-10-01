// Supabase Edge Function: stripe-webhook
// Processa eventos do Stripe e atualiza a tabela public.subscriptions
// VARIÁVEIS DE AMBIENTE NECESSÁRIAS NO SUPABASE:
// - STRIPE_SECRET_KEY (ex: sk_test_...)
// - STRIPE_WEBHOOK_SECRET (ex: whsec_...)
// - SUPABASE_URL (injetada automaticamente pelo Supabase)
// - SUPABASE_SERVICE_ROLE_KEY (injetada automaticamente pelo Supabase)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature || !webhookSecret) {
    return new Response('Stripe signature ou Webhook Secret ausente', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const bodyText = await req.text();
    event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Erro de verificação de assinatura do Webhook: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`🔔 Evento recebido do Stripe: ${event.type} [${event.id}]`);

  try {
    switch (event.type) {
      // 1. Sessão de Checkout Concluída
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const plan = session.metadata?.plan || 'mensal';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId) {
          // Verificar se há liberação manual prévia do admin (Regra 10: prevalece sobre Stripe até ser desfeita)
          const { data: existing } = await supabaseAdmin
            .from('subscriptions')
            .select('manual_override, status')
            .eq('user_id', userId)
            .maybeSingle();

          if (existing?.manual_override) {
            console.log(`ℹ️ Usuário ${userId} possui manual_override ativo. Mantendo status manual do admin.`);
            await supabaseAdmin.from('subscriptions').update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plano: plan,
              updated_at: new Date().toISOString(),
            }).eq('user_id', userId);
          } else {
            await supabaseAdmin.from('subscriptions').upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plano: plan,
              status: 'active',
              periodo_atual_fim: null,
              manual_override: false,
              updated_at: new Date().toISOString(),
            });
            console.log(`✅ Acesso liberado (status: active) para usuário ${userId}`);
          }
        }
        break;
      }

      // 2. Fatura Paga com Sucesso
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

          // Buscar pelo stripe_subscription_id ou stripe_customer_id
          const { data: currentSub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id, manual_override')
            .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
            .maybeSingle();

          if (currentSub && !currentSub.manual_override) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'active',
                periodo_atual_fim: periodEnd,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', currentSub.user_id);
            console.log(`✅ Fatura paga: período renovado até ${periodEnd} para ${currentSub.user_id}`);
          }
        }
        break;
      }

      // 3. Falha no Pagamento da Fatura
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        const { data: currentSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
          .maybeSingle();

        if (currentSub && !currentSub.manual_override) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentSub.user_id);
          console.log(`⚠️ Falha de pagamento: status atualizado para past_due para ${currentSub.user_id}`);
        }
        break;
      }

      // 4. Assinatura Atualizada
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;
        const status = sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'canceled';
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        const { data: currentSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();

        if (currentSub && !currentSub.manual_override) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status,
              periodo_atual_fim: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentSub.user_id);
          console.log(`🔄 Assinatura atualizada: status = ${status} para ${currentSub.user_id}`);
        }
        break;
      }

      // 5. Assinatura Cancelada / Deletada
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;

        const { data: currentSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id, manual_override')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();

        if (currentSub && !currentSub.manual_override) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', currentSub.user_id);
          console.log(`🚫 Assinatura cancelada no Stripe: acesso removido para ${currentSub.user_id}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error(`❌ Erro no processamento do evento ${event.type}:`, err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
