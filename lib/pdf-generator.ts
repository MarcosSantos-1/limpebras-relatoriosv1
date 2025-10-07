/**
 * Gerador de PDF usando jsPDF com layout específico
 * 
 * Esta implementação segue o padrão visual específico solicitado
 */

import { jsPDF } from 'jspdf';
import type { MutiraoRelatorio, Relatorio, RotineirosRelatorio, MonumentosRelatorio } from '@/lib/types';
import fs from 'fs';
import path from 'path';

/**
 * Função para carregar imagem do sistema de arquivos
 */
function loadImageAsBase64(imagePath: string): string {
  try {
    const fullPath = path.join(process.cwd(), 'public', 'imgs', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.warn(`⚠️ Erro ao carregar imagem ${imagePath}:`, error);
    return '';
  }
}

/**
 * Função para criar a capa conforme especificação
 */
function createCoverPage(doc: jsPDF, title: string, date: string, subRegiao: string): void {
  // Carregar imagens
  const coverImage = loadImageAsBase64('cover.png');
  const logoImage = loadImageAsBase64('logo.png');
  
  // Background da capa (cover.png) - SEM DISTORÇÃO
  if (coverImage) {
    // Manter proporção da imagem
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(coverImage, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  }
  
  // Logo no canto superior direito - TAMANHO CORRETO
  if (logoImage) {
    const logoSize = 30; // Reduzido de 120 para 30mm
    const logoX = doc.internal.pageSize.getWidth() - logoSize - 10; // Reduzido de 40 para 10mm
    const logoY = 8; // Reduzido de 30 para 8mm
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoSize, logoSize, undefined, 'FAST');
  }
  
  // Título "Relatórios de Evidências" - TAMANHO CORRETO
  doc.setFontSize(24); // Reduzido de 60 para 24
  doc.setTextColor(25, 42, 86); // Azul escuro
  const titleX = doc.internal.pageSize.getWidth() - 15; // Reduzido de 200 para 15mm
  const titleY = 60; // Reduzido de 200 para 60mm
  doc.text('Relatórios de', titleX, titleY, { align: 'right' });
  doc.text('Evidências', titleX, titleY + 8, { align: 'right' }); // Reduzido espaçamento
  
  // Data e localização - TAMANHO CORRETO
  doc.setFontSize(10); // Reduzido de 22 para 10
  doc.setTextColor(25, 42, 86); // Azul escuro
  const dateX = doc.internal.pageSize.getWidth() - 10; // Reduzido de 20 para 10mm
  const dateY = doc.internal.pageSize.getHeight() - 20; // Reduzido de 100 para 20mm
  doc.text(`${subRegiao}, ${date}`, dateX, dateY, { align: 'right' });
}

/**
 * Função para criar a contracapa conforme especificação
 */
function createBackCoverPage(doc: jsPDF, reportTitle: string, date: string, subRegiao: string, isConsolidated: boolean = false): void {
  // Logo centralizado - TAMANHO CORRETO
  const logoImage = loadImageAsBase64('logo.png');
  if (logoImage) {
    const logoSize = 40; // Reduzido de 150 para 40mm
    const logoX = (doc.internal.pageSize.getWidth() - logoSize) / 2;
    const logoY = 8; // Reduzido de 30 para 8mm
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoSize, logoSize, undefined, 'FAST');
  }
  
  // Título do relatório - TAMANHO CORRETO
  doc.setFontSize(18); // Reduzido de 72 para 18
  doc.setTextColor(25, 42, 86); // Azul escuro
  const titleX = doc.internal.pageSize.getWidth() / 2;
  const titleY = 60; // Reduzido de 250 para 60mm
  doc.text(reportTitle, titleX, titleY, { align: 'center', maxWidth: 100 }); // Reduzido maxWidth de 400 para 100
  
  // Data e sub-região - TAMANHO CORRETO
  doc.setFontSize(10); // Reduzido de 22 para 10
  doc.setTextColor(25, 42, 86); // Azul escuro
  const dateY = titleY + 15; // Reduzido de 60 para 15mm
  doc.text(date, titleX, dateY, { align: 'center' });
  
  // Sub-região ou evidências consolidadas
  const subY = dateY + 8; // Reduzido de 30 para 8mm
  if (isConsolidated) {
    doc.text('EVIDÊNCIAS CONSOLIDADAS', titleX, subY, { align: 'center' });
  } else {
    doc.text(subRegiao, titleX, subY, { align: 'center' });
  }
  
  // Line na borda inferior - TAMANHO CORRETO
  const lineImage = loadImageAsBase64('line.png');
  if (lineImage) {
    const lineY = doc.internal.pageSize.getHeight() - 10; // Reduzido de 40 para 10mm
    doc.addImage(lineImage, 'PNG', 0, lineY, doc.internal.pageSize.getWidth(), 10, undefined, 'FAST');
  }
}

/**
 * Função para criar página fotográfica conforme especificação
 */
