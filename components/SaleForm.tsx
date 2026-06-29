'use client';
import React, { useState } from 'react';
import { db, formatRupiah } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { PlusCircle, Wallet, CreditCard, Sparkles } from 'lucide-react';

export function SaleForm() {
  const presets = useLiveQuery(() => db.presets.toArray());

  const [item, setItem] = useState('Refill');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notification, setNotification] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!item || isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Mohon masukkan nominal yang valid.');
      return;
    }

    try {
      await db.sales.add({
        amount: parsedAmount,
        item: item,
        createdAt: new Date(),
        paymentMethod: paymentMethod,
      });

      // Clear or reset fields
      setAmount('');
      setNotification(`✓ Transaksi ${item} (${formatRupiah(parsedAmount)}) berhasil dicatat!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to save sale:', err);
      alert('Gagal mencatat transaksi.');
    }
  };

  const handleApplyPreset = (presetItem: string, presetAmount: number) => {
    setItem(presetItem);
    setAmount(presetAmount.toString());
  };

  return (
    <div className="bg-[#151B26] p-6 sm:p-7 rounded-2xl border border-[#242F41] shadow-2xl flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500"></div>

      <div>
        <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-sky-400" />
          Catat Transaksi Baru
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          Pilih tombol cepat menu di bawah atau ketik rincian penjualan secara manual.
        </p>
      </div>

      {/* Success Notification */}
      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs py-2.5 px-4 rounded-xl font-bold animate-fade-in">
          {notification}
        </div>
      )}

      {/* Quick Buttons Presets Layout */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
          Menu Cepat (Tombol Pintar)
        </span>
        <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
          {presets && presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p.item, p.amount)}
              className="flex flex-col text-left p-3 rounded-xl bg-[#0D111A] border border-[#202C3F] hover:border-sky-500/45 hover:bg-[#111724] transition group cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors truncate w-full">{p.label}</span>
              <span className="text-[11px] text-sky-400 font-mono font-black mt-1">Rp {formatRupiah(p.amount)}</span>
            </button>
          ))}
          {(!presets || presets.length === 0) && (
            <div className="col-span-2 text-center py-4 bg-[#0D111A] rounded-xl border border-[#202C3F]">
              <p className="text-xs text-slate-500 font-bold">Belum ada menu cepat yang dibuat.</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-t border-[#202C3F] pt-5">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
          Rincian Transaksi Manual
        </span>

        {/* Item Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Produk / Layanan</label>
          <div className="grid grid-cols-4 gap-1.5 bg-[#0D111A] p-1 border border-[#202C3F] rounded-xl">
            {['Refill', 'Galon Baru', 'Air Botol', 'Lain-lain'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setItem(cat)}
                className={`py-2 px-1 text-[10px] font-extrabold rounded-lg transition text-center truncate ${
                  item === cat
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151B26]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nominal Bayar (Rp)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-black text-slate-500">Rp</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 10000"
              min="0"
              required
              className="w-full pl-10 pr-4 py-3 bg-[#0D111A] border border-[#202C3F] rounded-xl text-slate-100 font-mono font-extrabold text-sm outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Metode Pembayaran</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('Cash')}
              className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                paymentMethod === 'Cash'
                  ? 'bg-[#15231A] text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-[#0D111A] border-[#202C3F] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              Tunai (Cash)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('QRIS')}
              className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                paymentMethod === 'QRIS'
                  ? 'bg-[#122030] text-sky-400 border-sky-500/40 shadow-sm'
                  : 'bg-[#0D111A] border-[#202C3F] text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              QRIS / Transfer
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-sky-950/30 transition cursor-pointer mt-2"
        >
          <Sparkles className="w-4 h-4" />
          Simpan Transaksi {amount ? `(Rp ${formatRupiah(parseFloat(amount) || 0)})` : ''}
        </button>
      </form>
    </div>
  );
}
