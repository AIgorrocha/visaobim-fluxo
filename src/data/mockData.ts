import { Project, Task, Proposal, Achievement } from '@/types';
import { addDays, subDays, addWeeks, format } from 'date-fns';

// Mock Projects Data
export const mockProjects: Project[] = [
  // Private Projects
  {
    id: '1',
    name: 'PABLO - CASA ALTO PADRÃO',
    client: 'Pablo',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto residencial de alto padrão',
    responsible_id: '2', // Gustavo
    contract_start: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 120), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 55), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
    project_value: 85000,
    amount_paid: 45000,
    payment_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 65).toISOString(),
    updated_at: subDays(new Date(), 10).toISOString()
  },
  {
    id: '2',
    name: 'BRENO - CASA ALTO PADRÃO',
    client: 'Breno',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Residência contemporânea de alto padrão',
    responsible_id: '4', // Leonardo
    contract_start: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 135), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 105), 'yyyy-MM-dd'),
    project_value: 92000,
    amount_paid: 55000,
    payment_date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 50).toISOString(),
    updated_at: subDays(new Date(), 5).toISOString()
  },
  {
    id: '3',
    name: 'FENIX MOVEIS - COWORKING',
    client: 'Fenix Móveis',
    type: 'privado',
    status: 'EM_ESPERA',
    phase: 'ESTUDO_PRELIMINAR',
    description: 'Espaço coworking corporativo',
    responsible_id: '7', // Nicolas
    contract_start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 150), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 120), 'yyyy-MM-dd'),
    project_value: 65000,
    amount_paid: 13000,
    payment_date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 35).toISOString(),
    updated_at: subDays(new Date(), 15).toISOString()
  },
  {
    id: '4',
    name: 'CARVALHO - PORTAL DA ALEGRIA',
    client: 'Carvalho',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto Portal da Alegria',
    responsible_id: '3', // Bessa
    contract_start: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 140), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 110), 'yyyy-MM-dd'),
    project_value: 78000,
    amount_paid: 25000,
    payment_date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 45).toISOString(),
    updated_at: subDays(new Date(), 8).toISOString()
  },
  {
    id: '5',
    name: 'THALES - LAIS E SAROM',
    client: 'Thales (Lais e Sarom)',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Projeto residencial Lais e Sarom',
    responsible_id: '5', // Pedro
    contract_start: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 125), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 95), 'yyyy-MM-dd'),
    project_value: 72000,
    amount_paid: 36000,
    payment_date: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 40).toISOString(),
    updated_at: subDays(new Date(), 3).toISOString()
  },
  {
    id: '6',
    name: 'THALES - GILVANDO E ROSANETE',
    client: 'Thales (Gilvando e Rosanete)',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto residencial Gilvando e Rosanete',
    responsible_id: '6', // Thiago
    contract_start: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 155), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 125), 'yyyy-MM-dd'),
    project_value: 68000,
    amount_paid: 20000,
    payment_date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString()
  },
  {
    id: '7',
    name: 'THALES - CLEBER E IGOR',
    client: 'Thales (Cleber e Igor)',
    type: 'privado',
    status: 'EM_ESPERA',
    phase: 'ESTUDO_PRELIMINAR',
    description: 'Projeto residencial Cleber e Igor',
    responsible_id: '8', // Eloisy
    contract_start: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 165), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 135), 'yyyy-MM-dd'),
    project_value: 75000,
    amount_paid: 15000,
    payment_date: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 20).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString()
  },
  {
    id: '8',
    name: 'ZOOBOTÂNICO - PARQUE ABERTO',
    client: 'Zoobotânico',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Projeto de Parque Aberto',
    responsible_id: '9', // Rondinelly
    contract_start: format(subDays(new Date(), 80), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 100), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 75), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 70), 'yyyy-MM-dd'),
    project_value: 320000,
    amount_paid: 160000,
    payment_date: format(subDays(new Date(), 35), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 85).toISOString(),
    updated_at: subDays(new Date(), 12).toISOString()
  },
  {
    id: '9',
    name: 'NORBERTO - SALAS COMERCIAIS',
    client: 'Norberto',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto de salas comerciais',
    responsible_id: '10', // Edilson
    contract_start: format(subDays(new Date(), 50), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 130), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 100), 'yyyy-MM-dd'),
    project_value: 95000,
    amount_paid: 47000,
    payment_date: format(subDays(new Date(), 18), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 55).toISOString(),
    updated_at: subDays(new Date(), 6).toISOString()
  },
  // Public Projects
  {
    id: '10',
    name: 'FHEMIG - GASES MEDICINAIS',
    client: 'Fundação Hospitalar de Minas Gerais',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Sistema de gases medicinais para hospital público',
    responsible_id: '9', // Rondinelly
    contract_start: format(subDays(new Date(), 70), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 300), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 65), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 270), 'yyyy-MM-dd'),
    project_value: 450000,
    amount_paid: 180000,
    payment_date: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 75).toISOString(),
    updated_at: subDays(new Date(), 8).toISOString()
  },
  {
    id: '11',
    name: 'SPF-RO',
    client: 'Secretaria de Patrimônio da União - Rondônia',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Reforma e adequação de edifício público',
    responsible_id: '10', // Edilson
    contract_start: format(subDays(new Date(), 55), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 200), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 50), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
    project_value: 280000,
    amount_paid: 84000,
    payment_date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 60).toISOString(),
    updated_at: subDays(new Date(), 18).toISOString()
  },
  {
    id: '12',
    name: 'SPRF-AL',
    client: 'Superintendência da Polícia Rodoviária Federal - Alagoas',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Projeto de adequações na SPRF-AL',
    responsible_id: '11', // Stael
    contract_start: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 210), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 85), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
    project_value: 380000,
    amount_paid: 190000,
    payment_date: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 95).toISOString(),
    updated_at: subDays(new Date(), 14).toISOString()
  },
  {
    id: '13',
    name: 'TRE-AC',
    client: 'Tribunal Regional Eleitoral do Acre',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto de adequações no TRE-AC',
    responsible_id: '12', // Philip
    contract_start: format(subDays(new Date(), 100), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 250), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 95), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 220), 'yyyy-MM-dd'),
    project_value: 520000,
    amount_paid: 104000,
    payment_date: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 105).toISOString(),
    updated_at: subDays(new Date(), 20).toISOString()
  },
  {
    id: '14',
    name: 'CELESC-RS',
    client: 'Centrais Elétricas de Santa Catarina - Rio Grande do Sul',
    type: 'publico',
    status: 'EM_ESPERA',
    phase: 'ESTUDO_PRELIMINAR',
    description: 'Projeto de instalações elétricas CELESC-RS',
    responsible_id: '13', // Nara
    contract_start: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 280), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 250), 'yyyy-MM-dd'),
    project_value: 640000,
    amount_paid: 128000,
    payment_date: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 25).toISOString(),
    updated_at: subDays(new Date(), 4).toISOString()
  },
  {
    id: '15',
    name: 'SOP-RS',
    client: 'Secretaria de Obras Públicas - Rio Grande do Sul',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Projeto de obras públicas SOP-RS',
    responsible_id: '2', // Gustavo
    contract_start: format(subDays(new Date(), 110), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 190), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 105), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 160), 'yyyy-MM-dd'),
    project_value: 720000,
    amount_paid: 360000,
    payment_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 115).toISOString(),
    updated_at: subDays(new Date(), 16).toISOString()
  },
  {
    id: '16',
    name: 'DRF-PV',
    client: 'Delegacia da Receita Federal - Porto Velho',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto de adequações DRF-PV',
    responsible_id: '4', // Leonardo
    contract_start: format(subDays(new Date(), 65), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 235), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 205), 'yyyy-MM-dd'),
    project_value: 420000,
    amount_paid: 126000,
    payment_date: format(subDays(new Date(), 22), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 70).toISOString(),
    updated_at: subDays(new Date(), 11).toISOString()
  },
  {
    id: '17',
    name: 'PREFEITURA SANTA MARIA - RS',
    client: 'Prefeitura Municipal de Santa Maria - Rio Grande do Sul',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Projeto municipal Santa Maria-RS',
    responsible_id: '3', // Bessa
    contract_start: format(subDays(new Date(), 85), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 215), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 80), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 185), 'yyyy-MM-dd'),
    project_value: 680000,
    amount_paid: 272000,
    payment_date: format(subDays(new Date(), 28), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 90).toISOString(),
    updated_at: subDays(new Date(), 13).toISOString()
  },
  {
    id: '18',
    name: 'UNESPAR-RS',
    client: 'Universidade Estadual do Paraná - Rio Grande do Sul',
    type: 'publico',
    status: 'EM_ESPERA',
    phase: 'ESTUDO_PRELIMINAR',
    description: 'Projeto universitário UNESPAR-RS',
    responsible_id: '14', // Projetista Externo
    contract_start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 270), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 25), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 240), 'yyyy-MM-dd'),
    project_value: 580000,
    amount_paid: 58000,
    payment_date: format(subDays(new Date(), 12), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 35).toISOString(),
    updated_at: subDays(new Date(), 7).toISOString()
  },
  {
    id: '19',
    name: 'PREFEITURA LORENA-SP',
    client: 'Prefeitura Municipal de Lorena - São Paulo',
    type: 'publico',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto municipal Lorena-SP',
    responsible_id: '5', // Pedro
    contract_start: format(subDays(new Date(), 75), 'yyyy-MM-dd'),
    contract_end: format(addDays(new Date(), 225), 'yyyy-MM-dd'),
    activity_start: format(subDays(new Date(), 70), 'yyyy-MM-dd'),
    delivery_deadline: format(addDays(new Date(), 195), 'yyyy-MM-dd'),
    project_value: 480000,
    amount_paid: 144000,
    payment_date: format(subDays(new Date(), 18), 'yyyy-MM-dd'),
    created_by: '1',
    created_at: subDays(new Date(), 80).toISOString(),
    updated_at: subDays(new Date(), 9).toISOString()
  }
];

