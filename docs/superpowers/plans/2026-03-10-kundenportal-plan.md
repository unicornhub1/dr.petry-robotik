# Petry Robotik Kundenportal — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kundenportal mit Onboarding, Dashboard, Messauftrags-Konfigurator, Echtzeit-Chat, Admin-Bereich und Notification-System auf Supabase-Basis.

**Architecture:** Next.js App Router mit Supabase (Auth, Postgres, Realtime, Storage). Drei Bereiche: Public Website (steht), Kunden-Dashboard (/dashboard), Admin-Dashboard (/admin). Shared UI Component Library. Nodemailer für E-Mail-Versand.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Supabase (Auth + DB + Realtime + Storage), Leaflet/OpenStreetMap, Nodemailer

**Spec:** `docs/superpowers/specs/2026-03-10-kundenportal-design.md`

---

## Chunk 1: Foundation & Database

### Task 1: Dependencies installieren

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Supabase + Leaflet + weitere Dependencies installieren**

```bash
npm install @supabase/supabase-js @supabase/ssr react-leaflet leaflet date-fns
npm install -D @types/leaflet
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, leaflet, date-fns dependencies"
```

---

### Task 2: Environment Variables & Supabase Client

**Files:**
- Create: `.env.local`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/lib/supabase/types.ts`
- Create: `src/lib/supabase/admin.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard - NEVER expose to client>

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=noreply@petry-robotik.de
EMAIL_PASSWORD=<password>
EMAIL_FROM=noreply@petry-robotik.de
```

- [ ] **Step 2: Create browser client `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create server client `src/lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  )
}
```

- [ ] **Step 4: Create middleware helper `src/lib/supabase/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Public routes — no auth needed
  const publicPaths = ['/', '/onboarding', '/login', '/blog', '/produkt', '/kontakt', '/auth/callback']
  const isPublic = publicPaths.some(p =>
    request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/')
  )

  if (isPublic) return supabaseResponse

  // Not logged in → redirect to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Admin routes — check is_admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      // Return 404 to hide admin area completely
      return NextResponse.json(null, { status: 404 })
    }
  }

  // Dashboard order creation — check is_approved
  if (request.nextUrl.pathname === '/dashboard/orders/new') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved')
      .eq('id', user.id)
      .single()

    if (!profile?.is_approved) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('blocked', 'not_approved')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
```

- [ ] **Step 5a: Create service role client `src/lib/supabase/admin.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Server-only! Uses service role key to bypass RLS.
// NEVER import this in client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 5: Create type stubs `src/lib/supabase/types.ts`**

```typescript
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
```

- [ ] **Step 6: Create root middleware `src/middleware.ts`**

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: supabase client setup with auth middleware"
```

---

### Task 3: Database Migration

**Files:**
- Uses: Supabase MCP `apply_migration` tool

- [ ] **Step 1: Create all tables via Supabase migration**

Run via `mcp__supabase__apply_migration` with name `create_all_tables`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE account_type AS ENUM ('private', 'municipal', 'club', 'company');
CREATE TYPE light_type AS ENUM ('led', 'conventional');
CREATE TYPE measurement_grid AS ENUM ('5m', '10m');
CREATE TYPE order_status AS ENUM (
  'requested', 'confirmed', 'scheduled',
  'measuring', 'completed', 'rejected', 'individual_request'
);
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');
CREATE TYPE recipient_type AS ENUM ('customer', 'admin');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  account_type account_type NOT NULL DEFAULT 'private',
  organization TEXT,
  position TEXT,
  vat_id TEXT,
  address_street TEXT,
  address_zip TEXT,
  address_city TEXT,
  address_country TEXT NOT NULL DEFAULT 'DE',
  billing_same BOOLEAN NOT NULL DEFAULT TRUE,
  billing_street TEXT,
  billing_zip TEXT,
  billing_city TEXT,
  billing_country TEXT NOT NULL DEFAULT 'DE',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Facility types (admin-managed)
CREATE TABLE facility_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Facilities (per customer)
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES facility_types(id),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  length_m DOUBLE PRECISION,
  width_m DOUBLE PRECISION,
  mast_count INT,
  light_count INT,
  light_type light_type,
  measurement_grid measurement_grid,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Packages (admin-managed)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  base_price INT NOT NULL DEFAULT 0,
  grid_size measurement_grid NOT NULL DEFAULT '10m',
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing rules (admin-managed)
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_facilities INT NOT NULL,
  max_facilities INT,
  discount_percent DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_individual BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE,
  status order_status NOT NULL DEFAULT 'requested',
  total_price INT,
  discount_percent DOUBLE PRECISION,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id),
  package_id UUID NOT NULL REFERENCES packages(id),
  item_price INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedule templates (weekly plan)
CREATE TABLE schedule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Schedule overrides
CREATE TABLE schedule_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_start DATE NOT NULL,
  date_end DATE,
  start_time TIME,
  end_time TIME,
  is_blocked BOOLEAN NOT NULL DEFAULT TRUE,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DOUBLE PRECISION,
  duration_surcharge INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages (realtime chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT,
  type message_type NOT NULL DEFAULT 'text',
  file_url TEXT,
  file_name TEXT,
  customer_read_at TIMESTAMPTZ,
  admin_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Results
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id),
  data JSONB,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Result files
CREATE TABLE result_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  recipient_type recipient_type NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  next_num INT;
BEGIN
  year_prefix := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(order_number, '-', 2) AS INT)), 0) + 1
  INTO next_num
  FROM orders
  WHERE order_number LIKE year_prefix || '-%';
  NEW.order_number := year_prefix || '-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create profile on signup (reads all metadata from onboarding)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, email, first_name, last_name,
    account_type, phone, organization, position, vat_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'private')::account_type,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'organization',
    NEW.raw_user_meta_data->>'position',
    NEW.raw_user_meta_data->>'vat_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX idx_facilities_user_id ON facilities(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_messages_order_id ON messages(order_id);
