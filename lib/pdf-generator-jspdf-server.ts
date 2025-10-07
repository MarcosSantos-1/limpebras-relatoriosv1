/**
 * Gerador de PDF usando jsPDF (funciona no servidor)
 * 
 * Esta implementação usa jsPDF que funciona perfeitamente no servidor
 * sem precisar de Puppeteer ou PDFKit
 */

import { jsPDF } from 'jspdf';
import type { MutiraoRelatorio, Relatorio, RotineirosRelatorio, MonumentosRelatorio } from '@/lib/types';

/**
 * Função para converter base64 para imagem e adicionar ao PDF
 */
async function addImageToPDF(doc: jsPDF, imageData: string, x: number, y: number, width: number, height: number): Promise<void> {
  try {
    // Remover o prefixo data:image/jpeg;base64, se existir
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Adicionar a imagem ao PDF
    doc.addImage(base64Data, 'JPEG', x, y, width, height);
  } catch (error) {
    console.warn('⚠️ Erro ao adicionar imagem:', error);
    // Se não conseguir adicionar a imagem, adicionar um placeholder
    doc.rect(x, y, width, height);
    doc.text('Imagem não disponível', x + 5, y + height/2);
  }
}

/**
 * Função para criar uma página de capa estilizada
 */
function createCoverPage(doc: jsPDF, title: string, subtitle: string, info: string[]): void {
  // Fundo gradiente simulado
  doc.setFillColor(102, 126, 234); // Cor azul
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
  
  // Logo/ícone central
  doc.setFillColor(255, 255, 255);
  doc.circle(doc.internal.pageSize.getWidth()/2, 100, 30, 'F');
  doc.setFontSize(24);
  doc.setTextColor(102, 126, 234);
  doc.text('📋', doc.internal.pageSize.getWidth()/2, 110, { align: 'center' });
  
  // Título principal
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text(title, doc.internal.pageSize.getWidth()/2, 160, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(20);
  doc.text(subtitle, doc.internal.pageSize.getWidth()/2, 190, { align: 'center' });
  
  // Informações
  doc.setFontSize(16);
  let y = 230;
  info.forEach((infoText, index) => {
    doc.setFillColor(255, 255, 255, 0.1);
    doc.roundedRect(doc.internal.pageSize.getWidth()/2 - 100, y, 200, 25, 10, 10, 'F');
    doc.text(infoText, doc.internal.pageSize.getWidth()/2, y + 15, { align: 'center' });
    y += 35;
  });
  
  // Data de geração
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight() - 30, { align: 'center' });
}

/**
 * Função para gerar PDF de Mutirão usando jsPDF
 */
