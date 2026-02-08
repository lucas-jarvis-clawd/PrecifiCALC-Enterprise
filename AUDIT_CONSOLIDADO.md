# AUDITORIA COMPLETA - PrecifiCALC Enterprise
**Data:** 2026-02-07
**Agentes:** Tax Specialist, UX/UI Specialist, Accountant Feature Specialist
**Escopo:** Cálculos, legislação, UX/UI, funcionalidades

---

## RESUMO EXECUTIVO

| Categoria | Erros (MUST FIX) | Melhorias (NICE TO HAVE) |
|-----------|:-----------------:|:------------------------:|
| Cálculos & Tributação | 7 | 6 |
| UX/UI & Usabilidade | 23 | 24 |
| Funcionalidades Faltantes | 4 | 19 |
| **TOTAL** | **34** | **49** |

**Veredicto da Base Tributária:** Alíquotas e tabelas do Simples (I-V), MEI, Lucro Presumido e Lucro Real estão corretas. Porém há 3 erros adicionais de referência legal e validação que precisam correção urgente.

---

# PARTE 1: CÁLCULOS & TRIBUTAÇÃO

## Confirmações (tudo correto)

- MEI: DAS R$ 82,05 (comércio), R$ 86,05 (serviços), R$ 87,05 (misto) - Limite R$ 81.000/ano
- Simples Nacional: Todas as 6 faixas dos 5 anexos com alíquotas e deduções corretas
- Fator R: `folha12m / RBT12`, migração V→III quando >= 28%
- CPP Anexo IV: 20% sobre folha calculado separadamente
- Sublimite: R$ 3.600.000 identificado
- Lucro Presumido: Presunção 32% (serviços), 8% (comércio/indústria), IRPJ 15%+10%, CSLL 9%, PIS 0,65%, COFINS 3,0%
- Lucro Real: IRPJ 15%+10%, CSLL 9%, PIS 1,65%, **COFINS 7,6%** (confirmado, não 7,65%)
- CPRB 2026: Transição gradual 60% CPRB + 10% CPP conforme Lei 14.973/2024
- Encargos trabalhistas: INSS 20%, RAT 1-3%, Sistema S 5,8%, FGTS 8%

## ERROS - Cálculos (MUST FIX)

### CT-E1: DIFAL não calculado
**Onde:** Não implementado em nenhum módulo
**Problema:** Vendas interestaduais para consumidor final não calculam o diferencial de alíquota do ICMS. Empresas de comércio que vendem para fora do estado têm carga tributária subestimada.
**Base legal:** EC 87/2015, Convênio ICMS 236/2021
**Impacto:** Alto para e-commerce e comércio interestadual

### CT-E2: Sublimite Simples - ISS/ICMS separado não calculado
**Onde:** `src/data/taxHelpers.js` (checkSublimiteSimples)
**Problema:** O alerta de sublimite existe, mas quando faturamento excede R$ 3,6M o sistema não calcula ISS e ICMS separadamente (fora do DAS). O contribuinte pagaria esses tributos à parte mas o simulador não mostra isso.
**Base legal:** LC 123/2006, Art. 13-A
**Impacto:** Carga tributária real fica subestimada acima de R$ 3,6M

### CT-E3: Retenções na fonte ausentes na precificação
**Onde:** `src/pages/Precificacao.jsx`
**Problema:** O preço de venda calculado não considera retenções na fonte (IRRF 1,5%, CSRF 4,65%, ISS retido). O empresário precisa saber que vai receber menos do que o preço cobrado.
**Base legal:** IN RFB 1.234/2012, LC 116/2003 Art. 6
**Impacto:** Fluxo de caixa real diferente do projetado

### CT-E4: Disclaimer ausente em páginas com cálculos tributários
**Onde:** `src/pages/Precificacao.jsx`, `src/pages/AnaliseViabilidade.jsx`, `src/pages/PontoEquilibrio.jsx`
**Problema:** DisclaimerBanner (aviso legal) presente em SimuladorTributario, ComparativoRegimes, DRE e Enquadramento, mas ausente nestas 3 páginas que também fazem cálculos tributários.
**Impacto:** Risco legal - todas as páginas com cálculos tributários precisam do disclaimer

