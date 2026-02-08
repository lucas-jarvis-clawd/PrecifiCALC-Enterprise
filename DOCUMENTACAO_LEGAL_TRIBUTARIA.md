# Documentacao Legal e Tributaria - PrecifiCALC Enterprise

## Nota Importante

Este documento consolida as referencias legais, aliquotas e formulas tributarias utilizadas no sistema PrecifiCALC Enterprise. As informacoes aqui documentadas foram extraidas da legislacao brasileira vigente e implementadas no arquivo `src/data/taxData.js`.

**Este sistema nao substitui consultoria juridica ou contabil profissional.** Todos os calculos sao estimativas e devem ser validados por um contador habilitado (CRC ativo).

**Ultima atualizacao dos dados:** Fevereiro/2026
**Ano-base dos valores:** 2026

---

## 1. Constantes e Valores Base (2026)

| Item | Valor | Fonte Legal |
|------|-------|-------------|
| Salario Minimo | R$ 1.621,00 | Decreto federal (anual) |
| Teto INSS | R$ 8.475,55 | Portaria MPS (anual) |
| INSS MEI (5% SM) | R$ 81,05 | LC 123/2006, Art. 18-B + Lei 8.212/1991, Art. 21, par. 2 |
| Limite MEI | R$ 81.000/ano | LC 123/2006, Art. 18-A |
| Limite MEI Caminhoneiro | R$ 251.600/ano | LC 128/2008 |
| Limite Simples Nacional | R$ 4.800.000/ano | LC 123/2006, Art. 3 |
| Limite Lucro Presumido | R$ 78.000.000/ano | Decreto 3.000/1999, Art. 246 |

### Faixas INSS 2026

| De | Ate | Aliquota |
|----|-----|----------|
| R$ 0 | R$ 1.621,00 | 7,5% |
| R$ 1.621,01 | R$ 2.902,84 | 9% |
| R$ 2.902,85 | R$ 4.354,27 | 12% |
| R$ 4.354,28 | R$ 8.475,55 | 14% |

---

## 2. MEI - Microempreendedor Individual

### Legislacao Aplicavel

- **LC 123/2006** - Estatuto da Microempresa (Arts. 18-A a 18-C)
- **LC 128/2008** - MEI Caminhoneiro
- **Lei 8.212/1991** - Lei da Previdencia Social (Art. 21, par. 2 e 3)
- **LC 116/2003** - ISS (Art. 6 - ISS fixo MEI: R$ 5,00/mes)
- **Resolucao CGSN 140/2018** - Procedimentos MEI (Arts. 72-80, Anexo XIII)

### Valores DAS Implementados

| Tipo | DAS Mensal | Composicao |
|------|-----------|------------|
| Comercio | R$ 82,05 | INSS R$ 81,05 + ICMS R$ 1,00 |
| Servicos | R$ 86,05 | INSS R$ 81,05 + ISS R$ 5,00 |
| Misto | R$ 87,05 | INSS R$ 81,05 + ICMS R$ 1,00 + ISS R$ 5,00 |
| Caminhoneiro | R$ 195,52 | INSS 12% SM (R$ 194,52) + ICMS R$ 1,00 |

### Formula

```
DAS = INSS (5% x Salario Minimo) + ISS (R$ 5,00) ou ICMS (R$ 1,00) ou ambos
MEI Caminhoneiro: INSS = 12% x Salario Minimo
```

---

## 3. Simples Nacional

### Legislacao Aplicavel

- **LC 123/2006** - Lei do Simples Nacional (Arts. 12-41)
  - Art. 18: Valores devidos mensalmente
  - Art. 18, par. 5-H: Fator R (criterio 28%)
  - Art. 3: Limites ME/EPP
  - Anexos I a V: Tabelas de aliquotas
- **Resolucao CGSN 140/2018** - Regulamentacao (Arts. 15-71)
  - Art. 27: Tabelas de aliquotas
  - Art. 37-A: Fator R
- **IN RFB 2.138/2024** - Procedimentos

### Formula de Calculo (Art. 18 da LC 123/2006)

```
Aliquota Efetiva = (RBT12 x Aliquota Nominal - Deducao) / RBT12
DAS Mensal = Receita Mensal x Aliquota Efetiva
```

