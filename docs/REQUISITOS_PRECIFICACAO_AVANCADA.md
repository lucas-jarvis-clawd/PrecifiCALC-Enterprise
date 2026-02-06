# 🧮 REQUISITOS - PRECIFICAÇÃO AVANÇADA COM NCM

## 📋 REQUISITOS CRÍTICOS (Lucas - 02:05)

### ❌ ZERO TOLERÂNCIA
> **"Não pode ter absolutamente nenhum cálculo errado, alíquota errada ou informação desatualizada de lei/tributos."** - Lucas

- Zero cálculos incorretos
- Zero alíquotas desatualizadas  
- Zero informações de lei desatualizadas
- 100% compliance com legislação brasileira atual

### 🆕 NOVA FUNCIONALIDADE
- **Aba "Precificação Avançada"** (manter aba atual também)
- **Campo NCM** para informar produtos
- **Cálculos mais corretos possíveis** baseados no NCM
- **Considerações de produtos monofásicos**

## 🔍 ANÁLISE NECESSÁRIA (Tax Legislation Specialist)

### 1. NCM - Nomenclatura Comum do Mercosul
- [ ] Tabela NCM completa atualizada 2026
- [ ] 8 dígitos de classificação
- [ ] Validação de NCM existente
- [ ] Descrição por código NCM

### 2. Impactos Tributários por NCM
- [ ] **PIS/COFINS** - alíquotas específicas por NCM
- [ ] **IPI** - tabela TIPI por NCM
- [ ] **ICMS** - alíquotas por estado e NCM
- [ ] **ICMS-ST** - substituição tributária por NCM
- [ ] Outros tributos específicos

### 3. Produtos Monofásicos
- [ ] Lista completa de NCMs monofásicos
- [ ] Legislação específica (Lei 10.336/2001, 10.637/2002, etc.)
- [ ] Alíquotas especiais PIS/COFINS
- [ ] Exceções e regras especiais

### 4. Fontes Oficiais de Dados
- [ ] Receita Federal - Tabela NCM
- [ ] Receita Federal - Tabela TIPI (IPI)
- [ ] CONFAZ - Convênios ICMS
- [ ] COTEPE - Atos COTEPE/ICMS
- [ ] APIs oficiais disponíveis

## 🛠️ IMPLEMENTAÇÃO TÉCNICA

### Frontend - Advanced Pricing Tab

#### Componentes a Criar:
```jsx
// Componente principal
<AdvancedPricingTab />

// Campo NCM especializado
<NCMInput 
  value={ncm}
  onChange={handleNCMChange}
  onValidate={validateNCM}
  showDescription={true}
/>

// Breakdown detalhado dos impostos
<TaxBreakdownByNCM 
  ncm={ncm}
  state={state}
  revenue={revenue}
/>

// Produtos monofásicos
<MonophasicProductsInfo 
  ncm={ncm}
  isMonophasic={checkMonophasic(ncm)}
/>
```

#### Funcionalidades:
- [ ] Campo NCM com máscara (0000.00.00)
- [ ] Validação em tempo real
- [ ] Busca por descrição do produto
- [ ] Cálculo automático ao informar NCM
- [ ] Comparação com precificação simples
- [ ] Tooltips explicativos para todos os campos
- [ ] Interface responsiva mobile/desktop

### Backend - NCM Calculation Engine

#### Módulos a Criar:
```javascript
// Engine principal de cálculo por NCM
ncmCalculations.js
├── calculatePISByNCM()
├── calculateCOFINSByNCM()  
├── calculateIPIByNCM()
├── calculateICMSByNCM()
├── calculateICMSSTByNCM()

// Base de dados NCM
ncmDatabase.js
├── getNCMInfo(ncmCode)
├── validateNCM(ncmCode)
├── getIPIRate(ncmCode)
├── isMonophasic(ncmCode)

// Produtos monofásicos
monophasicProducts.js
├── getMonophasicList()
├── getSpecialRates(ncmCode)
├── calculateMonophasicPISCOFINS()

// ICMS por estado
stateICMS.js
├── getICMSRate(ncm, state)
├── getICMSSTInfo(ncm, state)
├── getStateBenefits(ncm, state)
```

#### Requisitos Técnicos:
- [ ] Performance sub-100ms para cálculos
- [ ] Cache inteligente de consultas NCM
- [ ] Validações robustas de entrada
- [ ] Logs detalhados para auditoria
- [ ] Tratamento de exceções específicas
- [ ] Documentação de cada fórmula
- [ ] Referências legais em comentários

### Validação e Qualidade

#### Testes Obrigatórios:
- [ ] Testes unitários para CADA NCM de teste
- [ ] Validação vs. simuladores da Receita Federal
- [ ] Comparação com cálculos manuais
- [ ] Edge cases de produtos monofásicos
- [ ] Diferentes cenários de estados
- [ ] Performance testing com volume alto

#### Documentação Requerida:
- [ ] `docs/ANALISE_NCM_TRIBUTACAO.md` - Análise técnica completa
- [ ] `docs/FONTES_OFICIAIS.md` - Todas as fontes de dados
- [ ] `docs/LEGISLACAO_ATUAL.md` - Mapeamento legal
- [ ] `docs/PRODUTOS_MONOFASICOS.md` - Lista e regras
- [ ] `docs/MANUAL_PRECIFICACAO_AVANCADA.md` - Guia do usuário

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### Funcional ✅
- [ ] Nova aba "Precificação Avançada" acessível
- [ ] Campo NCM aceita 8 dígitos com validação
- [ ] Cálculos diferentes por NCM funcionando
- [ ] Produtos monofásicos identificados automaticamente
- [ ] Comparação com precificação simples disponível
- [ ] Interface intuitiva para empresários

### Técnico ✅
- [ ] Zero cálculos incorretos vs. legislação
- [ ] Performance adequada (< 2s cálculo completo)
- [ ] Responsivo mobile/desktop
- [ ] Acessibilidade WCAG AA
- [ ] Testes unitários 100% coverage
- [ ] Documentação completa

### Compliance ✅  
- [ ] 100% conformidade legislação brasileira 2026
- [ ] Fontes oficiais validadas e documentadas
- [ ] Alíquotas atualizadas
- [ ] Referências legais em cada cálculo
- [ ] Auditoria de precisão vs. simuladores oficiais

## 🚨 RISCOS E MITIGAÇÕES

### Alto Risco:
1. **Cálculos incorretos** → Validação múltipla vs. fontes oficiais
2. **Legislação desatualizada** → Monitoramento contínuo de mudanças
3. **Performance ruim** → Cache inteligente e otimizações
4. **Complexidade de UX** → Testes com usuários reais

### Médio Risco:
1. **Integração com aba atual** → Testes de regressão completos
2. **Manutenibilidade** → Documentação detalhada e código limpo
3. **Escalabilidade** → Arquitetura modular e testes de carga

---

**Status:** 📋 Requisitos definidos, aguardando análise técnica completa  
**Próximo:** Tax Legislation Specialist completa análise detalhada  
**Objetivo:** Implementação perfeita da precificação avançada com NCM