### CT-E5: "Lei 15.270/2025" possivelmente fictícia
**Onde:** `src/data/taxData.js` (linhas ~401-419, 474), `DOCUMENTACAO_LEGAL_TRIBUTARIA.md` (linhas 325-336)
**Problema:** O sistema cita "Lei 15.270/2025" como base para o sistema de redução progressiva do IRPF (isenção até R$ 5.000, faseout até R$ 7.350). Esta lei pode não existir na legislação brasileira real. O CLAUDE.md já adverte sobre este risco ("Nunca incluir leis fictícias" - houve bug anterior com "LC 224/2025" inexistente).
**Ação:** Verificar existência da lei. Se inexistente, remover TODAS as referências e usar legislação real (Portaria MF 14/2024 ou equivalente). Se existente, manter com referência ao DOU.
**Impacto:** CRÍTICO - referência legal fictícia mina credibilidade do sistema inteiro
**Base legal correta (se lei não existir):** Portaria MF 1.720/2023, Lei 13.149/2015

### CT-E6: CSLL 20% para bancos - vigência temporária
**Onde:** `src/data/taxData.js` (linha ~696)
**Problema:** Alíquota de 20% de CSLL para instituições financeiras é prorrogada anualmente via Medida Provisória (original Lei 13.169/2015). Em 2026, verificar se foi prorrogada ou voltou para 15%.
**Ação:** Confirmar MP/Lei vigente em 2026. Se não prorrogada, ajustar para 15%. Adicionar comentário sobre vigência temporária.

### CT-E7: Sublimite Simples varia por estado (hardcoded R$ 3.6M)
**Onde:** `src/data/taxHelpers.js` (checkSublimiteSimples), `src/data/taxData.js` (~linha 1437)
**Problema:** Sublimite de R$ 3.600.000 para recolhimento separado de ISS/ICMS não é federal - é estadual. Ex: SP e MG = R$ 3,6M, mas PR e RJ = R$ 1,8M.
**Ação:** No mínimo adicionar aviso de que sublimite varia por estado. Idealmente, adicionar parâmetro `estado` na função com tabela de sublimites por UF.
**Base legal:** LC 123/2006, Art. 13, § 1º

## MELHORIAS - Cálculos (NICE TO HAVE)

### CT-I1: Fator R - documentar componentes da folha
**Onde:** `src/data/taxHelpers.js`, tooltips em SimuladorTributario/Precificacao
**Detalhe:** Cálculo está correto mas não orienta o que incluir na folha. Conforme LC 123/2006 Art. 18 § 5º-C e STJ REsp 1.221.170/PR: incluir salários + 13º + férias + 1/3 + pró-labore + INSS patronal + FGTS. NÃO incluir autônomos, terceirizados, estagiários.

### CT-I2: Validação CNAE para MEI
**Onde:** `src/data/taxData.js` (linhas 68-81)
**Detalhe:** Lista de atividades proibidas existe mas não é validada no cálculo. Poderia retornar erro automático para atividades incompatíveis.

### CT-I3: Lucro Real - apenas trimestral implementado
**Onde:** `src/pages/SimuladorTributario.jsx`
**Detalhe:** Estimativa mensal (balancete de suspensão/redução) não está implementada. Muitas empresas do Lucro Real usam essa modalidade.

### CT-I4: RAT/FAP dinâmico
**Onde:** `src/data/taxData.js` (linha ~879)
**Detalhe:** RAT fixo em 3% (máximo). Na realidade varia 1-3% por CNAE e ainda é multiplicado pelo FAP (0,5 a 2,0). Permitir entrada do grau de risco e FAP.

### CT-I5: PIS/COFINS monofásico
**Detalhe:** Revendedores de combustíveis, medicamentos, veículos e bebidas frias NÃO pagam PIS/COFINS (regime monofásico). Relevante para precificação de comércio.

### CT-I6: Serviços hospitalares - validar requisitos
**Onde:** `src/data/taxData.js` (linha ~559)
**Detalhe:** Presunção de 8% IRPJ para serviços hospitalares só vale para sociedade empresária com ANVISA (Lei 11.727/2008 Art. 29). Adicionar aviso/validação.

