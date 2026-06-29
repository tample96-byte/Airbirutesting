'use client';
import React, { useState } from 'react';
import { Sale, formatRupiah } from '@/lib/db';
import { 
  History, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Wallet,
  CreditCard,
  Search,
  Filter
} from 'lucide-react';

interface SalesTableProps {
  sales: Sale[];
  onDeleteSale: (id: number, firestoreId?: string) => void;
  onUpdateSale: (updatedSale: Sale) => void;
  isAdmin: boolean;
}

export function SalesTable({ sales, onDeleteSale, onUpdateSale, isAdmin }: SalesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  // Edit modal state
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [editItem, setEditItem] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editDate, setEditDate] = useState('');

  const formatDate = (date: any) => {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('.', ':');
  };

  // Filtering & searching logical flows with useMemo
  const sortedSales = React.useMemo(() => {
    return [...sales].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [sales]);

  const filteredSales = React.useMemo(() => {
    return sortedSales.filter(s => {
      const matchesSearch = s.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.amount.toString().includes(searchQuery);
      
      const matchesCategory = filterCategory === 'All' || 
                              (filterCategory === 'Lain-lain' && s.item !== 'Refill' && s.item !== 'Galon Baru' && s.item !== 'Air Botol') ||
                              s.item === filterCategory;

      const matchesPayment = filterPayment === 'All' || s.paymentMethod === filterPayment;

      return matchesSearch && matchesCategory && matchesPayment;
    });
  }, [sortedSales, searchQuery, filterCategory, filterPayment]);

  // Pagination logical calculations
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Edit Action Handlers
  const handleStartEdit = (sale: Sale) => {
    setEditSale(sale);
    setEditItem(sale.item);
    setEditAmount(sale.amount.toString());
    setEditPaymentMethod(sale.paymentMethod);
    setEditDate(new Date(sale.createdAt).toISOString().slice(0, 16)); // Format: YYYY-MM-DDTHH:MM
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSale || !editItem || !editAmount || parseFloat(editAmount) < 0) return;

    const updated: Sale = {
      ...editSale,
      item: editItem,
      amount: parseFloat(editAmount),
      paymentMethod: editPaymentMethod,
      createdAt: new Date(editDate),
    };

    onUpdateSale(updated);
    setEditSale(null);
  };

  return (
    <div className="bg-[#151B26] p-6 sm:p-7 rounded-2xl border border-[#242F41] shadow-2xl flex flex-col gap-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500"></div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-sky-400" />
            Riwayat Transaksi Jual
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Daftar data penjualan real-time. {isAdmin ? 'Mode edit & hapus diizinkan.' : 'Mode baca kasir terbatas.'}
          </p>
        </div>
        
        {/* Sync counters */}
        <div className="text-[10px] font-bold text-slate-400 bg-[#0D111A] border border-[#202C3F] px-3 py-1.5 rounded-xl shrink-0">
          Total: <span className="text-sky-400 font-mono">{filteredSales.length}</span> transaksi
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#0D111A] p-3 rounded-xl border border-[#202C3F]">
        {/* Search input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-[#151B26] border border-[#202C3F] rounded-lg text-xs font-medium text-slate-300 outline-none focus:border-sky-500/50"
          />
        </div>

        {/* Category filter */}
        <div className="sm:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2 py-1.5 bg-[#151B26] border border-[#202C3F] rounded-lg text-xs font-medium text-slate-300 outline-none cursor-pointer"
          >
            <option value="All">Semua Kategori</option>
            <option value="Refill">Refill</option>
            <option value="Galon Baru">Galon Baru</option>
            <option value="Air Botol">Air Botol</option>
            <option value="Lain-lain">Lain-lain</option>
          </select>
        </div>

        {/* Payment filter */}
        <div className="sm:col-span-3">
          <select
            value={filterPayment}
            onChange={(e) => {
              setFilterPayment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2 py-1.5 bg-[#151B26] border border-[#202C3F] rounded-lg text-xs font-medium text-slate-300 outline-none cursor-pointer"
          >
            <option value="All">Semua Metode</option>
            <option value="Cash">Tunai (Cash)</option>
            <option value="QRIS">QRIS / Transfer</option>
          </select>
        </div>
      </div>

      {/* Tables Layout */}
      <div className="overflow-x-auto select-none">
        <table className="w-full min-w-[500px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[#202C3F] text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="pb-3.5 pl-1.5">Tanggal</th>
              <th className="pb-3.5">Nama Menu</th>
              <th className="pb-3.5">Metode</th>
              <th className="pb-3.5 text-right pr-6">Nominal</th>
              {isAdmin && <th className="pb-3.5 text-center w-24">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D2836] text-xs font-bold">
            {paginatedSales.map((s) => (
              <tr key={s.id} className="hover:bg-slate-800/15 transition-colors group">
                {/* Date */}
                <td className="py-3.5 text-slate-400 pl-1.5 font-mono text-[11px]">
                  {formatDate(s.createdAt)}
                </td>

                {/* Name / Category */}
                <td className="py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200">{s.item}</span>
                    {!s.firestoreId && (
                      <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.2 rounded font-black uppercase tracking-wider">
                        Lokal
                      </span>
                    )}
                  </div>
                </td>

                {/* Payment */}
                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] border ${
                    s.paymentMethod === 'Cash' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}>
                    {s.paymentMethod === 'Cash' ? <Wallet className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                    {s.paymentMethod}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-3.5 text-right pr-6 text-slate-200 font-mono font-black">
                  Rp {formatRupiah(s.amount)}
                </td>

                {/* Actions (Admin only) */}
                {isAdmin && (
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleStartEdit(s)}
                        className="p-1 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 rounded transition cursor-pointer"
                        title="Sunting"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSale(s.id!, s.firestoreId)}
                        className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-slate-500 font-bold">
                  Tidak ada data transaksi yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-[#202C3F] pt-4 text-xs font-bold">
        <span className="text-slate-400">
          Halaman <span className="text-slate-200 font-mono">{currentPage}</span> dari <span className="text-slate-200 font-mono">{totalPages}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1.5 rounded-lg border border-[#202C3F] transition cursor-pointer ${
              currentPage === 1
                ? 'text-slate-600 border-slate-800 cursor-not-allowed'
                : 'text-slate-300 hover:bg-[#0D111A] hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded-lg border border-[#202C3F] transition cursor-pointer ${
              currentPage === totalPages
                ? 'text-slate-600 border-slate-800 cursor-not-allowed'
                : 'text-slate-300 hover:bg-[#0D111A] hover:text-white'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EDIT TRANSACTION POPUP DIALOG MODAL (Admin Only) */}
      {editSale && (
        <div className="fixed inset-0 bg-[#070A0F]/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-fade-in">
          <form onSubmit={handleSaveEdit} className="bg-[#151B26] border border-[#242F41] rounded-2xl w-full max-w-sm shadow-2xl p-6 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500"></div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                Sunting Transaksi
              </span>
              <button 
                type="button" 
                onClick={() => setEditSale(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-3">
              {/* Item category */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nama Produk</label>
                <select
                  value={editItem}
                  onChange={(e) => setEditItem(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D111A] border border-[#202C3F] rounded-xl text-slate-200 outline-none text-xs font-bold"
                >
                  <option value="Refill">Refill</option>
                  <option value="Galon Baru">Galon Baru</option>
                  <option value="Air Botol">Air Botol</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Nominal Harga (Rp)</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  min="0"
                  required
                  className="w-full px-3 py-2 bg-[#0D111A] border border-[#202C3F] rounded-xl text-slate-100 font-mono font-bold text-xs"
                />
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Metode Pembayaran</label>
                <select
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D111A] border border-[#202C3F] rounded-xl text-slate-200 outline-none text-xs font-bold"
                >
                  <option value="Cash">Tunai (Cash)</option>
                  <option value="QRIS">QRIS / Transfer</option>
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Tanggal Transaksi
                </label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0D111A] border border-[#202C3F] rounded-xl text-slate-200 outline-none text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setEditSale(null)}
                className="flex-1 py-2.5 bg-[#232F42] hover:bg-[#2D3C54] text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
