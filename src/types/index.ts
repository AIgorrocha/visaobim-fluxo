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
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'EM_ESPERA' | 'PARALISADO' | 'CONCLUIDO';
  description?: string;
  responsible_ids: string[];
  dependency_id?: string;
  contract_start: string;
  contract_end: string;
  vigencia_contrato?: string;
  prazo_vigencia?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
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
  restricoes?: string; // Restrições/dependências
  dependencies?: string[]; // Disciplinas necessárias para iniciar
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