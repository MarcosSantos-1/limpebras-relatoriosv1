// Teste simples para verificar se o PDFKit está funcionando
import PDFDocument from 'pdfkit';

export async function testPDFKit(): Promise<Buffer> {
  try {
    console.log('🔄 Testando PDFKit...');
    
    const doc = new PDFDocument();
    
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        console.log('✅ PDFKit funcionando!');
        resolve(pdfBuffer);
      });
      
      doc.on('error', (error) => {
        console.error('❌ Erro no PDFKit:', error);
        reject(error);
      });
      
      // Conteúdo simples
      doc.fontSize(24)
         .text('TESTE PDFKIT', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(16)
         .text('Este é um teste simples do PDFKit', { align: 'center' });
      
      doc.end();
    });
    
  } catch (error) {
    console.error('❌ Erro no teste PDFKit:', error);
    throw error;
  }
}
