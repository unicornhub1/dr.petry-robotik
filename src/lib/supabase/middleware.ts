import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() refreshes the token and sets new cookies
  // Do NOT use getSession() here - it doesn't refresh tokens
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes — no auth needed
  const publicPaths = ['/', '/onboarding', '/login', '/blog', '/produkt', '/kontakt', '/auth/callback', '/api']
  const isPublic = publicPaths.some(
    (p) =>
      request.nextUrl.pathname === p ||
      request.nextUrl.pathname.startsWith(p + '/')
  )

  // Always return supabaseResponse for public routes (preserves refreshed cookies)
  if (isPublic) return supabaseResponse

  // Not logged in → redirect to login (but still forward cookies)
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    const redirectResponse = NextResponse.redirect(url)

    // Forward any refreshed cookies from supabase
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })

    return redirectResponse
  }

  // Admin routes — check is_admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(null, { status: 404 })
    }
  }

  // Dashboard order creation — check is_approved
  if (request.nextUrl.pathname === '/dashboard/orders/new') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_approved')
      .eq('id', user.id)
      .single()

    if (!profile?.is_approved) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('blocked', 'not_approved')
      const redirectResponse = NextResponse.redirect(url)

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })

      return redirectResponse
    }
  }

  return supabaseResponse
}