Onde RBT12 = Receita Bruta Total dos ultimos 12 meses.

### Tabelas Implementadas

#### Anexo I - Comercio

| Faixa | RBT12 (De) | RBT12 (Ate) | Aliquota | Deducao |
|-------|-----------|------------|----------|---------|
| 1 | 0 | 180.000 | 4,0% | 0 |
| 2 | 180.000,01 | 360.000 | 7,3% | 5.940 |
| 3 | 360.000,01 | 720.000 | 9,5% | 13.860 |
| 4 | 720.000,01 | 1.800.000 | 10,7% | 22.500 |
| 5 | 1.800.000,01 | 3.600.000 | 14,3% | 87.300 |
| 6 | 3.600.000,01 | 4.800.000 | 19,0% | 378.000 |

#### Anexo II - Industria

| Faixa | RBT12 (De) | RBT12 (Ate) | Aliquota | Deducao |
|-------|-----------|------------|----------|---------|
| 1 | 0 | 180.000 | 4,5% | 0 |
| 2 | 180.000,01 | 360.000 | 7,8% | 5.940 |
| 3 | 360.000,01 | 720.000 | 10,0% | 13.860 |
| 4 | 720.000,01 | 1.800.000 | 11,2% | 22.500 |
| 5 | 1.800.000,01 | 3.600.000 | 14,7% | 85.500 |
| 6 | 3.600.000,01 | 4.800.000 | 30,0% | 720.000 |

#### Anexo III - Servicos (Fator R >= 28%)

| Faixa | RBT12 (De) | RBT12 (Ate) | Aliquota | Deducao |
|-------|-----------|------------|----------|---------|
| 1 | 0 | 180.000 | 6,0% | 0 |
| 2 | 180.000,01 | 360.000 | 11,2% | 9.360 |
| 3 | 360.000,01 | 720.000 | 13,5% | 17.640 |
| 4 | 720.000,01 | 1.800.000 | 16,0% | 35.640 |
| 5 | 1.800.000,01 | 3.600.000 | 21,0% | 125.640 |
| 6 | 3.600.000,01 | 4.800.000 | 33,0% | 648.000 |

#### Anexo IV - Servicos (Construcao, Limpeza, Vigilancia)

| Faixa | RBT12 (De) | RBT12 (Ate) | Aliquota | Deducao |
|-------|-----------|------------|----------|---------|
| 1 | 0 | 180.000 | 4,5% | 0 |
| 2 | 180.000,01 | 360.000 | 9,0% | 8.100 |
| 3 | 360.000,01 | 720.000 | 10,2% | 12.420 |
| 4 | 720.000,01 | 1.800.000 | 14,0% | 39.780 |
| 5 | 1.800.000,01 | 3.600.000 | 22,0% | 183.780 |
| 6 | 3.600.000,01 | 4.800.000 | 33,0% | 828.000 |

**Observacao:** CPP nao incluso no Anexo IV. Recolhido a parte via GPS (20% sobre folha). Base: Lei 8.212/1991.

#### Anexo V - Servicos Intelectuais (Fator R < 28%)

| Faixa | RBT12 (De) | RBT12 (Ate) | Aliquota | Deducao |
|-------|-----------|------------|----------|---------|
| 1 | 0 | 180.000 | 15,5% | 0 |
| 2 | 180.000,01 | 360.000 | 18,0% | 4.500 |
| 3 | 360.000,01 | 720.000 | 19,5% | 9.900 |
| 4 | 720.000,01 | 1.800.000 | 20,5% | 17.100 |
| 5 | 1.800.000,01 | 3.600.000 | 23,0% | 62.100 |
| 6 | 3.600.000,01 | 4.800.000 | 30,5% | 540.000 |

### Fator R

```
Fator R = Folha de Pagamento (12 meses) / Receita Bruta (12 meses)
Se Fator R >= 28%: tributa pelo Anexo III
Se Fator R < 28%: tributa pelo Anexo V
```

**Base legal:** LC 123/2006, Art. 18, par. 5-H + Resolucao CGSN 140/2018, Art. 37-A

**Componentes da folha (STJ REsp 1.221.170/PR):** salarios, 13o, ferias + 1/3, pro-labore, contribuicoes previdenciarias, FGTS. Exclui: autonomos, terceirizados, estagiarios.

