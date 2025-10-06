/**
 * Arquivo de teste para a nova implementação de geração de PDF com jsPDF
 * 
 * Este arquivo demonstra como usar a nova funcionalidade e pode ser usado
 * para testar a geração de PDFs sem Puppeteer.
 */

import { generatePDFHybrid, optimizeHTMLForJSPDF } from '@/lib/pdf-generator-jspdf';
import { generateEvidenciasHTMLJSPDF } from '@/lib/pdf/html-generators-jspdf';

// Exemplo de dados de teste
const exemploRelatorio = {
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
    },
    {
      url: 'https://via.placeholder.com/400x300/dc3545/ffffff?text=Evidência+3',
      descricao: 'Após a revitalização'
    }
  ]
};

/**
 * Função para testar a geração de PDF
 */
export async function testarGeracaoPDF() {
  try {
    console.log('🧪 Iniciando teste de geração de PDF com jsPDF...');
    
    // Gerar HTML otimizado
    const html = generateEvidenciasHTMLJSPDF(exemploRelatorio as any);
    const htmlOtimizado = optimizeHTMLForJSPDF(html);
    
    console.log('📄 HTML gerado:', htmlOtimizado.length, 'caracteres');
    
    // Gerar PDF
    const pdfBuffer = await generatePDFHybrid(htmlOtimizado, {
      quality: 0.95,
      scale: 2
    });
    
    console.log('✅ PDF gerado com sucesso!');
    console.log('📊 Tamanho do PDF:', pdfBuffer.length, 'bytes');
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

/**
 * Função para comparar performance entre Puppeteer e jsPDF
 */
export async function compararPerformance() {
  console.log('⚡ Iniciando comparação de performance...');
  
  const inicio = Date.now();
  
  try {
    await testarGeracaoPDF();
    
    const tempoTotal = Date.now() - inicio;
    console.log(`⏱️ Tempo total: ${tempoTotal}ms`);
    
    return {
      sucesso: true,
      tempoMs: tempoTotal,
      metodo: 'jsPDF + html2canvas'
    };
    
  } catch (error) {
    const tempoTotal = Date.now() - inicio;
    console.error('❌ Erro na comparação:', error);
    
    return {
      sucesso: false,
      tempoMs: tempoTotal,
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
      metodo: 'jsPDF + html2canvas'
    };
  }
}

/**
 * Função para testar diferentes tipos de relatório
 */
export async function testarTodosTipos() {
  const tipos = ['evidencias', 'mutirao', 'rotineiros'];
  const resultados = [];
  
  for (const tipo of tipos) {
    console.log(`🧪 Testando tipo: ${tipo}`);
    
    try {
      const inicio = Date.now();
      
      // Simular dados para cada tipo
      const dados = {
        ...exemploRelatorio,
        tipoServico: tipo
      };
      
      const html = generateEvidenciasHTMLJSPDF(dados as any);
      const htmlOtimizado = optimizeHTMLForJSPDF(html);
      const pdfBuffer = await generatePDFHybrid(htmlOtimizado);
      
      const tempo = Date.now() - inicio;
      
      resultados.push({
        tipo,
        sucesso: true,
        tempoMs: tempo,
        tamanhoBytes: pdfBuffer.length
      });
      
      console.log(`✅ ${tipo}: ${tempo}ms, ${pdfBuffer.length} bytes`);
      
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

// Exportar funções para uso em outros arquivos
export {
  exemploRelatorio
};
