/**
 * Gerador de PDF usando jsPDF (funciona no servidor)
 * 
 * Esta implementação usa jsPDF que funciona perfeitamente no servidor
 * sem precisar de Puppeteer ou PDFKit
 */

import { jsPDF } from 'jspdf';
import type { MutiraoRelatorio, Relatorio, RotineirosRelatorio, MonumentosRelatorio } from '@/lib/types';

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
    
    // CAPA
    doc.setFontSize(24);
    doc.text('RELATÓRIO DE MUTIRÃO', 105, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text(`Título: ${dados.title || 'Sem título'}`, 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}`, 105, 70, { align: 'center' });
    
    // Para MutiraoRelatorio, não temos subRegiao diretamente, mas temos nas seções
    const subRegioes = dados.secoes?.map(s => s.sub) || [];
    const subRegiaoTexto = subRegioes.length > 0 ? subRegioes.join(', ') : 'Não informado';
    
    doc.text(`Sub-regiões: ${subRegiaoTexto}`, 105, 90, { align: 'center' });
    
    // QUANTITATIVO
    if (dados.quantitativo && dados.quantitativo.length > 0) {
      doc.setFontSize(16);
      doc.text('QUANTITATIVO', 20, 120);
      
      doc.setFontSize(12);
      let y = 130;
      
      // Cabeçalho da tabela
      doc.text('Item', 20, y);
      doc.text('Quantidade', 80, y);
      doc.text('Unidade', 140, y);
      
      y += 10;
      
      // Linha separadora
      doc.line(20, y, 200, y);
      
      y += 10;
      
      // Dados da tabela
      dados.quantitativo.forEach((item, index) => {
        doc.text(item.descricao || `Item ${index + 1}`, 20, y);
        doc.text(item.quantidade?.toString() || '0', 80, y);
        doc.text(item.unidade || 'un', 140, y);
        y += 10;
      });
    }
    
    // SEÇÕES
    if (dados.secoes && dados.secoes.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('ATIVIDADES POR SUB-REGIÃO', 20, 30);
      
      let y = 50;
      
      dados.secoes.forEach((secao, secaoIndex) => {
        doc.setFontSize(14);
        doc.text(`${secaoIndex + 1}. ${secao.sub || 'Sub-região'}`, 20, y);
        y += 10;
        
        if (secao.local) {
          doc.setFontSize(12);
          doc.text(`Local: ${secao.local}`, 30, y);
          y += 8;
        }
        
        if (secao.descricao) {
          doc.setFontSize(12);
          doc.text(`Descrição: ${secao.descricao}`, 30, y);
          y += 8;
        }
        
        if (secao.servicos && secao.servicos.length > 0) {
          doc.setFontSize(12);
          doc.text(`Serviços executados: ${secao.servicos.length}`, 30, y);
          y += 8;
        }
        
        y += 10;
      });
    }
    
    // RODAPÉ
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
    
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
    
    // CAPA
    doc.setFontSize(24);
    doc.text('RELATÓRIO DE EVIDÊNCIAS', 105, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text(`${dados.tipoServico || 'Serviço'}`, 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    
    // Para Relatorio genérico, verificar se tem data ou dataInicio
    const dataRelatorio = 'data' in dados ? dados.data : 
                         'dataInicio' in dados ? dados.dataInicio : 
                         'Não informado';
    
    doc.text(`Data: ${dataRelatorio !== 'Não informado' ? new Date(dataRelatorio).toLocaleDateString('pt-BR') : dataRelatorio}`, 105, 70, { align: 'center' });
    
    // Para Relatorio genérico, verificar se tem sub
    const subRegiao = 'sub' in dados ? dados.sub : 'Não informado';
    
    doc.text(`Sub-região: ${subRegiao}`, 105, 90, { align: 'center' });
    
    // Para Relatorio genérico, verificar se tem local
    const local = 'local' in dados ? dados.local : 'Não informado';
    
    doc.text(`Local: ${local}`, 105, 110, { align: 'center' });
    
    // FOTOS
    if ('fotos' in dados && dados.fotos && dados.fotos.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('EVIDÊNCIAS FOTOGRÁFICAS', 20, 30);
      
      let y = 50;
      
      dados.fotos.forEach((foto: any, index: number) => {
        doc.setFontSize(14);
        doc.text(`Foto ${index + 1}`, 20, y);
        y += 10;
        
        if (foto.descricao) {
          doc.setFontSize(12);
          doc.text(`Descrição: ${foto.descricao}`, 30, y);
          y += 8;
        }
        
        if (foto.url) {
          doc.setFontSize(10);
          doc.text(`URL: ${foto.url}`, 30, y);
          y += 8;
        }
        
        y += 10;
      });
    }
    
    // RODAPÉ
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 280);
    
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
