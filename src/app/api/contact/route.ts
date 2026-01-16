import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  interest: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Bitte füllen Sie alle Pflichtfelder aus.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      )
    }

    // Create transporter (configure in production with real SMTP credentials)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const interestLabels: Record<string, string> = {
      miete: 'Roboter mieten',
      kauf: 'Kaufinteresse',
      demo: 'Demo-Termin',
      partnerschaft: 'Partnerschaft',
      sonstiges: 'Sonstiges',
    }

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-top: 5px; }
            .message { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #00D4FF; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Neue Kontaktanfrage</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">IB Dr. Petry Robotik</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${body.name}</div>
              </div>
              <div class="field">
                <div class="label">E-Mail</div>
                <div class="value"><a href="mailto:${body.email}">${body.email}</a></div>
              </div>
              ${body.company ? `
              <div class="field">
                <div class="label">Unternehmen</div>
                <div class="value">${body.company}</div>
              </div>
              ` : ''}
              ${body.phone ? `
              <div class="field">
                <div class="label">Telefon</div>
                <div class="value"><a href="tel:${body.phone}">${body.phone}</a></div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Interesse</div>
                <div class="value">${interestLabels[body.interest] || body.interest}</div>
              </div>
              <div class="field">
                <div class="label">Nachricht</div>
                <div class="message">${body.message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email (uncomment in production)
    // await transporter.sendMail({
    //   from: `"IB Dr. Petry Robotik" <${process.env.EMAIL_FROM}>`,
    //   to: process.env.EMAIL_TO,
    //   replyTo: body.email,
    //   subject: `Neue Kontaktanfrage: ${interestLabels[body.interest] || body.interest}`,
    //   html: htmlContent,
    // })

    // For development, just log the data
    console.log('Contact form submission:', body)

    return NextResponse.json({
      success: true,
      message: 'Ihre Nachricht wurde erfolgreich gesendet.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' },
      { status: 500 }
    )
  }
}
