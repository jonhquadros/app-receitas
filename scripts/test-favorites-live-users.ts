import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

export async function runMultiUserFavoritesTest(
  emailA = 'usuario_a@teste.com',
  passwordA = 'SenhaTeste123!',
  emailB = 'usuario_b@teste.com',
  passwordB = 'SenhaTeste123!'
) {
  console.log('================================================================');
  console.log('    TESTE REAL DE ISOLAMENTO RLS ENTRE DOIS USUÁRIOS AUTÊNTICOS  ');
  console.log('================================================================');

  const clientAnon = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Obter ID da Receita 004
  const { data: rec, error: recErr } = await clientAnon
    .from('recipes')
    .select('id, numero, titulo')
    .eq('numero', 4)
    .single();

  if (recErr || !rec) {
    console.error('❌ Falha ao encontrar Receita 004:', recErr?.message);
    return false;
  }
  const recipe004Id = rec.id;
  console.log(`Receita alvo: #${rec.numero} - ${rec.titulo} (${recipe004Id})`);

  // A. LOGIN USUÁRIO A
  console.log(`\n[A. LOGIN A] Autenticando Usuário A (${emailA})...`);
  const { data: authA, error: errAuthA } = await clientAnon.auth.signInWithPassword({
    email: emailA,
    password: passwordA,
  });

  if (errAuthA || !authA.session || !authA.user) {
    console.error(`❌ FALHA LOGIN A: ${errAuthA?.message || 'sem sessão'}`);
    return false;
  }
  console.log(`✅ A. LOGIN A: Sucesso! ID do Usuário A: ${authA.user.id}`);

  // B. LOGIN USUÁRIO B
  console.log(`\n[B. LOGIN B] Autenticando Usuário B (${emailB})...`);
  const { data: authB, error: errAuthB } = await clientAnon.auth.signInWithPassword({
    email: emailB,
    password: passwordB,
  });

  if (errAuthB || !authB.session || !authB.user) {
    console.error(`❌ FALHA LOGIN B: ${errAuthB?.message || 'sem sessão'}`);
    return false;
  }
  console.log(`✅ B. LOGIN B: Sucesso! ID do Usuário B: ${authB.user.id}`);

  // Instâncias dedicadas com JWTs autênticos de cada usuário
  const clientUserA = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
  });

  const clientUserB = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
  });

  // Limpeza preventiva
  await clientUserA.from('favorites').delete().eq('user_id', authA.user.id);
  await clientUserB.from('favorites').delete().eq('user_id', authB.user.id);

  // C. FAVORITO DE A (Inserção e Leitura por A)
  console.log('\n[C. FAVORITO DE A] Usuário A insere e consulta a Receita 004...');
  const { error: insertAErr } = await clientUserA
    .from('favorites')
    .insert({ user_id: authA.user.id, recipe_id: recipe004Id });

  if (insertAErr) {
    console.error('❌ Falha ao inserir favorito para A:', insertAErr.message);
    return false;
  }

  const { data: listA, error: listAErr } = await clientUserA.from('favorites').select('*');
  const aHas004 = listA?.some((f) => f.recipe_id === recipe004Id);
  if (!listAErr && aHas004) {
    console.log(`✅ C. FAVORITO DE A: Inserido e visível para Usuário A (total: ${listA?.length})!`);
  } else {
    console.error('❌ C. FAVORITO DE A: Não encontrado na listagem de A.');
    return false;
  }

  // D. B NÃO VÊ FAVORITO DE A
  console.log('\n[D. B NÃO VÊ FAVORITO DE A] Usuário B consulta favoritos...');
  const { data: listB } = await clientUserB.from('favorites').select('*');
  const { data: bQueriesA } = await clientUserB.from('favorites').select('*').eq('user_id', authA.user.id);

  const bSeesNothing = (listB?.length === 0) && (bQueriesA?.length === 0);
  if (bSeesNothing) {
    console.log('✅ D. B NÃO VÊ FAVORITO DE A: Isolamento total! Consulta geral retornou 0; consulta direta por user_id de A retornou 0.');
  } else {
    console.error('❌ D. B NÃO VÊ FAVORITO DE A: FALHA! Usuário B visualizou dados de A!');
    return false;
  }

  // E. B NÃO CONSEGUE FORJAR INSERT
  console.log('\n[E. B NÃO CONSEGUE FORJAR INSERT] Usuário B tenta inserir favorito usando user_id de A...');
  const { error: spoofErr } = await clientUserB
    .from('favorites')
    .insert({ user_id: authA.user.id, recipe_id: recipe004Id });

  if (spoofErr) {
    console.log(`✅ E. B NÃO CONSEGUE FORJAR INSERT: Bloqueado pelo RLS! Erro: "${spoofErr.message}" (Code: ${spoofErr.code})`);
  } else {
    console.error('❌ E. B NÃO CONSEGUE FORJAR INSERT: FALHA GRAVE! Usuário B conseguiu forjar insert em nome de A!');
    return false;
  }

  // F. B NÃO CONSEGUE EXCLUIR FAVORITO DE A
  console.log('\n[F. B NÃO CONSEGUE EXCLUIR FAVORITO DE A] Usuário B tenta deletar favorito de A...');
  const { data: delBResult } = await clientUserB
    .from('favorites')
    .delete()
    .eq('user_id', authA.user.id)
    .select();

  // Conferir se o favorito de A continua existindo intacto
  const { data: checkAStillExists } = await clientUserA.from('favorites').select('*');
  const aStillIntact = checkAStillExists?.some((f) => f.recipe_id === recipe004Id);

  if (aStillIntact && (!delBResult || delBResult.length === 0)) {
    console.log('✅ F. B NÃO CONSEGUE EXCLUIR FAVORITO DE A: Bloqueado pelo RLS! 0 linhas afetadas e o favorito de A permaneceu intacto.');
  } else {
    console.error('❌ F. B NÃO CONSEGUE EXCLUIR FAVORITO DE A: FALHA! Favorito de A foi apagado indevidamente.');
    return false;
  }

  // G. A CONSEGUE EXCLUIR O PRÓPRIO FAVORITO
  console.log('\n[G. A CONSEGUE EXCLUIR O PRÓPRIO FAVORITO] Usuário A remove seu favorito...');
  const { error: delAErr } = await clientUserA
    .from('favorites')
    .delete()
    .eq('user_id', authA.user.id)
    .eq('recipe_id', recipe004Id);

  const { data: checkEmptyA } = await clientUserA.from('favorites').select('*');
  if (!delAErr && checkEmptyA?.length === 0) {
    console.log('✅ G. A CONSEGUE EXCLUIR O PRÓPRIO FAVORITO: Removido com sucesso pelo próprio usuário A.');
  } else {
    console.error('❌ G. A CONSEGUE EXCLUIR O PRÓPRIO FAVORITO: Falha na remoção por A.');
    return false;
  }

  // H. ANÔNIMO BLOQUEADO
  console.log('\n[H. ANÔNIMO BLOQUEADO] Tentando acessar favorites sem token de autenticação...');
  const cleanAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: anonSelectErr } = await cleanAnon.from('favorites').select('*');
  const { error: anonInsertErr } = await cleanAnon.from('favorites').insert({
    user_id: '00000000-0000-0000-0000-000000000001',
    recipe_id: recipe004Id,
  });

  if (anonSelectErr && anonInsertErr) {
    console.log(`✅ H. ANÔNIMO BLOQUEADO: Usuário anônimo sem JWT é barrado em SELECT (${anonSelectErr.message}) e INSERT (${anonInsertErr.message}).`);
  } else {
    console.error('❌ H. ANÔNIMO BLOQUEADO: Falha de segurança! Anônimo teve acesso.');
    return false;
  }

  // I. RLS ATIVO
  console.log('\n[I. RLS ATIVO] Verificando se RLS está operante na tabela...');
  console.log('✅ I. RLS ATIVO: Comprovado pelo bloqueio de usuários anônimos e isolamento estrito entre A e B.');

  console.log('\n================================================================');
  console.log('        TODAS AS 9 ETAPAS DE SEGURANÇA PASSARAM COM SUCESSO!     ');
  console.log('================================================================');
  return true;
}

runMultiUserFavoritesTest();
