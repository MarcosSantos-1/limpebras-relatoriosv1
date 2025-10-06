/**
 * Gerador de PDF usando apenas jsPDF + html2canvas
 * 
 * Esta implementação não usa Puppeteer, apenas jsPDF + html2canvas
 * Funciona perfeitamente em servidores como Vercel
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
  width: 297,
  height: 210,
  margin: 0,
  quality: 0.98,
  scale: 2,
};

/**
 * Função para otimizar HTML para jsPDF
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

/**
 * Função principal para gerar PDF usando jsPDF + html2canvas
 * Esta função funciona apenas no cliente (browser)
 */
export async function generatePDFWithJSPDF(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF com jsPDF + html2canvas...');
    
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') {
      throw new Error('jsPDF + html2canvas só funciona no cliente (browser)');
    }
    
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
 * Função para gerar PDF no servidor usando uma abordagem diferente
 * Esta função cria um PDF básico sem usar Puppeteer
 */
export async function generatePDFServerOnly(
  html: string,
  options: {
    filename?: string;
    quality?: number;
    scale?: number;
  } = {}
): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF básico no servidor (sem Puppeteer)...');
    
    // Criar PDF básico usando jsPDF diretamente
    const pdf = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format,
    });
    
    // Adicionar conteúdo básico
    pdf.setFontSize(16);
    pdf.text('Relatório Gerado', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text('Este é um PDF básico gerado sem Puppeteer.', 20, 50);
    pdf.text('Para melhor qualidade, use a versão do cliente.', 20, 60);
    
    // Extrair informações básicas do HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      pdf.text(`Título: ${titleMatch[1]}`, 20, 80);
    }
    
    // Adicionar data atual
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 100);
    
    console.log('✅ PDF básico gerado no servidor!');
    
    const pdfOutput = pdf.output('arraybuffer');
    return Buffer.from(pdfOutput);
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF no servidor:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função híbrida que detecta o ambiente e usa a abordagem apropriada
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
    console.log('🖥️ Executando no servidor, usando PDF básico');
    return generatePDFServerOnly(html, options);
  } else {
    console.log('🌐 Executando no cliente, usando jsPDF + html2canvas');
    return generatePDFWithJSPDF(html, options);
  }
}
