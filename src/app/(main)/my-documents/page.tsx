"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Loader2, 
  AlertCircle,
  Calendar,
  BookOpen,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Clock,
  X 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

// Tambahkan "summary" opsional karena mungkin backend mengembalikannya juga
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
}

export default function MyDocumentsPage() {
  const router = useRouter();
  
  // State Dokumen Utama
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk Modal Edit Summary
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState("");
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  // 1. Fungsi Fetch Data (Kita pisahkan agar bisa dipanggil ulang setelah edit)
  const fetchMyDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/documents/me");
      
      let fetchedData = [];
      if (response.data?.data?.documents && Array.isArray(response.data.data.documents)) {
        fetchedData = response.data.data.documents;
      } else if (Array.isArray(response.data)) {
        fetchedData = response.data;
      }

      setDocuments(fetchedData);
      setFilteredDocs(fetchedData);
    } catch (err: any) {
      setError("Gagal memuat dokumen Anda. Pastikan sesi login masih aktif.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetchMyDocuments saat halaman pertama kali dirender
  useEffect(() => {
    fetchMyDocuments();
  }, []);

  // 2. Logika Pencarian Lokal
  useEffect(() => {
    const results = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDocs(results);
  }, [searchQuery, documents]);

  // 3. Fungsi Buka Modal Edit
  const openEditModal = (doc: Document) => {
    setEditingDocId(doc.id);
    // Masukkan data summary (jika tidak ada summary, ambil dari highlight)
    setEditingSummary(doc.summary || doc.highlight || "");
    setIsEditModalOpen(true);
  };

  // 4. Fungsi Simpan Perubahan Summary ke Backend
  const handleUpdateSummary = async () => {
    if (!editingDocId) return;
    
    setIsSavingSummary(true);
    try {
      // Kita menggunakan api dari axios instance (token otomatis disisipkan di interceptor)
      await api.patch(`/documents/${editingDocId}/summary`, {
        summary: editingSummary
      });

      // Tutup modal
      setIsEditModalOpen(false);
      
      // Refresh data di UI agar ringkasan ter-update
      await fetchMyDocuments(); 

    } catch (err: any) {
      console.error("Gagal menyimpan ringkasan:", err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan ringkasan.");
    } finally {
      setIsSavingSummary(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8 relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Dokumen Saya <span className="text-blue-600 text-xl">({filteredDocs.length})</span>
          </h1>
          <p className="text-gray-500 mt-1">Kelola dokumen penelitian yang telah Anda unggah ke sistem</p>
        </div>
        <Button 
          onClick={() => router.push('/upload')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 px-6 shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" /> Unggah Dokumen Baru
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
        <Input 
          placeholder="Cari di koleksi pribadi Anda..." 
          className="pl-12 h-14 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Menyiapkan koleksi Anda...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-gray-600 font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Coba Lagi</Button>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-xl transition-all duration-300 border-gray-100 rounded-2xl overflow-hidden bg-white flex flex-col border-l-4 border-l-blue-500">
                <CardContent className="p-6 space-y-4 flex-grow">
                  
                  {/* Kategori & Aksi */}
                  <div className="flex justify-between items-start">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                      {doc.category || "Research"}
                    </span>
                    <div className="flex gap-2">
                      {/* --- TOMBOL EDIT RINGKASAN --- */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => openEditModal(doc)}
                        title="Edit Ringkasan AI"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>

                      {/* Tombol Delete telah dihapus dari sini */}
                    </div>
                  </div>

                  {/* Judul & Tanggal */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Diunggah pada {doc.year}</span>
                    </div>
                  </div>

                  {/* --- BARIS STATUS (Watermark & AI) --- */}
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
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-gray-900 font-bold">Belum ada dokumen</p>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">Anda belum mengunggah dokumen apapun ke repositori ini.</p>
              </div>
              <Button onClick={() => router.push('/upload')} variant="outline" className="mt-2 border-blue-200 text-blue-600">
                Mulai Mengunggah
              </Button>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL EDIT SUMMARY --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Edit Ringkasan AI
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Textarea) */}
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-3">
                Silakan perbaiki atau sesuaikan ringkasan hasil ekstraksi AI di bawah ini:
              </p>
              <textarea
                value={editingSummary}
                onChange={(e) => setEditingSummary(e.target.value)}
                className="w-full h-64 p-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all leading-relaxed"
                placeholder="Tulis ringkasan dokumen di sini..."
              />
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingSummary}
                className="border-gray-300"
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpdateSummary}
                disabled={isSavingSummary || !editingSummary.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-[140px]"
              >
                {isSavingSummary ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
