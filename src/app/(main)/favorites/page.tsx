"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  Eye, 
  Loader2, 
  AlertCircle,
  Calendar,
  BookOpen,
  Star,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

// 1. Interface Dokumen yang Diperbarui (menambahkan is_favorited)
interface Document {
  id: string;
  title: string;
  author: string;
  prodi: string;
  year: number;
  category?: string;
  tags: string[];
  summary?: string; 
  highlight: string;
  views_count: number;
  downloads_count: number;
  ai_status: string;
  is_watermarked: boolean;
  is_favorited?: boolean; // <-- Tambahan baru
}

// ============================================================================
// KOMPONEN CARD KHUSUS DENGAN OPTIMISTIC UI
// (Sengaja dipisah agar state bintang bisa mandiri per dokumen)
// ============================================================================
const FavoriteDocumentCard = ({ doc }: { doc: Document }) => {
  const router = useRouter();
  
  // State lokal untuk Optimistic UI (Default true karena ini halaman favorit,
  // atau mengambil nilai dari doc.is_favorited jika dari endpoint global)
  const [isFavorited, setIsFavorited] = useState<boolean>(doc.is_favorited !== false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // Mencegah card ikut ter-klik jika ada fungsi buka detail

    // 1. OPTIMISTIC UPDATE: Langsung ubah UI tanpa menunggu backend
    const previousState = isFavorited;
    setIsFavorited(!previousState);

    try {
      // 2. Eksekusi API di background
      await api.post(`/documents/${doc.id}/favorite`);
    } catch (error) {
      // 3. ROLLBACK: Jika gagal, kembalikan bintang ke state awal dan beri tahu user
      console.error("Gagal toggle favorit:", error);
      setIsFavorited(previousState);
      // Bisa diganti menggunakan library toast seperti react-hot-toast/sonner
      alert("Gagal memperbarui status favorit. Silakan periksa koneksi server Anda."); 
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl overflow-hidden bg-white flex flex-col border-l-4 border-l-yellow-400">
      <CardContent className="p-6 space-y-4 flex-grow">
        
        {/* Kategori & Tombol Bintang */}
        <div className="flex justify-between items-start">
          <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
            {doc.category || "Research"}
          </span>
          
          {/* --- TOMBOL BINTANG (FAVORIT) --- */}
          <button 
            onClick={toggleFavorite}
            className="p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none"
            title={isFavorited ? "Hapus dari Favorit" : "Tambahkan ke Favorit"}
          >
            <Star 
              className={`w-6 h-6 transition-colors duration-200 ${
                isFavorited 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-400"
              }`} 
            />
          </button>
        </div>

        {/* Judul & Tanggal */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {doc.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Tahun {doc.year}</span>
          </div>
        </div>

        {/* Baris Status (Watermark & AI) */}
        <div className="flex flex-wrap gap-2 py-1">
          <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-md border ${
            doc.is_watermarked 
              ? 'bg-indigo-50/50 text-indigo-700 border-indigo-100' 
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            {doc.is_watermarked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            WATERMARK: {doc.is_watermarked ? 'VERIFIED' : 'PENDING'}
          </div>

          <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-md border ${
            doc.ai_status === 'COMPLETED' 
              ? 'bg-emerald-50/50 text-emerald-700 border-emerald-100' 
              : 'bg-amber-50/50 text-amber-700 border-amber-100'
          }`}>
            {doc.ai_status === 'COMPLETED' ? <Bot className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            RINGKASAN AI: {doc.ai_status === 'COMPLETED' ? 'COMPLETED' : 'PROCESSING'}
          </div>
        </div>

        {/* Highlight */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed italic">
          {doc.summary || doc.highlight || "Ringkasan otomatis belum tersedia."}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {doc.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              #{tag.toLowerCase()}
            </span>
          ))}
        </div>
      </CardContent>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {doc.views_count}</div>
          <div className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {doc.downloads_count}</div>
        </div>
        <Button 
          size="sm" 
          variant="link"
          className="text-blue-600 font-bold p-0 h-auto"
          onClick={() => router.push(`/documents/${doc.id}`)}
        >
          Buka Detail →
        </Button>
      </div>
    </Card>
  );
};


// ============================================================================
// HALAMAN UTAMA DAFTAR FAVORIT
// ============================================================================
export default function FavoritesPage() {
  const router = useRouter();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Ambil Data Favorit
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        // Memanggil endpoint khusus favorites (Token otomatis dari axios interceptor)
        const response = await api.get("/documents/favorites");
        
        let fetchedData = [];
        if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
          fetchedData = response.data.data.documents;
        } else if (Array.isArray(response.data)) {
          fetchedData = response.data;
        }

        setDocuments(fetchedData);
        setFilteredDocs(fetchedData);
      } catch (err: any) {
        setError("Gagal memuat dokumen favorit Anda. Silakan coba lagi.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Fitur Pencarian Lokal
  useEffect(() => {
    const results = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDocs(results);
  }, [searchQuery, documents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Dokumen Favorit <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
          </h1>
          <p className="text-gray-500 mt-1">Kumpulan dokumen yang telah Anda tandai sebagai favorit</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
        <Input 
          placeholder="Cari di koleksi favorit Anda..." 
          className="pl-12 h-14 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* States (Loading / Error) */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Memuat koleksi bintang Anda...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-gray-600 font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Coba Lagi</Button>
        </div>
      )}

      {/* Render Documents Grid menggunakan Komponen Local FavoriteDocumentCard */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <FavoriteDocumentCard key={doc.id} doc={doc} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-gray-900 font-bold">Belum ada dokumen favorit</p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Tandai dokumen penelitian dengan menekan ikon bintang agar muncul di sini.</p>
              </div>
              <Button onClick={() => router.push('/documents')} variant="outline" className="mt-2 border-blue-200 text-blue-600">
                Jelajahi Dokumen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}