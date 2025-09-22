import { Project, Task, Proposal, Achievement } from '@/types';
import { addDays, subDays, addWeeks } from 'date-fns';

// Mock Projects Data
export const mockProjects: Project[] = [
  // Private Projects
  {
    id: '1',
    name: 'CASA ALTO PADRÃO',
    client: 'PABLO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'Projeto residencial de alto padrão com área de 450m²',
    responsible_ids: ['1'],
    contract_start: '2024-01-15',
    contract_end: '2024-06-15',
    vigencia_contrato: '2024-07-15',
    created_by: '1',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-03-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'CASA ALTO PADRÃO',
    client: 'BRENO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'Residência contemporânea com 380m²',
    responsible_ids: ['2'],
    contract_start: '2024-02-01',
    contract_end: '2024-07-01',
    vigencia_contrato: '2024-08-01',
    created_by: '1',
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-04-02T14:20:00Z'
  },
  {
    id: '3',
    name: 'COWORKING',
    client: 'FENIX MOVEIS',
    type: 'privado',
    status: 'EM_ESPERA',
    description: 'Espaço coworking corporativo de 200m²',
    responsible_ids: ['3'],
    contract_start: '2024-03-01',
    contract_end: '2024-08-01',
    vigencia_contrato: '2024-09-01',
    created_by: '1',
    created_at: '2024-02-20T11:00:00Z',
    updated_at: '2024-03-15T16:45:00Z'
  },
  {
    id: '4',
    name: 'PORTAL DA ALEGRIA',
    client: 'CARVALHO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'Conjunto residencial Portal da Alegria',
    responsible_ids: ['4'],
    contract_start: '2024-02-15',
    contract_end: '2024-08-15',
    vigencia_contrato: '2024-09-15',
    created_by: '1',
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-03-05T14:30:00Z'
  },
  {
    id: '5',
    name: 'LAIS E SAROM',
    client: 'THALES',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'Residência para Lais e Sarom',
    responsible_ids: ['5'],
    contract_start: '2024-01-20',
    contract_end: '2024-06-20',
    vigencia_contrato: '2024-07-20',
    created_by: '1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-04-05T11:20:00Z'
  },
  {
    id: '6',
    name: 'GILVANDO E ROSANETE',
    client: 'THALES',
    type: 'privado',
    status: 'FINALIZADO',
    description: 'Residência para Gilvando e Rosanete',
    responsible_ids: ['6'],
    contract_start: '2023-10-01',
    contract_end: '2024-03-01',
    vigencia_contrato: '2024-04-01',
    created_by: '1',
    created_at: '2023-09-25T08:00:00Z',
    updated_at: '2024-03-15T16:00:00Z'
  },
  {
    id: '7',
    name: 'CLEBER E IGOR',
    client: 'THALES',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'Residência para Cleber e Igor',
    responsible_ids: ['7'],
    contract_start: '2024-03-15',
    contract_end: '2024-09-15',
    vigencia_contrato: '2024-10-15',
    created_by: '1',
    created_at: '2024-03-10T09:30:00Z',
    updated_at: '2024-03-25T15:45:00Z'
  },
  {
    id: '8',
    name: 'PARQUE ABERTO',
    client: 'ZOOBOTANICO',
    type: 'privado',
    status: 'EM_ESPERA',
    description: 'Projeto de parque aberto zoobotânico',
    responsible_ids: ['8'],
    contract_start: '2024-04-01',
    contract_end: '2024-12-01',
    vigencia_contrato: '2025-01-01',
    created_by: '1',
    created_at: '2024-03-25T11:00:00Z',
    updated_at: '2024-04-05T13:30:00Z'
  },
  {
    id: '9',
    name: 'SALAS COMERCIAIS',
    client: 'NORBERTO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'Complexo de salas comerciais',
    responsible_ids: ['1'],
    contract_start: '2024-02-20',
    contract_end: '2024-07-20',
    vigencia_contrato: '2024-08-20',
    created_by: '1',
    created_at: '2024-02-15T14:00:00Z',
    updated_at: '2024-03-10T10:15:00Z'
  },
  // Public Projects
  {
    id: '10',
    name: 'GASES MEDICINAIS',
    client: 'FHEMIG',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'Sistema de gases medicinais para hospital público',
    responsible_ids: ['2'],
    contract_start: '2024-01-10',
    contract_end: '2024-12-10',
    vigencia_contrato: '2025-01-10',
    created_by: '1',
    created_at: '2024-01-05T08:30:00Z',
    updated_at: '2024-04-12T09:15:00Z'
  },
  {
    id: '11',
    name: 'DELEGACIA POLICIA FEDERAL',
    client: 'SPF/RO',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'Delegacia da Polícia Federal em Rondônia',
    responsible_ids: ['3'],
    contract_start: '2024-02-15',
    contract_end: '2024-10-15',
    vigencia_contrato: '2024-11-15',
    created_by: '1',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-03-25T11:30:00Z'
  },
  {
    id: '12',
    name: 'DELEGACIA DA POLICIA RODOVIARIA FEDERAL',
    client: 'SPRF/AL',
    type: 'publico',
    status: 'FINALIZADO',
    description: 'Delegacia da Polícia Rodoviária Federal em Alagoas',
    responsible_ids: ['4'],
    contract_start: '2023-08-01',
    contract_end: '2024-02-01',
    vigencia_contrato: '2024-03-01',
    created_by: '1',
    created_at: '2023-07-25T09:00:00Z',
    updated_at: '2024-02-15T14:30:00Z'
  },
  {
    id: '13',
    name: 'LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR',
    client: 'TRE/AC',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'Centro de Atendimento ao Eleitor do Acre',
    responsible_ids: ['5'],
    contract_start: '2024-01-05',
    contract_end: '2024-09-05',
    vigencia_contrato: '2024-10-05',
    created_by: '1',
    created_at: '2023-12-28T08:00:00Z',
    updated_at: '2024-03-30T12:00:00Z'
  },
  {
    id: '14',
    name: 'AGENCIA DE TUBARAO',
    client: 'CELESC/RS',
    type: 'publico',
    status: 'EM_ESPERA',
    description: 'Agência da CELESC em Tubarão',
    responsible_ids: ['6'],
    contract_start: '2024-03-01',
    contract_end: '2024-11-01',
    vigencia_contrato: '2024-12-01',
    created_by: '1',
    created_at: '2024-02-25T10:30:00Z',
    updated_at: '2024-03-15T16:20:00Z'
  },
  {
    id: '15',
    name: 'GINASIOS',
    client: 'SOP/RS',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'Complexo de ginásios esportivos',
    responsible_ids: ['7'],
    contract_start: '2024-02-10',
    contract_end: '2024-12-10',
    vigencia_contrato: '2025-01-10',
    created_by: '1',
    created_at: '2024-02-05T11:00:00Z',
    updated_at: '2024-03-01T09:45:00Z'
  },
  {
    id: '16',
    name: 'AGENCIA DA RECEITA FEDERAL',
    client: 'DRF/PV',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'Agência da Receita Federal',
    responsible_ids: ['8'],
    contract_start: '2024-03-20',
    contract_end: '2024-11-20',
    vigencia_contrato: '2024-12-20',
    created_by: '1',
    created_at: '2024-03-15T13:30:00Z',
    updated_at: '2024-04-01T15:00:00Z'
  },
  {
    id: '17',
    name: 'SHOPPING INDEPENDENCIA',
    client: 'PREF. SANTA MARIA/RS',
    type: 'publico',
    status: 'PARALISADO',
    description: 'Revitalização do Shopping Independência',
    responsible_ids: ['1'],
    contract_start: '2024-01-25',
    contract_end: '2024-08-25',
    vigencia_contrato: '2024-09-25',
    created_by: '1',
    created_at: '2024-01-20T08:15:00Z',
    updated_at: '2024-02-10T12:30:00Z'
  },
  {
    id: '18',
    name: 'CAMPUS CURITIBA',
    client: 'UNESPAR/PR',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'Campus universitário em Curitiba',
    responsible_ids: ['2'],
    contract_start: '2023-11-01',
    contract_end: '2024-07-01',
    vigencia_contrato: '2024-08-01',
    created_by: '1',
    created_at: '2023-10-25T09:45:00Z',
    updated_at: '2024-03-20T14:15:00Z'
  },
  {
    id: '19',
    name: 'REFORMA DA COBERTURAS PREFEITURA',
    client: 'PREF.LORENA/SP',
    type: 'publico',
    status: 'AGUARDANDO_PAGAMENTO',
    description: 'Reforma das coberturas da prefeitura',
    responsible_ids: ['3'],
    contract_start: '2024-01-15',
    contract_end: '2024-05-15',
    vigencia_contrato: '2024-06-15',
    created_by: '1',
    created_at: '2024-01-10T10:20:00Z',
    updated_at: '2024-02-28T16:40:00Z'
  }
];

