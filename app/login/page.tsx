'use client'

import { Button } from '@/components/ui/button'
import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) console.log(error.message)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user)
        router.push('/dashboard')
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) router.push('/dashboard')
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  return (
    <section className='pb-24 pt-40'>
      <div className='container flex max-w-3xl flex-col items-center'>
        <Button
          onClick={handleLogin}
          className='flex items-center gap-2 disabled:opacity-50'
        >
          <Image
            src='/Google__G__logo.svg'
            alt='Google Logo'
            width={20}
            height={20}
          />
          Login with Google
        </Button>
      </div>
    </section>
  )
}
