import nodemailer from 'nodemailer'
import { createAdminClient } from '@/lib/supabase/admin'
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
  const supabase = createAdminClient()
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

  try {
    await transporter.sendMail({
      from: `"Petry Robotik" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error(`Failed to send email [${templateKey}] to ${to}:`, error)
  }
}
