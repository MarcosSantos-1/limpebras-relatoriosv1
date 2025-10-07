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
  
  // Background da capa (cover.png)
  if (coverImage) {
    doc.addImage(coverImage, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
  }
  
  // Logo no canto superior direito
  if (logoImage) {
    const logoSize = 120;
    const logoX = doc.internal.pageSize.getWidth() - logoSize - 40;
    const logoY = 30;
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoSize, logoSize);
  }
  
  // Título "Relatórios de Evidências"
  doc.setFontSize(60);
  doc.setTextColor(25, 42, 86); // Azul escuro
  const titleX = doc.internal.pageSize.getWidth() - 200;
  const titleY = 200;
  doc.text('Relatórios de', titleX, titleY, { align: 'right' });
  doc.text('Evidências', titleX, titleY + 40, { align: 'right' });
  
  // Data e localização
  doc.setFontSize(22);
  doc.setTextColor(25, 42, 86); // Azul escuro
  const dateX = doc.internal.pageSize.getWidth() - 20;
  const dateY = doc.internal.pageSize.getHeight() - 100;
  doc.text(`${subRegiao}, ${date}`, dateX, dateY, { align: 'right' });
}

/**
 * Função para criar a contracapa conforme especificação
 */
function createBackCoverPage(doc: jsPDF, reportTitle: string, date: string, subRegiao: string, isConsolidated: boolean = false): void {
  // Logo centralizado
  const logoImage = loadImageAsBase64('logo.png');
  if (logoImage) {
    const logoSize = 150;
    const logoX = (doc.internal.pageSize.getWidth() - logoSize) / 2;
    const logoY = 30;
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoSize, logoSize);
  }
  
  // Título do relatório
  doc.setFontSize(72);
  doc.setTextColor(25, 42, 86); // Azul escuro
  const titleX = doc.internal.pageSize.getWidth() / 2;
  const titleY = 250;
  doc.text(reportTitle, titleX, titleY, { align: 'center', maxWidth: 400 });
  
  // Data e sub-região
  doc.setFontSize(22);
  doc.setTextColor(25, 42, 86); // Azul escuro
  const dateY = titleY + 60;
  doc.text(date, titleX, dateY, { align: 'center' });
  
  // Sub-região ou evidências consolidadas
  const subY = dateY + 30;
  if (isConsolidated) {
    doc.text('EVIDÊNCIAS CONSOLIDADAS', titleX, subY, { align: 'center' });
  } else {
    doc.text(subRegiao, titleX, subY, { align: 'center' });
  }
  
  // Line na borda inferior
  const lineImage = loadImageAsBase64('line.png');
  if (lineImage) {
    const lineY = doc.internal.pageSize.getHeight() - 40;
    doc.addImage(lineImage, 'PNG', 0, lineY, doc.internal.pageSize.getWidth(), 40);
  }
}

/**
 * Função para criar página fotográfica conforme especificação
 */
function createPhotoPage(doc: jsPDF, subRegiao: string, serviceName: string, date: string, photos: any[]): void {
  // Cabeçalho com logos
  const prefeituraImage = loadImageAsBase64('prefeitura.png');
  const logoImage = loadImageAsBase64('logo.png');
  
  // Logo da prefeitura (esquerda)
  if (prefeituraImage) {
    const logoHeight = 80;
    doc.addImage(prefeituraImage, 'PNG', 20, 20, logoHeight, logoHeight);
  }
  
  // Logo (direita)
  if (logoImage) {
    const logoHeight = 80;
    const logoX = doc.internal.pageSize.getWidth() - logoHeight - 60;
    doc.addImage(logoImage, 'PNG', logoX, 20, logoHeight, logoHeight);
  }
  
  // Descritivo
  let y = 120;
  
  // Prefeitura Regional
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(`PREFEITURA REGIONAL: ${subRegiao}`, 30, y);
  y += 25;
  
  // Operação São Paulo Limpa
  doc.text('Operação São Paulo Limpa', 30, y);
  y += 25;
  
  // Serviço
  doc.text(`Serviço(s): ${serviceName}`, 30, y);
  y += 25;
  
  // Data
  doc.text(`Data: ${date}`, 30, y);
  y += 40;
  
  // Fotos em grid (máximo 3 por página)
  const photosPerRow = 3;
  const photoSize = 430;
  const gap = 10;
  const startX = 30;
  
  for (let i = 0; i < Math.min(photos.length, 3); i++) {
    const photo = photos[i];
    const col = i % photosPerRow;
    const x = startX + col * (photoSize + gap);
    
    try {
      // Processar imagem base64
      const base64Data = photo.url.replace(/^data:image\/[a-z]+;base64,/, '');
      doc.addImage(base64Data, 'JPEG', x, y, photoSize, photoSize);
    } catch (error) {
      console.warn('⚠️ Erro ao renderizar foto:', error);
      // Placeholder se não conseguir renderizar
      doc.rect(x, y, photoSize, photoSize);
      doc.text('Imagem não disponível', x + 10, y + photoSize/2);
    }
  }
}

/**
 * Função para criar capa final conforme especificação
 */
function createFinalCoverPage(doc: jsPDF): void {
  const lineImage = loadImageAsBase64('line.png');
  const logoImage = loadImageAsBase64('logo.png');
  
  // Line superior (invertido verticalmente)
  if (lineImage) {
    doc.addImage(lineImage, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), 40);
  }
  
  // Logo centralizado
  if (logoImage) {
    const logoWidth = 600;
    const logoHeight = logoWidth; // Assumindo que é quadrado
    const logoX = (doc.internal.pageSize.getWidth() - logoWidth) / 2;
    const logoY = (doc.internal.pageSize.getHeight() - logoHeight) / 2;
    doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
  }
  
  // Line inferior
  if (lineImage) {
    const lineY = doc.internal.pageSize.getHeight() - 40;
    doc.addImage(lineImage, 'PNG', 0, lineY, doc.internal.pageSize.getWidth(), 40);
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
