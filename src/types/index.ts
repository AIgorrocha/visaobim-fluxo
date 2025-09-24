export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  points: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: 'privado' | 'publico';
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'EM_ESPERA' | 'PARALISADO' | 'CONCLUIDO' | 'AGUARDANDO_PAGAMENTO';
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
  priority: 'baixa' | 'media' | 'alta';
  points: number;
  activity_start?: string;
  due_date?: string;
  last_delivery?: string;
  comment?: string;
  restricoes?: string; // Restrições/dependências (deprecated - usar task_restrictions)
  dependencies?: string[]; // Disciplinas necessárias para iniciar
  completed_at?: string;
  created_at: string;
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
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon?: string;
  points_earned: number;
  earned_at: string;
  unlocked?: boolean;
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
  points: number;
  level: number;
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