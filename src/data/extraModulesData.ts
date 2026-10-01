import {
  IngredientGuideItem,
  MeasureItem,
  TechniqueItem,
  ShoppingListGroup,
  CalendarDayItem,
} from '../types/modules';

// ============================================================================
// 1. GUIA DE INGREDIENTES A–Z
// ============================================================================
export const INGREDIENT_GUIDE_DATA: IngredientGuideItem[] = [
  {
    id: 'alecrim',
    nome_popular: 'Alecrim',
    nome_cientifico: 'Rosmarinus officinalis',
    categoria: 'folhas',
    como_escolher:
      'Prefira ramos viçosos, de cor verde-escuro viva e sem manchas escuras ou folhas ressecadas. O aroma deve ser intenso ao esfregar levemente os dedos.',
    como_lavar:
      'Lave os ramos em água corrente abundante e faça imersão em água clorada (1 colher de sopa de hipoclorito para 1 litro de água) por 10 minutos. Enxágue bem.',
    como_preparar:
      'Utilize as folhas frescas ou secas em infusão. Adicione a água fervente sobre os ramos e abafe imediatamente por 8 a 10 minutos.',
    como_armazenar:
      'Fresco: enrolado em papel-toalha levemente umedecido dentro de pote fechado na geladeira por até 7 dias. Seco: pote de vidro hermético em local escuro e seco.',
    como_utilizar:
      'Tomar 1 xícara pela manhã ou início da tarde para revigorar o ânimo e a clareza mental. Evitar antes de dormir.',
    cuidados:
      'Não ferver as folhas junto com a água para não volatilizar o óleo essencial rico em cânfora e cineol.',
    interacoes:
      'Pode interagir com anticoagulantes e medicamentos para controle da pressão arterial em doses elevadas.',
    quem_deve_ter_atencao:
      'Gestantes, lactantes, pessoas hipertensas não controladas e indivíduos com histórico de convulsões devem evitar uso frequente.',
  },
  {
    id: 'boldo',
    nome_popular: 'Boldo-do-chile / Boldo-brasileiro',
    nome_cientifico: 'Peumus boldus / Plectranthus barbatus',
    categoria: 'folhas',
    como_escolher:
      'Folhas firmes, aveludadas (se for o brasileiro) ou secas inteiras e aromáticas (se for o do Chile). Evitar folhas mofadas ou amareladas.',
    como_lavar:
      'Folhas frescas devem ser lavadas folha por folha sob água corrente e secas suavemente com pano limpo.',
    como_preparar:
      'Infusão ou maceração a frio. No boldo fresco, a maceração em água fria amassando suavemente a folha preserva os compostos amargos sem sabor adstringente excessivo.',
    como_armazenar:
      'Consumir a folha fresca em até 3 dias na geladeira. O chá preparado não deve ser guardado por mais de 4 horas.',
    como_utilizar:
      '1 xícara pequena cerca de 20 a 30 minutos após refeições fartas ou quando sentir peso digestivo.',
    cuidados:
      'O sabor é amargo por natureza; não adoce para não prejudicar o estímulo reflexo da secreção biliar.',
    interacoes:
      'Pode potencializar ação de medicamentos para o fígado e interferir na absorção de remédios de uso oral contínuo.',
    quem_deve_ter_atencao:
      'Contraindicado em casos de obstrução das vias biliares, hepatites agudas e durante a gestação.',
  },
  {
    id: 'camomila',
    nome_popular: 'Camomila',
    nome_cientifico: 'Matricaria chamomilla',
    categoria: 'ervas',
    como_escolher:
      'Flores desidratadas inteiras, com pétalas esbranquiçadas e miolo amarelo ouro preservado. Evite pacotes onde predomine apenas o farelo ou pó.',
    como_lavar:
      'As flores desidratadas não precisam de lavagem prévia; use água fervente filtrada na infusão.',
    como_preparar:
      'Infusão suave: 1 colher de sobremesa de flores para 200 ml de água quente. Abafar de 5 a 7 minutos.',
    como_armazenar:
      'Pote de vidro com tampa de rosca, em armário seco e arejado, longe do calor do fogão e da luz solar direta.',
    como_utilizar:
      'Consumir morno cerca de 40 minutos antes de se deitar ou em momentos de tensão e agitação durante o dia.',
    cuidados:
      'Não deixe abafado por mais de 10 minutos para não concentrar taninos que deixam a bebida amarga.',
    interacoes:
      'Pode potencializar o efeito de sedativos, ansiolíticos e medicamentos anticoagulantes em altas concentrações.',
    quem_deve_ter_atencao:
      'Pessoas com alergia comprovada a plantas da família Asteraceae (como margaridas e crisântemos).',
  },
  {
    id: 'canela',
    nome_popular: 'Canela em casca (pau)',
    nome_cientifico: 'Cinnamomum verum',
    categoria: 'especiarias',
    como_escolher:
      'Prefira cascas enroladas finas e quebradiças (canela verdadeira), com aroma doce e amadeirado. Evite cascas muito grossas e sem fragrância.',
    como_lavar:
      'Enxágue rapidamente o pau de canela em água corrente antes de colocar na panela.',
    como_preparar:
      'Decocção: por ser casca dura, ferva o pau de canela na água por 5 a 8 minutos com a panela semi-tampada.',
    como_armazenar:
      'Recipiente de vidro escuro fechado em local fresco. A canela em pau dura até 2 anos mantendo o aroma.',
    como_utilizar:
      'Tomar durante as manhãs ou dias frios para aquecer o corpo e estimular a circulação.',
    cuidados:
      'A canela-cássia possui maior teor de cumarina; prefira a canela-do-ceilão e evite uso diário ininterrupto.',
    interacoes:
      'Pode interagir com medicamentos hipoglicemiantes orais (para diabetes) potencializando a queda de glicose.',
    quem_deve_ter_atencao:
      'Gestantes em qualquer período da gestação e pessoas com úlceras estomacais ativas.',
  },
  {
    id: 'capim-santo',
    nome_popular: 'Capim-santo / Capim-cidreira / Capim-limão',
    nome_cientifico: 'Cymbopogon citratus',
    categoria: 'folhas',
    como_escolher:
      'Folhas longas verdes, limpas e sem pontas ressecadas. Ao quebrar um pedaço, deve liberar aroma fresco de limão.',
    como_lavar:
      'Lave bem as folhas sob água corrente para remover qualquer poeira e corte em pedaços de 3 a 5 cm.',
    como_preparar:
      'Infusão: coloque as folhas cortadas na xícara ou bule, despeje água fervendo e abafe por 10 minutos.',
    como_armazenar:
      'Pode ser picado e congelado em saquinhos ou mantido seco em vidros protegidos da umidade.',
    como_utilizar:
      'Ideal no final da tarde ou após o jantar para acalmar a mente e auxiliar na digestão leve.',
    cuidados:
      'Pode provocar leve sonolência e ligeira redução na pressão arterial.',
    interacoes:
      'Pode somar efeitos com remédios para pressão alta e medicamentos indutores do sono.',
    quem_deve_ter_atencao:
      'Pessoas com pressão excessivamente baixa (hipotensão) devem tomar com moderação.',
  },
  {
    id: 'carqueja',
    nome_popular: 'Carqueja',
    nome_cientifico: 'Baccharis trimera',
    categoria: 'ervas',
    como_escolher:
      'Hastes aladas secas com tonalidade verde-oliva uniforme, sem partes pretas e com o característico cheiro campestre.',
    como_lavar:
      'Se fresca, lavar em água corrente. Se seca comercialmente embalada, preparar diretamente em infusão rápida.',
    como_preparar:
      'Infusão de 5 minutos (1 colher de chá para 200 ml de água fervente). Evite ferver para não acentuar o amargor.',
    como_armazenar:
      'Pote de vidro hermético em ambiente seco.',
    como_utilizar:
      'Tomar 1 xícara antes das principais refeições para estimular o apetite e a digestão de gorduras.',
    cuidados:
      'Não consumir por períodos superiores a 2 semanas seguidas sem pausa de descanso.',
    interacoes:
      'Pode interferir na absorção de medicamentos para controle do diabetes e da hipertensão.',
    quem_deve_ter_atencao:
      'Terminantemente contraindicada durante a gravidez e amamentação.',
  },
  {
    id: 'cravo-da-india',
    nome_popular: 'Cravo-da-índia',
    nome_cientifico: 'Syzygium aromaticum',
    categoria: 'especiarias',
    como_escolher:
      'Botões florais inteiros com a cabecinha intacta e tom marrom-avermelhado escuro. Se soltar óleo ao pressionar a unha, é de ótima qualidade.',
    como_lavar:
      'Passar em água corrente rapidamente antes da decocção.',
    como_preparar:
      'Decocção branda por 5 minutos (3 a 5 cravos por xícara de água). Deixar abafado após desligar o fogo.',
    como_armazenar:
      'Pote de vidro vedado ao abrigo de calor.',
    como_utilizar:
      'Excelente combinado com maçã, canela ou gengibre para bebidas reconfortantes e hálito fresco.',
    cuidados:
      'O eugenol presente no cravo é potente; o excesso pode irritar a mucosa gástrica.',
    interacoes:
      'Pode interagir com anticoagulantes como varfarina e ácido acetilsalicílico.',
    quem_deve_ter_atencao:
      'Gestantes e crianças menores de 6 anos não devem consumir infusões concentradas de cravo.',
  },
  {
    id: 'erva-doce',
    nome_popular: 'Erva-doce / Anis-verde',
    nome_cientifico: 'Pimpinella anisum',
    categoria: 'ervas',
    como_escolher:
      'Sementes pequenas, ovais, de cor cinza-esverdeada a marrom claro, com aroma doce característico e fresco.',
    como_lavar:
      'Sementes secas limpas não necessitam lavagem prévia antes da infusão.',
    como_preparar:
      'Dê uma leve machucada nas sementes com as costas de uma colher para quebrar a casca e liberar os óleos. Despeje água fervendo e abafe por 7 a 10 minutos.',
    como_armazenar:
      'Pote de vidro hermeticamente fechado, longe da umidade e do calor.',
    como_utilizar:
      'Tomar 1 xícara morna cerca de 20 a 30 minutos após as refeições para aliviar gases e sensação de inchaço.',
    cuidados:
      'Não ferva as sementes na água; a fervura prolongada volatiliza o anetol, seu principal óleo essencial.',
    interacoes:
      'Pode interagir com terapias de reposição hormonal e medicamentos fotossensibilizantes.',
    quem_deve_ter_atencao:
      'Gestantes devem evitar o consumo concentrado. Pessoas com alergia a aipo ou cenoura podem ter sensibilidade cruzada.',
  },
  {
    id: 'gengibre',
    nome_popular: 'Gengibre',
    nome_cientifico: 'Zingiber officinale',
    categoria: 'raizes',
    como_escolher:
      'Rizoma firme, pesado, com casca lisa, fina e sem rugas ou mofo. A polpa deve ser suculenta e brilhante.',
    como_lavar:
      'Escove a casca com escovinha própria para vegetais sob água corrente fria.',
    como_preparar:
      'Corte em rodelas bem finas (2 a 3 rodelas por xícara) e faça decocção branda por 5 a 7 minutos com a panela tampada.',
    como_armazenar:
      'Rizoma inteiro em local fresco e arejado por até 2 semanas, ou em rodelas congeladas no freezer por até 3 meses.',
    como_utilizar:
      'Tomar pela manhã ou meia hora antes de viagens para combater enjoos, ou com limão para sensação de calor.',
    cuidados:
      'Em excesso pode causar sensação de queimação estomacal em pessoas suscetíveis.',
    interacoes:
      'Pode potencializar medicamentos anticoagulantes e antiplaquetários.',
    quem_deve_ter_atencao:
      'Pessoas com cálculos biliares, hipertensão arterial severa descontrolada ou em pré-operatório imediato.',
  },
  {
    id: 'hortela',
    nome_popular: 'Hortelã-comum / Hortelã-pimenta',
    nome_cientifico: 'Mentha spicata / Mentha piperita',
    categoria: 'folhas',
    como_escolher:
      'Folhas viçosas, de cor verde intensa, sem partes amareladas ou pontos pretos. Talo firme e aromático.',
    como_lavar:
      'Lave folha a folha em água corrente, sanitize em solução de hipoclorito e enxágue bem com água filtrada.',
    como_preparar:
      'Infusão rápida: 5 a 8 folhas frescas por xícara. Despeje água quente e abafe por 5 a 7 minutos.',
    como_armazenar:
      'Coloque os ramos com as hastes em um copo com 2 dedos de água dentro da geladeira ou embale em pote com papel-toalha.',
    como_utilizar:
      'Ideal após refeições pesadas para frescor bucal e suporte ao trânsito intestinal, ou fria em dias quentes.',
    cuidados:
      'Não abafe por mais de 10 minutos para não escurecer a infusão e amargar.',
    interacoes:
      'Pode reduzir a absorção de ferro de origem vegetal se consumida imediatamente junto com grandes refeições.',
    quem_deve_ter_atencao:
      'Pessoas com refluxo gastroesofágico grave e crianças menores de 2 anos (evitar inalação direta de mentol puro).',
  },
  {
    id: 'louro',
    nome_popular: 'Louro',
    nome_cientifico: 'Laurus nobilis',
    categoria: 'folhas',
    como_escolher:
      'Folhas secas inteiras de tom verde-oliva brilhante, sem furos ou manchas escuras.',
    como_lavar:
      'Enxágue suave sob água fria antes de levar à panela.',
    como_preparar:
      'Ferver 2 a 3 folhas secas por 3 minutos e abafar por mais 5 minutos com fogo desligado.',
    como_armazenar:
      'Em recipientes de vidro herméticos ao abrigo da luz.',
    como_utilizar:
      'Consumir 1 xícara morna após o almoço para conforto digestivo.',
    cuidados:
      'Retire as folhas inteiras antes de servir; não engula a folha inteira.',
    interacoes:
      'Pode interagir com analgésicos e sedativos.',
    quem_deve_ter_atencao:
      'Gestantes e lactantes devem consumir apenas como tempero culinário comedido, não em chás concentrados.',
  },
  {
    id: 'manjericao',
    nome_popular: 'Manjericão',
    nome_cientifico: 'Ocimum basilicum',
    categoria: 'folhas',
    como_escolher:
      'Folhas lisas, tenras, brilhantes e sem marcas escuras de queimadura de frio.',
    como_lavar:
      'Lavagem delicada em água corrente; não esmague as folhas na lavagem para não oxidar.',
    como_preparar:
      'Infusão delicada por 5 minutos em água quente recém-fervida.',
    como_armazenar:
      'Mantenha em temperatura ambiente com os cabinhos na água, como um buquê de flores. Não gosta de frio intenso.',
    como_utilizar:
      'Ao entardecer para relaxamento suave ou em momentos de sobrecarga mental.',
    cuidados:
      'Muito sensível ao calor; adicione sempre com o fogo já desligado.',
    interacoes:
      'Pode interagir levemente com medicamentos sedativos e redutores de pressão.',
    quem_deve_ter_atencao:
      'Gestantes em doses elevadas.',
  },
];

