"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, Download, Eye, Calendar, 
  User as UserIcon, BookOpen, CheckCircle2, Copy, AlertCircle, Loader2,
  MessageCircle, X, Send, Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";
import Cookies from "js-cookie";

interface DocumentDetail {
  id: string;
  title: string;
  author: string;
  author_degree?: string;
  publication_date: string;
  year: number;
  language: string;
  category?: string;
  prodi: string;
  document_status: string;
  file_status: string;
  summary: string;
  highlight: string;
  tags: string[];
  filename: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
  views_count: number;
  downloads_count: number;
  ai_status: string;
  citations: {
    mla: string;
    apa: string;
    ieee: string;
    harvard: string;
  };
}

// Interface untuk pesan chat
interface ChatMessage {
  role: "user" | "bot";
  content: string;
  isHtml?: boolean;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // State Dokumen
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

  // State Chatbot AI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "bot", content: "Halo! Saya AI Asisten. Ada yang ingin Anda tanyakan mengenai isi dokumen ini?", isHtml: false }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    setIsGuest(!token);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  useEffect(() => {
    if (!id) return;

    const fetchDocumentDetail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/documents/${id}`);
        // Sesuaikan dengan struktur JSON backend
        const docData = response.data.data || response.data;
        setDoc(docData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Gagal memuat detail dokumen.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentDetail();
  }, [id]);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(format);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    if (!doc?.file_url) return;
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.download = doc.filename || "dokumen.pdf"; 
    link.target = "_blank"; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading || !doc) return;

    const userQuery = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userQuery }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('query', userQuery); 
      formData.append('filename', doc.filename);

      const response = await api.post('/chat-document', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const answerHtml = response.data.data.answer;
      setChatMessages(prev => [...prev, { role: "bot", content: answerHtml, isHtml: true }]);

    } catch (error: any) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: "bot", content: "Maaf, terjadi kesalahan saat menghubungi server AI.", isHtml: false }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Memuat detail dokumen...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Dokumen Tidak Ditemukan</h2>
        <p className="text-gray-600">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans space-y-4 relative">
      
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Kembali ke Daftar Dokumen
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-4 md:px-5 md:py-4 border border-gray-100 shadow-sm flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                {doc.category || "Dokumen"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${doc.document_status === 'Publik' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {doc.document_status || "Publik"}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {doc.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 border-t border-gray-100 pt-2 mt-1">
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium text-gray-800">{doc.author}</span>
                {doc.author_degree && <span className="text-gray-500">, {doc.author_degree}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-700">{doc.prodi}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-700">Tahun {doc.year}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {doc.tags?.map((tag, idx) => (
                <span key={idx} className="bg-gray-50 text-gray-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* --- ABSTRAK / RINGKASAN TERSTRUKTUR (HTML dari IndoT5 Lokal) --- */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Ringkasan Abstraktif</h3>
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
                <Bot className="w-3 h-3" /> Model IndoT5
              </span>
            </div>
            
            <div className="space-y-6">
              {doc.summary ? (
                <div 
                  className="text-gray-700 leading-relaxed text-justify prose prose-sm max-w-none prose-p:mb-3"
                  dangerouslySetInnerHTML={{ __html: doc.summary }} 
                />
              ) : (
                <p className="text-gray-500 italic text-sm">Ringkasan belum tersedia.</p>
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          <Card className="border-blue-100 shadow-md border-t-4 border-t-blue-600 overflow-hidden">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="bg-red-50 p-2.5 rounded-lg">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs break-all line-clamp-2">{doc.filename}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{doc.file_type} • {formatBytes(doc.file_size_bytes)}</p>
                </div>
              </div>

              {/* PERUBAHAN: Hanya menampilkan "Dilihat" di tengah */}
              <div className="flex justify-center border-y py-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{doc.views_count}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Dilihat</div>
                </div>
              </div>

              <div className="space-y-2">
                {(doc.file_status === 'Publik' || doc.file_status === 'Public') ? (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh PDF
                  </Button>
                ) : (
                  <p className="text-[10px] text-center text-red-500 font-bold bg-red-50 py-2 rounded">
                    AKSES FILE TERBATAS
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sitasi Otomatis */}
          {doc.citations && (
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="py-3 px-5 border-b bg-gray-50/50">
                <CardTitle className="text-xs flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Sitasi Otomatis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {['APA', 'IEEE', 'MLA', 'Harvard'].map((format) => {
                  const formatKey = format.toLowerCase() as keyof typeof doc.citations;
                  if (!doc.citations[formatKey]) return null;
                  
                  return (
                    <div key={format} className="p-4 border-b last:border-0 hover:bg-gray-50 transition-colors group relative">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-blue-700 tracking-wider uppercase">{format} Style</span>
                        <button 
                          onClick={() => copyToClipboard(doc.citations[formatKey], format)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {copiedCitation === format ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed pr-4">{doc.citations[formatKey]}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- FLOATING CHATBOT WIDGET --- */}
      {!isGuest && (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <Card className="w-80 sm:w-96 mb-4 shadow-2xl border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Tanya Dokumen AI
                </h3>
                <p className="text-[10px] text-blue-100 mt-0.5 line-clamp-1 opacity-80">{doc.title}</p>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-blue-100 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                      msg.role === "user" 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                    }`}
                  >
                    {msg.isHtml ? (
                      <div 
                        className="prose prose-sm prose-p:my-1 prose-p:leading-snug prose-span:text-blue-700" 
                        dangerouslySetInnerHTML={{ __html: msg.content }} 
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex w-full justify-start">
                  <div className="bg-white border border-gray-100 text-gray-500 rounded-xl rounded-tl-none px-4 py-2 shadow-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanyakan sesuatu..." 
                  className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 text-sm"
                  disabled={isChatLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700"
                  disabled={isChatLoading || !chatInput.trim()}
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </form>
            </div>
          </Card>
        )}

        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            title="Tanya AI tentang dokumen ini"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>
        )}
    </div>
  );
}


// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { 
//   ArrowLeft, FileText, Download, Eye, Calendar, 
//   User as UserIcon, BookOpen, CheckCircle2, Copy, AlertCircle, Loader2,
//   MessageCircle, X, Send, Bot
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { api } from "@/lib/axios";
// import Cookies from "js-cookie";

// interface DocumentDetail {
//   id: string;
//   title: string;
//   author: string;
//   author_degree?: string;
//   publication_date: string;
//   year: number;
//   language: string;
//   category?: string;
//   prodi: string;
//   document_status: string;
//   file_status: string;
//   summary: string;
//   highlight: string;
//   tags: string[];
//   filename: string;
//   file_url: string;
//   file_type: string;
//   file_size_bytes: number;
//   views_count: number;
//   downloads_count: number;
//   ai_status: string;
//   citations: {
//     mla: string;
//     apa: string;
//     ieee: string;
//     harvard: string;
//   };
// }

// // Interface untuk pesan chat
// interface ChatMessage {
//   role: "user" | "bot";
//   content: string;
//   isHtml?: boolean;
// }

// export default function DocumentDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params.id as string;

//   // State Dokumen
//   const [doc, setDoc] = useState<DocumentDetail | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [copiedCitation, setCopiedCitation] = useState<string | null>(null);

//   // State Chatbot AI
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
//     { role: "bot", content: "Halo! Saya AI Asisten. Ada yang ingin Anda tanyakan mengenai isi dokumen ini?", isHtml: false }
//   ]);
//   const [chatInput, setChatInput] = useState("");
//   const [isChatLoading, setIsChatLoading] = useState(false);
  
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const [isGuest, setIsGuest] = useState(true);

//   useEffect(() => {
//     const token = Cookies.get("access_token");
//     setIsGuest(!token);
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatMessages, isChatOpen]);

//   useEffect(() => {
//     if (!id) return;

//     const fetchDocumentDetail = async () => {
//       try {
//         setIsLoading(true);
//         const response = await api.get(`/documents/${id}`);
//         // Sesuaikan dengan struktur JSON backend
//         const docData = response.data.data || response.data;
//         setDoc(docData);
//       } catch (err: any) {
//         setError(err.response?.data?.message || "Gagal memuat detail dokumen.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDocumentDetail();
//   }, [id]);

//   const copyToClipboard = (text: string, format: string) => {
//     navigator.clipboard.writeText(text);
//     setCopiedCitation(format);
//     setTimeout(() => setCopiedCitation(null), 2000);
//   };

//   const formatBytes = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const handleDownload = () => {
//     if (!doc?.file_url) return;
//     const link = document.createElement("a");
//     link.href = doc.file_url;
//     link.download = doc.filename || "dokumen.pdf"; 
//     link.target = "_blank"; 
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!chatInput.trim() || isChatLoading || !doc) return;

//     const userQuery = chatInput.trim();
//     setChatMessages(prev => [...prev, { role: "user", content: userQuery }]);
//     setChatInput("");
//     setIsChatLoading(true);

