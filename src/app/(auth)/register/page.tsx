"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    nim: "",
    prodi: "Teknik Informatika", // Default Enum value
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post('/register', formData);
      // Jika status 201, tampilkan modal/pesan sukses
      if (response.status === 201) {
        setIsSuccess(true);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setErrorMsg(error.response.data.detail || "Email atau NIM sudah terdaftar.");
      } else {
        setErrorMsg("Terjadi kesalahan pada server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tampilan jika registrasi sukses (Menunggu verifikasi email)
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Link verifikasi telah dikirimkan ke <span className="font-semibold text-gray-900">{formData.email}</span>. 
            Silakan cek kotak masuk atau folder spam email Anda untuk mengaktifkan akun.
          </p>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11">Kembali ke Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Tampilan Form Registrasi Normal
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl inline-block mb-4 shadow-sm">
            <FileText className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-sm text-gray-500 mt-1">Daftar untuk mengakses Smart Repository</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" required className="h-10" 
              value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM</Label>
              <Input id="nim" required className="h-10" 
                value={formData.nim} onChange={(e) => setFormData({...formData, nim: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prodi">Program Studi</Label>
              <select id="prodi" className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.prodi} onChange={(e) => setFormData({...formData, prodi: e.target.value})}
              >
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Teknik Multimedia dan Jaringan">Teknik Multimedia dan Jaringan</option>
                <option value="Teknik Multimedia Digital">Teknik Multimedia Digital</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required className="h-10" 
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required className="h-10" 
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftar Akun"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { UserPlus, Eye, EyeOff } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// export default function RegisterPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Logika submit ke FastAPI akan ditambahkan nanti
//     console.log("Register submitted");
//   };

//   return (
//     <Card className="shadow-lg border-0 rounded-2xl">
//       <CardHeader className="text-center space-y-2 pt-8">
//         <div className="mx-auto bg-blue-600 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-2">
//           <UserPlus className="text-white w-6 h-6" />
//         </div>
//         <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
//         <CardDescription>Daftar untuk mengakses Smart Repository</CardDescription>
//       </CardHeader>
//       <CardContent className="pb-8">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="nim">NIM</Label>
//             <Input id="nim" placeholder="Masukkan NIM Anda" required />
//           </div>
          
//           <div className="space-y-2">
//             <Label htmlFor="nama">Nama Lengkap</Label>
//             <Input id="nama" placeholder="Masukkan nama lengkap" required />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" type="email" placeholder="nama@email.com" required />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="prodi">Program Studi</Label>
//             <Input id="prodi" placeholder="Masukkan program studi" required />
//           </div>

//           <div className="space-y-2 relative">
//             <Label htmlFor="password">Password</Label>
//             <div className="relative">
//               <Input 
//                 id="password" 
//                 type={showPassword ? "text" : "password"} 
//                 placeholder="Minimal 6 karakter" 
//                 required 
//               />
//               <button 
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
//               </button>
//             </div>
//           </div>

//           <div className="space-y-2 relative">
//             <Label htmlFor="confirm-password">Konfirmasi Password</Label>
//             <div className="relative">
//               <Input 
//                 id="confirm-password" 
//                 type={showConfirmPassword ? "text" : "password"} 
//                 placeholder="Ulangi password" 
//                 required 
//               />
//               <button 
//                 type="button"
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//               >
//                 {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>

//           <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6 h-11 text-base">
//             Daftar
//           </Button>

//           <p className="text-center text-sm text-gray-600 mt-4">
//             Sudah punya akun? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login di sini</Link>
//           </p>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }