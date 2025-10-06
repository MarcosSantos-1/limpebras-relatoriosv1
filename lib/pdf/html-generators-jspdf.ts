/**
 * Geradores de HTML otimizados para jsPDF
 * 
 * Estas funções geram HTML otimizado para conversão em PDF usando jsPDF + html2canvas
 */

import type { MutiraoRelatorio, Relatorio, RotineirosRelatorio } from '@/lib/types';

/**
 * CSS base otimizado para jsPDF
 */
const JSPDF_BASE_CSS = `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background: white;
    }
    
    .page {
        width: 100%;
        min-height: 100vh;
        padding: 20px;
        page-break-after: always;
    }
    
    .page:last-child {
        page-break-after: avoid;
    }
    
    h1, h2, h3 {
        color: #2c3e50;
        margin-bottom: 15px;
    }
    
    h1 {
        font-size: 24px;
        text-align: center;
    }
    
    h2 {
        font-size: 18px;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
    }
    
    h3 {
        font-size: 16px;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    
    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }
    
    th {
        background-color: #f8f9fa;
        font-weight: bold;
    }
    
    .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .photo-item {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: white;
    }
    
    .photo-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
    }
    
    .photo-caption {
        padding: 10px;
        background: #f8f9fa;
        font-weight: bold;
        font-size: 14px;
    }
    
    .photo-description {
        padding: 10px;
        font-size: 12px;
        color: #666;
    }
    
    .info-section {
        background: #f8f9fa;
        padding: 15px;
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
`;

/**
 * Função para gerar HTML de evidências otimizado para jsPDF
 */
export function generateEvidenciasHTMLJSPDF(rel: Relatorio): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Evidências</title>
    <style>
        ${JSPDF_BASE_CSS}
        
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .cover-title {
            font-size: 32px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .cover-info {
            font-size: 16px;
            margin-bottom: 10px;
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <h1 class="cover-title">RELATÓRIO DE EVIDÊNCIAS</h1>
        <h2 class="cover-subtitle">${rel.tipoServico.toUpperCase()}</h2>
        <div class="cover-info">Data: ${'data' in rel ? new Date(rel.data).toLocaleDateString('pt-BR') : 'dataInicio' in rel ? new Date(rel.dataInicio).toLocaleDateString('pt-BR') : 'Não informado'}</div>
        <div class="cover-info">Sub-região: ${'sub' in rel ? rel.sub : 'Não informado'}</div>
        <div class="cover-info">Local: ${'local' in rel ? rel.local : 'Não informado'}</div>
    </div>
    
    <!-- PÁGINAS DE CONTEÚDO -->
    ${'fotos' in rel && rel.fotos && rel.fotos.length > 0 ? `
    <div class="page">
        <h2>EVIDÊNCIAS FOTOGRÁFICAS</h2>
        <p>Registro visual das atividades realizadas</p>
        
        <div class="photo-grid">
            ${rel.fotos.map((foto: any, index: number) => `
                <div class="photo-item">
                    <img src="${foto.url}" alt="Evidência ${index + 1}" />
                    <div class="photo-caption">Evidência ${index + 1}</div>
                    <div class="photo-description">${foto.descricao || 'Sem descrição'}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Total de Evidências:</span>
                <span class="info-value">${rel.fotos.length}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Data do Relatório:</span>
                <span class="info-value">${'data' in rel ? new Date(rel.data).toLocaleDateString('pt-BR') : 'dataInicio' in rel ? new Date(rel.dataInicio).toLocaleDateString('pt-BR') : 'Não informado'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Local:</span>
                <span class="info-value">${'local' in rel ? rel.local : 'Não informado'}</span>
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
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Mutirão</title>
    <style>
        ${JSPDF_BASE_CSS}
        
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .cover-title {
            font-size: 32px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .cover-info {
            font-size: 16px;
            margin-bottom: 10px;
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .quantitative-table {
            margin-bottom: 30px;
        }
        
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f9f9f9;
        }
        
        .section-title {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <h1 class="cover-title">RELATÓRIO DE MUTIRÃO</h1>
        <h2 class="cover-subtitle">${rel.title || 'Sem título'}</h2>
        <div class="cover-info">Data: ${new Date(rel.data).toLocaleDateString('pt-BR')}</div>
        <div class="cover-info">Sub-regiões: ${rel.secoes?.map(s => s.sub).join(', ') || 'Não informado'}</div>
    </div>
    
    <!-- QUANTITATIVO -->
    ${rel.quantitativo && rel.quantitativo.length > 0 ? `
    <div class="page">
        <h2>QUANTITATIVO</h2>
        <table class="quantitative-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                </tr>
            </thead>
            <tbody>
                ${rel.quantitativo.map((item, index) => `
                    <tr>
                        <td>${item.descricao || `Item ${index + 1}`}</td>
                        <td>${item.quantidade || 0}</td>
                        <td>${item.unidade || 'un'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}
    
    <!-- SEÇÕES POR SUB-REGIÃO -->
    ${rel.secoes && rel.secoes.length > 0 ? `
    <div class="page">
        <h2>ATIVIDADES POR SUB-REGIÃO</h2>
        ${rel.secoes.map((secao, secaoIndex) => `
            <div class="section">
                <h3 class="section-title">${secaoIndex + 1}. ${secao.sub || 'Sub-região'}</h3>
                ${secao.local ? `<p><strong>Local:</strong> ${secao.local}</p>` : ''}
                ${secao.descricao ? `<p><strong>Descrição:</strong> ${secao.descricao}</p>` : ''}
                ${secao.servicos && secao.servicos.length > 0 ? `
                    <p><strong>Serviços executados:</strong> ${secao.servicos.length}</p>
                    <ul>
                        ${secao.servicos.map(servico => `<li>${servico.assunto}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
`;
}

/**
 * Função para gerar HTML de rotineiros otimizado para jsPDF
 */
export function generateRotineirosHTMLJSPDF(mesAno: string, rotineiros: RotineirosRelatorio[]): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serviços Rotineiros</title>
    <style>
        ${JSPDF_BASE_CSS}
        
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .cover-title {
            font-size: 32px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        
        .cover-info {
            font-size: 16px;
            margin-bottom: 10px;
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        
        .service-item {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f9f9f9;
        }
        
        .service-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .service-info {
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <!-- PÁGINA DE CAPA -->
    <div class="page cover-page">
        <h1 class="cover-title">SERVIÇOS ROTINEIROS</h1>
        <h2 class="cover-subtitle">${mesAno.toUpperCase()}</h2>
        <div class="cover-info">Total de Serviços: ${rotineiros.length}</div>
    </div>
    
    <!-- LISTA DE SERVIÇOS -->
    <div class="page">
        <h2>LISTA DE SERVIÇOS</h2>
        ${rotineiros.map((rotineiro, index) => `
            <div class="service-item">
                <div class="service-title">${index + 1}. ${rotineiro.tipoServico || 'Serviço Rotineiro'}</div>
                <div class="service-info">
                    <p><strong>Data:</strong> ${new Date(rotineiro.data).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Sub-região:</strong> ${rotineiro.sub || 'Não informado'}</p>
                    ${rotineiro.servicos && rotineiro.servicos.length > 0 ? `
                        <p><strong>Serviços:</strong> ${rotineiro.servicos.length}</p>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
`;
}
