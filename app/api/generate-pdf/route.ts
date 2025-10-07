/**
 * API para Geração de PDFs - Endpoint Unificado
 * 
 * Este arquivo centraliza toda a geração de PDFs da aplicação.
 * Suporta diferentes tipos de relatórios com templates específicos.
 * 
 * Tipos suportados:
 * - mutirao: Relatórios de mutirão (individual ou consolidado)
 * - registro: Registros fotográficos (acumulador, desfazimento, etc.)
 * - evidencias: Evidências fotográficas
 * - unified: Relatórios unificados (revitalização, etc.)
 * 
 * NOVA IMPLEMENTAÇÃO: Usando jsPDF + html2canvas para melhor compatibilidade com servidores
 */

import { NextRequest, NextResponse } from 'next/server';

// Importações dos geradores de PDF específicos (Puppeteer - mantidos para compatibilidade)
import { exportMutiraoPdf, exportRegistroPdf } from '@/lib/pdf/mutirao-modern';
import { exportEvidenciasPdf } from '@/lib/pdf/evidencias-modern';
import { exportUnifiedPdf } from '@/lib/pdf/relatorios-modern';
import { generateMonumentosHTML } from '@/lib/pdf/monumentos-modern';
import { exportEvidenciasRotineirosPdf } from '@/lib/pdf/rotineiros-modern';

// IMPLEMENTAÇÃO SEM PUPPETEER: Usar jsPDF (funciona no servidor)
import { 
  generateMutiraoJSPDF, 
  generateEvidenciasJSPDF, 
  generateRotineirosJSPDF, 
  generateMonumentosJSPDF 
} from '@/lib/pdf-generator-jspdf-server';

// Importações para geração de nomes de arquivos
import { generateFileName, generateConsolidatedFileName } from '@/lib/filename-generator';

// Configuração centralizada do Puppeteer (mantida para fallback)
import { generatePDFFromHTML } from '@/lib/puppeteer-config';

// Tipos TypeScript
import type { MutiraoRelatorio, RegistroRelatorio, ReportSummary, Relatorio, MonumentosRelatorio, RotineirosRelatorio } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, dados, consolidated, useJSPDF = true } = body;

    console.log('📊 PDF Request:', { tipo, dados: dados?.tipoServico, consolidated, useJSPDF });

    // Validação básica
    if (!tipo || !dados) {
      console.error('❌ Validação falhou:', { tipo, dados: !!dados });
      return NextResponse.json({ error: 'Tipo e dados são obrigatórios' }, { status: 400 });
    }

    let pdfBuffer: Buffer | Uint8Array;
    let fileName: string;

    // ========================================
    // ROTEAMENTO POR TIPO DE RELATÓRIO
    // ========================================

    // IMPLEMENTAÇÃO SEM PUPPETEER: Usar jsPDF (funciona no servidor)
    console.log('🚀 Usando jsPDF (sem Puppeteer)...');
    
    // Verificar se os dados estão corretos
    console.log('📊 Dados recebidos:', JSON.stringify(dados, null, 2));
    
    if (!dados || typeof dados !== 'object') {
      console.error('❌ Dados inválidos:', dados);
      return NextResponse.json({ error: 'Dados do relatório inválidos' }, { status: 400 });
    }
    
    switch (tipo) {
      case 'mutirao':
        console.log('🔄 Processando mutirão...');
        // Verificar se tem os campos necessários
        if (!dados.tipoServico || !dados.data) {
          console.error('❌ Dados do mutirão incompletos:', dados);
          return NextResponse.json({ error: 'Dados do mutirão incompletos' }, { status: 400 });
        }
        
        pdfBuffer = await generateMutiraoJSPDF(dados as MutiraoRelatorio);
        fileName = consolidated 
          ? generateConsolidatedFileName(dados.data)
          : generateFileName(dados as MutiraoRelatorio);
        break;

      case 'evidencias':
        console.log('🔄 Processando evidências...', dados.tipoServico);
        // Verificar se tem os campos necessários
        if (!dados.tipoServico || (!dados.data && !dados.dataInicio)) {
          console.error('❌ Dados das evidências incompletos:', dados);
          return NextResponse.json({ error: 'Dados das evidências incompletos' }, { status: 400 });
        }
        
        pdfBuffer = await generateEvidenciasJSPDF(dados as Relatorio);
        fileName = generateFileName(dados as Relatorio);
        break;

      case 'rotineiros':
        console.log('🔄 Processando serviços rotineiros...');
        // Verificar se tem os campos necessários
        if (!dados.data) {
          console.error('❌ Dados dos rotineiros incompletos:', dados);
          return NextResponse.json({ error: 'Dados dos rotineiros incompletos' }, { status: 400 });
        }
        
        const dataFormatada = new Date(dados.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        pdfBuffer = await generateRotineirosJSPDF(dataFormatada, [dados as RotineirosRelatorio]);
        fileName = generateFileName(dados as RotineirosRelatorio);
        break;

      case 'monumentos':
        console.log('🔄 Processando monumentos...');
        // Verificar se tem os campos necessários
        if (!dados.tipoServico || !dados.data) {
          console.error('❌ Dados dos monumentos incompletos:', dados);
          return NextResponse.json({ error: 'Dados dos monumentos incompletos' }, { status: 400 });
        }
        
        pdfBuffer = await generateMonumentosJSPDF(dados as MonumentosRelatorio);
        fileName = generateFileName(dados as MonumentosRelatorio);
        break;

      case 'registro':
      case 'unified':
        console.log(`🔄 Processando ${tipo}...`);
        // Verificar se tem os campos necessários
        if (!dados.tipoServico || (!dados.data && !dados.dataInicio)) {
          console.error(`❌ Dados do ${tipo} incompletos:`, dados);
          return NextResponse.json({ error: `Dados do ${tipo} incompletos` }, { status: 400 });
        }
        
        // Para tipos que ainda não têm versão jsPDF específica, usar evidências
        pdfBuffer = await generateEvidenciasJSPDF(dados as Relatorio);
        fileName = generateFileName(dados as Relatorio);
        break;

      default:
        console.error('❌ Tipo inválido:', tipo);
        return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 });
    }

    // ========================================
    // RESPOSTA COM PDF GERADO
    // ========================================

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // Usa UTF-8 encoding para suportar caracteres especiais nos nomes
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}.pdf`,
      },
    });

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Erro interno do servidor ao gerar PDF', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
