import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    console.log('Attempting to send password reset email to:', email);
    const data = await resend.emails.send({
      from: 'Portal Union Neil <atendimento@unionneil.com.br>', // Use Resend's default sender during testing
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    });
    
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendNewCustomerAlert(customerName : string, customerEmail : string) {
  try {
    console.log('Attempting to send new customer alert email');
    const data = await resend.emails.send({
      from: 'Portal Union Neil <atendimento@unionneil.com.br>', // Use Resend's default sender during testing
      to: ['sirlene@unionneil.com.br', 'gary@bleasdale.dev', 'atendimento@unionneil.com.br'],
      subject: 'New Customer Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Customer Alert</h2>
          <p>A new customer, <strong>${customerName.toUpperCase()}</strong> (${customerEmail}),  has signed up on the portal. Click the link below to see the details:</p>
          <p style="margin: 20px 0;">
            <a href="https://portal.unionneil.com.br/admin" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Customer Details
            </a>
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
            </p>
        </div>
      `,
    });
    
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}