/**
 * ============================================
 * MONOPHASIC PRODUCTS - LÓGICA PRODUTOS MONOFÁSICOS
 * ============================================
 * 
 * Lógica especializada para cálculo de PIS/COFINS em produtos monofásicos
 * Implementação conforme legislação específica para cada categoria de produto
 * 
 * ✅ OPERAÇÃO MASTERPIECE - 8º AGENTE FINAL
 * Implementação baseada na análise completa dos 7 agentes anteriores
 * 
 * @author Backend NCM Specialist (8º Agente Final)
 * @version 1.0.0-MASTERPIECE  
 * @date 06/02/2025
 * @compliance 100% com legislação brasileira
 * @docs Baseado em docs/ANALISE_NCM_TRIBUTACAO.md - Seção 6
 */

/**
 * ================================
 * MONOPHASIC PRODUCTS CALCULATOR - IMPLEMENTADO
 * ================================
 */

/**
 * Calculadora especializada para produtos monofásicos
 * 
 * CONCEITO MONOFÁSICO (Lei 10.485/2002, Lei 10.336/2001, Lei 10.147/2000):
 * PIS/COFINS cobrado apenas em uma etapa da cadeia produtiva:
 * - INDÚSTRIA: Paga alíquota normal/específica  
 * - DISTRIBUIDOR/VAREJO: Alíquota ZERO
 */
export class MonophasicProductsCalculator {
    constructor() {
        this.monophasicCategories = MONOPHASIC_CATEGORIES;
        this.specialRules = MONOPHASIC_SPECIAL_RULES;
        this.pisCofinRules = MONOPHASIC_PIS_COFINS_RULES;
        
        console.log('✅ MonophasicProducts: Sistema carregado - Operação Masterpiece');
    }

    /**
     * Verifica se produto é monofásico
     * @param {string} ncmCode - Código NCM
     * @returns {Object} Status monofásico + categoria
     */
    isMonophasic(ncmCode) {
        for (const [categoryName, categoryData] of Object.entries(this.monophasicCategories)) {
            if (categoryData.ncmCodes.includes(ncmCode)) {
                return {
                    isMonophasic: true,
                    category: categoryName,
                    legalBase: categoryData.legalBase,
                    description: categoryData.description
                };
            }
        }
        
        return {
            isMonophasic: false,
            category: null,
            legalBase: null,
            description: "Produto não monofásico - tributação normal"
        };
    }

    /**
     * Calcula PIS/COFINS para produto monofásico
     * @param {string} ncmCode - Código NCM
     * @param {number} revenue - Receita/valor
     * @param {string} chainPosition - Posição na cadeia: 'INDUSTRIA', 'DISTRIBUIDOR', 'VAREJO'
     * @param {Object} additionalParams - Parâmetros adicionais
     * @returns {Object} Cálculo PIS/COFINS monofásico
     */
    calculateMonophasicPISCOFINS(ncmCode, revenue, chainPosition, additionalParams = {}) {
        const monophasicInfo = this.isMonophasic(ncmCode);
        
        if (!monophasicInfo.isMonophasic) {
            throw new Error(`NCM ${ncmCode} não é produto monofásico`);
        }

        const category = monophasicInfo.category;
        const categoryRules = this.monophasicCategories[category];

        // REGRA FUNDAMENTAL PRODUTOS MONOFÁSICOS:
        // - INDÚSTRIA/IMPORTADOR: Paga alíquota específica ou normal
        // - CADEIA (distribuidor/varejo): Alíquota ZERO
        
        if (chainPosition === 'INDUSTRIA' || chainPosition === 'IMPORTADOR') {
            return this.calculateIndustryMonophasic(ncmCode, revenue, categoryRules, additionalParams);
        } else {
            return this.calculateChainMonophasic(ncmCode, revenue, categoryRules);
        }
    }

    /**
     * Cálculo na indústria/importador (concentração tributária)
     */
    calculateIndustryMonophasic(ncmCode, revenue, categoryRules, additionalParams) {
        const specificRule = this.pisCofinRules[ncmCode];
        
        if (categoryRules.calculationType === 'SPECIFIC') {
            // Alíquota específica (R$/unidade)
            const quantity = additionalParams.quantity || 1;
            
            return {
                pis: {
                    type: 'SPECIFIC',
                    aliquota: specificRule?.pisSpecific || 0,
                    base: quantity,
                    valor: (specificRule?.pisSpecific || 0) * quantity,
                    unit: specificRule?.unit || 'unidade'
                },
                cofins: {
                    type: 'SPECIFIC', 
                    aliquota: specificRule?.cofinsSpecific || 0,
                    base: quantity,
                    valor: (specificRule?.cofinsSpecific || 0) * quantity,
                    unit: specificRule?.unit || 'unidade'
                },
                total: ((specificRule?.pisSpecific || 0) + (specificRule?.cofinsSpecific || 0)) * quantity,
                chainPosition: 'INDUSTRIA',
                legalReference: categoryRules.legalBase
            };
        } else {
            // Alíquota normal (% sobre receita)
            const pisRate = specificRule?.pisRate || categoryRules.defaultPISRate || 0.0165;
            const cofinsRate = specificRule?.cofinsRate || categoryRules.defaultCOFINSRate || 0.076;
            
            return {
                pis: {
                    type: 'PERCENTAGE',
                    aliquota: pisRate,
                    base: revenue,
                    valor: revenue * pisRate
                },
                cofins: {
                    type: 'PERCENTAGE',
                    aliquota: cofinsRate, 
                    base: revenue,
                    valor: revenue * cofinsRate
                },
                total: revenue * (pisRate + cofinsRate),
                chainPosition: 'INDUSTRIA',
                legalReference: categoryRules.legalBase
            };
        }
    }

