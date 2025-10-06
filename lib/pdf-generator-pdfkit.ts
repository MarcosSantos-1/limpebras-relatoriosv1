/**
 * Gerador de PDF usando PDFKit (funciona no servidor)
 * 
 * Esta implementação usa PDFKit que funciona perfeitamente no servidor
 * sem precisar de Puppeteer ou jsPDF
 */

import PDFDocument from 'pdfkit';
import type { MutiraoRelatorio, Relatorio, RotineirosRelatorio, MonumentosRelatorio } from '@/lib/types';

/**
 * Configurações para geração de PDF
 */
const PDF_CONFIG = {
  size: 'A4' as const,
  layout: 'landscape' as const,
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }
};

/**
 * Função para gerar PDF de Mutirão usando PDFKit
 */
export async function generateMutiraoPDFKit(dados: MutiraoRelatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Mutirão com PDFKit...');
    
    const doc = new PDFDocument({
      size: PDF_CONFIG.size,
      layout: PDF_CONFIG.layout,
      margins: PDF_CONFIG.margins
    });
    
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log('✅ PDF de Mutirão gerado com sucesso!');
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
      
      // CAPA
      doc.fontSize(24)
         .text('RELATÓRIO DE MUTIRÃO', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(18)
         .text(`Título: ${dados.title || 'Sem título'}`, { align: 'center' });
      
      doc.moveDown(1);
      
      doc.fontSize(14)
         .text(`Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}`, { align: 'center' });
      
      doc.moveDown(1);
      
      // Para MutiraoRelatorio, não temos subRegiao diretamente, mas temos nas seções
      const subRegioes = dados.secoes?.map(s => s.sub) || [];
      const subRegiaoTexto = subRegioes.length > 0 ? subRegioes.join(', ') : 'Não informado';
      
      doc.fontSize(14)
         .text(`Sub-regiões: ${subRegiaoTexto}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // QUANTITATIVO
      if (dados.quantitativo && dados.quantitativo.length > 0) {
        doc.fontSize(16)
           .text('QUANTITATIVO', { underline: true });
        
        doc.moveDown(0.5);
        
        // Cabeçalho da tabela
        doc.fontSize(12)
           .text('Item', 50, doc.y)
           .text('Quantidade', 200, doc.y)
           .text('Unidade', 300, doc.y);
        
        doc.moveDown(0.5);
        
        // Linha separadora
        doc.moveTo(50, doc.y)
           .lineTo(350, doc.y)
           .stroke();
        
        doc.moveDown(0.3);
        
        // Dados da tabela
        dados.quantitativo.forEach((item, index) => {
          doc.text(item.descricao || `Item ${index + 1}`, 50, doc.y)
             .text(item.quantidade?.toString() || '0', 200, doc.y)
             .text(item.unidade || 'un', 300, doc.y);
          
          doc.moveDown(0.4);
        });
        
        doc.moveDown(1);
      }
      
      // SEÇÕES
      if (dados.secoes && dados.secoes.length > 0) {
        doc.fontSize(16)
           .text('ATIVIDADES POR SUB-REGIÃO', { underline: true });
        
        doc.moveDown(0.5);
        
        dados.secoes.forEach((secao, secaoIndex) => {
          doc.fontSize(14)
             .text(`${secaoIndex + 1}. ${secao.sub || 'Sub-região'}`, { underline: true });
          
          doc.moveDown(0.3);
          
          if (secao.local) {
            doc.fontSize(12)
               .text(`Local: ${secao.local}`, 70, doc.y);
            
            doc.moveDown(0.2);
          }
          
          if (secao.descricao) {
            doc.fontSize(12)
               .text(`Descrição: ${secao.descricao}`, 70, doc.y);
            
            doc.moveDown(0.3);
          }
          
          if (secao.servicos && secao.servicos.length > 0) {
            doc.fontSize(12)
               .text(`Serviços executados: ${secao.servicos.length}`, 70, doc.y);
            
            doc.moveDown(0.2);
          }
          
          doc.moveDown(0.5);
        });
      }
      
      // RODAPÉ
      doc.fontSize(10)
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, doc.page.height - 100);
      
      doc.end();
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Mutirão:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Evidências usando PDFKit
 */
export async function generateEvidenciasPDFKit(dados: Relatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Evidências com PDFKit...');
    
    const doc = new PDFDocument({
      size: PDF_CONFIG.size,
      layout: PDF_CONFIG.layout,
      margins: PDF_CONFIG.margins
    });
    
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log('✅ PDF de Evidências gerado com sucesso!');
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
      
      // CAPA
      doc.fontSize(24)
         .text('RELATÓRIO DE EVIDÊNCIAS', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(18)
         .text(`${dados.tipoServico || 'Serviço'}`, { align: 'center' });
      
      doc.moveDown(1);
      
      doc.fontSize(14)
         .text(`Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}`, { align: 'center' });
      
      doc.moveDown(1);
      
      // Para Relatorio genérico, verificar se tem sub
      const subRegiao = 'sub' in dados ? dados.sub : 'Não informado';
      
      doc.fontSize(14)
         .text(`Sub-região: ${subRegiao}`, { align: 'center' });
      
      doc.moveDown(1);
      
      // Para Relatorio genérico, verificar se tem local
      const local = 'local' in dados ? dados.local : 'Não informado';
      
      doc.fontSize(14)
         .text(`Local: ${local}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // FOTOS
      if ('fotos' in dados && dados.fotos && dados.fotos.length > 0) {
        doc.fontSize(16)
           .text('FOTOS', { underline: true });
        
        doc.moveDown(0.5);
        
        dados.fotos.forEach((foto, index) => {
          doc.fontSize(14)
             .text(`Foto ${index + 1}`, { underline: true });
          
          doc.moveDown(0.3);
          
          if (foto.descricao) {
            doc.fontSize(12)
               .text(`Descrição: ${foto.descricao}`);
            
            doc.moveDown(0.3);
          }
          
          if (foto.url) {
            doc.fontSize(10)
               .text(`URL: ${foto.url}`);
            
            doc.moveDown(0.5);
          }
        });
      }
      
      // RODAPÉ
      doc.fontSize(10)
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, doc.page.height - 100);
      
      doc.end();
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Evidências:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Rotineiros usando PDFKit
 */
export async function generateRotineirosPDFKit(mesAno: string, rotineiros: RotineirosRelatorio[]): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Rotineiros com PDFKit...');
    
    const doc = new PDFDocument({
      size: PDF_CONFIG.size,
      layout: PDF_CONFIG.layout,
      margins: PDF_CONFIG.margins
    });
    
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log('✅ PDF de Rotineiros gerado com sucesso!');
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
      
      // CAPA
      doc.fontSize(24)
         .text('SERVIÇOS ROTINEIROS', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(18)
         .text(mesAno.toUpperCase(), { align: 'center' });
      
      doc.moveDown(1);
      
      doc.fontSize(14)
         .text(`Total de Serviços: ${rotineiros.length}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // LISTA DE SERVIÇOS
      doc.fontSize(16)
         .text('LISTA DE SERVIÇOS', { underline: true });
      
      doc.moveDown(0.5);
      
      rotineiros.forEach((rotineiro, index) => {
        doc.fontSize(14)
           .text(`${index + 1}. ${rotineiro.tipoServico || 'Serviço Rotineiro'}`, { underline: true });
        
        doc.moveDown(0.3);
        
        doc.fontSize(12)
           .text(`Data: ${new Date(rotineiro.data).toLocaleDateString('pt-BR')}`, 70, doc.y);
        
        doc.moveDown(0.2);
        
        doc.fontSize(12)
           .text(`Sub-região: ${rotineiro.sub || 'Não informado'}`, 70, doc.y);
        
        doc.moveDown(0.2);
        
        if (rotineiro.servicos && rotineiro.servicos.length > 0) {
          doc.fontSize(12)
             .text(`Serviços: ${rotineiro.servicos.length}`, 70, doc.y);
          
          doc.moveDown(0.2);
        }
        
        doc.moveDown(0.5);
      });
      
      // RODAPÉ
      doc.fontSize(10)
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, doc.page.height - 100);
      
      doc.end();
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Rotineiros:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Função para gerar PDF de Monumentos usando PDFKit
 */
export async function generateMonumentosPDFKit(dados: MonumentosRelatorio): Promise<Buffer> {
  try {
    console.log('🔄 Gerando PDF de Monumentos com PDFKit...');
    
    const doc = new PDFDocument({
      size: PDF_CONFIG.size,
      layout: PDF_CONFIG.layout,
      margins: PDF_CONFIG.margins
    });
    
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log('✅ PDF de Monumentos gerado com sucesso!');
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
      
      // CAPA
      doc.fontSize(24)
         .text('RELATÓRIO DE MONUMENTOS', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(18)
         .text(`${dados.tipoServico || 'Monumentos'}`, { align: 'center' });
      
      doc.moveDown(1);
      
      doc.fontSize(14)
         .text(`Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}`, { align: 'center' });
      
      doc.moveDown(1);
      
      doc.fontSize(14)
         .text(`Sub-região: ${dados.sub || 'Não informado'}`, { align: 'center' });
      
      doc.moveDown(1);
      
      doc.fontSize(14)
         .text(`Monumento: ${dados.monumento || 'Não informado'}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // INFORMAÇÕES DO MONUMENTO
      if (dados.local) {
        doc.fontSize(16)
           .text('INFORMAÇÕES DO MONUMENTO', { underline: true });
        
        doc.moveDown(0.5);
        
        doc.fontSize(12)
           .text(`Local: ${dados.local}`);
        
        doc.moveDown(0.3);
        
        if (dados.descricao) {
          doc.fontSize(12)
             .text(`Descrição: ${dados.descricao}`);
          
          doc.moveDown(0.5);
        }
      }
      
      // RODAPÉ
      doc.fontSize(10)
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, doc.page.height - 100);
      
      doc.end();
    });
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF de Monumentos:', error);
    throw new Error(`Falha na geração de PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}