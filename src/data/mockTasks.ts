import { Task } from '@/types';

// Mock Tasks Data - COMPLETO E ATUALIZADO
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
    start_date: '2025-09-15',
    due_date: '2025-09-24',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-04',
    due_date: '2025-10-03',
    completed_at: null,
    restrictions: '',
    comments: 'VERIFICAR COM EDILSON MODELO FEDERADO ANTES DA APRESENTAÇÃO NO DALUX.',
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
    start_date: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: 'ARQUITETURA',
    comments: 'AGUARDANDO LUMINOTÉCNICO',
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
    start_date: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: '2025-07-30',
    restrictions: 'ARQUITETURA',
    comments: 'AGUARDANDO LUMINOTÉCNICO',
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
    start_date: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: '2025-08-10',
    restrictions: '',
    comments: '',
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
    start_date: '2025-07-15',
    due_date: '2025-08-15',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: 'CONSTRUÇÃO VIRTUAL,ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comments: '',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: 'CONSTRUÇÃO VIRTUAL, ARQUITETURA, METALICA, CONCRETO, HIDROSSANITARIO, CLIMATIZACAO',
    comments: '',
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
    start_date: '2025-09-04',
    due_date: '2025-10-03',
    completed_at: null,
    restrictions: '',
    comments: 'VERIFICAR COM EDILSON MODELO FEDERADO ANTES DA APRESENTAÇÃO NO DALUX.',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: 'ARQUITETURA',
    comments: 'APROVACAO DO LAYOUT ARQUITETONICO PELO DIRETOR DO CARVALHO.',
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
    start_date: '2025-09-17',
    due_date: '2025-09-29',
    completed_at: null,
    restrictions: '',
    comments: 'USAR ESTRUTURA E INSTRUCOES NO CHAT DO CLAUDE, FORNECIDO O LINK.',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: 'CONSTRUCAO VIRTUAL',
    comments: 'MESMO RELATORIO LAIS E SAROM',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: 'CONSTRUCAO VIRTUAL',
    comments: 'MESMO RELATORIO LAIS E SAROM',
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
    start_date: '2025-07-15',
    due_date: '2025-09-15',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-07-15',
    due_date: '2025-09-15',
    completed_at: null,
    restrictions: '',
    comments: 'AGUARDANDO RESPOSTA FABIO E CAMPELO NETO SOBRE REUNIAO BOMBEIROS.',
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
    phase: 'ESTUDO PRELIMINAR',
    priority: 'alta',
    points: 0,
    start_date: '2025-09-15', // CORRIGIDO - ADICIONADA DATA INÍCIO
    due_date: '2025-11-15', // CORRIGIDO - PRAZO DE 15/09/2025 PARA 15/11/2025
    completed_at: null,
    restrictions: '',
    comments: '',
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
    phase: 'PROJETO BASICO',
    priority: 'alta',
    points: 10,
    start_date: '2025-05-30',
    due_date: '2025-09-30',
    completed_at: '2025-09-18',
    restrictions: '',
    comments: 'AGENDAMENTO DE REUNIAO E PRAZOS PARA PROJETO EXECUTIVO (ETAPA 2)',
    created_at: '2025-05-25T08:00:00Z'
  },
  {
    id: '19',
    project_id: '10',
    title: 'ETAPA 2',
    description: 'Etapa 2 - Projeto executivo',
    assigned_to: '14', // PROJETISTA EXTERNO
    status: 'CONCLUIDA',
    phase: 'PROJETO BASICO',
    priority: 'alta',
    points: 10,
    start_date: '2025-09-19',
    due_date: null,
    completed_at: '2025-09-22',
    restrictions: '',
    comments: '',
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
    phase: 'PROJETO BASICO',
    priority: 'alta',
    points: 0,
    start_date: '2025-09-19',
    due_date: '2025-09-26',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-10',
    due_date: '2025-09-19',
    completed_at: '2025-09-22',
    restrictions: '',
    comments: 'AGUARDANDO FISCAL APROVAR ORCAMENTO NO ORCAFASCIO PRA EXPORTAR OS ENTREGAVEIS',
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
    start_date: null,
    due_date: null,
    completed_at: '2025-09-20',
    restrictions: '',
    comments: 'AGUARDANDO PROJETOS, RECOMENDAVEL MONTAR EAP E IR ALINHANDO COM ARQUITETURA OQ JA TEM', // COMENTÁRIO ATUALIZADO
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
    start_date: null,
    due_date: '2025-11-02', // CORRIGIDO - ERA 02/11/2025
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: '2025-09-28',
    completed_at: null,
    restrictions: '',
    comments: 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA',
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
    start_date: null,
    due_date: '2025-11-02', // CORRIGIDO - ERA 28/09, AGORA É 02/11/2025
    completed_at: null,
    restrictions: '',
    comments: 'NECESSARIO PRA INICIAR DISCIPLINAS DE ENGENHARIA',
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
    start_date: null,
    due_date: '2025-11-02',
    completed_at: null,
    restrictions: 'ESTRUTURA',
    comments: 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.',
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
    start_date: null,
    due_date: '2025-11-02',
    completed_at: null,
    restrictions: 'ESTRUTURA',
    comments: 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.',
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
    start_date: null,
    due_date: '2025-11-02',
    completed_at: null,
    restrictions: 'ESTRUTURA',
    comments: 'DEFINIR COTA DE TUBULACOES COM DEMAIS INSTALACOES E EDILSON.',
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
    start_date: null,
    due_date: '2025-11-02',
    completed_at: null,
    restrictions: 'ESTRUTURA',
    comments: '',
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
    start_date: null,
    due_date: '2025-12-09',
    completed_at: null,
    restrictions: 'ESTRUTURA',
    comments: '',
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
    start_date: '2025-09-12',
    due_date: '2025-09-26',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-09-12',
    due_date: '2025-10-05',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: '2025-10-10',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: '2025-10-17',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: null,
    restrictions: '',
    comments: '',
    created_at: '2025-08-25T08:00:00Z'
  },
  {
    id: '40',
    project_id: '16',
    title: 'LAYOUT ARQUITETONICO',
    description: 'Layout arquitetônico',
    assigned_to: ['4', '3'], // LEONARDO, BESSA
    status: 'CONCLUIDA',
    phase: 'ESTUDO PRELIMINAR',
    priority: 'alta',
    points: 10,
    start_date: '2025-04-30',
    due_date: '2025-05-30',
    completed_at: '2025-08-01',
    restrictions: '',
    comments: 'NO DIA 07 DE AGOSTO, PERGUNTEI SOBRE APROVACAO DOS PROJETOS PRIMEIRA ETAPA, DIA 19 AGOSTO FOI QUESTIONADO SOBRE AS PONTUACOES DA FACHADA, DIA 12 DE SETEMBRO FORAM ENVIADOS DIVERSOS PROJETOS DE ENGENHARIA, RETONARAM ATE DIA DE HOJE 22.09 APENAS OS APONTAMENTOS DO SPDA E ELETRICO.',
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
    start_date: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: '2025-09-12',
    restrictions: '',
    comments: 'AGUARDANDO APONTAMENTOS DA FISCALIZACAO',
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
    start_date: '2025-08-30',
    due_date: '2025-10-19',
    completed_at: '2025-09-19',
    restrictions: '',
    comments: 'AJUSTES REALIZADOS PELO THIAGO E VAMOS ABORDAR NA REUNIAO',
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
    start_date: null,
    due_date: '2025-10-19',
    completed_at: '2025-09-19',
    restrictions: '',
    comments: 'AJUSTAR URGENTE COM THIAGO PRA INICIAR PROJETOS FOTOVOLTAICOS, GERADOR E SUBESTACAO, ALINHAR PRA INICIO', // COMENTÁRIO ATUALIZADO
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
    start_date: null,
    due_date: '2025-10-19',
    completed_at: '2025-09-12',
    restrictions: '',
    comments: 'AGUARDANDO RESPOSTA FISCALIZACAO.',
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
    start_date: null,
    due_date: '2025-10-19',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: '2025-10-19',
    completed_at: null,
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: '2025-10-30',
    completed_at: null,
    restrictions: '',
    comments: 'NECESSARIO IR MONTANDO EAP PRA APRESENTAR PRO ORGAO, E COMO VAMOS FAZER A ASSOCIACAO, JA POSSO ADQURIR O ORCABIM (QND INICIAR)', // COMENTÁRIO ATUALIZADO
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
    start_date: null,
    due_date: null,
    completed_at: '2025-07-31',
    restrictions: '',
    comments: 'AGUARDANDO FISCALIZACAO ENVIAR ANALISE.',
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
    start_date: null,
    due_date: null,
    completed_at: '2025-09-15',
    restrictions: '',
    comments: 'AGUARDANDO ANALISE CORPO DE BOMBEIROS',
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
    start_date: null,
    due_date: null,
    completed_at: '2025-09-08',
    restrictions: '',
    comments: '',
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
    start_date: null,
    due_date: null,
    completed_at: null,
    restrictions: '',
    comments: 'COMECO DE OUTUBRO PRA CONTRATAR EMPRESA QUE VAI EXECUTAR A OBRA',
    created_at: '2024-01-01T08:00:00Z'
  }
];