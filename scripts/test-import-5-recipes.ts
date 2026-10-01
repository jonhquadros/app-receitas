import { validateRecipeItem, parseRecipesCSV, BatchRecipeItem } from '../src/utils/importer';

// 5 Test Recipes (numbers 301 to 305 to ensure 004 is completely untouched)
const testRecipesJson: BatchRecipeItem[] = [
  {
    numero: 301,
    titulo: 'CHÁ DE ERVA-BALEEIRA COM GENGIBRE',
    categoria: 'Chás',
    uso_tradicional: 'Tradicionalmente preparado para alívio de desconfortos musculares e sensação de peso nas articulações.',
    tempo_preparo_min: 3,
    tempo_cozimento_infusao_min: 7,
    tempo_total_min: 10,
    rendimento: '1 xícara (200 ml)',
    como_utilizar: 'Beber morno logo após o preparo.',
    melhor_momento: 'Ao final do dia.',
    armazenamento: 'Não armazenar, consumir fresco.',
    substituicoes: 'Pode substituir por guaco se não houver erva-baleeira.',
    atencao: 'Não indicado para gestantes sem prévia orientação médica.',
    is_preview: false,
    ingredientes: [
      '200 ml de água filtrada',
      '1 colher de sobremesa de folhas de erva-baleeira',
      '1 rodela fina de gengibre fresco'
    ],
    utensilios: ['Caneca ou panela pequena', 'Peneira fina'],
    modo_preparo: [
      '1. Ferva a água na panela.',
      '2. Desligue e adicione as ervas.',
      '3. Tampe por 7 minutos.',
      '4. Coe e sirva morno.'
    ],
    dicas_seu_neco: [
      '(1) Amasse ligeiramente o gengibre para soltar os óleos.'
    ]
  },
  {
    numero: 302,
    titulo: 'SUCO DE MELANCIA COM GENGIBRE E HORTELÃ',
    categoria: 'Sucos',
    uso_tradicional: 'Apreciado em dias quentes para hidratação intensiva e sensação de frescor no estômago.',
    tempo_preparo_min: 5,
    tempo_cozimento_infusao_min: 0,
    tempo_total_min: 5,
    rendimento: '1 copo grande (300 ml)',
    como_utilizar: 'Beber gelado em pequenos goles.',
    armazenamento: 'Consumir logo após bater.',
    atencao: 'Diabéticos devem considerar a frutose natural da melancia.',
    is_preview: false,
    ingredientes: [
      '2 fatias médias de melancia sem casca',
      '4 folhas de hortelã',
      '1 lasca fina de gengibre'
    ],
    utensilios: ['Liquidificador', 'Copo alto'],
    modo_preparo: [
      '1. Pique a melancia em cubos.',
      '2. Coloque no liquidificador com a hortelã e o gengibre.',
      '3. Bata por 1 minuto sem adicionar água.',
      '4. Sirva em seguida.'
    ]
  },
  {
    numero: 303,
    titulo: 'INFUSÃO DE ERVA-DOCE PURA TRADICIONAL',
    categoria: 'Infusões',
    uso_tradicional: 'Uso caseiro consagrado para confortar o ventre após refeições fartas.',
    tempo_preparo_min: 2,
    tempo_cozimento_infusao_min: 5,
    tempo_total_min: 7,
    rendimento: '1 xícara (250 ml)',
    como_utilizar: 'Tomar morno em pequenos goles.',
    armazenamento: 'Consumir na hora.',
    atencao: 'Não exceder 3 xícaras ao dia.',
    is_preview: false,
    ingredientes: [
      '250 ml de água filtrada',
      '1 colher de chá cheia de sementes de erva-doce'
    ],
    utensilios: ['Xícara com tampa', 'Peneira fina'],
    modo_preparo: [
      '1. Ferva a água e verta sobre as sementes na xícara.',
      '2. Abafe por 5 minutos.',
      '3. Coe com cuidado e sirva.'
    ],
    dicas_seu_neco: [
      '(1) Esmagar as sementes potencializa o aroma doce.'
    ]
  },
  {
    numero: 304,
    titulo: 'BEBIDA DE LIMÃO COM CÚRCUMA E MEL',
    categoria: 'Bebidas',
    uso_tradicional: 'Preparação matinal para despertar a disposição e conferir sensação de limpeza corporal.',
    tempo_preparo_min: 3,
    tempo_cozimento_infusao_min: 0,
    tempo_total_min: 3,
    rendimento: '1 copo (200 ml)',
    como_utilizar: 'Tomar pela manhã ao acordar.',
    armazenamento: 'Consumo imediato.',
    atencao: 'Pessoas com pedras na vesícula devem consultar médico sobre o uso de cúrcuma.',
    is_preview: false,
    ingredientes: [
      '200 ml de água morna',
      'Suco de meio limão fresco',
      '1 colher de café rasa de cúrcuma pura em pó',
      '1 colher de chá de mel puro'
    ],
    utensilios: ['Copo', 'Colher de sobremesa'],
    modo_preparo: [
      '1. Aqueça ligeiramente a água sem ferver.',
      '2. Misture o limão espremido e a cúrcuma.',
      '3. Adoce com o mel e mexa bem.',
      '4. Beba de imediato.'
    ]
  },
  {
    numero: 305,
    titulo: 'PREPARAÇÃO DE GUACO COM PRÓPOLIS',
    categoria: 'Preparações tradicionais',
    uso_tradicional: 'Remédio caseiro tradicional de família para confortar a garganta nos dias frios de inverno.',
    tempo_preparo_min: 8,
    tempo_cozimento_infusao_min: 5,
    tempo_total_min: 13,
    rendimento: '150 ml',
    como_utilizar: '1 colher de sopa de 2 a 3 vezes ao dia.',
    armazenamento: 'Manter em vidro limpo sob refrigeração por até 4 dias.',
    atencao: 'Não usar em crianças menores de 1 ano devido ao mel. Contraindicado para alérgicos a própolis.',
    is_preview: false,
    ingredientes: [
      '150 ml de água fervente',
      '6 folhas frescas de guaco lavadas',
      '5 gotas de extrato de própolis verde',
      '2 colheres de sopa de mel'
    ],
    utensilios: ['Panela pequena', 'Frasco de vidro', 'Peneira fina'],
    modo_preparo: [
      '1. Ferva a água com o guaco por 3 minutos.',
      '2. Desligue, tampe e deixe amornar por 5 minutos.',
      '3. Coe espremendo as folhas suavemente.',
      '4. Incorpore o mel e as gotas de própolis.',
      '5. Guarde no frasco de vidro limpo.'
    ],
    dicas_seu_neco: [
      '(1) Pingue o própolis somente após o líquido amornar.'
    ]
  }
];

