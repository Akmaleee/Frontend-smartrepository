"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { api } from "@/lib/axios";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
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

  // Handler Ubah Role
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = Cookies.get("access_token");
      await api.patch(`/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`✅ Role berhasil diubah menjadi ${newRole}`);
      fetchUsers(); // Refresh UI
    } catch (error: any) {
      alert("❌ Gagal merubah role.");
    }
  };

  // Handler Aktif / Blokir Akun
  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      const token = Cookies.get("access_token");
      const newStatus = !currentStatus;
      await api.patch(`/admin/users/${userId}/status`, { active: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`✅ Akun berhasil ${newStatus ? 'Diaktifkan' : 'Diblokir'}`);
      fetchUsers(); // Refresh UI
    } catch (error: any) {
      alert("❌ Gagal merubah status akun.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-500 mt-1">Kelola data mahasiswa dan hak akses administrator.</p>
      </div>

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
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{user.nim || '-'}</td>
                  
                  {/* Aksi 1: Ubah Role (Dropdown) */}
                  <td className="px-6 py-4">
                    <select 
                      className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-semibold cursor-pointer"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  
                  {/* Aksi 2: Toggle Status Aktif (Button) */}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}