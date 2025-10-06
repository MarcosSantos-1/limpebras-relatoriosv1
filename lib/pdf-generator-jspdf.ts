/**
 * Gerador de PDF usando jsPDF + html2canvas
 * 
 * Esta biblioteca é muito mais leve que o Puppeteer e funciona perfeitamente
 * em servidores como Vercel, Render, etc.
 * 
 * Vantagens:
 * - Muito mais leve (sem dependências pesadas)
 * - Funciona em qualquer servidor
 * - Deploy rápido
 * - Mantém toda a qualidade visual do HTML/CSS
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Configurações para geração de PDF
 */
const PDF_CONFIG = {
  format: 'a4' as const,
  orientation: 'landscape' as const,
  unit: 'mm' as const,
  // A4 landscape: 297mm x 210mm
  width: 297,
  height: 210,
  margin: 0,
  quality: 0.98,
  scale: 2, // Maior qualidade
};

/**
 * Gera PDF a partir de HTML usando jsPDF + html2canvas
 * 
 * @param html - HTML completo com CSS inline
 * @param options - Opções de configuração
 * @returns Buffer do PDF gerado
 */
export async function generatePDFFromHTML(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Iniciando geração de PDF com jsPDF...');
    
    // Criar elemento temporário para renderizar o HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = `${PDF_CONFIG.width}mm`;
    tempDiv.style.height = 'auto';
    tempDiv.style.backgroundColor = 'white';
    
    // Adicionar ao DOM temporariamente
    document.body.appendChild(tempDiv);
    
    // Configurações do html2canvas
    const canvasOptions = {
      scale: options.scale || PDF_CONFIG.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: PDF_CONFIG.width * 3.7795275591, // mm para pixels (96 DPI)
      height: tempDiv.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    };
    
    console.log('📸 Capturando HTML como canvas...');
    
    // Capturar HTML como canvas
    const canvas = await html2canvas(tempDiv, canvasOptions);
    
    // Remover elemento temporário
    document.body.removeChild(tempDiv);
    
    console.log('📄 Canvas gerado:', canvas.width, 'x', canvas.height);
    
    // Criar PDF
    const pdf = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format,
    });
    
    // Calcular dimensões para ajustar na página A4 landscape
    const imgWidth = PDF_CONFIG.width;
    const imgHeight = (canvas.height * PDF_CONFIG.width) / canvas.width;
    
    // Se a imagem for muito alta, dividir em páginas
    if (imgHeight > PDF_CONFIG.height) {
      const pageHeight = PDF_CONFIG.height;
      const totalPages = Math.ceil(imgHeight / pageHeight);
      
      console.log(`📄 Dividindo em ${totalPages} páginas...`);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const yOffset = -i * pageHeight;
        const cropHeight = Math.min(pageHeight, imgHeight - (i * pageHeight));
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', options.quality || PDF_CONFIG.quality),
          'JPEG',
          0,
          yOffset,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }
    } else {
      // Imagem cabe em uma página
      pdf.addImage(
        canvas.toDataURL('image/jpeg', options.quality || PDF_CONFIG.quality),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      );
    }
    
    console.log('✅ PDF gerado com sucesso!');
    
    // Converter para Buffer
    const pdfOutput = pdf.output('arraybuffer');
    return Buffer.from(pdfOutput);
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Versão para uso em servidor usando Puppeteer Core (mais leve)
 * Esta função usa puppeteer-core com chromium-min para processar HTML completo
 */
export async function generatePDFFromHTMLServer(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Iniciando geração de PDF no servidor com Puppeteer Core...');
    
    // Importar puppeteer-core dinamicamente para evitar problemas de build
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium-min');
    
    // Configuração otimizada para servidor
    const browser = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
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
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
    
    try {
      const page = await browser.newPage();
      
      // Configurar viewport para A4 landscape
      await page.setViewport({ 
        width: 1123, 
        height: 794,
        deviceScaleFactor: options.scale || 2
      });
      
      // Carregar HTML na página
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 300000 // 5 minutos
      });
      
      // Aguardar carregamento de imagens
      try {
        await page.waitForFunction(() => {
          const images = document.querySelectorAll('img');
          return Array.from(images).every(img => img.complete);
        }, { timeout: 300000 });
        console.log('✅ Todas as imagens carregadas');
      } catch (imgError) {
        console.warn('⚠️ Timeout no carregamento de imagens, continuando...');
      }
      
      // Aguardar estabilidade
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🔄 Gerando PDF...');
      
      // Gerar PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      });
      
      console.log('✅ PDF gerado com sucesso no servidor!');
      return Buffer.from(pdfBuffer);
      
    } finally {
      await browser.close();
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF no servidor:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função híbrida inteligente que usa a melhor abordagem para cada ambiente
 */
export async function generatePDFHybrid(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  // Detectar se estamos no cliente ou servidor
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    console.log('🖥️ Executando no servidor, usando Puppeteer Core');
    return generatePDFFromHTMLServer(html, options);
  } else {
    console.log('🌐 Executando no cliente, usando jsPDF + html2canvas');
    return generatePDFFromHTML(html, options);
  }
}

/**
 * Função alternativa que sempre usa Puppeteer Core (mais confiável)
 * Recomendada para uso em produção
 */
export async function generatePDFWithPuppeteerCore(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF com Puppeteer Core...');
    
    // Importar puppeteer-core dinamicamente
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium-min');
    
    // Configuração otimizada
    const browser = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
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
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
    
    try {
      const page = await browser.newPage();
      
      // Configurar viewport
      await page.setViewport({ 
        width: 1123, 
        height: 794,
        deviceScaleFactor: options.scale || 2
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
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });
      
      console.log('✅ PDF gerado com Puppeteer Core!');
      return Buffer.from(pdfBuffer);
      
    } finally {
      await browser.close();
    }
    
  } catch (error) {
    console.error('❌ Erro com Puppeteer Core:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função específica para relatórios que mantém a qualidade visual
 * Esta função otimiza o HTML para jsPDF
 */
export function optimizeHTMLForJSPDF(html: string): string {
  return html
    // Remover @page rules que não funcionam com jsPDF
    .replace(/@page\s*\{[^}]*\}/g, '')
    // Ajustar page-break para funcionar melhor
    .replace(/page-break-after:\s*always/g, 'break-after: page')
    .replace(/page-break-before:\s*always/g, 'break-before: page')
    .replace(/page-break-inside:\s*avoid/g, 'break-inside: avoid')
    // Garantir que as fontes sejam carregadas
    .replace(/@import\s+url\([^)]+\);/g, '')
    // Adicionar estilos específicos para jsPDF
    + `
    <style>
      /* Estilos específicos para jsPDF */
      .page {
        width: ${PDF_CONFIG.width}mm !important;
        min-height: ${PDF_CONFIG.height}mm !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      
      /* Garantir que as imagens sejam carregadas */
      img {
        max-width: 100% !important;
        height: auto !important;
      }
    </style>
    `;
}