CREATE INDEX idx_messages_created_at ON messages(order_id, created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_schedule_overrides_dates ON schedule_overrides(date_start, date_end);
```

- [ ] **Step 2: Verify tables created**

Run `mcp__supabase__list_tables` with schemas `["public"]` and verbose `true`.

---

### Task 4: Row Level Security

- [ ] **Step 1: Apply RLS migration**

Run via `mcp__supabase__apply_migration` with name `add_rls_policies`:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function: is current user approved?
CREATE OR REPLACE FUNCTION is_approved()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_approved = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update all profiles" ON profiles FOR UPDATE USING (is_admin());

-- FACILITY TYPES (readable by all authenticated, writable by admin)
CREATE POLICY "Authenticated can view active facility types" ON facility_types FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = TRUE);
CREATE POLICY "Admin can view all facility types" ON facility_types FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage facility types" ON facility_types FOR ALL USING (is_admin());

-- FACILITIES
CREATE POLICY "Users can view own facilities" ON facilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own facilities" ON facilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own facilities" ON facilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own facilities" ON facilities FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all facilities" ON facilities FOR SELECT USING (is_admin());

-- PACKAGES (visible only to approved users or admin)
CREATE POLICY "Approved users can view active packages" ON packages FOR SELECT USING (is_approved() AND is_active = TRUE);
CREATE POLICY "Admin can manage packages" ON packages FOR ALL USING (is_admin());

-- PRICING RULES (visible only to approved users or admin)
CREATE POLICY "Approved users can view pricing" ON pricing_rules FOR SELECT USING (is_approved());
CREATE POLICY "Admin can manage pricing" ON pricing_rules FOR ALL USING (is_admin());

-- ORDERS
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id AND is_approved());
CREATE POLICY "Admin can view all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update all orders" ON orders FOR UPDATE USING (is_admin());

-- ORDER ITEMS
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert own order items" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admin can view all order items" ON order_items FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage order items" ON order_items FOR ALL USING (is_admin());

-- SCHEDULE (readable by approved users, writable by admin)
CREATE POLICY "Approved users can view schedule" ON schedule_templates FOR SELECT USING (is_approved());
CREATE POLICY "Admin can manage schedule" ON schedule_templates FOR ALL USING (is_admin());
CREATE POLICY "Approved users can view overrides" ON schedule_overrides FOR SELECT USING (is_approved());
CREATE POLICY "Admin can manage overrides" ON schedule_overrides FOR ALL USING (is_admin());

-- BOOKINGS
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = bookings.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admin can manage bookings" ON bookings FOR ALL USING (is_admin());

-- MESSAGES
CREATE POLICY "Users can view messages for own orders" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = messages.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert messages for own orders" ON messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = messages.order_id AND orders.user_id = auth.uid()) AND auth.uid() = sender_id);
-- Customers can only mark their own read status, nothing else
CREATE POLICY "Users can mark messages as read" ON messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = messages.order_id AND orders.user_id = auth.uid()))
  WITH CHECK (
    -- Only allow setting customer_read_at, no other column changes
    content IS NOT DISTINCT FROM (SELECT content FROM messages m WHERE m.id = messages.id)
    AND admin_read_at IS NOT DISTINCT FROM (SELECT admin_read_at FROM messages m WHERE m.id = messages.id)
  );
CREATE POLICY "Admin can view all messages" ON messages FOR SELECT USING (is_admin());
CREATE POLICY "Admin can insert messages" ON messages FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update messages" ON messages FOR UPDATE USING (is_admin());

-- RESULTS
CREATE POLICY "Users can view own results" ON results FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = results.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admin can manage results" ON results FOR ALL USING (is_admin());

-- RESULT FILES
CREATE POLICY "Users can view own result files" ON result_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM results
    JOIN orders ON orders.id = results.order_id
    WHERE results.id = result_files.result_id AND orders.user_id = auth.uid()
  ));
CREATE POLICY "Admin can manage result files" ON result_files FOR ALL USING (is_admin());

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage notifications" ON notifications FOR ALL USING (is_admin());

-- EMAIL TEMPLATES (admin only)
CREATE POLICY "Admin can manage email templates" ON email_templates FOR ALL USING (is_admin());
```

---

### Task 5: Seed Data

- [ ] **Step 1: Insert default facility types, schedule, email templates**

Run via `mcp__supabase__apply_migration` with name `seed_data`:

```sql
-- Default facility types
INSERT INTO facility_types (name, icon, sort_order) VALUES
  ('Fussballplatz', 'Goal', 1),
  ('Tennisplatz', 'Tennis', 2),
  ('Sporthalle', 'Warehouse', 3),
  ('Leichtathletik', 'Timer', 4),
  ('Mehrzweckplatz', 'LayoutGrid', 5),
  ('Parkplatz/Aussengelaende', 'ParkingCircle', 6),
  ('Sonstige', 'HelpCircle', 99);

-- Default packages
INSERT INTO packages (name, description, base_price, grid_size, features, sort_order) VALUES
  ('Silber', 'Standardmessung mit 10m Messraster', 50000, '10m', '{"report": "Standard", "grid": "10m"}', 1),
  ('Gold', 'Detaillierte Messung mit 5m Messraster', 80000, '5m', '{"report": "Detailliert", "grid": "5m"}', 2);

-- Default pricing rules
INSERT INTO pricing_rules (min_facilities, max_facilities, discount_percent, is_individual) VALUES
  (1, 1, 0, FALSE),
  (2, 2, 5, FALSE),
  (3, 3, 10, FALSE),
  (4, NULL, 0, TRUE);

-- Default schedule (Mo-Fr 08:00-17:00)
INSERT INTO schedule_templates (day_of_week, start_time, end_time, is_active) VALUES
  (0, '08:00', '17:00', TRUE),
  (1, '08:00', '17:00', TRUE),
  (2, '08:00', '17:00', TRUE),
  (3, '08:00', '17:00', TRUE),
  (4, '08:00', '17:00', TRUE),
  (5, '08:00', '17:00', FALSE),
  (6, '08:00', '17:00', FALSE);

-- Email templates
INSERT INTO email_templates (template_key, subject, body, cta_text, cta_url, recipient_type) VALUES
  ('welcome', 'Willkommen bei Petry Robotik', '<p>Hallo {{vorname}},</p><p>vielen Dank fuer Ihre Registrierung bei Petry Robotik. Ihr Account wird in Kuerze geprueft.</p>', 'Zum Dashboard', '{{dashboard_url}}', 'customer'),
  ('magic_link', 'Ihr Login-Link', '<p>Hallo {{vorname}},</p><p>klicken Sie auf den folgenden Link, um sich einzuloggen:</p>', 'Jetzt einloggen', '{{magic_link_url}}', 'customer'),
  ('account_approved', 'Ihr Account wurde freigeschaltet', '<p>Hallo {{vorname}},</p><p>Ihr Account bei Petry Robotik wurde freigeschaltet. Sie koennen ab sofort Messauftraege erstellen und Preise einsehen.</p>', 'Zum Dashboard', '{{dashboard_url}}', 'customer'),
  ('account_suspended', 'Account gesperrt', '<p>Hallo {{vorname}},</p><p>Ihr Account bei Petry Robotik wurde gesperrt. Bei Fragen kontaktieren Sie uns bitte.</p>', NULL, NULL, 'customer'),
  ('admin_new_user', 'Neuer Account wartet auf Freigabe', '<p>Ein neuer Nutzer hat sich registriert:</p><p><strong>{{vorname}} {{nachname}}</strong><br>Typ: {{account_type}}<br>E-Mail: {{email}}</p>', 'Account pruefen', '{{admin_url}}/users/{{user_id}}', 'admin'),
  ('order_received', 'Auftrag eingegangen', '<p>Hallo {{vorname}},</p><p>Ihr Messauftrag #{{auftrag_nr}} wurde erfolgreich eingereicht. Wir pruefen die Details und melden uns in Kuerze.</p>', 'Auftrag ansehen', '{{dashboard_url}}/orders/{{order_id}}', 'customer'),
  ('order_confirmed', 'Auftrag #{{auftrag_nr}} bestaetigt', '<p>Hallo {{vorname}},</p><p>Ihr Messauftrag #{{auftrag_nr}} wurde bestaetigt.</p>', 'Details ansehen', '{{dashboard_url}}/orders/{{order_id}}', 'customer'),
  ('order_rejected', 'Auftrag #{{auftrag_nr}} abgelehnt', '<p>Hallo {{vorname}},</p><p>Leider konnten wir Ihren Messauftrag #{{auftrag_nr}} nicht annehmen. Bitte kontaktieren Sie uns fuer weitere Informationen.</p>', 'Kontakt aufnehmen', '{{dashboard_url}}/orders/{{order_id}}', 'customer'),
  ('order_status_changed', 'Status-Update zu Auftrag #{{auftrag_nr}}', '<p>Hallo {{vorname}},</p><p>Der Status Ihres Auftrags #{{auftrag_nr}} wurde aktualisiert: <strong>{{status}}</strong></p>', 'Details ansehen', '{{dashboard_url}}/orders/{{order_id}}', 'customer'),
  ('new_message', 'Neue Nachricht zu Auftrag #{{auftrag_nr}}', '<p>Hallo {{vorname}},</p><p>Sie haben eine neue Nachricht zu Auftrag #{{auftrag_nr}} erhalten.</p>', 'Nachricht lesen', '{{dashboard_url}}/orders/{{order_id}}', 'customer'),
  ('new_message_admin', 'Neue Nachricht von {{kunde}} zu Auftrag #{{auftrag_nr}}', '<p>Neue Nachricht von {{kunde}} zu Auftrag #{{auftrag_nr}}:</p><p>{{nachricht_preview}}</p>', 'Nachricht lesen', '{{admin_url}}/orders/{{order_id}}', 'admin'),
  ('results_available', 'Messergebnisse fuer Auftrag #{{auftrag_nr}}', '<p>Hallo {{vorname}},</p><p>Die Messergebnisse fuer Ihren Auftrag #{{auftrag_nr}} sind jetzt verfuegbar.</p>', 'Ergebnisse ansehen', '{{dashboard_url}}/results/{{result_id}}', 'customer'),
  ('individual_request', 'Individuelle Anfrage von {{kunde}}', '<p>Neue individuelle Anfrage von <strong>{{kunde}}</strong>:</p><p>{{plaetze_count}} Plaetze<br>Anmerkungen: {{anmerkungen}}</p>', 'Anfrage ansehen', '{{admin_url}}/orders/{{order_id}}', 'admin'),
  ('admin_news', '{{betreff}}', '{{inhalt}}', '{{cta_text}}', '{{cta_url}}', 'customer');

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

### Task 6: Rename to "Petry Robotik"

**Files:**
- Modify: `src/lib/config.ts`
- Modify: `src/components/icons/Logo.tsx`
- Modify: `src/app/globals.css` (comment)
- Modify: `src/lib/theme-context.tsx` (storage key)
- Modify: `src/lib/theme-script.ts` (storage key)

- [ ] **Step 0: Delete old dashboard pages that conflict with new route structure**

Delete: `src/app/dashboard/einstellungen/`, `src/app/dashboard/messungen/`, `src/app/dashboard/projekte/`, `src/app/dashboard/roboter/`

These are demo pages from the old mock dashboard and will conflict with the new routes (facilities, orders, results, profile).

- [ ] **Step 1: Update config.ts**

Change `siteConfig.name` from `'IB Dr. Petry Robotik'` to `'Petry Robotik'`.
Change `siteConfig.company.name` from `'Ingenieurbüro Dr. Petry'` to `'Petry Robotik'`.
Update navigation to include Login link.

- [ ] **Step 2: Update Logo component text**

In `src/components/icons/Logo.tsx`, change any text references from "Dr. Petry" to "Petry Robotik".

- [ ] **Step 3: Update theme storage key**

In `src/lib/theme-context.tsx` and `src/lib/theme-script.ts`, change storage key from `'ib-drpetry-theme'` to `'petry-robotik-theme'`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: rename to Petry Robotik, add supabase foundation"
```

---

## Chunk 2: Auth & Onboarding

### Task 7: Auth Context & Hooks

**Files:**
- Create: `src/lib/auth/auth-context.tsx`
- Create: `src/lib/auth/use-profile.ts`

- [ ] **Step 1: Create auth context `src/lib/auth/auth-context.tsx`**

```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isApproved: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isApproved: profile?.is_approved ?? false,
      isAdmin: profile?.is_admin ?? false,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

- [ ] **Step 2: Add AuthProvider to root layout**

In `src/app/layout.tsx`, wrap `<ThemeProvider>` children with `<AuthProvider>`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/
git commit -m "feat: auth context with profile management"
```

---

### Task 8: Auth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create callback route**

```typescript
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if admin
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        if (profile?.is_admin) {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/auth/
git commit -m "feat: auth callback route for magic link"
```

---

### Task 9: Login Page

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Create login page**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Logo } from '@/components/icons'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Fehler beim Senden des Login-Links. Bitte versuchen Sie es erneut.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Logo />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">
            {sent ? 'Link gesendet' : 'Anmelden'}
          </h1>
        </div>

        {sent ? (
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[var(--color-success)]" />
            </div>
            <p className="text-[var(--theme-text)] mb-2">
              Wir haben einen Login-Link an
            </p>
            <p className="font-semibold text-[var(--theme-text)] mb-4">{email}</p>
            <p className="text-sm text-[var(--theme-textSecondary)]">
              Klicken Sie auf den Link in der E-Mail, um sich anzumelden.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-6 text-sm text-[var(--accent-primary)] hover:underline"
            >
              Andere E-Mail verwenden
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl p-8">
            <Input
              label="E-Mail-Adresse"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              required
              leftIcon={<Mail size={18} />}
            />
            {error && (
              <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>
            )}
            <div className="mt-6">
              <Button variant="primary" type="submit" disabled={loading || !email}>
                {loading ? 'Wird gesendet...' : 'Login-Link senden'}
              </Button>
            </div>
            <p className="mt-4 text-center text-sm text-[var(--theme-textSecondary)]">
              Noch kein Account?{' '}
              <Link href="/onboarding" className="text-[var(--accent-primary)] hover:underline">
                Jetzt registrieren
              </Link>
            </p>
          </form>
        )}

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]"
        >
          <ArrowLeft size={16} />
          Zurueck zur Startseite
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/login/
git commit -m "feat: login page with magic link"
```

---

### Task 10: Onboarding Funnel

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/components/onboarding/StepAccountType.tsx`
- Create: `src/components/onboarding/StepRegistration.tsx`
- Create: `src/components/onboarding/StepConfirmation.tsx`

