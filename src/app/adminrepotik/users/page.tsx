"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Loader2, UserCheck, UserX, UserPlus, X, Eye, EyeOff, Shield, Mail, Lock, Hash, BookOpen, AlertCircle } from "lucide-react";
import { api } from "@/lib/axios";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE MODAL & FORM TAMBAH PENGGUNA ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    nim: "",
    role: "USER",
    prodi: "Teknik Informatika",
    password: ""
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // --- FUNGSI FETCH UTAMA ---
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("access_token");
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- HANDLER UBAH ROLE LAMA ---
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = Cookies.get("access_token");
      await api.patch(`/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`✅ Role berhasil diubah menjadi ${newRole}`);
      fetchUsers(); 
    } catch (error: any) {
      alert("❌ Gagal merubah role.");
    }
  };

  // --- HANDLER STATUS AKTIF LAMA ---
  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      const token = Cookies.get("access_token");
      const newStatus = !currentStatus;
      await api.patch(`/admin/users/${userId}/status`, { active: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`✅ Akun berhasil ${newStatus ? 'Diaktifkan' : 'Diblokir'}`);
      fetchUsers(); 
    } catch (error: any) {
      alert("❌ Gagal merubah status akun.");
    }
  };

  // --- LOGIKA FORM TAMBAH PENGGUNA BARU ---
  const openAddModal = () => {
    setFormData({ full_name: "", email: "", nim: "", role: "USER", prodi: "Teknik Informatika", password: "" });
    setEmailError("");
    setPasswordError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    // VALIDASI NIM
    if (id === "nim") {
      const onlyNumbers = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [id]: onlyNumbers }));
      return; 
    }

    setFormData(prev => ({ ...prev, [id]: value }));

    // VALIDASI EMAIL PNJ
    if (id === "email") {
      const pnjEmailRegex = /^[^\s@]+@([a-z0-9-]+\.)*pnj\.ac\.id$/i;
      if (value.trim() === "") setEmailError(""); 
      else if (!pnjEmailRegex.test(value)) setEmailError("Gunakan email akademik (.pnj.ac.id)");
      else setEmailError(""); 
    }

    // VALIDASI PASSWORD KETAT
    if (id === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (value.trim() === "") setPasswordError("");
      else if (!passwordRegex.test(value)) setPasswordError("Min 8 karakter, wajib huruf besar, kecil, angka & simbol.");
      else setPasswordError("");
    }
  };

  const isFormValid = 
    formData.full_name.trim() !== "" && 
    formData.nim.trim() !== "" && 
    formData.email.trim() !== "" && 
    formData.password.trim() !== "" && 
    emailError === "" &&
    passwordError === "";

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSaving(true);
    try {
      const token = Cookies.get("access_token");
      const payload = { ...formData };
      
      // Kosongkan prodi jika role adalah ADMIN
      if (payload.role === "ADMIN") {
        payload.prodi = "";
      }

      await api.post("/admin/users", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Pengguna berhasil ditambahkan!");
      setIsModalOpen(false);
      fetchUsers(); // Refresh tabel otomatis
    } catch (error: any) {
      alert("❌ Gagal menambahkan pengguna: " + (error.response?.data?.message || error.response?.data?.detail || "Server Error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* HEADER & TOMBOL TAMBAH */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola data mahasiswa dan hak akses administrator.</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> Tambah Pengguna
        </button>
      </div>

      {/* TABEL DATA LAMA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Pengguna</th>
                <th className="px-6 py-4 font-semibold">NIM</th>
                <th className="px-6 py-4 font-semibold">Jabatan (Role)</th>
                <th className="px-6 py-4 font-semibold text-center">Status / Aksi Blokir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600"/></td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{user.name || user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{user.nim || '-'}</td>
                  
                  <td className="px-6 py-4">
                    <select 
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-semibold cursor-pointer outline-none"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="DOSEN">DOSEN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleStatusChange(user.id, user.active)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        user.active 
                          ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700 group" 
                          : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700 group"
                      }`}
                      title={user.active ? "Klik untuk memblokir" : "Klik untuk mengaktifkan"}
                    >
                      {user.active ? (
                        <><UserCheck className="w-4 h-4 group-hover:hidden" /><UserX className="w-4 h-4 hidden group-hover:block" /> Aktif</>
                      ) : (
                        <><UserX className="w-4 h-4 group-hover:hidden" /><UserCheck className="w-4 h-4 hidden group-hover:block" /> Terblokir</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !isLoading && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-500">Belum ada pengguna.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH PENGGUNA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Tambah Pengguna Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="addUserForm" onSubmit={handleAddUser} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label htmlFor="full_name" className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                  <input id="full_name" required value={formData.full_name} onChange={handleChange} placeholder="Contoh: Budi Santoso" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="nim" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Hash className="w-3.5 h-3.5"/> NIM / NIP</label>
                    <input id="nim" required value={formData.nim} onChange={handleChange} placeholder="Maks 10 digit" className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="role" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Shield className="w-3.5 h-3.5"/> Role Akun</label>
                    <select id="role" value={formData.role} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="USER">USER (Mahasiswa)</option>
                      <option value="DOSEN">DOSEN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                {formData.role !== "ADMIN" ? (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2">
                    <label htmlFor="prodi" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"><BookOpen className="w-3.5 h-3.5"/> Program Studi</label>
                    <select id="prodi" value={formData.prodi} onChange={handleChange} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Teknik Multimedia dan Jaringan">Teknik Multimedia dan Jaringan</option>
                      <option value="Teknik Multimedia Digital">Teknik Multimedia Digital</option>
                    </select>
                  </div>
                ) : (
                   <div className="p-3 bg-purple-50 text-purple-700 text-xs rounded-lg flex gap-2 items-center font-medium border border-purple-100">
                     <AlertCircle className="w-4 h-4 shrink-0" />
                     Role Admin tidak diikat pada Program Studi tertentu.
                   </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  <label htmlFor="email" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Mail className="w-3.5 h-3.5"/> Email Akademik</label>
                  <input id="email" type="email" required 
                    className={`w-full h-10 px-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${emailError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    value={formData.email} onChange={handleChange} placeholder="nama@stu.pnj.ac.id"
                  />
                  {emailError && <p className="text-xs font-semibold text-red-500">{emailError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"><Lock className="w-3.5 h-3.5"/> Kata Sandi Awal</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? "text" : "password"} required 
                      className={`w-full h-10 pl-3 pr-10 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${passwordError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      value={formData.password} onChange={handleChange} placeholder="Kombinasi huruf, angka, simbol"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs font-semibold text-red-500 leading-tight">{passwordError}</p>}
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 border border-gray-300 transition-colors">
                Batal
              </button>
              <button type="submit" form="addUserForm" disabled={!isFormValid || isSaving} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all flex items-center min-w-[140px] justify-center shadow-md">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Pengguna"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
