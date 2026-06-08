"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

// Komponen logika utama
function VerifyContent() {
  const searchParams = useSearchParams();
  // Mengambil token dari URL (contoh: ?token=abc123xyz)
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Jika tidak ada token di URL, langsung tampilkan error
    if (!token) {
      setStatus("error");
      setMessage("Tautan verifikasi tidak valid atau tidak lengkap.");
      return;
    }

    const verifyEmail = async () => {
      try {
        // Menembak endpoint backend: GET /auth/verify?token=...
        const response = await api.get(`/auth/verify?token=${token}`);
        setStatus("success");
        setMessage(response.data.message || "Email berhasil diverifikasi! Anda sekarang dapat login.");
      } catch (error: any) {
        setStatus("error");
        if (error.response && error.response.status === 400) {
          setMessage(error.response.data.detail || "Token tidak valid atau sudah kadaluarsa.");
        } else {
          setMessage("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
        }
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
      
      {/* State 1: Sedang Loading memanggil API */}
      {status === "loading" && (
        <div className="space-y-4">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Memverifikasi...</h2>
          <p className="text-gray-500">Mohon tunggu sebentar, kami sedang mengecek token Anda.</p>
        </div>
      )}

      {/* State 2: Verifikasi Sukses */}
      {status === "success" && (
        <div className="space-y-4 animate-in zoom-in duration-300">
          <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verifikasi Berhasil!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">
              Lanjut ke Halaman Login
            </Button>
          </Link>
        </div>
      )}

      {/* State 3: Verifikasi Gagal / Token Salah */}
      {status === "error" && (
        <div className="space-y-4 animate-in zoom-in duration-300">
          <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verifikasi Gagal</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/login">
            <Button variant="outline" className="w-full h-11 border-gray-200 text-base font-semibold">
              Kembali ke Halaman Login
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}

// Komponen Utama Page (Dibungkus Suspense karena menggunakan useSearchParams)
export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Memuat halaman...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}