- [ ] **Step 1: Create Stepper component first `src/components/ui/Stepper.tsx`**

```typescript
'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={index} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCompleted
                    ? 'bg-[var(--accent-primary)] text-white'
                    : isCurrent
                      ? 'border-2 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'border border-[var(--theme-border)] text-[var(--theme-textTertiary)]'
                  }
                `}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? <Check size={16} /> : index + 1}
              </motion.div>
              <span className={`text-sm hidden sm:block ${
                isCurrent ? 'text-[var(--theme-text)] font-medium' : 'text-[var(--theme-textTertiary)]'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px ${isCompleted ? 'bg-[var(--accent-primary)]' : 'bg-[var(--theme-border)]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create StepAccountType `src/components/onboarding/StepAccountType.tsx`**

```typescript
'use client'

import { motion } from 'framer-motion'
import { User, Building2, Users, Briefcase } from 'lucide-react'
import type { AccountType } from '@/lib/supabase/types'

const types: { value: AccountType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'private', label: 'Privat', icon: User, description: 'Privatperson' },
  { value: 'municipal', label: 'Staedtisch', icon: Building2, description: 'Kommune oder Stadt' },
  { value: 'club', label: 'Verein', icon: Users, description: 'Sportverein' },
  { value: 'company', label: 'Unternehmen', icon: Briefcase, description: 'Firma oder Organisation' },
]

