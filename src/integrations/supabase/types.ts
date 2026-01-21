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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
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
      designer_payments: {
        Row: {
          amount: number
          contract_reference: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          designer_id: string
          discipline: string
          id: string
          invoice_number: string | null
          payment_date: string
          pricing_id: string | null
          project_id: string | null
          project_name: string | null
          sector: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          contract_reference?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          designer_id: string
          discipline: string
          id?: string
          invoice_number?: string | null
          payment_date: string
          pricing_id?: string | null
          project_id?: string | null
          project_name?: string | null
          sector?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contract_reference?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          designer_id?: string
          discipline?: string
          id?: string
          invoice_number?: string | null
          payment_date?: string
          pricing_id?: string | null
          project_id?: string | null
          project_name?: string | null
          sector?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designer_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_payments_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_payments_pricing_id_fkey"
            columns: ["pricing_id"]
            isOneToOne: false
            referencedRelation: "project_pricing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designer_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "designer_receivables"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "designer_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          budget_limit: number | null
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_income: boolean | null
          name: string
          name_pt: string
          updated_at: string | null
        }
        Insert: {
          budget_limit?: number | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_income?: boolean | null
          name: string
          name_pt: string
          updated_at?: string | null
        }
        Update: {
          budget_limit?: number | null
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_income?: boolean | null
          name?: string
          name_pt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      finance_goals: {
        Row: {
          category: string
          color: string | null
          completed_at: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          description: string | null
          icon: string | null
          id: string
          is_completed: boolean | null
          name: string
          target_amount: number
          updated_at: string | null
        }
        Insert: {
          category: string
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          target_amount: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          target_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      finance_monthly_summaries: {
        Row: {
          ai_summary: string | null
          ai_tips: string[] | null
          balance: number | null
          by_category: Json | null
          created_at: string | null
          expense_change_percent: number | null
          id: string
          income_change_percent: number | null
          total_expenses: number | null
          total_income: number | null
          updated_at: string | null
          year_month: string
        }
        Insert: {
          ai_summary?: string | null
          ai_tips?: string[] | null
          balance?: number | null
          by_category?: Json | null
          created_at?: string | null
          expense_change_percent?: number | null
          id?: string
          income_change_percent?: number | null
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string | null
          year_month: string
        }
        Update: {
          ai_summary?: string | null
          ai_tips?: string[] | null
          balance?: number | null
          by_category?: Json | null
          created_at?: string | null
          expense_change_percent?: number | null
          id?: string
          income_change_percent?: number | null
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string | null
          year_month?: string
        }
        Relationships: []
      }
      finance_processing_logs: {
        Row: {
          agents_used: string[] | null
          completed_at: string | null
          created_at: string | null
          errors: Json | null
          id: string
          processing_time_ms: number | null
          source_id: string
          source_name: string | null
          source_type: string
          status: string | null
          transactions_created: number | null
        }
        Insert: {
          agents_used?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          id?: string
          processing_time_ms?: number | null
          source_id: string
          source_name?: string | null
          source_type: string
          status?: string | null
          transactions_created?: number | null
        }
        Update: {
          agents_used?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          id?: string
          processing_time_ms?: number | null
          source_id?: string
          source_name?: string | null
          source_type?: string
          status?: string | null
          transactions_created?: number | null
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          ai_notes: string | null
          amount: number
          bank_account: string | null
          bank_transaction_id: string | null
          category_id: string | null
          confidence_score: number | null
          created_at: string | null
          date: string
          description: string
          fingerprint: string | null
          id: string
          processed_at: string | null
          raw_text: string | null
          source: string
          source_file: string | null
          source_message_id: string | null
          subcategory: string | null
          updated_at: string | null
          user_notes: string | null
          user_verified: boolean | null
        }
        Insert: {
          ai_notes?: string | null
          amount: number
          bank_account?: string | null
          bank_transaction_id?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          date: string
          description: string
          fingerprint?: string | null
          id?: string
          processed_at?: string | null
          raw_text?: string | null
          source: string
          source_file?: string | null
          source_message_id?: string | null
          subcategory?: string | null
          updated_at?: string | null
          user_notes?: string | null
          user_verified?: boolean | null
        }
        Update: {
          ai_notes?: string | null
          amount?: number
          bank_account?: string | null
          bank_transaction_id?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          date?: string
          description?: string
          fingerprint?: string | null
          id?: string
          processed_at?: string | null
          raw_text?: string | null
          source?: string
          source_file?: string | null
          source_message_id?: string | null
          subcategory?: string | null
          updated_at?: string | null
          user_notes?: string | null
          user_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: string
          investment_id: string | null
          notes: string | null
          price_at_time: number | null
          quantity: number | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string
          id?: string
          investment_id?: string | null
          notes?: string | null
          price_at_time?: number | null
          quantity?: number | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          investment_id?: string | null
          notes?: string | null
          price_at_time?: number | null
          quantity?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_transactions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          avg_price: number | null
          color: string | null
          created_at: string | null
          current_value: number
          data_aplicacao: string | null
          data_updated_at: string | null
          id: string
          institution: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          quantity: number | null
          rentabilidade: string | null
          symbol: string | null
          type: string
          updated_at: string | null
          vencimento: string | null
        }
        Insert: {
          avg_price?: number | null
          color?: string | null
          created_at?: string | null
          current_value?: number
          data_aplicacao?: string | null
          data_updated_at?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          quantity?: number | null
          rentabilidade?: string | null
          symbol?: string | null
          type: string
          updated_at?: string | null
          vencimento?: string | null
        }
        Update: {
          avg_price?: number | null
          color?: string | null
          created_at?: string | null
          current_value?: number
          data_aplicacao?: string | null
          data_updated_at?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          quantity?: number | null
          rentabilidade?: string | null
          symbol?: string | null
          type?: string
          updated_at?: string | null
          vencimento?: string | null
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
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_pricing: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          created_by: string | null
          designer_id: string | null
          designer_percentage: number
          designer_value: number | null
          discipline_id: string | null
          discipline_name: string
          id: string
          notes: string | null
          project_id: string
          status: string | null
          total_value: number
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          designer_id?: string | null
          designer_percentage?: number
          designer_value?: number | null
          discipline_id?: string | null
          discipline_name: string
          id?: string
          notes?: string | null
          project_id: string
          status?: string | null
          total_value?: number
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          designer_id?: string | null
          designer_percentage?: number
          designer_value?: number | null
          discipline_id?: string | null
          discipline_name?: string
          id?: string
          notes?: string | null
          project_id?: string
          status?: string | null
          total_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_pricing_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_pricing_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_pricing_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_pricing_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "designer_receivables"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_pricing_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amount_paid: number | null
          amount_pending: number | null
          art_emitida: boolean | null
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
          art_emitida?: boolean | null
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
          art_emitida?: boolean | null
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
      proposal_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          project_type: string | null
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          project_type?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          project_type?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
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
            referencedRelation: "designer_receivables"
            referencedColumns: ["project_id"]
          },
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
      designer_financial_summary: {
        Row: {
          designer_email: string | null
          designer_id: string | null
          designer_name: string | null
          last_payment_date: string | null
          projects_count: number | null
          total_payments: number | null
          total_pending: number | null
          total_received: number | null
        }
        Relationships: [
          {
            foreignKeyName: "designer_payments_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      designer_receivables: {
        Row: {
          amount_paid: number | null
          amount_pending: number | null
          designer_id: string | null
          designer_name: string | null
          designer_percentage: number | null
          designer_value: number | null
          discipline_name: string | null
          project_id: string | null
          project_name: string | null
          status: string | null
          total_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_pricing_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      vw_financial_overview: {
        Row: {
          meses_analisados: number | null
          primeira_transacao: string | null
          saldo_total: number | null
          total_despesas: number | null
          total_receitas: number | null
          total_transacoes: number | null
          ultima_transacao: string | null
        }
        Relationships: []
      }
      vw_monthly_balance: {
        Row: {
          despesas: number | null
          mes: string | null
          receitas: number | null
          saldo: number | null
          total_transacoes: number | null
        }
        Relationships: []
      }
      vw_monthly_category_summary: {
        Row: {
          categoria: string | null
          category_name: string | null
          icon: string | null
          is_income: boolean | null
          maior_valor: number | null
          menor_valor: number | null
          mes: string | null
          total_transacoes: number | null
          valor_medio: number | null
          valor_total: number | null
        }
        Relationships: []
      }
      vw_recurring_expenses: {
        Row: {
          categoria: string | null
          datas: string[] | null
          description: string | null
          valor: number | null
          vezes: number | null
        }
        Relationships: []
      }
      vw_source_analysis: {
        Row: {
          entradas: number | null
          fonte: string | null
          mes: string | null
          saidas: number | null
          saldo: number | null
          transacoes: number | null
        }
        Relationships: []
      }
      vw_spending_alerts: {
        Row: {
          categoria: string | null
          date: string | null
          description: string | null
          icon: string | null
          media_categoria: number | null
          percentual_da_media: number | null
          valor: number | null
        }
        Relationships: []
      }
      vw_top_expenses: {
        Row: {
          categoria: string | null
          description: string | null
          frequencia: number | null
          icon: string | null
          valor_medio: number | null
          valor_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      budget_request_handler: { Args: { payload: Json }; Returns: Json }
      calculate_user_level: { Args: { user_points: number }; Returns: number }
      cleanup_old_activity_logs: { Args: never; Returns: undefined }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      contact_lead_handler: { Args: { payload: Json }; Returns: Json }
      generate_transaction_fingerprint: {
        Args: {
          p_amount: number
          p_date: string
          p_description: string
          p_source: string
        }
        Returns: string
      }
      get_user_role_simple: { Args: { user_uuid?: string }; Returns: string }
      import_transactions_batch: {
        Args: { p_transactions: Json }
        Returns: {
          details: Json
          total_duplicates: number
          total_inserted: number
          total_received: number
        }[]
      }
      insert_transaction_safe: {
        Args: {
          p_amount: number
          p_bank_account?: string
          p_category_id?: string
          p_date: string
          p_description: string
          p_raw_text?: string
          p_source?: string
          p_source_file?: string
          p_subcategory?: string
        }
        Returns: {
          inserted: boolean
          message: string
          transaction_id: string
        }[]
      }
      newsletter_signup_handler: { Args: { payload: Json }; Returns: Json }
      recalculate_all_user_scores: { Args: never; Returns: undefined }
      recalculate_all_users: { Args: never; Returns: undefined }
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
