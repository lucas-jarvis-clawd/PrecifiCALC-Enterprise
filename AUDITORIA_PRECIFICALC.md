# 🔍 AUDITORIA CRÍTICA — PrecifiCALC Enterprise v3.0

## Perspectiva: Empresário precificando + Consultora atendendo clientes

**Data:** Junho 2025
**Foco:** "Isso ajuda o empresário a precificar melhor e ganhar mais dinheiro?"

---

## 🧭 RESUMO EXECUTIVO

O PrecifiCALC tem um **motor de precificação genuinamente bom** (módulo Precificação) e um
**gerador de propostas comerciais muito útil** (módulo Propostas). Esses dois módulos juntos
já justificam a existência do sistema.

**O grande problema:** esses dois módulos não se falam. O empresário calcula o preço em um
lugar e digita de novo na proposta. A consultora não consegue fluir de "cálculo → proposta
→ entrega ao cliente" numa sessão só.

**Segundo grande problema:** o sistema fala "linguagem de contador" em vez de "linguagem de
empresário". Termos como LALUR, RBT12, Anexo V, Fator R aparecem em telas onde o
empresário só quer saber: *"Quanto cobrar?"*

**Terceiro:** localStorage. A consultora não pode perder os dados de 30 clientes porque
limpou o cache.

---

## 📊 AVALIAÇÃO MÓDULO A MÓDULO

### Escala de valor para o público-alvo:
- ⭐⭐⭐⭐⭐ = Essencial, usa todo dia
- ⭐⭐⭐⭐ = Muito útil, usa frequentemente
- ⭐⭐⭐ = Útil em momentos específicos
- ⭐⭐ = "Legal ter" mas não faz diferença
- ⭐ = Não serve para esse público

---

### 1. 🏷️ PRECIFICAÇÃO — ⭐⭐⭐⭐⭐ (MÓDULO HERÓI)
**Veredicto:** Melhor módulo do sistema. Fórmula correta, visual excelente.

**O que já funciona muito bem:**
- ✅ Fórmula `Preço = Custo Total / (1 - Alíquota - Margem)` — método correto do 100%
- ✅ Composição visual do preço com barras de proporção — excelente para mostrar ao cliente
- ✅ Gráfico de sensibilidade Preço × Margem — a consultora mostra isso numa reunião e vende
- ✅ Importação automática de dados do módulo Custos
- ✅ Cálculo de ponto de equilíbrio integrado
- ✅ Projeção mensal (receita, custos, tributos, lucro)

**Problemas críticos:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| P1 | **Seção "Regime Tributário" expõe jargão pesado** — Anexo, RBT12, LALUR, Fator R. O empresário não sabe o que é Anexo V. Deveria puxar do perfil/onboarding e mostrar apenas "Sua carga tributária estimada: X%". | ALTO | MÉDIO |
| P2 | **Não conecta com Propostas** — O preço calculado aqui não é importável no gerador de propostas. A consultora calcula o preço, depois digita tudo de novo. | ALTO | BAIXO |
| P3 | **Falta precificação de MÚLTIPLOS produtos** — Só calcula um produto/serviço por vez. Um empresário tem 5, 10, 50 SKUs. Precisaria de uma "tabela de preços". | ALTO | MÉDIO |
| P4 | **Precificação por hora para serviços** — O campo "Custo do Serviço (unitário)" não é intuitivo para quem vende hora. Falta: custo/hora do profissional → preço/hora → preço do projeto. | MÉDIO | BAIXO |
| P5 | **Falta "Preço do concorrente"** — Campo para informar o preço praticado pelo mercado e ver se o preço calculado é competitivo. Simples e extremamente útil. | MÉDIO | BAIXO |

---

### 2. 📄 PROPOSTAS — ⭐⭐⭐⭐⭐ (MÓDULO MATADOR PARA CONSULTORA)
**Veredicto:** Feature que a consultora vai AMAR. Gera proposta profissional com print/PDF.

**O que já funciona muito bem:**
- ✅ Layout de impressão profissional com cabeçalho, tabela, rodapé, assinaturas
- ✅ Condições de pagamento (à vista, 30/60/90 dias)
- ✅ Desconto percentual calculado automaticamente
- ✅ Campos de empresa e cliente
- ✅ Validade calculada automaticamente
- ✅ Observações customizáveis
- ✅ Persistência em localStorage