// Mock Tasks Data
export const mockTasks: Task[] = [
  // BRENO - CASA ALTO PADRÃO (ID: '2')
  {
    id: '1',
    project_id: '2',
    title: 'REVISÃO HIDROSSANITÁRIO',
    description: 'Revisão completa do projeto hidrossanitário da residência',
    assigned_to: '5', // Pedro
    status: 'concluida',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 4,
    activity_start: '2024-09-15',
    due_date: '2024-09-24',
    last_delivery: '2024-09-22',
    dependencies: ['ARQUITETURA'],
    completed_at: '2024-09-22T18:00:00Z',
    created_at: '2024-09-10T08:00:00Z'
  },
  {
    id: '2',
    project_id: '2',
    title: 'PROJETO ELÉTRICO E CFTV',
    description: 'Desenvolvimento do projeto elétrico e sistema de CFTV com estudo luminotécnico',
    assigned_to: '6', // Thiago
    status: 'em_andamento',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2024-09-25',
    due_date: '2024-10-15',
    dependencies: ['ARQUITETURA', 'HIDROSSANITARIO'],
    created_at: '2024-09-20T09:00:00Z'
  },

  // PABLO - CASA ALTO PADRÃO (ID: '1')
  {
    id: '3',
    project_id: '1',
    title: 'ARQUITETURA RESIDENCIAL',
    description: 'Desenvolvimento do projeto arquitetônico completo',
    assigned_to: '1', // Igor
    status: 'concluida',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 5,
    activity_start: '2024-01-20',
    due_date: '2024-02-20',
    last_delivery: '2024-02-18',
    completed_at: '2024-02-18T17:00:00Z',
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '4',
    project_id: '1',
    title: 'PROJETO ESTRUTURAL',
    description: 'Dimensionamento da estrutura da residência',
    assigned_to: '4', // Leonardo
    status: 'em_andamento',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-02-25',
    due_date: '2024-03-25',
    dependencies: ['ARQUITETURA'],
    created_at: '2024-02-20T10:00:00Z'
  },

  // FENIX MOVEIS - COWORKING (ID: '3')
  {
    id: '5',
    project_id: '3',
    title: 'LAYOUT COWORKING',
    description: 'Definição do layout e distribuição dos espaços',
    assigned_to: '3', // Bessa
    status: 'em_espera',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'media',
    points: 0,
    activity_start: '',
    due_date: '2024-04-15',
    comment: 'Aguardando aprovação do cliente para prosseguir',
    created_at: '2024-03-05T14:00:00Z'
  },

  // CARVALHO - PORTAL DA ALEGRIA (ID: '4')
  {
    id: '6',
    project_id: '4',
    title: 'PROJETO URBANÍSTICO',
    description: 'Desenvolvimento do projeto urbanístico do conjunto',
    assigned_to: '4', // Leonardo
    status: 'em_andamento',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-03-01',
    due_date: '2024-04-30',
    created_at: '2024-02-25T09:00:00Z'
  },
  {
    id: '7',
    project_id: '4',
    title: 'SISTEMA VIÁRIO',
    description: 'Projeto do sistema viário interno do conjunto',
    assigned_to: '7', // Nicolas
    status: 'pendente',
    phase: 'PROJETO_BASICO',
    priority: 'media',
    points: 0,
    due_date: '2024-05-15',
    dependencies: ['URBANISMO'],
    created_at: '2024-03-01T11:00:00Z'
  },

  // THALES - LAIS E SAROM (ID: '5')
  {
    id: '8',
    project_id: '5',
    title: 'PROJETO HIDROSSANITÁRIO',
    description: 'Sistema hidrossanitário completo da residência',
    assigned_to: '5', // Pedro
    status: 'concluida',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 4,
    activity_start: '2024-02-15',
    due_date: '2024-03-15',
    last_delivery: '2024-03-12',
    dependencies: ['ARQUITETURA'],
    completed_at: '2024-03-12T16:30:00Z',
    created_at: '2024-02-10T08:00:00Z'
  },
  {
    id: '9',
    project_id: '5',
    title: 'PROJETO ELÉTRICO',
    description: 'Instalações elétricas e automação residencial',
    assigned_to: '6', // Thiago
    status: 'em_andamento',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-03-18',
    due_date: '2024-04-18',
    dependencies: ['ARQUITETURA', 'HIDROSSANITARIO'],
    created_at: '2024-03-15T10:00:00Z'
  },

  // FHEMIG - GASES MEDICINAIS (ID: '10')
  {
    id: '10',
    project_id: '10',
    title: 'PROJETO DE GASES MEDICINAIS',
    description: 'Sistema completo de gases medicinais hospitalares',
    assigned_to: '2', // Gustavo
    status: 'em_andamento',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-02-01',
    due_date: '2024-06-01',
    created_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '11',
    project_id: '10',
    title: 'INSTALAÇÕES ESPECIAIS',
    description: 'Ar comprimido medicinal e vácuo clínico',
    assigned_to: '8', // Eloisy
    status: 'pendente',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    due_date: '2024-07-01',
    dependencies: ['GASES_MEDICINAIS'],
    created_at: '2024-02-01T14:00:00Z'
  },

  // SPF/RO - DELEGACIA PF (ID: '11')
  {
    id: '12',
    project_id: '11',
    title: 'PROJETO ARQUITETÔNICO',
    description: 'Arquitetura da delegacia da Polícia Federal',
    assigned_to: '3', // Bessa
    status: 'em_andamento',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-03-01',
    due_date: '2024-05-01',
    created_at: '2024-02-20T11:00:00Z'
  },
  {
    id: '13',
    project_id: '11',
    title: 'SISTEMA DE SEGURANÇA',
    description: 'Projeto de segurança eletrônica e controle de acesso',
    assigned_to: '6', // Thiago
    status: 'pendente',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    due_date: '2024-06-01',
    dependencies: ['ARQUITETURA'],
    created_at: '2024-03-01T15:00:00Z'
  },

  // TRE/AC - CENTRO ATENDIMENTO ELEITOR (ID: '13')
  {
    id: '14',
    project_id: '13',
    title: 'ADEQUAÇÃO ARQUITETÔNICA',
    description: 'Adequação do espaço para atendimento ao eleitor',
    assigned_to: '5', // Pedro
    status: 'em_andamento',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2024-02-01',
    due_date: '2024-04-01',
    created_at: '2024-01-10T09:00:00Z'
  },

  // SOP/RS - GINÁSIOS (ID: '15')
  {
    id: '15',
    project_id: '15',
    title: 'PROJETO ESTRUTURAL GINÁSIOS',
    description: 'Estrutura metálica dos ginásios esportivos',
    assigned_to: '4', // Leonardo
    status: 'em_andamento',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-03-15',
    due_date: '2024-06-15',
    created_at: '2024-03-01T08:00:00Z'
  },
  {
    id: '16',
    project_id: '15',
    title: 'INSTALAÇÕES ESPORTIVAS',
    description: 'Sistemas elétricos e hidráulicos específicos',
    assigned_to: '9', // Rondinelly
    status: 'pendente',
    phase: 'PROJETO_BASICO',
    priority: 'media',
    points: 0,
    due_date: '2024-07-15',
    dependencies: ['ESTRUTURAL'],
    created_at: '2024-03-15T10:00:00Z'
  },

  // UNESPAR/PR - CAMPUS CURITIBA (ID: '18')
  {
    id: '17',
    project_id: '18',
    title: 'PROJETO ARQUITETÔNICO CAMPUS',
    description: 'Arquitetura do complexo universitário',
    assigned_to: '2', // Gustavo
    status: 'em_andamento',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2024-01-15',
    due_date: '2024-04-15',
    created_at: '2023-12-01T09:00:00Z'
  },
  {
    id: '18',
    project_id: '18',
    title: 'LABORATÓRIOS ESPECIALIZADOS',
    description: 'Projeto dos laboratórios e salas técnicas',
    assigned_to: '10', // Edilson
    status: 'pendente',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    due_date: '2024-05-15',
    dependencies: ['ARQUITETURA'],
    created_at: '2024-01-15T14:00:00Z'
  },

  // Tarefas adicionais diversas
  {
    id: '19',
    project_id: '7',
    title: 'ESTUDO PRELIMINAR',
    description: 'Estudo preliminar da residência Cleber e Igor',
    assigned_to: '7', // Nicolas
    status: 'em_andamento',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'media',
    points: 0,
    activity_start: '2024-03-20',
    due_date: '2024-04-20',
    created_at: '2024-03-18T11:00:00Z'
  },
  {
    id: '20',
    project_id: '8',
    title: 'LEVANTAMENTO TOPOGRÁFICO',
    description: 'Levantamento do terreno do parque zoobotânico',
    assigned_to: '11', // Stael
    status: 'em_espera',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'baixa',
    points: 0,
    due_date: '2024-05-01',
    comment: 'Aguardando liberação do terreno',
    created_at: '2024-04-01T08:00:00Z'
  }
];

