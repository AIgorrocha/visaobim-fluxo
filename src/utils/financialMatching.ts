/**
 * Utilitários para matching de nomes em pagamentos e precificações
 *
 * O problema: Os nomes de projetos e disciplinas podem ser diferentes
 * entre o histórico de pagamentos e a precificação.
 *
 * Exemplo:
 * - Pagamento: "DRF-PV" + "ESTRUTURAL"
 * - Precificação: "AGENCIA DA RECEITA FEDERAL" + "SUPERESTRUTURAS"
 *
 * Este arquivo contém funções para fazer match por similaridade.
 */

// ========================================
// MAPEAMENTO DE PROJETOS (siglas -> nomes completos)
// ========================================
const PROJECT_ALIASES: { [key: string]: string[] } = {
  // Receita Federal (projeto renomeado para DRF-PV)
  'DRF-PV': ['DRF', 'DRV', 'RECEITA FEDERAL', 'RECEITA', 'DRF-PORTO VELHO', 'AGENCIA DA RECEITA FEDERAL', 'AGENCIA RECEITA'],

  // Outros projetos comuns - adicione conforme necessário
  'CASA DA MULHER BRASILEIRA': ['CMB', 'CASA MULHER'],
  'LACEN': ['LACEN', 'FES', 'LACEN-FES'],

  // TRE-AC (Tribunal Regional Eleitoral do Acre)
  'LOTE 02 - TRE-AC': ['TRE-AC', 'TRE', 'ELEITOR', 'CENTRO ATENDIMENTO ELEITOR', 'CENTRO DE ATENDIMENTO AO ELEITOR', 'LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR'],

  // CELESC - Estudo Central
  'ESTUDO CENTRAL CELESC': ['CELESC-ESTUDO', 'CELESC ESTUDO', 'REALOCACAO DA ADMINISTRACAO CENTRAL', 'REALOCAÇÃO DA ADMINISTRAÇÃO CENTRAL', 'ADMINISTRACAO CENTRAL'],

  // CELESC - Tubarão
  'CELESC_TUBARAO': ['CELESC-RS', 'CELESC RS', 'AGENCIA DE TUBARAO', 'TUBARAO', 'CELESC TUBARAO'],

  // Adicione mais mapeamentos aqui conforme necessário
};

// ========================================
// MAPEAMENTO DE DISCIPLINAS (variações -> nome padrão)
// ========================================
const DISCIPLINE_ALIASES: { [key: string]: string[] } = {
  // Estruturas
  'SUPERESTRUTURAS': ['ESTRUTURAL', 'ESTRUTURAS', 'SUPERESTRUTURA', 'EST', 'ESTRUT'],
  'FUNDACOES': ['FUNDACAO', 'FUND', 'FUNDAÇÕES'],
  'ESTRUTURAS CONCRETO ARMADO': ['ESTRUTURAL', 'CONCRETO', 'ESTRUTURAS'],
  'ESTRUTURAS_METALICAS': ['ESTRUTURAS METALICAS', 'EST.MET', 'METALICA', 'METALICAS'],

  // Elétrica
  'ELE E LOGICA': ['ELETRICO', 'ELETRICA', 'ELETRICOS', 'LOGICA', 'ELE'],
  'ELETRICO': ['ELETRICA', 'ELE', 'ELETRICOS'],

  // Hidráulica
  'HID': ['HIDRAULICA', 'HIDRAULICO', 'HIDRO', 'HIDR'],
  'HIDRAULICA': ['HID', 'HIDRO', 'HIDRAULICO'],

  // Outros
  'SPDA': ['PARA-RAIOS', 'PARARAIOS'],
  'PPCI': ['INCENDIO', 'COMBATE INCENDIO', 'PCI'],
  'ARQUITETURA': ['ARQ', 'ARQUITETONICA', 'ARQUITETURA - BESSA', 'ARQUITETURA - LEONARDO', 'ARQUITETURA BESSA', 'ARQUITETURA LEONARDO'],
  'ARQUITETURA - BESSA': ['ARQUITETURA', 'ARQ'],
  'ARQUITETURA - LEONARDO': ['ARQUITETURA', 'ARQ'],
  'ORCAMENTO': ['ORC', 'ORCAMENTOS'],
};

/**
 * Normaliza uma string para comparação
 * - Remove acentos
 * - Converte para maiúsculas
 * - Remove espaços extras
 * - Remove caracteres especiais
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

/**
 * Extrai palavras-chave de uma string
 */
function extractKeywords(str: string): string[] {
  const normalized = normalizeString(str);
  return normalized.split(' ').filter(w => w.length > 2);
}

