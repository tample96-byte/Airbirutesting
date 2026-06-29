'use client';
import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';

export function AdminChangePin() {
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);

  const handleChangePIN = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    const storedPin = typeof window !== 'undefined' ? localStorage.getItem('biru_pos_admin_pin') || '1234' : '1234';
    if (currentPinInput !== storedPin) {
      setPinChangeError('PIN Lama salah.');
      return;
    }
    if (newPinInput.length < 4) {
      setPinChangeError('PIN baru minimal harus 4 digit.');
      return;
    }
    if (newPinInput !== confirmNewPin) {
      setPinChangeError('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('biru_pos_admin_pin', newPinInput);
      setPinChangeSuccess('PIN Admin berhasil diubah!');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPin('');
    }
  };

  return (
    <div className="bg-[#151B26] p-6 rounded-2xl border border-[#242F41] shadow-xl flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-sky-400" />
          Ganti PIN Pengaman Admin
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Perbarui kode sandi untuk mencegah akses tidak sah ke panel administrator oleh kasir.
        </p>
      </div>

      <form onSubmit={handleChangePIN} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-[#0D111A] p-4 rounded-xl border border-[#202C3F]">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-bold">PIN Lama</label>
          <input
            type="password"
            maxLength={8}
            placeholder="••••"
            value={currentPinInput}
            onChange={(e) => setCurrentPinInput(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#151B26] border border-[#202C3F] rounded-lg text-slate-200 outline-none text-xs font-bold font-mono text-center tracking-widest"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 font-bold">PIN Baru (Min 4 Angka)</label>
          <input
            type="password"
            maxLength={8}
            placeholder="••••"
            value={newPinInput}
            onChange={(e) => setNewPinInput(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#151B26] border border-[#202C3F] rounded-lg text-slate-200 outline-none text-xs font-bold font-mono text-center tracking-widest"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-bold">Konfirmasi PIN Baru</label>
          <div className="flex gap-2">
            <input
              type="password"
              maxLength={8}
              placeholder="••••"
              value={confirmNewPin}
              onChange={(e) => setConfirmNewPin(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#151B26] border border-[#202C3F] rounded-lg text-slate-200 outline-none text-xs font-bold font-mono text-center tracking-widest flex-1"
            />
            <button
              type="submit"
              className="py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 transition"
            >
              Ubah
            </button>
          </div>
        </div>
      </form>

      {pinChangeError && (
        <span className="text-[11px] font-bold text-red-400">✗ {pinChangeError}</span>
      )}
      {pinChangeSuccess && (
        <span className="text-[11px] font-bold text-emerald-400">✓ {pinChangeSuccess}</span>
      )}
    </div>
  );
}
