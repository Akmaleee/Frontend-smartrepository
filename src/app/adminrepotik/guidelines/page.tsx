"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Edit3, Loader2, Plus, X } from "lucide-react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminGuidelinesPage() {
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", step_number: 1, description: "" });

  const fetchGuidelines = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/guidelines");
      const data = res.data?.data || res.data || [];
      // Urutkan otomatis
      setGuidelines(data.sort((a: any, b: any) => a.step_number - b.step_number));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGuidelines(); }, []);

  const openAddModal = () => {
    setModalMode("add");
    // Rekomendasi step_number otomatis (step terakhir + 1)
    const nextStep = guidelines.length > 0 ? guidelines[guidelines.length - 1].step_number + 1 : 1;
    setFormData({ id: "", step_number: nextStep, description: "" });
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
      const payload = { step_number: Number(formData.step_number), description: formData.description };

      if (modalMode === "add") {
        await api.post("/admin/guidelines", payload, { headers });
        alert("✅ Langkah panduan ditambahkan!");
      } else {
        await api.patch(`/admin/guidelines/${formData.id}`, payload, { headers });
        alert("✅ Langkah panduan diperbarui!");
      }
      
      setIsModalOpen(false);
      fetchGuidelines();
    } catch (error: any) {
      alert("❌ Gagal menyimpan: " + (error.response?.data?.detail || "Error Server"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Panduan Upload</h1>
          <p className="text-gray-500 mt-1">Atur langkah-langkah tata cara upload dokumen.</p>
        </div>
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah Langkah
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold w-24 text-center">Step</th>
                <th className="px-6 py-4 font-semibold">Deskripsi Langkah</th>
                <th className="px-6 py-4 font-semibold text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={3} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></td></tr>
              ) : guidelines.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span className="w-8 h-8 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                      {item.step_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">{item.description}</td>
                  <td className="px-6 py-4 text-center">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(item)} className="h-8 gap-2">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900">{modalMode === "add" ? "Tambah" : "Edit"} Panduan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nomor Langkah (Step)</label>
                <Input type="number" min="1" required value={formData.step_number} onChange={e => setFormData({...formData, step_number: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Teks Deskripsi</label>
                <textarea 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-blue-600 text-white" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}