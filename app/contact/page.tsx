import ContactForm from '@/components/contact-form'

export default function Contact() {
  return (
    <section className='pb-24 pt-36 sm:pt-40'>
      <div className='container max-w-3xl px-4 sm:px-6'>
        <div className='mb-10'>
          <h1 className='font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            Get in Touch
          </h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Have a project in mind, an opportunity, or just want to chat tech? Send a message.
          </p>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}
