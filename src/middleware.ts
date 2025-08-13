import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Vérifier si Supabase est configuré
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Si Supabase n'est pas configuré, laisser passer toutes les requêtes
  if (!supabaseUrl || !supabaseAnonKey) {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    // Si l'utilisateur n'est pas connecté et n'est pas sur la page d'auth
    if (!session && req.nextUrl.pathname !== '/auth') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth';
      return NextResponse.redirect(redirectUrl);
    }

    // Si l'utilisateur est connecté et est sur la page d'auth
    if (session && req.nextUrl.pathname === '/auth') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    // En cas d'erreur, laisser passer la requête
    console.error('Erreur middleware:', error);
    return res;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
