import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/admin"];
const PUBLIC_AUTH_ROUTES = ["/login"];
const STATIC_ROUTES = ["/api", "/_next", "/favicon.ico"];

export const updateSession = async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // Skip middleware para rotas estáticas e API
    if (STATIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    try {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Supabase environment variables not found");
            return response;
        }

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        });

        const { data: { user }, error } = await supabase.auth.getUser();
        
        const isAuthenticated = !error && !!user;
        const isProtectedRoute = isRouteProtected(pathname);
        const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.includes(pathname);

        if (isAuthenticated && user) {
            response.headers.set('x-user-id', user.id);
            response.headers.set('x-user-email', user.email || '');
        }

        // Redirecionar usuários não autenticados de rotas protegidas
        if (isProtectedRoute && !isAuthenticated) {
            const redirectUrl = new URL("/login", request.url);
            // redirectUrl.searchParams.set("redirect", pathname); // Salvar onde o usuario queria ir
            return NextResponse.redirect(redirectUrl);
        }

        // Redirecionar usuários autenticados das páginas de auth
        if (isPublicAuthRoute && isAuthenticated) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        return response;

    } catch (error) {
        console.error("Middleware error:", error);
        
        // Em caso de erro, permitir acesso mas logar
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};

/**
 * Verifica se uma rota é protegida
 */
function isRouteProtected(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    );
}