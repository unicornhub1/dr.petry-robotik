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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          date: string
          duration_hours: number | null
          duration_surcharge: number | null
          end_time: string
          id: string
          order_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_hours?: number | null
          duration_surcharge?: number | null
          end_time: string
          id?: string
          order_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_hours?: number | null
          duration_surcharge?: number | null
          end_time?: string
          id?: string
          order_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          cta_text: string | null
          cta_url: string | null
          id: string
          is_active: boolean
          recipient_type: Database["public"]["Enums"]["recipient_type"]
          subject: string
          template_key: string
          updated_at: string
        }
        Insert: {
          body: string
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          is_active?: boolean
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
          subject: string
          template_key: string
          updated_at?: string
        }
        Update: {
          body?: string
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          is_active?: boolean
          recipient_type?: Database["public"]["Enums"]["recipient_type"]
          subject?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number | null
          length_m: number | null
          light_count: number | null
          light_type: Database["public"]["Enums"]["light_type"] | null
          longitude: number | null
          mast_count: number | null
          measurement_grid:
            | Database["public"]["Enums"]["measurement_grid"]
            | null
          name: string
          type_id: string
          updated_at: string
          user_id: string
          width_m: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          length_m?: number | null
          light_count?: number | null
          light_type?: Database["public"]["Enums"]["light_type"] | null
          longitude?: number | null
          mast_count?: number | null
          measurement_grid?:
            | Database["public"]["Enums"]["measurement_grid"]
            | null
          name: string
          type_id: string
          updated_at?: string
          user_id: string
          width_m?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          length_m?: number | null
          light_count?: number | null
          light_type?: Database["public"]["Enums"]["light_type"] | null
          longitude?: number | null
          mast_count?: number | null
          measurement_grid?:
            | Database["public"]["Enums"]["measurement_grid"]
            | null
          name?: string
          type_id?: string
          updated_at?: string
          user_id?: string
          width_m?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "facility_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_types: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_read_at: string | null
          content: string | null
          created_at: string
          customer_read_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          order_id: string | null
          recipient_id: string | null
          sender_id: string
          type: Database["public"]["Enums"]["message_type"]
        }
        Insert: {
          admin_read_at?: string | null
          content?: string | null
          created_at?: string
          customer_read_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          order_id?: string | null
          recipient_id?: string | null
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Update: {
          admin_read_at?: string | null
          content?: string | null
          created_at?: string
          customer_read_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          order_id?: string | null
          recipient_id?: string | null
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          facility_id: string
          id: string
          item_price: number | null
          order_id: string
          package_id: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          id?: string
          item_price?: number | null
          order_id: string
          package_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          id?: string
          item_price?: number | null
          order_id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          created_at: string
          discount_percent: number | null
          id: string
          notes: string | null
          order_number: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_number?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_number?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          features: Json
          grid_size: Database["public"]["Enums"]["measurement_grid"]
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          features?: Json
          grid_size?: Database["public"]["Enums"]["measurement_grid"]
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          features?: Json
          grid_size?: Database["public"]["Enums"]["measurement_grid"]
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          created_at: string
          discount_percent: number
          id: string
          is_individual: boolean
          max_facilities: number | null
          min_facilities: number
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_individual?: boolean
          max_facilities?: number | null
          min_facilities: number
        }
        Update: {
          created_at?: string
          discount_percent?: number
          id?: string
          is_individual?: boolean
          max_facilities?: number | null
          min_facilities?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          address_city: string | null
          address_country: string
          address_street: string | null
          address_zip: string | null
          billing_city: string | null
          billing_country: string
          billing_same: boolean
          billing_street: string | null
          billing_zip: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_admin: boolean
          is_approved: boolean
          last_name: string
          organization: string | null
          phone: string | null
          position: string | null
          updated_at: string
          vat_id: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address_city?: string | null
          address_country?: string
          address_street?: string | null
          address_zip?: string | null
          billing_city?: string | null
          billing_country?: string
          billing_same?: boolean
          billing_street?: string | null
          billing_zip?: string | null
          created_at?: string
          email: string
          first_name?: string
          id: string
          is_admin?: boolean
          is_approved?: boolean
          last_name?: string
          organization?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address_city?: string | null
          address_country?: string
          address_street?: string | null
          address_zip?: string | null
          billing_city?: string | null
          billing_country?: string
          billing_same?: boolean
          billing_street?: string | null
          billing_zip?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_admin?: boolean
          is_approved?: boolean
          last_name?: string
          organization?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          vat_id?: string | null
        }
        Relationships: []
      }
      result_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          result_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number
          file_type: string
          file_url: string
          id?: string
          result_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          result_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "result_files_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "results"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          admin_note: string | null
          created_at: string
          data: Json | null
          id: string
          order_id: string
          order_item_id: string | null
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          order_id: string
          order_item_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          order_id?: string
          order_item_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_overrides: {
        Row: {
          created_at: string
          date_end: string | null
          date_start: string
          end_time: string | null
          id: string
          is_blocked: boolean
          label: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string
          date_end?: string | null
          date_start: string
          end_time?: string | null
          id?: string
          is_blocked?: boolean
          label?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string
          date_end?: string | null
          date_start?: string
          end_time?: string | null
          id?: string
          is_blocked?: boolean
          label?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      schedule_templates: {
        Row: {
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_approved: { Args: never; Returns: boolean }
    }
    Enums: {
      account_type: "private" | "municipal" | "club" | "company"
      light_type: "led" | "conventional"
      measurement_grid: "5m" | "10m"
      message_type: "text" | "file" | "system"
      order_status:
        | "requested"
        | "confirmed"
        | "scheduled"
        | "measuring"
        | "completed"
        | "rejected"
        | "individual_request"
      recipient_type: "customer" | "admin"
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

// Helper types
export type AccountType = Database['public']['Enums']['account_type']
export type LightType = Database['public']['Enums']['light_type']
export type MeasurementGrid = Database['public']['Enums']['measurement_grid']
export type OrderStatus = Database['public']['Enums']['order_status']
export type MessageType = Database['public']['Enums']['message_type']
export type RecipientType = Database['public']['Enums']['recipient_type']

export type Profile = Tables<'profiles'>
export type FacilityType = Tables<'facility_types'>
export type Facility = Tables<'facilities'>
export type Package = Tables<'packages'>
export type PricingRule = Tables<'pricing_rules'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type ScheduleTemplate = Tables<'schedule_templates'>
export type ScheduleOverride = Tables<'schedule_overrides'>
export type Booking = Tables<'bookings'>
export type Message = Tables<'messages'>
export type Result = Tables<'results'>
export type ResultFile = Tables<'result_files'>
export type Notification = Tables<'notifications'>
export type EmailTemplate = Tables<'email_templates'>
