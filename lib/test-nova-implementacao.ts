/**
 * Teste simples para verificar se a nova implementação está funcionando
 * 
 * Execute este arquivo para testar a geração de PDF com Puppeteer Core
 */

import { generatePDFWithPuppeteerCore, optimizeHTMLForJSPDF } from '@/lib/pdf-generator-jspdf';
import { generateEvidenciasHTMLJSPDF } from '@/lib/pdf/html-generators-jspdf';

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
 * Função de teste principal
 */
export async function testarNovaImplementacao() {
  try {
    console.log('🧪 Iniciando teste da nova implementação...');
    
    // 1. Gerar HTML
    console.log('📄 Gerando HTML...');
    const html = generateEvidenciasHTMLJSPDF(dadosTeste as any);
    console.log('✅ HTML gerado:', html.length, 'caracteres');
    
    // 2. Otimizar HTML
    console.log('🔧 Otimizando HTML...');
    const htmlOtimizado = optimizeHTMLForJSPDF(html);
    console.log('✅ HTML otimizado:', htmlOtimizado.length, 'caracteres');
    
    // 3. Gerar PDF
    console.log('📄 Gerando PDF com Puppeteer Core...');
    const inicio = Date.now();
    
    const pdfBuffer = await generatePDFWithPuppeteerCore(htmlOtimizado, {
      quality: 0.95,
      scale: 2
    });
    
    const tempo = Date.now() - inicio;
    
    console.log('✅ PDF gerado com sucesso!');
    console.log('📊 Tamanho:', pdfBuffer.length, 'bytes');
    console.log('⏱️ Tempo:', tempo, 'ms');
    
    return {
      sucesso: true,
      tamanhoBytes: pdfBuffer.length,
      tempoMs: tempo,
      buffer: pdfBuffer
    };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Função para testar diferentes configurações
 */
export async function testarConfiguracoes() {
  const configuracoes = [
    { quality: 0.8, scale: 1, nome: 'Rápido' },
    { quality: 0.9, scale: 2, nome: 'Balanceado' },
    { quality: 0.95, scale: 3, nome: 'Alta Qualidade' }
  ];
  
  const resultados = [];
  
  for (const config of configuracoes) {
    console.log(`🧪 Testando configuração: ${config.nome}`);
    
    try {
      const html = generateEvidenciasHTMLJSPDF(dadosTeste as any);
      const htmlOtimizado = optimizeHTMLForJSPDF(html);
      
      const inicio = Date.now();
      const pdfBuffer = await generatePDFWithPuppeteerCore(htmlOtimizado, config);
      const tempo = Date.now() - inicio;
      
      resultados.push({
        configuracao: config.nome,
        sucesso: true,
        tamanhoBytes: pdfBuffer.length,
        tempoMs: tempo,
        qualidade: config.quality,
        escala: config.scale
      });
      
      console.log(`✅ ${config.nome}: ${tempo}ms, ${pdfBuffer.length} bytes`);
      
    } catch (error) {
      resultados.push({
        configuracao: config.nome,
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      console.error(`❌ ${config.nome}:`, error);
    }
  }
  
  return resultados;
}

// Exportar dados de teste para uso em outros arquivos
export { dadosTeste };