// ============================================================================
// 2. GUIA DE MEDIDAS CASEIRAS (FONTE GRANDE E CONVERSÃO SIMPLES)
// ============================================================================
export const MEASURES_GUIDE_DATA: MeasureItem[] = [
  {
    medida: '1 Colher de chá',
    equivalencia: '5 ml / cerca de 2 a 3 g de erva seca',
    mililitros: 5,
    dica_pratica: 'É aquela colher menorzinha do café ou sobremesa pequena. Ideal para sementes pequenas (erva-doce, anis, cravo) e pós.',
  },
  {
    medida: '1 Colher de sopa',
    equivalencia: '15 ml / cerca de 3 a 5 g de folhas picadas',
    mililitros: 15,
    dica_pratica: 'A colher grande de tomar sopa. Medida padrão do Seu Neco para folhas secas quebradinhas (camomila, capim-santo, alecrim).',
  },
  {
    medida: '1 Xícara de chá padrão',
    equivalencia: '200 ml de água filtrada',
    mililitros: 200,
    dica_pratica: 'Aquela xícara tradicional de louça com pires. Não é a caneca grande de café com leite.',
  },
  {
    medida: '1 Copo americano / de requeijão',
    equivalencia: '200 ml (americano) ou 250 ml (requeijão)',
    mililitros: 250,
    dica_pratica: 'O copo americano de vidro comum até a marquinha do anel tem 150 ml; até a borda cheia tem 190 a 200 ml.',
  },
  {
    medida: '100 ml de água',
    equivalencia: 'Meio copo americano ou meia xícara de chá',
    mililitros: 100,
    dica_pratica: 'Usado para preparações concentradas, macerações fortes ou doses digestivas rápidas.',
  },
  {
    medida: '200 ml de água',
    equivalencia: '1 xícara de chá cheia ou 1 copo americano cheio',
    mililitros: 200,
    dica_pratica: 'O volume mais comum para o preparo de 1 porção individual de chá de ervas.',
  },
  {
    medida: '250 ml de água',
    equivalencia: '1 caneca média de louça ou 1 copo de requeijão',
    mililitros: 250,
    dica_pratica: 'Volume da Receita 004 do Seu Neco (Infusão de Erva-doce com Hortelã).',
  },
  {
    medida: '500 ml de água',
    equivalencia: 'Meio litro = 2 xícaras e meia ou 1 garrafinha média',
    mililitros: 500,
    dica_pratica: 'Perfeito para preparar o bule para 2 a 3 pessoas da casa tomarem juntas na hora.',
  },
  {
    medida: '1 Litro de água',
    equivalencia: '1000 ml = 4 copos de 250 ml ou 5 xícaras de 200 ml',
    mililitros: 1000,
    dica_pratica: 'Volume para preparo familiar ou para consumo fracionado ao longo do dia em garrafa térmica.',
  },
];

