import { normalizeSearchText, cleanForFuzzy } from '../src/views/SearchView';
import { MOCK_RECIPES } from '../src/data/mockRecipes';

console.log('=== TESTES AUTOMATIZADOS DA FASE 03 (PRECISÃO E TOLERÂNCIA) ===');

function searchMock(query: string) {
  const normQuery = normalizeSearchText(query);
  const fuzzyQuery = cleanForFuzzy(query);

  return MOCK_RECIPES.filter((recipe) => {
    const normTitle = normalizeSearchText(recipe.title);
    const normCode = normalizeSearchText(recipe.code);
    const normCategory = normalizeSearchText(recipe.categoryDisplay);
    const normUse = normalizeSearchText(recipe.traditionalUse);
    const normIngredients = recipe.ingredients.some((ing) =>
      normalizeSearchText(ing).includes(normQuery)
    );
    const normTips = recipe.seuNecoTips.some((tip) =>
      normalizeSearchText(tip).includes(normQuery)
    );
    const normSubstitutions = normalizeSearchText(recipe.substitutions || '');

    const fuzzyMatch =
      cleanForFuzzy(recipe.title).includes(fuzzyQuery) ||
      cleanForFuzzy(recipe.categoryDisplay).includes(fuzzyQuery) ||
      cleanForFuzzy(recipe.traditionalUse).includes(fuzzyQuery) ||
      recipe.ingredients.some((ing) => cleanForFuzzy(ing).includes(fuzzyQuery));

    return (
      normTitle.includes(normQuery) ||
      normCode.includes(normQuery) ||
      normCategory.includes(normQuery) ||
      normUse.includes(normQuery) ||
      normIngredients ||
      normTips ||
      normSubstitutions.includes(normQuery) ||
      fuzzyMatch
    );
  });
}

const tests = [
  { q: 'gengibre', expectedContains: ['RECEITA 006'] },
  { q: 'digestao', expectedContains: ['RECEITA 002'] },
  { q: 'digestão', expectedContains: ['RECEITA 002'] },
  { q: 'hortela', expectedContains: ['RECEITA 004'] },
  { q: 'hortelã', expectedContains: ['RECEITA 004'] },
  { q: 'ervadoce', expectedContains: ['RECEITA 004'] },
  { q: 'erva-doce', expectedContains: ['RECEITA 004'] },
  { q: 'cha de', expectedContains: ['RECEITA 004'] },
  { q: 'chá de', expectedContains: ['RECEITA 004'] },
];

let allPassed = true;

tests.forEach(({ q, expectedContains }) => {
  const results = searchMock(q);
  const codes = results.map((r) => r.code);

  const passed = expectedContains.every((c) => codes.includes(c));

  if (passed) {
    console.log(`✅ Busca "${q}": Encontrou ${results.length} receita(s) -> [${codes.slice(0, 3).join(', ')}]`);
  } else {
    console.error(`❌ Busca "${q}" falhou. Códigos encontrados:`, codes);
    allPassed = false;
  }
});

// Teste de busca sem resultado
const noMatch = searchMock('palavrainexistente999');
console.log(`\nBusca sem resultado ("palavrainexistente999"): ${noMatch.length === 0 ? '0 receitas (Correto ✅)' : 'Falhou'}`);

if (allPassed && noMatch.length === 0) {
  console.log('\n=== TODOS OS TESTES DE BUSCA E NAVEGAÇÃO PASSARAM COM 100% DE PRECISÃO! ✅ ===');
} else {
  console.error('\nHOUVE FALHAS NOS TESTES!');
  process.exit(1);
}
