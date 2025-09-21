import { Project, Task, Proposal, Achievement } from '@/types';
import { addDays, subDays, addWeeks, format } from 'date-fns';

// Mock Projects Data
export const mockProjects: Project[] = [
  // Private Projects
  {
    id: '1',
    name: 'PABLO - CASA ALTO PADRÃO',
    client: 'Pablo Silva',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_BASICO',
    description: 'Projeto residencial de alto padrão com área de 450m²',
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
    client: 'Breno Oliveira',
    type: 'privado',
    status: 'EM_ANDAMENTO',
    phase: 'PROJETO_EXECUTIVO',
    description: 'Residência contemporânea com 380m²',
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
    client: 'Fenix Móveis Ltda',
    type: 'privado',
    status: 'EM_ESPERA',
    phase: 'ESTUDO_PRELIMINAR',
    description: 'Espaço coworking corporativo de 200m²',
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
  // Public Projects
  {
    id: '4',
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
    id: '5',
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