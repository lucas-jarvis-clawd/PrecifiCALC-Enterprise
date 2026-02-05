# 📊 PrecifiCALC Enterprise - Documentação Técnica Completa

**Versão:** 3.0 (2026)  
**Última atualização:** 04/02/2026  
**Status:** Em desenvolvimento ativo

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
4. [Fluxo de Dados e Integrações](#fluxo-de-dados-e-integrações)
5. [Base Tributária e Questões Legais](#base-tributária-e-questões-legais)
6. [Interface e Experiência do Usuário](#interface-e-experiência-do-usuário)
7. [Persistência e Estado](#persistência-e-estado)
8. [Segurança e Compliance](#segurança-e-compliance)
9. [Arquivos-Chave](#arquivos-chave)
10. [Próximas Evoluções](#próximas-evoluções)

---

## 🎯 VISÃO GERAL

### Objetivo
PrecifiCALC Enterprise é um **sistema web de precificação contábil** que oferece simulações tributárias completas, análises comparativas de regimes fiscais e ferramentas de gestão financeira para empresas brasileiras.

### Proposta de Valor
- **Precificação inteligente** de produtos/serviços com base em tributos reais
- **Simulações rápidas** para empresários tomarem decisões financeiras
- **Interface simples** para quem não é contador mas precisa calcular números
- **Ferramenta de consultoria** para profissionais atenderem clientes
- **Cálculos em tempo real** que mostram impacto tributário nos preços

### Público-Alvo
- **EMPRESÁRIOS** que precisam calcular números e precificar produtos/serviços
- **CONSULTORES** (como a esposa do Lucas) que fazem cálculos para clientes
- Pequenos e médios empresários buscando otimização tributária
- Profissionais liberais que prestam consultoria empresarial

---

## 🏗️ ARQUITETURA DO SISTEMA

### Stack Tecnológica
```
Frontend: React 18 + Hooks + Vite
Styling: Tailwind CSS + Lucide Icons  
Charts: Recharts
Persistência: localStorage (client-side)
Build: Vite + ESLint
Deploy: Static hosting ready
```

### Estrutura de Pastas
```
src/
├── components/           # Componentes reutilizáveis
│   ├── Card.jsx         # Sistema de cards
│   ├── InputField.jsx   # Inputs padronizados
│   ├── Sidebar.jsx      # Navegação lateral
│   └── Onboarding.jsx   # Wizard inicial
├── pages/               # Módulos principais (13)
│   ├── Dashboard.jsx    # Painel principal
│   ├── SimuladorTributario.jsx
│   ├── ComparativoRegimes.jsx
│   └── [outros 10 módulos]
├── data/                # Motor de cálculos
│   ├── taxData.js       # Base tributária principal
│   ├── taxData_EXPANDIDO.js  # Dados auxiliares
│   └── sistemaAlertasTributarios.js
└── App.jsx              # Controlador principal
```

### Padrões Arquiteturais
- **Component-based**: React functional components
- **State management**: useState + useEffect hooks
- **Data flow**: Props down, callbacks up
- **Persistence**: localStorage com fallback gracioso
- **Responsive design**: Mobile-first com Tailwind

---

## 📊 MÓDULOS E FUNCIONALIDADES

### 1. 🏠 Dashboard
**Arquivo:** `Dashboard.jsx`  
**Funcionalidade:** Centro de controle com visão geral

#### Features:
- **Alertas inteligentes** baseados em limites tributários
- **Cards de status** dos principais KPIs
- **Navegação rápida** para módulos críticos
- **Detecção automática** de riscos de enquadramento

#### Integrações:
- Lê dados do **Simulador Tributário**
- Monitora **DRE** para alertas de prejuízo
- Verifica **limites de regime** automaticamente

### 2. 🧮 Simulador Tributário
**Arquivo:** `SimuladorTributario.jsx`  
**Funcionalidade:** Motor principal de cálculos tributários

#### Regimes Suportados:
- **MEI:** 4 tipos de atividade + MEI Caminhoneiro
- **Simples Nacional:** 5 anexos + Fator R + sublimites
- **Lucro Presumido:** 8 tipos de atividade + IRPJ/CSLL
- **Lucro Real:** Cálculo completo + LALUR básico

#### Cálculos em Tempo Real:
```javascript
// Exemplo: Simples Nacional
const resultado = calcSimplesTax(receita, anexo, rbt12, fatorR);
// Retorna: { das, aliquota, anexoAplicado, alertas }
```

#### Validações:
- Limites de enquadramento por regime
- Fator R para migração Anexo V→III
- Sublimites estaduais/municipais (R$ 3,6M)
- Atividades vedadas por regime

### 3. ⚖️ Comparativo de Regimes
**Arquivo:** `ComparativoRegimes.jsx`  
**Funcionalidade:** Análise side-by-side dos 4 regimes

#### Features:
- **Cálculo simultâneo** dos 4 regimes
- **Gráficos comparativos** (barras + linha)
- **Cenários salvos** (até 10 simulações)
- **Ranking automático** do menor ao maior tributo

#### Lógica de Comparação:
```javascript
const regimes = ['mei', 'simples', 'presumido', 'real'];
const resultados = regimes.map(regime => {
  return calcular(regime, receita, custos, despesas);
});
const ranking = resultados.sort((a,b) => a.totalTributos - b.totalTributos);
```

### 4. 🎯 Análise de Viabilidade
**Arquivo:** `AnaliseViabilidade.jsx`  
**Funcionalidade:** Projetos e análise de investimentos

#### Cálculos:
- **VPL** (Valor Presente Líquido)
- **TIR** (Taxa Interna de Retorno)
- **Payback** simples e descontado
- **Ponto de equilíbrio** operacional

#### Interface:
- Input de fluxos de caixa mensais/anuais
- Taxa de desconto configurável
- Gráficos de evolução temporal
- Relatório executivo de viabilidade

### 5. 💰 Custos Operacionais
**Arquivo:** `CustosOperacionais.jsx`  
**Funcionalidade:** Gestão e categorização de custos

#### Categorias:
- Custos fixos vs variáveis
- Custos diretos vs indiretos
- Despesas operacionais
- Margem de contribuição

### 6. 🏷️ Precificação
**Arquivo:** `Precificacao.jsx`  
**Funcionalidade:** Cálculo de preços de venda

#### Metodologias:
- Markup sobre custos
- Margem sobre receita
- Precificação por hora (serviços)
- Análise de competitividade

### 7. ⚖️ Ponto de Equilíbrio
**Arquivo:** `PontoEquilibrio.jsx`  
**Funcionalidade:** Análise CVL (Custo-Volume-Lucro)

#### Cálculos:
- Ponto de equilíbrio contábil
- Ponto de equilíbrio econômico
- Margem de segurança
- Alavancagem operacional

### 8. 📈 DRE (Demonstração do Resultado)
**Arquivo:** `DRE.jsx`  
**Funcionalidade:** Estrutura de DRE gerencial

#### Estrutura:
```
Receita Bruta
(-) Impostos sobre vendas
(=) Receita Líquida  
(-) CPV/CMV
(=) Lucro Bruto
(-) Despesas operacionais
(=) EBITDA
(-) Depreciação
(=) EBIT
(+/-) Resultado financeiro
(=) LAIR
(-) IRPJ/CSLL
(=) Lucro Líquido
```

### 9. 📅 Calendário Fiscal
**Arquivo:** `CalendarioFiscal.jsx`  
**Funcionalidade:** Agenda de obrigações tributárias

#### Features:
- Prazos por regime tributário
- Alertas de vencimento
- Obrigações principais e acessórias
- Calendário visual mensal

### 10. 👤 Enquadramento
**Arquivo:** `Enquadramento.jsx`  
**Funcionalidade:** Sugestão de regime tributário ideal

### 11. 📄 Propostas
**Arquivo:** `Propostas.jsx`  
**Funcionalidade:** Geração de propostas comerciais

### 12. 📊 Relatórios
**Arquivo:** `Relatorios.jsx`  
**Funcionalidade:** Exportação e impressão

### 13. ⚙️ Configurações
**Arquivo:** `Configuracoes.jsx`  
**Funcionalidade:** Personalização e parâmetros

---

## 🔄 FLUXO DE DADOS E INTEGRAÇÕES

### Arquitetura de Estado
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   localStorage  │ ←→ │    App.jsx      │ ←→ │    Módulos      │
│                 │    │                 │    │                 │
│ • perfil_emp    │    │ • currentPage   │    │ • estado local  │
│ • simulador     │    │ • perfilEmpresa │    │ • cálculos      │
│ • comparativo   │    │ • sidebarOpen   │    │ • validações    │
│ • dre           │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Persistência por Módulo
```javascript
// Chaves no localStorage
'precificalc_onboarded'     // boolean: onboarding concluído
'precificalc_perfil'        // object: dados da empresa
'precificalc_simulador'     // object: estado do simulador
'precificalc_comparativo'   // object: cenários salvos
'precificalc_dre'          // object: dados da DRE
'precificalc_custos'       // object: estrutura de custos
'precificalc_precificacao' // object: produtos/serviços
```

### Fluxo de Onboarding
```
1. App.jsx verifica localStorage['precificalc_onboarded']
2. Se false: renderiza <Onboarding />
3. Onboarding coleta dados em 3 etapas
4. Salva perfil em localStorage['precificalc_perfil']
5. Chama onComplete() → App.jsx
6. App.jsx atualiza estado e renderiza Dashboard
```

### Compartilhamento de Dados
#### Perfil da Empresa (Global):
```javascript
const perfilEmpresa = {
  nomeEmpresa: "Empresa LTDA",
  cnpj: "00.000.000/0001-00", 
  regime: "simples",
  atividade: "Prestação de Serviços",
  cidade: "São Paulo",
  uf: "SP",
  receitaAnual: "600000"
}
```

#### Dados do Simulador → Outros Módulos:
```javascript
// Dashboard usa dados do simulador para alertas
const simData = JSON.parse(localStorage.getItem('precificalc_simulador'));
if (simData?.regime === 'mei' && simData?.receitaMensal * 12 > 65000) {
  // Alerta de proximidade do limite
}
```

---

## ⚖️ BASE TRIBUTÁRIA E QUESTÕES LEGAIS

### Arquivo Principal: `taxData.js`
**Linhas de código:** ~1400  
**Última atualização:** 04/02/2026

#### Estrutura da Base:
```javascript
├── constantesTributarias2026    // Valores básicos (sal. mín, teto INSS)
├── mei                         // MEI completo + 4 atividades
├── simplesNacional            // 5 anexos + 6 faixas + Fator R
├── lucroPresumido            // 8 atividades + presunções
├── lucroReal                 // Tributação pelo lucro real
├── irrf                      // Retenções na fonte
├── encargosTrabalhistasCLT   // CPP, FGTS, férias, 13º
└── substituicaoTributaria    // MVA por produto/estado
```

#### Compliance Legal (Status Atual):

✅ **CORRETO:**
- Tabelas do Simples Nacional (LC 123/2006 + alterações)
- Fator R e migração automática Anexo V→III  
- Sublimites ICMS/ISS (R$ 3,6M)
- CPRB com reoneração gradual (Lei 14.973/2024)
- Valores 2026 (salário mínimo R$ 1.621)
- MEI com limite R$ 81.000 + MEI Caminhoneiro

✅ **CORRIGIDO (04/02/2026):**
- ❌ Lei fictícia "LC 224/2025" REMOVIDA
- ✅ COFINS Lucro Real: 7,6% (era 7,65%)

⚠️ **AINDA PENDENTE:**
- DIFAL (Diferencial de Alíquota) para e-commerce
- Substituição Tributária detalhada por UF  
- Reforma Tributária (IBS/CBS 2026-2033)
- Atualização automática de tabelas

#### Questões Legais Críticas:

**1. Responsabilidade Profissional:**
- Sistema é ferramenta de apoio, não substitui contador
- Usuário deve validar cálculos com profissional habilitado
- Disclaimers legais necessários em relatórios

**2. Legislação Dinâmica:**
- Tabelas tributárias mudam frequentemente
- Sistema precisa de mecanismo de atualização
- Versionamento da base tributária essencial

**3. Regime de Cálculo vs Realidade:**
- Simulações são estimativas baseadas em dados informados
- Apuração real pode diferir por diversos fatores
- Necessário alertas sobre limitações do sistema

### Funções de Cálculo Principais:

#### MEI:
```javascript
calcMEI(receitaMensal, atividade, isCaminhoneiro)
// Retorna: { dasFixo, aliquotaEfetiva, excedeLimite }
```

#### Simples Nacional:
```javascript
calcSimplesTax(receitaMensal, anexo, rbt12, fatorR)
// Considera: anexo, faixa, receita 12 meses, fator R
// Retorna: { das, aliquota, anexoFinal, alertas }
```

#### Lucro Presumido:
```javascript  
calcLucroPresumido(receita, atividade, despesas)
// Aplica: presunção por atividade, IRPJ/CSLL
// Retorna: { irpj, csll, pis, cofins, total }
```

#### Lucro Real:
```javascript
calcLucroReal(receita, lucro, despesas) 
// Calcula: sobre lucro real apurado
// Retorna: { irpj, csll, pis, cofins, total }
```

---

## 🎨 INTERFACE E EXPERIÊNCIA DO USUÁRIO

### Design System
**Framework:** Tailwind CSS  
**Paleta:** Indigo + Slate + cores semânticas  
**Icons:** Lucide React (200+ ícones)

#### Componentes Base:
```javascript
// Card.jsx - Sistema de cartões
<Card variant="default|success|warning|danger">
  <CardHeader>Título</CardHeader>
  <CardBody>Conteúdo</CardBody>
</Card>

// InputField.jsx - Inputs padronizados  
<InputField 
  label="Receita Mensal"
  type="currency" 
  value={receita}
  onChange={setReceita}
/>

// Sidebar.jsx - Navegação lateral
<Sidebar 
  currentPage={page}
  onNavigate={setPage}
  isOpen={sidebarOpen}
/>
```

### Responsividade

#### Desktop (>1024px):
- Sidebar fixa de 240px (60 = 15rem)
- Layout de 2-3 colunas
- Gráficos em tamanho completo
- Navegação always-visible

#### Tablet (768px - 1024px):  
- Sidebar colapsável
- Layout de 2 colunas adaptativo
- Cards empilhados quando necessário

#### Mobile (<768px):
⚠️ **PROBLEMA ATUAL:** Sidebar fixa sobrepõe conteúdo
🔄 **EM CORREÇÃO:** Hamburger menu + overlay

### Onboarding (Novo!)

#### Fluxo em 3 Etapas:
```
Etapa 1: Dados da Empresa
├── Nome da empresa *
├── CNPJ *  
├── Cidade *
└── UF *

Etapa 2: Atividade e Regime
├── Regime tributário * (4 opções)
├── Atividade principal *
└── Receita anual estimada *

Etapa 3: Configurações Finais
├── Resumo dos dados
├── Próximos passos sugeridos
└── Finalização
```

#### UX do Onboarding:
- **Progress bar** visual com ícones
- **Validação por etapa** (não avança sem dados obrigatórios)
- **Linguagem simples** para empresários (não jargão contábil)
- **Sugestões contextuais** focadas em negócios práticos

---

## 💾 PERSISTÊNCIA E ESTADO

### Estratégia Atual: localStorage

#### Vantagens:
- ✅ Sem necessidade de backend
- ✅ Dados ficam no dispositivo do usuário  
- ✅ Acesso offline
- ✅ Implementação simples

#### Limitações:
- ❌ Dados se perdem ao limpar cache
- ❌ Não há sincronização entre dispositivos
- ❌ Limite de ~5-10MB por domínio
- ❌ Sem backup automático

### Estrutura de Dados:

#### Perfil da Empresa:
```javascript
{
  nomeEmpresa: "string",
  cnpj: "string", 
  regime: "mei|simples|presumido|real",
  atividade: "string",
  cidade: "string",
  uf: "string",
  receitaAnual: "number",
  funcionarios: "number",
  configDate: "ISO string",
  onboardingCompleted: true
}
```

#### Estado do Simulador:
```javascript
{
  regime: "simples",
  receitaMensal: 50000,
  rbt12: 600000,
  anexo: "III", 
  atividadeMEI: "servicos",
  tipoAtividade: "servicos",
  issAliquota: 5,
  despesasDedutiveis: 20000,
  lastCalculation: {...}
}
```

### Padrões de Persistência:

#### Salvamento Automático:
```javascript
useEffect(() => {
  const dadosParaSalvar = { regime, receita, anexo, /*...*/ };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosParaSalvar));
}, [regime, receita, anexo]); // Salva a cada mudança
```

#### Loading com Fallback:
```javascript
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Erro ao carregar dados:', error);
    return null; // Fallback para estado inicial
  }
}
```

---

## 🔒 SEGURANÇA E COMPLIANCE

### Segurança de Dados

#### Client-Side Only:
- ✅ Dados não trafegam pela rede
- ✅ Informações ficam no dispositivo do usuário
- ✅ Sem risco de vazamento em servidor
- ⚠️ Dependente da segurança do dispositivo

#### Validações de Input:
- Sanitização de dados numéricos
- Limites máximos/mínimos por campo
- Validação de formato (CNPJ, valores)
- Escape de caracteres especiais

### Compliance Tributário

#### Status Atual (04/02/2026):
- ✅ Base tributária 2026 atualizada
- ✅ Legislação fictícia removida
- ✅ Cálculos principais validados
- ⚠️ Falta disclaimer legal robusto
- ⚠️ Necessita atualização contínua

#### Disclaimers Necessários:
```
"Este sistema é uma ferramenta de apoio à decisão. 
Os cálculos são estimativos e devem ser validados 
por profissional contábil habilitado. A legislação 
tributária muda frequentemente e pode impactar os 
resultados. Use por sua conta e risco."
```

#### Responsabilidades:
- **Do Sistema:** Cálculos corretos conforme implementação
- **Do Usuário:** Validação com contador, uso adequado
- **Legal:** Ferramenta de apoio, não consultoria

---

## 📁 ARQUIVOS-CHAVE

### Core da Aplicação:
```
App.jsx                 // Controlador principal + onboarding
components/Onboarding.jsx  // Wizard inicial (NOVO)
components/Sidebar.jsx     // Navegação (precisa mobile fix)
data/taxData.js           // Motor de cálculos (1400+ linhas)
```

### Módulos Principais:
```
Dashboard.jsx          // Centro de comando + alertas
SimuladorTributario.jsx   // Motor principal
ComparativoRegimes.jsx    // Análise comparativa  
AnaliseViabilidade.jsx    // VPL, TIR, Payback
```

### Sistema de Design:
```
components/Card.jsx       // Sistema de cartões
components/InputField.jsx // Inputs padronizados
tailwind.config.js       // Configuração visual
```

### Configuração:
```
package.json          // Dependências e scripts
vite.config.js       // Build config
.gitignore           // Exclusões git
```

---

## 🚀 PRÓXIMAS EVOLUÇÕES

### Prioridade 1 - Correções Urgentes (Em Andamento):
- ✅ ~~Lei fictícia removida~~
- ✅ ~~Bugs de cálculo corrigidos~~  
- ✅ ~~Onboarding implementado~~
- 🔄 **Mobile responsivo** (Especialista trabalhando)
- 🔄 **React Router** (URLs amigáveis)

### Prioridade 2 - Funcionalidades Premium:
- 🎯 **Simulador Reforma Tributária** (IBS/CBS 2026-2033)
- 📊 **Otimizador pró-labore vs distribuição** 
- 🏢 **Multi-empresa** (escritórios contábeis)
- 📤 **Exportação Excel/CSV**
- 🎨 **Marca branca nos PDFs**

### Prioridade 3 - Infraestrutura:
- 🔐 **Backend opcional** para sincronização
- 🔔 **Sistema de notificações** push
- 🔄 **Atualização automática** da base tributária
- 📊 **Dashboard consolidado** multi-empresa
- 🌐 **API pública** para integração

### Prioridade 4 - Inteligência:
- 🤖 **Sugestões automáticas** de otimização
- 📈 **Análise preditiva** de enquadramento  
- 🎯 **Templates por segmento** (restaurante, TI, clínica)
- 📋 **Checklist de compliance** automatizado

---

## 💰 MODELO DE NEGÓCIO SUGERIDO

### Tiers de Produto:
```
🆓 FREE
├── Precificação básica (1 produto)
├── Simulador tributário simples
└── Relatórios básicos

💎 PRO (R$ 49-99/mês) - CONSULTORES
├── Multi-clientes (até 10)
├── Marca branca nos relatórios
├── Exportação Excel/CSV
├── Templates por segmento
└── Calculadoras avançadas

🏢 ENTERPRISE (R$ 199-499/mês) - ESCRITÓRIOS
├── Clientes ilimitados
├── Dashboard consolidado multi-cliente
├── API para integração
├── Customização total da marca
└── Suporte prioritário
```

### Diferenciação Competitiva:
- 🔥 **Simulador Reforma Tributária** (ÚNICO no mercado)
- 🎯 **Onboarding profissional** (experiência superior)
- 🧮 **Cálculos em tempo real** (velocidade)
- 📊 **9 módulos integrados** (completude)
- ⚖️ **Base tributária robusta** (confiabilidade)

---

## 📞 CONTATO E SUPORTE

**Desenvolvedor:** Lucas + Especialistas Opus  
**Repositório:** `lucas-jarvis-clawd/PrecifiCALC-Enterprise`  
**Última atualização:** 04/02/2026 23:53 (Brasília)

Para questões técnicas ou jurídicas, consulte:
- Documentação no repositório GitHub
- Issues para bugs e melhorias
- Especialistas tributários para validação legal

---

*Este documento será atualizado conforme evoluções do sistema.*