"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; 
import Cookies from "js-cookie";
import { Home, Library, Folder, Star, Upload, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

import logoPnj from "../../public/logo-pnj.png"; 

export default function Navbar() {
  const pathname = usePathname();
  
  // State RBAC
  const [isGuest, setIsGuest] = useState(true);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = Cookies.get("access_token");
    const name = Cookies.get("user_name");
    const role = Cookies.get("user_role");
    
    if (token) {
      setIsGuest(false);
      setUserName(name || "Pengguna");
      setUserRole(role || "USER");
    } else {
      setIsGuest(true);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user_name");
    Cookies.remove("user_role");
    window.location.href = "/login";
  };

  const isPathActive = (path: string) => {
    if (path === '/') return pathname === '/'; 
    return pathname?.startsWith(path); 
  };

  const getMenuClass = (path: string) => {
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200";
    const activeClass = "bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100/50";
    const inactiveClass = "text-gray-500 hover:text-gray-900 hover:bg-gray-50";
    return `${baseClass} ${isPathActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="border-b border-gray-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/95 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">
          
          <Link href="/" className="flex items-center gap-3 group transition-all duration-300">
            <div className="relative w-11 h-11 drop-shadow-sm flex justify-center items-center transition-transform duration-300 group-hover:scale-105">
              <Image src={logoPnj} alt="Logo PNJ" className="w-full h-full object-contain" priority />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
              Repository <span className="text-blue-600 font-black">TIK</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1 ml-4">
            <Link href="/" className={getMenuClass('/')}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/documents" className={getMenuClass('/documents')}>
              <Library className="w-4 h-4" /> All Documents
            </Link>
            
            {/* HANYA TAMPIL JIKA BUKAN GUEST */}
            {!isGuest && (
              <>
                <Link href="/my-documents" className={getMenuClass('/my-documents')}>
                  <Folder className="w-4 h-4" /> Dokumen Saya
                </Link>
                <Link href="/favorites" className={getMenuClass('/favorites')}>
                  <Star className="w-4 h-4" /> Favorites
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {isGuest ? (
              // TOMBOL LOGIN UNTUK GUEST
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200/50 h-10 px-6 rounded-full transition-all hover:scale-[1.02]">
                  <LogIn className="w-4 h-4" /> Masuk / Login
                </Button>
              </Link>
            ) : (
              // PROFIL & UPLOAD UNTUK USER/DOSEN/ADMIN
              <>
                <Link href="/upload" className="hidden sm:block">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200/50 h-10 px-5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Upload className="w-4 h-4" /> Unggah Dokumen
                  </Button>
                </Link>
                
                <div className="flex items-center gap-3 sm:border-l border-gray-200 sm:pl-5 sm:ml-1">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-gray-900 leading-tight">{userName}</div>
                    <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-0.5">{userRole}</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium bg-gray-50 px-3 py-2.5 rounded-full hover:bg-red-50 border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}