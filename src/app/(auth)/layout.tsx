import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Background menyesuaikan gambar referensi Anda
    <div className="min-h-screen bg-[#f3f4f8] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}