// Mock Tasks Data
export const mockTasks: Task[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Levantamento arquitetônico',
    description: 'Realizar medições e levantamento do terreno',
    assigned_to: '2', // Gustavo
    status: 'concluida',
    priority: 'alta',
    points: 20,
    due_date: addDays(new Date(), -5).toISOString(),
    completed_at: addDays(new Date(), -3).toISOString(),
    created_at: addDays(new Date(), -10).toISOString()
  },
  {
    id: '2',
    project_id: '1',
    title: 'Desenvolvimento da planta baixa',
    description: 'Criação da planta baixa com layout dos ambientes',
    assigned_to: '2', // Gustavo
    status: 'em_progresso',
    priority: 'alta',
    points: 25,
    due_date: addDays(new Date(), 7).toISOString(),
    created_at: addDays(new Date(), -5).toISOString()
  },
  {
    id: '3',
    project_id: '2',
    title: 'Detalhamento estrutural',
    description: 'Elaborar detalhes da estrutura metálica',
    assigned_to: '4', // Leonardo
    status: 'pendente',
    priority: 'media',
    points: 15,
    due_date: addDays(new Date(), 12).toISOString(),
    created_at: addDays(new Date(), -2).toISOString()
  },
  {
    id: '4',
    project_id: '4',
    title: 'Projeto hidráulico',
    description: 'Desenvolvimento do sistema hidráulico hospitalar',
    assigned_to: '9', // Rondinelly
    status: 'em_progresso',
    priority: 'alta',
    points: 30,
    due_date: addDays(new Date(), 14).toISOString(),
    created_at: addDays(new Date(), -7).toISOString()
  },
  {
    id: '5',
    project_id: '3',
    title: 'Estudo de viabilidade',
    description: 'Análise de viabilidade técnica e econômica',
    assigned_to: '7', // Nicolas
    status: 'pendente',
    priority: 'baixa',
    points: 10,
    due_date: addDays(new Date(), 20).toISOString(),
    created_at: addDays(new Date(), -1).toISOString()
  }
];