interface Props {
  selected: AccountType | null
  onSelect: (type: AccountType) => void
}

export default function StepAccountType({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--theme-text)] text-center mb-2">
        Wer sind Sie?
      </h2>
      <p className="text-[var(--theme-textSecondary)] text-center mb-8">
        Waehlen Sie Ihren Account-Typ
      </p>
      <div className="grid grid-cols-2 gap-4">
        {types.map((type, i) => {
          const Icon = type.icon
          const isSelected = selected === type.value
          return (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => onSelect(type.value)}
              className={`
                p-6 rounded-xl border-2 text-center cursor-pointer transition-all
                ${isSelected
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                  : 'border-[var(--theme-border)] hover:border-[var(--theme-borderHover)]'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <Icon size={32} className={isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--theme-textSecondary)]'} />
              <p className="font-semibold text-[var(--theme-text)] mt-3">{type.label}</p>
              <p className="text-sm text-[var(--theme-textSecondary)] mt-1">{type.description}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create StepRegistration `src/components/onboarding/StepRegistration.tsx`**

```typescript
'use client'

import { Input } from '@/components/ui/Input'
import type { AccountType } from '@/lib/supabase/types'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
  position: string
  vatId: string
}

interface Props {
  accountType: AccountType
  data: FormData
  onChange: (data: FormData) => void
  errors: Record<string, string>
}

export default function StepRegistration({ accountType, data, onChange, errors }: Props) {
  const update = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const showOrg = accountType !== 'private'
  const showPosition = accountType === 'municipal' || accountType === 'company'
  const showPositionOptional = accountType === 'club'
  const showVat = accountType === 'company'

  const orgLabel = accountType === 'municipal' ? 'Kommune / Stadt' :
    accountType === 'club' ? 'Vereinsname' : 'Firmenname'

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--theme-text)] text-center mb-2">
        Ihre Daten
      </h2>
      <p className="text-[var(--theme-textSecondary)] text-center mb-8">
        Bitte fuellen Sie die erforderlichen Felder aus
      </p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Vorname *" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} error={errors.firstName} />
          <Input label="Nachname *" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} error={errors.lastName} />
        </div>
        <Input label="E-Mail *" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
        <Input label="Telefon (optional)" type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} />
        {showOrg && (
          <Input label={`${orgLabel} *`} value={data.organization} onChange={(e) => update('organization', e.target.value)} error={errors.organization} />
        )}
        {(showPosition || showPositionOptional) && (
          <Input label={`Position / Rolle${showPositionOptional ? ' (optional)' : ' *'}`} value={data.position} onChange={(e) => update('position', e.target.value)} error={errors.position} />
        )}
        {showVat && (
          <Input label="USt-IdNr *" value={data.vatId} onChange={(e) => update('vatId', e.target.value)} error={errors.vatId} placeholder="DE123456789" />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create StepConfirmation `src/components/onboarding/StepConfirmation.tsx`**

```typescript
'use client'

import { Mail } from 'lucide-react'

interface Props {
  email: string
  onResend: () => void
  resending: boolean
}

export default function StepConfirmation({ email, onResend, resending }: Props) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
        <Mail className="w-8 h-8 text-[var(--color-success)]" />
      </div>
      <h2 className="text-xl font-bold text-[var(--theme-text)] mb-2">
        Bestaetigung
      </h2>
      <p className="text-[var(--theme-textSecondary)] mb-2">
        Wir haben einen Magic Link an
      </p>
      <p className="font-semibold text-[var(--theme-text)] mb-4">{email}</p>
      <p className="text-sm text-[var(--theme-textSecondary)] mb-6">
        Klicken Sie auf den Link in der E-Mail, um Ihr Konto zu aktivieren.
      </p>
      <button
        onClick={onResend}
        disabled={resending}
        className="text-sm text-[var(--accent-primary)] hover:underline disabled:opacity-50"
      >
        {resending ? 'Wird gesendet...' : 'Link nicht erhalten? Erneut senden'}
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Create onboarding page `src/app/onboarding/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/icons'
import Stepper from '@/components/ui/Stepper'
import Button from '@/components/ui/Button'
import StepAccountType from '@/components/onboarding/StepAccountType'
import StepRegistration from '@/components/onboarding/StepRegistration'
import StepConfirmation from '@/components/onboarding/StepConfirmation'
import type { AccountType } from '@/lib/supabase/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const steps = [
  { label: 'Typ waehlen' },
  { label: 'Daten' },
  { label: 'Bestaetigung' },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    organization: '', position: '', vatId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const supabase = createClient()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName) newErrors.firstName = 'Pflichtfeld'
    if (!formData.lastName) newErrors.lastName = 'Pflichtfeld'
    if (!formData.email) newErrors.email = 'Pflichtfeld'
    if (accountType !== 'private' && !formData.organization) newErrors.organization = 'Pflichtfeld'
    if ((accountType === 'municipal' || accountType === 'company') && !formData.position) newErrors.position = 'Pflichtfeld'
    if (accountType === 'company' && !formData.vatId) newErrors.vatId = 'Pflichtfeld'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (currentStep === 0 && !accountType) return
    if (currentStep === 1) {
      if (!validate()) return
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: accountType,
            phone: formData.phone || null,
            organization: formData.organization || null,
            position: formData.position || null,
            vat_id: formData.vatId || null,
          },
        },
      })
      setLoading(false)
      if (error) {
        setErrors({ email: 'Fehler bei der Registrierung. Bitte versuchen Sie es erneut.' })
        return
      }
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handleResend = async () => {
    setResending(true)
    await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4">
            <Logo />
          </Link>
        </div>

        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xl p-8">
          <Stepper steps={steps} currentStep={currentStep} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <StepAccountType selected={accountType} onSelect={setAccountType} />
              )}
              {currentStep === 1 && (
                <StepRegistration
                  accountType={accountType!}
                  data={formData}
                  onChange={setFormData}
                  errors={errors}
                />
              )}
              {currentStep === 2 && (
                <StepConfirmation
                  email={formData.email}
                  onResend={handleResend}
                  resending={resending}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {currentStep < 2 && (
            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-4 py-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]"
                >
                  Zurueck
                </button>
              ) : <div />}
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={loading || (currentStep === 0 && !accountType)}
              >
                {loading ? 'Wird gesendet...' : 'Weiter'}
              </Button>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--theme-textSecondary)] hover:text-[var(--theme-text)]"
        >
          <ArrowLeft size={16} />
          Zurueck zur Startseite
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/onboarding/ src/components/onboarding/ src/components/ui/Stepper.tsx
git commit -m "feat: onboarding funnel with 3-step wizard"
```

---

## Chunk 3: UI Components & Dashboard Shell

### Task 11: Core UI Components

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Dropdown.tsx`
- Create: `src/components/ui/Table.tsx`
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/StatusBadge.tsx`
- Create: `src/components/ui/PriceDisplay.tsx`
- Create: `src/components/ui/BlurredOverlay.tsx`
- Create: `src/components/ui/NotificationBell.tsx`
- Create: `src/components/ui/FileUpload.tsx`
- Create: `src/components/ui/Calendar.tsx`
- Create: `src/components/ui/MapPicker.tsx`

Each component follows existing patterns:
- `'use client'` directive
- CSS variables for theming (never hardcoded colors)
- Framer Motion for animations
- forwardRef where appropriate
- TypeScript interfaces for props

Detailed implementation for each component:

- [ ] **Step 1: Modal** - Overlay with backdrop blur, AnimatePresence, close on ESC/backdrop click, portal to body
- [ ] **Step 2: Dropdown** - Select-like component with options list, keyboard navigation, uses Modal pattern for overlay
- [ ] **Step 3: Table** - Generic table with sortable columns, optional pagination, filter props. Renders `<table>` with CSS variable styling
- [ ] **Step 4: Tabs** - Tab bar with underline indicator, motion.div for sliding indicator, controlled via `activeTab` prop
- [ ] **Step 5: Toast** - Toast notifications using a context/provider pattern. Types: success, error, info, warning. Auto-dismiss after 5s. Stacks at bottom-right
- [ ] **Step 6: EmptyState** - Centered icon + title + description + optional action button. Used when lists are empty
- [ ] **Step 7: StatusBadge** - Maps OrderStatus to color variant of existing Badge component. `requested`=warning, `confirmed`=info, `scheduled`=primary, `measuring`=warning, `completed`=success, `rejected`=error, `individual_request`=default
- [ ] **Step 8: PriceDisplay** - Shows formatted price (cents to EUR) or placeholder "---,-- EUR" with CSS blur when `isApproved` is false. Never renders real price when not approved
- [ ] **Step 9: BlurredOverlay** - Absolute positioned overlay with blur + lock icon + message. Used on restricted sections for unapproved users
- [ ] **Step 10: NotificationBell** - Bell icon with unread count badge. Dropdown with notification list on click. Subscribes to Supabase Realtime on notifications table
- [ ] **Step 11: FileUpload** - Drag&drop zone with file input fallback. Shows upload progress. Accepts file type filter prop. Uploads to Supabase Storage
- [ ] **Step 12: Calendar** - Month view calendar grid. Props: `availableDates`, `blockedDates`, `bookedDates`, `selectedDate`, `onSelect`. Color-coded cells
- [ ] **Step 13: MapPicker** - Leaflet map with draggable marker. Address search input using Nominatim API. Returns `{lat, lng, address}` on change. Wrapped in `dynamic()` with `ssr: false`. **Important:** Add `@import url('https://unpkg.com/leaflet@1.9/dist/leaflet.css');` to `globals.css` for map tile styling

- [ ] **Step 14: Commit**

```bash
git add src/components/ui/
git commit -m "feat: core UI component library"
```

---

### Task 12: Dashboard & Admin Shell

**Files:**
- Create: `src/components/layout/DashboardShell.tsx`
- Create: `src/components/layout/AdminShell.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Create: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create shared Sidebar `src/components/layout/Sidebar.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface SidebarProps {
  items: NavItem[]
  title: string
}

export default function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen border-r border-[var(--theme-border)] bg-[var(--theme-surface)] flex flex-col">
      <div className="p-6 border-b border-[var(--theme-border)]">
        <h2 className="text-sm font-semibold text-[var(--theme-textSecondary)] uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          // Exact match for root items (/dashboard, /admin), prefix match for sub-items
          const isActive = item.href.split('/').length <= 2
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'text-[var(--theme-textSecondary)] hover:bg-[var(--theme-surfaceHover)] hover:text-[var(--theme-text)]'
                  }
                `}
                whileHover={{ x: 2 }}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-primary)] text-white">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Create DashboardShell `src/components/layout/DashboardShell.tsx`**

