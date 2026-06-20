"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { 
  Users, Bell, CheckCircle2, AlertTriangle, Info, 
  FileText, Calendar, FileBox, CloudUpload, Loader2
} from "lucide-react";
import { api } from "@/lib/axios";

// Interface untuk tipe data statistik dari API
interface StatisticsData {
  total_documents: number;
  this_month_uploads: number;
  documents_per_year: {
    year: number;
    count: number;
  }[];
}

export default function HomePage() {
  const [userName, setUserName] = useState("Pengguna");

  // State Data Dinamis dari API
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const name = Cookies.get("user_name");
    if (name) setUserName(name);

    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // Menggabungkan semua fetch data publik secara paralel menggunakan Promise.all
        const [annRes, guideRes, statsRes] = await Promise.all([
          api.get("/announcements"),
          api.get("/guidelines"),
          api.get("/statistics") 
        ]);
        
        // 1. Parsing data pengumuman aktif
        let annData = annRes.data?.data || annRes.data || [];
        annData = annData.filter((item: any) => item.is_active);
        setAnnouncements(annData);

        // 2. Parsing data panduan upload (urut berdasarkan step_number)
        let guideData = guideRes.data?.data || guideRes.data || [];
        setGuidelines(guideData.sort((a: any, b: any) => a.step_number - b.step_number));

        // 3. Parsing data statistik dinamis dari database
        const statsData = statsRes.data?.data || statsRes.data;
        if (statsData) {
          setStats({
            total_documents: statsData.total_documents || 0,
            this_month_uploads: statsData.this_month_uploads || 0,
            // Urutkan tahun dari yang paling baru ke yang paling lama
            documents_per_year: (statsData.documents_per_year || []).sort((a: any, b: any) => b.year - a.year)
          });
        }

      } catch (error) {
        console.error("Gagal mengambil data CMS & Statistik Home:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const renderAnnouncementIcon = (type: string) => {
    if (type === "success") return <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />;
    if (type === "warning") return <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />;
    return <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />;
  };

  const renderAnnouncementStyle = (type: string) => {
    if (type === "success") return "bg-green-50/50 border-green-100";
    if (type === "warning") return "bg-yellow-50/50 border-yellow-100";
    return "bg-blue-50/50 border-blue-100";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:px-8 shadow-lg shadow-blue-600/20 flex items-center gap-5 relative overflow-hidden border border-blue-400/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-indigo-400 opacity-20 rounded-full translate-y-1/2 blur-xl"></div>
        
        <Users className="w-12 h-12 text-white/90 shrink-0 hidden sm:block relative z-10" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            Selamat Datang, {userName}!
          </h1>
          <p className="text-blue-50 mt-1.5 text-sm sm:text-base font-medium opacity-90">
            Jelajahi koleksi dokumen penelitian dan unggah karya Anda
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI (Pengumuman Dinamis) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Bell className="w-6 h-6 text-blue-600" /> Pengumuman
          </h2>

          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : announcements.length === 0 ? (
            <p className="text-gray-500 italic p-4">Belum ada pengumuman saat ini.</p>
          ) : (
            announcements.map((item) => (
              <div key={item.id} className={`border rounded-2xl p-5 flex gap-4 ${renderAnnouncementStyle(item.type)}`}>
                {renderAnnouncementIcon(item.type)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded">Admin</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* KOLOM KANAN (Panduan & Statistik Tahunan Dinamis) */}
        <div className="space-y-6">
          
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-blue-600" /> Panduan Upload
          </h2>

          {/* Card Panduan Upload */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-bold text-blue-600 mb-5">Langkah-langkah Upload:</p>
            {isLoading ? (
               <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : guidelines.length === 0 ? (
              <p className="text-gray-500 text-sm">Panduan belum tersedia.</p>
            ) : (
              <ul className="space-y-4">
                {guidelines.map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {item.step_number}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }}></p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card Statistik Tahunan (DIUBAH MENJADI DINAMIS) */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-800 text-sm">Dokumen Terupload per Tahun</h3>
            </div>
            <div className="p-2">
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
              ) : !stats || stats.documents_per_year.length === 0 ? (
                <p className="text-gray-500 text-xs p-4 italic text-center">Belum ada riwayat tahunan.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {/* Mapping Array Hasil dari Database */}
                  {stats.documents_per_year.map((stat, idx) => (
                    <li key={idx} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="font-bold text-gray-700">Tahun {stat.year}</span>
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black tracking-wider">
                        {stat.count.toLocaleString()} <span className="font-medium text-blue-500 ml-0.5">DOKUMEN</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM METRICS (DIUBAH MENJADI DINAMIS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        {/* Card Total Dokumen Dinamis */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
            <FileBox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Dokumen</p>
            <h4 className="text-2xl font-black text-gray-900">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                (stats?.total_documents || 0).toLocaleString()
              )}
            </h4>
          </div>
        </div>

        {/* Card Upload Bulan Ini Dinamis */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
          <div className="bg-green-50 p-4 rounded-xl text-green-600">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Upload Bulan Ini</p>
            <h4 className="text-2xl font-black text-gray-900">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                (stats?.this_month_uploads || 0).toLocaleString()
              )}
            </h4>
          </div>
        </div>

      </div>

    </div>
  );
}
