import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLive() {
  console.log('=== TESTE AO VIVO NO SUPABASE ===');
  console.log('URL:', supabaseUrl);

  // 1. Testar se a tabela recipes é acessível e se a Receita 004 existe
  console.log('\n--- 1. Verificando tabela recipes e Receita 004 ---');
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (*),
      recipe_utensils (*),
      recipe_steps (*),
      recipe_tips (*)
    `);

  if (recipesError) {
    console.error('ERRO ao consultar recipes:', recipesError.code, recipesError.message, recipesError.details);
  } else {
    console.log('Sucesso ao consultar recipes! Quantidade retornada:', recipes?.length);
    const r004 = recipes?.find((r) => r.numero === 4);
    if (r004) {
      console.log('RECEITA 004 ENCONTRADA!');
      console.log('Título:', r004.titulo);
      console.log('Categoria:', r004.categoria);
      console.log('is_preview:', r004.is_preview);
      console.log('Ingredientes:', r004.recipe_ingredients?.length);
      console.log('Utensílios:', r004.recipe_utensils?.length);
      console.log('Passos:', r004.recipe_steps?.length);
      console.log('Dicas:', r004.recipe_tips?.length);
    } else {
      console.log('AVISO: Receita 004 NÃO encontrada entre as receitas retornadas.');
    }
  }

  // 2. Testar acesso de leitura a tabelas auxiliares
  console.log('\n--- 2. Verificando tabelas públicas/tags ---');
  const { data: tags, error: tagsError } = await supabase.from('tags').select('*');
  if (tagsError) {
    console.error('Tags error:', tagsError.code, tagsError.message);
  } else {
    console.log('Tags acessíveis! Linhas:', tags?.length);
  }

  // 3. Testar RLS em favorites (deve bloquear leitura sem usuário autenticado)
  console.log('\n--- 3. Verificando RLS em favorites (sem auth) ---');
  const { data: favs, error: favsError } = await supabase.from('favorites').select('*');
  if (favsError) {
    console.log('Favorites sem auth:', favsError.code, favsError.message);
  } else {
    console.log('Favorites retornou sem auth (deve ser 0 linhas devido ao RLS):', favs?.length);
  }

  // 4. Testar RLS em profiles (sem auth)
  console.log('\n--- 4. Verificando RLS em profiles (sem auth) ---');
  const { data: profs, error: profsError } = await supabase.from('profiles').select('*');
  if (profsError) {
    console.log('Profiles sem auth:', profsError.code, profsError.message);
  } else {
    console.log('Profiles retornou sem auth (deve ser 0 linhas):', profs?.length);
  }
}

verifyLive();
