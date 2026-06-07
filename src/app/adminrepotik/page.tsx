"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FileText, Users, Unlock, Lock, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/axios";

interface DashboardData {
  metrics: {
    total_documents: number;
    total_users: number;
    public_documents: number;
    private_documents: number;
  };
  top_documents: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = Cookies.get("access_token");
        const res = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch admin dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading || !data) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const metrics = [
    { title: "Total Dokumen", value: data.metrics.total_documents, icon: FileText, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Pengguna", value: data.metrics.total_users, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Dokumen Publik", value: data.metrics.public_documents, icon: Unlock, color: "text-green-600", bg: "bg-green-100" },
    { title: "Dokumen Private", value: data.metrics.private_documents, icon: Lock, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Ringkasan aktivitas repositori cerdas Anda.</p>
      </div>

      {/* 4 Cards Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <Card key={idx} className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${m.bg}`}>
                <m.icon className={`w-6 h-6 ${m.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{m.title}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{m.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Documents Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Top Dokumen (Paling Banyak Dilihat)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Judul Dokumen</th>
                <th className="px-6 py-4 font-semibold">Penulis</th>
                <th className="px-6 py-4 font-semibold text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {data.top_documents?.map((doc, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{doc.title}</td>
                  <td className="px-6 py-4 text-gray-600">{doc.author}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                      <Eye className="w-3.5 h-3.5" /> {doc.views_count}
                    </span>
                  </td>
                </tr>
              ))}
              {data.top_documents?.length === 0 && (
                <tr><td colSpan={3} className="text-center py-10 text-gray-500">Belum ada dokumen.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}