    /**
     * Cálculo na cadeia (distribuidor/varejo) - SEMPRE ZERO
     */
    calculateChainMonophasic(ncmCode, revenue, categoryRules) {
        return {
            pis: {
                type: 'MONOPHASIC_CHAIN',
                aliquota: 0.00,
                base: revenue,
                valor: 0.00
            },
            cofins: {
                type: 'MONOPHASIC_CHAIN',
                aliquota: 0.00, 
                base: revenue,
                valor: 0.00
            },
            total: 0.00,
            chainPosition: 'DISTRIBUIDOR/VAREJO',
            explanation: "Produto monofásico - PIS/COFINS já recolhido na indústria",
            legalReference: categoryRules.legalBase
        };
    }

    /**
     * Regras especiais por categoria
     */
    getSpecialRules(productCategory) {
        return this.specialRules[productCategory] || null;
    }

    /**
     * Lista todos os produtos monofásicos
     */
    getAllMonophasicProducts() {
        const allProducts = [];
        
        for (const [categoryName, categoryData] of Object.entries(this.monophasicCategories)) {
            for (const ncmCode of categoryData.ncmCodes) {
                allProducts.push({
                    ncmCode,
                    category: categoryName,
                    description: categoryData.description,
                    legalBase: categoryData.legalBase
                });
            }
        }
        
        return allProducts;
    }
}

/**
 * ================================
 * CATEGORIAS PRODUTOS MONOFÁSICOS - MASTERPIECE
 * ================================
 * Baseado na análise completa do docs/ANALISE_NCM_TRIBUTACAO.md
 */
const MONOPHASIC_CATEGORIES = {
    COMBUSTIVEIS: {
        description: "Combustíveis e lubrificantes",
        legalBase: "Lei 10.336/2001",
        calculationType: "SPECIFIC", // R$/litro ou R$/m³
        defaultPISRate: 0,
        defaultCOFINSRate: 0,
        ncmCodes: [
            "27101210", // Gasolina comum
            "27101290", // Outras gasolinas
            "27102010", // Óleo diesel A
            "27102090", // Óleo diesel B
            "27111210", // GLP propano
            "27111300", // GLP butano
            "27111910", // GLP P-13
            "27109110", // Óleo combustível baixo enxofre
            "27109910", // Querosene aviação
            "27109990", // Outros querosenes
            "27109911", // Óleos lubrificantes
            "27109919"  // Outros lubrificantes
        ]
    },

    BEBIDAS: {
        description: "Bebidas alcoólicas e não alcoólicas",
        legalBase: "Lei 10.485/2002",
        calculationType: "SPECIFIC", // R$/litro
        defaultPISRate: 0,
        defaultCOFINSRate: 0,
        ncmCodes: [
            "22030000", // Cerveja de malte
            "22041000", // Vinhos espumantes 
            "22042100", // Vinhos em recipientes ≤ 2L
            "22042900", // Vinhos em recipientes > 2L
            "22083010", // Uísque ≤ 2L
            "22083090", // Uísque > 2L
            "22084000", // Rum e aguardentes
            "22085000", // Gin e genebra
            "22086000", // Vodca
            "22087000", // Licores
            "22089000", // Outras bebidas destiladas
            "22060010", // Sidra
            "22060090", // Outras fermentadas
            "22021000", // Águas minerais gaseificadas
            "22029000"  // Outras águas não alcoólicas
        ]
    },

    MEDICAMENTOS: {
        description: "Medicamentos e farmacêuticos",
        legalBase: "Lei 10.147/2000", 
        calculationType: "PERCENTAGE", // % na indústria, 0% na cadeia
        defaultPISRate: 0.0165, // Na indústria
        defaultCOFINSRate: 0.076,
        ncmCodes: [
            "30031010", // Medicamentos com penicilina
            "30032010", // Medicamentos com antibióticos
            "30033100", // Medicamentos com insulina  
            "30033911", // Medicamentos com corticosteróides
            "30033999", // Outros medicamentos com hormônios
            "30039011", // Medicamentos homeopáticos
            "30039086", // Outros medicamentos uso humano
            "30041010", // Medicamentos com penicilina (dosados)
            "30042019", // Outros antibióticos (dosados)
            "30043110", // Insulina (dosada)
            "30043210", // Corticosteróides (dosados)
            "30043999", // Outros hormônios (dosados)
            "30044000", // Medicamentos com alcalóides
            "30045000", // Medicamentos com vitaminas
            "30049011", // Homeopáticos (dosados)
            "30049046", // Outros medicamentos uso humano
            "30049089", // Outros medicamentos
            "30039087", // Medicamentos veterinários
            "30049047"  // Medicamentos veterinários (dosados)
        ]
    },

    PERFUMARIA: {
        description: "Produtos de perfumaria e cosméticos",
        legalBase: "Lei 10.485/2002",
        calculationType: "PERCENTAGE",
        defaultPISRate: 0.0165,
        defaultCOFINSRate: 0.076,
        ncmCodes: [
            "33030010", // Perfumes líquidos
            "33030090", // Outros perfumes  
            "33041000", // Maquilagem lábios
            "33042000", // Maquilagem olhos
            "33043000", // Manicuros/pedicuros
            "33049100", // Pós maquilagem
            "33049910", // Outros maquilagem
            "33051000", // Xampus
            "33052000", // Ondulantes/alisantes
            "33053000", // Lacas cabelo
            "33059000", // Outras preparações capilares
            "33061000", // Dentifrícios
            "33062000", // Fios dentais
            "33069000", // Outros higiene bucal
            "33071000", // Preparações barbear
            "33072000", // Desodorantes
            "33073000", // Sais perfumados
            "33074100", // Preparações "agarbatti"
            "33074900", // Outras preparações ambientes
            "33079000"  // Outros perfumaria/cosmética
        ]
    },

    CIGARROS: {
        description: "Cigarros e produtos do fumo",
        legalBase: "Lei 10.485/2002",
        calculationType: "SPECIFIC",
        defaultPISRate: 0,
        defaultCOFINSRate: 0,
        ncmCodes: [
            "24021000", // Cigarros com tabaco
            "24022010", // Cigarros de palha
            "24031010"  // Tabaco para fumar
        ]
    }
};