### Sublimites

- ICMS/ISS: R$ 3.600.000 (acima disso, recolhe separadamente)
- Simples Nacional: R$ 4.800.000

---

## 4. Lucro Presumido

### Legislacao Aplicavel

- **Decreto 3.000/1999** - Regulamento do IR (Arts. 516-528)
  - Art. 518: Presuncao servicos (32%)
  - Art. 519: Presuncao comercio/industria (8%)
  - Art. 525: Adicional IRPJ
- **Lei 9.718/1998** - PIS/COFINS cumulativo (Art. 2-3)
- **Lei 12.546/2011** - CPRB (Arts. 7-9)

### Percentuais de Presuncao Implementados

| Atividade | Presuncao IRPJ | Presuncao CSLL |
|-----------|---------------|----------------|
| Servicos em geral | 32% | 32% |
| Comercio e industria | 8% | 12% |
| Transporte de carga | 8% | 12% |
| Transporte de passageiros | 16% | 12% |
| Servicos hospitalares | 8% | 12% |
| Revenda de combustiveis | 1,6% | 12% |
| Intermediacao de negocios | 32% | 32% |
| Administracao de bens | 32% | 32% |
| Locacao de bens moveis | 32% | 32% |
| Construcao civil (servicos) | 32% | 32% |
| Factoring | 32% | 32% |

### Aliquotas dos Tributos

| Tributo | Aliquota | Base Legal |
|---------|----------|------------|
| IRPJ | 15% sobre base presumida | Decreto 3.000/1999, Art. 521 |
| Adicional IRPJ | 10% sobre excedente de R$ 20.000/mes | Decreto 3.000/1999, Art. 525 |
| CSLL | 9% sobre base presumida | Decreto 3.000/1999, Art. 522 |
| CSLL (financeiras/seguradoras) | 15% | Lei 10.637/2002 |
| PIS (cumulativo) | 0,65% sobre receita | Lei 9.718/1998 |
| COFINS (cumulativa) | 3% sobre receita | Lei 9.718/1998 |
| ISS | 2% a 5% (conforme municipio) | LC 116/2003 |

### Formula

```
Base IRPJ = Receita Trimestral x Percentual de Presuncao (IRPJ)
Base CSLL = Receita Trimestral x Percentual de Presuncao (CSLL)

IRPJ = Base x 15% + (Base - R$ 60.000) x 10% [se base > R$ 60.000/trimestre]
CSLL = Base x 9%
PIS = Receita Mensal x 0,65%
COFINS = Receita Mensal x 3%
```

---

## 5. Lucro Real

### Legislacao Aplicavel

- **Decreto 3.000/1999** - RIR (Arts. 246-285)
  - Art. 249: Conceito de lucro real
  - Art. 274-280: LALUR
- **Lei 10.637/2002** - PIS nao-cumulativo (Arts. 1-3)
- **Lei 10.833/2003** - COFINS nao-cumulativa (Arts. 1-3, 15-17)
- **Lei 9.430/1996** - Legislacao tributaria
- **Lei 11.638/2007** - Convergencia contabil

### Aliquotas Implementadas

| Tributo | Aliquota | Observacao |
|---------|----------|------------|
| IRPJ | 15% sobre lucro tributavel | Decreto 3.000/1999 |
| Adicional IRPJ | 10% sobre excedente R$ 20.000/mes | Decreto 3.000/1999 |
| CSLL | 9% (regra geral) | Decreto 3.000/1999 |
| CSLL | 20% (bancos/financeiras) | Lei especifica |
| CSLL | 15% (seguradoras, factoring, coop. credito) | Lei especifica |
| PIS (nao-cumulativo) | 1,65% com creditos | Lei 10.637/2002, Art. 2 |
| COFINS (nao-cumulativa) | 7,6% com creditos | Lei 10.833/2003, Art. 2 |

### Formula

```
Lucro Contabil = Receitas - Despesas
Lucro Real = Lucro Contabil + Adicoes LALUR - Exclusoes LALUR
Base IRPJ = Lucro Real
Base CSLL = Lucro Real

IRPJ = Base x 15% + (Base - R$ 60.000/trim) x 10%
CSLL = Base x 9%
PIS = (Receita x 1,65%) - Creditos PIS
COFINS = (Receita x 7,6%) - Creditos COFINS
```

### Creditos PIS/COFINS (Lei 10.637/2002, Art. 3)

Creditos admitidos sobre:
- Aquisicoes para revenda
- Insumos de producao
- Energia eletrica
- Alugueis de maquinas e equipamentos
- Depreciacao de bens do ativo

---

## 6. CPRB - Desoneracão da Folha

### Legislacao Aplicavel

- **Lei 12.546/2011** - Criacao da CPRB
- **Lei 14.973/2024** - Reoneracao gradual

### Cronograma de Reoneracao (Lei 14.973/2024)

| Ano | Fator CPRB | CPP sobre Folha |
|-----|-----------|-----------------|
| 2025 | 80% da aliquota | 5% |
| 2026 | 60% da aliquota | 10% |
| 2027 | 40% da aliquota | 15% |
| 2028+ | 0% (extinto) | 20% (normal) |

### Aliquotas por Setor (Implementadas)

| Setor | Aliquota Original | Efetiva 2026 (60%) |
|-------|-------------------|-------------------|
| TI / Servicos de TI | 4,5% | 2,7% |
| Call Center | 2,0% | 1,2% |
| Construcao de obras | 2,0% | 1,2% |
| Hoteis | 2,0% | 1,2% |
| Comunicacao | 2,0% | 1,2% |
| Construcao naval | 2,0% | 1,2% |
| Industria de calcados | 1,5% | 0,9% |
| Industria textil | 1,5% | 0,9% |
| Industria de confeccao | 1,5% | 0,9% |
| Industria de couro | 1,5% | 0,9% |

### Formula

```
Valor CPRB = Receita Bruta x Aliquota Setor x Fator Reoneracao (60% em 2026)
Valor CPP Folha = Folha Mensal x 10% (em 2026)
Total = Valor CPRB + Valor CPP Folha
```

---

## 7. IRRF - Imposto de Renda Retido na Fonte

### Legislacao Aplicavel

- **IN RFB 1.500/2014** - Procedimentos IRRF
- **IN RFB 1.234/2012** - IRRF sobre servicos PJ
- **Decreto 3.000/1999** - Regulamento IR

### Retencao sobre Servicos PJ (Implementado)

| Aliquota | Atividades |
|----------|-----------|
| 1,5% | Limpeza, conservacao, manutencao, seguranca, vigilancia |
| 3,0% | Advocacia, engenharia, arquitetura, auditoria, consultoria |
| 4,65% | Medicina, odontologia, psicologia, fisioterapia |

### Tabela IRRF Pessoa Fisica 2026 (Implementada)

| De | Ate | Aliquota | Deducao |
|----|-----|----------|---------|
| 0 | 2.112,00 | Isento | 0 |
| 2.112,01 | 2.826,65 | 7,5% | R$ 158,40 |
| 2.826,66 | 3.751,05 | 15% | R$ 370,40 |
| 3.751,06 | 4.664,68 | 22,5% | R$ 651,73 |
| 4.664,69+ | - | 27,5% | R$ 884,96 |

Deducao por dependente: R$ 189,59

---

## 8. Substituicao Tributaria (ICMS-ST)

### Legislacao Aplicavel

- **LC 87/1996 (Lei Kandir)** - Art. 6 (responsabilidade por ST) e Art. 8, par. 1 (base de calculo ST)
- **Convenio ICMS 142/2018** - DIFAL
- **Convenio ICMS 100/1997** - ST por setores
- **Protocolos ICMS especificos por setor** (CONFAZ)
- **Resolucao Senado 22/1989** - Aliquotas interestaduais

### MVA e Aliquotas Implementadas

| Categoria | Produto | MVA | Aliquota Interna |
|-----------|---------|-----|-----------------|
| Combustiveis | Gasolina | 46% | 17% |
| Combustiveis | Etanol | 64% | 13% |
| Combustiveis | Diesel | 21% | 12% |
| Cigarros | Nacional | 115% | 25% |
| Cigarros | Importado | 135% | 25% |
| Bebidas | Cerveja | 35% | 17% |
| Bebidas | Refrigerante | 42% | 17% |
| Bebidas | Agua | 30% | 12% |
| Medicamentos | Todos | 36% | 18% |
| Automotivo | Automovel | 40% | 12% |
| Automotivo | Motocicleta | 35% | 17% |
| Automotivo | Pneumatico | 30% | 17% |
| Eletronicos | Smartphone | 41,5% | 17% |
| Eletronicos | Computador | 30% | 17% |
| Eletronicos | Televisor | 35% | 17% |

