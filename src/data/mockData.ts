import { Project, Task, Proposal, Achievement } from '@/types';
import { addDays, subDays, addWeeks } from 'date-fns';

// Mock Projects Data
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
    created_at: '2024-01-01T09:30:00Z',
    updated_at: '2024-01-01T15:45:00Z'
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
    created_at: '2025-07-10T11:00:00Z',
    updated_at: '2025-07-15T13:30:00Z'
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
    created_at: '2025-09-10T14:00:00Z',
    updated_at: '2025-09-17T10:15:00Z'
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
    created_at: '2025-05-25T08:30:00Z',
    updated_at: '2025-05-30T09:15:00Z'
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
    created_at: '2025-01-25T10:00:00Z',
    updated_at: '2025-01-30T11:30:00Z'
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
    created_at: '2025-08-01T09:00:00Z',
    updated_at: '2025-08-04T14:30:00Z'
  },
  // PROJETO 13: LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR - TRE/AC
  {
    id: '13',
    name: 'LOTE 02 CENTRO DE ATENDIMENTO AO ELEITOR',
    client: 'TRE/AC',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    description: 'PROJETO DE REFORMA DA NOVA SEDE DE ATENDIMENTO AO ELEITOR',
    responsible_ids: ['4', '2', '10'], // LEONARDO, GUSTAVO, EDILSON
    contract_start: '2025-06-23',
    contract_end: '2025-09-23',
    prazo_vigencia: '',
    created_by: '1',
    created_at: '2025-06-20T08:00:00Z',
    updated_at: '2025-06-23T12:00:00Z'
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
    created_at: '2025-07-05T10:30:00Z',
    updated_at: '2025-07-09T16:20:00Z'
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
    created_at: '2025-07-20T11:00:00Z',
    updated_at: '2025-07-24T09:45:00Z'
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
    created_at: '2025-03-25T13:30:00Z',
    updated_at: '2025-03-31T15:00:00Z'
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
    created_at: '2025-03-10T08:15:00Z',
    updated_at: '2025-03-15T12:30:00Z'
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
    created_at: '2025-01-01T09:45:00Z',
    updated_at: '2025-01-06T14:15:00Z'
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
    created_at: '2024-01-01T10:20:00Z',
    updated_at: '2024-01-01T16:40:00Z'
  }
];

