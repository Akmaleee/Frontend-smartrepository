"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { Loader2, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";

// Static Import Logo
import logoPnj from "../../../../public/logo-pnj.png";
import logoRepository from "../../../../public/logo-repository.png";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post('/auth/login', formData);
      const data = response.data;

      Cookies.set("access_token", data.access_token, { expires: 1 }); 
      Cookies.set("user_name", data.user_name, { expires: 1 });
      Cookies.set("user_role", data.role, { expires: 1 });

      router.push("/");
      router.refresh(); 

    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400 || error.response.status === 403) {
          setErrorMsg(error.response.data.detail || "Email atau password salah.");
        } else {
          setErrorMsg("Terjadi kesalahan pada server. Coba lagi nanti.");
        }
      } else {
        setErrorMsg("Tidak dapat terhubung ke server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white font-sans flex overflow-hidden w-screen h-screen">
      
      {/* ========================================= */}
      {/* KOLOM KIRI: Ilustrasi Repository (Desktop) */}
      {/* ========================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#f8fafc] flex-col items-center justify-center p-12 overflow-hidden border-r border-gray-100 h-full">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-white/20 z-0"></div>
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
          <div className="relative w-full max-w-[400px] mb-8 drop-shadow-xl flex justify-center items-center">
            <Image 
              src={logoRepository} 
              alt="Ilustrasi Repository TIK" 
              className="w-full h-auto object-contain"
              priority
            />
          </div>
          
          {/* Teks Sebelah Kiri Diperbarui */}
          <h1 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Repository TIK
          </h1>
          <p className="text-slate-500 leading-relaxed text-lg max-w-md mx-auto">
            Pusat arsip dan manajemen dokumen akademik terpadu. Temukan laporan riset, tugas akhir, dan jurnal dari Jurusan Teknik Informatika dan Komputer.
          </p>
        </div>
      </div>

      {/* ========================================= */}
      {/* KOLOM KANAN: Form Login */}
      {/* ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative h-full bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 lg:hidden"></div>

        <div className="w-full max-w-md space-y-8">
          
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Tata Letak Logo PNJ Dipercantik (Tanpa kotak kaku) */}
            <div className="relative w-24 h-24 mb-2 drop-shadow-md transition-transform hover:scale-105">
              <Image 
                src={logoPnj} 
                alt="Logo PNJ" 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              {/* Kata 'Smart' dihilangkan */}
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Repository
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Politeknik Negeri Jakarta
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              
              {/* Input Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input 
                    type="email" 
                    required
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl w-full"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600 font-medium pt-2">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-bold">
              Daftar sekarang
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