---

# PARTE 2: UX/UI & USABILIDADE

## ERROS - UX (MUST FIX)

### UX-E1: Sem validação nos inputs críticos de precificação
**Onde:** `src/pages/Precificacao.jsx:23-40`
**Problema:** Campos como custo do produto, despesas fixas e margem desejada não têm validação. Aceita valores negativos, zero ou percentuais impossíveis.
**Impacto:** Cálculos errados e decisões de negócio incorretas

### UX-E2: Sem validação no simulador tributário
**Onde:** `src/pages/SimuladorTributario.jsx:26-45`
**Problema:** Campos críticos (receitaMensal, rbt12, folhaMensal) sem validação.
**Impacto:** Cálculos tributários incorretos

### UX-E3: RBT12 pode ser menor que receita mensal × 12
**Onde:** `src/pages/SimuladorTributario.jsx:146-157`
**Problema:** Nenhuma validação impede cenário matematicamente impossível.

### UX-E4: Campos obrigatórios sem indicador visual
**Onde:** `src/components/Onboarding.jsx:64-71`
**Problema:** Campo `nomeEmpresa` é obrigatório mas não mostra asterisco (*) ou label "obrigatório"

### UX-E5: Email sem validação de formato
**Onde:** `src/components/FeedbackWidget.jsx:177`, `src/pages/Propostas.jsx:122,138`
**Problema:** Campo de email aceita qualquer texto

### UX-E6: CNPJ sem máscara ou validação
**Onde:** `src/components/Onboarding.jsx:174-179`, `src/pages/Propostas.jsx:112,136`
**Problema:** CNPJ é texto livre, deveria ser XX.XXX.XXX/XXXX-XX com validação de dígitos

### UX-E7: Tabs não navegáveis por teclado
**Onde:** `src/components/TabsContainer.jsx:15-59`
**Problema:** Sem `role="tab"`, `role="tablist"` ou navegação por setas.
**Impacto:** Usuários de teclado não conseguem navegar tabs

### UX-E8: Gráficos sem alternativa textual
**Onde:** Todas as páginas com Recharts
**Problema:** Charts são SVGs puramente visuais sem aria-label ou resumo textual.
**Impacto:** Usuários cegos não recebem nenhuma informação dos gráficos

### UX-E9: Botões apenas com ícone sem aria-label
**Onde:** `src/components/Sidebar.jsx:83-88,163-169`
**Problema:** Botão de fechar (X) e recolher menu sem aria-label quando sidebar está colapsada

### UX-E10: Modais sem role="dialog"
**Onde:** `src/components/FeedbackWidget.jsx:93-98`
**Problema:** Painéis modais não usam roles ARIA semânticas (dialog, aria-modal)

### UX-E11: Tabs overflow no mobile
**Onde:** `src/components/TabsContainer.jsx:14-60`
**Problema:** Labels longos ("Precificação Avançada", "Markup sobre CMV") cortados em telas <400px
**Fix:** Adicionar `overflow-x-auto` ao container

### UX-E12: Tabela de Propostas não scrollável no mobile
**Onde:** `src/pages/Propostas.jsx:151-194`
**Problema:** Tabela com 6 colunas sem scroll horizontal
**Impacto:** Conteúdo inacessível no celular

### UX-E13: Excluir custo sem confirmação
**Onde:** `src/pages/CustosOperacionais.jsx:94-97`
**Problema:** Clique no ícone de lixeira exclui imediatamente. Sem undo.
**Impacto:** Perda acidental de dados importantes

### UX-E14: Excluir item de proposta sem confirmação
**Onde:** `src/pages/Propostas.jsx:40-42`
**Problema:** Botão de lixeira remove item sem aviso

### UX-E15: Excluir cenário salvo sem confirmação
**Onde:** `src/pages/ComparativoRegimes.jsx:192-196`
**Problema:** excluirCenario() exclui comparação salva imediatamente

### UX-E16: localStorage sem tratamento de quota excedida
**Onde:** Todas as páginas com localStorage.setItem
**Problema:** Catch blocks vazios - sem feedback quando storage está cheio

### UX-E17: Dados corrompidos no localStorage crasham silenciosamente
**Onde:** `src/App.jsx:72-84`
**Problema:** JSON.parse errors limpa dados sem avisar o usuário

