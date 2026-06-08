"use client";

import { useState } from "react";
import Link from "next/link";
// Tambahkan import Eye dan EyeOff dari lucide-react
import { FileText, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  // State Error Validasi Lokal
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // State Toggle Tampilkan Password
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    nim: "",
    prodi: "Teknik Informatika", 
  });

  // Handler Perubahan Input + Validasi Real-time
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    // VALIDASI NIM: Hanya angka, maksimal 10 digit
    if (id === "nim") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [id]: onlyNumbers }));
      return; 
    }

    setFormData(prev => ({ ...prev, [id]: value }));

    // VALIDASI EMAIL PNJ
    if (id === "email") {
      const pnjEmailRegex = /^[^\s@]+@([a-z0-9-]+\.)*pnj\.ac\.id$/i;
      if (value.trim() === "") {
        setEmailError(""); 
      } else if (!pnjEmailRegex.test(value)) {
        setEmailError("Gunakan email akademik PNJ yang valid (contoh: nama@tik.pnj.ac.id)");
      } else {
        setEmailError(""); 
      }
    }

    // VALIDASI PASSWORD BEST PRACTICE
    if (id === "password") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      
      if (value.trim() === "") {
        setPasswordError("");
      } else if (!passwordRegex.test(value)) {
        setPasswordError("Minimal 8 karakter, wajib 1 huruf besar & 1 simbol.");
      } else {
        setPasswordError("");
      }
    }
  };

  const isFormValid = 
    formData.full_name.trim() !== "" && 
    formData.nim.trim() !== "" && 
    formData.email.trim() !== "" && 
    formData.password.trim() !== "" && 
    emailError === "" &&
    passwordError === "";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; 

    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await api.post('/auth/register', formData);
      if (response.status === 201 || response.status === 200) {
        setIsSuccess(true);
      }
    } catch (error: any) {
      if (error.response && (error.response.status === 400 || error.response.status === 422)) {
        setErrorMsg(error.response.data.detail || error.response.data.message || "Data tidak valid atau sudah terdaftar.");
      } else {
        setErrorMsg("Terjadi kesalahan pada server. Pastikan koneksi Anda stabil.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email Anda</h2>
          <p className="text-gray-600 mb-6 leading-relaxed text-sm">
            Silakan cek kotak masuk atau folder spam pada email <span className="font-semibold text-gray-900">{formData.email}</span> untuk verifikasi.
          </p>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 shadow-md shadow-blue-200">
              Menuju Halaman Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <Input id="full_name" required className="h-10 border-gray-200" 
              value={formData.full_name} onChange={handleChange} placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nim">NIM / NIP</Label>
              <Input 
                id="nim" 
                required 
                className="h-10 border-gray-200" 
                value={formData.nim} 
                onChange={handleChange} 
                placeholder="Maks 10 digit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prodi">Program Studi</Label>
              <select id="prodi" className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.prodi} onChange={handleChange}
              >
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Teknik Multimedia dan Jaringan">Teknik Multimedia dan Jaringan</option>
                <option value="Teknik Multimedia Digital">Teknik Multimedia Digital</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="email">Email Akademik</Label>
            <Input id="email" type="email" required 
              className={`h-10 transition-colors ${emailError ? 'border-red-300 focus-visible:ring-red-500 bg-red-50/30' : 'border-gray-200'}`}
              value={formData.email} onChange={handleChange} placeholder="nama@stu.pnj.ac.id"
            />
            {emailError && (
              <p className="text-xs font-semibold text-red-500 mt-1 animate-in slide-in-from-top-1">
                {emailError}
              </p>
            )}
          </div>

          {/* KOLOM PASSWORD DENGAN FITUR SHOW/HIDE */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                // Type otomatis berubah dari password ke text
                type={showPassword ? "text" : "password"} 
                required 
                // Tambahkan pr-10 agar teks tidak menabrak ikon mata
                className={`h-10 pr-10 transition-colors ${passwordError ? 'border-red-300 focus-visible:ring-red-500 bg-red-50/30' : 'border-gray-200'}`}
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Buat kata sandi yang aman"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs font-semibold text-red-500 mt-1 animate-in slide-in-from-top-1">
                {passwordError}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={!isFormValid || isLoading}
            className={`w-full h-11 font-bold mt-4 transition-all ${
              !isFormValid 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
            }`}
          >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Mendaftarkan...</> : "Daftar Akun"}
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
// import { FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { api } from "@/lib/axios";

// export default function RegisterPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [isSuccess, setIsSuccess] = useState(false);
  
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     full_name: "",
//     nim: "",
//     prodi: "Teknik Informatika", // Default Enum value
//   });

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMsg("");

//     try {
//       const response = await api.post('/register', formData);
//       // Jika status 201, tampilkan modal/pesan sukses
//       if (response.status === 201) {
//         setIsSuccess(true);
//       }
//     } catch (error: any) {
//       if (error.response && error.response.status === 400) {
//         setErrorMsg(error.response.data.detail || "Email atau NIM sudah terdaftar.");
//       } else {
//         setErrorMsg("Terjadi kesalahan pada server.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Tampilan jika registrasi sukses (Menunggu verifikasi email)
//   if (isSuccess) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
//         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
//           <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h2>
//           <p className="text-gray-600 mb-6 leading-relaxed">
//             Link verifikasi telah dikirimkan ke <span className="font-semibold text-gray-900">{formData.email}</span>. 
//             Silakan cek kotak masuk atau folder spam email Anda untuk mengaktifkan akun.
//           </p>
//           <Link href="/login">
//             <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11">Kembali ke Login</Button>
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // Tampilan Form Registrasi Normal
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-8">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        
//         <div className="text-center mb-8">
//           <div className="bg-blue-600 p-3 rounded-xl inline-block mb-4 shadow-sm">
//             <FileText className="text-white w-8 h-8" />
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
//           <p className="text-sm text-gray-500 mt-1">Daftar untuk mengakses Smart Repository</p>
//         </div>

//         {errorMsg && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
//             <p className="text-sm text-red-700">{errorMsg}</p>
//           </div>
//         )}

//         <form onSubmit={handleRegister} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="full_name">Nama Lengkap</Label>
//             <Input id="full_name" required className="h-10" 
//               value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="nim">NIM</Label>
//               <Input id="nim" required className="h-10" 
//                 value={formData.nim} onChange={(e) => setFormData({...formData, nim: e.target.value})}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="prodi">Program Studi</Label>
//               <select id="prodi" className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 value={formData.prodi} onChange={(e) => setFormData({...formData, prodi: e.target.value})}
//               >
//                 <option value="Teknik Informatika">Teknik Informatika</option>
//                 <option value="Teknik Multimedia dan Jaringan">Teknik Multimedia dan Jaringan</option>
//                 <option value="Teknik Multimedia Digital">Teknik Multimedia Digital</option>
//               </select>
//             </div>
//           </div>

//           <div className="space-y-2 pt-2">
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" type="email" required className="h-10" 
//               value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password">Password</Label>
//             <Input id="password" type="password" required className="h-10" 
//               value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
//             />
//           </div>

//           <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4" disabled={isLoading}>
//             {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftar Akun"}
//           </Button>
//         </form>

//         <div className="mt-6 text-center text-sm text-gray-600">
//           Sudah punya akun?{' '}
//           <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Masuk di sini</Link>
//         </div>
//       </div>
//     </div>
//   );
// }
