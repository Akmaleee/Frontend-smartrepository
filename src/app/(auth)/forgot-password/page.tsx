"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  // State untuk melacak apakah email sudah dikirim atau belum
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nanti di sini kita panggil endpoint FastAPI untuk mengirim email SMTP
    // Simulasi sukses:
    setIsSubmitted(true);
  };

  return (
    <Card className="shadow-lg border-0 rounded-2xl">
      <CardHeader className="text-center space-y-2 pt-8">
        <div className="mx-auto bg-blue-600 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-2">
          <KeyRound className="text-white w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
        <CardDescription>
          {isSubmitted 
            ? "Cek email Anda" 
            : "Masukkan email terdaftar untuk mereset password"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-8">
        {!isSubmitted ? (
          // Tampilan form sebelum disubmit
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                required 
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 h-11 text-base">
              Kirim Tautan Reset
            </Button>

            <div className="text-center mt-6">
              <Link href="/login" className="text-sm text-gray-500 font-medium hover:text-blue-600 flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </div>
          </form>
        ) : (
          // Tampilan pesan sukses setelah disubmit
          <div className="text-center space-y-6">
            <div className="flex justify-center animate-in zoom-in duration-300">
              <div className="bg-green-50 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <p className="text-gray-600 text-sm px-4">
              Kami telah mengirimkan tautan untuk mereset password. Silakan cek kotak masuk atau folder spam email Anda.
            </p>
            
            <div className="space-y-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11"
                onClick={() => setIsSubmitted(false)}
              >
                Kirim ulang email
              </Button>
              
              <Link href="/login" className="inline-flex items-center justify-center gap-2 w-full h-11 text-sm text-blue-600 font-semibold hover:bg-blue-50 rounded-md transition-colors">
                <ArrowLeft size={16} /> Kembali ke Login
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}