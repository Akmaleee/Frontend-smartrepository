import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek apakah user sudah punya token (sudah login)
  const isLoggedIn = request.cookies.has('access_token'); 
  const path = request.nextUrl.pathname;
  
  // 1. Daftar halaman Auth (Tidak masuk akal jika diakses oleh orang yang sudah login)
  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/verify';
  
  // 2. Daftar halaman yang WAJIB LOGIN (Protected Routes)
  const isProtectedRoute = path.startsWith('/upload') || 
                           path.startsWith('/favorites') || 
                           path.startsWith('/my-documents') || 
                           path.startsWith('/adminrepotik');

  // ATURAN 1: Jika BELUM LOGIN dan mencoba akses halaman terproteksi, paksa ke /login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ATURAN 2: Jika SUDAH LOGIN tapi mencoba buka halaman /login lagi, arahkan ke Beranda
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ATURAN 3: Jika tidak melanggar aturan di atas, biarkan lewat!
  // Ini artinya halaman utama ('/') dan eksplorasi dokumen ('/documents') 
  // akan otomatis TERBUKA UNTUK UMUM (Guest).
  return NextResponse.next();
}

// Konfigurasi file apa saja yang diawasi middleware
export const config = {
  matcher: [
    /*
     * Awasi semua rute KECUALI:
     * - api (API routes)
     * - _next/static (file statis bawaan Next.js)
     * - _next/image (optimasi gambar bawaan Next.js)
     * - favicon.ico (ikon web)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
