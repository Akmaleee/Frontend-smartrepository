"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Search, Filter, Download, Eye, Star, Loader2, AlertCircle,
  Calendar, User as UserIcon, BookOpen, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

// 1. Interface Ditambahkan file_status
interface Document {
  id: string;
  title: string;
  author: string;
  author_degree?: string; 
  prodi: string;
  year: number;
  category?: string; 
  tags: string[];
  highlight: string; 
  views_count: number;
  downloads_count: number;
  is_favorited?: boolean;
  file_status?: string; // <-- Diperlukan untuk RBAC
}

// ============================================================================
// 2. KOMPONEN CARD LOKAL DENGAN LOGIKA RBAC
// ============================================================================
const DocumentCard = ({ doc }: { doc: Document }) => {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState<boolean>(!!doc.is_favorited);

  // Evaluasi Role saat ini
  const currentUserRole = Cookies.get("user_role") || "GUEST";
  const currentUserName = Cookies.get("user_name") || "";
  const isGuest = !Cookies.get("access_token");

  // LOGIKA AKSES DOWNLOAD
  const isPrivate = doc.file_status === "Private" || doc.file_status === "Terbatas";
  const isAuthor = doc.author === currentUserName;
  // Dosen dan Admin mem-bypass status Private
  const canDownload = !isPrivate || isAuthor || currentUserRole === "DOSEN" || currentUserRole === "ADMIN";

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (isGuest) {
      alert("Silakan login terlebih dahulu untuk menggunakan fitur Favorit.");
      router.push("/login");
      return;
    }

    const previousState = isFavorited;
    setIsFavorited(!previousState);

    try {
      await api.post(`/documents/${doc.id}/favorite`);
    } catch (error) {
      console.error("Gagal toggle favorit:", error);
      setIsFavorited(previousState);
      alert("Gagal memperbarui status favorit."); 
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canDownload) {
      alert("Akses Ditolak: Dokumen ini bersifat Private dan hanya dapat diunduh oleh Penulis atau Dosen.");
      return;
    }

    if (isGuest) {
      alert("Silakan login terlebih dahulu untuk mengunduh dokumen.");
      router.push("/login");
      return;
    }

    // Eksekusi download sesungguhnya di sini
    alert("Memulai unduhan...");
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl overflow-hidden bg-white flex flex-col">
      <CardContent className="p-6 space-y-4 flex-grow">
        <div className="flex justify-between items-start">
          <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
            {doc.category || "DOKUMEN"}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Calendar className="w-3 h-3" />
            {doc.year}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {doc.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UserIcon className="w-3.5 h-3.5" />
            <span>{doc.author}{doc.author_degree ? `, ${doc.author_degree}` : ''}</span>
            <span className="text-gray-300">•</span>
            <span className="italic">{doc.prodi}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {doc.highlight || "Tidak ada ringkasan tersedia."}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {Array.isArray(doc.tags) && doc.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              #{tag.toLowerCase()}
            </span>
          ))}
        </div>
      </CardContent>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3.5 h-3.5" /> {doc.views_count || 0}
          </div>
          
          {/* Tombol Download dengan Status RBAC Visual */}
          <button 
            onClick={handleDownloadClick}
            className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
              canDownload ? "text-blue-600 hover:text-blue-800 cursor-pointer" : "text-gray-300 cursor-not-allowed"
            }`}
            title={!canDownload ? "Dokumen bersifat Private" : "Unduh Dokumen"}
          >
            {canDownload ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {doc.downloads_count || 0}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {!isGuest && (
            <Button variant="ghost" size="icon" onClick={toggleFavorite} className="h-9 w-9 hover:bg-yellow-50 transition-colors" title={isFavorited ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}>
              <Star className={`w-5 h-5 transition-colors duration-200 ${isFavorited ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`} />
            </Button>
          )}
          
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2" onClick={() => router.push(`/documents/${doc.id}`)}>
            Detail Dokumen
          </Button>
        </div>
      </div>
    </Card>
  );
};


// ============================================================================
// 3. HALAMAN UTAMA ALL DOCUMENTS
// ============================================================================
export default function AllDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setIsLoading(true);

    const delayDebounceFn = setTimeout(() => {
      const fetchFilteredDocuments = async () => {
        try {
          const response = await api.get('http://127.0.0.1:8000/documents', {
            params: {
              search: searchQuery || undefined,
              year: selectedYear ? parseInt(selectedYear) : undefined,
              category: selectedCategory || undefined
            }
          });
          
          let fetchedData = [];
          if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
            fetchedData = response.data.data.documents;
          } else if (Array.isArray(response.data)) {
            fetchedData = response.data;
          }

          setDocuments(fetchedData);
          setError(""); 
        } catch (err: any) {
          setError("Gagal mengambil data dokumen. Pastikan server aktif dan Anda terhubung ke internet.");
          console.error("Fetch Error:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchFilteredDocuments();
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedYear, selectedCategory]); 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Research Papers <span className="text-blue-600">({documents.length})</span>
        </h1>
        <p className="text-gray-500 mt-2">Jelajahi koleksi dokumen penelitian resmi Politeknik Negeri Jakarta</p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
          <Input 
            placeholder="Cari berdasarkan judul, penulis, atau kata kunci..." 
            className="pl-12 h-14 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <Filter className="w-4 h-4 mr-1" />
          <span className="font-bold mr-2 text-gray-400 uppercase text-[10px] tracking-widest">Filter by:</span>
          
          <select 
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          
          <select 
            className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="SKRIPSI">Skripsi</option>
            <option value="LAPORAN_MAGANG">Laporan Magang</option>
          </select>
        </div>
      </div>

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-gray-900">Ups! Terjadi Kesalahan</h2>
          <p className="text-gray-600 max-w-md mx-auto">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
            Coba Lagi
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Mencari dokumen...</p>
        </div>
      ) : !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-500">Tidak ada dokumen yang ditemukan dengan filter tersebut.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { 
//   Search, 
//   Filter, 
//   Download, 
//   Eye, 
//   Star, 
//   Loader2, 
//   AlertCircle,
//   Calendar,
//   User as UserIcon,
//   BookOpen
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { api } from "@/lib/axios";

// // 1. Interface yang Diperbarui
// interface Document {
//   id: string;
//   title: string;
//   author: string;
//   author_degree?: string; 
//   prodi: string;
//   year: number;
//   category?: string; 
//   tags: string[];
//   highlight: string; 
//   views_count: number;
//   downloads_count: number;
//   is_favorited?: boolean;
// }

// // ============================================================================
// // 2. KOMPONEN CARD LOKAL (State Bintang Bekerja Sendiri-sendiri)
// // ============================================================================
// const DocumentCard = ({ doc }: { doc: Document }) => {
//   const router = useRouter();
  
//   // State lokal untuk Optimistic UI
//   const [isFavorited, setIsFavorited] = useState<boolean>(!!doc.is_favorited);

//   const toggleFavorite = async (e: React.MouseEvent) => {
//     e.preventDefault(); 
//     e.stopPropagation();

//     // OPTIMISTIC UPDATE: Langsung ubah warna bintang seketika
//     const previousState = isFavorited;
//     setIsFavorited(!previousState);

//     try {
//       // Eksekusi API di background
//       await api.post(`/documents/${doc.id}/favorite`);
//     } catch (error) {
//       // ROLLBACK: Jika gagal, kembalikan warna bintang ke semula
//       console.error("Gagal toggle favorit:", error);
//       setIsFavorited(previousState);
//       alert("Gagal memperbarui status favorit. Silakan periksa koneksi Anda."); 
//     }
//   };

//   return (
//     <Card className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl overflow-hidden bg-white flex flex-col">
//       <CardContent className="p-6 space-y-4 flex-grow">
//         {/* Category & Year Badge */}
//         <div className="flex justify-between items-start">
//           <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
//             {doc.category || "DOKUMEN"}
//           </span>
//           <div className="flex items-center gap-1 text-gray-400 text-xs">
//             <Calendar className="w-3 h-3" />
//             {doc.year}
//           </div>
//         </div>

//         {/* Title & Author */}
//         <div className="space-y-1">
//           <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
//             {doc.title}
//           </h3>
//           <div className="flex items-center gap-2 text-sm text-gray-500">
//             <UserIcon className="w-3.5 h-3.5" />
//             <span>{doc.author}{doc.author_degree ? `, ${doc.author_degree}` : ''}</span>
//             <span className="text-gray-300">•</span>
//             <span className="italic">{doc.prodi}</span>
//           </div>
//         </div>

//         {/* Summary/Highlight Snippet */}
//         <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
//           {doc.highlight || "Tidak ada ringkasan tersedia."}
//         </p>

//         {/* Tags */}
//         <div className="flex flex-wrap gap-2 pt-2">
//           {Array.isArray(doc.tags) && doc.tags.map((tag, idx) => (
//             <span key={idx} className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
//               #{tag.toLowerCase()}
//             </span>
//           ))}
//         </div>
//       </CardContent>

//       {/* Footer Actions */}
//       <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1 text-xs text-gray-400">
//             <Eye className="w-3.5 h-3.5" /> {doc.views_count || 0}
//           </div>
//           <div className="flex items-center gap-1 text-xs text-gray-400">
//             <Download className="w-3.5 h-3.5" /> {doc.downloads_count || 0}
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {/* --- TOMBOL BINTANG --- */}
//           <Button 
//             variant="ghost" 
//             size="icon" 
//             onClick={toggleFavorite}
//             className="h-9 w-9 hover:bg-yellow-50 transition-colors"
//             title={isFavorited ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
//           >
//             <Star 
//               className={`w-5 h-5 transition-colors duration-200 ${
//                 isFavorited 
//                   ? "fill-yellow-400 text-yellow-400" 
//                   : "text-gray-400 hover:text-yellow-400"
//               }`} 
//             />
//           </Button>
          
//           <Button 
//             size="sm" 
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
//             onClick={() => router.push(`/documents/${doc.id}`)}
//           >
//             Detail Dokumen
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );
// };


// // ============================================================================
// // 3. HALAMAN UTAMA ALL DOCUMENTS
// // ============================================================================
// export default function AllDocumentsPage() {
//   const router = useRouter();
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
  
//   // --- STATE MANAGEMENT UNTUK FILTER API ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");

//   // --- IMPLEMENTASI DEBOUNCE & AUTO-FETCH ---
//   useEffect(() => {
//     // Tampilkan loading saat state berubah (sedang mengetik/ganti filter)
//     setIsLoading(true);

//     const delayDebounceFn = setTimeout(() => {
//       const fetchFilteredDocuments = async () => {
//         try {
//           const response = await api.get('http://127.0.0.1:8000/documents', {
//             params: {
//               // Gunakan undefined agar parameter yang kosong diabaikan oleh Axios
//               search: searchQuery || undefined,
//               year: selectedYear ? parseInt(selectedYear) : undefined,
//               category: selectedCategory || undefined
//             }
//           });
          
//           // Parsing response backend
//           let fetchedData = [];
//           if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
//             fetchedData = response.data.data.documents;
//           } else if (Array.isArray(response.data)) {
//             fetchedData = response.data;
//           }

//           setDocuments(fetchedData);
//           setError(""); // Reset error jika sukses
//         } catch (err: any) {
//           setError("Gagal mengambil data dokumen. Pastikan server aktif dan Anda terhubung ke internet.");
//           console.error("Fetch Error:", err);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchFilteredDocuments();
//     }, 500); // Tunda pemanggilan API selama 500ms

//     // Cleanup function untuk mereset timer
//     return () => clearTimeout(delayDebounceFn);
//   }, [searchQuery, selectedYear, selectedCategory]); // Effect terpanggil tiap kali 3 state ini berubah

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      
//       {/* Header Section */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           Research Papers <span className="text-blue-600">({documents.length})</span>
//         </h1>
//         <p className="text-gray-500 mt-2">Jelajahi koleksi dokumen penelitian resmi Politeknik Negeri Jakarta</p>
//       </div>

//       {/* Search & Filter Bar */}
//       <div className="space-y-4">
//         <div className="relative group">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
//           <Input 
//             placeholder="Cari berdasarkan judul, penulis, atau kata kunci..." 
//             className="pl-12 h-14 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all text-lg"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
//           <Filter className="w-4 h-4 mr-1" />
//           <span className="font-bold mr-2 text-gray-400 uppercase text-[10px] tracking-widest">Filter by:</span>
          
//           {/* Dropdown Tahun (Ikat ke State selectedYear) */}
//           <select 
//             className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//           >
//             <option value="">Semua Tahun</option>
//             <option value="2026">2026</option>
//             <option value="2025">2025</option>
//             <option value="2024">2024</option>
//             <option value="2023">2023</option>
//           </select>
          
//           {/* Dropdown Kategori (Ikat ke State selectedCategory) */}
//           <select 
//             className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//           >
//             <option value="">Semua Kategori</option>
//             <option value="SKRIPSI">Skripsi</option>
//             <option value="LAPORAN_MAGANG">Laporan Magang</option>
//           </select>
//         </div>
//       </div>

//       {/* Error State */}
//       {error && !isLoading && (
//         <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
//           <h2 className="text-lg font-bold text-gray-900">Ups! Terjadi Kesalahan</h2>
//           <p className="text-gray-600 max-w-md mx-auto">{error}</p>
//           <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
//             Coba Lagi
//           </Button>
//         </div>
//       )}

//       {/* Loading & Documents Grid */}
//       {isLoading ? (
//         <div className="flex flex-col items-center justify-center py-20 space-y-4">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
//           <p className="text-gray-500 font-medium">Mencari dokumen...</p>
//         </div>
//       ) : !error && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {documents.length > 0 ? (
//             documents.map((doc) => (
//               <DocumentCard key={doc.id} doc={doc} />
//             ))
//           ) : (
//             <div className="col-span-full py-20 text-center space-y-3">
//               <BookOpen className="w-12 h-12 text-gray-200 mx-auto" />
//               <p className="text-gray-500">Tidak ada dokumen yang ditemukan dengan filter tersebut.</p>
//             </div>
//           )}
//         </div>
//       )}

//     </div>
//   );
// }

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { 
//   Search, 
//   Filter, 
//   Download, 
//   Eye, 
//   Star, 
//   Loader2, 
//   AlertCircle,
//   Calendar,
//   User as UserIcon,
//   BookOpen
// } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { api } from "@/lib/axios";

// // 1. Interface yang Diperbarui (Tambahkan is_favorited)
// interface Document {
//   id: string;
//   title: string;
//   author: string;
//   author_degree?: string; 
//   prodi: string;
//   year: number;
//   category?: string; 
//   tags: string[];
//   highlight: string; 
//   views_count: number;
//   downloads_count: number;
//   is_favorited?: boolean; // <-- Tambahan untuk status bintang
// }

// // ============================================================================
// // 2. KOMPONEN CARD LOKAL (Agar State Bintang Bisa Bekerja Sendiri-sendiri)
// // ============================================================================
// const DocumentCard = ({ doc }: { doc: Document }) => {
//   const router = useRouter();
  
//   // State lokal untuk Optimistic UI
//   const [isFavorited, setIsFavorited] = useState<boolean>(!!doc.is_favorited);

//   const toggleFavorite = async (e: React.MouseEvent) => {
//     e.preventDefault(); 
//     e.stopPropagation();

//     // OPTIMISTIC UPDATE: Langsung ubah warna bintang seketika
//     const previousState = isFavorited;
//     setIsFavorited(!previousState);

//     try {
//       // Eksekusi API di background
//       await api.post(`/documents/${doc.id}/favorite`);
//     } catch (error) {
//       // ROLLBACK: Jika gagal, kembalikan warna bintang ke semula
//       console.error("Gagal toggle favorit:", error);
//       setIsFavorited(previousState);
//       alert("Gagal memperbarui status favorit. Silakan periksa koneksi Anda."); 
//     }
//   };

//   return (
//     <Card className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl overflow-hidden bg-white flex flex-col">
//       <CardContent className="p-6 space-y-4 flex-grow">
//         {/* Category & Year Badge */}
//         <div className="flex justify-between items-start">
//           <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">
//             {doc.category || "DOKUMEN"}
//           </span>
//           <div className="flex items-center gap-1 text-gray-400 text-xs">
//             <Calendar className="w-3 h-3" />
//             {doc.year}
//           </div>
//         </div>

//         {/* Title & Author */}
//         <div className="space-y-1">
//           <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
//             {doc.title}
//           </h3>
//           <div className="flex items-center gap-2 text-sm text-gray-500">
//             <UserIcon className="w-3.5 h-3.5" />
//             <span>{doc.author}{doc.author_degree ? `, ${doc.author_degree}` : ''}</span>
//             <span className="text-gray-300">•</span>
//             <span className="italic">{doc.prodi}</span>
//           </div>
//         </div>

//         {/* Summary/Highlight Snippet */}
//         <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
//           {doc.highlight || "Tidak ada ringkasan tersedia."}
//         </p>

//         {/* Tags */}
//         <div className="flex flex-wrap gap-2 pt-2">
//           {Array.isArray(doc.tags) && doc.tags.map((tag, idx) => (
//             <span key={idx} className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
//               #{tag.toLowerCase()}
//             </span>
//           ))}
//         </div>
//       </CardContent>

//       {/* Footer Actions */}
//       <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-1 text-xs text-gray-400">
//             <Eye className="w-3.5 h-3.5" /> {doc.views_count || 0}
//           </div>
//           <div className="flex items-center gap-1 text-xs text-gray-400">
//             <Download className="w-3.5 h-3.5" /> {doc.downloads_count || 0}
//           </div>
//         </div>
        
//         <div className="flex items-center gap-2">
//           {/* --- TOMBOL BINTANG --- */}
//           <Button 
//             variant="ghost" 
//             size="icon" 
//             onClick={toggleFavorite}
//             className="h-9 w-9 hover:bg-yellow-50 transition-colors"
//             title={isFavorited ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
//           >
//             <Star 
//               className={`w-5 h-5 transition-colors duration-200 ${
//                 isFavorited 
//                   ? "fill-yellow-400 text-yellow-400" 
//                   : "text-gray-400 hover:text-yellow-400"
//               }`} 
//             />
//           </Button>
          
//           <Button 
//             size="sm" 
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
//             onClick={() => router.push(`/documents/${doc.id}`)}
//           >
//             Detail Dokumen
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );
// };


// // ============================================================================
// // 3. HALAMAN UTAMA ALL DOCUMENTS
// // ============================================================================
// export default function AllDocumentsPage() {
//   const router = useRouter();
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
  
//   const [searchQuery, setSearchQuery] = useState("");

//   // Ambil Data dari API
//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get("/documents");
        
//         let fetchedData = [];
        
//         if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
//           fetchedData = response.data.data.documents;
//         } else if (Array.isArray(response.data)) {
//           fetchedData = response.data;
//         }

//         setDocuments(fetchedData);
//         setFilteredDocs(fetchedData);

//       } catch (err: any) {
//         setError("Gagal mengambil data dokumen. Pastikan server aktif dan Anda sudah login.");
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDocuments();
//   }, []);

//   // Logika Pencarian Lokal
//   useEffect(() => {
//     if (!Array.isArray(documents)) return;

//     const results = documents.filter(doc => {
//       const matchTitle = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
//       const matchAuthor = doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      
//       const matchTags = Array.isArray(doc.tags) 
//         ? doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) 
//         : false;

//       return matchTitle || matchAuthor || matchTags;
//     });

//     setFilteredDocs(results);
//   }, [searchQuery, documents]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      
//       {/* Header Section */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//           Research Papers <span className="text-blue-600">({filteredDocs.length})</span>
//         </h1>
//         <p className="text-gray-500 mt-2">Jelajahi koleksi dokumen penelitian resmi Politeknik Negeri Jakarta</p>
//       </div>

//       {/* Search & Filter Bar */}
//       <div className="space-y-4">
//         <div className="relative group">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
//           <Input 
//             placeholder="Cari berdasarkan judul, penulis, atau kata kunci..." 
//             className="pl-12 h-14 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all text-lg"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
//           <Filter className="w-4 h-4 mr-1" />
//           <span className="font-bold mr-2 text-gray-400 uppercase text-[10px] tracking-widest">Filter by:</span>
//           <select className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500">
//             <option>Semua Tahun</option>
//             <option>2025</option>
//             <option>2024</option>
//           </select>
//           <select className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500">
//             <option>Semua Kategori</option>
//             <option>Skripsi</option>
//             <option>Jurnal</option>
//           </select>
//         </div>
//       </div>

//       {/* Loading State */}
//       {isLoading && (
//         <div className="flex flex-col items-center justify-center py-20 space-y-4">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
//           <p className="text-gray-500 font-medium">Menarik data dokumen dari server...</p>
//         </div>
//       )}

//       {/* Error State */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
//           <h2 className="text-lg font-bold text-gray-900">Ups! Terjadi Kesalahan</h2>
//           <p className="text-gray-600 max-w-md mx-auto">{error}</p>
//           <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
//             Coba Lagi
//           </Button>
//         </div>
//       )}

//       {/* Documents Grid */}
//       {!isLoading && !error && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {filteredDocs.length > 0 ? (
//             filteredDocs.map((doc) => (
//               /* Menggunakan Komponen Lokal DocumentCard */
//               <DocumentCard key={doc.id} doc={doc} />
//             ))
//           ) : (
//             <div className="col-span-full py-20 text-center space-y-3">
//               <BookOpen className="w-12 h-12 text-gray-200 mx-auto" />
//               <p className="text-gray-500">Tidak ada dokumen yang ditemukan dengan kata kunci tersebut.</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
