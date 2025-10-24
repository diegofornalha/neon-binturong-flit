import nodemailer from 'nodemailer'

interface SendInviteEmailParams {
  to: string
  organizationName: string
  inviterName?: string
  role: string
  inviteLink: string
}

// Criar transporter SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SSL === 'true', // true para 465, false para outros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendInviteEmail({
  to,
  organizationName,
  inviterName,
  role,
  inviteLink
}: SendInviteEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"Carmen SDR" <${process.env.SMTP_SENDER || process.env.SMTP_USER}>`,
      to,
      subject: `Convite para ${organizationName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Convite para ${organizationName}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Carmen SDR</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Dashboard Premium</p>
            </div>
            
            <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Você foi convidado!</h2>
              
              <p style="font-size: 16px; color: #555;">
                ${inviterName ? `<strong>${inviterName}</strong> convidou você para` : 'Você foi convidado para'} 
                se juntar à organização <strong>${organizationName}</strong> como <strong style="text-transform: capitalize;">${role}</strong>.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                  <strong>Organização:</strong> ${organizationName}
                </p>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>Função:</strong> <span style="text-transform: capitalize;">${role}</span>
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Aceitar Convite
                </a>
              </div>
              
              <p style="font-size: 14px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
              </p>
              
              <p style="font-size: 12px; color: #999; margin-top: 20px;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Carmen SDR. Todos os direitos reservados.</p>
            </div>
          </body>
        </html>
      `
    })

    console.log('[Email] Message sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[Email] Error:', error)
    throw error
  }
}