```typescript
'use client'

import { LayoutDashboard, MapPin, ClipboardList, BarChart3, MessageSquare, User, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import { Logo } from '@/components/icons'
import { ThemeToggle } from '@/components/ui'
import NotificationBell from '@/components/ui/NotificationBell'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'

const navItems = [
  { label: 'Uebersicht', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sportanlagen', href: '/dashboard/facilities', icon: MapPin },
  { label: 'Auftraege', href: '/dashboard/orders', icon: ClipboardList },
  { label: 'Ergebnisse', href: '/dashboard/results', icon: BarChart3 },
  { label: 'Nachrichten', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profil', href: '/dashboard/profile', icon: User },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut, isApproved } = useAuth()

  return (
    <div className="flex min-h-screen bg-[var(--theme-background)]">
      <Sidebar items={navItems} title="Dashboard" />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {!isApproved && (
              <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/30">
                Account wird geprueft
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[var(--theme-textSecondary)]">
                {profile?.first_name} {profile?.last_name}
              </span>
              <button
                onClick={signOut}
                className="text-[var(--theme-textTertiary)] hover:text-[var(--color-error)] text-xs"
              >
                Abmelden
              </button>
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create AdminShell** — Same structure as DashboardShell but with admin navigation items:

```
navItems = [
  { label: 'Uebersicht', href: '/admin', icon: LayoutDashboard },
  { label: 'Nutzer', href: '/admin/users', icon: Users },
  { label: 'Auftraege', href: '/admin/orders', icon: ClipboardList },
  { label: 'Pakete', href: '/admin/packages', icon: Package },
  { label: 'Platzarten', href: '/admin/facility-types', icon: MapPin },
  { label: 'Preise', href: '/admin/pricing', icon: CreditCard },
  { label: 'Termine', href: '/admin/schedule', icon: CalendarDays },
  { label: 'Ergebnisse', href: '/admin/results', icon: BarChart3 },
  { label: 'Nachrichten', href: '/admin/notifications', icon: Bell },
  { label: 'E-Mail Templates', href: '/admin/email-templates', icon: Mail },
]
```

- [ ] **Step 4: Update dashboard layout `src/app/dashboard/layout.tsx`**

Note: AuthProvider is added ONCE in root `src/app/layout.tsx` (Task 7, Step 2). Do NOT add it again here.

```typescript
import DashboardShell from '@/components/layout/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  )
}
```

Note: Remove Header/Footer from dashboard — DashboardShell replaces them. The root `layout.tsx` LayoutWrapper (Header+Footer) should only render on public pages. Modify `src/components/layout/LayoutWrapper.tsx` to check `usePathname()` and skip Header/Footer for `/dashboard` and `/admin` routes.

- [ ] **Step 5: Create admin layout `src/app/admin/layout.tsx`**

```typescript
import AdminShell from '@/components/layout/AdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/dashboard/layout.tsx src/app/admin/
git commit -m "feat: dashboard and admin shell with sidebar navigation"
```

---

## Chunk 4: Dashboard Pages

### Task 13: Dashboard Overview

**Files:**
- Rewrite: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Dashboard overview page**

Shows stat cards (Anlagen count, active orders, new results), recent orders list, recent messages. Uses `createServerSupabaseClient()` for data fetching. Falls back to EmptyState when no data.

- [ ] **Step 2: Commit**

---

### Task 14: Profile Page

**Files:**
- Create: `src/app/dashboard/profile/page.tsx`

- [ ] **Step 1: Profile page with editable form**

Loads profile data, shows form with all fields from profiles table. Billing address toggle (same or different). Save via supabase update. Uses Input components.

- [ ] **Step 2: Commit**

---

### Task 15: Facilities CRUD

**Files:**
- Create: `src/app/dashboard/facilities/page.tsx`
- Create: `src/app/dashboard/facilities/new/page.tsx`
- Create: `src/app/dashboard/facilities/[id]/page.tsx`

- [ ] **Step 1: Facilities list page** — Table with all user's facilities. Name, type, address, grid. Link to edit. "Neue Anlage" button.

- [ ] **Step 2: New facility page** — Form with all fields from spec: name, type (Dropdown from facility_types), MapPicker for location, length/width inputs, mast count, light count, light type radio, measurement grid radio. Save to supabase.

- [ ] **Step 3: Edit facility page** — Same form, pre-filled. Update + Delete.

- [ ] **Step 4: Commit**

---

### Task 16: Messauftrags-Konfigurator

**Files:**
- Rewrite: `src/app/dashboard/orders/new/page.tsx` (was under old structure)
- Create: `src/components/orders/StepSelectFacilities.tsx`
- Create: `src/components/orders/StepSelectPackages.tsx`
- Create: `src/components/orders/StepSelectDate.tsx`
- Create: `src/components/orders/StepCalculation.tsx`
- Create: `src/components/orders/StepSummary.tsx`
- Create: `src/components/orders/StepIndividualRequest.tsx`

- [ ] **Step 1: StepSelectFacilities** — Checkbox list of user's facilities. Option to create new inline. Stores selected facility IDs.

- [ ] **Step 2: StepSelectPackages** — For each selected facility, show package cards (from packages table). Store package selection per facility.

- [ ] **Step 3: StepSelectDate** — Calendar component showing available dates. Loads schedule_templates + schedule_overrides + bookings to calculate availability. Only renders if <=3 facilities.

- [ ] **Step 4: StepCalculation** — Loads pricing_rules. Calculates per-item prices + discount. Shows PriceDisplay (blurred if not approved). Only renders if <=3 facilities.

- [ ] **Step 5: StepIndividualRequest** — Shown instead of Steps 3+4 when >3 facilities. Message: "Individuelle Anfrage". Optional notes textarea.

- [ ] **Step 6: StepSummary** — All selected facilities + packages + date + price. AGB checkbox. Submit button. Creates order + order_items + booking in supabase.

- [ ] **Step 7: Konfigurator page** — Stepper with conditional steps. Uses `useState` to track selections across steps.

- [ ] **Step 8: Commit**

---

### Task 17: Orders List & Detail

**Files:**
- Create: `src/app/dashboard/orders/page.tsx`
- Create: `src/app/dashboard/orders/[id]/page.tsx`
- Create: `src/components/chat/ChatWindow.tsx`
- Create: `src/components/chat/ChatBubble.tsx`

- [ ] **Step 1: Orders list** — Table with order_number, status (StatusBadge), date, price. Link to detail. EmptyState if none.

- [ ] **Step 2: ChatBubble** — Single message. Left-aligned (other) or right-aligned (self). Shows sender name, timestamp, content. File type shows download link. System type shows centered italic text.

- [ ] **Step 3: ChatWindow** — Scrollable message list + input bar. Subscribes to Supabase Realtime `messages` table filtered by order_id. Marks messages as read (customer_read_at). File upload via clip icon using FileUpload.

- [ ] **Step 4: Order detail page** — Split layout: left = order info (facilities, packages, date, price, status), right = ChatWindow. Results section at bottom if available.

- [ ] **Step 5: Commit**

---

### Task 18: Results & Notifications Pages

**Files:**
- Create: `src/app/dashboard/results/page.tsx`
- Create: `src/app/dashboard/results/[id]/page.tsx`
- Create: `src/app/dashboard/notifications/page.tsx`

- [ ] **Step 1: Results list** — Cards per order with results. Shows order number, facility name, date, download count. EmptyState if none.

- [ ] **Step 2: Result detail** — Shows JSON data if available (formatted), file downloads list, admin note.

- [ ] **Step 3: Notifications page** — Full list of all notifications. Mark as read on view. Group by date.

- [ ] **Step 4: Commit**

---

## Chunk 5: Admin Dashboard

### Task 19: Admin Overview

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Admin dashboard** — KPI cards (total users, pending approval, open orders). Pending approvals list with quick-approve buttons. Recent orders list. Uses server-side data fetching.

- [ ] **Step 2: Commit**

---

### Task 20: Admin User Management

**Files:**
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/users/[id]/page.tsx`

