/**
 * Gerador de PDF usando Puppeteer Core - Versão Simplificada
 * 
 * Esta versão evita problemas com importações dinâmicas e é mais robusta
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

/**
 * Configurações para geração de PDF
 */
const PDF_CONFIG = {
  format: 'A4' as const,
  orientation: 'landscape' as const,
  width: 1123,
  height: 794,
  margin: 0,
  quality: 0.98,
  scale: 2,
};

/**
 * Função principal para gerar PDF com Puppeteer Core
 * Versão simplificada e robusta
 */
export async function generatePDFWithPuppeteerCoreSimple(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF com Puppeteer Core...');
    
    // Configuração otimizada para servidor
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    
    try {
      const page = await browser.newPage();
      
      // Configurar viewport
      await page.setViewport({ 
        width: PDF_CONFIG.width, 
        height: PDF_CONFIG.height,
        deviceScaleFactor: options.scale || PDF_CONFIG.scale
      });
      
      // Carregar HTML
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 300000
      });
      
      // Aguardar imagens
      try {
        await page.waitForFunction(() => {
          const images = document.querySelectorAll('img');
          return Array.from(images).every(img => img.complete);
        }, { timeout: 300000 });
        console.log('✅ Imagens carregadas');
      } catch (imgError) {
        console.warn('⚠️ Timeout nas imagens, continuando...');
      }
      
      // Aguardar estabilidade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: PDF_CONFIG.format,
        landscape: PDF_CONFIG.orientation === 'landscape',
        printBackground: true,
        margin: { 
          top: PDF_CONFIG.margin, 
          right: PDF_CONFIG.margin, 
          bottom: PDF_CONFIG.margin, 
          left: PDF_CONFIG.margin 
        }
      });
      
      console.log('✅ PDF gerado com sucesso!');
      return Buffer.from(pdfBuffer);
      
    } finally {
      await browser.close();
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função de fallback que usa a implementação original do Puppeteer
 * Caso a nova implementação falhe
 */
export async function generatePDFFallback(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Usando fallback com implementação original...');
    
    // Importar a função original do puppeteer-config
    const { generatePDFFromHTML } = await import('@/lib/puppeteer-config');
    
    return await generatePDFFromHTML(html);
    
  } catch (error) {
    console.error('❌ Erro no fallback:', error);
    throw new Error(`Falha na geração de PDF (fallback): ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função híbrida que tenta a nova implementação primeiro, depois fallback
 */
export async function generatePDFRobust(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    // Tentar nova implementação primeiro
    return await generatePDFWithPuppeteerCoreSimple(html, options);
  } catch (error) {
    console.warn('⚠️ Nova implementação falhou, usando fallback...', error);
    
    // Se falhar, usar implementação original
    return await generatePDFFallback(html, options);
  }
}
