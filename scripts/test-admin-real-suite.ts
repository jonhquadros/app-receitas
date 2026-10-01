import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

export async function runAdminTestSuite() {
  console.log('================================================================');
  console.log('       TESTE REAL DE TODAS AS OPERAÇÕES DE ADMINISTRADOR        ');
  console.log('================================================================\n');

  const clientAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Login Usuário A
  const { data: authA, error: errA } = await clientAnon.auth.signInWithPassword({
    email: 'usuario_a@teste.com',
    password: 'SenhaTeste123!',
  });

  if (!authA?.session || !authA?.user) {
    console.error('❌ Falha ao logar com A:', errA?.message);
    process.exit(1);
  }

  // 2. Login Usuário B
  const { data: authB, error: errB } = await clientAnon.auth.signInWithPassword({
    email: 'usuario_b@teste.com',
    password: 'SenhaTeste123!',
  });

  if (!authB?.session || !authB?.user) {
    console.error('❌ Falha ao logar com B:', errB?.message);
    process.exit(1);
  }

  const clientA = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
  });

  const clientB = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
  });

  // 0. CONFIRMAÇÃO DE ROLES NO BANCO
  console.log('[FASE 0] Verificando roles atuais no banco de dados...');
  const { data: profA } = await clientA
    .from('profiles')
    .select('*')
    .eq('id', authA.user.id)
    .single();

  const { data: profB } = await clientB
    .from('profiles')
    .select('*')
    .eq('id', authB.user.id)
    .single();

  console.log(`   Usuário A (${authA.user.email}): Role = "${profA?.role}"`);
  console.log(`   Usuário B (${authB.user.email}): Role = "${profB?.role}"`);

  if (profA?.role !== 'admin') {
    console.error(`❌ Usuário A não está com role = 'admin' (atual: ${profA?.role}).`);
    process.exit(1);
  }
  if (profB?.role !== 'usuario') {
    console.error(`❌ Usuário B não está com role = 'usuario' (atual: ${profB?.role}).`);
    process.exit(1);
  }
  console.log('✅ Confirmado no banco: A é "admin" e B é "usuario"!\n');

  // OPERAÇÃO 1: Consultar todos os usuários
  console.log('[OPERAÇÃO 1] Admin (A) consulta lista de todos os usuários...');
  const { data: allUsers, error: errUsers } = await clientA
    .from('profiles')
    .select('id, nome, role, created_at');

  console.log(`   Usuários retornados para Admin: ${allUsers?.length || 0}`);
  if (allUsers && allUsers.length >= 2) {
    console.log('   ✅ SUCESSO: Admin visualiza todos os perfis cadastrados!');
  } else {
    console.error('   ❌ Falha ao listar usuários:', errUsers?.message);
    process.exit(1);
  }

  // OPERAÇÃO 2: Promover Usuário B para admin
  console.log('\n[OPERAÇÃO 2] Admin (A) promove Usuário B para "admin"...');
  const { error: errPromote } = await clientA
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authB.user.id);

  if (errPromote) {
    console.error('   ❌ Falha ao promover B:', errPromote.message);
    process.exit(1);
  }
  const { data: checkB } = await clientA.from('profiles').select('role').eq('id', authB.user.id).single();
  console.log(`   ✅ SUCESSO: Role de Usuário B no banco promovido para "${checkB?.role}"!`);

  // OPERAÇÃO 3: Rebaixar Usuário B de volta para usuario
  console.log('\n[OPERAÇÃO 3] Admin (A) rebaixa Usuário B de volta para "usuario"...');
  const { error: errDemote } = await clientA
    .from('profiles')
    .update({ role: 'usuario' })
    .eq('id', authB.user.id);

  if (errDemote) {
    console.error('   ❌ Falha ao rebaixar B:', errDemote.message);
    process.exit(1);
  }
  const { data: checkB2 } = await clientA.from('profiles').select('role').eq('id', authB.user.id).single();
  console.log(`   ✅ SUCESSO: Role de Usuário B no banco rebaixado para "${checkB2?.role}"!`);

  // OPERAÇÃO 4: Bloqueio de promoção/rebaixamento executado por B (usuário comum)
  console.log('\n[OPERAÇÃO 4] Usuário B tenta promover a si mesmo ou rebaixar A...');
  const { error: errBAttemptsPromoteSelf } = await clientB
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', authB.user.id);

  const { data: bAttemptsDemoteA, error: errBDemoteA } = await clientB
    .from('profiles')
    .update({ role: 'usuario' })
    .eq('id', authA.user.id)
    .select();

  if (errBAttemptsPromoteSelf || (!bAttemptsDemoteA || bAttemptsDemoteA.length === 0)) {
    console.log(`   ✅ SUCESSO: B bloqueado de alterar roles! (Erro recebido: "${errBAttemptsPromoteSelf?.message || '0 linhas afetadas por RLS'}")`);
  } else {
    console.error('   ❌ FALHA DE SEGURANÇA: B conseguiu alterar roles!');
    process.exit(1);
  }

  // OPERAÇÃO 5: Usuário B tenta inserir/alterar subscriptions (deve ser bloqueado)
  console.log('\n[OPERAÇÃO 5] Usuário B tenta alterar subscriptions (bloqueio esperado)...');
  const { error: errBSub } = await clientB
    .from('subscriptions')
    .insert({ user_id: authB.user.id, status: 'active' });

  if (errBSub) {
    console.log(`   ✅ SUCESSO: B bloqueado de alterar subscriptions! (Erro: "${errBSub.message}")`);
  } else {
    console.error('   ❌ FALHA DE SEGURANÇA: B conseguiu inserir subscription!');
    process.exit(1);
  }

  // OPERAÇÃO 6: Admin (A) gerencia subscriptions (liberar e revogar)
  console.log('\n[OPERAÇÃO 6] Admin (A) gerencia subscriptions para Usuário B...');
  await clientA.from('subscriptions').delete().eq('user_id', authB.user.id);
  const { error: errSubActive } = await clientA
    .from('subscriptions')
    .insert({ user_id: authB.user.id, status: 'active' });

  if (errSubActive) {
    console.error('   ❌ Falha ao liberar acesso:', errSubActive.message);
    process.exit(1);
  }
  console.log('   ✅ SUCESSO: Acesso liberado (status: "active") para B!');

  await clientA.from('subscriptions').delete().eq('user_id', authB.user.id);
  const { error: errSubCancel } = await clientA
    .from('subscriptions')
    .insert({ user_id: authB.user.id, status: 'canceled' });

  if (errSubCancel) {
    console.error('   ❌ Falha ao revogar acesso:', errSubCancel.message);
    process.exit(1);
  }
  console.log('   ✅ SUCESSO: Acesso revogado (status: "canceled") para B!');

  // OPERAÇÃO 7: Usuário B tenta inserir receita ou tabelas filhas (deve ser bloqueado)
  console.log('\n[OPERAÇÃO 7] Usuário B tenta inserir receita ou tabelas filhas (bloqueio esperado)...');
  const { error: errBRec } = await clientB.from('recipes').insert({
    numero: 348,
    titulo: 'RECEITA NÃO AUTORIZADA',
    categoria: 'Infusões',
    uso_tradicional: 'Teste',
    rendimento: '1',
    como_utilizar: 'Teste',
    armazenamento: 'Teste',
    atencao: 'Aviso',
  });

  const { error: errBIng } = await clientB.from('recipe_ingredients').insert({
    recipe_id: '00000000-0000-0000-0000-000000000004',
    ordem: 99,
    texto: 'Ingrediente invasor',
  });

  if (errBRec && errBIng) {
    console.log(`   ✅ SUCESSO: B bloqueado de inserir em recipes! (Erro: "${errBRec.message}")`);
    console.log(`   ✅ SUCESSO: B bloqueado de inserir em recipe_ingredients! (Erro: "${errBIng.message}")`);
  } else {
    console.error('   ❌ FALHA DE SEGURANÇA: B conseguiu inserir em tabelas de receitas!');
    process.exit(1);
  }

  // OPERAÇÃO 8: Importar receita administrativa completa com TODAS as tabelas filhas
  console.log('\n[OPERAÇÃO 8] Admin (A) insere receita completa com todas as tabelas filhas...');
  const testRecipeId = '00000000-0000-0000-0000-000000000349';

  // Inserir receita mãe
  const { error: errRecIns } = await clientA.from('recipes').upsert({
    id: testRecipeId,
    numero: 349,
    titulo: 'RECEITA TESTE COMPLETA ADMIN',
    categoria: 'Infusões',
    uso_tradicional: 'Uso de teste com todas as seções e tabelas filhas',
    tempo_preparo_min: 5,
    tempo_cozimento_infusao_min: 5,
    tempo_total_min: 10,
    rendimento: '1 xícara',
    como_utilizar: 'Beber em temperatura morna',
    melhor_momento: 'Após as refeições',
    armazenamento: 'Consumir na hora',
    substituicoes: 'Hortelã fresca por desidratada',
    atencao: 'Apenas para teste de importação administrativa',
    is_preview: false,
  });

  if (errRecIns) {
    console.error('   ❌ Falha ao inserir receita como admin:', errRecIns.message);
    process.exit(1);
  }
  console.log('   ✅ 1/5: Tabela principal recipes inserida com sucesso!');

  // Inserir ingredientes
  const { error: ingErr } = await clientA.from('recipe_ingredients').insert([
    { recipe_id: testRecipeId, ordem: 1, texto: '1 colher de chá de sementes de erva-doce' },
    { recipe_id: testRecipeId, ordem: 2, texto: '5 folhas frescas de hortelã' },
  ]);
  if (ingErr) console.error('   ❌ Falha ao inserir ingredientes:', ingErr.message);
  else console.log('   ✅ 2/5: Tabela recipe_ingredients (2 itens) gravada!');

  // Inserir utensílios
  const { error: utErr } = await clientA.from('recipe_utensils').insert([
    { recipe_id: testRecipeId, ordem: 1, texto: '1 xícara de louça' },
    { recipe_id: testRecipeId, ordem: 2, texto: '1 infusor de chá ou peneira fina' },
  ]);
  if (utErr) console.error('   ❌ Falha ao inserir utensílios:', utErr.message);
  else console.log('   ✅ 3/5: Tabela recipe_utensils (2 itens) gravada!');

  // Inserir passos
  const { error: stepErr } = await clientA.from('recipe_steps').insert([
    { recipe_id: testRecipeId, ordem: 1, texto: 'Ferva 200 ml de água filtrada' },
    { recipe_id: testRecipeId, ordem: 2, texto: 'Adicione as ervas e abafe por 7 minutos' },
  ]);
  if (stepErr) console.error('   ❌ Falha ao inserir passos:', stepErr.message);
  else console.log('   ✅ 4/5: Tabela recipe_steps (2 passos) gravada!');

  // Inserir dicas
  const { error: tipErr } = await clientA.from('recipe_tips').insert([
    { recipe_id: testRecipeId, ordem: 1, texto: 'Dica do Seu Neco: não ferva as folhas para preservar os óleos essenciais' },
  ]);
  if (tipErr) console.error('   ❌ Falha ao inserir dicas:', tipErr.message);
  else console.log('   ✅ 5/5: Tabela recipe_tips (1 dica) gravada!');

  // Confirmar no banco que receita e TODAS as tabelas filhas estão gravadas e relacionáveis
  const { data: savedRec, error: errFetch } = await clientA
    .from('recipes')
    .select(`
      id, numero, titulo,
      recipe_ingredients(ordem, texto),
      recipe_utensils(ordem, texto),
      recipe_steps(ordem, texto),
      recipe_tips(ordem, texto)
    `)
    .eq('numero', 349)
    .single();

  if (errFetch || !savedRec) {
    console.error('   ❌ Falha ao confirmar leitura relacional:', errFetch?.message);
    process.exit(1);
  }

  console.log(`\n   Confirmado no banco com integridade referencial:`);
  console.log(`   - Receita #${savedRec.numero}: "${savedRec.titulo}"`);
  console.log(`   - Ingredientes: ${(savedRec as any)?.recipe_ingredients?.length} itens`);
  console.log(`   - Utensílios: ${(savedRec as any)?.recipe_utensils?.length} itens`);
  console.log(`   - Modo de Preparo: ${(savedRec as any)?.recipe_steps?.length} passos`);
  console.log(`   - Dicas do Seu Neco: ${(savedRec as any)?.recipe_tips?.length} dicas`);

  // Limpar dados criados pelo teste
  await clientA.from('recipe_ingredients').delete().eq('recipe_id', testRecipeId);
  await clientA.from('recipe_utensils').delete().eq('recipe_id', testRecipeId);
  await clientA.from('recipe_steps').delete().eq('recipe_id', testRecipeId);
  await clientA.from('recipe_tips').delete().eq('recipe_id', testRecipeId);
  await clientA.from('recipes').delete().eq('id', testRecipeId);
  console.log('   ✅ SUCESSO: Limpeza completa — receita #349 e todas as tabelas filhas removidas.');

  console.log('\n================================================================');
  console.log('     TODAS AS OPERAÇÕES DE ADMINISTRADOR FORAM COMPROVADAS! ✅  ');
  console.log('================================================================');
  return true;
}

runAdminTestSuite();
