// Simulating email functionality
// In a production environment, you would use a real email service 
// like SendGrid, Mailgun, or AWS SES

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  // In a real implementation, you would send an actual email here
  // For now, we'll just log the details to the console
  
  const verificationLink = `${process.env.APP_URL || "http://localhost:5000"}/verify-email/${token}`;
  
  console.log(`
    To: ${email}
    Subject: Verify your email for BlogCollab
    
    Hello ${name},
    
    Thank you for registering with BlogCollab. To complete your registration,
    please verify your email by clicking the link below:
    
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you did not register for BlogCollab, please ignore this email.
    
    Thanks,
    The BlogCollab Team
  `);
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  // In a real implementation, you would send an actual email here
  // For now, we'll just log the details to the console
  
  const resetLink = `${process.env.APP_URL || "http://localhost:5000"}/reset-password/${token}`;
  
  console.log(`
    To: ${email}
    Subject: Reset your BlogCollab password
    
    Hello ${name},
    
    We received a request to reset your password for BlogCollab. To reset your password,
    please click the link below:
    
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, please ignore this email or contact support
    if you have concerns.
    
    Thanks,
    The BlogCollab Team
  `);
}

export async function sendEditNotificationEmail(
  email: string,
  name: string,
  blogTitle: string,
  editorName: string
): Promise<void> {
  // In a real implementation, you would send an actual email here
  // For now, we'll just log the details to the console
  
  console.log(`
    To: ${email}
    Subject: New suggested edits for your blog "${blogTitle}"
    
    Hello ${name},
    
    ${editorName} has suggested edits to your blog post "${blogTitle}".
    
    Log in to your account to review, accept, or reject these changes.
    
    Thanks,
    The BlogCollab Team
  `);
}
