"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { AppLayout } from '@/components/layout/app-layout'
import { Loader2 } from 'lucide-react'

export default function WhatsAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login')
    }
  }, [session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <AppLayout>{children}</AppLayout>
}