- [ ] **Step 1: Users list** — Table with name, email, type, status (approved/pending/suspended), registered date. Filter dropdown. Pagination.

- [ ] **Step 2: User detail** — Profile info display. Approve/Suspend buttons. Linked facilities and orders count. Message button (creates notification).

- [ ] **Step 3: Approve action** — Updates `profiles.is_approved = true`. Creates notification for user. Sends approval email.

- [ ] **Step 4: Commit**

---

### Task 21: Admin Packages & Facility Types & Pricing

**Files:**
- Create: `src/app/admin/packages/page.tsx`
- Create: `src/app/admin/facility-types/page.tsx`
- Create: `src/app/admin/pricing/page.tsx`

- [ ] **Step 1: Packages page** — CRUD list. Card per package with name, description, price, grid size, features. Modal for create/edit. Activate/deactivate toggle.

- [ ] **Step 2: Facility types page** — CRUD list. Simple table with name, icon, sort order. Inline edit. Add button.

- [ ] **Step 3: Pricing page** — Table of pricing rules. Min/max facilities, discount %, individual flag. Add/edit/delete.

- [ ] **Step 4: Commit**

---

### Task 22: Admin Schedule Management

**Files:**
- Create: `src/app/admin/schedule/page.tsx`

- [ ] **Step 1: Schedule page** — Two sections: (1) Weekly template with day rows, time inputs, active toggle. Save button. (2) Overrides list with date range, times, blocked flag, label. Add override modal. Calendar preview showing merged view.