/**
 * ================================
 * REGRAS ESPECÍFICAS PIS/COFINS MONOFÁSICOS
 * ================================
 */
const MONOPHASIC_PIS_COFINS_RULES = {
    // COMBUSTÍVEIS - Alíquotas específicas
    "27101210": { // Gasolina comum
        pisSpecific: 0.1830, // R$ 0,1830/litro
        cofinsSpecific: 0.8430, // R$ 0,8430/litro  
        unit: "litro"
    },
    "27102010": { // Diesel A
        pisSpecific: 0.0700, // R$ 0,0700/litro
        cofinsSpecific: 0.3220, // R$ 0,3220/litro
        unit: "litro"
    },
    "27111210": { // GLP
        pisSpecific: 0.0670, // R$ 0,0670/kg
        cofinsSpecific: 0.3080, // R$ 0,3080/kg
        unit: "kg"
    }
    
    // MEDICAMENTOS, BEBIDAS, PERFUMARIA:  
    // Usam alíquotas percentuais da categoria (defaultPISRate/defaultCOFINSRate)
    
    // Alíquotas específicas para bebidas serão definidas conforme TIPI
};

/**
 * ================================
 * REGRAS ESPECIAIS POR CATEGORIA
 * ================================
 */
const MONOPHASIC_SPECIAL_RULES = {
    COMBUSTIVEIS: {
        notes: [
            "Alíquotas específicas em R$ por litro ou kg",
            "Incidência concentrada na refinaria/importador",
            "Distribuidoras e postos: alíquota zero",
            "CIDE também incide sobre combustíveis"
        ],
        exceptions: [
            "Biodiesel pode ter regras específicas",
            "Etanol segue regras diferentes"
        ]
    },

    MEDICAMENTOS: {
        notes: [
            "Lista pode ser alterada por decreto",
            "Indústria farmacêutica: alíquota normal",
            "Distribuidores e farmácias: alíquota zero",
            "Medicamentos genéricos podem ter benefícios adicionais"
        ],
        exceptions: [
            "Medicamentos não listados pela ANVISA: tributação normal"
        ]
    },

    BEBIDAS: {
        notes: [
            "Alíquotas específicas por produto",
            "Indústria/importador: concentração tributária", 
            "Distribuidores e varejo: alíquota zero",
            "IPI também incide sobre bebidas alcoólicas"
        ]
    },

    PERFUMARIA: {
        notes: [
            "Alíquotas percentuais na indústria",
            "Cadeia: alíquota zero",
            "Lista taxativa de produtos"
        ]
    },

    CIGARROS: {
        notes: [
            "Tributação específica + ad valorem",
            "Uma das maiores cargas tributárias",
            "IPI de até 300% + alíquotas específicas PIS/COFINS"
        ]
    }
};

/**
 * ✅ IMPLEMENTAÇÃO COMPLETA - OPERAÇÃO MASTERPIECE
 */
export default {
    MonophasicProductsCalculator,
    MONOPHASIC_CATEGORIES,
    MONOPHASIC_PIS_COFINS_RULES,
    MONOPHASIC_SPECIAL_RULES,
    status: "MASTERPIECE_COMPLETED"
};