//     try {
//       const formData = new URLSearchParams();
//       formData.append('query', userQuery); 
//       formData.append('filename', doc.filename);

//       const response = await api.post('/chat-document', formData, {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
//       });

//       const answerHtml = response.data.data.answer;
//       setChatMessages(prev => [...prev, { role: "bot", content: answerHtml, isHtml: true }]);

//     } catch (error: any) {
//       console.error("Chat error:", error);
//       setChatMessages(prev => [...prev, { role: "bot", content: "Maaf, terjadi kesalahan saat menghubungi server AI.", isHtml: false }]);
//     } finally {
//       setIsChatLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
//         <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
//         <p className="text-gray-500 text-sm font-medium">Memuat detail dokumen...</p>
//       </div>
//     );
//   }

//   if (error || !doc) {
//     return (
//       <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
//         <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
//         <h2 className="text-2xl font-bold text-gray-900">Dokumen Tidak Ditemukan</h2>
//         <p className="text-gray-600">{error}</p>
//         <Button onClick={() => router.back()} variant="outline">
//           <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans space-y-4 relative">
      
//       <button 
//         onClick={() => router.back()} 
//         className="flex items-center text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors mb-2"
//       >
//         <ArrowLeft className="w-3.5 h-3.5 mr-2" /> Kembali ke Daftar Dokumen
//       </button>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* KOLOM KIRI */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white rounded-xl p-4 md:px-5 md:py-4 border border-gray-100 shadow-sm flex flex-col gap-2">
//             <div className="flex flex-wrap items-center gap-2">
//               <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
//                 {doc.category || "Dokumen"}
//               </span>
//               <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${doc.document_status === 'Publik' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
//                 {doc.document_status || "Publik"}
//               </span>
//             </div>

//             <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
//               {doc.title}
//             </h1>

//             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 border-t border-gray-100 pt-2 mt-1">
//               <div className="flex items-center gap-1.5">
//                 <UserIcon className="w-3.5 h-3.5 text-gray-400" />
//                 <span className="font-medium text-gray-800">{doc.author}</span>
//                 {doc.author_degree && <span className="text-gray-500">, {doc.author_degree}</span>}
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <BookOpen className="w-3.5 h-3.5 text-gray-400" />
//                 <span className="text-gray-700">{doc.prodi}</span>
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <Calendar className="w-3.5 h-3.5 text-gray-400" />
//                 <span className="text-gray-700">Tahun {doc.year}</span>
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-1.5 pt-0.5">
//               {doc.tags?.map((tag, idx) => (
//                 <span key={idx} className="bg-gray-50 text-gray-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-gray-200">
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* --- ABSTRAK / RINGKASAN TERSTRUKTUR (HTML dari IndoT5 Lokal) --- */}
//           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
//             <div className="flex justify-between items-center border-b pb-3">
//               <h3 className="text-lg font-bold text-gray-900">Ringkasan Abstraktif</h3>
//               <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-100">
//                 <Bot className="w-3 h-3" /> Model IndoT5
//               </span>
//             </div>
            
//             <div className="space-y-6">
//               {doc.summary ? (
//                 <div 
//                   className="text-gray-700 leading-relaxed text-justify prose prose-sm max-w-none prose-p:mb-3"
//                   dangerouslySetInnerHTML={{ __html: doc.summary }} 
//                 />
//               ) : (
//                 <p className="text-gray-500 italic text-sm">Ringkasan belum tersedia.</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* KOLOM KANAN */}
//         <div className="space-y-6">
//           <Card className="border-blue-100 shadow-md border-t-4 border-t-blue-600 overflow-hidden">
//             <CardContent className="p-5 space-y-5">
//               <div className="flex items-start gap-3">
//                 <div className="bg-red-50 p-2.5 rounded-lg">
//                   <FileText className="w-6 h-6 text-red-500" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-gray-900 text-xs break-all line-clamp-2">{doc.filename}</h4>
//                   <p className="text-[10px] text-gray-500 mt-0.5 uppercase">{doc.file_type} • {formatBytes(doc.file_size_bytes)}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-2 border-y py-3">
//                 <div className="text-center">
//                   <div className="text-xl font-bold text-gray-900">{doc.views_count}</div>
//                   <div className="text-[10px] text-gray-500 uppercase font-semibold">Dilihat</div>
//                 </div>
//                 <div className="text-center border-l">
//                   <div className="text-xl font-bold text-gray-900">{doc.downloads_count}</div>
//                   <div className="text-[10px] text-gray-500 uppercase font-semibold">Diunduh</div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 {(doc.file_status === 'Publik' || doc.file_status === 'Public') ? (
//                   <Button 
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 gap-2"
//                     onClick={handleDownload}
//                   >
//                     <Download className="w-3.5 h-3.5" /> Unduh PDF
//                   </Button>
//                 ) : (
//                   <p className="text-[10px] text-center text-red-500 font-bold bg-red-50 py-2 rounded">
//                     AKSES FILE TERBATAS
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Sitasi Otomatis */}
//           {doc.citations && (
//             <Card className="shadow-sm border-gray-100">
//               <CardHeader className="py-3 px-5 border-b bg-gray-50/50">
//                 <CardTitle className="text-xs flex items-center gap-2">
//                   <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Sitasi Otomatis
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-0">
//                 {['APA', 'IEEE', 'MLA', 'Harvard'].map((format) => {
//                   const formatKey = format.toLowerCase() as keyof typeof doc.citations;
//                   if (!doc.citations[formatKey]) return null;
                  