function createPhotoPage(doc: jsPDF, subRegiao: string, serviceName: string, date: string, photos: any[]): void {
  // MARGENS ESTREITAS: 20px superior, 30px direita, 30px inferior, 30px esquerda
  const marginTop = 5; // 20px = 5mm
  const marginRight = 8; // 30px = 8mm  
  const marginBottom = 8; // 30px = 8mm
  const marginLeft = 8; // 30px = 8mm
  
  // Cabeçalho com logos - TAMANHOS CORRETOS
  const prefeituraImage = loadImageAsBase64('prefeitura.png');
  const logoImage = loadImageAsBase64('logo.png');
  
  // Logo da prefeitura (esquerda) - SEM DISTORÇÃO
  if (prefeituraImage) {
    const logoHeight = 20; // Reduzido de 80 para 20mm
    doc.addImage(prefeituraImage, 'PNG', marginLeft, marginTop, logoHeight, logoHeight, undefined, 'FAST');
  }
  
  // Logo (direita) - SEM DISTORÇÃO
  if (logoImage) {
    const logoHeight = 20; // Reduzido de 80 para 20mm
    const logoX = doc.internal.pageSize.getWidth() - logoHeight - marginRight;
    doc.addImage(logoImage, 'PNG', logoX, marginTop, logoHeight, logoHeight, undefined, 'FAST');
  }
  
  // Descritivo - COMPACTO COM LINE-HEIGHT PEQUENO
  let y = marginTop + 25; // Reduzido de 120 para 25mm
  
  // Prefeitura Regional - FONTE 12px COM LINE-HEIGHT PEQUENO
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`PREFEITURA REGIONAL: ${subRegiao}`, marginLeft, y);
  y += 4; // Line-height pequeno (reduzido de 25 para 4mm)
  
  // Operação São Paulo Limpa
  doc.text('Operação São Paulo Limpa', marginLeft, y);
  y += 4; // Line-height pequeno
  
  // Serviço
  doc.text(`Serviço(s): ${serviceName}`, marginLeft, y);
  y += 4; // Line-height pequeno
  
  // Data
  doc.text(`Data: ${date}`, marginLeft, y);
  y += 8; // Espaço antes das fotos (reduzido de 40 para 8mm)
  
  // Fotos em grid (máximo 3 por página) - TAMANHOS CORRETOS
  const photosPerRow = 3;
  const availableWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
  const gap = 2; // Gap pequeno (reduzido de 10 para 2mm)
  const photoSize = (availableWidth - (gap * (photosPerRow - 1))) / photosPerRow; // Cálculo dinâmico
  const startX = marginLeft;
  
  console.log(`📸 Renderizando ${photos.length} fotos com tamanho ${photoSize}mm`);
  
  for (let i = 0; i < Math.min(photos.length, 3); i++) {
    const photo = photos[i];
    const col = i % photosPerRow;
    const x = startX + col * (photoSize + gap);
    
    try {
      // Processar imagem base64 - SEM DISTORÇÃO
      const base64Data = photo.url.replace(/^data:image\/[a-z]+;base64,/, '');
      doc.addImage(base64Data, 'JPEG', x, y, photoSize, photoSize, undefined, 'FAST');
      console.log(`✅ Foto ${i + 1} renderizada em ${x}, ${y}`);
    } catch (error) {
      console.warn('⚠️ Erro ao renderizar foto:', error);
      // Placeholder se não conseguir renderizar
      doc.rect(x, y, photoSize, photoSize);
      doc.text('Imagem não disponível', x + 2, y + photoSize/2);
    }
  }
}

/**
 * Função para criar capa final conforme especificação
 */
function createFinalCoverPage(doc: jsPDF): void {
  const lineImage = loadImageAsBase64('line.png');
  const logoImage = loadImageAsBase64('logo.png');
  
  // Line superior (invertido verticalmente) - TAMANHO CORRETO
  if (lineImage) {
    doc.addImage(lineImage, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), 10, undefined, 'FAST'); // Reduzido de 40 para 10mm
  }
  
  // Logo centralizado - TAMANHO CORRETO
  if (logoImage) {
    const logoWidth = 60; // Reduzido de 600 para 60mm
    const logoHeight = logoWidth; // Assumindo que é quadrado
    const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
    const logoY = (doc.internal.pageSize.getHeight() - logoHeight) / 2;
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
  }
  
  // Line inferior - TAMANHO CORRETO
  if (lineImage) {
    const lineY = doc.internal.pageSize.getHeight() - 10; // Reduzido de 40 para 10mm
    doc.addImage(lineImage, 'PNG', 0, lineY, doc.internal.pageSize.getWidth(), 10, undefined, 'FAST');
  }
}

/**
 * Função para gerar PDF de Mutirão com layout específico
 */
