"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Edit3, Loader2, ShieldCheck, ShieldAlert, X } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal Moderasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/documents");
      const data = res.data?.data?.documents || res.data || [];
      setDocs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const openModal = (doc: any) => {
    setEditingDoc({ ...doc });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = Cookies.get("access_token");
      await api.patch(`/admin/documents/${editingDoc.id}`, {
        title: editingDoc.title,
        document_status: editingDoc.document_status,
        file_status: editingDoc.file_status,
        is_watermarked: editingDoc.is_watermarked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("✅ Dokumen berhasil diperbarui!");
      setIsModalOpen(false);
      fetchDocs(); // Refresh table
    } catch (error: any) {
      alert("❌ Gagal memperbarui dokumen: " + (error.response?.data?.message || "Error Server"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Dokumen</h1>
        <p className="text-gray-500 mt-1">Moderasi dan atur status akses literatur repositori.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Judul & Penulis</th>
                <th className="px-6 py-4 font-semibold">Status Dokumen</th>
                <th className="px-6 py-4 font-semibold">Status File</th>
                <th className="px-6 py-4 font-semibold">Watermark</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></td></tr>
              ) : docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900 line-clamp-1">{doc.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{doc.author}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${doc.document_status === 'Publik' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {doc.document_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${doc.file_status === 'Publik' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {doc.file_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.is_watermarked ? <ShieldCheck className="w-5 h-5 text-green-500" /> : <ShieldAlert className="w-5 h-5 text-gray-300" />}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button size="sm" variant="outline" onClick={() => openModal(doc)} className="h-8 gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT MODERASI */}
      {isModalOpen && editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">Moderasi Dokumen</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Judul Dokumen</label>
                <Input value={editingDoc.title} onChange={e => setEditingDoc({...editingDoc, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Status Dokumen</label>
                  <select 
                    className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm"
                    value={editingDoc.document_status} 
                    onChange={e => setEditingDoc({...editingDoc, document_status: e.target.value})}
                  >
                    <option value="Publik">Publik</option>
                    <option value="Private">Private</option>
                    <option value="Terbatas">Terbatas</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Status File</label>
                  <select 
                    className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm"
                    value={editingDoc.file_status} 
                    onChange={e => setEditingDoc({...editingDoc, file_status: e.target.value})}
                  >
                    <option value="Publik">Publik</option>
                    <option value="Terbatas">Terbatas</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="watermark"
                  checked={editingDoc.is_watermarked}
                  onChange={e => setEditingDoc({...editingDoc, is_watermarked: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="watermark" className="text-sm font-semibold text-gray-700">Watermark Terverifikasi (Bypass AI)</label>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-blue-600 text-white" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}