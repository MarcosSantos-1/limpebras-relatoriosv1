/**
 * Teste simples da API de geração de PDF
 * 
 * Este arquivo pode ser usado para testar se a API está funcionando corretamente
 */

// Dados de teste simples
const dadosTeste = {
  tipoServico: 'revitalizacao',
  data: '2024-01-15',
  subRegiao: 'Sub-região Sul',
  responsavel: 'João Silva',
  evidencias: [
    {
      url: 'https://via.placeholder.com/400x300/007bff/ffffff?text=Evidência+1',
      descricao: 'Antes da revitalização'
    },
    {
      url: 'https://via.placeholder.com/400x300/28a745/ffffff?text=Evidência+2',
      descricao: 'Durante a revitalização'
    }
  ]
};

/**
 * Função para testar a API de geração de PDF
 */
export async function testarAPIPDF() {
  try {
    console.log('🧪 Testando API de geração de PDF...');
    
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        tipo: 'evidencias', 
        dados: dadosTeste 
      }),
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      throw new Error(`API retornou erro: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    console.log('✅ PDF gerado com sucesso!');
    console.log('📊 Tamanho do PDF:', blob.size, 'bytes');
    
    return {
      sucesso: true,
      tamanhoBytes: blob.size,
      blob: blob
    };
    
  } catch (error) {
    console.error('❌ Erro no teste da API:', error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Função para testar diferentes tipos de relatório
 */
export async function testarTodosTiposAPI() {
  const tipos = ['evidencias', 'mutirao', 'rotineiros'];
  const resultados = [];
  
  for (const tipo of tipos) {
    console.log(`🧪 Testando tipo: ${tipo}`);
    
    try {
      const inicio = Date.now();
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tipo: tipo, 
          dados: { ...dadosTeste, tipoServico: tipo }
        }),
      });
      
      const tempo = Date.now() - inicio;
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API retornou erro: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      
      resultados.push({
        tipo,
        sucesso: true,
        tempoMs: tempo,
        tamanhoBytes: blob.size
      });
      
      console.log(`✅ ${tipo}: ${tempo}ms, ${blob.size} bytes`);
      
    } catch (error) {
      resultados.push({
        tipo,
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      console.error(`❌ ${tipo}:`, error);
    }
  }
  
  return resultados;
}

// Exportar dados de teste
export { dadosTeste };
