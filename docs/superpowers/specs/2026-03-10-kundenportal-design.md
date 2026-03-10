# Petry Robotik — Kundenportal mit Messauftrags-Konfigurator

**Datum:** 2026-03-10
**Deadline:** 2026-03-12 (vorzeigbar)
**Umbenennung:** Dr. Petry Robotik → Petry Robotik

---

## 1. Architektur

### Tech-Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS v4, Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Email:** Nodemailer mit Templates aus DB
- **Karten:** Leaflet + OpenStreetMap
- **Hosting:** Vercel

### Routenstruktur

```
/                         → Public Website (steht, keine Änderungen)
/onboarding               → Multistep-Registrierung
/login                    → Magic Link Login

/dashboard                → Kunden-Übersicht
/dashboard/profile        → Stammdaten & Rechnungsadresse
/dashboard/facilities     → Sportanlagen (Liste)
/dashboard/facilities/new → Neue Anlage
/dashboard/facilities/[id]→ Anlage bearbeiten
/dashboard/orders         → Aufträge (Liste)
/dashboard/orders/new     → Messauftrags-Konfigurator
/dashboard/orders/[id]    → Detail + Chat
/dashboard/results        → Ergebnisse (Liste)
/dashboard/results/[id]   → Ergebnis-Detail + Downloads
/dashboard/notifications  → Alle Benachrichtigungen

/admin                    → Admin-Übersicht (KPIs)
/admin/users              → Nutzer verwalten
/admin/users/[id]         → Nutzer-Detail
/admin/orders             → Alle Aufträge
/admin/orders/[id]        → Auftrags-Detail + Chat
/admin/packages           → Pakete (Silber/Gold/...)
/admin/facility-types     → Platzarten
/admin/pricing            → Mengenrabatt-Staffeln
/admin/schedule           → Verfügbarkeit / Wochenplan
/admin/results            → Ergebnisse hochladen
/admin/notifications      → Nachrichten an Kunden
/admin/email-templates    → E-Mail Templates
```

### Drei Bereiche