- [ ] **Step 2: Commit**

---

### Task 23: Admin Orders & Results & Chat

**Files:**
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/[id]/page.tsx`
- Create: `src/app/admin/results/page.tsx`

- [ ] **Step 1: Admin orders list** — Table of all orders. Customer name, order number, status, date, price. Filter by status. Unread message indicator per order.

- [ ] **Step 2: Admin order detail** — Full order info. Status change dropdown. Admin notes textarea. Booking management (assign time slot). Chat window (same ChatWindow component, admin_read_at). Reject button with confirmation modal.

- [ ] **Step 3: Admin results page** — Select order dropdown. Upload files (FileUpload to Supabase Storage). JSON data input. Admin note. "Save & notify customer" button.

- [ ] **Step 4: Commit**

---

### Task 24: Admin Notifications & Email Templates

**Files:**
- Create: `src/app/admin/notifications/page.tsx`
- Create: `src/app/admin/email-templates/page.tsx`

- [ ] **Step 1: Admin notifications page** — Form to send news/message to all users or single user. User selector dropdown. Subject + message body.

- [ ] **Step 2: Email templates page** — List of all templates by key. Click to edit. Edit form: subject, body (HTML textarea), CTA text, CTA URL. Available variables hint. Preview button (renders in iframe). Test mail button.

- [ ] **Step 3: Commit**

---

## Chunk 6: Notification & Email System

### Task 25: Notification Service

**Files:**
- Create: `src/lib/notifications/service.ts`
- Create: `src/lib/notifications/events.ts`

- [ ] **Step 1: Create notification service `src/lib/notifications/service.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  body?: string
  link?: string
}

