import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectParam = searchParams.get('redirect')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  try {
    const supabase = await createServerSupabaseClient()

    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (sessionError || !sessionData.user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.user.id)
      .single()

    const profile = profileData as Profile | null

    if (profileError || !profile) {
      // Profile not found — redirect to dashboard fallback
      const destination = redirectParam ?? '/dashboard'
      return NextResponse.redirect(`${origin}${destination}`)
    }

    if (profile.is_admin) {
      return NextResponse.redirect(`${origin}/admin`)
    }

    const destination = redirectParam ?? '/dashboard'
    return NextResponse.redirect(`${origin}${destination}`)
  } catch {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }
}