// ============================================================================
// 3. TÉCNICAS TRADICIONAIS DO SEU NECO (6 TÉCNICAS FUNDAMENTAIS)
// ============================================================================
export const TECHNIQUES_DATA: TechniqueItem[] = [
  {
    id: 'infusao',
    nome: 'Infusão',
    subtitulo: 'Para partes delicadas: flores, folhas tenras e sementes aromáticas',
    descricao:
      'A infusão é a arte de extrair a essência das ervas sem queimar seus óleos vitais. A água é fervida separadamente; assim que surgem as primeiras bolhas, apaga-se o fogo e verte-se a água quente sobre a planta, abafando imediatamente.',
    quando_usar:
      'Folhas de hortelã, flores de camomila, sementes de erva-doce, folhas de capim-santo, alecrim e manjericão.',
    passo_a_passo: [
      '1. Ferva a quantidade de água indicada em recipiente limpo.',
      '2. Assim que levantar fervura, desligue o fogo imediatamente.',
      '3. Coloque as ervas no bule ou na xícara.',
      '4. Despeje a água quente por cima das ervas.',
      '5. Tampe bem com pires ou tampa própria para evitar que o vapor aromático escape.',
      '6. Aguarde de 5 a 10 minutos (tempo de repouso).',
      '7. Coe e beba em seguida.',
    ],
    dica_seu_neco:
      'O segredo do Seu Neco: nunca deixe a água fervendo com a folha verde dentro da panela, senão o chá escurece, fica amargo e perde o perfume.',
    cuidados:
      'Não ultrapasse 10 minutos de infusão para ervas tenras, pois taninos começam a se desprender deixando o chá adstringente.',
  },
  {
    id: 'decoccao',
    nome: 'Decocção',
    subtitulo: 'Para partes duras: raízes, cascas, caules e sementes duras',
    descricao:
      'Partes rígidas dos vegetais necessitam do calor contínuo da fervura branda para que a água consiga penetrar nas fibras e dissolver seus princípios ativos.',
    quando_usar:
      'Pedaços de gengibre, canela em pau, cascas de maçã ou laranja, raízes secas e partes lenhosas.',
    passo_a_passo: [
      '1. Coloque a água fria e as partes duras já cortadas ou picadas na panela.',
      '2. Leve ao fogo médio e aguarde começar a ferver.',
      '3. Assim que ferver, abaixe o fogo para o mínimo.',
      '4. Mantenha em fervura suave por 5 a 15 minutos (com a panela semi-tampada).',
      '5. Desligue o fogo e deixe abafado por mais 5 minutos.',
      '6. Coe enquanto ainda estiver quente.',
    ],
    dica_seu_neco:
      'Se você quiser misturar gengibre (duro) com hortelã (delicada), ferva primeiro o gengibre por 7 minutos, desligue o fogo, adicione a hortelã e abafe por 5 minutos.',
    cuidados:
      'Mantenha sempre fogo brando para que a água não evapore rápido demais antes de extrair as qualidades da casca.',
  },
  {
    id: 'maceracao',
    nome: 'Maceração',
    subtitulo: 'Extração a frio ou em temperatura ambiente para preservar princípios sensíveis ao calor',
    descricao:
      'A maceração consiste em deixar as partes vegetais em repouso imersas em água fria ou filtrada por algumas horas, sem aplicar calor, evitando a perda de substâncias termossensíveis.',
    quando_usar:
      'Boldo fresco, folhas de hortelã para água aromatizada, cascas de frutas cítricas e sementes ricas em mucilagens (como chia e linhaça).',
    passo_a_passo: [
      '1. Lave minuciosamente as folhas frescas.',
      '2. Amasse-as suavemente com as mãos limpas ou com socador de madeira.',
      '3. Coloque em jarra de vidro com água filtrada fresca.',
      '4. Cubra com filó ou tampa limpa e deixe descansar por 1 a 4 horas (ou na geladeira).',
      '5. Coe e consuma no mesmo dia.',
    ],
    dica_seu_neco:
      'A água de boldo macerada a frio não fica tão amarga quanto o chá fervido, e cai muito mais leve no estômago.',
    cuidados:
      'Como não há fervura para esterilizar, a água deve ser purificada e as folhas impecavelmente higienizadas.',
  },
  {
    id: 'coagem',
    nome: 'Coagem Tradicional',
    subtitulo: 'Separação limpa dos resíduos sólidos para uma bebida pura e agradável',
    descricao:
      'O processo de coar deve ser feito com delicadeza para separar as ervas sem esmagá-las excessivamente contra a trama, o que liberaria resíduos turvos na bebida.',
    quando_usar:
      'Ao término do tempo de descanso de qualquer infusão ou decocção.',
    passo_a_passo: [
      '1. Utilize peneira fina de aço inoxidável ou coador de pano de algodão virgem exclusivo para chás.',
      '2. Verta o líquido com calma sobre a xícara ou bule de servir.',
      '3. Deixe escorrer naturalmente sem espremer com força a colher sobre as folhas esgotadas.',
      '4. Descarte as ervas coadas em composteira ou vaso de plantas.',
    ],
    dica_seu_neco:
      'Não use o mesmo coador de pano do café para passar seus chás; o cheiro forte do pó de café contamina a pureza das ervas.',
    cuidados:
      'Lave a peneira imediatamente após o uso apenas com água quente e sabão neutro para evitar acúmulo de óleos.',
  },
  {
    id: 'armazenamento',
    nome: 'Armazenamento Seguro',
    subtitulo: 'Conservação das ervas secas e do líquido preparado',
    descricao:
      'O armazenamento correto protege as ervas da umidade, do mofo e da perda de voláteis, garantindo que o seu chá mantenha a cor, o cheiro e as virtudes até a última folha.',
    quando_usar:
      'No momento em que comprar ou colher suas ervas e ao decidir se guarda uma porção preparada.',
    passo_a_passo: [
      '1. Ervas secas: guarde sempre em potes de vidro escuro ou âmbar com fechamento hermético.',
      '2. Mantenha os potes longe da luz direta, da umidade da pia e do calor do fogão.',
      '3. Etiquete com o nome da erva e a data em que guardou.',
      '4. Chá pronto: o ideal é beber fresquinho na hora; se guardar na garrafa térmica, consuma em até 8 horas.',
    ],
    dica_seu_neco:
      'Chá requentado de um dia para o outro perde o aroma e vira água velha. Prepare só a quantia que for tomar.',
    cuidados:
      'Se notar cheiro de mofo, teias de insetos ou perda total de cor na erva guardada, descarte imediatamente.',
  },
  {
    id: 'higienizacao',
    nome: 'Higienização de Folhas Frescas',
    subtitulo: 'Limpeza correta para segurança sem agredir o vegetal',
    descricao:
      'Ervas colhidas na horta ou feira livre carregam poeira, pequenos insetos e impurezas. A higienização correta remove impurezas e sujeiras superficiais sem machucar as folhas tenras.',
    quando_usar:
      'Antes de usar qualquer folha, fruta ou ramo fresco trazido do quintal ou feira.',
    passo_a_passo: [
      '1. Selecione descartando folhas murchas, amareladas ou com picadas suspeitas.',
      '2. Lave ramo por ramo em água corrente fria.',
      '3. Prepare uma bacia com 1 litro de água filtrada e 1 colher de sopa de água sanitária própria para alimentos.',
      '4. Deixe as ervas imersas por 10 a 15 minutos.',
      '5. Enxágue abundantemente em água corrente para retirar todo resíduo de cloro.',
      '6. Seque com delicadeza sobre pano limpo ou centrífuga de folhas.',
    ],
    dica_seu_neco:
      'Nunca aperte as folhas com força ao secar; folha machucada escurece na mesma hora.',
    cuidados:
      'Certifique-se no rótulo da água sanitária se é apropriada para desinfecção de verduras e legumes (sem alvejantes e perfumes).',
  },
];