**Problemas críticos:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| PR1 | **Itens não importam da Precificação** — Deveria ter botão "Importar preço calculado" que preenche produto + preço + custo do módulo Precificação. | ALTO | BAIXO |
| PR2 | **Sem histórico de propostas** — Gera a proposta, imprime, e perde. Não salva propostas anteriores. A consultora precisa acessar "proposta que fiz pro João em março". | ALTO | MÉDIO |
| PR3 | **Sem valor dos tributos na proposta** — A proposta mostra preço, mas não mostra ao empresário quanto de imposto está embutido. Isso é valor para a consultora demonstrar. | MÉDIO | BAIXO |
| PR4 | **Logotipo da empresa** — Não permite upload de logo. Para a consultora passar credibilidade, o PDF deveria ter a marca do cliente ou a marca dela. | MÉDIO | MÉDIO |
| PR5 | **Sem numeração de proposta** — Propostas profissionais têm número sequencial. Simples e agrega percepção de profissionalismo. | BAIXO | BAIXO |

---

### 3. ⚖️ COMPARATIVO DE REGIMES — ⭐⭐⭐⭐⭐ (ARGUMENTO DE VENDA DA CONSULTORA)
**Veredicto:** Quando a consultora mostra "olha quanto você economiza trocando de regime",
é hora do "uau" do cliente.

**O que funciona bem:**
- ✅ Calcula todos os 4 regimes simultaneamente
- ✅ Gráfico de barras comparativo
- ✅ Cenários salvos (até 10)
- ✅ Ranking do menor para o maior tributo

**Problemas:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| C1 | **Resultado mostra número bruto, não a economia** — Deveria ter destaque grande: "Trocando de X para Y, você economiza R$ Z/ano". Esse é o number que vende. | ALTO | BAIXO |
| C2 | **Falta "cenário atual vs recomendado"** — O comparativo trata todos os regimes igual. Deveria marcar o atual (do perfil) e destacar o recomendado. | MÉDIO | BAIXO |
| C3 | **Exportar comparativo para PDF/imagem** — A consultora precisa mandar isso por WhatsApp pro cliente. Botão "Salvar como imagem" ou "Compartilhar". | ALTO | MÉDIO |

---

### 4. 💰 CUSTOS OPERACIONAIS — ⭐⭐⭐⭐
**Veredicto:** Bom módulo. Ponto forte: gráfico de pizza e cálculo de encargos.

**Funciona bem:**
- ✅ Custos fixos editáveis com categorização
- ✅ Custos variáveis por unidade
- ✅ Cálculo de encargos CLT (multiplicador)
- ✅ Pró-labore separado
- ✅ Exporta dados para Precificação via localStorage
- ✅ Gráfico pizza por categoria

**Problemas:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| CO1 | **Defaults são de escritório contábil** — Os custos fixos default listam "Software Contábil", "CRC", "Certificado Digital". Isso é para CONTADOR, não empresário. Deveria perguntar o segmento e carregar defaults relevantes (restaurante, loja, clínica, etc.). | ALTO | BAIXO |
| CO2 | **Encargos detalhados demais** — O empresário não precisa ver RAT, Sistema S, GILRAT. Deveria resumir: "Custo real de 1 funcionário de R$ 2.500 = R$ 4.500 (multiplicador 1,8x)". Número final e pronto. | MÉDIO | BAIXO |
| CO3 | **Falta campo "Quanto VOCÊ quer ganhar"** — O pró-labore tá lá, mas a pergunta deveria ser: "Quanto você (dono) quer levar pra casa por mês?". Linguagem muda tudo. | BAIXO | BAIXO |

---

### 5. ⚖️ PONTO DE EQUILÍBRIO — ⭐⭐⭐⭐
**Veredicto:** "Quantas unidades você precisa vender pra pagar as contas." Todo empresário
precisa saber isso. Módulo útil.

**Funciona bem:**
- ✅ Cálculo correto de PE contábil e econômico
- ✅ Gráfico AreaChart com linha de referência
- ✅ Integra carga tributária no cálculo

**Problemas:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| PE1 | **Não puxa dados de Custos nem Precificação** — O empresário já preencheu despesas fixas e preço de venda em outros módulos. Aqui digita tudo de novo. | ALTO | BAIXO |
| PE2 | **Linguagem muito técnica** — "Margem de contribuição unitária", "Alavancagem operacional". O empresário quer: "Venda pelo menos X por mês pra não ter prejuízo". | MÉDIO | BAIXO |