### UX-E18: Sem mecanismo de backup/export de dados
**Onde:** Aplicação inteira
**Problema:** Se usuário limpar dados do browser, perde tudo permanentemente.
**Impacto:** Alto risco de perda de dados

### UX-E19: Padrões de persistência inconsistentes
**Onde:** Múltiplas páginas
**Problema:** SimuladorTributario usa useEffect manual, Propostas usa useLocalStorage hook, Precificacao usa useEffect manual, Dashboard não persiste. Hook useLocalStorage existe mas não é adotado.

### UX-E20: DisclaimerBanner inconsistente
**Onde:** Precificacao, AnaliseViabilidade, PontoEquilibrio
**Problema:** Disclaimer legal presente em 4 páginas mas ausente nestas 3 que também calculam impostos

### UX-E21: PageHeader não usado em todas as páginas
**Onde:** Dashboard, AnaliseViabilidade, Enquadramento
**Problema:** Usam headers customizados ao invés do componente compartilhado PageHeader

### UX-E22: Termos técnicos complexos sem explicação
**Onde:** `src/pages/SimuladorTributario.jsx:278-300`
**Problema:** Campos LALUR (Adições, Exclusões) com nomes técnicos e help text mínimo

### UX-E23: Markup Calculator sem texto introdutório
**Onde:** `src/components/MarkupCalculatorTab.jsx:16-68`
**Problema:** Fórmula de markup apresentada sem explicação do que é markup vs margem

## MELHORIAS - UX (NICE TO HAVE)

### UX-I1: Aceitar vírgula como separador decimal
**Onde:** `src/components/InputField.jsx:11-16`
**Detalhe:** Brasileiros usam vírgula (,) como separador decimal, mas input só aceita ponto (.)

### UX-I2: Percentuais com precisão inconsistente
**Onde:** Várias páginas
**Detalhe:** Alguns mostram `30.0%`, outros `30%`, outros `30.00%`. Padronizar para 1 casa decimal.

### UX-I3: Indicador de salvamento automático
**Onde:** Todas as páginas com formulários
**Detalhe:** Dados salvam automaticamente mas sem feedback visual. Checkmark sutil "Salvo" melhoraria confiança.

### UX-I4: Versionamento de dados no localStorage
**Onde:** Todas as chaves localStorage
**Detalhe:** Sem campo `dataVersion`. Mudanças futuras de schema quebrarão dados existentes.

### UX-I5: Terminologia mista "Receita Bruta" vs "Faturamento"
**Onde:** Múltiplas páginas
**Detalhe:** Padronizar (recomendo "Faturamento" por ser mais acessível)