// ============================================================================
// 4. LISTAS DE COMPRAS PRÁTICAS (Básica, Econômica, 7 dias, 30 dias)
// ============================================================================
export const SHOPPING_LISTS_DATA: ShoppingListGroup[] = [
  {
    id: 'basica',
    titulo: 'Lista Básica do Lar',
    descricao: 'Os 6 itens essenciais para ter sempre à mão na despensa para conforto diário.',
    itens: [
      { id: 'b1', nome: 'Erva-doce em sementes', quantidade: '1 pacote de 50g', categoria: 'ervas', observacao: 'Para alívio após refeições pesadas' },
      { id: 'b2', nome: 'Hortelã fresca ou seca', quantidade: '1 maço ou 30g seco', categoria: 'folhas', observacao: 'Frescor e conforto digestivo' },
      { id: 'b3', nome: 'Camomila em flores', quantidade: '1 pacote de 50g', categoria: 'ervas', observacao: 'Para noites tranquilas' },
      { id: 'b4', nome: 'Gengibre fresco', quantidade: '1 rizoma médio (100g)', categoria: 'raizes', observacao: 'Aquecimento e digestão' },
      { id: 'b5', nome: 'Canela em pau', quantidade: '1 pacote de 30g', categoria: 'especiarias', observacao: 'Aroma e disposição' },
      { id: 'b6', nome: 'Limão tahiti ou siciliano', quantidade: '4 unidades', categoria: 'frutas', observacao: 'Gotas de acidez e frescor' },
    ],
  },
  {
    id: 'economica',
    titulo: 'Lista Econômica de Feira',
    descricao: 'Ingredientes acessíveis e de alto rendimento encontrados em qualquer feira de bairro.',
    itens: [
      { id: 'e1', nome: 'Capim-santo / Capim-limão', quantidade: '1 maço grande de feira', categoria: 'folhas', observacao: 'Rende muito e perfuma a casa' },
      { id: 'e2', nome: 'Erva-doce', quantidade: '100g a granel', categoria: 'ervas', observacao: 'Comprar a granel é mais barato que sachê' },
      { id: 'e3', nome: 'Boldo fresco', quantidade: '1 maço pequeno', categoria: 'folhas', observacao: 'Para emergências digestivas' },
      { id: 'e4', nome: 'Cascas de maçã e laranja', quantidade: 'Aproveitamento doméstico', categoria: 'frutas', observacao: 'Guarde e seque as cascas limpas' },
      { id: 'e5', nome: 'Louro em folhas', quantidade: '1 pacote pequeno', categoria: 'folhas', observacao: 'Serve para culinária e chá pós-almoço' },
      { id: 'e6', nome: 'Cravo-da-índia', quantidade: '30g', categoria: 'especiarias', observacao: 'Alguns cravinhos rendem semanas' },
    ],
  },
  {
    id: '7_dias',
    titulo: 'Planejamento 7 Dias (Semanal)',
    descricao: 'Variedade equilibrada para organizar a rotina matinal e noturna de uma semana.',
    itens: [
      { id: '7d1', nome: 'Sementes de erva-doce', quantidade: '50g', categoria: 'ervas' },
      { id: '7d2', nome: 'Folhas de hortelã fresca', quantidade: '2 maços frescos', categoria: 'folhas' },
      { id: '7d3', nome: 'Flores de camomila', quantidade: '50g', categoria: 'ervas' },
      { id: '7d4', nome: 'Ramos de alecrim fresco', quantidade: '1 maço', categoria: 'folhas' },
      { id: '7d5', nome: 'Gengibre fresco', quantidade: '1 raiz de 150g', categoria: 'raizes' },
      { id: '7d6', nome: 'Maçãs vermelhas', quantidade: '3 unidades', categoria: 'frutas' },
      { id: '7d7', nome: 'Limões', quantidade: '6 unidades', categoria: 'frutas' },
      { id: '7d8', nome: 'Canela em casca', quantidade: '4 pedaços de pau', categoria: 'especiarias' },
      { id: '7d9', nome: 'Mel puro (opcional)', quantidade: '1 pote pequeno', categoria: 'complementares' },
    ],
  },
  {
    id: '30_dias',
    titulo: 'Planejamento 30 Dias (Mensal)',
    descricao: 'Despensa completa para acompanhar os 30 dias do calendário do Seu Neco.',
    itens: [
      // Frutas
      { id: '30f1', nome: 'Maçãs frescas', quantidade: '1 kg', categoria: 'frutas' },
      { id: '30f2', nome: 'Limão fresco', quantidade: '1 dúzia', categoria: 'frutas' },
      { id: '30f3', nome: 'Laranjas (para cascas e suco)', quantidade: '6 unidades', categoria: 'frutas' },
      // Folhas
      { id: '30fo1', nome: 'Hortelã', quantidade: '4 maços ao longo do mês', categoria: 'folhas' },
      { id: '30fo2', nome: 'Capim-santo fresco ou seco', quantidade: '100g', categoria: 'folhas' },
      { id: '30fo3', nome: 'Alecrim em ramos', quantidade: '2 maços', categoria: 'folhas' },
      { id: '30fo4', nome: 'Louro seco', quantidade: '1 pacote de 50g', categoria: 'folhas' },
      // Ervas
      { id: '30e1', nome: 'Erva-doce em sementes', quantidade: '150g', categoria: 'ervas' },
      { id: '30e2', nome: 'Camomila desidratada', quantidade: '150g', categoria: 'ervas' },
      { id: '30e3', nome: 'Carqueja seca', quantidade: '50g', categoria: 'ervas' },
      // Raízes
      { id: '30r1', nome: 'Gengibre fresco', quantidade: '300g', categoria: 'raizes' },
      // Especiarias
      { id: '30es1', nome: 'Canela em pau verdadeira', quantidade: '100g', categoria: 'especiarias' },
      { id: '30es2', nome: 'Cravo-da-índia', quantidade: '50g', categoria: 'especiarias' },
      // Complementares
      { id: '30c1', nome: 'Pote de vidro âmbar para guardar ervas', quantidade: '2 a 3 potes', categoria: 'complementares' },
      { id: '30c2', nome: 'Peneira fina inox', quantidade: '1 unidade', categoria: 'complementares' },
    ],
  },
];