### Formula ST (LC 87/1996, Art. 8, par. 1)

```
Base ST = (Valor Operacao + IPI + Frete + Seguro + Despesas) x (1 + MVA)
ICMS Proprio = Valor Operacao x Aliquota Origem
ICMS ST = (Base ST x Aliquota Interna Destino) - ICMS Proprio
```

---

## 9. ISS - Imposto sobre Servicos

### Legislacao Aplicavel

- **LC 116/2003** - Lei do ISS
  - Art. 1: Incidencia
  - Art. 7: Base de calculo
  - Art. 8: Aliquotas (2% a 5%)
  - Art. 8, par. 2: Aliquota minima 2%
  - Lista anexa: Servicos tributados

### Aliquotas por Municipio (Implementadas)

| Municipio | Aliquota |
|-----------|----------|
| Sao Paulo/SP | 2% (maioria dos servicos) |
| Rio de Janeiro/RJ | 5% |
| Brasilia/DF | 5% |
| Salvador/BA | 5% |
| Fortaleza/CE | 5% |
| Belo Horizonte/MG | 5% |
| Curitiba/PR | 5% |
| Recife/PE | 5% |
| Porto Alegre/RS | 5% |
| Manaus/AM | 5% |

---

## 10. Encargos Trabalhistas

### Legislacao Aplicavel

- **Lei 8.212/1991** - INSS Patronal (Art. 22: 20%)
- **Lei 8.036/1990** - FGTS (Art. 15: 8%, Art. 18: multa 40%)
- **CF/88** - Ferias + 1/3 constitucional, 13o salario

### Aliquotas Implementadas

| Encargo | Aliquota | Base Legal |
|---------|----------|------------|
| INSS Patronal | 20% | Lei 8.212/1991, Art. 22 |
| RAT/GILRAT | 1% a 3% | Lei 8.212/1991, Art. 22, par. 1 |
| Sistema S (SESI/SENAI/SEBRAE etc.) | 5,8% | Lei 8.212/1991, Art. 240 |
| FGTS | 8% | Lei 8.036/1990, Art. 15 |
| Salario-Educacao | 2,5% | Lei 8.212/1991, Art. 7 |
| Pro-labore (socio) | 11% | Lei 8.212/1991, Art. 21 |

### Provisoes

```
13o Salario = Salario x 1/12
Ferias + 1/3 = Salario x 1/12 x 4/3
Encargos sobre provisoes = (13o + Ferias) x (INSS + FGTS + RAT + Sistema S)
Multiplicador medio CLT = 1,7x a 1,9x o salario bruto
```

---

## 11. ICMS - Aliquotas Interestaduais

### Base Legal

- **Resolucao do Senado 22/1989** - Aliquotas interestaduais
- **LC 87/1996** - Lei Kandir
- **Convenio ICMS 142/2018** - DIFAL

### Regras

| Operacao | Aliquota |
|----------|----------|
| Sul/Sudeste para Norte/Nordeste/Centro-Oeste | 7% |
| Norte/Nordeste/Centro-Oeste para Sul/Sudeste | 12% |
| Demais operacoes interestaduais | 12% |

### Aliquotas Internas Tipicas

| UFs | Aliquota Padrao |
|-----|----------------|
| SP, RJ, MG, RS | 18% |
| PR, SC, GO, MS, MT | 17% |
| BA, PE, CE | 17-19% |

---

## 12. Jurisprudencia Relevante Considerada

| Decisao | Tese | Impacto no Sistema |
|---------|------|--------------------|
| STF RE 574.706 (Tema 69) | ICMS nao compoe base PIS/COFINS | Calculo de base PIS/COFINS |
| STF RE 1.287.019 (Tema 938) | DIFAL e constitucional | Calculo DIFAL |
| STJ REsp 1.221.170 | Fator R inclui toda remuneracao do trabalho | Calculo Fator R |
| STJ REsp 1.895.875 | Simples nao tem credito PIS/COFINS | Regime cumulativo no Simples |
| STJ REsp 1.324.112 | CPRB: base = receita bruta total | Calculo CPRB |