---

### 6. 🧮 SIMULADOR TRIBUTÁRIO — ⭐⭐⭐
**Veredicto:** Tecnicamente excelente. Mas para o público-alvo, é secundário. O empresário
não acorda pensando "vou simular tributação". Ele quer saber o preço do produto.

**O simulador brilha ATRAVÉS de outros módulos** (Precificação, Comparativo). Como módulo
standalone, é mais ferramenta da consultora do que do empresário.

**Funciona bem:**
- ✅ Motor de cálculo robusto (Simples, Presumido, Real, MEI)
- ✅ Fator R com migração automática
- ✅ Sublimites e alertas

**Problema principal:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| S1 | **Interface assume conhecimento tributário** — Campos como "Anexo do Simples", "RBT12", "Adições LALUR", "Créditos PIS/COFINS" são jargão puro. Para a consultora, ok. Para o empresário, barreira de entrada. | ALTO | MÉDIO |
| S2 | **Deveria ter "modo simples" e "modo avançado"** — Modo simples: receita + tipo de atividade = resultado. Modo avançado: todos os campos. | MÉDIO | MÉDIO |

---

### 7. 📈 DRE — ⭐⭐⭐
**Veredicto:** Útil como "Minha empresa dá lucro?", mas a linguagem e a falta de integração
reduzem o valor.

**Problemas:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| D1 | **Nome "DRE" não significa nada pro empresário** — Deveria ser "Resultado do Negócio" ou "Sua Lucratividade". DRE é termo contábil. | MÉDIO | BAIXO |
| D2 | **IRPJ/CSLL é input manual** — O empresário não sabe esse valor. Deveria calcular automaticamente baseado no regime (perfil). | ALTO | MÉDIO |
| D3 | **Não puxa dados de Custos Operacionais** — O empresário preencheu tudo em Custos. Aqui digita de novo. | ALTO | BAIXO |
| D4 | **Multiplicação ×12 ingênua** — OK para uma visão rápida, mas engana quando tem sazonalidade. Pelo menos um aviso "Estimativa linear — considere variações sazonais." | BAIXO | BAIXO |

---

### 8. 📊 RELATÓRIOS — ⭐⭐⭐⭐
**Veredicto:** Surpreendentemente bom! CSV + XLSX + White-label + Templates por segmento.
É a entrega final da consultora para o cliente.

**Destaques positivos:**
- ✅ Export CSV com encoding UTF-8 correto
- ✅ Export XLSX via lib xlsx
- ✅ White-label: puxa nome/CNPJ da empresa para os relatórios
- ✅ Templates por segmento (comércio, serviços, indústria, saúde, contabilidade)
- ✅ Cor da marca customizável

**Problemas:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| R1 | **Não gera relatório PDF formatado** — Só exporta dados em CSV/XLSX. Falta um PDF bonito que a consultora entrega ao cliente como "diagnóstico". | ALTO | ALTO |
| R2 | **Template de "contabilidade" nos segmentos** — O público não é contador, mas tem template de escritório contábil. Trocar por "Alimentação/Restaurante" que é muito mais demandado. | BAIXO | BAIXO |

---

### 9. 🎯 ANÁLISE DE VIABILIDADE — ⭐⭐⭐
**Veredicto:** Útil quando o empresário pensa em abrir algo novo ou investir. Menos
frequente que precificação, mas valioso nos momentos certos.

**Bom:** Payback, ROI com sazonalidade, gráficos de projeção.
**Problema:** Input pesado (muitos campos), poderia importar de Custos.

---

### 10. 📅 CALENDÁRIO FISCAL — ⭐⭐
**Veredicto:** O empresário tem CONTADOR pra cuidar disso. Ele não vai olhar prazos de
DCTF e EFD-Contribuições. Para a consultora, é referência rápida.

**Problema técnico importante:**

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| CF1 | **DIRF está listada como obrigação vigente** — Foi extinta pela IN RFB 2.096/2022, substituída pela EFD-Reinf + DCTFWeb. Se a consultora mostrar isso a um cliente contador, perde credibilidade. | ALTO | BAIXO |

---

### 11. 👤 ENQUADRAMENTO — ⭐⭐⭐
**Veredicto:** Bom para a consultora fazer "diagnóstico tributário" com o cliente. O
scoring é inteligente e considera múltiplos fatores.

---

