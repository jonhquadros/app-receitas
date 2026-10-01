import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

async function testFavoritesSecurityLive() {
  console.log('=== TESTE REAL DE SEGURANÇA E RLS: FAVORITOS MULTI-USUÁRIO ===');

  const clientAnon = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Obter ou verificar a receita 004 (UUID)
  const { data: recipes, error: recErr } = await clientAnon.from('recipes').select('id, numero').eq('numero', 4).single();
  if (recErr || !recipes) {
    console.error('Falha ao obter receita 004:', recErr);
    return;
  }
  const recipe004Id = recipes.id;
  console.log(`Receita 004 ID UUID: ${recipe004Id}`);

  // 2. Tentar cadastrar ou logar dois usuários de teste
  const rand = Math.floor(Math.random() * 1000000);
  const emailA = `audit.user.neco.a.${rand}@gmail.com`;
  const emailB = `audit.user.neco.b.${rand}@gmail.com`;
  const password = 'TestPassword123!@#';

  console.log(`\nCriando Usuário A (${emailA})...`);
  const { data: authA, error: errA } = await clientAnon.auth.signUp({ email: emailA, password });
  
  console.log(`Criando Usuário B (${emailB})...`);
  const { data: authB, error: errB } = await clientAnon.auth.signUp({ email: emailB, password });

  if (errA || errB) {
    console.warn('SignUp retornou erro (possivelmente confirmação de email habilitada):', errA?.message || errB?.message);
    console.log('Testando se signInWithPassword funciona ou testando com tokens...');
  }

  const userA = authA?.user;
  const userB = authB?.user;
  const sessionA = authA?.session;
  const sessionB = authB?.session;

  console.log('User A criado:', userA ? `ID: ${userA.id}` : 'Não');
  console.log('User B criado:', userB ? `ID: ${userB.id}` : 'Não');
  console.log('Sessão A ativa:', Boolean(sessionA));
  console.log('Sessão B ativa:', Boolean(sessionB));

  if (!sessionA || !sessionB || !userA || !userB) {
    console.log('Nota: Se o Supabase exigir confirmação de e-mail por padrão para novas contas sem confirmação, vamos verificar se podemos criar com tokens de teste ou autenticação anônima/mock.');
  } else {
    // Criar cliente autenticado como Usuário A
    const clientA = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });

    // Criar cliente autenticado como Usuário B
    const clientB = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } }
    });

    // TESTE 1: Usuário A adiciona aos favoritos
    console.log('\n[TESTE 1] Usuário A inserindo favorito para Receita 004...');
    const { data: insertA, error: insertAErr } = await clientA.from('favorites').insert({
      user_id: userA.id,
      recipe_id: recipe004Id
    }).select();

    console.log('Resultado inserção User A:', insertAErr ? `ERRO: ${insertAErr.message}` : 'SUCESSO ✅');

    // TESTE 2: Usuário A lê seus favoritos
    console.log('\n[TESTE 2] Usuário A consultando seus favoritos...');
    const { data: favsA, error: favsAErr } = await clientA.from('favorites').select('*');
    console.log('Favoritos visíveis para User A:', favsA?.length, 'itens');

    // TESTE 3: Usuário B consulta favoritos (deve retornar 0, NÃO deve ver o favorito de A!)
    console.log('\n[TESTE 3] Usuário B consultando favoritos (isolamento RLS)...');
    const { data: favsB, error: favsBErr } = await clientB.from('favorites').select('*');
    console.log('Favoritos visíveis para User B:', favsB?.length, 'itens');
    if (favsB && favsB.length === 0) {
      console.log('✅ ISOLAMENTO CONFIRMADO: Usuário B não vê os favoritos do Usuário A!');
    } else {
      console.error('❌ FALHA DE ISOLAMENTO: Usuário B viu dados do Usuário A!');
    }

    // TESTE 4: Usuário B tenta inserir favorito usando o user_id do Usuário A (Spoofing)
    console.log('\n[TESTE 4] Usuário B tentando inserir favorito forjando user_id do Usuário A...');
    const { data: spoofInsert, error: spoofErr } = await clientB.from('favorites').insert({
      user_id: userA.id,
      recipe_id: recipe004Id
    });
    if (spoofErr) {
      console.log(`✅ BLOQUEIO DE SPOOFING CONFIRMADO! RLS rejeitou inserção indevida: ${spoofErr.message}`);
    } else {
      console.error('❌ FALHA GRAVE: Usuário B conseguiu inserir favorito no nome do Usuário A!');
    }

    // TESTE 5: Usuário B tenta deletar favorito do Usuário A
    console.log('\n[TESTE 5] Usuário B tentando deletar o favorito do Usuário A...');
    const { error: delErr } = await clientB.from('favorites').delete().eq('user_id', userA.id);
    // Verificar se o favorito de A ainda existe
    const { data: checkAfterDel } = await clientA.from('favorites').select('*');
    if (checkAfterDel && checkAfterDel.length > 0) {
      console.log('✅ BLOQUEIO DE DELEÇÃO CONFIRMADO! Usuário B não conseguiu apagar o favorito do Usuário A.');
    } else {
      console.error('❌ FALHA: Usuário B conseguiu apagar o favorito do Usuário A!');
    }

    // Limpeza: Usuário A remove seu próprio favorito
    await clientA.from('favorites').delete().eq('user_id', userA.id);
    console.log('\nLimpeza concluída com sucesso.');
  }
}

testFavoritesSecurityLive();
