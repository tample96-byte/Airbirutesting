'use client';
import React, { useState } from 'react';
import { db, Preset, formatRupiah } from '@/lib/db';
import { Sliders, Plus, Edit, Check, Edit3, Trash2 } from 'lucide-react';

interface AdminPresetManagerProps {
  presets: Preset[] | undefined;
}

export function AdminPresetManager({ presets }: AdminPresetManagerProps) {
  const [selectedPresetForEdit, setSelectedPresetForEdit] = useState<Preset | null>(null);
  const [presetLabel, setPresetLabel] = useState('');
  const [presetItem, setPresetItem] = useState('Refill');
  const [presetAmount, setPresetAmount] = useState('');

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetLabel || !presetAmount || parseFloat(presetAmount) < 0) {
      alert('Data menu tidak valid.');
      return;
    }

    try {
      if (selectedPresetForEdit) {
        // Edit existing preset
        await db.presets.update(selectedPresetForEdit.id!, {
          label: presetLabel,
          item: presetItem,
          amount: parseFloat(presetAmount),
        });
        setSelectedPresetForEdit(null);
      } else {
        // Create new preset
        await db.presets.add({
          label: presetLabel,
          item: presetItem,
          amount: parseFloat(presetAmount),
        });
      }
      setPresetLabel('');
      setPresetAmount('');
    } catch (err) {
      console.error('Failed to save preset:', err);
    }
  };

  const handleStartEditPreset = (p: Preset) => {
    setSelectedPresetForEdit(p);
    setPresetLabel(p.label);
    setPresetItem(p.item);
    setPresetAmount(p.amount.toString());
  };

  const handleDeletePreset = async (id: number) => {
    if (window.confirm('Hapus menu cepat ini?')) {
      await db.presets.delete(id);
    }
  };

  return (
    <div id="admin-preset-manager" className="bg-[#151B26] p-6 sm:p-7 rounded-2xl border border-[#242F41] shadow-2xl flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500"></div>
      
      <div>
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          Pengaturan Menu & Ubah Harga
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Tambahkan produk baru, ubah kategori, atau edit harga tombol cepat kasir.
        </p>
      </div>

      {/* Subform: Create or Edit Preset */}
      <form onSubmit={handleSavePreset} className="bg-[#0D111A] border border-[#202C3F] p-4 rounded-xl flex flex-col gap-3.5">
        <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          {selectedPresetForEdit ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {selectedPresetForEdit ? 'Ubah Rincian Menu' : 'Tambah Menu Cepat Baru'}
        </span>

        <div className="grid grid-cols-2 gap-2">
          {/* Preset label */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[10px] text-slate-400 font-bold">Nama Menu (Label Button)</label>
            <input
              type="text"
              value={presetLabel}
              onChange={(e) => setPresetLabel(e.target.value)}
              placeholder="Contoh: Refill Jumbo Rp 10k"
              required
              className="w-full px-3 py-1.5 bg-[#151B26] border border-[#202C3F] rounded-lg text-slate-200 outline-none text-xs font-bold"
            />
          </div>

          {/* Item Category */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Kategori Data</label>
            <select
              value={presetItem}
              onChange={(e) => setPresetItem(e.target.value)}
              className="w-full px-2 py-1.5 bg-[#151B26] border border-[#202C3F] rounded-lg text-slate-200 outline-none text-xs font-bold cursor-pointer"
            >
              <option value="Refill">Refill</option>
              <option value="Galon Baru">Galon Baru</option>
              <option value="Air Botol">Air Botol</option>
              <option value="Lain-lain">Lain-lain</option>
            </select>
          </div>

          {/* Preset Amount */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Harga Jual (Rp)</label>
            <input
              type="number"
              value={presetAmount}
              onChange={(e) => setPresetAmount(e.target.value)}
              placeholder="10000"
              min="0"
              required
              className="w-full px-3 py-1.5 bg-[#151B26] border border-[#202C3F] rounded-lg text-slate-200 outline-none text-xs font-bold font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1.5">
          {selectedPresetForEdit && (
            <button
              type="button"
              onClick={() => {
                setSelectedPresetForEdit(null);
                setPresetLabel('');
                setPresetAmount('');
              }}
              className="flex-1 py-1.5 bg-[#232F42] hover:bg-[#2D3C54] text-slate-300 rounded-lg text-xs font-bold transition"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
          >
            <Check className="w-3.5 h-3.5" />
            {selectedPresetForEdit ? 'Simpan' : 'Tambahkan'}
          </button>
        </div>
      </form>

      {/* List of current presets with Actions */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
          Daftar Menu Aktif ({presets?.length || 0})
        </span>
        <div className="max-h-[220px] overflow-y-auto divide-y divide-[#202C3F] flex flex-col gap-1.5 pr-1 font-sans">
          {presets && presets.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 text-xs">
              <div className="overflow-hidden mr-2">
                <p className="font-bold text-slate-200 truncate">{p.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] bg-[#0D111A] text-slate-400 border border-[#202C3F] px-1.5 py-0.2 rounded-md font-bold">
                    {p.item}
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono font-black">
                    Rp {formatRupiah(p.amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleStartEditPreset(p)}
                  className="p-1 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded transition cursor-pointer"
                  title="Ubah Preset"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePreset(p.id!)}
                  className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                  title="Hapus Preset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