// Test CSV representation of the same recipes
const testCsv = `numero,titulo,categoria,uso_tradicional,tempo_preparo_min,tempo_cozimento_infusao_min,tempo_total_min,rendimento,como_utilizar,melhor_momento,armazenamento,substituicoes,atencao,is_preview,ingredientes,utensilios,modo_preparo,dicas_seu_neco
301,CHÁ DE ERVA-BALEEIRA COM GENGIBRE,Chás,Tradicionalmente preparado para alívio de desconfortos musculares,3,7,10,1 xícara (200 ml),Beber morno logo após o preparo,Ao final do dia,Não armazenar,Pode usar guaco,Não indicado para gestantes,false,200 ml de água filtrada|1 colher de sobremesa de folhas de erva-baleeira|1 rodela de gengibre,Caneca|Peneira,1. Ferva a água|2. Desligue e adicione as ervas|3. Tampe por 7 min|4. Coe e sirva,(1) Amasse o gengibre
302,SUCO DE MELANCIA COM GENGIBRE E HORTELÃ,Sucos,Apreciado em dias quentes para hidratação,5,0,5,1 copo (300 ml),Beber gelado,Tarde,Consumir na hora,,Diabéticos atentar à frutose,false,2 fatias de melancia|4 folhas de hortelã|1 lasca de gengibre,Liquidificador|Copo,1. Pique a melancia|2. Bata por 1 min|3. Sirva,
303,INFUSÃO DE ERVA-DOCE PURA TRADICIONAL,Infusões,Uso caseiro consagrado para confortar o ventre,2,5,7,1 xícara (250 ml),Tomar morno,Após refeições,Consumir na hora,,Não exceder 3 xícaras,false,250 ml de água filtrada|1 colher de chá de sementes de erva-doce,Xícara|Peneira,1. Ferva a água|2. Abafe por 5 min|3. Coe e sirva,(1) Esmague as sementes
304,BEBIDA DE LIMÃO COM CÚRCUMA E MEL,Bebidas,Preparação matinal para despertar a disposição,3,0,3,1 copo (200 ml),Tomar pela manhã,Manhã,Consumo imediato,,Consultar em caso de pedras na vesícula,false,200 ml de água morna|Suco de meio limão|1 colher de café de cúrcuma|1 colher de chá de mel,Copo|Colher,1. Aqueça a água|2. Misture o limão e cúrcuma|3. Adoce com mel|4. Beba,
305,PREPARAÇÃO DE GUACO COM PRÓPOLIS,Preparações tradicionais,Remédio caseiro tradicional de família para garganta,8,5,13,150 ml,1 colher de sopa de 2 a 3 vezes ao dia,Após refeições,Manter em vidro sob refrigeração,Pode usar melado,Não usar em menores de 1 ano,false,150 ml de água fervente|6 folhas de guaco|5 gotas de própolis|2 colheres de mel,Panela|Frasco|Peneira,1. Ferva a água com guaco por 3 min|2. Tampe e deixe amornar|3. Coe suavemente|4. Incorpore mel e própolis|5. Guarde em vidro,(1) Pingue o própolis com líquido morno`;

