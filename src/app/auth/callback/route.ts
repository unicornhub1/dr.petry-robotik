import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { onUserRegistered } from '@/lib/notifications/events'
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
      // New user without profile yet — trigger registration event
      onUserRegistered(sessionData.user.id).catch(console.error)
      const destination = redirectParam ?? '/dashboard'
      return NextResponse.redirect(`${origin}${destination}`)
    }

    // Check if profile was just created (within last 60 seconds = likely new registration)
    const profileAge = Date.now() - new Date(profile.created_at).getTime()
    if (profileAge < 60000) {
      onUserRegistered(sessionData.user.id).catch(console.error)
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
