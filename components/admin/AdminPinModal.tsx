'use client';
import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  const handleVerifyPIN = () => {
    const storedPin = typeof window !== 'undefined' ? localStorage.getItem('biru_pos_admin_pin') || '1234' : '1234';
    if (pinInput === storedPin) {
      onSuccess();
      setPinInput('');
      setPinError(null);
    } else {
      setPinError('PIN salah! Silakan coba lagi (PIN default: 1234).');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#070A0F]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#151B26] border border-[#242F41] rounded-2xl w-full max-w-xs shadow-2xl p-6 relative overflow-hidden flex flex-col items-center">
        {/* Top color decoration */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-sky-400"></div>

        {/* Shield Icon Lock animation */}
        <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 animate-pulse">
          <Shield className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-slate-100 text-sm tracking-tight text-center">Verifikasi Otoritas Admin</h3>
        <p className="text-[10px] text-slate-400 text-center mt-1 leading-relaxed max-w-[200px]">
          Masukkan PIN Admin untuk mengubah harga menu atau mengakses data laporan penjualan.
        </p>

        {/* PIN inputs */}
        <div className="w-full flex flex-col gap-3 mt-5">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={8}
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerifyPIN();
              }}
              autoFocus
              className="w-full px-4 py-3 bg-[#0D111A] border border-[#202C3F] text-slate-100 font-mono font-black text-center text-lg tracking-widest rounded-xl outline-none focus:border-sky-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {pinError && (
            <p className="text-[10px] font-bold text-red-400 text-center leading-relaxed mt-0.5">
              {pinError}
            </p>
          )}

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setPinInput('');
                setPinError(null);
              }}
              className="flex-1 py-2.5 bg-[#232F42] hover:bg-[#2D3C54] text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleVerifyPIN}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Verifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
