export type AccountType = 'private' | 'municipal' | 'club' | 'company'
export type LightType = 'led' | 'conventional'
export type MeasurementGrid = '5m' | '10m'
export type OrderStatus =
  | 'requested'
  | 'confirmed'
  | 'scheduled'
  | 'measuring'
  | 'completed'
  | 'rejected'
  | 'individual_request'
export type MessageType = 'text' | 'file' | 'system'
export type RecipientType = 'customer' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          account_type: AccountType
          organization: string | null
          position: string | null
          vat_id: string | null
          address_street: string | null
          address_zip: string | null
          address_city: string | null
          address_country: string
          billing_same: boolean
          billing_street: string | null
          billing_zip: string | null
          billing_city: string | null
          billing_country: string
          is_approved: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      facility_types: {
        Row: {
          id: string
          name: string
          icon: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['facility_types']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['facility_types']['Insert']>
      }
      facilities: {
        Row: {
          id: string
          user_id: string
          type_id: string
          name: string
          latitude: number | null
          longitude: number | null
          address: string | null
          length_m: number | null
          width_m: number | null
          mast_count: number | null
          light_count: number | null
          light_type: LightType | null
          measurement_grid: MeasurementGrid | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['facilities']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['facilities']['Insert']>
      }
      packages: {
        Row: {
          id: string
          name: string
          description: string | null
          base_price: number
          grid_size: MeasurementGrid
          features: Record<string, unknown>
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['packages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['packages']['Insert']>
      }
      pricing_rules: {
        Row: {
          id: string
          min_facilities: number
          max_facilities: number | null
          discount_percent: number
          is_individual: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pricing_rules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pricing_rules']['Insert']>
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: OrderStatus
          total_price: number | null
          discount_percent: number | null
          notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          facility_id: string
          package_id: string
          item_price: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      schedule_templates: {
        Row: {
          id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
        }
        Insert: Omit<Database['public']['Tables']['schedule_templates']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['schedule_templates']['Insert']>
      }
      schedule_overrides: {
        Row: {
          id: string
          date_start: string
          date_end: string | null
          start_time: string | null
          end_time: string | null
          is_blocked: boolean
          label: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['schedule_overrides']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['schedule_overrides']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          order_id: string
          date: string
          start_time: string
          end_time: string
          duration_hours: number | null
          duration_surcharge: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      messages: {
        Row: {
          id: string
          order_id: string
          sender_id: string
          content: string | null
          type: MessageType
          file_url: string | null
          file_name: string | null
          customer_read_at: string | null
          admin_read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      results: {
        Row: {
          id: string
          order_id: string
          order_item_id: string | null
          data: Record<string, unknown> | null
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['results']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['results']['Insert']>
      }
      result_files: {
        Row: {
          id: string
          result_id: string
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['result_files']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['result_files']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      email_templates: {
        Row: {
          id: string
          template_key: string
          subject: string
          body: string
          cta_text: string | null
          cta_url: string | null
          recipient_type: RecipientType
          is_active: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['email_templates']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['email_templates']['Insert']>
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type FacilityType = Database['public']['Tables']['facility_types']['Row']
export type Facility = Database['public']['Tables']['facilities']['Row']
export type Package = Database['public']['Tables']['packages']['Row']
export type PricingRule = Database['public']['Tables']['pricing_rules']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type ScheduleTemplate = Database['public']['Tables']['schedule_templates']['Row']
export type ScheduleOverride = Database['public']['Tables']['schedule_overrides']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Result = Database['public']['Tables']['results']['Row']
export type ResultFile = Database['public']['Tables']['result_files']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
