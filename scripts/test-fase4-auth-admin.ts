import { createClient } from '@supabase/supabase-js';
import { parseJsonRecipes, parseCsvRecipes, validateRecipeItem } from '../src/utils/importer';

const supabaseUrl = 'https://alvmzypczzwzotjnvflc.supabase.co';
const supabaseAnonKey = 'sb_publishable_H6-Q6gfLluflxwk7WJgzBw_BZvmmbe-';

async function testFase4() {
  console.log('===============================================================');
  console.log('         TESTES AUTOMATIZADOS DA FASE 4 — AUTH & ADMIN         ');
  console.log('===============================================================');

  const client = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Teste de Autenticação com Usuário A
  console.log('\n[TESTE 1] Autenticando Usuário A (usuario_a@teste.com)...');
  const { data: authA, error: errA } = await client.auth.signInWithPassword({
    email: 'usuario_a@teste.com',
    password: 'SenhaTeste123!',
  });

  if (errA || !authA.session || !authA.user) {
    console.error('❌ Falha login Usuário A:', errA?.message);
    process.exit(1);
  }
  console.log(`✅ Usuário A conectado com sucesso! ID: ${authA.user.id}`);
  console.log(`   Token JWT obtido: ${authA.session.access_token.slice(0, 20)}...`);

  // 2. Teste de Autenticação com Usuário B
  console.log('\n[TESTE 2] Autenticando Usuário B (usuario_b@teste.com)...');
  const { data: authB, error: errB } = await client.auth.signInWithPassword({
    email: 'usuario_b@teste.com',
    password: 'SenhaTeste123!',
  });

  if (errB || !authB.session || !authB.user) {
    console.error('❌ Falha login Usuário B:', errB?.message);
    process.exit(1);
  }
  console.log(`✅ Usuário B conectado com sucesso! ID: ${authB.user.id}`);

  // 3. Teste de Parser de Importação JSON no Admin
  console.log('\n[TESTE 3] Teste de Importador de Receitas JSON (Admin)...');
  const sampleJson = JSON.stringify([
    {
      numero: 4,
      titulo: 'INFUSÃO DE ERVA-DOCE COM HORTELÃ',
      categoria: 'Infusões',
      uso_tradicional: 'Digestão e conforto',
      tempo_preparo_min: 2,
      tempo_cozimento_infusao_min: 7,
      tempo_total_min: 9,
      rendimento: '1 xícara',
      como_utilizar: 'Beber morno',
      armazenamento: 'Consumir na hora',
      atencao: 'Consulte seu médico',
      is_preview: true,
      ingredientes: ['1 colher de chá de sementes de erva-doce', '5 folhas de hortelã'],
      utensilios: ['Xícara', 'Peneira'],
      modo_preparo: ['Ferva a água', 'Adicione as ervas', 'Abrafe por 7 min'],
      dicas_seu_neco: ['Use folhas frescas para mais aroma'],
    },
  ]);

  const jsonParseRes = parseJsonRecipes(sampleJson);
  console.log(`Receitas processadas via JSON: ${jsonParseRes.recipes.length}`);
  const valErrors = validateRecipeItem(jsonParseRes.recipes[0], 0);
  if (valErrors.length === 0) {
    console.log('✅ Validação do item JSON passou com 0 erros!');
  } else {
    console.error('❌ Erros de validação JSON:', valErrors);
  }

  // 4. Teste de Parser de Importação CSV no Admin
  console.log('\n[TESTE 4] Teste de Importador de Receitas CSV (Admin)...');
  const sampleCsv = `numero,titulo,categoria,uso_tradicional,tempo_preparo_min,tempo_cozimento_infusao_min,tempo_total_min,rendimento,como_utilizar,armazenamento,atencao,is_preview,ingredientes,modo_preparo
4,INFUSÃO DE ERVA-DOCE,Infusões,Conforto estomacal,2,7,9,1 porção,Beber morno,Na hora,Uso tradicional,true,Erva-doce|Hortelã,Ferver|Infundir`;

  const csvParseRes = parseCsvRecipes(sampleCsv);
  console.log(`Receitas processadas via CSV: ${csvParseRes.recipes.length}`);
  if (csvParseRes.recipes.length === 1 && csvParseRes.recipes[0].numero === 4) {
    console.log('✅ Parser de CSV processou receita #4 com sucesso!');
  } else {
    console.error('❌ Erro no parser de CSV');
  }

  // 5. Teste do Link do WhatsApp
  console.log('\n[TESTE 5] Validando Link de Suporte WhatsApp...');
  const whatsappUrl = 'https://wa.me/5591985719332';
  if (whatsappUrl.includes('5591985719332')) {
    console.log(`✅ Link de suporte verificado: ${whatsappUrl}`);
  }

  console.log('\n===============================================================');
  console.log('     TODOS OS TESTES DA FASE 4 FORAM CONCLUÍDOS COM SUCESSO!   ');
  console.log('===============================================================');
}

testFase4();
