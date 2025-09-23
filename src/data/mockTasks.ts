import { Task } from '@/types';

// Mock Tasks Data - COMPLETO E ATUALIZADO
export const mockTasks: Task[] = [
  // PROJETO 1: CASA ALTO PADRÃO - BRENO
  {
    id: '1',
    project_id: '1',
    title: 'REVISAO HIDROSSANITÁRIO',
    description: 'Revisão do projeto hidrossanitário',
    assigned_to: ['5'], // PEDRO
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-15',
    due_date: '2025-09-24T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    title: 'APRESENTACAO PROJETOS VIA DALUX',
    description: 'Apresentação dos projetos via plataforma Dalux',
    assigned_to: ['1', '10'], // IGOR, EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2025-09-04',
    due_date: '2025-10-03T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: 'VERIFICAR COM EDILSON MODELO FEDERADO ANTES DA APRESENTAÇÃO NO DALUX.',
    created_at: '2025-09-01T09:00:00Z'
  },

  // PROJETO 2: CASA ALTO PADRÃO - PABLO
  {
    id: '3',
    project_id: '2',
    title: 'PROJETO ESTRUTURAL',
    description: 'Desenvolvimento do projeto estrutural',
    assigned_to: ['2'], // GUSTAVO
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-08-15T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '4',
    project_id: '2',
    title: 'PROJETO ELÉTRICO BAIXA TENSÃO',
    description: 'Projeto elétrico de baixa tensão',
    assigned_to: ['6'], // THIAGO
    status: 'PARALISADA', // CORRIGIDO - ERA PENDENTE, AGORA É PARALISADO
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: undefined,
    due_date: undefined,
    completed_at: undefined,
    restricoes: 'ARQUITETURA',
    comment: 'AGUARDANDO LUMINOTÉCNICO',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '5',
    project_id: '2',
    title: 'PROJETO HIDROSSANITÁRIO',
    description: 'Projeto hidrossanitário completo',
    assigned_to: ['5'], // PEDRO
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-07-15',
    due_date: '2025-08-15T00:00:00Z',
    completed_at: '2025-07-30T00:00:00Z',
    restricoes: 'ARQUITETURA',
    comment: 'AGUARDANDO LUMINOTÉCNICO',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '6',
    project_id: '2',
    title: 'PROJETO CLIMATIZAÇÃO',
    description: 'Projeto de climatização',
    assigned_to: ['9'], // RONDINELLY
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 10,
    activity_start: '2025-07-15',
    due_date: '2025-08-15T00:00:00Z',
    completed_at: '2025-08-10T00:00:00Z',
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '7',
    project_id: '2',
    title: 'CONSTRUÇÃO VIRTUAL ARQUITETURA',
    description: 'Modelagem BIM da arquitetura',
    assigned_to: ['4'], // LEONARDO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-08-15T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '8',
    project_id: '2',
    title: 'COMPATIBILIZACAO E RELATORIO',
    description: 'Compatibilização de projetos e relatório',
    assigned_to: ['10'], // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: undefined,
    due_date: undefined,
    completed_at: undefined,
    restricoes: 'CONSTRUÇÃO VIRTUAL,ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '9',
    project_id: '2',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo completo',
    assigned_to: ['10'], // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: undefined,
    due_date: undefined,
    completed_at: undefined,
    restricoes: 'CONSTRUÇÃO VIRTUAL, ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },

  // PROJETO 3: COWORKING - FENIX MOVEIS
  {
    id: '10',
    project_id: '3',
    title: 'APRESENTACAO PROJETOS VIA DALUX',
    description: 'Apresentação dos projetos via plataforma Dalux',
    assigned_to: ['1', '10'], // IGOR, EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2025-09-04',
    due_date: '2025-10-03T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: 'VERIFICAR COM EDILSON MODELO FEDERADO ANTES DA APRESENTAÇÃO NO DALUX.',
    created_at: '2025-09-01T09:00:00Z'
  },

  // PROJETO 4: PORTAL DA ALEGRIA - CARVALHO
  {
    id: '11',
    project_id: '4',
    title: 'PRÉ-DIMENSIONAMENTO E PROJETO BASICO ESTRUTURAL',
    description: 'Pré-dimensionamento e projeto básico estrutural',
    assigned_to: ['11', '2'], // PHILIP, GUSTAVO
    status: 'PARALISADA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: undefined,
    due_date: undefined,
    completed_at: undefined,
    restricoes: 'ARQUITETURA',
    comment: 'APROVACAO DO LAYOUT ARQUITETONICO PELO DIRETOR DO CARVALHO.',
    created_at: '2025-07-20T08:00:00Z'
  },

  // PROJETO 5: LAIS E SAROM - THALES
  {
    id: '12',
    project_id: '5',
    title: 'RELATORIO DE QUANTITATIVOS',
    description: 'Relatório de quantitativos',
    assigned_to: ['10'], // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-17',
    due_date: '2025-09-29T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: 'USAR ESTRUTURA E INSTRUCOES NO CHAT DO CLAUDE, FORNECIDO O LINK.',
    created_at: '2025-09-15T08:00:00Z'
  },

  // PROJETO 6: GILVANDO E ROSANETE - THALES
  {
    id: '13',
    project_id: '6',
    title: 'RELATORIO DE QUANTITATIVOS',
    description: 'Relatório de quantitativos',
    assigned_to: ['10'], // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: undefined,
    due_date: undefined,
    completed_at: undefined,
    restricoes: 'CONSTRUCAO VIRTUAL',
    comment: 'MESMO RELATORIO LAIS E SAROM',
    created_at: '2024-01-01T08:00:00Z'
  },
  {
    id: '14',
    project_id: '6',
    title: 'CONSTRUCAO VIRTUAL',
    description: 'Construção virtual do projeto',
    assigned_to: ['4', '12'], // LEONARDO, NARA
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: undefined,
    due_date: undefined,
    completed_at: undefined,
    restricoes: 'CONSTRUCAO VIRTUAL',
    comment: 'MESMO RELATORIO LAIS E SAROM',
    created_at: '2024-01-01T08:00:00Z'
  },

  // PROJETO 7: CLEBER E IGOR - THALES
  {
    id: '15',
    project_id: '7',
    title: 'CONSTRUCAO VIRTUAL',
    description: 'Construção virtual do projeto',
    assigned_to: ['4', '12'], // LEONARDO, NARA
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-09-15T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },

  // PROJETO 8: PARQUE ABERTO - ZOOBOTANICO
  {
    id: '16',
    project_id: '8',
    title: 'AS BUILT E PROJETO DE INCENDIO',
    description: 'As built e projeto de incêndio',
    assigned_to: ['9'], // RONDINELLY
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-09-15T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: 'AGUARDANDO RESPOSTA FABIO E CAMPELO NETO SOBRE REUNIAO BOMBEIROS.',
    created_at: '2025-07-10T08:00:00Z'
  },

  // PROJETO 9: SALAS COMERCIAIS - NORBERTO (CORRIGIDO)
  {
    id: '17',
    project_id: '9',
    title: 'LAYOUT ARQUITETONICO',
    description: 'Layout arquitetônico das salas comerciais',
    assigned_to: ['3'], // BESSA
    status: 'PENDENTE',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-15', // CORRIGIDO - ADICIONADA DATA INÍCIO
    due_date: '2025-11-15T00:00:00Z', // CORRIGIDO - PRAZO DE 15/09/2025 PARA 15/11/2025
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },

  // PROJETO 10: GASES MEDICINAIS - FHEMIG
  {
    id: '18',
    project_id: '10',
    title: 'ETAPA 01 (AS BUILT E DEMANDA-ARQ E GASES)',
    description: 'Etapa 01 - As built e demanda arquitetura e gases',
    assigned_to: ['14'], // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-05-30',
    due_date: '2025-09-30T00:00:00Z',
    completed_at: '2025-09-18T00:00:00Z',
    restricoes: '',
    comment: 'AGENDAMENTO DE REUNIAO E PRAZOS PARA PROJETO EXECUTIVO (ETAPA 2)',
    created_at: '2025-05-25T08:00:00Z'
  },
  {
    id: '19',
    project_id: '10',
    title: 'ETAPA 2',
    description: 'Etapa 2 - Projeto executivo',
    assigned_to: ['14'], // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-09-19',
    due_date: undefined,
    completed_at: '2025-09-22T00:00:00Z',
    restricoes: '',
    comment: '',
    created_at: '2025-09-19T08:00:00Z'
  },

  // PROJETO 11: DELEGACIA POLICIA FEDERAL - SPF/RO
  {
    id: '20',
    project_id: '11',
    title: 'REVISÃO ORÇAMENTO, CADERNO DE ENCARGOS',
    description: 'Revisão do orçamento e caderno de encargos',
    assigned_to: ['10'], // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-19',
    due_date: '2025-09-26T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-09-15T08:00:00Z'
  },

  // PROJETO 12: DELEGACIA DA POLICIA RODOVIARIA FEDERAL - SPRF/AL
  {
    id: '21',
    project_id: '12',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo completo',
    assigned_to: ['10'], // EDILSON
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-09-10',
    due_date: '2025-09-19T00:00:00Z',
    completed_at: '2025-09-22T00:00:00Z',
    restricoes: '',
    comment: 'AGUARDANDO FISCAL APROVAR ORCAMENTO NO ORCAFASCIO PRA EXPORTAR OS ENTREGAVEIS',
    created_at: '2025-09-05T08:00:00Z'
  },

  // PROJETO 13: LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR - TRE/AC (CORRIGIDO)
  {
    id: '22',
    project_id: '13',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo',
    assigned_to: ['10'], // EDILSON
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: undefined,
    due_date: undefined,
    completed_at: '2025-09-20T00:00:00Z',
    restricoes: '',
    comment: 'AGUARDANDO PROJETOS, RECOMENDAVEL MONTAR EAP E IR ALINHANDO COM ARQUITETURA OQ JA TEM', // COMENTÁRIO ATUALIZADO
    created_at: '2025-06-20T08:00:00Z'
  },

  // PROJETO 14: AGENCIA DE TUBARAO - CELESC/RS (CORRIGIDO)
  {
    id: '23',
    project_id: '14',
    title: 'PROJETO ARQUITETONICO, INTERIORES E ACESSIBILIDADE EXECUTIVO',
    description: 'Projeto arquitetônico, interiores e acessibilidade executivo',
    assigned_to: ['4', '3'], // LEONARDO, BESSA
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: undefined,
    due_date: '2025-11-02T00:00:00Z', // CORRIGIDO - ERA 02/11/2025
    completed_at: undefined,
    restricoes: '',
    comment: '',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '24',
    project_id: '14',
    title: 'PRE DIMENSIONAMENTO E MODELAGEM INICIAL ESTRUTURA, PLANTA DE FUROS PARA SONDAGEM',
    description: 'Pré-dimensionamento e modelagem inicial da estrutura',
    assigned_to: ['2'], // GUSTAVO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: undefined,
    due_date: '2025-09-28T00:00:00Z',
    completed_at: undefined,
    restricoes: '',
    comment: 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA',
    created_at: '2025-07-01T08:00:00Z'
  }
];