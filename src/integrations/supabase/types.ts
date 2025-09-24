export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          description: string
          earned_at: string | null
          icon: string | null
          id: string
          points_earned: number | null
          title: string
          unlocked: boolean | null
          user_id: string | null
        }
        Insert: {
          achievement_type: string
          description: string
          earned_at?: string | null
          icon?: string | null
          id?: string
          points_earned?: number | null
          title: string
          unlocked?: boolean | null
          user_id?: string | null
        }
        Update: {
          achievement_type?: string
          description?: string
          earned_at?: string | null
          icon?: string | null
          id?: string
          points_earned?: number | null
          title?: string
          unlocked?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_requests: {
        Row: {
          area_construida: string | null
          created_at: string | null
          email: string
          id: number
          nome: string
          quantidade_pavimentos: string | null
          source: string | null
          telefone: string
          tipo_cliente: string | null
          tipo_projeto: string | null
        }
        Insert: {
          area_construida?: string | null
          created_at?: string | null
          email: string
          id?: number
          nome: string
          quantidade_pavimentos?: string | null
          source?: string | null
          telefone: string
          tipo_cliente?: string | null
          tipo_projeto?: string | null
        }
        Update: {
          area_construida?: string | null
          created_at?: string | null
          email?: string
          id?: number
          nome?: string
          quantidade_pavimentos?: string | null
          source?: string | null
          telefone?: string
          tipo_cliente?: string | null
          tipo_projeto?: string | null
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          area: string | null
          city: string | null
          client_type: string | null
          created_at: string | null
          email: string
          floors: string | null
          id: number
          message: string | null
          name: string
          phone: string | null
          project_files: string[] | null
          project_type: string | null
          source: string | null
          state: string | null
        }
        Insert: {
          area?: string | null
          city?: string | null
          client_type?: string | null
          created_at?: string | null
          email: string
          floors?: string | null
          id?: number
          message?: string | null
          name: string
          phone?: string | null
          project_files?: string[] | null
          project_type?: string | null
          source?: string | null
          state?: string | null
        }
        Update: {
          area?: string | null
          city?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string
          floors?: string | null
          id?: number
          message?: string | null
          name?: string
          phone?: string | null
          project_files?: string[] | null
          project_type?: string | null
          source?: string | null
          state?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: number
          is_active: boolean | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          is_active?: boolean | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          is_active?: boolean | null
          source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          level: number | null
          points: number | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          level?: number | null
          points?: number | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          level?: number | null
          points?: number | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          amount_paid: number | null
          amount_pending: number | null
          client: string
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          created_by: string | null
          dependency_id: string | null
          description: string | null
          expenses: number | null
          id: string
          is_archived: boolean | null
          name: string
          prazo_vigencia: string | null
          profit_margin: number | null
          project_value: number | null
          responsible_ids: string[] | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          amount_pending?: number | null
          client: string
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          created_by?: string | null
          dependency_id?: string | null
          description?: string | null
          expenses?: number | null
          id?: string
          is_archived?: boolean | null
          name: string
          prazo_vigencia?: string | null
          profit_margin?: number | null
          project_value?: number | null
          responsible_ids?: string[] | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          amount_pending?: number | null
          client?: string
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          created_by?: string | null
          dependency_id?: string | null
          description?: string | null
          expenses?: number | null
          id?: string
          is_archived?: boolean | null
          name?: string
          prazo_vigencia?: string | null
          profit_margin?: number | null
          project_value?: number | null
          responsible_ids?: string[] | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client_name: string
          created_at: string | null
          created_by: string | null
          followup_date: string | null
          id: string
          is_archived: boolean | null
          last_meeting: string | null
          notes: string | null
          proposal_date: string
          proposal_link: string | null
          proposal_value: number
          status: string
          updated_at: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          created_by?: string | null
          followup_date?: string | null
          id?: string
          is_archived?: boolean | null
          last_meeting?: string | null
          notes?: string | null
          proposal_date: string
          proposal_link?: string | null
          proposal_value: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          followup_date?: string | null
          id?: string
          is_archived?: boolean | null
          last_meeting?: string | null
          notes?: string | null
          proposal_date?: string
          proposal_link?: string | null
          proposal_value?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_calculations: {
        Row: {
          area_terreo: number
          area_total: number
          created_at: string | null
          custo_total: number
          economia_conservador: number
          economia_especial: number
          economia_otimista: number
          email: string
          id: number
          nome: string
          quantidade_pavimentos: number
          source: string | null
          telefone: string
          tipo_projeto: string
        }
        Insert: {
          area_terreo: number
          area_total: number
          created_at?: string | null
          custo_total: number
          economia_conservador: number
          economia_especial: number
          economia_otimista: number
          email: string
          id?: number
          nome: string
          quantidade_pavimentos: number
          source?: string | null
          telefone: string
          tipo_projeto: string
        }
        Update: {
          area_terreo?: number
          area_total?: number
          created_at?: string | null
          custo_total?: number
          economia_conservador?: number
          economia_especial?: number
          economia_otimista?: number
          email?: string
          id?: number
          nome?: string
          quantidade_pavimentos?: number
          source?: string | null
          telefone?: string
          tipo_projeto?: string
        }
        Relationships: []
      }
      task_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          task_id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          task_id: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          task_id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_restrictions: {
        Row: {
          blocking_task_id: string
          blocking_user_id: string
          created_at: string | null
          id: string
          resolved_at: string | null
          status: string
          updated_at: string | null
          waiting_task_id: string
        }
        Insert: {
          blocking_task_id: string
          blocking_user_id: string
          created_at?: string | null
          id?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string | null
          waiting_task_id: string
        }
        Update: {
          blocking_task_id?: string
          blocking_user_id?: string
          created_at?: string | null
          id?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string | null
          waiting_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_restrictions_blocking_task_id_fkey"
            columns: ["blocking_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_restrictions_blocking_user_id_fkey"
            columns: ["blocking_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_restrictions_waiting_task_id_fkey"
            columns: ["waiting_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          activity_start: string | null
          assigned_to: string[] | null
          comment: string | null
          completed_at: string | null
          created_at: string | null
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          is_archived: boolean | null
          last_delivery: string | null
          phase: string | null
          points: number | null
          priority: string | null
          project_id: string | null
          restricoes: Json | null
          status: string
          title: string
        }
        Insert: {
          activity_start?: string | null
          assigned_to?: string[] | null
          comment?: string | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          last_delivery?: string | null
          phase?: string | null
          points?: number | null
          priority?: string | null
          project_id?: string | null
          restricoes?: Json | null
          status?: string
          title: string
        }
        Update: {
          activity_start?: string | null
          assigned_to?: string[] | null
          comment?: string | null
          completed_at?: string | null
          created_at?: string | null
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          last_delivery?: string | null
          phase?: string | null
          points?: number | null
          priority?: string | null
          project_id?: string | null
          restricoes?: Json | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      task_restrictions_detailed: {
        Row: {
          blocking_task_assigned_to: string[] | null
          blocking_task_id: string | null
          blocking_task_status: string | null
          blocking_task_title: string | null
          blocking_user_email: string | null
          blocking_user_id: string | null
          blocking_user_name: string | null
          created_at: string | null
          id: string | null
          resolved_at: string | null
          status: string | null
          updated_at: string | null
          waiting_task_assigned_to: string[] | null
          waiting_task_id: string | null
          waiting_task_status: string | null
          waiting_task_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_restrictions_blocking_task_id_fkey"
            columns: ["blocking_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_restrictions_blocking_user_id_fkey"
            columns: ["blocking_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_restrictions_waiting_task_id_fkey"
            columns: ["waiting_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      budget_request_handler: {
        Args: { payload: Json }
        Returns: Json
      }
      calculate_points_for_user: {
        Args: { target_user_id: string }
        Returns: number
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      contact_lead_handler: {
        Args: { payload: Json }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      newsletter_signup_handler: {
        Args: { payload: Json }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