### 12. 🏠 DASHBOARD — ⭐⭐
**Veredicto:** Atualmente é uma TELA DE MENU, não um dashboard. Mostra cards estáticos
("4 regimes", "5 anexos") que são informação do sistema, não do negócio do empresário.

| # | Problema | Impacto | Fix |
|---|---------|---------|-----|
| DA1 | **Não mostra nenhum número DO negócio do empresário** — Deveria mostrar: receita mensal, lucro estimado, preço médio dos produtos, margem média, próximo vencimento fiscal. | ALTO | MÉDIO |
| DA2 | **KPIs estáticos sem valor** — "12+ tributos mapeados" não ajuda ninguém. Trocar por KPIs do negócio puxados dos módulos preenchidos. | ALTO | MÉDIO |
| DA3 | **Alertas são bons mas insuficientes** — Alerta de limite de regime ✅. Falta: "Sua margem está abaixo de 10% — revise preços", "Ponto de equilíbrio não atingido", etc. | MÉDIO | BAIXO |

---

## 🔴 PROBLEMAS ARQUITETURAIS (afetam TODOS os módulos)

### A1. ❌ MÓDULOS SÃO ILHAS — Falta o "Fluxo da Consultora"

**O problema mais grave do sistema.**

O workflow natural é:
```
Custos → Precificação → Proposta → Relatório
   ↑                                    ↓
   └──── Comparativo de Regimes ────────┘
```

Mas hoje o usuário precisa:
1. Preencher custos no módulo Custos
2. Ir em Precificação e PARTE dos dados migra (via localStorage)
3. Calcular o preço
4. Ir em Propostas e **digitar tudo de novo manualmente**
5. Gerar proposta
6. Ir em Relatórios e exportar **dados crus** (sem o cálculo final)

**Fix necessário:** Botões "Usar este preço na proposta" no módulo Precificação.
Botão "Importar produtos precificados" no módulo Propostas.
Dados fluem, não se re-digitam.

**Impacto:** CRÍTICO | **Complexidade:** MÉDIA | **Urgência:** 🔴 ALTA

---

### A2. ❌ localStorage = Morte para a Consultora

A consultora atende 30 clientes. Se ela:
- Limpar o cache → perde TUDO
- Trocar de computador → dados não existem
- O navegador atualizar e resetar storage → game over

**Mínimo viável:** Botão "Exportar backup (JSON)" + "Importar backup" em Configurações.
Não precisa de backend pra começar. Só salvar/carregar arquivo.

**Ideal futuro:** Supabase ou Firebase com login simples (Google).

**Impacto:** CRÍTICO | **Complexidade:** BAIXA (export/import) | **Urgência:** 🔴 URGENTE

---

### A3. ❌ Multi-empresa/Multi-cliente inexistente

A consultora precisa alternar entre clientes. Hoje, o sistema salva UM perfil.
Mínimo viável: seletor de "perfis" no topo, cada perfil com seu namespace no localStorage.

**Impacto:** ALTO | **Complexidade:** MÉDIA | **Urgência:** 🔴 ALTA

---

### A4. ⚠️ Mobile quebrado = Consultora sem ferramenta na reunião

A consultora na mesa com o cliente, abre no tablet... sidebar sobrepõe o conteúdo.
Ela não pode mostrar o sistema se ele não funciona no dispositivo que usa.

**Impacto:** ALTO | **Complexidade:** BAIXA-MÉDIA | **Urgência:** 🟠 ALTA

---

### A5. ⚠️ Code Duplication dos imports defensivos

5 arquivos repetem o mesmo bloco de 20 linhas de fallback. Extrair para `utils/taxHelpers.js`.

**Impacto:** MÉDIO (manutenibilidade) | **Complexidade:** BAIXA | **Urgência:** 🟡 MÉDIA

---

## 🗣️ LINGUAGEM: De "Contador" para "Empresário"

### Traduções necessárias:

| Termo atual | O empresário entende como |
|-------------|--------------------------|
| DRE | "Resultado do Negócio" ou "Minha Lucratividade" |
| CPV/CMV | "Custo do que você vende" |
| Margem de contribuição | "Quanto sobra de cada venda" |
| Ponto de equilíbrio | "Mínimo que você precisa vender" |
| Alíquota efetiva | "Quanto de imposto você paga (%)" |
| RBT12 | "Quanto sua empresa faturou nos últimos 12 meses" |
| Anexo do Simples | "Categoria da sua atividade no Simples" |
| LALUR | (esconder no modo simples — 99% não precisa) |
| Fator R | "Proporção da folha de pagamento vs faturamento" |
| EBITDA | "Lucro operacional (antes de juros e impostos)" |
| Markup | "Quanto você adiciona sobre o custo" |
| ISS/ICMS | "Imposto sobre serviços/produtos" |

