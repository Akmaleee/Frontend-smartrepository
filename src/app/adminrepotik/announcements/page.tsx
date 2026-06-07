"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Edit3, Loader2, Plus, X } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", title: "", content: "", type: "info", is_active: true });

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("access_token");
      
      // 1. Panggil URL absolut secara eksplisit beserta header token
      const res = await api.get("http://127.0.0.1:8000/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnnouncements(res.data?.data || res.data || []);
    } catch (error: any) {
      // 3. Tangkap dan log detail error ke console browser
      console.error("Error Fetch Announcements:", error.response || error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const openAddModal = () => {
    setModalMode("add");
    setFormData({ id: "", title: "", content: "", type: "info", is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = Cookies.get("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = { 
        title: formData.title, 
        content: formData.content, 
        type: formData.type, 
        is_active: formData.is_active 
      };

      if (modalMode === "add") {
        // Gunakan URL Absolut untuk POST
        await api.post("http://127.0.0.1:8000/admin/announcements", payload, { headers });
        alert("✅ Pengumuman ditambahkan!");
      } else {
        // Gunakan URL Absolut untuk PATCH
        await api.patch(`http://127.0.0.1:8000/admin/announcements/${formData.id}`, payload, { headers });
        alert("✅ Pengumuman diperbarui!");
      }
      
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      // Tangkap dan log detail error ke console browser
      console.error("Error Submit Announcement:", error.response || error);
      alert("❌ Gagal menyimpan: " + (error.response?.data?.detail || "Error Server"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pengumuman</h1>
          <p className="text-gray-500 mt-1">Atur informasi yang tampil di halaman utama.</p>
        </div>
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200">
          <Plus className="w-4 h-4" /> Tambah Pengumuman
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Judul & Isi</th>
                <th className="px-6 py-4 font-semibold">Tipe</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></td></tr>
              ) : announcements.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="font-bold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 uppercase">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(item)} className="h-8 gap-2 border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    Belum ada pengumuman.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">{modalMode === "add" ? "Tambah" : "Edit"} Pengumuman</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Judul</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="focus:ring-blue-500 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Isi Pengumuman</label>
                <textarea 
                  required 
                  className="w-full min-h-[100px] p-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Tipe Warna/Ikon</label>
                  <select 
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="info">Info (Biru)</option>
                    <option value="warning">Warning (Kuning)</option>
                    <option value="success">Success (Hijau)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Tampilkan (Aktif)</label>
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl border-gray-200 hover:bg-gray-50">Batal</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 transition-all" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Pengumuman"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
