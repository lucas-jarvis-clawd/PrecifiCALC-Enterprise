# CLAUDE.md - PrecifiCALC Enterprise

## Visao Geral

Sistema web para precificacao contabil no Brasil. Calcula impostos para todos os regimes tributarios (MEI, Simples Nacional, Lucro Presumido, Lucro Real), analisa viabilidade de negocios e gera relatorios.

**Stack:** React 19 + Vite 7 + Tailwind CSS 3 + Recharts + Lucide React

## Estrutura do Projeto

```
src/
  components/       # Card.jsx, Sidebar.jsx, InputField.jsx, Onboarding.jsx
  pages/            # Modulos principais (9 paginas)
    Dashboard.jsx
    SimuladorTributario.jsx
    ComparativoRegimes.jsx
    AnaliseViabilidade.jsx
    CustosOperacionais.jsx
    Precificacao.jsx
    Propostas.jsx
    Relatorios.jsx
    Configuracoes.jsx
  data/
    taxData.js      # Base tributaria principal (todas as aliquotas e formulas)
  App.jsx           # Router principal
  main.jsx          # Entry point
  index.css         # Estilos globais + Tailwind
```

## Comandos

```bash
npm run dev       # Desenvolvimento (localhost:5173)
npm run build     # Build producao
npm run preview   # Preview da build
```

## Arquivos Importantes

- `src/data/taxData.js` - Base tributaria com todas as aliquotas, formulas e calculos. Atualizado para 2026.
- `DOCUMENTACAO_LEGAL_TRIBUTARIA.md` - Referencia completa de todas as leis, aliquotas e fontes oficiais utilizadas.
- `INSTRUCAO_CRITICA_PRECIFICACAO.md` - Contexto de uso: Lucas e consultor que ajuda clientes a precificar produtos/servicos.
- `DIRETRIZES_UX.md` - Regras de UX: manter termos tecnicos com explicacoes acessiveis.

## Regras de Desenvolvimento

- Tailwind CSS 3.x (nao usar v4 - causa incompatibilidade com PostCSS)
- CSS imports: `@tailwind base; @tailwind components; @tailwind utilities;`
- Novos modulos seguem padrao: criar em `src/pages/`, registrar em `App.jsx`
- Base tributaria: atualizar `taxData.js` quando legislacao mudar
- Nunca incluir leis ficticias ou inventadas (ja houve bug com "LC 224/2025" inexistente)
- COFINS Lucro Real: 7,6% (nao 7,65%)

## Dependencias Criticas

```json
{
  "react": "^19.2.0",
  "recharts": "^3.7.0",
  "lucide-react": "^0.563.0",
  "tailwindcss": "^3.0.0"
}
```
