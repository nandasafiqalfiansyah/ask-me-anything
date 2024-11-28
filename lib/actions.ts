'use server'

import { z } from 'zod'
import { Resend } from 'resend'
import { ContactFormSchema, NewsletterFormSchema } from '@/lib/schemas'
import ContactFormEmail from '@/emails/contact-form-email'

type ContactFormInputs = z.infer<typeof ContactFormSchema>
type NewsletterFormInputs = z.infer<typeof NewsletterFormSchema>
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(data: ContactFormInputs) {
  const result = ContactFormSchema.safeParse(data)

  if (result.error) {
    return { error: result.error.format() }
  }

  try {
    const { name, email, message } = result.data
    // Send the email to your recipients
    const { data, error } = await resend.emails.send({
      from: 'nanda@email.ndav.my.id',
      to: [
        'nandasafiqalfiansyah@gmail.com'
      ],
      cc: [
        'delivered@resend.dev'
      ],
      subject: 'New sender form portfolio',
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      react: ContactFormEmail({ name, email, message })
    });

    if (!data || error) {
      throw new Error('Failed to send email')
    }

    // Send a thank-you email to the sender
    const thankYouEmail = await resend.emails.send({
      from: 'nanda@email.ndav.my.id',
      to: [email],  // Send to the sender's email
      subject: 'Thank you for your submission!',
      text: `Hi ${name},\n\nThank you for reaching out! We have received your message, and someone from our team will get back to you soon.\n\nBest regards,\nNanda Safiq Alfiansyah`
    });

    if (!thankYouEmail.data || thankYouEmail.error) {
      throw new Error('Failed to send thank-you email')
    }

    return { success: true }
  } catch (error) {
    return { error }
  }
}

export async function subscribe(data: NewsletterFormInputs) {
  const result = NewsletterFormSchema.safeParse(data)

  if (result.error) {
    return { error: result.error.format() }
  }

  try {
    const { email } = result.data
    const { data, error } = await resend.contacts.create({
      email: email,
      audienceId: process.env.RESEND_AUDIENCE_ID as string
    })

    if (!data || error) {
      throw new Error('Failed to subscribe')
    }

    // TODO: Send a welcome email

    return { success: true }
  } catch (error) {
    return { error }
  }
}