/**
 * Verifica se duas strings são similares
 * Retorna um score de 0 a 1 (1 = match perfeito)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const n1 = normalizeString(str1);
  const n2 = normalizeString(str2);

  // Match exato
  if (n1 === n2) return 1;

  // Um contém o outro
  if (n1.includes(n2) || n2.includes(n1)) return 0.9;

  // Palavras em comum
  const words1 = extractKeywords(str1);
  const words2 = extractKeywords(str2);

  if (words1.length === 0 || words2.length === 0) return 0;

  let matches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(words1.length, words2.length);
}

/**
 * Verifica se dois nomes de projetos são equivalentes
 * Usa mapeamento de aliases e similaridade
 */
export function areProjectsEquivalent(project1: string, project2: string): boolean {
  const n1 = normalizeString(project1);
  const n2 = normalizeString(project2);

  // Match exato
  if (n1 === n2) return true;

  // Um contém o outro
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Verificar aliases
  for (const [mainName, aliases] of Object.entries(PROJECT_ALIASES)) {
    const normalizedMain = normalizeString(mainName);
    const normalizedAliases = aliases.map(normalizeString);

    const match1 = n1 === normalizedMain || normalizedAliases.some(a => n1.includes(a) || a.includes(n1));
    const match2 = n2 === normalizedMain || normalizedAliases.some(a => n2.includes(a) || a.includes(n2));

    if (match1 && match2) return true;
  }

  // Similaridade por palavras-chave
  const similarity = calculateSimilarity(project1, project2);
  return similarity >= 0.5; // 50% de similaridade
}

/**
 * Verifica se dois nomes de disciplinas são equivalentes
 * Usa mapeamento de aliases
 */
export function areDisciplinesEquivalent(disc1: string, disc2: string): boolean {
  const n1 = normalizeString(disc1);
  const n2 = normalizeString(disc2);

  // Match exato
  if (n1 === n2) return true;

  // Um contém o outro
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Verificar aliases
  for (const [mainName, aliases] of Object.entries(DISCIPLINE_ALIASES)) {
    const normalizedMain = normalizeString(mainName);
    const normalizedAliases = aliases.map(normalizeString);
    const allVariations = [normalizedMain, ...normalizedAliases];

    const match1 = allVariations.some(v => n1 === v || n1.includes(v) || v.includes(n1));
    const match2 = allVariations.some(v => n2 === v || n2.includes(v) || v.includes(n2));

    if (match1 && match2) return true;
  }

  return false;
}

/**
 * Encontra pagamentos que correspondem a uma precificação
 * Usa matching por similaridade de projeto e disciplina
 */
export function findMatchingPayments(
  payments: Array<{
    designer_id: string;
    project_name?: string;
    discipline: string;
    amount: number;
    status: string;
  }>,
  pricing: {
    designer_id: string;
    project_name: string;
    discipline_name: string;
  }
): number {
  let totalPaid = 0;

  for (const payment of payments) {
    // Mesmo projetista
    if (payment.designer_id !== pricing.designer_id) continue;

    // Apenas pagamentos confirmados
    if (payment.status !== 'pago') continue;

    // Match de projeto (por similaridade)
    const projectMatch = payment.project_name
      ? areProjectsEquivalent(payment.project_name, pricing.project_name)
      : false;

    if (!projectMatch) continue;

    // Match de disciplina (por similaridade)
    const disciplineMatch = areDisciplinesEquivalent(payment.discipline, pricing.discipline_name);

    if (disciplineMatch) {
      totalPaid += Number(payment.amount);
    }
  }

  return totalPaid;
}

/**
 * Debug: Lista possíveis matches para diagnóstico
 */
export function debugMatchingPayments(
  payments: Array<{
    designer_id: string;
    project_name?: string;
    discipline: string;
    amount: number;
    status: string;
  }>,
  pricing: {
    designer_id: string;
    project_name: string;
    discipline_name: string;
  }
): Array<{
  payment: any;
  projectMatch: boolean;
  disciplineMatch: boolean;
}> {
  const results: Array<{
    payment: any;
    projectMatch: boolean;
    disciplineMatch: boolean;
  }> = [];

  for (const payment of payments) {
    if (payment.designer_id !== pricing.designer_id) continue;

    const projectMatch = payment.project_name
      ? areProjectsEquivalent(payment.project_name, pricing.project_name)
      : false;

    const disciplineMatch = areDisciplinesEquivalent(payment.discipline, pricing.discipline_name);

    results.push({
      payment,
      projectMatch,
      disciplineMatch
    });
  }

  return results;
}