// Mock Proposals Data (Admin only)
export const mockProposals: Proposal[] = [
  {
    id: '1',
    client_name: 'Maria Santos Arquitetura',
    proposal_date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
    proposal_value: 125000,
    last_meeting: format(subDays(new Date(), 8), 'yyyy-MM-dd'),
    proposal_link: 'https://drive.google.com/proposal-maria-santos',
    followup_date: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
    status: 'negociando',
    notes: 'Cliente interessado, aguardando ajustes no cronograma',
    created_at: subDays(new Date(), 12).toISOString(),
    updated_at: subDays(new Date(), 3).toISOString()
  },
  {
    id: '2',
    client_name: 'Construtora Horizonte',
    proposal_date: format(subDays(new Date(), 20), 'yyyy-MM-dd'),
    proposal_value: 350000,
    last_meeting: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
    proposal_link: 'https://drive.google.com/proposal-horizonte',
    followup_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    status: 'pendente',
    notes: 'Primeira proposta enviada, aguardando retorno',
    created_at: subDays(new Date(), 25).toISOString(),
    updated_at: subDays(new Date(), 13).toISOString()
  },
  {
    id: '3',
    client_name: 'Shopping Center ABC',
    proposal_date: format(subDays(new Date(), 45), 'yyyy-MM-dd'),
    proposal_value: 890000,
    last_meeting: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    proposal_link: 'https://drive.google.com/proposal-shopping-abc',
    status: 'aprovada',
    notes: 'Proposta aprovada! Início previsto para maio',
    created_at: subDays(new Date(), 50).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    client_name: 'Residencial Palmeiras',
    proposal_date: format(subDays(new Date(), 60), 'yyyy-MM-dd'),
    proposal_value: 180000,
    last_meeting: format(subDays(new Date(), 40), 'yyyy-MM-dd'),
    status: 'rejeitada',
    notes: 'Cliente optou por outra empresa devido ao prazo',
    created_at: subDays(new Date(), 65).toISOString(),
    updated_at: subDays(new Date(), 35).toISOString()
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
  return mockProjects.filter(project => project.responsible_id === userId);
};

export const getTasksByUser = (userId: string) => {
  return mockTasks.filter(task => task.assigned_to === userId);
};

export const getAchievementsByUser = (userId: string) => {
  return mockAchievements.filter(achievement => achievement.user_id === userId);
};