### UX-I6: Estilos de botões inconsistentes
**Onde:** Múltiplas páginas
**Detalhe:** Mix de bg-brand-50, bg-brand-600, bg-[#001a2d]. Criar variantes padronizadas.

### UX-I7: Breakpoints mobile poderiam ser mais granulares
**Onde:** Múltiplas páginas
**Detalhe:** grid-cols-1 pula para grid-cols-4. Melhor usar sm:grid-cols-2.

### UX-I8: Empty states sem ação
**Onde:** QuantoSobraCard, Relatorios
**Detalhe:** Dizem o que falta mas não linkam para a ação (botão "Calcular Preço", etc.)

### UX-I9: Skip-to-content link ausente
**Onde:** `src/App.jsx`
**Detalhe:** Link invisível "Ir para conteúdo principal" que aparece no focus para teclado

### UX-I10: aria-current="page" no menu ativo
**Onde:** `src/components/Sidebar.jsx:114-139`
**Detalhe:** NavLink tem estado visual isActive mas sem aria-current

### UX-I11: Focus indicators pouco visíveis
**Onde:** `src/index.css:38-42`
**Detalhe:** CSS remove tap-highlight mas não melhora focus rings para teclado

### UX-I12: Busca/filtro nos módulos
**Onde:** `src/pages/Dashboard.jsx:107-116`
**Detalhe:** 12 módulos sem busca. Campo de filtro ajudaria a encontrar ferramenta.

### UX-I13: Significado do "progresso" na sidebar
**Onde:** `src/components/Sidebar.jsx:93-97`
**Detalhe:** ProgressBadge mostra 30% mas sem explicação do que significa

### UX-I14: Sem breadcrumbs ou navegação "voltar"
**Onde:** Todas as páginas
**Detalhe:** Só pode navegar pela sidebar. Breadcrumb trail no PageHeader ajudaria.

### UX-I15: Undo global ausente
**Onde:** Aplicação inteira
**Detalhe:** Nenhuma operação tem undo. Toast "Item removido. Desfazer?" seria ideal.

### UX-I16: Draft system para Propostas
**Onde:** `src/pages/Propostas.jsx`
**Detalhe:** "Salvar como Rascunho" e lista de propostas salvas

### UX-I17: Estado vazio do ComparativoRegimes
**Onde:** `src/pages/ComparativoRegimes.jsx:92-127`
**Detalhe:** Se cálculo falha, gráfico renderiza vazio sem explicação

### UX-I18: Relatorios sem estado "sem dados"
**Onde:** `src/pages/Relatorios.jsx`
**Detalhe:** Se localStorage vazio, export falha silenciosamente

### UX-I19: Onboarding poderia explicar regimes melhor
**Onde:** `src/components/Onboarding.jsx:23-28`
**Detalhe:** Tooltips curtos. "Saiba mais" com tabela comparativa ajudaria

### UX-I20: Mensagens de erro mais específicas
**Onde:** `src/data/taxData.js` (calcMEI, calcSimplesTax)
**Detalhe:** Retorna `excedeLimite: true` genérico. Melhor: "Faturamento de R$ X excede limite de R$ Y."

### UX-I21: Números grandes sem separador de milhar em tabelas
**Onde:** Tabelas em Propostas, CustosOperacionais
**Detalhe:** Valores monetários sem formatação em células de tabela

### UX-I22: Input de percentuais sem limitar 0-100
**Onde:** Múltiplas páginas
**Detalhe:** margemDesejada, desconto não enforce range

### UX-I23: Descrição do PageHeader esconde em mobile
**Onde:** `src/components/PageHeader.jsx:8-10`
**Detalhe:** Texto descritivo sempre visível, deixa header alto no mobile

### UX-I24: Feedback de sucesso do InputField raramente visível
**Onde:** `src/components/InputField.jsx:44,59`
**Detalhe:** Checkmark verde só aparece se successMsg fornecido. Auto-show quando válido e tocado.

---

# PARTE 3: FUNCIONALIDADES FALTANTES

## ERROS - Features que tornam cálculos incorretos/enganosos (MUST FIX)

### FT-E1: DIFAL não implementado
**Impacto:** Empresas de comércio que vendem para outros estados têm carga tributária real diferente do mostrado
**Base legal:** EC 87/2015, Convênio ICMS 236/2021
**Onde adicionar:** ComparativoRegimes e SimuladorTributario

### FT-E2: Retenções na fonte ausentes
**Impacto:** Precificação mostra preço bruto mas empresário recebe menos (IRRF 1,5% + CSRF 4,65% + ISS retido). Fluxo de caixa real difere do projetado.
**Base legal:** IN RFB 1.234/2012
**Onde adicionar:** Precificacao (campo "Valor líquido recebido") e novo módulo de Retenções

### FT-E3: Sublimite Simples - cálculo ISS/ICMS separado
**Impacto:** Acima de R$ 3,6M no Simples, ISS e ICMS são pagos separadamente (fora do DAS). Sistema alerta mas não calcula.
**Base legal:** LC 123/2006, Art. 13-A
**Onde adicionar:** SimuladorTributario e ComparativoRegimes

### FT-E4: Disclaimers faltando (repetido do CT-E4)
**Impacto:** Risco legal
**Onde:** Precificacao, AnaliseViabilidade, PontoEquilibrio

## ALTO VALOR - Features que contadores consideram essenciais (STRONGLY RECOMMENDED)

### FT-H1: Substituição Tributária (ICMS-ST)
**Detalhe:** Dados de ST existem no taxData.js mas não estão integrados na precificação. Essencial para comércio.
**Impacto:** Preço de venda pode estar significativamente errado para produtos com ST

### FT-H2: Simulador de transição MEI → Simples
**Detalhe:** Quando MEI se aproxima do limite de R$ 81k, precisa de simulação: "Se eu faturar R$ X a mais, quanto pago no Simples?"
**Onde:** Novo sub-módulo em Enquadramento

### FT-H3: Otimizador Pró-labore vs Distribuição de Lucros
**Detalhe:** Pró-labore paga INSS (11%+20%) + IRPF. Distribuição de lucros é isenta de IR (até o limite da presunção). Encontrar o mix ótimo economiza muito.
**Onde:** Novo sub-módulo em SimuladorTributario ou módulo próprio

### FT-H4: DEFIS / DASN-SIMEI - gerador de relatório anual
**Detalhe:** Todo Simples precisa da DEFIS (março). Todo MEI precisa da DASN-SIMEI. O sistema poderia gerar um rascunho com os dados já preenchidos.
**Onde:** CalendarioFiscal ou Relatorios

### FT-H5: Fluxo de Caixa Projetado (novo módulo)
**Detalhe:** Módulo mais pedido por contadores. Projeção de entradas/saídas considerando prazo de recebimento, impostos diferidos, sazonalidade.
**Impacto:** Complementa DRE e Ponto de Equilíbrio

### FT-H6: Planejamento Tributário Anual (novo módulo)
**Detalhe:** Consolidar dados do ano, simular mudança de regime para o próximo exercício, calcular economia.
**Impacto:** Feature diferenciadora para consultores

### FT-H7: Checklist interativo de obrigações acessórias
**Detalhe:** Calendário Fiscal mostra datas, mas não permite marcar como "cumprido". Checklist com status e alertas seria muito mais útil.
**Onde:** Evolução do CalendarioFiscal

### FT-H8: Lucro Real - estimativa mensal (balancete suspensão/redução)
**Detalhe:** Apenas trimestral implementado. Muitas empresas usam estimativa mensal com balancete para pagar menos imposto.
**Onde:** SimuladorTributario quando regime = Lucro Real

### FT-H9: Cálculo de encargos sobre pró-labore separado
**Detalhe:** CustosOperacionais calcula encargos sobre funcionários CLT. Pró-labore tem encargos diferentes (INSS 11% + patronal 20%, sem FGTS, sem férias, sem 13º).
**Onde:** CustosOperacionais - seção específica

### FT-H10: Comparativo com cenário de crescimento
**Detalhe:** "Se eu crescer 30%, ainda vale a pena ficar no Simples?" - cruzar ProjecaoCrescimento com ComparativoRegimes.
**Onde:** Integração entre módulos existentes

### FT-H11: Alertas de mudança de faixa do Simples
**Detalhe:** Quando o faturamento está próximo de mudar de faixa (ex: de 5ª para 6ª), alertar o impacto na alíquota.
**Onde:** Dashboard e SimuladorTributario

## NICE TO HAVE - Útil mas não crítico

### FT-N1: Prejuízo fiscal - compensação (Lucro Real)
**Detalhe:** Limitado a 30% do lucro do período. Tracking multi-período.

### FT-N2: Orientação de Nota Fiscal (CST/CSOSN)
**Detalhe:** Com base no regime e atividade, sugerir códigos de situação tributária.

### FT-N3: Simulador de cenários (Monte Carlo)
**Detalhe:** "E se o faturamento variar entre R$ X e R$ Y?" com probabilidades.

### FT-N4: Módulo simplificado de folha de pagamento
**Detalhe:** Calcular custo total de um funcionário (salário → custo empresa).

### FT-N5: Integração NCM/CNAE via lookup
**Detalhe:** Buscar alíquotas e ST por NCM/CNAE.

### FT-N6: Export PDF profissional de propostas
**Detalhe:** Gerar PDF com logo, dados do cliente, detalhamento de preço.

### FT-N7: Comparativo histórico (mês a mês)
**Detalhe:** Salvar cálculos mensais e mostrar evolução.

### FT-N8: Multi-empresa / Multi-cliente
**Detalhe:** Permitir salvar perfis de diferentes clientes para consultores.

---

# PARTE 4: OBSERVAÇÕES VISUAIS (Navegação pelo site)

Observações capturadas navegando pelo aplicativo rodando:

### V1: Dashboard - Saudação incompleta
**Onde:** Dashboard, header
**Problema:** Mostra "Olá, a" - nome do usuário não carregado ou vazio. Deveria mostrar "Olá!" quando sem nome, ou carregar do Onboarding.

### V2: Sidebar - "Enquadramento Tributá..." truncado
**Onde:** Sidebar, menu lateral
**Problema:** Nome longo truncado com "...". Considerar nome mais curto como "Enquadramento" apenas.

### V3: Visual geral - profissional e consistente
**Observação positiva:** Layout limpo, sidebar dark, cards bem espaçados, gráficos informativos. Não há necessidade de mudanças de cor/fonte/layout.

### V4: Calendário Fiscal - bem estruturado
**Observação positiva:** Tabelas claras com periodicidade, vencimento e observações. Referência à extinção da DIRF (IN RFB 2.181/2024) está correta.

### V5: DRE - mostrando prejuízo corretamente
**Observação positiva:** Com os dados default, mostra "Prejuízo Líquido -R$ 1.500,00" e Margem Líquida "-1.5%" - sinalização visual vermelha correta.

---

# PRIORIZAÇÃO RECOMENDADA

## Sprint 1 - Correções Críticas (MUST FIX)
1. **CT-E5:** Verificar/remover "Lei 15.270/2025" - possivelmente fictícia (URGENTE)
2. **CT-E4 / FT-E4:** Adicionar DisclaimerBanner nas 3 páginas faltantes
3. **UX-E13, E14, E15:** Confirmação antes de excluir (custos, propostas, cenários)
4. **UX-E1, E2:** Validação de inputs críticos no Simulador e Precificação
5. **UX-E18:** Botão "Exportar Dados" em Configurações
6. **V1:** Corrigir saudação "Olá, a" no Dashboard
7. **FT-E3 / CT-E7:** Calcular ISS/ICMS separado quando sublimite excedido + aviso sublimite por estado
8. **CT-E6:** Verificar prorrogação CSLL 20% bancos em 2026

## Sprint 2 - Alto Valor
7. **FT-E1/E2:** DIFAL e Retenções na fonte (pelo menos mostrar aviso)
8. **FT-H1:** Integrar Substituição Tributária na precificação
9. **FT-H2:** Simulador MEI → Simples
10. **FT-H3:** Otimizador pró-labore vs distribuição
11. **UX-E6:** Máscara CNPJ
12. **UX-E7:** Tabs com ARIA e teclado
13. **UX-E19:** Migrar todas as páginas para useLocalStorage hook

## Sprint 3 - Novos Módulos
14. **FT-H5:** Módulo de Fluxo de Caixa
15. **FT-H6:** Planejamento Tributário Anual
16. **FT-H7:** Checklist interativo no Calendário Fiscal
17. **FT-H9:** Encargos sobre pró-labore separado
18. **UX-E8:** Alternativas textuais para gráficos
19. **UX-I1:** Aceitar vírgula como separador decimal

## Backlog (Nice to Have)
- Todos os itens FT-N1 a FT-N8
- Todos os itens UX-I restantes
- CT-I1, CT-I2, CT-I3

---

# DECISÕES PENDENTES DO PRODUCT OWNER

Para criar os PRDs, preciso das suas decisões sobre:

1. **DIFAL:** Implementar cálculo completo ou apenas alertar que existe?
2. **Retenções:** Módulo próprio ou integrar nos cálculos existentes?
3. **ST (Substituição Tributária):** Integrar na precificação ou só alertar?
4. **Fluxo de Caixa:** Módulo completo ou projeção simplificada?
5. **Multi-cliente:** Suporte a múltiplos perfis de empresa?
6. **Accessibility:** Qual nível de conformidade WCAG almejar (A, AA, AAA)?
7. **Validações:** Bloquear cálculo com input inválido ou apenas alertar?
8. **Export de dados:** Apenas backup JSON ou também Excel/PDF?

---

*Documento gerado por auditoria automatizada com 3 agentes especializados + inspeção visual.*
*Nenhum código foi alterado durante esta auditoria.*
