# 🎯 DIRETRIZES UX - PrecifiCALC Enterprise

## 🚨 INSTRUÇÃO CRÍTICA - NUNCA ESQUECER
### A PRECIFICAÇÃO É DOS PRODUTOS DOS CLIENTES, NÃO DO LUCAS!

Lucas/esposa são CONSULTORES que ajudam clientes a precificar PRODUTOS DOS CLIENTES.

## 🔧 REGRAS DE OURO (Diretrizes do Lucas)

### ✅ O QUE MANTER
1. **Termos técnicos corretos** - precisão é fundamental
2. **Todas as funcionalidades** existentes - análise completa deve ser possível
3. **Todos os 13 módulos** - funcionalidades não podem ser perdidas
4. **Capacidade técnica** integral - é um produto robusto

### 🎨 COMO MELHORAR (Sem Perder)
1. **Explicações entre parênteses** - ex: "RBT12 (Faturamento últimos 12 meses)"
2. **Tooltips explicativos** em termos técnicos
3. **Menu agrupado** em categorias mas mantendo acesso completo
4. **Interface mais amigável** para empresários

## 📋 FORMATO CORRETO DE TERMOS

| ❌ Errado | ✅ Correto |
|-----------|-----------|
| "Faturamento 12 meses" | "RBT12 (Faturamento últimos 12 meses)" |
| "Folha %" | "Fator R (% da folha sobre faturamento)" |
| "Ajustes Lucro" | "LALUR (Ajustes do Lucro Real)" |
| "INSS Empresa" | "CPP (INSS Patronal)" |
| "Taxa Efetiva" | "Alíquota Efetiva (% real de imposto)" |

## 🎯 MELHORIAS A IMPLEMENTAR

### Dashboard Aprimorado
- ✅ Card grande "Lucro Líquido do Empresário" 
- ✅ Alertas com linguagem empresarial
- ✅ Manter todos os widgets técnicos existentes

### Menu Organizado (Manter 13 Módulos)
```
💰 PRECIFICAR
├── Precificação (+ melhorias hora/produto)
├── Custos Operacionais  
└── Ponto de Equilíbrio

📊 ANALISAR
├── Simulador Tributário
├── Comparativo de Regimes
├── Enquadramento
└── DRE

🎯 PLANEJAR
├── Análise de Viabilidade
├── Calendário Fiscal (com alertas)

📄 DOCUMENTAR
├── Propostas
├── Relatórios
└── Configurações
```

### Precificação Melhorada
- ✅ Adicionar modo "Por Hora" (serviços)
- ✅ Comparar preços entre regimes
- ✅ "Preço mínimo" destacado visualmente
- ✅ Manter todas as funcionalidades atuais

### Termos com Tooltips
```jsx
<label>
  RBT12 
  <Tooltip>
    Receita Bruta Total dos últimos 12 meses - 
    usado para determinar a faixa de tributação no Simples Nacional
  </Tooltip>
</label>
```

## 🚀 FUNCIONALIDADES A ADICIONAR (Não Substituir)

1. **Lucro Líquido Empresário** - novo card no Dashboard
2. **Precificação por Hora** - nova opção no módulo existente  
3. **Comparação de Regimes na Precificação** - integração módulos
4. **Tooltips Explicativos** - em todos os termos técnicos
5. **Feedback Emocional** - celebrar economias, alertar desperdícios
6. **Wizard "Precificar Rapidamente"** - atalho para empresários

## 🎨 PRINCÍPIOS DE DESIGN

### Para Empresários (B2C)
- **Números grandes** e claros nos resultados
- **Cores semânticas** (verde=economia, vermelho=atenção)
- **Linguagem de negócios** com precisão técnica
- **Ações claras** em cada módulo
- **Contexto:** "Seus produtos" (dirigindo-se ao empresário)

### Para Consultores (Uso Secundário) 
- **Modo apresentação** para reuniões
- **Relatórios profissionais** com marca própria
- **Acesso a detalhes técnicos** quando necessário
- **Contexto:** "Produtos do cliente" ou "Esta empresa"

## 🎯 LINGUAGEM CORRETA NA INTERFACE

### ✅ Para Empresário Usando Diretamente:
- "Seus produtos devem ser vendidos por R$ X"
- "Sua margem será Y%"
- "Seu negócio terá lucro líquido de R$ Z"
- "Com sua receita atual, o melhor regime é..."

### ✅ Para Consultor Atendendo Cliente:
- "Os produtos do cliente devem custar R$ X"  
- "A margem desta empresa será Y%"
- "O lucro líquido da empresa será R$ Z"
- "Para esta empresa, recomendamos..."

### ❌ Evitar Ambiguidade:
- ❌ "Sua margem" (margem de quem?)
- ❌ "Seus impostos" (do consultor ou do cliente?)
- ❌ "Seu faturamento" (não está claro)

## ⚠️ O QUE NÃO FAZER

❌ **Eliminar termos técnicos** (perder precisão)  
❌ **Remover funcionalidades** existentes  
❌ **Simplificar demais** cálculos  
❌ **Esconder módulos** importantes  
❌ **Perder capacidade** de análise completa

## ✅ RESUMO

**Objetivo:** Tornar o PrecifiCALC mais amigável para empresários **SEM** perder a robustez técnica que já tem. É um produto sofisticado que deve continuar permitindo análise completa, apenas com interface mais acessível.

**Método:** Adicionar, explicar e melhorar - nunca remover ou simplificar demais.