---

## 13. Reforma Tributaria (EC 132/2023) - Impacto Futuro

A Emenda Constitucional 132/2023 aprovou a reforma tributaria com transicao gradual:

| Periodo | Evento |
|---------|--------|
| 2026 | Inicio da transicao (teste dual CBS/IBS) |
| 2027-2032 | Transicao gradual |
| 2033 | Implementacao completa |

Principais mudancas futuras:
- **CBS** substituira PIS/COFINS (federal)
- **IBS** substituira ICMS/ISS (estadual/municipal)
- Aliquota unica por produto/servico

**O sistema PrecifiCALC utiliza a legislacao vigente ate a implementacao completa da reforma.**

---

## 14. Correcoes Historicas Aplicadas

1. **Lei ficticia removida:** O codigo continha referencia a "LC 224/2025" que nao existe na legislacao brasileira. Foi completamente removido.
2. **COFINS corrigida:** Aliquota estava em 7,65% e foi corrigida para 7,6% conforme Lei 10.833/2003.

---

## 15. Fontes Oficiais de Consulta

| Fonte | URL | Dados |
|-------|-----|-------|
| Receita Federal | gov.br/receitafederal | Legislacao federal, TIPI, PIS/COFINS |
| Siscomex | portalunico.siscomex.gov.br/classif | Tabela NCM, classificacao fiscal |
| CONFAZ | confaz.fazenda.gov.br | Convenios ICMS, ST, DIFAL |
| Portal da Legislacao | planalto.gov.br | Leis, decretos, LCs |
| Simples Nacional | receita.fazenda.gov.br/SimplesNacional | Tabelas DAS, resolucoes CGSN |
| STF | portal.stf.jus.br | Jurisprudencia vinculante |
| STJ | stj.jus.br | Jurisprudencia tributaria |
| CARF | carf.fazenda.gov.br | Decisoes administrativas |
| SEFAZ SP | portal.fazenda.sp.gov.br | ICMS/ST Sao Paulo |

### Legislacao Primaria Referenciada

| Norma | Assunto |
|-------|---------|
| Constituicao Federal 1988 (Arts. 145-162, 195) | Competencias tributarias |
| CTN - Lei 5.172/1966 | Normas gerais tributarias |
| LC 87/1996 (Lei Kandir) | ICMS |
| LC 116/2003 | ISS |
| LC 123/2006 | Simples Nacional e MEI |
| LC 128/2008 | MEI Caminhoneiro |
| Lei 4.502/1964 | Codigo do IPI |
| Lei 8.036/1990 | FGTS |
| Lei 8.212/1991 | Previdencia Social / INSS |
| Lei 9.430/1996 | Legislacao tributaria |
| Lei 9.718/1998 | PIS/COFINS cumulativo |
| Lei 10.147/2000 | Medicamentos (monofasico) |
| Lei 10.336/2001 | CIDE-Combustiveis |
| Lei 10.485/2002 | Veiculos (monofasico) |
| Lei 10.637/2002 | PIS nao-cumulativo |
| Lei 10.833/2003 | COFINS nao-cumulativa |
| Lei 11.196/2005 (Lei do Bem) | Incentivos P&D |
| Lei 11.638/2007 | Convergencia contabil |
| Lei 12.546/2011 | CPRB (desoneracão folha) |
| Lei 13.755/2018 | Rota 2030 (automotivo) |
| Lei 14.973/2024 | Reoneracao gradual da folha |
| Decreto 3.000/1999 | Regulamento IR (RIR) |
| Decreto 7.212/2010 | Regulamento IPI (RIPI) |
| Decreto 11.158/2022 | TIPI atual |
| Resolucao CGSN 140/2018 | Simples Nacional |
| Resolucao Senado 22/1989 | Aliquotas interestaduais ICMS |
| IN RFB 1.234/2012 | IRRF servicos |
| IN RFB 1.500/2014 | IRRF pessoa fisica |
| IN RFB 2.138/2024 | Procedimentos Simples Nacional |

---

**Arquivo de implementacao:** `src/data/taxData.js` (1.408 linhas)
**Versao dos dados:** 3.0 (Fevereiro/2026)
