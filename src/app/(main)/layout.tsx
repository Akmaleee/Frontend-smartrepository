import React from "react";
import Navbar from "@/components/layouts/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      {/* Navbar Global */}
      <Navbar />
      
      {/* Konten Halaman */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}