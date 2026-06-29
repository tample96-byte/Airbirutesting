'use client';
import React, { useEffect, useState } from 'react';
import { db, Sale, formatRupiah, Preset } from '@/lib/db';
import { db as firestoreDb, auth as firestoreAuth, isFirebaseConfigured } from '@/lib/firebase';
import { useLiveQuery } from 'dexie-react-hooks';
import { collection, addDoc, doc, deleteDoc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth';
import { Sidebar } from './Sidebar';
import { SaleForm } from './SaleForm';
import { SalesChart } from './SalesChart';
import { SalesTable } from './SalesTable';
import { AdminPinModal } from './admin/AdminPinModal';
import { AdminPresetManager } from './admin/AdminPresetManager';
import { AdminChangePin } from './admin/AdminChangePin';
import { 
  DollarSign, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { RealtimeClock } from './RealtimeClock';

export function SalesDashboard() {
  // Local Database Queries
  const sales = useLiveQuery(() => db.sales.toArray());
  const presets = useLiveQuery(() => db.presets.toArray());

  // UI state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Firebase auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  // Monitor Auth State
  useEffect(() => {
    if (!isFirebaseConfigured || !firestoreAuth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firestoreAuth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Track unsynced count
  useEffect(() => {
    if (sales) {
      const unsynced = sales.filter((s) => !s.firestoreId);
      setUnsyncedCount(unsynced.length);
    }
  }, [sales]);

  // Sync Offline Sales to Firestore when online & logged in
  useEffect(() => {
    if (user && isFirebaseConfigured && firestoreDb && sales) {
      const unsyncedSales = sales.filter((s) => !s.firestoreId);
      if (unsyncedSales.length > 0) {
        syncSalesToFirestore(unsyncedSales, user.uid);
      }
    }
  }, [user, sales]);

  const syncSalesToFirestore = async (unsynced: Sale[], uid: string) => {
    try {
      for (const sale of unsynced) {
        const docRef = await addDoc(collection(firestoreDb, 'sales'), {
          amount: sale.amount,
          item: sale.item,
          createdAt: sale.createdAt.toISOString(),
          paymentMethod: sale.paymentMethod,
          userId: uid,
        });
        
        // Update local Dexie sale with firestoreId
        await db.sales.update(sale.id!, { firestoreId: docRef.id });
      }
    } catch (e) {
      console.error("Error syncing sales to Firestore:", e);
    }
  };

  // Listen to Firestore changes in real-time
  useEffect(() => {
    if (!user || !isFirebaseConfigured || !firestoreDb) return;

    const q = query(collection(firestoreDb, 'sales'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const data = change.doc.data();
        const firestoreId = change.doc.id;

        if (change.type === 'added') {
          // Check if it already exists locally
          const localExists = await db.sales.where('firestoreId').equals(firestoreId).first();
          if (!localExists) {
            // Also check by timestamp and properties to prevent duplicate recording from same session sync
            const duplicateCheck = await db.sales
              .where('createdAt')
              .equals(new Date(data.createdAt))
              .first();

            if (!duplicateCheck) {
              await db.sales.add({
                amount: data.amount,
                item: data.item,
                createdAt: new Date(data.createdAt),
                paymentMethod: data.paymentMethod,
                firestoreId: firestoreId,
              });
            } else if (!duplicateCheck.firestoreId) {
              // Update firestoreId for existing local record
              await db.sales.update(duplicateCheck.id!, { firestoreId });
            }
          }
        } else if (change.type === 'modified') {
          const local = await db.sales.where('firestoreId').equals(firestoreId).first();
          if (local) {
            await db.sales.update(local.id!, {
              amount: data.amount,
              item: data.item,
              createdAt: new Date(data.createdAt),
              paymentMethod: data.paymentMethod,
            });
          }
        } else if (change.type === 'removed') {
          const local = await db.sales.where('firestoreId').equals(firestoreId).first();
          if (local) {
            await db.sales.delete(local.id!);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Auth Handlers
  const handleLogin = async () => {
    if (!isFirebaseConfigured || !firestoreAuth) {
      alert("Firebase belum dikonfigurasi di lingkungan ini.");
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firestoreAuth, provider);
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      alert("Gagal masuk dengan Google: " + err.message);
    }
  };

  const handleLogout = async () => {
    if (!firestoreAuth) return;
    try {
      await signOut(firestoreAuth);
      setUser(null);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  // CRUD Table Handlers
  const handleDeleteSale = async (id: number, firestoreId?: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      // 1. Delete locally
      await db.sales.delete(id);

      // 2. Delete from firestore if synced
      if (firestoreId && user && isFirebaseConfigured && firestoreDb) {
        await deleteDoc(doc(firestoreDb, 'sales', firestoreId));
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleUpdateSale = async (updatedSale: Sale) => {
    try {
      // 1. Update locally
      await db.sales.update(updatedSale.id!, {
        item: updatedSale.item,
        amount: updatedSale.amount,
        paymentMethod: updatedSale.paymentMethod,
        createdAt: updatedSale.createdAt,
      });

      // 2. Update Firestore if synced
      if (updatedSale.firestoreId && user && isFirebaseConfigured && firestoreDb) {
        await updateDoc(doc(firestoreDb, 'sales', updatedSale.firestoreId), {
          item: updatedSale.item,
          amount: updatedSale.amount,
          paymentMethod: updatedSale.paymentMethod,
          createdAt: updatedSale.createdAt.toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to update transaction:', err);
    }
  };

  // Local Data Operations
  const handleBackupExport = () => {
    if (!sales) return;
    const jsonStr = JSON.stringify(sales, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biru-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOCAL TRANSACTION HISTORY CLEANER - ONLY TRANSACTION NOT PRESET MENU!
  const handleDeleteAllLocal = async () => {
    const confirmation = window.confirm(
      '⚠️ PERINGATAN KERAS!\n\nApakah Anda yakin ingin menghapus seluruh riwayat transaksi lokal?\nTindakan ini HANYA menghapus riwayat transaksi. Tombol menu harga cepat (Preset) Anda akan TETAP UTUH.\n\nTindakan ini tidak dapat dibatalkan!'
    );
    if (confirmation) {
      try {
        await db.sales.clear();
        alert('Sukses! Seluruh riwayat transaksi lokal telah berhasil dihapus. Tombol preset aman.');
      } catch (err) {
        console.error('Failed to clear sales:', err);
        alert('Gagal mengosongkan riwayat transaksi.');
      }
    }
  };

  // Math Calculations for General Statistics (Visible for BOTH Cashier & Admin!)
  const totalRevenue = sales ? sales.reduce((sum, s) => sum + s.amount, 0) : 0;
  
  const cashRevenue = sales 
    ? sales.filter(s => s.paymentMethod === 'Cash').reduce((sum, s) => sum + s.amount, 0) 
    : 0;

  const qrisRevenue = sales 
    ? sales.filter(s => s.paymentMethod === 'QRIS').reduce((sum, s) => sum + s.amount, 0) 
    : 0;

  const totalTransactionsCount = sales ? sales.length : 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0F1319] text-[#E2E8F0]">
      {/* Sidebar navigation */}
      <Sidebar
        isAdmin={isAdmin}
        onSwitchToCashier={() => setIsAdmin(false)}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        user={user}
        authLoading={authLoading}
        onLogin={handleLogin}
        onLogout={handleLogout}
        unsyncedCount={unsyncedCount}
        onBackup={handleBackupExport}
        onDeleteAllLocal={handleDeleteAllLocal}
        isFirebaseConfigured={isFirebaseConfigured}
      />

      {/* Main Panel content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* Main Dashboard Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2836] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full font-black border border-sky-500/20 flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" /> Live System
              </span>
              {isAdmin && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full font-black border border-emerald-500/20 flex items-center gap-1 animate-fade-in">
                  <ShieldCheck className="w-3 h-3" /> Admin Mode
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">Sistem Kasir & Keuangan</h1>
          </div>

          {/* Real-time Clock Widget */}
          <RealtimeClock />
        </div>

        {/* Dashboard Financial Statistics Grid (CRITICAL: Visble for BOTH cashier and admin modes!) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-[#151B26] border border-[#242F41] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-sky-400"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Pendapatan</span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/10">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black font-mono text-slate-100 mt-3 truncate">
              Rp {formatRupiah(totalRevenue)}
            </p>
            <span className="text-[9px] font-bold text-sky-400/90 flex items-center gap-1 mt-1 leading-none">
              <TrendingUp className="w-3 h-3" /> Akumulatif kasir
            </span>
          </div>

          {/* Card 2: Cash Revenue */}
          <div className="bg-[#151B26] border border-[#242F41] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Transaksi Tunai</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black font-mono text-slate-100 mt-3 truncate">
              Rp {formatRupiah(cashRevenue)}
            </p>
            <span className="text-[9px] font-bold text-slate-500 mt-1 block">Metode pembayaran Cash</span>
          </div>

          {/* Card 3: QRIS Revenue */}
          <div className="bg-[#151B26] border border-[#242F41] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-sky-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">QRIS & Transfer</span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/10">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black font-mono text-slate-100 mt-3 truncate">
              Rp {formatRupiah(qrisRevenue)}
            </p>
            <span className="text-[9px] font-bold text-slate-500 mt-1 block">Metode pembayaran QRIS</span>
          </div>

          {/* Card 4: Count volume */}
          <div className="bg-[#151B26] border border-[#242F41] rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-500"></div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Volume Penjualan</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black font-mono text-slate-100 mt-3 truncate">
              {totalTransactionsCount} <span className="text-xs font-bold text-slate-400">Pcs</span>
            </p>
            <span className="text-[9px] font-bold text-slate-500 mt-1 block">Kuantitas produk terjual</span>
          </div>

        </section>

        {/* Sales Entry Form & Graphic Reports */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <SaleForm />
          </div>
          <div className="lg:col-span-8">
            <SalesChart sales={sales || []} />
          </div>
        </section>

        {/* Transaction History Log Table */}
        <section>
          <SalesTable
            sales={sales || []}
            onDeleteSale={handleDeleteSale}
            onUpdateSale={handleUpdateSale}
            isAdmin={isAdmin}
          />
        </section>

        {/* Administrator specific panel modules (Visible ONLY when logged in as admin!) */}
        {isAdmin && (
          <section className="flex flex-col gap-6 animate-fade-in border-t border-[#1E2836] pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminPresetManager presets={presets} />
              <AdminChangePin />
            </div>
          </section>
        )}
      </main>

      {/* Admin verification PIN dialog trigger popup modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          setIsPinModalOpen(false);
        }}
      />
    </div>
  );
}