**Regra:** Todo campo técnico precisa de um `help` tooltip explicando em português humano.
O sistema JÁ tem a propriedade `help` no `InputField`. Só falta usar em mais campos.

---

## 🎯 FEATURES AUSENTES QUE TÊM ALTO VALOR

### F1. 💰 "Quanto eu preciso vender pra ganhar X?"
**Cálculo reverso.** O empresário informa: "Quero ganhar R$ 10.000/mês limpo."
O sistema calcula: "Você precisa vender Y unidades a R$ Z cada."
**Impacto:** ⭐⭐⭐⭐⭐ | **Complexidade:** BAIXA (é álgebra com dados que já existem)

### F2. 📱 "Compartilhar resultado por WhatsApp"
Botão que gera imagem/link compartilhável do resultado. A consultora envia o
comparativo ou o preço calculado direto pro WhatsApp do cliente.
**Impacto:** ⭐⭐⭐⭐⭐ | **Complexidade:** MÉDIA (html2canvas ou similar)

### F3. 📋 "Diagnóstico Rápido" — Wizard de 5 perguntas
Fluxo: Receita → Custos → Funcionários → Atividade → Regime atual
Resultado: Dashboard personalizado com preço sugerido, regime recomendado, lucro estimado.
Isso é o que a consultora usa nos primeiros 5 minutos da reunião.
**Impacto:** ⭐⭐⭐⭐⭐ | **Complexidade:** MÉDIA

### F4. 🏷️ Tabela de preços (múltiplos produtos)
Lista de produtos com custo, preço, margem, tudo calculado. Em vez de um-por-um.
**Impacto:** ⭐⭐⭐⭐⭐ | **Complexidade:** MÉDIA

### F5. 📊 "Antes vs Depois" para consultora
"Antes do meu trabalho, você cobrava R$ X e perdia dinheiro.
Agora, com o preço correto de R$ Y, seu lucro é Z."
Isso é como a consultora justifica o honorário dela.
**Impacto:** ⭐⭐⭐⭐⭐ | **Complexidade:** BAIXA (comparar dois cenários salvos)

### F6. 💵 Simulador pró-labore vs dividendos
"Quanto tirar de pró-labore e quanto de dividendos pra pagar menos imposto?"
Pergunta que TODO empresário faz. Resposta depende de INSS + IR.
**Impacto:** ⭐⭐⭐⭐ | **Complexidade:** MÉDIA

---

## ✅ O QUE JÁ ESTÁ ÓTIMO (não mexer!)

1. **Fórmula de precificação pelo método do 100%** — correta e elegante
2. **Composição visual do preço** (barras proporcionais) — excelente UX
3. **Gráfico de sensibilidade Preço × Margem** — killer feature em reunião
4. **Motor tributário com Fator R** — tecnicamente sólido
5. **Gerador de propostas com print** — profissional e bonito
6. **Export CSV/XLSX com encoding correto** — funciona
7. **White-label nos relatórios** — a consultora personaliza
8. **Templates por segmento** — atalho inteligente
9. **Alertas de limite de regime** — previne problemas
10. **Onboarding em 3 etapas** — boa primeira experiência

---

## 📋 PRIORIZAÇÃO FINAL — TOP 15

### 🔴 URGENTE (fazer primeiro — valor imediato)

| # | Melhoria | Por quê | Esforço |
|---|---------|---------|---------|
| 1 | **Backup JSON export/import** em Configurações | Consultora não pode perder dados de clientes. Solução sem backend. | 2-4h |
| 2 | **Botão "Usar na Proposta"** no módulo Precificação | Conectar os 2 módulos mais valiosos. Fim da redigitação. | 4-8h |
| 3 | **Corrigir DIRF → EFD-Reinf** no Calendário Fiscal | Informação incorreta. Perde credibilidade. Uma troca de texto. | 30min |
| 4 | **Defaults de Custos por segmento** (não de contabilidade) | Público é empresário. Trocar padrões para restaurante/loja/clínica. | 2-4h |
| 5 | **Dashboard com KPIs do negócio** (puxar de localStorage) | Mostrar lucro, margem, receita do empresário — não métricas do sistema. | 4-8h |