// Mock Proposals Data (Admin only)
export const mockProposals: Proposal[] = [
  {
    id: '1',
    client_name: 'Maria Santos Arquitetura',
    proposal_date: '2024-04-01',
    proposal_value: 125000,
    last_meeting: '2024-03-28',
    proposal_link: 'https://drive.google.com/proposal-maria-santos',
    followup_date: '2024-04-15',
    status: 'negociando',
    notes: 'Cliente interessado, aguardando ajustes no cronograma',
    created_at: '2024-03-25T14:00:00Z',
    updated_at: '2024-04-02T09:30:00Z'
  },
  {
    id: '2',
    client_name: 'Construtora Horizonte',
    proposal_date: '2024-03-15',
    proposal_value: 350000,
    last_meeting: '2024-03-20',
    proposal_link: 'https://drive.google.com/proposal-horizonte',
    followup_date: '2024-04-10',
    status: 'pendente',
    notes: 'Primeira proposta enviada, aguardando retorno',
    created_at: '2024-03-10T10:15:00Z',
    updated_at: '2024-03-22T16:45:00Z'
  },
  {
    id: '3',
    client_name: 'Shopping Center ABC',
    proposal_date: '2024-02-20',
    proposal_value: 890000,
    last_meeting: '2024-04-05',
    proposal_link: 'https://drive.google.com/proposal-shopping-abc',
    status: 'aprovada',
    notes: 'Proposta aprovada! Início previsto para maio',
    created_at: '2024-02-15T08:20:00Z',
    updated_at: '2024-04-06T11:10:00Z'
  },
  {
    id: '4',
    client_name: 'Residencial Palmeiras',
    proposal_date: '2024-01-30',
    proposal_value: 180000,
    last_meeting: '2024-02-15',
    status: 'rejeitada',
    notes: 'Cliente optou por outra empresa devido ao prazo',
    created_at: '2024-01-25T13:30:00Z',
    updated_at: '2024-02-20T14:55:00Z'
  }
];

// Mock Achievements Data
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    user_id: '2', // Gustavo
    achievement_type: 'task_completion',
    title: 'Primeira Tarefa',
    description: 'Complete sua primeira tarefa',
    points_earned: 10,
    earned_at: subDays(new Date(), 15).toISOString()
  },
  {
    id: '2',
    user_id: '4', // Leonardo
    achievement_type: 'speed',
    title: 'Velocidade Máxima',
    description: 'Complete 5 tarefas em um dia',
    points_earned: 50,
    earned_at: subDays(new Date(), 8).toISOString()
  },
  {
    id: '3',
    user_id: '9', // Rondinelly
    achievement_type: 'consistency',
    title: 'Perfeccionista',
    description: 'Complete 10 tarefas sem atrasos',
    points_earned: 75,
    earned_at: subDays(new Date(), 3).toISOString()
  }
];

// Utility functions
export const getProjectsByUser = (userId: string) => {
  return mockProjects.filter(project => project.responsible_ids.includes(userId));
};

export const getTasksByUser = (userId: string) => {
  return mockTasks.filter(task => task.assigned_to === userId);
};

export const getAchievementsByUser = (userId: string) => {
  return mockAchievements.filter(achievement => achievement.user_id === userId);
};