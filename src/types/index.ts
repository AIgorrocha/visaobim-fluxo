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
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'EM_ESPERA' | 'PARALISADO' | 'AGUARDANDO_PAGAMENTO';
  phase: 'ESTUDO_PRELIMINAR' | 'PROJETO_BASICO' | 'PROJETO_EXECUTIVO';
  description?: string;
  responsible_id: string;
  dependency_id?: string;
  contract_start: string;
  contract_end: string;
  activity_start: string;
  delivery_deadline: string;
  last_delivery?: string;
  project_value: number;
  amount_paid: number;
  payment_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  status: 'pendente' | 'em_progresso' | 'concluida';
  priority: 'baixa' | 'media' | 'alta';
  points: number;
  due_date: string;
  completed_at?: string;
  created_at: string;
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
  points_earned: number;
  earned_at: string;
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