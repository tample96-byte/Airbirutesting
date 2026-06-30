'use client';
import React, { useState } from 'react';
import { 
  Cloud, 
  Settings, 
  Database, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Code,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  firebaseConfig, 
  isFirebaseConfigured, 
  isCustomConfig, 
  parseFirebaseConfigString, 
  saveClientFirebaseConfig, 
  clearClientFirebaseConfig 
} from '@/lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirebaseConfigModal({ isOpen, onClose }: FirebaseConfigModalProps) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    setError(null);
    setSuccess(false);

    if (!inputText.trim()) {
      setError('Harap masukkan kode konfigurasi Firebase.');
      return;
    }

    const config = parseFirebaseConfigString(inputText);
    if (!config) {
      setError('Format konfigurasi tidak valid! Harap salin objek konfigurasi lengkap dari Firebase Console (mengandung apiKey & projectId).');
      return;
    }

    const saved = saveClientFirebaseConfig(config);
    if (saved) {
      setSuccess(true);
      setInputText('');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      setError('Gagal menyimpan ke penyimpanan lokal browser.');
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus konfigurasi kustom dan kembali ke pengaturan environment bawaan?')) {
      clearClientFirebaseConfig();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070A0F]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#151B26] border border-[#242F41] rounded-3xl w-full max-w-lg shadow-2xl p-6 relative overflow-hidden flex flex-col gap-5">
        
        {/* Top subtle glow line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-500"></div>

        {/* Modal Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base tracking-tight">Koneksi & Sinkronisasi Cloud</h3>
              <p className="text-[10px] text-slate-400 font-medium">Hubungkan kasir Anda ke cloud database Firebase</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202C3F]/30 hover:bg-[#202C3F]/75 border border-[#202C3F]/20 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active connection summary banner */}
        <div className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
          isFirebaseConfigured 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400/90' 
            : 'bg-amber-500/5 border-amber-500/20 text-amber-400/90'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
            <p className="font-black text-xs uppercase tracking-wider">
              {isFirebaseConfigured ? 'Firebase Terkoneksi' : 'Firebase Belum Terhubung'}
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {isFirebaseConfigured 
              ? `Aplikasi sinkron ke Firebase Project: [${firebaseConfig.projectId}]. ${isCustomConfig ? 'Menggunakan konfigurasi kustom (Local Memory).' : 'Menggunakan konfigurasi environment default.'}` 
              : 'Saat ini menggunakan database lokal Dexie (IndexedDB) di browser Anda. Transaksi tersimpan offline dan aman, namun backup cloud otomatis belum aktif.'}
          </p>
          {isCustomConfig && (
            <button
              onClick={handleResetConfig}
              className="mt-1 self-start flex items-center gap-1.5 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Hapus Konfigurasi Kustom
            </button>
          )}
        </div>

        {/* Form Container */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> Tempel Konfigurasi Firebase
            </label>
            <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Auto Input Parser
            </span>
          </div>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError(null);
            }}
            placeholder={`Salin langsung dari Firebase Console Anda:

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  ...
};`}
            className="w-full p-3.5 bg-[#0D111A] border border-[#202C3F] text-slate-200 font-mono text-[11px] leading-relaxed rounded-2xl outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder-slate-600 resize-none"
          />

          <p className="text-[10px] text-slate-500 leading-relaxed">
            💡 <strong>Petunjuk:</strong> Anda dapat menempelkan seluruh kode objek javascript dari Firebase Console. Sistem kami akan otomatis mengekstrak <code>apiKey</code>, <code>authDomain</code>, <code>projectId</code>, dll. secara aman langsung di browser Anda.
          </p>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold text-red-400 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold text-emerald-400 leading-relaxed">
              <Check className="w-4 h-4 shrink-0" />
              <span>Berhasil menyimpan konfigurasi! Memuat ulang sistem kasir...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end border-t border-[#1E2836] pt-4 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#232F42] hover:bg-[#2D3C54] text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-950/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            {success ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
            Hubungkan Cloud
          </button>
        </div>

      </div>
    </div>
  );
}
