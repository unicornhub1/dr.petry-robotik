export const siteConfig = {
  name: 'Petry Robotik',
  description: 'Professionelle Lichtmessung mit autonomen Messrobotern. Hochpräzise Daten, vollautomatisch erfasst.',
  url: 'https://robotik.ib-drpetry.de',
  company: {
    name: 'Petry Robotik',
    address: 'Musterstraße 1, 12345 Musterstadt',
    email: 'robotik@ib-drpetry.de',
    phone: '+49 123 456789'
  },
  social: {
    linkedin: 'https://linkedin.com/company/ib-drpetry',
  },
  navigation: [
    { name: 'Startseite', href: '/' },
    { name: 'Produkt', href: '/produkt' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Blog', href: '/blog' },
    { name: 'Kontakt', href: '/kontakt' },
    { name: 'Login', href: '/login' },
  ]
}

export const features = [
  {
    title: 'Autonome Messung',
    description: 'Unser Messroboter arbeitet vollständig autonom und erfasst Beleuchtungsdaten rund um die Uhr.',
    icon: 'Bot'
  },
  {
    title: 'Hochpräzise Sensorik',
    description: 'Kalibrierte Sensoren liefern Messwerte mit wissenschaftlicher Genauigkeit nach DIN-Norm.',
    icon: 'Gauge'
  },
  {
    title: 'Echtzeit-Dashboard',
    description: 'Greifen Sie jederzeit auf Ihre Messdaten zu - übersichtlich aufbereitet im Online-Dashboard.',
    icon: 'LayoutDashboard'
  },
  {
    title: 'Detaillierte Reports',
    description: 'Exportieren Sie Ihre Messergebnisse als PDF-Report oder Excel-Datei für Ihre Dokumentation.',
    icon: 'FileText'
  },
  {
    title: 'Flexible Miete',
    description: 'Mieten Sie den Messroboter für Ihr Projekt - ohne hohe Anschaffungskosten.',
    icon: 'Calendar'
  },
  {
    title: 'Einfache Integration',
    description: 'Verbinden Sie Ihre Systeme über unsere API und automatisieren Sie Ihren Workflow.',
    icon: 'Plug'
  }
]

export const usps = [
  {
    value: '0.1',
    unit: 'Lux',
    label: 'Messgenauigkeit',
    description: 'Höchste Präzision für normgerechte Dokumentation'
  },
  {
    value: '24/7',
    unit: '',
    label: 'Autonomer Betrieb',
    description: 'Kontinuierliche Messung ohne Personalaufwand'
  },
  {
    value: '< 5',
    unit: 'Min',
    label: 'Datenverfügbarkeit',
    description: 'Messwerte sofort im Dashboard verfügbar'
  }
]