### 🟠 ALTA (próximo sprint — diferencial competitivo)

| # | Melhoria | Por quê | Esforço |
|---|---------|---------|---------|
| 6 | **Multi-perfil/multi-cliente** (namespace no localStorage) | Consultora atende vários clientes. Seletor no topo. | 8-16h |
| 7 | **"Quanto preciso vender pra ganhar X?"** (cálculo reverso) | Feature que nenhum concorrente tem. Empresário PENSA assim. | 4-8h |
| 8 | **Mobile responsivo** (hamburger menu fix) | Consultora na reunião com tablet. | 4-8h |
| 9 | **Esconder jargão tributário no modo simples** | RBT12, LALUR, Anexo = barreira. Modo simples vs avançado. | 8-16h |
| 10 | **Compartilhar resultado via imagem/WhatsApp** | Canal #1 de comunicação consultora↔cliente é WhatsApp. | 4-8h |

### 🟡 MÉDIA (backlog valioso)

| # | Melhoria | Por quê | Esforço |
|---|---------|---------|---------|
| 11 | **Tabela de preços** (múltiplos produtos) | Empresário tem catálogo, não produto único. | 16-24h |
| 12 | **Relatório PDF formatado** ("Diagnóstico do Negócio") | Entregável profissional que a consultora dá ao cliente. | 16-24h |
| 13 | **DRE integrada com Custos e Simulador** | Puxa dados automáticos, calcula tributos pelo regime. | 8-16h |
| 14 | **"Antes vs Depois"** (cenário comparativo) | Consultora prova ROI do trabalho dela. | 8-16h |
| 15 | **Simulador pró-labore vs dividendos** | Pergunta universal de sócios. | 8-16h |

---

## 📐 NOTAS DE PRECISÃO DOS CÁLCULOS

O motor tributário (`taxData.js`) é **tecnicamente sólido**. Não é o foco da melhoria porque
o empresário não audita as fórmulas — ele confia no sistema. Mas registro:

- ✅ Simples Nacional: tabelas e fórmula de alíquota efetiva corretas (LC 123/2006)
- ✅ Lucro Presumido: presunções por atividade + adicional IRPJ corretos
- ✅ Lucro Real: PIS/COFINS não-cumulativo com créditos funciona
- ✅ MEI: valores DAS 2026 coerentes com salário mínimo projetado
- ✅ CPRB: reoneração gradual (Lei 14.973/2024) implementada
- ✅ Encargos CLT: multiplicador calculado corretamente
- ⚠️ ISS: poucos municípios, mas aceitável (campo editável resolve)
- ⚠️ IRRF PF: tabela pode desatualizar se reforma do IR passar
- ⚠️ Reforma Tributária (CBS/IBS): ausente, mas para 2026 o impacto prático é mínimo
  (alíquota teste de 0,9% CBS). Pode esperar — não afeta precificação diária.

**Nota sobre disclaimer legal:** O sistema PRECISA de um aviso visível de que os cálculos
são estimativas. Não por exigência de CRC (o público não é contador), mas porque a
consultora usa isso para embasar recomendações a clientes. Se um número estiver errado e
gerar prejuízo, a responsabilidade precisa estar clara.

Texto sugerido (rodapé de toda tela de resultado):
> *Cálculos estimados com base na legislação vigente. Valores reais podem variar.
> Consulte seu contador para validação oficial.*

---

## 🏁 CONCLUSÃO

O PrecifiCALC **já resolve um problema real**: ajudar empresários a precificar produtos
considerando custos + tributos + margem desejada. Poucos sistemas fazem isso de forma
acessível.

Os 5 primeiros itens da priorização (backup, conectar Precificação↔Proposta, corrigir
DIRF, trocar defaults, dashboard real) são **melhorias de 1-2 dias de trabalho cada**
que transformam a experiência.

O sistema não precisa de mais módulos — precisa que os módulos existentes **conversem
entre si** e **falem a língua do empresário**.

A consultora não precisa de compliance tributário perfeito — precisa de **velocidade para
impressionar o cliente na reunião** e **entregáveis profissionais** (proposta + relatório).

**Prioridade zero:** Conectar Precificação → Propostas. Esse fluxo é o coração do negócio.
