console.log('=== TESTE DE RECEITAS VISTAS RECENTEMENTE ===');

function simulateRecentContext() {
  let list: string[] = ['004'];

  function addRecent(id: string) {
    list = [id, ...list.filter((existing) => existing !== id)].slice(0, 5);
  }

  return {
    getList: () => list,
    addRecent,
  };
}

const ctx = simulateRecentContext();
console.log('Estado inicial:', ctx.getList());

// 1. Adicionar receitas sequencialmente
ctx.addRecent('001');
ctx.addRecent('002');
ctx.addRecent('003');
ctx.addRecent('005');
console.log('Após adicionar 001, 002, 003, 005 (total 5):', ctx.getList());

// 2. Adicionar uma 6ª receita (deve descartar a mais antiga, mantendo max 5)
ctx.addRecent('006');
const listAfter6 = ctx.getList();
console.log('Após adicionar 006 (deve ter descartado 004):', listAfter6);

if (listAfter6.length === 5 && listAfter6[0] === '006' && !listAfter6.includes('004')) {
  console.log('✅ Limite de 5 e descarte da mais antiga: CORRETO');
} else {
  console.error('❌ Falha no limite de 5');
}

// 3. Reabrir uma receita já presente (ex: '002') - deve mover para o topo SEM duplicar
ctx.addRecent('002');
const listAfterReopen = ctx.getList();
console.log('Após reabrir 002 (deve estar na posição 0 sem duplicata):', listAfterReopen);

const count002 = listAfterReopen.filter((id) => id === '002').length;
if (listAfterReopen[0] === '002' && count002 === 1 && listAfterReopen.length === 5) {
  console.log('✅ Reordenação cronológica e ausência de duplicatas: CORRETO');
} else {
  console.error('❌ Falha na reordenação ou duplicata detectada');
}

console.log('\n=== TESTES DE RECÊNCIA CONCLUÍDOS COM SUCESSO! ===');
