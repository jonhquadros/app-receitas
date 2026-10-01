import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

async function runAudit() {
  console.log('================================================================');
  console.log('        AUDITORIA DE EVIDÊNCIA COMPLETA — FASE 04              ');
  console.log('================================================================\n');

  const clientAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. LOGIN DOS DOIS USUÁRIOS
  console.log('--- 1. AUTENTICAÇÃO REAL ---');
  const { data: authA, error: errA } = await clientAnon.auth.signInWithPassword({
    email: 'usuario_a@teste.com',
    password: 'SenhaTeste123!',
  });
  console.log('Login A:', authA?.user ? `SUCESSO (ID: ${authA.user.id})` : `FALHA (${errA?.message})`);

  const { data: authB, error: errB } = await clientAnon.auth.signInWithPassword({
    email: 'usuario_b@teste.com',
    password: 'SenhaTeste123!',
  });
  console.log('Login B:', authB?.user ? `SUCESSO (ID: ${authB.user.id})` : `FALHA (${errB?.message})`);

  if (!authA?.session || !authB?.session) {
    console.error('Abortando por falta de sessão.');
    return;
  }

  const clientA = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
  });

  const clientB = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
  });

  // 2. AUDITORIA DA TABELA PROFILES NO BANCO
  console.log('\n--- 2. CONSULTA À TABELA PROFILES (RLS) ---');
  const { data: profA, error: errProfA } = await clientA.from('profiles').select('*');
  console.log('A consulta profiles:', { data: profA, error: errProfA?.message, code: errProfA?.code });

  const { data: profB, error: errProfB } = await clientB.from('profiles').select('*');
  console.log('B consulta profiles:', { data: profB, error: errProfB?.message, code: errProfB?.code });

  // 3. TENTATIVAS DE ESCALONAMENTO DE PRIVILÉGIO VIA API PELO USUÁRIO B
  console.log('\n--- 3. TESTES DE ESCALONAMENTO DE PRIVILÉGIOS (USUÁRIO B) ---');
  
  // Teste A: B tenta alterar seu próprio profile para role = 'admin'
  const { data: escA, error: errEscA } = await clientB
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authB.user.id)
    .select();
  console.log('Teste A (B tenta virar admin):', { data: escA, error: errEscA?.message, code: errEscA?.code });

  // Teste B: B tenta alterar profile de A para role = 'admin'
  const { data: escB, error: errEscB } = await clientB
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authA.user.id)
    .select();
  console.log('Teste B (B altera profile de A):', { data: escB, error: errEscB?.message, code: errEscB?.code });

  // Teste C: B tenta inserir diretamente uma receita no banco (operações restritas a admin)
  const { data: insRecB, error: errInsRecB } = await clientB
    .from('recipes')
    .insert({
      numero: 999,
      titulo: 'RECEITA HACKER',
      categoria: 'Teste',
      uso_tradicional: 'Invasão',
      rendimento: '1',
      como_utilizar: 'Teste',
      armazenamento: 'Teste',
      atencao: 'Aviso',
    })
    .select();
  console.log('Teste C (B tenta inserir receita no banco):', { data: insRecB, error: errInsRecB?.message, code: errInsRecB?.code });

  // Teste D: B tenta modificar assinatura de A
  const { data: subB, error: errSubB } = await clientB
    .from('subscriptions')
    .upsert({ user_id: authA.user.id, status: 'canceled' })
    .select();
  console.log('Teste D (B tenta alterar assinatura de A):', { data: subB, error: errSubB?.message, code: errSubB?.code });

  // 4. TESTE COM ANÔNIMO
  console.log('\n--- 4. TESTES COM CLIENTE ANÔNIMO ---');
  const { error: anonProfSel } = await clientAnon.from('profiles').select('*');
  console.log('Anônimo SELECT profiles:', anonProfSel?.message, anonProfSel?.code);

  const { error: anonProfIns } = await clientAnon.from('profiles').insert({
    id: '00000000-0000-0000-0000-000000000099',
    role: 'admin',
  });
  console.log('Anônimo INSERT profiles:', anonProfIns?.message, anonProfIns?.code);

  const { error: anonRecIns } = await clientAnon.from('recipes').insert({
    numero: 998,
    titulo: 'ANON RECIPE',
  });
  console.log('Anônimo INSERT recipes:', anonRecIns?.message, anonRecIns?.code);

  // 5. TESTE DE RECUPERAÇÃO DE SENHA
  console.log('\n--- 5. FLUXO DE RECUPERAÇÃO DE SENHA ---');
  const { data: resetRes, error: resetErr } = await clientAnon.auth.resetPasswordForEmail(
    'usuario_a@teste.com',
    { redirectTo: 'http://localhost:3000' }
  );
  console.log('resetPasswordForEmail:', { error: resetErr?.message || 'Nenhum erro retornado pela API' });

  // 6. REGRESSÃO DA RECEITA 004 E BUSCA
  console.log('\n--- 6. REGRESSÃO FASES 1-3 ---');
  const { data: rec004 } = await clientAnon
    .from('recipes')
    .select(`
      id, numero, titulo, categoria, uso_tradicional,
      tempo_preparo_min, tempo_cozimento_infusao_min, tempo_total_min,
      rendimento, como_utilizar, melhor_momento, armazenamento, substituicoes, atencao,
      recipe_ingredients(ordem, texto),
      recipe_utensils(ordem, texto),
      recipe_steps(ordem, texto),
      recipe_tips(ordem, texto)
    `)
    .eq('numero', 4)
    .single();

  console.log('Receita 004 carregada:', rec004 ? `SIM (#${rec004.numero} - ${rec004.titulo})` : 'NÃO');
  console.log('Ingredientes:', (rec004 as any)?.recipe_ingredients?.length);
  console.log('Utensílios:', (rec004 as any)?.recipe_utensils?.length);
  console.log('Passos:', (rec004 as any)?.recipe_steps?.length);
  console.log('Dicas:', (rec004 as any)?.recipe_tips?.length);

  // 7. FAVORITOS ISOLAMENTO
  console.log('\n--- 7. REGRESSÃO FAVORITOS RLS ---');
  const { data: favBSeesA } = await clientB.from('favorites').select('*').eq('user_id', authA.user.id);
  console.log('B consegue ver favoritos de A?', (favBSeesA?.length || 0) > 0 ? 'FALHA' : 'NÃO (0 registros - Bloqueado por RLS)');

  console.log('\n================================================================');
  console.log('                    FIM DA AUDITORIA                            ');
  console.log('================================================================');
}

runAudit();
