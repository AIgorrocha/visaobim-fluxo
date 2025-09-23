import { Project, Task, Proposal, Achievement } from '@/types';

// Mock Projects Data - COMPLETO E ATUALIZADO (19 PROJETOS)
export const mockProjects: Project[] = [
  // PROJETO 1: CASA ALTO PADRÃO - BRENO
  {
    id: '1',
    name: 'CASA ALTO PADRÃO',
    client: 'BRENO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'PROJETOS DE ENGENHARIA E ORÇAMENTO DE CASA DE ALTO PADRÃO',
    responsible_ids: ['8', '10', '6', '4', '5', '2'], // ELOISY, EDILSON, THIAGO, LEONARDO, PEDRO, GUSTAVO
    contract_start: '2025-03-07',
    contract_end: '2025-06-07',
    prazo_vigencia: '',
    // Campos financeiros
    project_value: 450000,
    amount_paid: 180000,
    amount_pending: 270000,
    expenses: 95000,
    profit_margin: 25,
    created_by: '1',
    created_at: '2025-03-01T08:00:00Z',
    updated_at: '2025-03-07T10:30:00Z'
  },
  // PROJETO 2: CASA ALTO PADRÃO - PABLO
  {
    id: '2',
    name: 'CASA ALTO PADRÃO',
    client: 'PABLO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'PROJETOS DE ENGENHARIA E ORÇAMENTO DE CASA DE ALTO PADRÃO',
    responsible_ids: ['9', '10', '6', '4', '5', '2'], // RONDINELLY, EDILSON, THIAGO, LEONARDO, PEDRO, GUSTAVO
    contract_start: '2025-03-31',
    contract_end: '2025-06-30',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-03-25T09:00:00Z',
    updated_at: '2025-03-31T14:20:00Z'
  },
  // PROJETO 3: COWORKING - FENIX MOVEIS
  {
    id: '3',
    name: 'COWORKING',
    client: 'FENIX MOVEIS',
    type: 'privado',
    status: 'CONCLUIDO',
    description: 'PROJETOS DE ARQUITETURA, ENGENHARIA E ORÇAMENTO DE SALAS COMERCIAIS E COWORKING',
    responsible_ids: ['8', '10', '6', '4', '5', '11'], // ELOISY, EDILSON, THIAGO, LEONARDO, PEDRO, PHILIP
    contract_start: '2025-07-17',
    contract_end: '2025-07-17',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-07-10T11:00:00Z',
    updated_at: '2025-07-17T16:45:00Z'
  },
  // PROJETO 4: PORTAL DA ALEGRIA - CARVALHO
  {
    id: '4',
    name: 'PORTAL DA ALEGRIA',
    client: 'CARVALHO',
    type: 'privado',
    status: 'PARALISADO',
    description: 'PROJETOS DE ARQUITETURA, ENGENHARIA E ORÇAMENTO DE SUPERMERCADO',
    responsible_ids: ['8', '10', '6', '4', '5', '11', '2', '14', '7', '9'], // ELOISY, EDILSON, THIAGO, LEONARDO, PEDRO, PHILIP, GUSTAVO, PROJETISTA EXTERNO, NICOLAS, RONDINELLY
    contract_start: '2025-07-26',
    contract_end: '2025-11-26',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-07-20T09:00:00Z',
    updated_at: '2025-07-26T14:30:00Z'
  },
  // PROJETO 5: LAIS E SAROM - THALES
  {
    id: '5',
    name: 'LAIS E SAROM',
    client: 'THALES',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'CONSTRUCAO VIRTUAL E RELATÓRIO DE QUANTITATIVOS PARA CASA DE ALTO PADRAO',
    responsible_ids: ['4', '10', '1'], // LEONARDO, EDILSON, IGOR
    contract_start: '2024-03-27',
    contract_end: '2024-06-27',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-27T11:20:00Z'
  },
  // PROJETO 6: GILVANDO E ROSANETE - THALES
  {
    id: '6',
    name: 'GILVANDO E ROSANETE',
    client: 'THALES',
    type: 'privado',
    status: 'EM_ESPERA',
    description: 'CONSTRUCAO VIRTUAL E RELATÓRIO DE QUANTITATIVOS PARA CASA DE ALTO PADRAO',
    responsible_ids: ['4', '10'], // LEONARDO, EDILSON
    contract_start: '',
    contract_end: '',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T16:00:00Z'
  },
  // PROJETO 7: CLEBER E IGOR - THALES
  {
    id: '7',
    name: 'CLEBER E IGOR',
    client: 'THALES',
    type: 'privado',
    status: 'EM_ESPERA',
    description: 'CONSTRUCAO VIRTUAL E RELATÓRIO DE QUANTITATIVOS PARA CASA DE ALTO PADRAO',
    responsible_ids: ['4', '10'], // LEONARDO, EDILSON
    contract_start: '',
    contract_end: '',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T16:00:00Z'
  },
  // PROJETO 8: PARQUE ABERTO - ZOOBOTANICO
  {
    id: '8',
    name: 'PARQUE ABERTO',
    client: 'ZOOBOTANICO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'AS BUILT E PROJETO DE INCENDIO',
    responsible_ids: ['9'], // RONDINELLY
    contract_start: '2025-07-15',
    contract_end: '2025-10-15',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-07-10T08:00:00Z',
    updated_at: '2025-07-15T10:00:00Z'
  },
  // PROJETO 9: SALAS COMERCIAIS - NORBERTO
  {
    id: '9',
    name: 'SALAS COMERCIAIS',
    client: 'NORBERTO',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    description: 'PROJETO ARQUITETÔNICO DE SALAS COMERCIAIS',
    responsible_ids: ['4', '3'], // LEONARDO, BESSA
    contract_start: '2025-09-17',
    contract_end: '2025-11-17',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-09-10T08:00:00Z',
    updated_at: '2025-09-17T10:00:00Z'
  },
  // PROJETO 10: GASES MEDICINAIS - FHEMIG
  {
    id: '10',
    name: 'GASES MEDICINAIS',
    client: 'FHEMIG',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'AS BUILT E PROJETO DE GASES MEDICINAIS MATERNIDADE ODETE VALADARES',
    responsible_ids: ['14'], // PROJETISTA EXTERNO
    contract_start: '2025-05-30',
    contract_end: '2025-11-30',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-05-25T08:00:00Z',
    updated_at: '2025-05-30T10:00:00Z'
  },
  // PROJETO 11: DELEGACIA POLICIA FEDERAL - SPF/RO
  {
    id: '11',
    name: 'DELEGACIA POLICIA FEDERAL',
    client: 'SPF/RO',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'PROJETOS DA NOVA DELEGACIA DA RECEITA FEDERAL EM VILHENA',
    responsible_ids: ['3', '4', '5', '6', '8', '10', '11'], // BESSA, LEONARDO, PEDRO, THIAGO, ELOISY, EDILSON, PHILIP
    contract_start: '2025-01-30',
    contract_end: '2025-06-30',
    prazo_vigencia: '2025-06-30',
    created_by: '1',
    created_at: '2025-01-25T08:00:00Z',
    updated_at: '2025-01-30T10:00:00Z'
  },
  // PROJETO 12: DELEGACIA DA POLICIA RODOVIARIA FEDERAL - SPRF/AL
  {
    id: '12',
    name: 'DELEGACIA DA POLICIA RODOVIARIA FEDERAL',
    client: 'SPRF/AL',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'IMPLANTACAO DA NOVA SEDE DA PRF EM SÃO SEBASTIAO',
    responsible_ids: ['4', '2', '10'], // LEONARDO, GUSTAVO, EDILSON
    contract_start: '2025-08-04',
    contract_end: '2025-08-28',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-08-01T08:00:00Z',
    updated_at: '2025-08-04T10:00:00Z'
  },
  // PROJETO 13: LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR - TRE/AC (CORRIGIDO - SEM GUSTAVO)
  {
    id: '13',
    name: 'LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR',
    client: 'TRE/AC',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'PROJETO DE REFORMA DA NOVA SEDE DE ATENDIMENTO AO ELEITOR',
    responsible_ids: ['4', '10'], // LEONARDO, EDILSON (REMOVIDO GUSTAVO)
    contract_start: '2025-06-23',
    contract_end: '2025-09-23',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-06-20T08:00:00Z',
    updated_at: '2025-06-23T10:00:00Z'
  },
  // PROJETO 14: AGENCIA DE TUBARAO - CELESC/RS
  {
    id: '14',
    name: 'AGENCIA DE TUBARAO',
    client: 'CELESC/RS',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'PROJETO DE DEMOLICAO E CONSTRUCAO DA NOVA AGENCIA DA CELESC',
    responsible_ids: ['3', '4', '2', '8', '9', '5', '6', '11', '10'], // BESSA, LEONARDO, GUSTAVO, ELOISY, RONDINELLY, PEDRO, THIAGO, PHILIP, EDILSON
    contract_start: '2025-07-09',
    contract_end: '2026-01-09',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-07-01T08:00:00Z',
    updated_at: '2025-07-09T10:00:00Z'
  },
  // PROJETO 15: GINASIOS - SOP/RS
  {
    id: '15',
    name: 'GINASIOS',
    client: 'SOP/RS',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'PROJETO EXECUTIVO E IMPLANTACAO DE GINASIOS EM ESCOLAS',
    responsible_ids: ['3', '4', '2', '8', '5', '6', '10'], // BESSA, LEONARDO, GUSTAVO, ELOISY, PEDRO, THIAGO, EDILSON
    contract_start: '2025-07-24',
    contract_end: '2025-10-24',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-07-20T08:00:00Z',
    updated_at: '2025-07-24T10:00:00Z'
  },
  // PROJETO 16: AGENCIA DA RECEITA FEDERAL - DRV/PV
  {
    id: '16',
    name: 'AGENCIA DA RECEITA FEDERAL',
    client: 'DRV/PV',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'CONSTRUCAO DA NOVA AGENCIA DA RECEITA FEDERAL EM PORTO VELHO',
    responsible_ids: ['3', '4', '2', '8', '5', '6', '10', '9', '11', '7'], // BESSA, LEONARDO, GUSTAVO, ELOISY, PEDRO, THIAGO, EDILSON, RONDINELLY, PHILIP, NICOLAS
    contract_start: '2025-03-31',
    contract_end: '2025-08-30',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-03-25T08:00:00Z',
    updated_at: '2025-03-31T10:00:00Z'
  },
  // PROJETO 17: SHOPPING INDEPENDENCIA - PREF. SANTA MARIA/RS
  {
    id: '17',
    name: 'SHOPPING INDEPENDENCIA',
    client: 'PREF. SANTA MARIA/RS',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'REFORMA DAS COBERTURAS DO SHOPPING INDEPENDENCIA',
    responsible_ids: ['4', '10', '1'], // LEONARDO, EDILSON, IGOR
    contract_start: '2025-03-15',
    contract_end: '2025-04-30',
    prazo_vigencia: '2025-06-15',
    created_by: '1',
    created_at: '2025-03-10T08:00:00Z',
    updated_at: '2025-03-15T10:00:00Z'
  },
  // PROJETO 18: CAMPUS CURITIBA - UNESPAR/PR
  {
    id: '18',
    name: 'CAMPUS CURITIBA',
    client: 'UNESPAR/PR',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'REFORMA DO CAMPUS CURITIBA NO',
    responsible_ids: ['8', '6', '10'], // ELOISY, THIAGO, EDILSON
    contract_start: '2025-01-06',
    contract_end: '2025-04-06',
    prazo_vigencia: '2025-12-06',
    created_by: '1',
    created_at: '2025-01-02T08:00:00Z',
    updated_at: '2025-01-06T10:00:00Z'
  },
  // PROJETO 19: REFORMA DAS COBERTURAS PREFEITURA - PREF.LORENA/SP
  {
    id: '19',
    name: 'REFORMA DAS COBERTURAS PREFEITURA',
    client: 'PREF.LORENA/SP',
    type: 'publico',
    status: 'CONCLUIDO',
    description: 'PROJETO DE REFORMA DAS COBERTURAS DA SEDE DA PREFEITURA DE LORENA SP',
    responsible_ids: ['1'], // IGOR
    contract_start: '',
    contract_end: '',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  }
];

