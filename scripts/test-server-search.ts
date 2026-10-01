import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testServerSearch() {
  console.log('--- Testando Busca Server-Side com Paginação e Filtros ---');

  // Teste 1: Contagem e paginação básica (limit 10)
  let queryBuilder = supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (ordem, texto),
      recipe_utensils (ordem, texto),
      recipe_steps (ordem, texto),
      recipe_tips (ordem, texto)
    `, { count: 'exact' });

  // Filtro de tempo
  queryBuilder = queryBuilder.lte('tempo_total_min', 30);

  // Paginação: página 1, 10 itens
  const { data, count, error } = await queryBuilder.range(0, 9);

  if (error) {
    console.error('Erro na query server-side:', error);
  } else {
    console.log(`✅ Query executada com sucesso! Total no banco: ${count}, Retornados nesta página: ${data?.length}`);
    if (data && data.length > 0) {
      console.log(`   Primeira receita: #${data[0].numero} - ${data[0].titulo}`);
    }
  }

  // Teste 2: Busca por texto (ilike)
  const textQuery = 'erva-doce';
  const { data: textData, count: textCount, error: textErr } = await supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .or(`titulo.ilike.%${textQuery}%,uso_tradicional.ilike.%${textQuery}%`);

  if (textErr) {
    console.error('Erro na busca por texto:', textErr);
  } else {
    console.log(`✅ Busca por "${textQuery}": Total encontrado: ${textCount}`);
  }
}

testServerSearch();