//                   return (
//                     <div key={format} className="p-4 border-b last:border-0 hover:bg-gray-50 transition-colors group relative">
//                       <div className="flex justify-between items-center mb-1.5">
//                         <span className="text-[10px] font-black text-blue-700 tracking-wider uppercase">{format} Style</span>
//                         <button 
//                           onClick={() => copyToClipboard(doc.citations[formatKey], format)}
//                           className="text-gray-400 hover:text-blue-600 transition-colors"
//                         >
//                           {copiedCitation === format ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
//                         </button>
//                       </div>
//                       <p className="text-[11px] text-gray-600 leading-relaxed pr-4">{doc.citations[formatKey]}</p>
//                     </div>
//                   );
//                 })}
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       {/* --- FLOATING CHATBOT WIDGET --- */}
//       {!isGuest && (
//       <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
//         {isChatOpen && (
//           <Card className="w-80 sm:w-96 mb-4 shadow-2xl border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
//             <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
//               <div>
//                 <h3 className="font-bold text-sm flex items-center gap-2">
//                   <MessageCircle className="w-4 h-4" /> Tanya Dokumen AI
//                 </h3>
//                 <p className="text-[10px] text-blue-100 mt-0.5 line-clamp-1 opacity-80">{doc.title}</p>
//               </div>
//               <button onClick={() => setIsChatOpen(false)} className="text-blue-100 hover:text-white transition-colors">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
//               {chatMessages.map((msg, idx) => (
//                 <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
//                   <div 
//                     className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
//                       msg.role === "user" 
//                         ? "bg-blue-600 text-white rounded-tr-none" 
//                         : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
//                     }`}
//                   >
//                     {msg.isHtml ? (
//                       <div 
//                         className="prose prose-sm prose-p:my-1 prose-p:leading-snug prose-span:text-blue-700" 
//                         dangerouslySetInnerHTML={{ __html: msg.content }} 
//                       />
//                     ) : (
//                       <p className="whitespace-pre-wrap">{msg.content}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
              
//               {isChatLoading && (
//                 <div className="flex w-full justify-start">
//                   <div className="bg-white border border-gray-100 text-gray-500 rounded-xl rounded-tl-none px-4 py-2 shadow-sm flex gap-1 items-center">
//                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
//                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
//                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
//                   </div>
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="p-3 bg-white border-t border-gray-100">
//               <form onSubmit={handleSendMessage} className="flex gap-2">
//                 <Input 
//                   value={chatInput}
//                   onChange={(e) => setChatInput(e.target.value)}
//                   placeholder="Tanyakan sesuatu..." 
//                   className="h-10 bg-gray-50 border-gray-200 focus-visible:ring-blue-500 text-sm"
//                   disabled={isChatLoading}
//                 />
//                 <Button 
//                   type="submit" 
//                   size="icon" 
//                   className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700"
//                   disabled={isChatLoading || !chatInput.trim()}
//                 >
//                   <Send className="w-4 h-4 text-white" />
//                 </Button>
//               </form>
//             </div>
//           </Card>
//         )}

//         {!isChatOpen && (
//           <button
//             onClick={() => setIsChatOpen(true)}
//             className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
//             title="Tanya AI tentang dokumen ini"
//           >
//             <MessageCircle className="w-6 h-6" />
//           </button>
//         )}
//       </div>
//         )}
//     </div>
//   );
// }

