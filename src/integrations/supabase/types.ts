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
      company_expenses: {
        Row: {
          amount: number
          appsheet_id: string | null
          contract_name: string | null
          cost_center: string
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string
          id: string
          project_id: string | null
          responsible: string | null
          sector: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appsheet_id?: string | null
          contract_name?: string | null
          cost_center: string
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date: string
          id?: string
          project_id?: string | null
          responsible?: string | null
          sector?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appsheet_id?: string | null
          contract_name?: string | null
          cost_center?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          project_id?: string | null
          responsible?: string | null
          sector?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "designer_receivables"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "company_expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      contract_income: {
        Row: {
          amount: number
          appsheet_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          income_date: string
          income_type: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appsheet_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          income_date: string
          income_type?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appsheet_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          income_date?: string
          income_type?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_income_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "designer_receivables"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "contract_income_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_agent_openclaw: {
        Row: {
          agent_slug: string
          created_at: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          openclaw_session_id: string | null
          openclaw_workspace: string | null
          provisioned_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agent_slug: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          openclaw_session_id?: string | null
          openclaw_workspace?: string | null
          provisioned_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_slug?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          openclaw_session_id?: string | null
          openclaw_workspace?: string | null
          provisioned_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ct_agents: {
        Row: {
          config: Json | null
          created_at: string | null
          display_name: string
          id: string
          last_active_at: string | null
          role: string
          slug: string
          status: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          display_name: string
          id?: string
          last_active_at?: string | null
          role: string
          slug: string
          status?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          display_name?: string
          id?: string
          last_active_at?: string | null
          role?: string
          slug?: string
          status?: string | null
        }
        Relationships: []
      }
      ct_api_keys: {
        Row: {
          created_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          label: string
          last_used_at: string | null
          revoked_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          label?: string
          last_used_at?: string | null
          revoked_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ct_api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "ct_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_audit_log: {
        Row: {
          action: string | null
          agent: string | null
          created_at: string | null
          details: Json | null
          id: number
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action?: string | null
          agent?: string | null
          created_at?: string | null
          details?: Json | null
          id?: number
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string | null
          agent?: string | null
          created_at?: string | null
          details?: Json | null
          id?: number
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      ct_brand_profile: {
        Row: {
          audience: Json | null
          brand_voice: Json | null
          content_strategy: Json | null
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_step: string | null
          questionnaire: Json | null
          raw_social_data: Json | null
          site_analysis: Json | null
          site_url: string | null
          social_links: Json | null
          updated_at: string | null
          video_transcripts: string[] | null
          video_urls: string[] | null
          visual_identity: Json | null
        }
        Insert: {
          audience?: Json | null
          brand_voice?: Json | null
          content_strategy?: Json | null
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          questionnaire?: Json | null
          raw_social_data?: Json | null
          site_analysis?: Json | null
          site_url?: string | null
          social_links?: Json | null
          updated_at?: string | null
          video_transcripts?: string[] | null
          video_urls?: string[] | null
          visual_identity?: Json | null
        }
        Update: {
          audience?: Json | null
          brand_voice?: Json | null
          content_strategy?: Json | null
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          questionnaire?: Json | null
          raw_social_data?: Json | null
          site_analysis?: Json | null
          site_url?: string | null
          social_links?: Json | null
          updated_at?: string | null
          video_transcripts?: string[] | null
          video_urls?: string[] | null
          visual_identity?: Json | null
        }
        Relationships: []
      }
      ct_collaborations: {
        Row: {
          content_id: string | null
          created_at: string | null
          id: string
          influencer_id: string | null
          notes: string | null
          scheduled_at: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          notes?: string | null
          scheduled_at?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string | null
          id?: string
          influencer_id?: string | null
          notes?: string | null
          scheduled_at?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_collaborations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "ct_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ct_collaborations_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "ct_influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_competitor_posts: {
        Row: {
          analysis: string | null
          caption: string | null
          competitor_handle: string | null
          competitor_id: string | null
          content_preview: string | null
          engagement: Json | null
          external_id: string | null
          id: string
          is_viral: boolean | null
          media_urls: string[] | null
          platform: string | null
          platform_post_id: string | null
          post_type: string | null
          posted_at: string | null
          scraped_at: string | null
          source_type: string | null
        }
        Insert: {
          analysis?: string | null
          caption?: string | null
          competitor_handle?: string | null
          competitor_id?: string | null
          content_preview?: string | null
          engagement?: Json | null
          external_id?: string | null
          id?: string
          is_viral?: boolean | null
          media_urls?: string[] | null
          platform?: string | null
          platform_post_id?: string | null
          post_type?: string | null
          posted_at?: string | null
          scraped_at?: string | null
          source_type?: string | null
        }
        Update: {
          analysis?: string | null
          caption?: string | null
          competitor_handle?: string | null
          competitor_id?: string | null
          content_preview?: string | null
          engagement?: Json | null
          external_id?: string | null
          id?: string
          is_viral?: boolean | null
          media_urls?: string[] | null
          platform?: string | null
          platform_post_id?: string | null
          post_type?: string | null
          posted_at?: string | null
          scraped_at?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_competitor_posts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "ct_competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_competitors: {
        Row: {
          display_name: string | null
          handle: string
          id: string
          is_active: boolean | null
          last_scraped_at: string | null
          metadata: Json | null
          niche: string | null
          platform: string | null
        }
        Insert: {
          display_name?: string | null
          handle: string
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          metadata?: Json | null
          niche?: string | null
          platform?: string | null
        }
        Update: {
          display_name?: string | null
          handle?: string
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          metadata?: Json | null
          niche?: string | null
          platform?: string | null
        }
        Relationships: []
      }
      ct_contacts: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ct_content_items: {
        Row: {
          approval_notes: string | null
          approval_status: string | null
          brand: string | null
          caption: string | null
          content_body: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          engagement: Json | null
          hashtags: string[] | null
          id: string
          media_urls: string[] | null
          metadata: Json | null
          platform: string | null
          publish_url: string | null
          published_at: string | null
          scheduled_at: string | null
          script: string | null
          source_agent: string | null
          source_url: string | null
          status: string | null
          title: string
          updated_at: string | null
          visual_notes: string | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string | null
          brand?: string | null
          caption?: string | null
          content_body?: string | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          engagement?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: string | null
          publish_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          script?: string | null
          source_agent?: string | null
          source_url?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          visual_notes?: string | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string | null
          brand?: string | null
          caption?: string | null
          content_body?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          engagement?: Json | null
          hashtags?: string[] | null
          id?: string
          media_urls?: string[] | null
          metadata?: Json | null
          platform?: string | null
          publish_url?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          script?: string | null
          source_agent?: string | null
          source_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          visual_notes?: string | null
        }
        Relationships: []
      }
      ct_content_series: {
        Row: {
          created_at: string | null
          description: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          platforms: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          platforms?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          platforms?: string[] | null
        }
        Relationships: []
      }
      ct_content_series_items: {
        Row: {
          content_id: string
          sequence_num: number | null
          series_id: string
        }
        Insert: {
          content_id: string
          sequence_num?: number | null
          series_id: string
        }
        Update: {
          content_id?: string
          sequence_num?: number | null
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ct_content_series_items_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "ct_content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ct_content_series_items_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "ct_content_series"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_credentials: {
        Row: {
          auth_tag: string
          created_at: string | null
          credential_key: string
          encrypted_value: string
          id: string
          iv: string
          service: string
          updated_at: string | null
        }
        Insert: {
          auth_tag: string
          created_at?: string | null
          credential_key: string
          encrypted_value: string
          id?: string
          iv: string
          service: string
          updated_at?: string | null
        }
        Update: {
          auth_tag?: string
          created_at?: string | null
          credential_key?: string
          encrypted_value?: string
          id?: string
          iv?: string
          service?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ct_deal_activities: {
        Row: {
          activity_type: string | null
          contact_id: string | null
          deal_id: string | null
          description: string | null
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          activity_type?: string | null
          contact_id?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string | null
          contact_id?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_deal_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ct_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ct_deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "ct_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_deals: {
        Row: {
          closed_at: string | null
          contact_id: string | null
          created_at: string | null
          currency: string | null
          expected_close_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          stage_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          expected_close_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          stage_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          expected_close_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          stage_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ct_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ct_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "ct_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_design_system: {
        Row: {
          brand_voice: string | null
          carousel_style: Json | null
          colors: Json | null
          fonts: Json | null
          id: string
          logo_url: string | null
          owner: string | null
          updated_at: string | null
        }
        Insert: {
          brand_voice?: string | null
          carousel_style?: Json | null
          colors?: Json | null
          fonts?: Json | null
          id?: string
          logo_url?: string | null
          owner?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_voice?: string | null
          carousel_style?: Json | null
          colors?: Json | null
          fonts?: Json | null
          id?: string
          logo_url?: string | null
          owner?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ct_email_campaigns: {
        Row: {
          body_html: string | null
          body_text: string | null
          campaign_type: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          provider: string | null
          provider_campaign_id: string | null
          recipient_tags: string[] | null
          scheduled_at: string | null
          sent_at: string | null
          stats: Json | null
          status: string | null
          subject: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          campaign_type?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          provider?: string | null
          provider_campaign_id?: string | null
          recipient_tags?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string | null
          subject: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          campaign_type?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          provider?: string | null
          provider_campaign_id?: string | null
          recipient_tags?: string[] | null
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      ct_email_sequence_steps: {
        Row: {
          body_html: string | null
          body_text: string | null
          delay_hours: number | null
          id: string
          metadata: Json | null
          sequence_id: string | null
          step_number: number
          subject: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          delay_hours?: number | null
          id?: string
          metadata?: Json | null
          sequence_id?: string | null
          step_number: number
          subject?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          delay_hours?: number | null
          id?: string
          metadata?: Json | null
          sequence_id?: string | null
          step_number?: number
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_email_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "ct_email_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_email_sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_event: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_event?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_event?: string | null
        }
        Relationships: []
      }
      ct_influencers: {
        Row: {
          created_at: string | null
          followers_approx: number | null
          handles: Json | null
          id: string
          last_contact_at: string | null
          metadata: Json | null
          name: string
          niche: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          followers_approx?: number | null
          handles?: Json | null
          id?: string
          last_contact_at?: string | null
          metadata?: Json | null
          name: string
          niche?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          followers_approx?: number | null
          handles?: Json | null
          id?: string
          last_contact_at?: string | null
          metadata?: Json | null
          name?: string
          niche?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      ct_instagram_posts: {
        Row: {
          caption: string
          created_at: string | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          ig_container_id: string | null
          ig_media_id: string | null
          ig_permalink: string | null
          image_url: string
          media_type: string
          published_at: string | null
          scheduled_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          caption: string
          created_at?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          ig_container_id?: string | null
          ig_media_id?: string | null
          ig_permalink?: string | null
          image_url: string
          media_type?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          caption?: string
          created_at?: string | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          ig_container_id?: string | null
          ig_media_id?: string | null
          ig_permalink?: string | null
          image_url?: string
          media_type?: string
          published_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ct_lead_magnets: {
        Row: {
          created_at: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          landing_page_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          landing_page_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          landing_page_url?: string | null
          name?: string
        }
        Relationships: []
      }
      ct_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          position: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          position?: number
        }
        Relationships: []
      }
      ct_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: string[]
          id: string
          is_active: boolean | null
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: string[]
          id: string
          is_active?: boolean | null
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: string[]
          id?: string
          is_active?: boolean | null
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      ct_subscribers: {
        Row: {
          email: string
          id: string
          lead_magnet_id: string | null
          metadata: Json | null
          name: string | null
          source: string | null
          status: string | null
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          lead_magnet_id?: string | null
          metadata?: Json | null
          name?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          lead_magnet_id?: string | null
          metadata?: Json | null
          name?: string | null
          source?: string | null
          status?: string | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      ct_subscriptions: {
        Row: {
          billing_cycle: string
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan_id: string
          provider: string | null
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string
          provider?: string | null
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "ct_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ct_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "ct_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_tasks: {
        Row: {
          assigned_agent: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          metadata: Json | null
          parent_task_id: string | null
          priority: number | null
          result: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_agent?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json | null
          parent_task_id?: string | null
          priority?: number | null
          result?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_agent?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json | null
          parent_task_id?: string | null
          priority?: number | null
          result?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_tasks_assigned_agent_fkey"
            columns: ["assigned_agent"]
            isOneToOne: false
            referencedRelation: "ct_agents"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "ct_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "ct_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_tenant_members: {
        Row: {
          created_at: string | null
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ct_tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "ct_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ct_tenant_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ct_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_tenants: {
        Row: {
          created_at: string | null
          database_url: string
          id: string
          name: string
          plan: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          database_url: string
          id?: string
          name: string
          plan?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          database_url?: string
          id?: string
          name?: string
          plan?: string | null
          slug?: string
        }
        Relationships: []
      }
      ct_usage: {
        Row: {
          agents_used: number | null
          api_calls: number | null
          content_created: number | null
          created_at: string | null
          emails_sent: number | null
          id: string
          period: string
          storage_bytes: number | null
          tasks_executed: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          agents_used?: number | null
          api_calls?: number | null
          content_created?: number | null
          created_at?: string | null
          emails_sent?: number | null
          id?: string
          period: string
          storage_bytes?: number | null
          tasks_executed?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          agents_used?: number | null
          api_calls?: number | null
          content_created?: number | null
          created_at?: string | null
          emails_sent?: number | null
          id?: string
          period?: string
          storage_bytes?: number | null
          tasks_executed?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ct_usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "ct_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ct_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
        }
        Relationships: []
      }
      designer_payments: {
        Row: {
          amount: number
          appsheet_id: string | null
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
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appsheet_id?: string | null
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
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appsheet_id?: string | null
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
          supervisor_id?: string | null
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
          {
            foreignKeyName: "designer_payments_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          expense_type: string | null
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
          expense_type?: string | null
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
          expense_type?: string | null
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
          is_active: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
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
          majoracao: number | null
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
          majoracao?: number | null
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
          majoracao?: number | null
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
      unmatched_entries: {
        Row: {
          created_at: string | null
          entry_id: string
          field_type: string
          id: string
          original_value: string
          resolved_at: string | null
          resolved_value: string | null
          sector: string | null
          source_table: string
          status: string | null
          suggested_matches: Json | null
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          field_type: string
          id?: string
          original_value: string
          resolved_at?: string | null
          resolved_value?: string | null
          sector?: string | null
          source_table: string
          status?: string | null
          suggested_matches?: Json | null
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          field_type?: string
          id?: string
          original_value?: string
          resolved_at?: string | null
          resolved_value?: string | null
          sector?: string | null
          source_table?: string
          status?: string | null
          suggested_matches?: Json | null
        }
        Relationships: []
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
      vw_monthly_recurring_cost: {
        Row: {
          custo_fixo: number | null
          custo_misto: number | null
          custo_variavel: number | null
          mes: string | null
          total_despesas: number | null
          total_transacoes: number | null
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
      check_rls_inconsistencies: {
        Args: never
        Returns: {
          client_name: string
          designer_id: string
          designer_name: string
          inconsistency_type: string
          project_id: string
          project_name: string
        }[]
      }
      cleanup_old_activity_logs: { Args: never; Returns: undefined }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      contact_lead_handler: { Args: { payload: Json }; Returns: Json }
      fix_payment_project_names: { Args: never; Returns: number }
      fix_rls_inconsistencies: { Args: never; Returns: number }
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
