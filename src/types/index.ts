export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: 'privado' | 'publico';
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'EM_ESPERA' | 'PARALISADO' | 'CONCLUIDO' | 'AGUARDANDO_PAGAMENTO' | 'AGUARDANDO_APROVACAO';
  art_emitida?: boolean;
  description?: string;
  responsible_ids: string[];
  dependency_id?: string;
  contract_start: string;
  contract_end: string;
  vigencia_contrato?: string;
  prazo_vigencia?: string;
  // Campos financeiros
  project_value?: number;
  amount_paid?: number;
  amount_pending?: number;
  expenses?: number;
  profit_margin?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean; // Campo para arquivamento de projetos
}

export interface Financial {
  project_id: string;
  project_name: string;
  client: string;
  contract_value: number;
  amount_received: number;
  amount_pending: number;
  expenses: number;
  profit: number;
  responsible_payment?: { [user_id: string]: number }; // Pagamentos por responsável
  payment_history?: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  payment_date: string;
  description?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string | string[]; // Permite múltiplos responsáveis
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'PARALISADA' | 'EM_ESPERA';
  phase: 'ESTUDO_PRELIMINAR' | 'PROJETO_BASICO' | 'EXECUTIVO';
  activity_start?: string;
  due_date?: string;
  last_delivery?: string;
  comment?: string;
  restricoes?: string; // Restrições/dependências (deprecated - usar task_restrictions)
  dependencies?: string[]; // Disciplinas necessárias para iniciar
  completed_at?: string;
  created_at: string;
  is_archived?: boolean; // Campo para arquivamento de tarefas
  // Campos virtuais para restrições
  active_restrictions?: TaskRestriction[];
  can_start?: boolean;
}

export interface Proposal {
  id: string;
  client_name: string;
  proposal_date: string;
  proposal_value: number;
  last_meeting?: string;
  proposal_link?: string;
  followup_date?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'negociando';
  notes?: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean; // Campo para arquivamento de propostas
}


export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

// Interface para restrições entre tarefas
export interface TaskRestriction {
  id: string;
  waiting_task_id: string;
  blocking_task_id: string;
  blocking_user_id: string;
  status: 'active' | 'resolved' | 'cancelled';
  created_at: string;
  resolved_at?: string;
  updated_at: string;
  // Campos da view detalhada
  waiting_task_title?: string;
  waiting_task_status?: string;
  waiting_task_assigned_to?: string | string[];
  blocking_task_title?: string;
  blocking_task_status?: string;
  blocking_task_assigned_to?: string | string[];
  blocking_user_name?: string;
  blocking_user_email?: string;
}

// Interface para notificações do sistema
export interface TaskNotification {
  id: string;
  user_id: string;
  task_id: string;
  type: 'task_released' | 'restriction_added' | 'task_completed';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Interface para conquistas (achievements)
export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  points_earned: number;
  earned_at: string;
}

// ========================================
// SISTEMA FINANCEIRO DE PROJETISTAS
// ========================================

// Disciplinas disponíveis para projetos
export interface Discipline {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  created_at: string;
}

// Precificação de projeto por disciplina
export interface ProjectPricing {
  id: string;
  project_id: string;
  discipline_id?: string;
  discipline_name: string;
  total_value: number;
  designer_percentage: number;
  designer_value: number; // Valor calculado: total_value * designer_percentage / 100
  designer_id?: string;
  amount_paid: number;
  notes?: string;
  status: 'pendente' | 'parcial' | 'pago';
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Campos virtuais para joins
  designer_name?: string;
  project_name?: string;
}

// Pagamento realizado para projetista
export interface DesignerPayment {
  id: string;
  project_id?: string;
  project_name?: string;
  pricing_id?: string;
  designer_id: string;
  discipline: string;
  amount: number;
  payment_date: string;
  description?: string;
  sector: 'privado' | 'publico';
  invoice_number?: string;
  contract_reference?: string;
  status: 'pendente' | 'pago' | 'cancelado';
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Campos virtuais para joins
  designer_name?: string;
}

// Resumo financeiro do projetista (view)
export interface DesignerFinancialSummary {
  designer_id: string;
  designer_name: string;
  designer_email: string;
  total_payments: number;
  total_received: number;
  total_pending: number;
  projects_count: number;
  last_payment_date?: string;
}

// Valores a receber do projetista (view)
export interface DesignerReceivable {
  designer_id: string;
  designer_name: string;
  project_id: string;
  project_name: string;
  discipline_name: string;
  total_value: number;
  designer_percentage: number;
  designer_value: number;
  amount_paid: number;
  amount_pending: number;
  status: string;
}

// Estatísticas do dashboard financeiro
export interface FinancialDashboardStats {
  totalReceived: number;
  totalPending: number;
  totalPayments: number;
  projectsCount: number;
  lastPaymentDate?: string;
  paymentsByMonth: { month: string; amount: number }[];
  paymentsByProject: { project_name: string; amount: number }[];
  paymentsByDiscipline: { discipline: string; amount: number }[];
}