export async function generateMutiraoJSPDF(dados: MutiraoRelatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Mutirão com layout específico...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Formatar data
    const dataFormatada = new Date(dados.data).toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Determinar sub-região
    const subRegioes = dados.secoes?.map(s => s.sub) || [];
    const subRegiaoTexto = subRegioes.length > 0 ? subRegioes.join(', ') : 'SÃO PAULO';
    
    // CAPA
    createCoverPage(doc, 'Relatórios de Evidências', dataFormatada, subRegiaoTexto);
    
    // CONTRACAPA
    doc.addPage();
    createBackCoverPage(doc, 'RELATÓRIO OPERAÇÃO SÃO PAULO LIMPA', dataFormatada, subRegiaoTexto, false);
    
    // PÁGINAS FOTOGRÁFICAS
    if (dados.secoes && dados.secoes.length > 0) {
      for (const secao of dados.secoes) {
        if (secao.servicos && secao.servicos.length > 0) {
          for (const servico of secao.servicos) {
            if (servico.fotos && servico.fotos.length > 0) {
              doc.addPage();
              createPhotoPage(doc, secao.sub || 'SÃO PAULO', servico.assunto, dataFormatada, servico.fotos);
            }
          }
        }
      }
    }
    
    // CAPA FINAL
    doc.addPage();
    createFinalCoverPage(doc);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Mutirão gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Mutirão:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Evidências com layout específico
 */
export async function generateEvidenciasJSPDF(dados: Relatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Evidências com layout específico...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Formatar data
    const dataRelatorio = 'data' in dados ? dados.data : 
                         'dataInicio' in dados ? dados.dataInicio : 
                         'Não informado';
    
    const dataFormatada = dataRelatorio !== 'Não informado' ? 
      new Date(dataRelatorio).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 
      'Data não informada';
    
    const subRegiao = 'sub' in dados ? dados.sub : 'SÃO PAULO';
    
    // CAPA
    createCoverPage(doc, 'Relatórios de Evidências', dataFormatada, subRegiao);
    
    // CONTRACAPA
    doc.addPage();
    createBackCoverPage(doc, 'RELATÓRIO DE EVIDÊNCIAS', dataFormatada, subRegiao, false);
    
    // PÁGINAS FOTOGRÁFICAS
    if ('fotos' in dados && dados.fotos && dados.fotos.length > 0) {
      // Dividir fotos em grupos de 3
      const photosPerPage = 3;
      for (let i = 0; i < dados.fotos.length; i += photosPerPage) {
        const pagePhotos = dados.fotos.slice(i, i + photosPerPage);
        doc.addPage();
        createPhotoPage(doc, subRegiao, dados.tipoServico || 'Serviço', dataFormatada, pagePhotos);
      }
    }
    
    // CAPA FINAL
    doc.addPage();
    createFinalCoverPage(doc);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Evidências gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Evidências:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Rotineiros com layout específico
 */
export async function generateRotineirosJSPDF(mesAno: string, rotineiros: RotineirosRelatorio[]): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Rotineiros com layout específico...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // CAPA
    createCoverPage(doc, 'Relatórios de Evidências', mesAno, 'SÃO PAULO');
    
    // CONTRACAPA
    doc.addPage();
    createBackCoverPage(doc, 'RELATÓRIO DE SERVIÇOS ROTINEIROS', mesAno, 'SÃO PAULO', false);
    
    // PÁGINAS FOTOGRÁFICAS
    for (const rotineiro of rotineiros) {
      if (rotineiro.servicos && rotineiro.servicos.length > 0) {
        for (const servico of rotineiro.servicos) {
          if (servico.fotos && servico.fotos.length > 0) {
            doc.addPage();
            const dataFormatada = new Date(rotineiro.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
            createPhotoPage(doc, rotineiro.sub || 'SÃO PAULO', servico.assunto, dataFormatada, servico.fotos);
          }
        }
      }
    }
    
    // CAPA FINAL
    doc.addPage();
    createFinalCoverPage(doc);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Rotineiros gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Rotineiros:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Monumentos com layout específico
 */
export async function generateMonumentosJSPDF(dados: MonumentosRelatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Monumentos com layout específico...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    const dataFormatada = new Date(dados.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // CAPA
    createCoverPage(doc, 'Relatórios de Evidências', dataFormatada, dados.sub || 'SÃO PAULO');
    
    // CONTRACAPA
    doc.addPage();
    createBackCoverPage(doc, 'RELATÓRIO DE MONUMENTOS', dataFormatada, dados.sub || 'SÃO PAULO', false);
    
    // PÁGINAS FOTOGRÁFICAS
    if (dados.fotos && dados.fotos.length > 0) {
      const photosPerPage = 3;
      for (let i = 0; i < dados.fotos.length; i += photosPerPage) {
        const pagePhotos = dados.fotos.slice(i, i + photosPerPage);
        doc.addPage();
        createPhotoPage(doc, dados.sub || 'SÃO PAULO', dados.monumento || 'Monumento', dataFormatada, pagePhotos);
      }
    }
    
    // CAPA FINAL
    doc.addPage();
    createFinalCoverPage(doc);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Monumentos gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Monumentos:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
