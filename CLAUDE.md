# CLAUDE.md - Dr. Petry Robotik

Projektanleitung für Claude Code. Dieses Projekt nutzt den gleichen Tech-Stack wie die Bookicorn Website.

---

## 🛠️ Tech Stack Übersicht

### Core Framework
- **Next.js 15+** (App Router) - React Framework mit Server Components
- **TypeScript** - Typsicherheit
- **Tailwind CSS v4** - Utility-first CSS Framework
- **Framer Motion** - Animationen

### Content Management
- **Sanity CMS** - Headless CMS für Blog, Docs, etc.
- **@sanity/image-url** - Bildoptimierung
- **@portabletext/react** - Rich Text Rendering

### Deployment & Hosting
- **Vercel** - Hosting & CI/CD
- **GitHub** - Version Control

### Email (optional)
- **Nodemailer** - SMTP Email-Versand
- **@types/nodemailer** - TypeScript Types

---

## 📁 Projektstruktur

```
src/
├── app/                      # Next.js App Router Pages
│   ├── layout.tsx           # Root Layout mit Header/Footer
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Globale Styles & CSS Variables
│   ├── api/                 # API Routes
│   │   └── contact/         # Kontaktformular API
│   ├── blog/                # Blog
│   │   ├── page.tsx         # Blog Übersicht
│   │   └── [slug]/page.tsx  # Blog Detail
│   ├── docs/                # Dokumentation
│   ├── about/               # Über uns
│   ├── contact/             # Kontakt
│   ├── features/            # Features
│   └── pricing/             # Preise
│
├── components/
│   ├── ui/                  # Wiederverwendbare UI Components
│   │   ├── Button.tsx       # Button mit Variants
│   │   ├── ThemeToggle.tsx  # Dark/Light Mode Toggle
│   │   └── ...
│   ├── layout/              # Layout Components
│   │   ├── Header.tsx       # Navigation Header
│   │   └── Footer.tsx       # Footer
│   ├── landing/             # Landing Page Sections
│   │   ├── FinalCTA.tsx     # Call-to-Action Section
│   │   └── ...
│   ├── blog/                # Blog Components
│   │   ├── BlockRenderers.tsx
│   │   └── blocks/          # Portable Text Blocks
│   └── icons/               # SVG Icons & Logo
│       └── [ProjectName]Logo.tsx
│
├── lib/                     # Utilities & Config
│   ├── config.ts            # App Configuration
│   └── theme-context.tsx    # Theme Provider (Dark/Light)
│
└── sanity/                  # Sanity CMS Integration
    ├── lib/
    │   ├── client.ts        # Sanity Client
    │   ├── queries.ts       # GROQ Queries
    │   └── image.ts         # Image URL Builder
    └── schemas/             # Content Schemas
```

---

## 🎨 Design System

### Brand Farben (ANPASSEN!)
```css
/* Bookicorn Farben - ERSETZEN mit Dr. Petry Robotik Farben */
--brand-primary: #EE4035;    /* Rot */
--brand-secondary: #2D61F0;  /* Blau */
--brand-accent: #A6D30F;     /* Lime/Grün */

/* Gradient */
background: linear-gradient(135deg, #EE4035 0%, #2D61F0 50%, #A6D30F 100%);
```

### Theme System (CSS Variables)
```css
/* Light Mode */
:root {
  --theme-background: #ffffff;
  --theme-surface: #f9fafb;
  --theme-surfaceHover: #f3f4f6;
  --theme-text: rgb(41, 41, 41);
  --theme-textSecondary: #6b7280;
  --theme-textTertiary: #9ca3af;
  --theme-border: #e5e7eb;
}

/* Dark Mode */
.dark {
  --theme-background: #09090b;
  --theme-surface: #121215;
  --theme-surfaceHover: #1a1a1f;
  --theme-text: #f5f5f5;
  --theme-textSecondary: #a1a1a1;
  --theme-textTertiary: #737373;
  --theme-border: #2a2a2a;
}
```

### Verwendung in Components
```tsx
// IMMER CSS Variables nutzen, nie hardcodierte Farben!
<div className="bg-[var(--theme-surface)] text-[var(--theme-text)] border-[var(--theme-border)]">
  Content
</div>

// Brand-Farben für Akzente
<div className="bg-gradient-to-r from-[#EE4035] via-[#2D61F0] to-[#A6D30F]">
  Gradient
</div>
```

---

## 🧩 Wichtige Components

### Button Component
```tsx
import Button from '@/components/ui/Button'

// Variants: primary, secondary, ghost
<Button variant="primary" size="lg">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
```

### Theme Toggle
```tsx
import ThemeToggle from '@/components/ui/ThemeToggle'

// Automatisch in Header eingebunden
<ThemeToggle />
```

### Logo Component
```tsx
// Logo sollte Light/Dark Mode unterstützen
import Logo from '@/components/icons/Logo'

<Logo className="h-8 w-auto" />
```

---

## 🌐 Sanity CMS Setup

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### Sanity Client (sanity/lib/client.ts)
```typescript
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2024-01-01',
})
```

### GROQ Queries (sanity/lib/queries.ts)
```typescript
export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  category->{title, slug, color}
}`
```

---

## 📧 Email Setup (Nodemailer)

### Environment Variables
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@example.com
EMAIL_TO=recipient@example.com
```

### API Route (app/api/contact/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `"Website" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    subject: 'Neue Kontaktanfrage',
    html: `...`,
  })

  return NextResponse.json({ success: true })
}
```

---

## 🎬 Animationen (Framer Motion)

### Fade In Animation
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  Content
</motion.div>
```

### Staggered Animation (Cards)
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + i * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

---

## 📦 Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@sanity/client": "^6.0.0",
    "@sanity/image-url": "^1.0.0",
    "@portabletext/react": "^3.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/nodemailer": "^6.4.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 🚀 Projekt starten

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Production Build
npm run build

# Deploy (via Git Push zu Vercel)
git add -A && git commit -m "feat: ..." && git push
```

---

## ✅ Checkliste für neues Projekt

- [ ] Logo erstellen (`components/icons/[ProjectName]Logo.tsx`)
- [ ] Brand-Farben definieren und in `globals.css` anpassen
- [ ] Sanity Projekt erstellen und ENV vars setzen
- [ ] Email SMTP konfigurieren (falls benötigt)
- [ ] Vercel Projekt erstellen und mit GitHub verbinden
- [ ] Domain verbinden

---

## 🚨 Wichtige Regeln

1. **IMMER CSS Variables für Theme nutzen** - nie hardcodierte Farben für Text/Background
2. **Deutsche UI** - Alle Texte auf Deutsch
3. **Dark Mode Support** - Alle Components müssen in beiden Modi funktionieren
4. **Mobile First** - Responsive Design
5. **Keine Emojis** - außer explizit gewünscht
6. **TypeScript** - Alle Files in .tsx/.ts