// ============================================================================
// 5. CALENDÁRIO DE 30 DIAS DO SEU NECO (GRADE INTERATIVA E SUGESTÕES)
// ============================================================================
export const CALENDAR_30_DAYS_DATA: CalendarDayItem[] = [
  {
    dia: 1,
    foco: 'Reinício Leve e Hidratação',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Despertar suave e conforto' },
      { periodo: 'Noite', numero: 1, titulo: 'Chá Suave de Camomila Tradicional', finalidade: 'Relaxamento para o sono' },
    ],
    observacao: 'Beba bastante água pura ao longo do dia para acompanhar as infusões.',
  },
  {
    dia: 2,
    foco: 'Digestão e Frescor',
    receitas: [
      { periodo: 'Tarde', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Sensação de leveza pós-almoço' },
    ],
    observacao: 'Tome pequenos goles sem pressa, sentindo o frescor da hortelã.',
  },
  {
    dia: 3,
    foco: 'Clareza Mental Matinal',
    receitas: [
      { periodo: 'Manhã', numero: 6, titulo: 'Infusão Matinal de Alecrim com Limão', finalidade: 'Disposição para o trabalho' },
      { periodo: 'Noite', numero: 1, titulo: 'Chá Suave de Camomila', finalidade: 'Desacelerar o ritmo' },
    ],
    observacao: 'Evite chás estimulantes como o alecrim após as 16h.',
  },
  {
    dia: 4,
    foco: 'Conforto Abdominal',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Acalmar o estômago' },
    ],
    observacao: 'Amasse levemente as sementes de erva-doce para liberar os óleos.',
  },
  {
    dia: 5,
    foco: 'Pausa da Tarde',
    receitas: [
      { periodo: 'Tarde', numero: 5, titulo: 'Chá de Casca de Maçã com Canela', finalidade: 'Aquece e traz saciedade suave' },
    ],
    observacao: 'Não adoce; a maçã e a canela já entregam doçura natural.',
  },
  {
    dia: 6,
    foco: 'Harmonia e Serenidade',
    receitas: [
      { periodo: 'Noite', numero: 8, titulo: 'Infusão Serenidade de Capim-Santo', finalidade: 'Preparação para descanso profundo' },
    ],
    observacao: 'Diminua as luzes fortes e telas meia hora antes de deitar.',
  },
  {
    dia: 7,
    foco: 'Fechamento da Primeira Semana',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Manter a constância do equilíbrio' },
      { periodo: 'Noite', numero: 1, titulo: 'Chá Suave de Camomila', finalidade: 'Paz de fim de domingo' },
    ],
    observacao: 'Avalie como seu corpo se sentiu mais leve nesta semana.',
  },
  {
    dia: 8,
    foco: 'Disposição para a Nova Semana',
    receitas: [
      { periodo: 'Manhã', numero: 6, titulo: 'Infusão de Alecrim com Limão', finalidade: 'Foco e vitalidade' },
    ],
    observacao: 'Comece a semana com uma respiração profunda ao tomar sua xícara.',
  },
  {
    dia: 9,
    foco: 'Digestão Descomplicada',
    receitas: [
      { periodo: 'Tarde', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Conforto gástrico' },
    ],
    observacao: 'Consuma cerca de 30 minutos após a principal refeição.',
  },
  {
    dia: 10,
    foco: 'Aquecimento Suave',
    receitas: [
      { periodo: 'Manhã', numero: 2, titulo: 'Chá de Gengibre com Limão', finalidade: 'Ativar a circulação' },
    ],
    observacao: 'Ferva o gengibre em fogo baixo com a panela tampada.',
  },
  {
    dia: 11,
    foco: 'Tarde Confortável',
    receitas: [
      { periodo: 'Tarde', numero: 5, titulo: 'Chá de Maçã com Canela', finalidade: 'Momento de aconchego' },
    ],
    observacao: 'Excelente companhia para uma leitura tranquila à tarde.',
  },
  {
    dia: 12,
    foco: 'Alívio de Tensões',
    receitas: [
      { periodo: 'Noite', numero: 8, titulo: 'Infusão de Capim-Santo', finalidade: 'Aliviar a tensão muscular do pescoço' },
    ],
    observacao: 'Respire o vapor cítrico do capim-santo antes do primeiro gole.',
  },
  {
    dia: 13,
    foco: 'Equilíbrio da Meia-Semana',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Bem-estar digestivo' },
      { periodo: 'Noite', numero: 1, titulo: 'Chá de Camomila', finalidade: 'Relaxamento' },
    ],
    observacao: 'Mantenha a regularidade dos horários das refeições.',
  },
  {
    dia: 14,
    foco: 'Fim da Segunda Semana',
    receitas: [
      { periodo: 'Noite', numero: 1, titulo: 'Chá de Camomila Tradicional', finalidade: 'Sono reparador' },
    ],
    observacao: 'Duas semanas de carinho diário com o seu ritmo biológico.',
  },
  {
    dia: 15,
    foco: 'Metade do Ciclo: Renovação',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Equilíbrio e frescor' },
    ],
    observacao: 'Organize suas ervas na despensa para mantê-las frescas.',
  },
  {
    dia: 16,
    foco: 'Energia Limpa',
    receitas: [
      { periodo: 'Manhã', numero: 6, titulo: 'Infusão de Alecrim com Limão', finalidade: 'Atenção e vigor' },
    ],
    observacao: 'Tome em pé, na janela ou ao ar livre para começar o dia.',
  },
  {
    dia: 17,
    foco: 'Suporte Digestivo',
    receitas: [
      { periodo: 'Tarde', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Leveza pós-almoço' },
    ],
    observacao: 'Beba morno, nunca pelando para não queimar a língua.',
  },
  {
    dia: 18,
    foco: 'Calmaria Noturna',
    receitas: [
      { periodo: 'Noite', numero: 8, titulo: 'Capim-Santo Fresco', finalidade: 'Acalmar os pensamentos agitados' },
    ],
    observacao: 'Deixe o bule abafado por 10 minutos para extrair o aroma.',
  },
  {
    dia: 19,
    foco: 'Sabor e Tradição',
    receitas: [
      { periodo: 'Tarde', numero: 5, titulo: 'Maçã com Canela e Cravo', finalidade: 'Memória afetiva' },
    ],
    observacao: 'O perfume pela casa cria uma sensação acolhedora de lar.',
  },
  {
    dia: 20,
    foco: 'Desintoxicação Natural da Rotina',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Despertar leve' },
      { periodo: 'Noite', numero: 1, titulo: 'Camomila Suave', finalidade: 'Noite tranquila' },
    ],
    observacao: 'Reduza o consumo de ultraprocessados e frituras hoje.',
  },
  {
    dia: 21,
    foco: 'Três Semanas de Hábito',
    receitas: [
      { periodo: 'Noite', numero: 1, titulo: 'Chá de Camomila Tradicional', finalidade: 'Consolidar rotina de sono' },
    ],
    observacao: '21 dias são suficientes para criar um novo hábito saudável.',
  },
  {
    dia: 22,
    foco: 'Manhã com Propósito',
    receitas: [
      { periodo: 'Manhã', numero: 6, titulo: 'Infusão de Alecrim', finalidade: 'Clareza mental e ânimo' },
    ],
    observacao: 'Lembre-se de respirar devagar e planejar suas prioridades.',
  },
  {
    dia: 23,
    foco: 'Harmonia Intestinal',
    receitas: [
      { periodo: 'Tarde', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Alívio de gases e sensação de inchaço' },
    ],
    observacao: 'A mastigação calma dos alimentos potencializa o efeito da erva-doce.',
  },
  {
    dia: 24,
    foco: 'Descanso da Mente',
    receitas: [
      { periodo: 'Noite', numero: 8, titulo: 'Capim-Santo com Camomila', finalidade: 'Relaxamento muscular e mental' },
    ],
    observacao: 'Prepare sua xícara quando começar a desacelerar a casa.',
  },
  {
    dia: 25,
    foco: 'Sensação Térmica Confortável',
    receitas: [
      { periodo: 'Tarde', numero: 2, titulo: 'Gengibre com Limão e Mel', finalidade: 'Sensação de aconchego na garganta' },
    ],
    observacao: 'Se o dia estiver quente, pode deixar esfriar e servir fresco.',
  },
  {
    dia: 26,
    foco: 'Dia de Simplicidade',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Frescor diário' },
    ],
    observacao: 'A simplicidade da horta é o melhor remédio para a pressa.',
  },
  {
    dia: 27,
    foco: 'Pausa Confortável',
    receitas: [
      { periodo: 'Tarde', numero: 5, titulo: 'Chá de Cascas de Maçã', finalidade: 'Aproveitamento integral dos alimentos' },
    ],
    observacao: 'Lave bem a fruta antes de descascar.',
  },
  {
    dia: 28,
    foco: 'Noite Restauradora',
    receitas: [
      { periodo: 'Noite', numero: 1, titulo: 'Chá de Camomila Tradicional', finalidade: 'Sono contínuo e profundo' },
    ],
    observacao: 'Evite cafeína após as 14h para proteger o sono.',
  },
  {
    dia: 29,
    foco: 'Penúltimo Dia do Ciclo',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Leveza constante' },
      { periodo: 'Noite', numero: 8, titulo: 'Infusão de Capim-Santo', finalidade: 'Gratidão e descanso' },
    ],
    observacao: 'Observe a diferença no seu bem-estar geral ao longo deste mês.',
  },
  {
    dia: 30,
    foco: 'Ciclo Completo com Sucesso',
    receitas: [
      { periodo: 'Manhã', numero: 4, titulo: 'Infusão de Erva-doce com Hortelã', finalidade: 'Celebrar a saúde e o autocuidado' },
      { periodo: 'Noite', numero: 1, titulo: 'Chá de Camomila com Hortelã', finalidade: 'Encerramento em paz' },
    ],
    observacao: 'Parabéns pela dedicação ao seu corpo e à sabedoria da natureza!',
  },
];
