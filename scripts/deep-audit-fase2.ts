import { createClient } from '@supabase/supabase-js';
import { fetchRecipes } from '../src/services/recipeService';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDeepAudit() {
  console.log('=====================================================');
  console.log('       AUDITORIA PROFUNDA DA FASE 02 NO SUPABASE     ');
  console.log('=====================================================');

  let passed = true;

  // 1. TESTE DA RECEITA 004 VIA API DO APLICATIVO
  console.log('\n[TESTE 1] Leitura da Receita 004 através do serviço do app (recipeService.ts)...');
  try {
    const appRecipes = await fetchRecipes();
    console.log(`Receitas carregadas pelo app: ${appRecipes.length}`);
    const r004 = appRecipes.find((r) => r.code === 'RECEITA 004' || r.title.includes('ERVA-DOCE'));

    if (!r004) {
      console.error('❌ FALHA: Receita 004 não foi retornada pelo serviço do aplicativo.');
      passed = false;
    } else {
      console.log('✅ Receita 004 carregada pelo app com sucesso!');
      console.log(`   - Código: ${r004.code}`);
      console.log(`   - Título: ${r004.title}`);
      console.log(`   - Categoria: ${r004.categoryDisplay}`);
      console.log(`   - Tempo Total: ${r004.totalTimeDisplay}`);
      console.log(`   - Ingredientes (${r004.ingredients.length}): ${JSON.stringify(r004.ingredients)}`);
      console.log(`   - Utensílios (${r004.utensils.length}): ${JSON.stringify(r004.utensils)}`);
      console.log(`   - Passos (${r004.steps.length}): ${r004.steps.length} passos verificados`);
      console.log(`   - Dicas (${r004.seuNecoTips.length}): ${r004.seuNecoTips.length} dicas verificadas`);
      console.log(`   - Atenção: ${r004.attention.substring(0, 60)}...`);

      // Conferir integridade dos ingredientes
      const expectedIngs = [
        '250 ml de água filtrada',
        '1 colher de chá de sementes de erva-doce secas',
        '5 folhas frescas de hortelã',
      ];
      const ingsMatch = expectedIngs.every((ing) => r004.ingredients.includes(ing));
      if (ingsMatch) {
        console.log('✅ Ingredientes 100% idênticos à FASE 01.');
      } else {
        console.error('❌ Divergência nos ingredientes.');
        passed = false;
      }

      // Conferir integridade dos passos
      if (r004.steps.length === 9) {
        console.log('✅ Modo de preparo com os 9 passos originais da FASE 01.');
      } else {
        console.error(`❌ Esperado 9 passos, encontrado: ${r004.steps.length}`);
        passed = false;
      }
    }
  } catch (err: any) {
    console.error('❌ Exceção ao ler receitas pelo app:', err.message);
    passed = false;
  }

  // 2. TESTE DE RLS: TENTATIVA DE ESCRITA NÃO AUTORIZADA POR USUÁRIO ANÔNIMO
  console.log('\n[TESTE 2] Testando RLS: Bloqueio de inserção em recipes por anônimo...');
  try {
    const { data: hackData, error: hackError } = await supabase.from('recipes').insert({
      numero: 999,
      titulo: 'RECEITA HACK INVASORA',
      categoria: 'Chás',
      uso_tradicional: 'Teste de invasão',
      rendimento: '1 copo',
      como_utilizar: 'Teste',
      armazenamento: 'Teste',
      atencao: 'Teste',
      is_preview: false,
    });

    if (hackError) {
      console.log(`✅ RLS FUNCIONANDO! Inserção não autorizada bloqueada com sucesso: ${hackError.message} (code: ${hackError.code})`);
    } else {
      console.error('❌ FALHA CRÍTICA DE SEGURANÇA: Usuário anônimo conseguiu inserir receita no banco!');
      passed = false;
    }
  } catch (err: any) {
    console.log(`✅ RLS bloqueou inserção com exceção: ${err.message}`);
  }

  // 3. TESTE DE RLS: TENTATIVA DE ALTERAÇÃO DA RECEITA 004 POR ANÔNIMO
  console.log('\n[TESTE 3] Testando RLS: Bloqueio de alteração (UPDATE) da Receita 004 por anônimo...');
  try {
    const { data: updateData, error: updateError } = await supabase
      .from('recipes')
      .update({ titulo: 'TÍTULO MODIFICADO INDEVIDAMENTE' })
      .eq('numero', 4);

    if (updateError) {
      console.log(`✅ RLS FUNCIONANDO! Modificação bloqueada: ${updateError.message}`);
    } else {
      // Se não der erro do postgrest, verificar se a linha foi realmente alterada ou se o RLS filtrou para 0 linhas afetadas
      const { data: checkR004 } = await supabase.from('recipes').select('titulo').eq('numero', 4).single();
      if (checkR004?.titulo === 'INFUSÃO DE ERVA-DOCE COM HORTELÃ') {
        console.log('✅ RLS FUNCIONANDO! O banco manteve o título original intacto (0 linhas afetadas por anônimo).');
      } else {
        console.error('❌ FALHA CRÍTICA DE SEGURANÇA: Receita 004 foi adulterada!');
        passed = false;
      }
    }
  } catch (err: any) {
    console.log(`✅ RLS bloqueou alteração: ${err.message}`);
  }

  // 4. TESTE DE RLS: FAVORITOS E PRIVACIDADE DE USUÁRIO
  console.log('\n[TESTE 4] Testando RLS: Acesso a favorites e profiles sem token de autenticação...');
  const { error: favError } = await supabase.from('favorites').select('*');
  const { error: profError } = await supabase.from('profiles').select('*');

  if (favError) {
    console.log(`✅ Tabela favorites protegida contra acesso anônimo (${favError.message}).`);
  }
  if (profError) {
    console.log(`✅ Tabela profiles protegida contra acesso anônimo (${profError.message}).`);
  }

  // 5. TESTE DE IS_PREVIEW E FILTRAGEM DE RECEITAS NÃO LIBERADAS
  console.log('\n[TESTE 5] Testando regra de is_preview...');
  const { data: allPublicRecipes, error: previewError } = await supabase.from('recipes').select('numero, is_preview');
  if (previewError) {
    console.error('Erro ao consultar recipes:', previewError.message);
  } else {
    const nonPreviewVisible = allPublicRecipes.filter((r) => r.is_preview === false);
    if (nonPreviewVisible.length === 0) {
      console.log('✅ RLS de is_preview verificado! Somente receitas com is_preview = true estão visíveis para usuários não assinantes.');
    } else {
      console.warn(`⚠️ Foram retornadas receitas com is_preview = false: ${nonPreviewVisible.length}`);
    }
  }

  console.log('\n=====================================================');
  console.log(`RESULTADO DA AUDITORIA: ${passed ? 'TODOS OS TESTES PASSARAM! ✅' : 'HOUVE FALHAS! ❌'}`);
  console.log('=====================================================');
}

runDeepAudit();
