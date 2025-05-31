'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie } from '@/lib/utils'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return <>{children}</>
}