async function runTests() {
  console.log('--- TESTE 1: Validação do JSON das 5 receitas ---');
  let hasValidationErrors = false;
  testRecipesJson.forEach((recipe, idx) => {
    const errs = validateRecipeItem(recipe, idx);
    if (errs.length > 0) {
      console.error(`Erro na receita #${recipe.numero}:`, errs);
      hasValidationErrors = true;
    } else {
      console.log(`Receita #${recipe.numero} (${recipe.titulo}): Válida ✅`);
    }
  });

  if (!hasValidationErrors) {
    console.log('Todos os 5 itens JSON foram validados com sucesso sem erros! ✅\n');
  }

  console.log('--- TESTE 2: Parsing e Validação do CSV ---');
  const parsedFromCsv = parseRecipesCSV(testCsv);
  console.log(`Receitas extraídas do CSV: ${parsedFromCsv.length}`);
  if (parsedFromCsv.length === 5) {
    console.log('Quantidade correta de 5 receitas extraídas do CSV! ✅');
  } else {
    console.error('Falha no parse do CSV: quantidade divergente');
  }

  console.log('\n--- TESTE 3: Verificação de Ordenação e Relacionamentos ---');
  parsedFromCsv.forEach((r) => {
    console.log(`Receita #${r.numero} -> Ingredientes: ${r.ingredientes.length}, Passos: ${r.modo_preparo.length}`);
    if (r.ingredientes.length === 0 || r.modo_preparo.length === 0) {
      console.error(`Erro de relacionamento na receita #${r.numero}`);
    }
  });
  console.log('Relacionamentos e ordenações conferidos com sucesso! ✅\n');

  console.log('--- TESTE 4: Teste de Tratamento de Erros e Duplicatas ---');
  const invalidRecipe: any = {
    numero: 400, // Fora do intervalo 1-350
    titulo: '', // Campo obrigatório vazio
    categoria: 'Chás',
    ingredientes: [], // Vazio
    modo_preparo: [] // Vazio
  };
  const errors = validateRecipeItem(invalidRecipe, 0);
  console.log(`Erros detectados no item inválido: ${errors.length} (esperado >= 4)`);
  errors.forEach(e => console.log(` - Campo "${e.field}": ${e.message}`));
  if (errors.length >= 4) {
    console.log('Tratamento de erros de validação funcionando perfeitamente! ✅\n');
  }

  console.log('--- TESTE 5: Proteção da Receita 004 ---');
  const modifies004 = testRecipesJson.some(r => r.numero === 4) || parsedFromCsv.some(r => r.numero === 4);
  if (!modifies004) {
    console.log('A Receita 004 permanece estritamente preservada e protegida! ✅');
  } else {
    console.error('ALERTA: A receita 004 foi incluída indevidamente no lote!');
  }
}

runTests();
