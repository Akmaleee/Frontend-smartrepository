"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { LayoutDashboard, FileText, Users, Loader2, ArrowLeft, Megaphone, ListOrdered } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user_role");
    if (role !== "ADMIN") {
      alert("Akses Ditolak: Anda tidak memiliki izin untuk masuk ke Panel Admin.");
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // --- MENU BARU DITAMBAHKAN DI SINI ---
  const navItems = [
    { name: "Dashboard", href: "/adminrepotik", icon: LayoutDashboard },
    { name: "Manajemen Dokumen", href: "/adminrepotik/documents", icon: FileText },
    { name: "Manajemen Pengguna", href: "/adminrepotik/users", icon: Users },
    { name: "Kelola Pengumuman", href: "/adminrepotik/announcements", icon: Megaphone },
    { name: "Kelola Panduan", href: "/adminrepotik/guidelines", icon: ListOrdered },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Admin Panel</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}>
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Kembali ke Web
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
        {children}
      </main>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import Cookies from "js-cookie";
// import { LayoutDashboard, FileText, Users, Loader2, ArrowLeft } from "lucide-react";
// import Link from "next/link";

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const role = Cookies.get("user_role");
//     // Route Guard: Tendang user jika bukan ADMIN
//     if (role !== "ADMIN") {
//       alert("Akses Ditolak: Anda tidak memiliki izin untuk masuk ke Panel Admin.");
//       router.replace("/");
//     } else {
//       setIsAuthorized(true);
//     }
//   }, [router]);

//   if (!isAuthorized) {
//     return (
//       <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
//         <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   // --- PERUBAHAN DI SINI: Update href menjadi /adminrepotik ---
//   const navItems = [
//     { name: "Dashboard", href: "/adminrepotik", icon: LayoutDashboard },
//     { name: "Manajemen Dokumen", href: "/adminrepotik/documents", icon: FileText },
//     { name: "Manajemen Pengguna", href: "/adminrepotik/users", icon: Users },
//   ];

//   return (
//     <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
//       {/* Sidebar */}
//       <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
//         <div className="h-16 flex items-center px-6 border-b border-gray-100">
//           <h1 className="text-xl font-black text-gray-900 tracking-tight">Admin Panel</h1>
//         </div>
        
//         <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
//           {navItems.map((item) => {
//             const isActive = pathname === item.href;
//             return (
//               <Link key={item.name} href={item.href}>
//                 <span className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
//                   isActive 
//                     ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
//                     : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
//                 }`}>
//                   <item.icon className="w-5 h-5" />
//                   {item.name}
//                 </span>
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t border-gray-100">
//           <button 
//             onClick={() => router.push("/")}
//             className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-all"
//           >
//             <ArrowLeft className="w-5 h-5" /> Kembali ke Web
//           </button>
//         </div>
//       </aside>

//       {/* Main Content Area */}
//       <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
//         {children}
//       </main>
//     </div>
//   );
// }
