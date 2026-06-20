"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowLeft, Upload as UploadIcon, Plus, X, Loader2, AlertCircle, CheckCircle2, FileText, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";

export default function UploadPage() {
  const router = useRouter();
  
  // State untuk status pengiriman
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // State untuk Pop-Up Sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State untuk form input teks
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    author_degree: "",
    publication_date: "",
    language: "",
    category: "Skripsi",
    prodi: "",
    document_status: "Publik",
    file_status: "Publik",
  });

  // State untuk Kata Kunci (Array)
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  // State dan Ref untuk File Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLER FUNGSI ---

  const handleAddKeyword = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (keywordInput.trim() !== "" && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (tagToRemove: string) => {
    setKeywords(keywords.filter(tag => tag !== tagToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validasi ukuran file (Max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg("Ukuran file maksimal 50MB");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi basic
    if (!selectedFile) {
      setErrorMsg("Harap unggah file dokumen terlebih dahulu!");
      return;
    }
    if (!formData.prodi) {
      setErrorMsg("Harap pilih Program Studi!");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Ambil Token dari Cookies
      const token = Cookies.get("access_token");

      // 2. Siapkan FormData (karena kita kirim file, bukan JSON)
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("author", formData.author);
      submitData.append("author_degree", formData.author_degree);
      submitData.append("publication_date", formData.publication_date);
      submitData.append("language", formData.language);
      submitData.append("category", formData.category);
      submitData.append("prodi", formData.prodi);
      submitData.append("document_status", formData.document_status);
      submitData.append("file_status", formData.file_status);
      
      // Ubah array keywords menjadi string yang dipisah koma
      submitData.append("tags_input", keywords.join(","));
      
      // Append file
      submitData.append("file", selectedFile);

      // 3. Tembak API FastAPI
      await api.post("/upload", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}` 
        }
      });

      // 4. Jika sukses, munculkan Pop-Up
      setShowSuccessModal(true);

    } catch (error: any) {
      // PENJAGAAN AUTO-LOGOUT JIKA SESI HABIS (401)
      if (error.response && error.response.status === 401) {
        Cookies.remove('access_token');
        Cookies.remove('user_name');
        Cookies.remove('user_role');
        window.location.href = '/login';
        return; // Hentikan eksekusi kode
      } 
      
      // Penanganan Error Validasi (422) atau lainnya
      else if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.detail;
        if (Array.isArray(validationErrors)) {
          const firstError = validationErrors[0];
          const errorField = firstError.loc[firstError.loc.length - 1]; 
          setErrorMsg(`Data tidak valid pada kolom '${errorField}': ${firstError.msg}`);
        } else {
          setErrorMsg(JSON.stringify(validationErrors));
        }
      } else {
        setErrorMsg(error.response?.data?.message || error.response?.data?.detail || "Gagal mengunggah dokumen. Periksa koneksi server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6 relative">
      
      {/* Tombol Kembali & Header */}
      <div className="space-y-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unggah Dokumen Baru</h1>
          <p className="text-gray-500 mt-1 text-sm">Lengkapi metadata dokumen yang akan diunggah</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Judul Dokumen */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Judul Dokumen <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title" required className="h-11" placeholder="Masukkan judul dokumen"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* Penulis & Gelar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm font-semibold">
                  Penulis <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="author" required className="h-11" placeholder="Nama penulis"
                  value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_degree" className="text-sm font-semibold">
                  Gelar Penulis <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="author_degree" required className="h-11" placeholder="Contoh: S.T., M.T."
                  value={formData.author_degree} onChange={(e) => setFormData({...formData, author_degree: e.target.value})}
                />
              </div>
            </div>

            {/* Tanggal & Bahasa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="publication_date" className="text-sm font-semibold">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="publication_date" type="date" required className="h-11"
                  value={formData.publication_date} onChange={(e) => setFormData({...formData, publication_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-semibold">
                  Bahasa <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="language" required className="h-11" placeholder="Contoh: Indonesia, English"
                  value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}
                />
              </div>
            </div>

            {/* Kata Kunci */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Kata Kunci <span className="text-red-500">*</span>
              </Label>
              
              {/* Display Keywords */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map((tag, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border border-blue-100">
                      {tag}
                      <button type="button" onClick={() => handleRemoveKeyword(tag)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Ketik kata kunci..." className="h-11 flex-grow"
                  value={keywordInput} 
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
                />
                <Button type="button" onClick={handleAddKeyword} variant="outline" className="h-11 shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-1" /> Tambah
                </Button>
              </div>
            </div>

            {/* Kategori & Program Studi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">Kategori <span className="text-red-500">*</span></Label>
                <select id="category" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="Skripsi">Skripsi</option>
                  <option value="Laporan Magang">Laporan Magang</option>
                  <option value="Jurnal">Jurnal</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prodi" className="text-sm font-semibold">Program Studi <span className="text-red-500">*</span></Label>
                <select id="prodi" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
                  value={formData.prodi} onChange={(e) => setFormData({...formData, prodi: e.target.value})}>
                  <option value="">Pilih Program Studi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Multimedia dan Jaringan">Teknik Multimedia dan Jaringan</option>
                  <option value="Teknik Multimedia Digital">Teknik Multimedia Digital</option>
                </select>
              </div>
            </div>

            {/* Status Dokumen & File */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="document_status" className="text-sm font-semibold">Status Dokumen <span className="text-red-500">*</span></Label>
                <select id="document_status" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.document_status} onChange={(e) => setFormData({...formData, document_status: e.target.value})}>
                  <option value="Publik">Publik</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_status" className="text-sm font-semibold">Status File <span className="text-red-500">*</span></Label>
                <select id="file_status" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.file_status} onChange={(e) => setFormData({...formData, file_status: e.target.value})}>
                  <option value="Publik">Publik</option>
                  <option value="Terbatas">Terbatas</option>
                </select>
              </div>
            </div>

            {/* Upload File Zone */}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-semibold">Upload File <span className="text-red-500">*</span></Label>
              
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group
                  ${selectedFile ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:bg-gray-50/50'}`}
              >
                {selectedFile ? (
                  <>
                    <FileText className="w-10 h-10 text-blue-500 mb-3" />
                    <h3 className="text-sm font-bold text-gray-900">{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti file</p>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-3" />
                    <h3 className="text-sm font-bold text-gray-700">Klik untuk memilih file dari perangkat</h3>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max. 50MB)</p>
                  </>
                )}
              </div>
            </div>

            {/* PERUBAHAN UI: Indikator Loading AI Lokal */}
            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 flex items-start gap-4 animate-pulse">
                <Bot className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 mb-1">Mengeksekusi Model IndoT5...</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Sistem sedang memverifikasi watermark dan melakukan inferensi peringkasan abstraktif dokumen secara lokal. Proses ini memakan waktu komputasi beberapa saat, mohon tunggu dan jangan tutup halaman ini.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <Button type="button" variant="outline" className="w-full h-12 text-sm font-bold border-gray-200" onClick={() => router.back()} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses Dokumen...
                  </>
                ) : (
                  "Unggah Dokumen"
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>


      {/* ========================================================= */}
      {/* MODAL POP-UP ERROR (Jika upload gagal / Watermark tidak valid) */}
      {/* ========================================================= */}
      {errorMsg && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden text-center border border-red-100">
            
            <div className="p-6 pt-8">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                Upload Ditolak!
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {errorMsg}
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <Button 
                type="button"
                onClick={() => setErrorMsg("")}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-xl shadow-md shadow-red-200 transition-all active:scale-[0.98]"
              >
                Mengerti & Coba Lagi
              </Button>
            </div>

          </div>
        </div>
      )}


      {/* --- POP-UP MODAL SUKSES --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h3>
            {/* PERUBAHAN: Teks modal disesuaikan dengan keberhasilan AI Lokal */}
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Dokumen Anda telah diunggah. Model AI Lokal (IndoT5) berhasil mengekstrak metadata, memvalidasi watermark, dan membuat ringkasan abstraktif dokumen.
            </p>
            
            <Button 
              onClick={() => router.push('/my-documents')} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
            >
              OK, Buka Dokumen Saya
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}


// "use client";

// import { useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { ArrowLeft, Upload as UploadIcon, Plus, X, Loader2, AlertCircle, CheckCircle2, FileText } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { api } from "@/lib/axios";

// export default function UploadPage() {
//   const router = useRouter();
  
//   // State untuk status pengiriman
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   // State untuk Pop-Up Sukses
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   // State untuk form input teks
//   const [formData, setFormData] = useState({
//     title: "",
//     author: "",
//     author_degree: "",
//     publication_date: "",
//     language: "",
//     category: "Skripsi",
//     prodi: "",
//     document_status: "Publik",
//     file_status: "Publik",
//   });

//   // State untuk Kata Kunci (Array)
//   const [keywordInput, setKeywordInput] = useState("");
//   const [keywords, setKeywords] = useState<string[]>([]);

//   // State dan Ref untuk File Upload
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // --- HANDLER FUNGSI ---

//   const handleAddKeyword = (e?: React.MouseEvent) => {
//     if (e) e.preventDefault();
//     if (keywordInput.trim() !== "" && !keywords.includes(keywordInput.trim())) {
//       setKeywords([...keywords, keywordInput.trim()]);
//       setKeywordInput("");
//     }
//   };

//   const handleRemoveKeyword = (tagToRemove: string) => {
//     setKeywords(keywords.filter(tag => tag !== tagToRemove));
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       // Validasi ukuran file (Max 50MB)
//       if (file.size > 50 * 1024 * 1024) {
//         setErrorMsg("Ukuran file maksimal 50MB");
//         return;
//       }
//       setSelectedFile(file);
//       setErrorMsg("");
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg("");

//     // Validasi basic
//     if (!selectedFile) {
//       setErrorMsg("Harap unggah file dokumen terlebih dahulu!");
//       return;
//     }
//     if (!formData.prodi) {
//       setErrorMsg("Harap pilih Program Studi!");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // 1. Ambil Token dari Cookies
//       const token = Cookies.get("access_token");

//       // 2. Siapkan FormData (karena kita kirim file, bukan JSON)
//       const submitData = new FormData();
//       submitData.append("title", formData.title);
//       submitData.append("author", formData.author);
//       submitData.append("author_degree", formData.author_degree);
//       submitData.append("publication_date", formData.publication_date);
//       submitData.append("language", formData.language);
//       submitData.append("category", formData.category);
//       submitData.append("prodi", formData.prodi);
//       submitData.append("document_status", formData.document_status);
//       submitData.append("file_status", formData.file_status);
      
//       // Ubah array keywords menjadi string yang dipisah koma
//       submitData.append("tags_input", keywords.join(","));
      
//       // Append file
//       submitData.append("file", selectedFile);

//       // 3. Tembak API FastAPI
//       await api.post("/upload", submitData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           "Authorization": `Bearer ${token}` 
//         }
//       });

//       // 4. Jika sukses, munculkan Pop-Up
//       setShowSuccessModal(true);

//     } catch (error: any) {
//       // PENJAGAAN AUTO-LOGOUT JIKA SESI HABIS (401)
//       if (error.response && error.response.status === 401) {
//         Cookies.remove('access_token');
//         Cookies.remove('user_name');
//         Cookies.remove('user_role');
//         window.location.href = '/login';
//         return; // Hentikan eksekusi kode
//       } 
      
//       // Penanganan Error Validasi (422) atau lainnya
//       else if (error.response && error.response.status === 422) {
//         const validationErrors = error.response.data.detail;
//         if (Array.isArray(validationErrors)) {
//           const firstError = validationErrors[0];
//           const errorField = firstError.loc[firstError.loc.length - 1]; 
//           setErrorMsg(`Data tidak valid pada kolom '${errorField}': ${firstError.msg}`);
//         } else {
//           setErrorMsg(JSON.stringify(validationErrors));
//         }
//       } else {
//         setErrorMsg(error.response?.data?.message || error.response?.data?.detail || "Gagal mengunggah dokumen. Periksa koneksi server.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6 relative">
      
//       {/* Tombol Kembali & Header */}
//       <div className="space-y-4">
//         <button 
//           onClick={() => router.back()} 
//           className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
//         >
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Kembali
//         </button>
        
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Unggah Dokumen Baru</h1>
//           <p className="text-gray-500 mt-1 text-sm">Lengkapi metadata dokumen yang akan diunggah</p>
//         </div>
//       </div>

//       {/* Form Card */}
//       <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
//         <CardContent className="p-6 md:p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
            
//             {/* Judul Dokumen */}
//             <div className="space-y-2">
//               <Label htmlFor="title" className="text-sm font-semibold">
//                 Judul Dokumen <span className="text-red-500">*</span>
//               </Label>
//               <Input 
//                 id="title" required className="h-11" placeholder="Masukkan judul dokumen"
//                 value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
//               />
//             </div>

//             {/* Penulis & Gelar */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="author" className="text-sm font-semibold">
//                   Penulis <span className="text-red-500">*</span>
//                 </Label>
//                 <Input 
//                   id="author" required className="h-11" placeholder="Nama penulis"
//                   value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="author_degree" className="text-sm font-semibold">
//                   Gelar Penulis <span className="text-red-500">*</span>
//                 </Label>
//                 <Input 
//                   id="author_degree" required className="h-11" placeholder="Contoh: S.T., M.T."
//                   value={formData.author_degree} onChange={(e) => setFormData({...formData, author_degree: e.target.value})}
//                 />
//               </div>
//             </div>

//             {/* Tanggal & Bahasa */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="publication_date" className="text-sm font-semibold">
//                   Tanggal <span className="text-red-500">*</span>
//                 </Label>
//                 <Input 
//                   id="publication_date" type="date" required className="h-11"
//                   value={formData.publication_date} onChange={(e) => setFormData({...formData, publication_date: e.target.value})}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="language" className="text-sm font-semibold">
//                   Bahasa <span className="text-red-500">*</span>
//                 </Label>
//                 <Input 
//                   id="language" required className="h-11" placeholder="Contoh: Indonesia, English"
//                   value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}
//                 />
//               </div>
//             </div>

//             {/* Kata Kunci */}
//             <div className="space-y-3">
//               <Label className="text-sm font-semibold">
//                 Kata Kunci <span className="text-red-500">*</span>
//               </Label>
              
//               {/* Display Keywords */}
//               {keywords.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {keywords.map((tag, idx) => (
//                     <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border border-blue-100">
//                       {tag}
//                       <button type="button" onClick={() => handleRemoveKeyword(tag)} className="hover:text-red-500 transition-colors">
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}

//               <div className="flex items-center gap-2">
//                 <Input 
//                   placeholder="Ketik kata kunci..." className="h-11 flex-grow"
//                   value={keywordInput} 
//                   onChange={(e) => setKeywordInput(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
//                 />
//                 <Button type="button" onClick={handleAddKeyword} variant="outline" className="h-11 shrink-0 border-blue-200 text-blue-600 hover:bg-blue-50">
//                   <Plus className="w-4 h-4 mr-1" /> Tambah
//                 </Button>
//               </div>
//             </div>

//             {/* Kategori & Program Studi */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="category" className="text-sm font-semibold">Kategori <span className="text-red-500">*</span></Label>
//                 <select id="category" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
//                   <option value="Skripsi">Skripsi</option>
//                   <option value="Laporan Magang">Laporan Magang</option>
//                   <option value="Jurnal">Jurnal</option>
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="prodi" className="text-sm font-semibold">Program Studi <span className="text-red-500">*</span></Label>
//                 <select id="prodi" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
//                   value={formData.prodi} onChange={(e) => setFormData({...formData, prodi: e.target.value})}>
//                   <option value="">Pilih Program Studi</option>
//                   <option value="Teknik Informatika">Teknik Informatika</option>
//                   <option value="Teknik Multimedia dan Jaringan">Teknik Multimedia dan Jaringan</option>
//                   <option value="Teknik Multimedia Digital">Teknik Multimedia Digital</option>
//                 </select>
//               </div>
//             </div>

//             {/* Status Dokumen & File */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="document_status" className="text-sm font-semibold">Status Dokumen <span className="text-red-500">*</span></Label>
//                 <select id="document_status" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   value={formData.document_status} onChange={(e) => setFormData({...formData, document_status: e.target.value})}>
//                   <option value="Publik">Publik</option>
//                   <option value="Private">Private</option>
//                 </select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="file_status" className="text-sm font-semibold">Status File <span className="text-red-500">*</span></Label>
//                 <select id="file_status" className="w-full h-11 px-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                   value={formData.file_status} onChange={(e) => setFormData({...formData, file_status: e.target.value})}>
//                   <option value="Publik">Publik</option>
//                   <option value="Terbatas">Terbatas</option>
//                 </select>
//               </div>
//             </div>

//             {/* Upload File Zone */}
//             <div className="space-y-2 pt-2">
//               <Label className="text-sm font-semibold">Upload File <span className="text-red-500">*</span></Label>
              
//               <input 
//                 type="file" 
//                 accept=".pdf,.doc,.docx" 
//                 ref={fileInputRef} 
//                 onChange={handleFileSelect} 
//                 className="hidden" 
//               />
              
//               <div 
//                 onClick={() => fileInputRef.current?.click()}
//                 className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group
//                   ${selectedFile ? 'border-blue-400 bg-blue-50/50' : 'border-gray-300 hover:bg-gray-50/50'}`}
//               >
//                 {selectedFile ? (
//                   <>
//                     <FileText className="w-10 h-10 text-blue-500 mb-3" />
//                     <h3 className="text-sm font-bold text-gray-900">{selectedFile.name}</h3>
//                     <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti file</p>
//                   </>
//                 ) : (
//                   <>
//                     <UploadIcon className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors mb-3" />
//                     <h3 className="text-sm font-bold text-gray-700">Klik untuk memilih file dari perangkat</h3>
//                     <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max. 50MB)</p>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
//               <Button type="button" variant="outline" className="w-full h-12 text-sm font-bold border-gray-200" onClick={() => router.back()} disabled={isLoading}>
//                 Batal
//               </Button>
//               <Button type="submit" className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                     Mohon Menunggu...
//                   </>
//                 ) : (
//                   "Unggah Dokumen"
//                 )}
//               </Button>
//             </div>

//           </form>
//         </CardContent>
//       </Card>


//       {/* ========================================================= */}
//       {/* MODAL POP-UP ERROR (Jika upload gagal / Watermark tidak valid) */}
//       {/* ========================================================= */}
//       {errorMsg && (
//         <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
//           <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden text-center border border-red-100">
            
//             <div className="p-6 pt-8">
//               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-100">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
//                   <circle cx="12" cy="12" r="10"></circle>
//                   <line x1="12" y1="8" x2="12" y2="12"></line>
//                   <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                 </svg>
//               </div>
              
//               <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
//                 Upload Ditolak!
//               </h3>
              
//               <p className="text-slate-600 text-sm leading-relaxed font-medium">
//                 {errorMsg}
//               </p>
//             </div>
            
//             <div className="p-4 bg-slate-50 border-t border-slate-100">
//               <Button 
//                 type="button"
//                 onClick={() => setErrorMsg("")}
//                 className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-xl shadow-md shadow-red-200 transition-all active:scale-[0.98]"
//               >
//                 Mengerti & Coba Lagi
//               </Button>
//             </div>

//           </div>
//         </div>
//       )}


//       {/* --- POP-UP MODAL SUKSES --- */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            
//             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-5">
//               <CheckCircle2 className="w-10 h-10 text-green-500" />
//             </div>
            
//             <h3 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h3>
//             <p className="text-gray-500 text-sm mb-8 leading-relaxed">
//               Dokumen Anda telah masuk ke antrean sistem. AI sedang mengekstrak metadata dan memberikan watermark.
//             </p>
            
//             <Button 
//               onClick={() => router.push('/my-documents')} 
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
//             >
//               OK, Buka Dokumen Saya
//             </Button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }