# 📊 Sistema de Relatórios - Sem Puppeteer

## 🎯 Sobre o Projeto

Sistema completo de geração de relatórios em PDF **SEM PUPPETEER**, usando apenas **PDFKit** para máxima compatibilidade com servidores como Vercel, Render, etc.

## ✨ Principais Características

- 🚫 **ZERO PUPPETEER** - Não usa Puppeteer em lugar nenhum
- ⚡ **PDFKit** - Biblioteca leve que funciona perfeitamente no servidor
- 🚀 **Deploy rápido** - Sem dependências pesadas
- 🎨 **PDFs estruturados** - Com capa, conteúdo organizado e rodapé
- 📱 **Responsivo** - Interface moderna e intuitiva
- 🔒 **Seguro** - Validação completa de dados

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **PDFKit** - Geração de PDFs no servidor
- **Tailwind CSS** - Estilização
- **Firebase** - Backend e autenticação

## 📋 Tipos de Relatórios Suportados

- ✅ **Mutirão** - Com quantitativo e atividades por sub-região
- ✅ **Evidências** - Com lista de evidências fotográficas
- ✅ **Rotineiros** - Com lista de serviços realizados
- ✅ **Monumentos** - Com informações do monumento
- ✅ **Registro/Unified** - Relatórios unificados

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/MarcosSantos-1/limpebras-relatoriosv1.git

# Entre no diretório
cd limpebras-relatoriosv1

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Acesso
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
relatorios-app/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   │   └── generate-pdf/  # Endpoint de geração de PDF
│   └── relatorios/        # Páginas de relatórios
├── lib/                   # Bibliotecas e utilitários
│   ├── pdf/               # Geradores de PDF
│   │   └── pdf-generator-pdfkit.ts  # Implementação com PDFKit
│   └── types.ts           # Tipos TypeScript
└── components/            # Componentes React
```

## 🔧 API de Geração de PDF

### Endpoint
```
POST /api/generate-pdf
```

### Parâmetros
```json
{
  "tipo": "mutirao|evidencias|rotineiros|monumentos|registro|unified",
  "dados": {
    "id": "string",
    "tipoServico": "string",
    "data": "string",
    "subRegiao": "string",
    "responsavel": "string",
    // ... outros campos específicos do tipo
  }
}
```

### Resposta
Retorna um arquivo PDF pronto para download.

## 🎨 Exemplo de Uso

```typescript
// Exemplo de dados para Mutirão
const dadosMutirao = {
  id: 'mutirao-123',
  tipoServico: 'MUTIRAO',
  title: 'Mutirão de Limpeza',
  data: '2024-01-15',
  subRegiao: 'Sub-região Sul',
  responsavel: 'João Silva',
  quantitativo: [
    { item: 'Sacos de lixo', quantidade: 50, unidade: 'un' },
    { item: 'Material de limpeza', quantidade: 10, unidade: 'kg' }
  ],
  secoes: [
    {
      subRegiao: 'Sul',
      atividades: [
        { titulo: 'Limpeza de ruas', descricao: 'Remoção de lixo das ruas principais' }
      ]
    }
  ]
};

// Chamada da API
const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    tipo: 'mutirao', 
    dados: dadosMutirao 
  }),
});

const pdfBlob = await response.blob();
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça o deploy
vercel
```

### Render
```bash
# Conecte o repositório no Render
# Configure as variáveis de ambiente
# Deploy automático
```

## 🔍 Vantagens da Implementação

### ❌ Problemas Resolvidos
- **Puppeteer pesado** - Substituído por PDFKit leve
- **Deploy lento** - Deploy rápido sem dependências pesadas
- **Incompatibilidade** - Funciona em qualquer servidor
- **Timeout** - Sem problemas de timeout

### ✅ Benefícios
- **Deploy rápido** - 2-5 minutos vs 2+ horas
- **Compatibilidade total** - Funciona em Vercel, Render, etc.
- **Manutenção simples** - Código mais limpo e organizado
- **Performance** - Geração de PDF mais rápida

## 📊 Comparação de Performance

| Métrica | Puppeteer | PDFKit |
|---------|-----------|--------|
| Tamanho do deploy | ~200MB | ~5MB |
| Tempo de deploy | 2+ horas | 2-5 minutos |
| Uso de memória | Alto | Baixo |
| Compatibilidade | Limitada | Universal |
| Qualidade visual | Excelente | Excelente |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Marcos Santos**
- Email: marcosv.dev@outlook.com
- GitHub: [@MarcosSantos-1](https://github.com/MarcosSantos-1)

## 🙏 Agradecimentos

- Comunidade Next.js
- Desenvolvedores do PDFKit
- Todos os contribuidores do projeto

---

⭐ **Se este projeto te ajudou, não esqueça de dar uma estrela!** ⭐