// Mock Tasks Data - COMPLETO E ATUALIZADO (52 TAREFAS)
export const mockTasks: Task[] = [
  // PROJETO 1: CASA ALTO PADRÃO - BRENO
  {
    id: '1',
    project_id: '1',
    title: 'REVISAO HIDROSSANITÁRIO',
    description: 'Revisão do projeto hidrossanitário',
    assigned_to: '5', // PEDRO
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-15',
    due_date: '2025-09-24',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '2',
    project_id: '1',
    title: 'APRESENTACAO PROJETOS VIA DALUX',
    description: 'Apresentação dos projetos via plataforma Dalux',
    assigned_to: '1', // IGOR
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 15,
    activity_start: '2025-09-04',
    due_date: '2025-10-03',
    completed_at: '2025-09-28',
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
    assigned_to: '2', // GUSTAVO
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '4',
    project_id: '2',
    title: 'PROJETO ELÉTRICO BAIXA TENSÃO',
    description: 'Projeto elétrico de baixa tensão',
    assigned_to: '6', // THIAGO
    status: 'PARALISADA', // CORRIGIDO - ERA PENDENTE, AGORA É PARALISADO
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: null,
    due_date: null,
    completed_at: null,
    restricoes: 'ARQUITETURA',
    comment: 'AGUARDANDO LUMINOTÉCNICO',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '5',
    project_id: '2',
    title: 'PROJETO HIDROSSANITÁRIO',
    description: 'Projeto hidrossanitário completo',
    assigned_to: '5', // PEDRO
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: '2025-07-30',
    restricoes: 'ARQUITETURA',
    comment: 'AGUARDANDO LUMINOTÉCNICO',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '6',
    project_id: '2',
    title: 'PROJETO CLIMATIZAÇÃO',
    description: 'Projeto de climatização',
    assigned_to: '9', // RONDINELLY
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 10,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: '2025-08-10',
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '7',
    project_id: '2',
    title: 'CONSTRUÇÃO VIRTUAL ARQUITETURA',
    description: 'Modelagem BIM da arquitetura',
    assigned_to: '4', // LEONARDO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '8',
    project_id: '2',
    title: 'COMPATIBILIZACAO E RELATORIO',
    description: 'Compatibilização de projetos e relatório',
    assigned_to: '10', // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: null,
    completed_at: null,
    restricoes: 'CONSTRUÇÃO VIRTUAL,ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },
  {
    id: '9',
    project_id: '2',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo completo',
    assigned_to: '10', // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: null,
    completed_at: null,
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
    due_date: '2025-10-03',
    completed_at: null,
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
    activity_start: null,
    due_date: null,
    completed_at: null,
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
    assigned_to: '10', // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-17',
    due_date: '2025-09-29',
    completed_at: null,
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
    assigned_to: '10', // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: null,
    due_date: null,
    completed_at: null,
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
    activity_start: null,
    due_date: null,
    completed_at: null,
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
    due_date: '2025-09-15',
    completed_at: null,
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
    assigned_to: '9', // RONDINELLY
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-09-15',
    completed_at: null,
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
    assigned_to: '3', // BESSA
    status: 'PENDENTE',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-15', // CORRIGIDO - ADICIONADA DATA INÍCIO
    due_date: '2025-11-15', // CORRIGIDO - PRAZO DE 15/09/2025 PARA 15/11/2025
    completed_at: null,
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
    assigned_to: '14', // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-05-30',
    due_date: '2025-09-30',
    completed_at: '2025-09-18',
    restricoes: '',
    comment: 'AGENDAMENTO DE REUNIAO E PRAZOS PARA PROJETO EXECUTIVO (ETAPA 2)',
    created_at: '2025-05-25T08:00:00Z'
  },
  {
    id: '19',
    project_id: '10',
    title: 'ETAPA 2',
    description: 'Etapa 2 - Projeto executivo',
    assigned_to: '14', // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-09-19',
    due_date: null,
    completed_at: '2025-09-22',
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
    assigned_to: '10', // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-19',
    due_date: '2025-09-26',
    completed_at: null,
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
    assigned_to: '10', // EDILSON
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: '2025-09-10',
    due_date: '2025-09-19',
    completed_at: '2025-09-22',
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
    assigned_to: '10', // EDILSON
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: null,
    due_date: null,
    completed_at: '2025-09-20',
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
    activity_start: null,
    due_date: '2025-11-02', // CORRIGIDO - ERA 02/11/2025
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '24',
    project_id: '14',
    title: 'PRE DIMENSIONAMENTO E MODELAGEM INICIAL ESTRUTURA, PLANTA DE FUROS PARA SONDAGEM',
    description: 'Pré-dimensionamento e modelagem inicial da estrutura',
    assigned_to: '2', // GUSTAVO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-09-28',
    completed_at: null,
    restricoes: '',
    comment: 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '25',
    project_id: '14',
    title: 'EXECUTIVO ESTRUTURAL E FUNDACOES',
    description: 'Executivo estrutural e fundações',
    assigned_to: '2', // GUSTAVO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-11-02', // CORRIGIDO - ERA 28/09, AGORA É 02/11/2025
    completed_at: null,
    restricoes: '',
    comment: 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '26',
    project_id: '14',
    title: 'PROJETO HIDROSSANITARIO',
    description: 'Projeto hidrossanitário',
    assigned_to: '5', // PEDRO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-11-02',
    completed_at: null,
    restricoes: 'ESTRUTURA',
    comment: 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '27',
    project_id: '14',
    title: 'PROJETO ELETRICO, LOGICA E TELEFONIA',
    description: 'Projeto elétrico, lógica e telefonia',
    assigned_to: '6', // THIAGO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-11-02',
    completed_at: null,
    restricoes: 'ESTRUTURA',
    comment: 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '28',
    project_id: '14',
    title: 'PROJETO CLIMATIZACAO',
    description: 'Projeto de climatização',
    assigned_to: '9', // RONDINELLY
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-11-02',
    completed_at: null,
    restricoes: 'ESTRUTURA',
    comment: 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '29',
    project_id: '14',
    title: 'PROJETO INCENDIO',
    description: 'Projeto de incêndio',
    assigned_to: '8', // ELOISY
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-11-02',
    completed_at: null,
    restricoes: 'ESTRUTURA',
    comment: '',
    created_at: '2025-07-01T08:00:00Z'
  },
  {
    id: '30',
    project_id: '14',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo',
    assigned_to: '10', // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-12-09',
    completed_at: null,
    restricoes: 'ESTRUTURA',
    comment: '',
    created_at: '2025-07-01T08:00:00Z'
  },

  // PROJETO 15: GINASIOS - SOP/RS
  {
    id: '31',
    project_id: '15',
    title: 'MODELAGEM DAS IMPLANTACOES',
    description: 'Modelagem das implantações',
    assigned_to: ['4', '3'], // LEONARDO, BESSA
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-12',
    due_date: '2025-09-26',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '32',
    project_id: '15',
    title: 'PROJETO ARQUITETONICO E ACESSIBILIDADE EXECUTIVO',
    description: 'Projeto arquitetônico e acessibilidade executivo',
    assigned_to: ['4', '3'], // LEONARDO, BESSA
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '33',
    project_id: '15',
    title: 'PROJETO HIDROSSANITARIO',
    description: 'Projeto hidrossanitário',
    assigned_to: '5', // PEDRO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '34',
    project_id: '15',
    title: 'PROJETO ELETRICO E LOGICA',
    description: 'Projeto elétrico e lógica',
    assigned_to: '6', // THIAGO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '35',
    project_id: '15',
    title: 'PROJETO SPDA E INCENDIO',
    description: 'Projeto SPDA e incêndio',
    assigned_to: '8', // ELOISY
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '36',
    project_id: '15',
    title: 'PROJETO ESTRUTURAL E FUNDACOES',
    description: 'Projeto estrutural e fundações',
    assigned_to: '2', // GUSTAVO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '37',
    project_id: '15',
    title: 'COMPATIBILIZACAO E AJUSTES',
    description: 'Compatibilização e ajustes',
    assigned_to: '2', // GUSTAVO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-10-10',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },
  {
    id: '38',
    project_id: '15',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo',
    assigned_to: '10', // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-10-17',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-09-10T08:00:00Z'
  },

  // PROJETO 16: AGENCIA DA RECEITA FEDERAL - DRV/PV (CORRIGIDO)
  {
    id: '39',
    project_id: '16',
    title: 'PROJETO ARQUITETONICO, ACESSIBILIDADE, PAISAGISMO, SINALIZACAO E COMUNICAO VISUAL',
    description: 'Projeto arquitetônico completo',
    assigned_to: ['4', '3'], // LEONARDO, BESSA
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '40',
    project_id: '16',
    title: 'LAYOUT ARQUITETONICO',
    description: 'Layout arquitetônico',
    assigned_to: ['4', '3'], // LEONARDO, BESSA
    status: 'CONCLUIDA',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'alta',
    points: 10,
    activity_start: '2025-04-30',
    due_date: '2025-05-30',
    completed_at: '2025-08-01',
    restricoes: '',
    comment: 'NO DIA 07 DE AGOSTO, PERGUNTEI SOBRE APROVACAO DOS PROJETOS PRIMEIRA ETAPA, DIA 19 AGOSTO FOI QUESTIONADO SOBRE AS PONTUACOES DA FACHADA, DIA 12 DE SETEMBRO FORAM ENVIADOS DIVERSOS PROJETOS DE ENGENHARIA, RETONARAM ATE DIA DE HOJE 22.09 APENAS OS APONTAMENTOS DO SPDA E ELETRICO.',
    created_at: '2025-04-25T08:00:00Z'
  },
  {
    id: '41',
    project_id: '16',
    title: 'PROJETO ESTRUTURAL E FUNDACOES',
    description: 'Projeto estrutural e fundações',
    assigned_to: ['2', '12'], // GUSTAVO, NARA
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '42',
    project_id: '16',
    title: 'PROJETO HIDROSSANITARIO',
    description: 'Projeto hidrossanitário',
    assigned_to: '2', // GUSTAVO
    status: 'EM_ESPERA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 5,
    activity_start: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: '2025-09-12',
    restricoes: '',
    comment: 'AGUARDANDO APONTAMENTOS DA FISCALIZACAO',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '43',
    project_id: '16',
    title: 'PROJETO LUMINOTECNICO, ELETRICO BAIXA TENSAO, CABEAMENTOS, CFTV, REDE LOGICA, TELECOMUNICACOES, SONORIZACAO, CONTROLE DE ACESSO, ENERGIA ESTABILIZADA',
    description: 'Projeto elétrico completo',
    assigned_to: '6', // THIAGO
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 5,
    activity_start: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: '2025-09-19',
    restricoes: '',
    comment: 'AJUSTES REALIZADOS PELO THIAGO E VAMOS ABORDAR NA REUNIAO',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '44',
    project_id: '16',
    title: 'PROJETO ENTRADA DE ENERGIA, SUBESTACAO AEREA EM POSTE, GRUPO GERADOR, FOTOVOLTAICA',
    description: 'Projeto de entrada de energia e sistemas',
    assigned_to: '7', // NICOLAS
    status: 'PARALISADA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-10-19',
    completed_at: '2025-09-19',
    restricoes: '',
    comment: 'AJUSTAR URGENTE COM THIAGO PRA INICIAR PROJETOS FOTOVOLTAICOS, GERADOR E SUBESTACAO, ALINHAR PRA INICIO', // COMENTÁRIO ATUALIZADO
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '45',
    project_id: '16',
    title: 'PROJETO DE CLIMATIZACAO',
    description: 'Projeto de climatização',
    assigned_to: '9', // RONDINELLY
    status: 'EM_ESPERA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 5,
    activity_start: null,
    due_date: '2025-10-19',
    completed_at: '2025-09-12',
    restricoes: '',
    comment: 'AGUARDANDO RESPOSTA FISCALIZACAO.',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '46',
    project_id: '16',
    title: 'PROJETO CANTEIRO DE OBRA',
    description: 'Projeto canteiro de obra',
    assigned_to: '10', // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: null,
    due_date: '2025-10-19',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '47',
    project_id: '16',
    title: 'PROJETO TERRAPLENAGEM',
    description: 'Projeto de terraplenagem',
    assigned_to: '4', // LEONARDO
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: null,
    due_date: '2025-10-19',
    completed_at: null,
    restricoes: '',
    comment: '',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '48',
    project_id: '16',
    title: 'COMPATIBILIZACAO, AJUSTES E ORCAMENTO EXECUTIVO',
    description: 'Compatibilização, ajustes e orçamento executivo',
    assigned_to: '10', // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: null,
    due_date: '2025-10-30',
    completed_at: null,
    restricoes: '',
    comment: 'NECESSARIO IR MONTANDO EAP PRA APRESENTAR PRO ORGAO, E COMO VAMOS FAZER A ASSOCIACAO, JA POSSO ADQURIR O ORCABIM (QND INICIAR)', // COMENTÁRIO ATUALIZADO
    created_at: '2025-08-25T08:00:00Z'
  },

  // PROJETO 17: SHOPPING INDEPENDENCIA - PREF. SANTA MARIA/RS
  {
    id: '49',
    project_id: '17',
    title: 'PROJETO DE SEGURANCA, BASICO ARQUITETONICO E ORCAMENTO',
    description: 'Projeto de segurança, básico arquitetônico e orçamento',
    assigned_to: ['1', '10', '4'], // IGOR, EDILSON, LEONARDO
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 10,
    activity_start: null,
    due_date: null,
    completed_at: '2025-07-31',
    restricoes: '',
    comment: 'AGUARDANDO FISCALIZACAO ENVIAR ANALISE.',
    created_at: '2025-03-10T08:00:00Z'
  },

  // PROJETO 18: CAMPUS CURITIBA - UNESPAR/PR
  {
    id: '50',
    project_id: '18',
    title: 'APROVACAO PROJETO DE INCENDIO NO CORPO DE BOMBEIROS',
    description: 'Aprovação do projeto de incêndio no corpo de bombeiros',
    assigned_to: '8', // ELOISY
    status: 'EM_ESPERA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 5,
    activity_start: null,
    due_date: null,
    completed_at: '2025-09-15',
    restricoes: '',
    comment: 'AGUARDANDO ANALISE CORPO DE BOMBEIROS',
    created_at: '2025-01-02T08:00:00Z'
  },
  {
    id: '51',
    project_id: '18',
    title: 'ORCAMENTO',
    description: 'Orçamento do projeto',
    assigned_to: '10', // EDILSON
    status: 'EM_ESPERA',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 5,
    activity_start: null,
    due_date: null,
    completed_at: '2025-09-08',
    restricoes: '',
    comment: '',
    created_at: '2025-01-02T08:00:00Z'
  },

  // PROJETO 19: REFORMA DAS COBERTURAS PREFEITURA - PREF.LORENA/SP
  {
    id: '52',
    project_id: '19',
    title: 'AGUARDANDO LICITAR OBRA PRA FISCALIZACAO',
    description: 'Aguardando licitação da obra para fiscalização',
    assigned_to: '1', // IGOR
    status: 'PARALISADA',
    phase: 'EXECUTIVO',
    priority: 'baixa',
    points: 0,
    activity_start: null,
    due_date: null,
    completed_at: null,
    restricoes: '',
    comment: 'COMECO DE OUTUBRO PRA CONTRATAR EMPRESA QUE VAI EXECUTAR A OBRA',
    created_at: '2024-01-01T08:00:00Z'
  }
];

// Mock Proposals Data - PROPOSTAS FICTÍCIAS EM TODAS AS ETAPAS
export const mockProposals: Proposal[] = [
  // PENDENTE
  {
    id: '1',
    client_name: 'Dr. Ricardo Medeiros',
    proposal_date: '2025-09-20',
    proposal_value: 890000,
    last_meeting: '2025-09-18',
    proposal_link: 'https://drive.google.com/file/proposta-centro-medico',
    followup_date: '2025-10-05',
    status: 'pendente',
    notes: 'Projeto completo para centro médico com 15 consultórios, laboratório e área de exames. Cliente interessado mas aguardando aprovação do consórcio.',
    created_at: '2025-09-20T08:00:00Z',
    updated_at: '2025-09-23T14:30:00Z'
  },
  {
    id: '2',
    client_name: 'Metalúrgica São Paulo Ltda',
    proposal_date: '2025-09-18',
    proposal_value: 1200000,
    last_meeting: '2025-09-16',
    proposal_link: 'https://drive.google.com/file/galpao-industrial',
    followup_date: '2025-10-02',
    status: 'pendente',
    notes: 'Galpão industrial de 2000m² com ponte rolante e sistema de ventilação industrial. Aguardando resposta da diretoria.',
    created_at: '2025-09-18T10:15:00Z',
    updated_at: '2025-09-22T16:45:00Z'
  },

  // NEGOCIANDO
  {
    id: '3',
    client_name: 'Tech Park Empreendimentos',
    proposal_date: '2025-09-05',
    proposal_value: 3500000,
    last_meeting: '2025-09-20',
    proposal_link: 'https://drive.google.com/file/tech-park',
    followup_date: '2025-09-28',
    status: 'negociando',
    notes: 'Condomínio empresarial com 8 torres comerciais, centro de convenções e estacionamento subterrâneo. Negociando redução de 10% no valor.',
    created_at: '2025-09-05T16:30:00Z',
    updated_at: '2025-09-22T09:45:00Z'
  },
  {
    id: '4',
    client_name: 'Horizonte Investimentos',
    proposal_date: '2025-08-28',
    proposal_value: 5200000,
    last_meeting: '2025-09-15',
    proposal_link: 'https://drive.google.com/file/shopping-horizonte',
    followup_date: '2025-09-30',
    status: 'negociando',
    notes: 'Shopping center com 150 lojas, praça de alimentação, cinema e área de lazer. Cliente quer alterações no projeto de segurança.',
    created_at: '2025-08-28T13:15:00Z',
    updated_at: '2025-09-21T16:30:00Z'
  },
  {
    id: '5',
    client_name: 'Premium Hotelaria S.A.',
    proposal_date: '2025-08-25',
    proposal_value: 2800000,
    last_meeting: '2025-09-18',
    proposal_link: 'https://drive.google.com/file/hotel-premium',
    followup_date: '2025-09-25',
    status: 'negociando',
    notes: 'Hotel executivo com 120 quartos, centro de eventos, spa e restaurante gourmet. Ajustando cronograma para entrega.',
    created_at: '2025-08-25T09:20:00Z',
    updated_at: '2025-09-20T14:15:00Z'
  },

  // APROVADA
  {
    id: '6',
    client_name: 'João Silva Comércio Ltda',
    proposal_date: '2025-08-15',
    proposal_value: 280000,
    last_meeting: '2025-09-08',
    proposal_link: 'https://drive.google.com/file/reforma-comercial',
    followup_date: '2025-09-25',
    status: 'aprovada',
    notes: 'Reforma completa de loja comercial com novo layout e sistema elétrico. Projeto aprovado, aguardando assinatura do contrato.',
    created_at: '2025-08-15T10:30:00Z',
    updated_at: '2025-09-10T12:20:00Z'
  },
  {
    id: '7',
    client_name: 'Fitness Total Academias',
    proposal_date: '2025-08-10',
    proposal_value: 720000,
    last_meeting: '2025-09-02',
    proposal_link: 'https://drive.google.com/file/academia-fitness',
    followup_date: '2025-09-20',
    status: 'aprovada',
    notes: 'Academia completa com musculação, cardio, piscina e salas de aula. Projeto aprovado pela diretoria.',
    created_at: '2025-08-10T15:45:00Z',
    updated_at: '2025-09-05T11:30:00Z'
  },
  {
    id: '8',
    client_name: 'Animal Care Clínica Veterinária',
    proposal_date: '2025-08-05',
    proposal_value: 380000,
    last_meeting: '2025-08-30',
    proposal_link: 'https://drive.google.com/file/clinica-vet',
    followup_date: '2025-09-15',
    status: 'aprovada',
    notes: 'Clínica veterinária com consultórios, cirurgia, internação e pet shop. Cliente muito satisfeito com a proposta.',
    created_at: '2025-08-05T12:10:00Z',
    updated_at: '2025-09-01T16:45:00Z'
  },
  {
    id: '9',
    client_name: 'LabMed Diagnósticos',
    proposal_date: '2025-07-28',
    proposal_value: 950000,
    last_meeting: '2025-08-20',
    proposal_link: 'https://drive.google.com/file/laboratorio',
    followup_date: '2025-09-10',
    status: 'aprovada',
    notes: 'Laboratório de análises clínicas com equipamentos de última geração e sala limpa. Aprovado sem alterações.',
    created_at: '2025-07-28T08:25:00Z',
    updated_at: '2025-08-25T14:20:00Z'
  },

  // REJEITADA
  {
    id: '10',
    client_name: 'Construtora Lar Feliz',
    proposal_date: '2025-07-20',
    proposal_value: 1800000,
    last_meeting: '2025-08-10',
    proposal_link: 'https://drive.google.com/file/conjunto-habitacional',
    followup_date: null,
    status: 'rejeitada',
    notes: 'Conjunto habitacional com 50 casas populares e infraestrutura completa. Cliente optou por outra empresa com valor menor.',
    created_at: '2025-07-20T14:15:00Z',
    updated_at: '2025-08-15T09:30:00Z'
  },
  {
    id: '11',
    client_name: 'LogiMax Logística',
    proposal_date: '2025-07-15',
    proposal_value: 2200000,
    last_meeting: '2025-08-05',
    proposal_link: 'https://drive.google.com/file/centro-distribuicao',
    followup_date: null,
    status: 'rejeitada',
    notes: 'Centro de distribuição automatizado com sistema de esteiras e armazenagem vertical. Proposta considerada cara pelo cliente.',
    created_at: '2025-07-15T16:40:00Z',
    updated_at: '2025-08-10T13:15:00Z'
  }
];

// Mock Achievements Data
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primeira Tarefa',
    description: 'Complete sua primeira tarefa',
    icon: 'CheckSquare',
    points: 10,
    unlocked: true,
    unlockedAt: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Produtivo',
    description: 'Complete 10 tarefas',
    icon: 'Target',
    points: 50,
    unlocked: true,
    unlockedAt: '2025-01-20T16:45:00Z'
  },
  {
    id: '3',
    title: 'Dedicado',
    description: 'Complete 25 tarefas',
    icon: 'Award',
    points: 100,
    unlocked: false
  },
  {
    id: '4',
    title: 'Expert',
    description: 'Complete 50 tarefas',
    icon: 'Star',
    points: 200,
    unlocked: false
  },
  {
    id: '5',
    title: 'Mestre',
    description: 'Complete 100 tarefas',
    icon: 'Crown',
    points: 500,
    unlocked: false
  }
];