| Bereich | Auth | Approved | Admin |
|---------|------|----------|-------|
| Public (/, /onboarding, /login) | - | - | - |
| Dashboard (/dashboard/*) | x | - | - |
| Dashboard Anlagen (/dashboard/facilities/*) | x | - | - |
| Dashboard Aufträge erstellen (/dashboard/orders/new) | x | x | - |
| Admin (/admin/*) | x | - | x |

Hinweis: Unapproved User können Sportanlagen anlegen/bearbeiten, aber keine Aufträge erstellen. Preise werden nicht geladen (Platzhalter "---,-- EUR" mit Blur-Effekt).

---

## 2. Design System & Shared Components

### Bestehende Components (beibehalten)

- Button.tsx (primary, secondary, ghost)
- Badge.tsx
- Card.tsx
- Input.tsx
- ThemeToggle.tsx

### Neue Components

| Component | Verwendung |
|-----------|-----------|
| Modal.tsx | Dialoge, Bestätigungen |
| Dropdown.tsx | Selects, Menüs |
| Table.tsx | Datentabellen (sortierbar, filterbar) |
| Tabs.tsx | Tab-Navigation |
| Stepper.tsx | Onboarding + Konfigurator Wizard |
| Calendar.tsx | Terminwahl |
| MapPicker.tsx | Leaflet/OSM Standort-Picker |
| FileUpload.tsx | Drag&Drop Upload |
| BlurredOverlay.tsx | Gesperrte Bereiche |
| ChatBubble.tsx | Einzelne Nachricht |
| ChatWindow.tsx | Chat-Container mit Realtime |
| NotificationBell.tsx | Glocke + Dropdown + Zähler |
| StatusBadge.tsx | Auftrags-Status farbig |
| PriceDisplay.tsx | Preis oder geblurred |
| EmptyState.tsx | Leerzustände |
| Toast.tsx | Erfolg/Fehler-Meldungen |

### Layout Components

| Component | Beschreibung |
|-----------|-------------|
| DashboardShell.tsx | Sidebar + Content, Kunden-Navigation |
| AdminShell.tsx | Sidebar + Content, Admin-Navigation |

---

## 3. Onboarding-Funnel

### Step 1 — Wer bist du?

4 Karten mit Icons:
- Privat
- Städtisch
- Verein
- Unternehmen

### Step 2 — Registrierungsdaten (dynamisch)

| Feld | Privat | Städtisch | Verein | Unternehmen |
|------|--------|-----------|--------|-------------|
| Vorname* | x | x | x | x |
| Nachname* | x | x | x | x |
| E-Mail* | x | x | x | x |
| Telefon | optional | optional | optional | optional |
| Organisation/Firma* | - | Kommune/Stadt | Vereinsname | Firmenname |
| Position/Rolle | - | Pflicht | optional | Pflicht |
| USt-IdNr* | - | - | - | x |

### Step 3 — Magic Link Bestätigung

- E-Mail mit Magic Link versenden (Supabase Auth)
- "Link nicht erhalten? Erneut senden" Button
- Nach Klick: Redirect zu /dashboard
- profiles.is_approved = false

### Nach Registrierung (nicht freigeschaltet)

- Dashboard sichtbar
- Preise NICHT geladen - stattdessen Platzhalter "---,-- EUR" mit CSS blur-Effekt (keine echten Werte, auch nicht im DOM)
- Messauftrag gesperrt mit Hinweis "Ihr Account wird geprüft"
- Sportanlagen anlegen geht bereits
- Admin bekommt E-Mail + In-App Notification

---

## 4. Kunden-Dashboard

### Übersicht (/dashboard)

- Statistik-Karten: Anlagen, aktive Aufträge, neue Ergebnisse
- Liste aktuelle Aufträge mit Status
- Neue Nachrichten (letzte Chat-Nachrichten)

### Stammdaten (/dashboard/profile)

- Name, Adresse, Account-Typ, Organisation
- Rechnungsanschrift (gleich oder abweichend)

### Sportanlagen (/dashboard/facilities)

Pro Anlage:
- Name
- Art (Dropdown aus facility_types, Admin-pflegbar)
- Standort: Adresssuche + Leaflet-Karte mit verschiebbarem Pin
- Außenmaße: Länge und Breite in Metern
- Beleuchtung: Mastanzahl, Leuchtenanzahl, LED/konventionell
- Messraster: 5m oder 10m

### Messauftrags-Konfigurator (/dashboard/orders/new)

5-Step Wizard (Stepper-Component):

**Step 1: Plätze auswählen**
- Checkbox-Liste aller angelegten Anlagen
- Option: neue Anlage direkt anlegen

**Step 2: Paket pro Platz**
- Für jeden gewählten Platz: Silber oder Gold wählen
- Paketdetails aus DB (Admin-pflegbar)
- Preise für ALLE User erst in Step 4 sichtbar (Designentscheidung, nicht Sicherheit)
- Das Paket bestimmt das Messraster (packages.grid_size), facilities.measurement_grid ist nur ein Standardwert/Präferenz

**Step 3: Termin wählen** (nur bei 1-3 Plätzen)
- Kalender mit freien/belegten Tagen
- Kunde wählt nur einen TAG, keine Uhrzeit
- Admin weist anschließend den genauen Zeitslot zu (start_time/end_time in bookings)
- Basiert auf schedule_templates + schedule_overrides
- Geschätzte Dauer je nach Platzanzahl (Anzeige für den Kunden)
- duration_surcharge: Aufpreis bei Überlänge, wird vom Admin im Auftrags-Detail gesetzt

**Step 4: Kalkulation** (nur bei 1-3 Plätzen)
- Einzelpreise pro Platz/Paket
- Mengenrabatt laut pricing_rules
- Gesamtpreis
- Nicht geladen wenn !is_approved (Platzhalter mit Blur statt echte Werte)

**Bei >3 Plätzen: statt Step 3+4**
- Hinweis: "Individuelle Anfrage"
- Optionales Anmerkungsfeld
- Petry meldet sich in 24h

**Step 5: Zusammenfassung**
- Alle Details auf einen Blick
- AGB-Checkbox
- "Auftrag verbindlich absenden"

### Auftrags-Detail (/dashboard/orders/[id])

- Auftragsinfos links (Plätze, Pakete, Termin, Preis, Status)
- Chat rechts (Echtzeit mit Petry)
- Ergebnisse wenn verfügbar

### Auftrags-Status-Workflow

```
ANGEFRAGT → BESTÄTIGT → GEPLANT → IN MESSUNG → ABGESCHLOSSEN
INDIVIDUELLE ANFRAGE → BESTÄTIGT → ...normaler Flow
ABGELEHNT (jederzeit durch Admin)
```

---

## 5. Admin-Dashboard

Ein fester Admin-Account (manuell angelegt).
Gleiches Design-System wie Kunden-Dashboard, eigene Navigation.

### Übersicht (/admin)

- KPIs: Kunden gesamt, wartend auf Freigabe, offene Aufträge
- Liste: Accounts die Freigabe warten (mit Freigeben-Button)
- Liste: Neueste Aufträge

### Nutzer verwalten (/admin/users)

- Tabelle: Name, Typ, Status, Aktionen
- Filtern nach Status/Typ
- Detail-Ansicht mit Freigeben/Sperren/Nachricht senden

### Pakete verwalten (/admin/packages)

- CRUD für Pakete (Silber, Gold, weitere)
- Pro Paket: Name, Beschreibung, Basispreis, Messraster, Features
- Aktivieren/Deaktivieren

### Platzarten (/admin/facility-types)

- CRUD für Platzarten
- Name, Icon, Sortierung, Aktiv/Inaktiv

### Preise (/admin/pricing)

- Mengenrabatt-Staffeln
- Min/Max Plätze, Rabatt in %, individuell ab X

### Terminverwaltung (/admin/schedule)

- Standard-Wochenplan (Mo-So, Startzeit, Endzeit, aktiv/inaktiv)
- Abweichungen: Einzelne Tage überschreiben oder blockieren
- Urlaub/Abwesenheit: Datumsbereich blockieren
- Kalender-Vorschau mit Farbcodes

### Ergebnisse (/admin/results)

- Auftrag auswählen
- JSON-Messwerte eintragen (optional, vorbereitet für Roboter-API)
- Dateien hochladen (PDF, PNG, CSV via Supabase Storage)
- Notiz für Kunden
- "Speichern & Kunden benachrichtigen"

### E-Mail Templates (/admin/email-templates)

- Liste aller Templates
- Bearbeiten: Betreff, Inhalt (HTML), CTA-Button
- Variablen-Übersicht ({{vorname}}, {{auftrag_nr}} etc.)
- Vorschau & Test-Mail senden

---

## 6. Notification-System

### In-App (NotificationBell)

Glocken-Icon im Header mit ungelesen-Zähler.
Dropdown zeigt letzte Notifications, Link zu /dashboard/notifications.

### Event-Matrix

| Event | Kunde | Admin | E-Mail |
|-------|-------|-------|--------|
| Neuer Account registriert | - | x | x |
| Account freigeschaltet | x | - | x |
| Account gesperrt | x | - | x |
| Auftrag eingegangen | - | x | x |
| Auftrag bestätigt | x | - | x |
| Auftrag abgelehnt | x | - | x |
| Status-Änderung | x | - | x |
| Neue Chat-Nachricht | x | x | x (nur wenn Empfänger >5min inaktiv, max 1 Mail/Stunde pro Auftrag) |
| Ergebnisse verfügbar | x | - | x |
| Individuelle Anfrage | - | x | x |
| Manuelle News (Admin) | x | - | x |

### E-Mail Templates (in DB)

Base-Template: HTML mit Orange-Gradient Header, Logo, Footer.
15 Event-spezifische Templates mit {{variablen}}.
Admin kann Templates bearbeiten, Vorschau sehen, Test-Mails senden.

---

## 7. Echtzeit-Chat

### Pro Auftrag

- Supabase Realtime Subscription auf messages-Tabelle
- Nachrichtentypen: text, file, system
- Datei-Anhänge über Büroklammer-Icon (Supabase Storage)
- Lesebestätigung (customer_read_at / admin_read_at - getrennt pro Partei)
- Ungelesen-Zähler in Sidebar + NotificationBell

### Kunde

Chat eingebettet in Auftrags-Detail (/dashboard/orders/[id]).

### Admin

Chat eingebettet in Auftrags-Detail (/admin/orders/[id]). Die Auftrags-Liste (/admin/orders) zeigt einen Ungelesen-Indikator pro Auftrag, sodass Petry sieht wo neue Nachrichten warten.

---

## 8. Sicherheit & Auth

### Magic Link Flow

1. Onboarding/Login: E-Mail eingeben
2. Supabase Auth sendet Magic Link
3. Klick: Token-Verifizierung, Session erstellen
4. Redirect: /dashboard (oder /admin wenn is_admin)

### Route Protection

- Middleware prüft Auth + is_approved + is_admin
- Unapproved: Dashboard sichtbar, Preise blur, Aufträge gesperrt
- Non-Admin auf /admin/*: 404 (Bereich unsichtbar)

### Row Level Security

- Kunde: nur eigene Daten (profiles, facilities, orders, messages, results, notifications)
- Pakete/Preise: nur wenn is_approved = true ODER is_admin
- Admin: alle Tabellen, alle Operationen
- facility_types: lesbar für alle authentifizierten User

---

## 9. Datenbank-Schema

### profiles
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK (= auth.uid()) | |
| email | text NOT NULL | |
| first_name | text NOT NULL | |
| last_name | text NOT NULL | |
| phone | text | |
| account_type | enum (private/municipal/club/company) | |
| organization | text | |
| position | text | |
| vat_id | text | USt-IdNr |
| address_street | text | |
| address_zip | text | |
| address_city | text | |
| address_country | text DEFAULT 'DE' | |
| billing_same | boolean DEFAULT true | |
| billing_street | text | |
| billing_zip | text | |
| billing_city | text | |
| billing_country | text DEFAULT 'DE' | |
| is_approved | boolean DEFAULT false | |
| is_admin | boolean DEFAULT false | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### facility_types
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| name | text NOT NULL | |
| icon | text | Icon-Name |
| is_active | boolean DEFAULT true | |
| sort_order | int | |
| created_at | timestamptz | |

### facilities
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| type_id | uuid FK → facility_types | |
| name | text NOT NULL | |
| latitude | float | |
| longitude | float | |
| address | text | |
| length_m | float | |
| width_m | float | |
| mast_count | int | |
| light_count | int | |
| light_type | enum (led/conventional) | |
| measurement_grid | enum (5m/10m) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### packages
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| name | text NOT NULL | |
| description | text | |
| base_price | int | Cent |
| grid_size | enum (5m/10m) | |
| features | jsonb | |
| is_active | boolean DEFAULT true | |
| sort_order | int | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### pricing_rules
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| min_facilities | int | |
| max_facilities | int | NULL = unbegrenzt |
| discount_percent | float | |
| is_individual | boolean DEFAULT false | |
| created_at | timestamptz | |

### orders
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| order_number | text UNIQUE | Auto: 2026-001 |
| status | enum | requested/confirmed/scheduled/measuring/completed/rejected/individual_request |
| total_price | int | Cent, NULL bei individuell |
| discount_percent | float | |
| notes | text | Kundenanmerkung |
| admin_notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### order_items
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| facility_id | uuid FK → facilities | |
| package_id | uuid FK → packages | |
| item_price | int | Cent |
| created_at | timestamptz | |

### schedule_templates
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| day_of_week | int | 0=Mo, 6=So |
| start_time | time | |
| end_time | time | |
| is_active | boolean DEFAULT true | |

### schedule_overrides
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| date_start | date NOT NULL | |
| date_end | date | NULL = einzelner Tag |
| start_time | time | NULL = ganzer Tag |
| end_time | time | |
| is_blocked | boolean DEFAULT true | |
| label | text | |
| created_at | timestamptz | |

### bookings
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| date | date NOT NULL | |
| start_time | time NOT NULL | |
| end_time | time NOT NULL | |
| duration_hours | float | |
| duration_surcharge | int | Cent |
| created_at | timestamptz | |

### messages
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| sender_id | uuid FK → profiles | |
| content | text | |
| type | enum (text/file/system) | |
| file_url | text | |
| file_name | text | |
| customer_read_at | timestamptz | Gelesen durch Kunde |
| admin_read_at | timestamptz | Gelesen durch Admin |
| created_at | timestamptz | |

### results
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| order_item_id | uuid FK → order_items | Pro Anlage innerhalb des Auftrags |
| data | jsonb | Messwerte |
| admin_note | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### result_files
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| result_id | uuid FK → results | |
| file_url | text | Supabase Storage |
| file_name | text | |
| file_size | int | Bytes |
| file_type | text | |
| created_at | timestamptz | |

### notifications
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| type | text | |
| title | text | |
| body | text | |
| link | text | |
| is_read | boolean DEFAULT false | |
| created_at | timestamptz | |

### email_templates
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | uuid PK | |
| template_key | text UNIQUE | |
| subject | text NOT NULL | |
| body | text NOT NULL | HTML |
| cta_text | text | |
| cta_url | text | |
| recipient_type | enum (customer/admin) | |
| is_active | boolean DEFAULT true | |
| updated_at | timestamptz | |