// Mock Tasks Data
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
    last_delivery: '',
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
    due_date: '2025-10-03',
    last_delivery: '',
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
    last_delivery: '',
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
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '',
    due_date: '',
    last_delivery: '',
    restricoes: 'ARQUITETURA',
    comment: 'AGUARDANDO LUMINOTÉCNICO',
    created_at: '2025-07-10T09:00:00Z'
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
    points: 4,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    last_delivery: '2025-07-30',
    restricoes: 'ARQUITETURA',
    comment: 'AGUARDANDO LUMINOTÉCNICO',
    completed_at: '2025-07-30T18:00:00Z',
    created_at: '2025-07-10T10:00:00Z'
  },
  {
    id: '6',
    project_id: '2',
    title: 'PROJETO CLIMATIZAÇÃO',
    description: 'Sistema de climatização',
    assigned_to: '9', // RONDINELLY
    status: 'CONCLUIDA',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 3,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    last_delivery: '',
    restricoes: '',
    comment: '',
    completed_at: '2025-08-10T16:00:00Z',
    created_at: '2025-07-10T11:00:00Z'
  },
  {
    id: '7',
    project_id: '2',
    title: 'CONSTRUÇÃO VIRTUAL ARQUITETURA',
    description: 'Modelagem virtual da arquitetura',
    assigned_to: '4', // LEONARDO
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-08-15',
    last_delivery: '',
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T12:00:00Z'
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
    activity_start: '',
    due_date: '',
    last_delivery: '',
    restricoes: 'CONSTRUÇÃO VIRTUAL,ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comment: '',
    created_at: '2025-07-10T13:00:00Z'
  },
  {
    id: '9',
    project_id: '2',
    title: 'ORCAMENTO EXECUTIVO',
    description: 'Orçamento executivo do projeto',
    assigned_to: '10', // EDILSON
    status: 'PENDENTE',
    phase: 'EXECUTIVO',
    priority: 'alta',
    points: 0,
    activity_start: '',
    due_date: '',
    last_delivery: '',
    restricoes: 'CONSTRUÇÃO VIRTUAL, ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comment: '',
    created_at: '2025-07-10T14:00:00Z'
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
    last_delivery: '',
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
    activity_start: '',
    due_date: '',
    last_delivery: '',
    restricoes: 'ARQUITETURA',
    comment: 'APROVACAO DO LAYOUT ARQUITETONICO PELO DIRETOR DO CARVALHO.',
    created_at: '2025-07-20T08:00:00Z'
  },

  // PROJETO 5: LAIS E SAROM - THALES
  {
    id: '12',
    project_id: '5',
    title: 'RELATORIO DE QUANTITATIVOS',
    description: 'Relatório de quantitativos para casa de alto padrão',
    assigned_to: '10', // EDILSON
    status: 'EM_ANDAMENTO',
    phase: 'EXECUTIVO',
    priority: 'media',
    points: 0,
    activity_start: '2025-09-17',
    due_date: '2025-09-29',
    last_delivery: '',
    restricoes: '',
    comment: 'USAR ESTRUTURA E INSTRUCOES NO CHAT DO CLAUDE, FORNECIDO O LINK.',
    created_at: '2025-09-15T10:00:00Z'
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
    activity_start: '',
    due_date: '',
    last_delivery: '',
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
    activity_start: '',
    due_date: '',
    last_delivery: '',
    restricoes: 'CONSTRUCAO VIRTUAL',
    comment: 'MESMO RELATORIO LAIS E SAROM',
    created_at: '2024-01-01T09:00:00Z'
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
    last_delivery: '',
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
    last_delivery: '',
    restricoes: '',
    comment: 'AGUARDANDO RESPOSTA FABIO E CAMPELO NETO SOBRE REUNIAO BOMBEIROS.',
    created_at: '2025-07-10T08:00:00Z'
  },

  // PROJETO 9: SALAS COMERCIAIS - NORBERTO
  {
    id: '17',
    project_id: '9',
    title: 'LAYOUT ARQUITETONICO',
    description: 'Layout arquitetônico das salas comerciais',
    assigned_to: '3', // BESSA
    status: 'PENDENTE',
    phase: 'ESTUDO_PRELIMINAR',
    priority: 'media',
    points: 0,
    activity_start: '2025-07-15',
    due_date: '2025-09-15',
    last_delivery: '',
    restricoes: '',
    comment: '',
    created_at: '2025-07-10T08:00:00Z'
  },

  // PROJETO 10: GASES MEDICINAIS - FHEMIG
  {
    id: '18',
    project_id: '10',
    title: 'ETAPA 01 (AS BUILT E DEMANDA-ARQ E GASES)',
    description: 'Etapa 1: As built e demanda arquitetônica e gases',
    assigned_to: '14', // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 5,
    activity_start: '2025-05-30',
    due_date: '2025-09-30',
    last_delivery: '2025-09-18',
    restricoes: '',
    comment: 'AGENDAMENTO DE REUNIAO E PRAZOS PARA PROJETO EXECUTIVO (ETAPA 2)',
    completed_at: '2025-09-18T17:00:00Z',
    created_at: '2025-05-25T08:00:00Z'
  },
  {
    id: '19',
    project_id: '10',
    title: 'ETAPA 2',
    description: 'Etapa 2 do projeto',
    assigned_to: '14', // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO_BASICO',
    priority: 'alta',
    points: 3,
    activity_start: '2025-09-19',
    due_date: '',
    last_delivery: '',
    restricoes: '',
    comment: '',
    completed_at: '2025-09-20T16:00:00Z',
    created_at: '2025-09-18T08:00:00Z'
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
    last_delivery: '',
    restricoes: '',
    comment: '',
    created_at: '2025-09-15T08:00:00Z'
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
  return mockTasks.filter(task => {
    if (Array.isArray(task.assigned_to)) {
      return task.assigned_to.includes(userId);
    }
    return task.assigned_to === userId;
  });
};

export const getAchievementsByUser = (userId: string) => {
  return mockAchievements.filter(achievement => achievement.user_id === userId);
};