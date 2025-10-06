/**
 * Geradores de HTML otimizados para jsPDF
 * 
 * Estas funções mantêm toda a qualidade visual dos relatórios originais,
 * mas são otimizadas para funcionar perfeitamente com jsPDF + html2canvas
 */

import { getImageUrls } from "./image-loader";
import type { Relatorio, MutiraoRelatorio, RegistroRelatorio, MonumentosRelatorio, RotineirosRelatorio } from '@/lib/types';

/**
 * CSS base otimizado para jsPDF
 */
const JSPDF_BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    background: white;
    margin: 0;
    padding: 0;
  }
  
  .page {
    width: 297mm;
    min-height: 210mm;
    position: relative;
    overflow: hidden;
    background: white;
    margin: 0;
    padding: 0;
  }
  
  .page:not(:last-child) {
    margin-bottom: 0;
  }
  
  /* Garantir que as imagens sejam carregadas */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  /* Otimizações para jsPDF */
  .cover-page,
  .service-page,
  .content-page {
    width: 100%;
    height: 100%;
    position: relative;
  }
`;

/**
 * Função para gerar HTML de evidências otimizado para jsPDF
 */
export function generateEvidenciasHTMLJSPDF(rel: Relatorio): string {
  const images = getImageUrls();
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Evidências</title>
    <style>
        ${JSPDF_BASE_CSS}
        
        /* CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${images.cover}') center/cover no-repeat;
            z-index: 1;
        }
        
        .cover-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 200px;
            height: 200px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 2;
        }
        
        .cover-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
            padding: 40px;
        }
        
        .cover-title {
            font-family: 'Anton', sans-serif;
            font-size: 48px;
            font-weight: 400;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }
        
        .cover-subtitle {
            font-size: 24px;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        
        .cover-info {
            font-size: 18px;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        
        /* PÁGINAS DE CONTEÚDO */
        .content-page {
            padding: 30px;
            background: white;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        
        .page-title {
            font-family: 'Anton', sans-serif;
            font-size: 32px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .page-subtitle {
            font-size: 18px;
            color: #666;
        }
        
        .photos-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .photo-item {
            text-align: center;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        
        .photo-item img {
            width: 100%;
            max-width: 200px;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .photo-caption {
            font-size: 12px;
            color: #666;
            font-weight: bold;
        }
        
        .photo-description {
            font-size: 11px;
            color: #888;
            margin-top: 5px;
        }
        
        /* Informações do relatório */
        .report-info {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .info-label {
            font-weight: bold;
            color: #333;
        }
        
        .info-value {
            color: #666;
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE EVIDÊNCIAS</h1>
            <h2 class="cover-subtitle">${rel.tipoServico.toUpperCase()}</h2>
            <div class="cover-info">Data: ${new Date(rel.data).toLocaleDateString('pt-BR')}</div>
            <div class="cover-info">Sub-região: ${rel.subRegiao}</div>
            <div class="cover-info">Responsável: ${rel.responsavel}</div>
        </div>
    </div>
    
    <!-- PÁGINAS DE CONTEÚDO -->
    ${rel.evidencias && rel.evidencias.length > 0 ? `
    <div class="page content-page">
        <div class="page-header">
            <h2 class="page-title">EVIDÊNCIAS FOTOGRÁFICAS</h2>
            <p class="page-subtitle">Registro visual das atividades realizadas</p>
        </div>
        
        <div class="photos-grid">
            ${rel.evidencias.map((evidencia, index) => `
                <div class="photo-item">
                    <img src="${evidencia.url}" alt="Evidência ${index + 1}" />
                    <div class="photo-caption">Evidência ${index + 1}</div>
                    <div class="photo-description">${evidencia.descricao || 'Sem descrição'}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="report-info">
            <div class="info-row">
                <span class="info-label">Total de Evidências:</span>
                <span class="info-value">${rel.evidencias.length}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Data do Relatório:</span>
                <span class="info-value">${new Date(rel.data).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Responsável:</span>
                <span class="info-value">${rel.responsavel}</span>
            </div>
        </div>
    </div>
    ` : ''}
</body>
</html>
`;
}

/**
 * Função para gerar HTML de mutirão otimizado para jsPDF
 */
export function generateMutiraoHTMLJSPDF(rel: MutiraoRelatorio): string {
  const images = getImageUrls();
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Mutirão</title>
    <style>
        ${JSPDF_BASE_CSS}
        
        /* CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${images.cover}') center/cover no-repeat;
            z-index: 1;
        }
        
        .cover-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 200px;
            height: 200px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 2;
        }
        
        .cover-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
            padding: 40px;
        }
        
        .cover-title {
            font-family: 'Anton', sans-serif;
            font-size: 48px;
            font-weight: 400;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }
        
        .cover-subtitle {
            font-size: 24px;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        
        .cover-info {
            font-size: 18px;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        
        /* PÁGINAS DE CONTEÚDO */
        .content-page {
            padding: 30px;
            background: white;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        
        .page-title {
            font-family: 'Anton', sans-serif;
            font-size: 32px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .page-subtitle {
            font-size: 18px;
            color: #666;
        }
        
        /* Informações do mutirão */
        .mutirao-info {
            background: #f0f0f0;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .info-label {
            font-weight: bold;
            color: #333;
        }
        
        .info-value {
            color: #666;
        }
        
        /* Lista de atividades */
        .activities-list {
            margin-top: 20px;
        }
        
        .activity-item {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        
        .activity-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        
        .activity-description {
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">RELATÓRIO DE MUTIRÃO</h1>
            <h2 class="cover-subtitle">SELIMP</h2>
            <div class="cover-info">Data: ${new Date(rel.data).toLocaleDateString('pt-BR')}</div>
            <div class="cover-info">Sub-região: ${rel.subRegiao}</div>
            <div class="cover-info">Responsável: ${rel.responsavel}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE CONTEÚDO -->
    <div class="page content-page">
        <div class="page-header">
            <h2 class="page-title">INFORMAÇÕES DO MUTIRÃO</h2>
            <p class="page-subtitle">Detalhes das atividades realizadas</p>
        </div>
        
        <div class="mutirao-info">
            <div class="info-row">
                <span class="info-label">Data:</span>
                <span class="info-value">${new Date(rel.data).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Sub-região:</span>
                <span class="info-value">${rel.subRegiao}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Responsável:</span>
                <span class="info-value">${rel.responsavel}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Equipe:</span>
                <span class="info-value">${rel.equipe || 'Não informado'}</span>
            </div>
        </div>
        
        ${rel.atividades && rel.atividades.length > 0 ? `
        <div class="activities-list">
            <h3 style="margin-bottom: 15px; color: #333;">Atividades Realizadas:</h3>
            ${rel.atividades.map((atividade, index) => `
                <div class="activity-item">
                    <div class="activity-title">${index + 1}. ${atividade.titulo || 'Atividade'}</div>
                    <div class="activity-description">${atividade.descricao || 'Sem descrição'}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>
`;
}

/**
 * Função para gerar HTML de rotineiros otimizado para jsPDF
 */
export function generateRotineirosHTMLJSPDF(mesAno: string, rotineiros: RotineirosRelatorio[]): string {
  const images = getImageUrls();
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Serviços Rotineiros</title>
    <style>
        ${JSPDF_BASE_CSS}
        
        /* CAPA */
        .cover-page {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .cover-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('${images.cover}') center/cover no-repeat;
            z-index: 1;
        }
        
        .cover-logo {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 200px;
            height: 200px;
            background: url('${images.logo}') center/contain no-repeat;
            z-index: 2;
        }
        
        .cover-content {
            position: relative;
            z-index: 2;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
            padding: 40px;
        }
        
        .cover-title {
            font-family: 'Anton', sans-serif;
            font-size: 48px;
            font-weight: 400;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
        }
        
        .cover-subtitle {
            font-size: 24px;
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        
        .cover-info {
            font-size: 18px;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        
        /* PÁGINAS DE CONTEÚDO */
        .content-page {
            padding: 30px;
            background: white;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        
        .page-title {
            font-family: 'Anton', sans-serif;
            font-size: 32px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .page-subtitle {
            font-size: 18px;
            color: #666;
        }
        
        /* Lista de serviços */
        .services-list {
            margin-top: 20px;
        }
        
        .service-item {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        
        .service-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .service-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }
        
        .info-value {
            color: #666;
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <div class="cover-background"></div>
        <div class="cover-logo"></div>
        <div class="cover-content">
            <h1 class="cover-title">SERVIÇOS ROTINEIROS</h1>
            <h2 class="cover-subtitle">${mesAno.toUpperCase()}</h2>
            <div class="cover-info">Total de Serviços: ${rotineiros.length}</div>
        </div>
    </div>
    
    <!-- PÁGINA DE CONTEÚDO -->
    <div class="page content-page">
        <div class="page-header">
            <h2 class="page-title">LISTA DE SERVIÇOS</h2>
            <p class="page-subtitle">Serviços realizados em ${mesAno}</p>
        </div>
        
        <div class="services-list">
            ${rotineiros.map((rotineiro, index) => `
                <div class="service-item">
                    <div class="service-title">${index + 1}. ${rotineiro.tipoServico || 'Serviço Rotineiro'}</div>
                    <div class="service-info">
                        <div class="info-item">
                            <span class="info-label">Data:</span>
                            <span class="info-value">${new Date(rotineiro.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Sub-região:</span>
                            <span class="info-value">${rotineiro.subRegiao || 'Não informado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Responsável:</span>
                            <span class="info-value">${rotineiro.responsavel || 'Não informado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status:</span>
                            <span class="info-value">${rotineiro.status || 'Concluído'}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
`;
}