export async function generateMutiraoJSPDF(dados: MutiraoRelatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Mutirão com jsPDF...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // CAPA ESTILIZADA
    const subRegioes = dados.secoes?.map(s => s.sub) || [];
    const subRegiaoTexto = subRegioes.length > 0 ? subRegioes.join(', ') : 'Não informado';
    
    createCoverPage(doc, 'RELATÓRIO DE MUTIRÃO', dados.title || 'Sem título', [
      `Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}`,
      `Sub-regiões: ${subRegiaoTexto}`,
      `Total de Seções: ${dados.secoes?.length || 0}`
    ]);
    
    // QUANTITATIVO COM ESTILIZAÇÃO
    if (dados.quantitativo && dados.quantitativo.length > 0) {
      doc.addPage();
      
      // Cabeçalho da seção
      doc.setFillColor(52, 73, 94);
      doc.rect(20, 20, doc.internal.pageSize.getWidth() - 40, 15, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('QUANTITATIVO', 20, 30);
      
      // Tabela estilizada
      doc.setFontSize(12);
      let y = 50;
      
      // Cabeçalho da tabela
      doc.setFillColor(236, 240, 241);
      doc.rect(20, y - 5, doc.internal.pageSize.getWidth() - 40, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text('Item', 25, y);
      doc.text('Quantidade', 100, y);
      doc.text('Unidade', 150, y);
      
      y += 15;
      
      // Dados da tabela
      dados.quantitativo.forEach((item, index) => {
        // Alternar cores das linhas
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(20, y - 5, doc.internal.pageSize.getWidth() - 40, 10, 'F');
        }
        
        doc.setTextColor(0, 0, 0);
        doc.text(item.descricao || `Item ${index + 1}`, 25, y);
        doc.text(item.quantidade?.toString() || '0', 100, y);
        doc.text(item.unidade || 'un', 150, y);
        y += 10;
      });
    }
    
    // SEÇÕES COM FOTOS
    if (dados.secoes && dados.secoes.length > 0) {
      for (let secaoIndex = 0; secaoIndex < dados.secoes.length; secaoIndex++) {
        const secao = dados.secoes[secaoIndex];
        
        doc.addPage();
        
        // Cabeçalho da seção
        doc.setFillColor(52, 73, 94);
        doc.rect(20, 20, doc.internal.pageSize.getWidth() - 40, 15, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(`${secaoIndex + 1}. ${secao.sub || 'Sub-região'}`, 20, 30);
        
        let y = 50;
        
        // Informações da seção
        if (secao.local) {
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(`Local: ${secao.local}`, 20, y);
          y += 10;
        }
        
        if (secao.descricao) {
          doc.setFontSize(12);
          doc.text(`Descrição: ${secao.descricao}`, 20, y);
          y += 10;
        }
        
        // Serviços com fotos
        if (secao.servicos && secao.servicos.length > 0) {
          doc.setFontSize(16);
          doc.setTextColor(52, 73, 94);
          doc.text('SERVIÇOS EXECUTADOS', 20, y);
          y += 15;
          
          for (const servico of secao.servicos) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`• ${servico.assunto}`, 20, y);
            y += 10;
            
            // Renderizar fotos do serviço
            if (servico.fotos && servico.fotos.length > 0) {
              const photosPerRow = 2;
              const photoWidth = (doc.internal.pageSize.getWidth() - 60) / photosPerRow;
              const photoHeight = photoWidth * 0.75;
              
              for (let i = 0; i < servico.fotos.length; i++) {
                const photo = servico.fotos[i];
                const col = i % photosPerRow;
                const row = Math.floor(i / photosPerRow);
                
                const x = 20 + col * (photoWidth + 20);
                const currentY = y + row * (photoHeight + 30);
                
                // Verificar se cabe na página
                if (currentY + photoHeight > doc.internal.pageSize.getHeight() - 30) {
                  doc.addPage();
                  y = 20;
                  continue;
                }
                
                try {
                  await addImageToPDF(doc, photo.url, x, currentY, photoWidth, photoHeight);
                  
                  // Legenda da foto
                  doc.setFontSize(10);
                  doc.setTextColor(0, 0, 0);
                  doc.text(photo.descricao || `Foto ${i + 1}`, x, currentY + photoHeight + 5);
                } catch (error) {
                  console.warn('⚠️ Erro ao renderizar foto:', error);
                }
              }
              
              y += Math.ceil(servico.fotos.length / photosPerRow) * (photoHeight + 30);
            }
            
            y += 10;
          }
        }
      }
    }
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Mutirão gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Mutirão:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Evidências usando jsPDF
 */
export async function generateEvidenciasJSPDF(dados: Relatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Evidências com jsPDF...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // CAPA ESTILIZADA
    const dataRelatorio = 'data' in dados ? dados.data : 
                         'dataInicio' in dados ? dados.dataInicio : 
                         'Não informado';
    const subRegiao = 'sub' in dados ? dados.sub : 'Não informado';
    const local = 'local' in dados ? dados.local : 'Não informado';
    
    createCoverPage(doc, 'RELATÓRIO DE EVIDÊNCIAS', dados.tipoServico || 'Serviço', [
      `Data: ${dataRelatorio !== 'Não informado' ? new Date(dataRelatorio).toLocaleDateString('pt-BR') : dataRelatorio}`,
      `Sub-região: ${subRegiao}`,
      `Local: ${local}`
    ]);
    
    // FOTOS COM RENDERIZAÇÃO
    if ('fotos' in dados && dados.fotos && dados.fotos.length > 0) {
      doc.addPage();
      
      // Cabeçalho da seção
      doc.setFillColor(52, 73, 94);
      doc.rect(20, 20, doc.internal.pageSize.getWidth() - 40, 15, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('EVIDÊNCIAS FOTOGRÁFICAS', 20, 30);
      
      const photosPerRow = 2;
      const photoWidth = (doc.internal.pageSize.getWidth() - 60) / photosPerRow;
      const photoHeight = photoWidth * 0.75;
      
      let y = 50;
      
      for (let i = 0; i < dados.fotos.length; i++) {
        const foto = dados.fotos[i];
        const col = i % photosPerRow;
        const row = Math.floor(i / photosPerRow);
        
        const x = 20 + col * (photoWidth + 20);
        const currentY = y + row * (photoHeight + 40);
        
        // Verificar se cabe na página
        if (currentY + photoHeight > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          y = 20;
          continue;
        }
        
        try {
          await addImageToPDF(doc, foto.url, x, currentY, photoWidth, photoHeight);
          
          // Legenda da foto
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Foto ${i + 1}`, x, currentY + photoHeight + 5);
          
          if (foto.descricao) {
            doc.setFontSize(10);
            doc.text(foto.descricao, x, currentY + photoHeight + 15);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao renderizar foto:', error);
        }
      }
    }
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Evidências gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Evidências:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Rotineiros usando jsPDF
 */
export async function generateRotineirosJSPDF(mesAno: string, rotineiros: RotineirosRelatorio[]): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Rotineiros com jsPDF...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // CAPA
    doc.setFontSize(24);
    doc.text('SERVIÇOS ROTINEIROS', 105, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text(mesAno.toUpperCase(), 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Total de Serviços: ${rotineiros.length}`, 105, 70, { align: 'center' });
    
    // LISTA DE SERVIÇOS
    doc.setFontSize(16);
    doc.text('LISTA DE SERVIÇOS', 20, 100);
    
    let y = 120;
    
    rotineiros.forEach((rotineiro, index) => {
      doc.setFontSize(14);
      doc.text(`${index + 1}. ${rotineiro.tipoServico || 'Serviço Rotineiro'}`, 20, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.text(`Data: ${new Date(rotineiro.data).toLocaleDateString('pt-BR')}`, 30, y);
      y += 8;
      
      doc.text(`Sub-região: ${rotineiro.sub || 'Não informado'}`, 30, y);
      y += 8;
      
      if (rotineiro.servicos && rotineiro.servicos.length > 0) {
        doc.text(`Serviços: ${rotineiro.servicos.length}`, 30, y);
        y += 8;
      }
      
      y += 10;
    });
    
    // RODAPÉ
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Rotineiros gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Rotineiros:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Monumentos usando jsPDF
 */
export async function generateMonumentosJSPDF(dados: MonumentosRelatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Monumentos com jsPDF...');
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // CAPA
    doc.setFontSize(24);
    doc.text('RELATÓRIO DE MONUMENTOS', 105, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text(`${dados.tipoServico || 'Monumentos'}`, 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}`, 105, 70, { align: 'center' });
    
    doc.text(`Sub-região: ${dados.sub || 'Não informado'}`, 105, 90, { align: 'center' });
    
    doc.text(`Monumento: ${dados.monumento || 'Não informado'}`, 105, 110, { align: 'center' });
    
    // INFORMAÇÕES DO MONUMENTO
    if (dados.local) {
      doc.setFontSize(16);
      doc.text('INFORMAÇÕES DO MONUMENTO', 20, 140);
      
      doc.setFontSize(12);
      doc.text(`Local: ${dados.local}`, 20, 160);
      
      if (dados.descricao) {
        doc.text(`Descrição: ${dados.descricao}`, 20, 180);
      }
    }
    
    // RODAPÉ
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
    
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    console.log('✅ PDF de Monumentos gerado com sucesso!');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Monumentos:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}