// Uses service role client to bypass RLS (inserting for other users)
export async function createNotification(params: CreateNotificationParams) {
  const supabase = createAdminClient()
  await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    link: params.link ?? null,
    is_read: false,
  })
}

export async function createAdminNotification(params: Omit<CreateNotificationParams, 'userId'>) {
  const supabase = createAdminClient()
  // Find admin user
  const { data: admin } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_admin', true)
    .single()

  if (admin) {
    await createNotification({ ...params, userId: admin.id })
  }
}
```

- [ ] **Step 2: Create event handlers `src/lib/notifications/events.ts`**

Maps each event from the notification matrix to notification + email calls. Functions:
- `onUserRegistered(userId)` — Admin notification + admin email
- `onAccountApproved(userId)` — Customer notification + email
- `onAccountSuspended(userId)` — Customer notification + email
- `onOrderReceived(orderId)` — Admin notification + email
- `onOrderConfirmed(orderId)` — Customer notification + email
- `onOrderRejected(orderId)` — Customer notification + email
- `onOrderStatusChanged(orderId, newStatus)` — Customer notification + email
- `onNewMessage(messageId)` — Recipient notification + email (throttled)
- `onResultsAvailable(resultId)` — Customer notification + email
- `onIndividualRequest(orderId)` — Admin notification + email

- [ ] **Step 3: Commit**

---

### Task 26: Email Service

**Files:**
- Create: `src/lib/email/service.ts`
- Create: `src/lib/email/base-template.ts`
- Create: `src/app/api/email/send/route.ts`

- [ ] **Step 1: Create base email template `src/lib/email/base-template.ts`**

HTML template string with:
- Orange gradient header bar
- "Petry Robotik" logo text
- `{{content}}` placeholder
- Optional CTA button
- Footer with company info + legal links
- Responsive, system fonts, inline CSS (email-safe)

- [ ] **Step 2: Create email service `src/lib/email/service.ts`**

```typescript
import nodemailer from 'nodemailer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { renderBaseTemplate } from './base-template'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface SendEmailParams {
  to: string
  templateKey: string
  variables: Record<string, string>
}

export async function sendTemplateEmail({ to, templateKey, variables }: SendEmailParams) {
  const supabase = await createServerSupabaseClient()
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .single()

  if (!template) return

  // Replace variables
  let subject = template.subject
  let body = template.body
  let ctaText = template.cta_text
  let ctaUrl = template.cta_url

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`
    subject = subject.replaceAll(placeholder, value)
    body = body.replaceAll(placeholder, value)
    if (ctaText) ctaText = ctaText.replaceAll(placeholder, value)
    if (ctaUrl) ctaUrl = ctaUrl.replaceAll(placeholder, value)
  }

  const html = renderBaseTemplate({
    content: body,
    ctaText: ctaText ?? undefined,
    ctaUrl: ctaUrl ?? undefined,
  })

  await transporter.sendMail({
    from: `"Petry Robotik" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/ src/lib/notifications/
git commit -m "feat: notification and email service with template system"
```

---

### Task 27: Wire Up Notification Events

**Files:**
- Modify: Various API routes and server actions

- [ ] **Step 1: Add notification triggers to key actions**

- User registration → `onUserRegistered()` in auth callback
- Admin approves user → `onAccountApproved()` in admin user action
- Order submitted → `onOrderReceived()` in konfigurator submit
- Order status change → `onOrderStatusChanged()` in admin order actions
- New message → `onNewMessage()` in chat message insert
- Results uploaded → `onResultsAvailable()` in admin results action

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: wire notification events to all actions"
```

---

### Task 28: Supabase Storage Setup

- [ ] **Step 1: Create storage buckets**

Run via `mcp__supabase__execute_sql`:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('results', 'results', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', false);

-- RLS for results bucket
CREATE POLICY "Admin can upload results" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'results' AND (SELECT is_admin FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own results" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'results' AND (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM result_files rf
        JOIN results r ON r.id = rf.result_id
        JOIN orders o ON o.id = r.order_id
        WHERE rf.file_url LIKE '%' || name AND o.user_id = auth.uid()
      )
    )
  );

-- RLS for chat-files bucket
CREATE POLICY "Authenticated can upload chat files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can view chat files" ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);
```

---

### Task 29: Create Admin Account

- [ ] **Step 1: Create admin user**

After deployment, manually create admin via Supabase dashboard:
1. Create user in Auth with Petry's email
2. Update profiles: `UPDATE profiles SET is_admin = TRUE, is_approved = TRUE WHERE email = 'admin@petry-robotik.de'`

Or via seed migration with `mcp__supabase__execute_sql`.

---

### Task 30: Final Integration & Build Verification

- [ ] **Step 1: Update `next.config.ts`** for Leaflet/image domains if needed
- [ ] **Step 2: Run `npm run build`** — fix any TypeScript errors
- [ ] **Step 3: Test full flow locally** — Register → Login → Dashboard → Create facility → Create order
- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Petry Robotik Kundenportal v1"
```

---

## Summary

| Chunk | Tasks | Beschreibung |
|-------|-------|-------------|
| 1 | 1-6 | Foundation: Dependencies, Supabase Client, DB Schema, RLS, Seeds, Rename |
| 2 | 7-10 | Auth: Context, Callback, Login, Onboarding Funnel |
| 3 | 11-12 | UI Components + Dashboard/Admin Shell |
| 4 | 13-18 | Dashboard: Overview, Profile, Facilities, Konfigurator, Orders, Results |
| 5 | 19-24 | Admin: Overview, Users, Packages, Schedule, Orders, Templates |
| 6 | 25-30 | Systems: Notifications, Email, Storage, Admin Account, Final Build |

**Geschätzte Reihenfolge:** Chunk 1 → 2 → 3 → 4 → 5 → 6 (sequentiell, da Abhängigkeiten)

**Parallelisierbar:** Tasks innerhalb Chunk 4 (Dashboard-Seiten) und Chunk 5 (Admin-Seiten) können parallel von Subagenten bearbeitet werden.
