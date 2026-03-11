interface BaseTemplateParams {
  content: string
  ctaText?: string
  ctaUrl?: string
}

export function renderBaseTemplate({ content, ctaText, ctaUrl }: BaseTemplateParams): string {
  const ctaButton = ctaText && ctaUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px auto;">
        <tr>
          <td style="border-radius: 6px; background: linear-gradient(135deg, #EE4035 0%, #2D61F0 100%);">
            <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 12px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>`
    : ''

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Petry Robotik</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 24px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #EE4035 0%, #2D61F0 100%); padding: 24px 32px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">
                Petry Robotik
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
              <div style="font-size: 15px; line-height: 1.6; color: #292929;">
                ${content}
              </div>
              ${ctaButton}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                Petry Robotik<br>
                Professionelle Lichtmessung mit autonomen Messrobotern
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht direkt auf diese Nachricht.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
