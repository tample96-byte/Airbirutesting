'use client';
import React, { useState } from 'react';
import { type User } from 'firebase/auth';
import { 
  Droplet, 
  Unlock, 
  Lock, 
  CheckCircle2, 
  CloudOff, 
  LogOut, 
  LogIn, 
  Download, 
  Trash2, 
  Menu, 
  X, 
  User as UserIcon, 
  RefreshCw 
} from 'lucide-react';

interface SidebarProps {
  isAdmin: boolean;
  onSwitchToCashier: () => void;
  onOpenPinModal: () => void;
  user: User | null;
  authLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  unsyncedCount: number;
  onBackup: () => void;
  onDeleteAllLocal: () => void;
  isFirebaseConfigured: boolean;
}

export function Sidebar({
  isAdmin,
  onSwitchToCashier,
  onOpenPinModal,
  user,
  authLoading,
  onLogin,
  onLogout,
  unsyncedCount,
  onBackup,
  onDeleteAllLocal,
  isFirebaseConfigured,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#151B26] border-r border-[#242F41] p-6 shrink-0 justify-between h-screen sticky top-0 shadow-xl">
        <div className="flex flex-col gap-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/10">
              <Droplet className="w-5.5 h-5.5 fill-white text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-100 tracking-tight leading-tight">Biru POS</h1>
              <p className="text-[10px] text-sky-400 font-bold tracking-widest font-mono">WATER TRACKER</p>
            </div>
          </div>

          {/* Role Status Bar */}
          <div className="bg-[#0D111A] border border-[#202C3F] p-4.5 rounded-xl flex flex-col gap-3">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
              Sistem Otorisasi
            </span>
            {isAdmin ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-400">Mode Admin Aktif</span>
                </div>
                <button
                  onClick={onSwitchToCashier}
                  className="w-full mt-1.5 py-1.5 px-3 bg-[#1A2333] hover:bg-sky-950/20 hover:text-sky-400 border border-[#202C3F] hover:border-sky-500/20 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Kunci Ke Kasir
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-400">Mode Kasir</span>
                </div>
                <button
                  onClick={onOpenPinModal}
                  className="w-full mt-1.5 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Masuk Admin
                </button>
              </div>
            )}
          </div>

          {/* Sync status card */}
          <div className="bg-[#0D111A] border border-[#202C3F] p-4.5 rounded-xl shadow-inner">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2.5">
              Status Sinkronisasi
            </span>
            <div className="flex items-center gap-2.5">
              {user && isFirebaseConfigured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-extrabold text-emerald-400">Cloud Aktif</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {unsyncedCount === 0 ? 'Semua terbackup' : `${unsyncedCount} transaksi pending`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-400">Penyimpanan Lokal</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Data aman di browser</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Account Section */}
          {isAdmin && (
            <div className="bg-[#0D111A] border border-[#202C3F] p-4.5 rounded-xl flex flex-col gap-3 shadow-inner">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                Akun Backup (Google)
              </span>
              {authLoading ? (
                <div className="flex items-center justify-center p-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-500" />
                </div>
              ) : user ? (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm uppercase shrink-0">
                      {user.email ? user.email.slice(0, 2) : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-200 truncate">{user.displayName || 'Admin Air'}</p>
                      <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full py-2 px-3 bg-[#1A2333] hover:bg-red-950/20 hover:text-red-400 border border-[#202C3F] hover:border-red-900/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar Akun
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Aktifkan cloud backup otomatis agar data Anda aman dari kehilangan cache browser.
                  </p>
                  <button
                    onClick={onLogin}
                    className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-sky-950/20"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Masuk Google
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action controls - Admin Only */}
        {isAdmin && (
          <div className="flex flex-col gap-2.5 border-t border-[#202C3F] pt-5">
            <button
              onClick={onBackup}
              className="w-full py-2.5 px-3 bg-[#1A2333] hover:bg-[#202C3F] border border-[#202C3F] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-slate-300"
            >
              <Download className="w-4 h-4 text-sky-400" />
              Ekspor JSON Backup
            </button>
            <button
              onClick={onDeleteAllLocal}
              className="w-full py-2 px-3 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Data Lokal
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#151B26] border-b border-[#242F41] sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md">
            <Droplet className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight leading-none">Biru POS</h1>
            <p className="text-[9px] text-sky-400 font-bold tracking-wider font-mono mt-0.5">
              {isAdmin ? 'MODE ADMIN' : 'MODE KASIR'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick toggle mode */}
          <button
            onClick={() => {
              if (isAdmin) {
                onSwitchToCashier();
              } else {
                onOpenPinModal();
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-[10px] font-black flex items-center gap-1 transition ${
              isAdmin
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-[#0D111A] border-[#202C3F] text-slate-400'
            }`}
          >
            {isAdmin ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {isAdmin ? 'Admin' : 'Masuk Admin'}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#1A2333] rounded-lg transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sliding Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[57px] bg-[#0F1319]/98 backdrop-blur-md z-45 flex flex-col p-6 animate-fade-in gap-6 justify-between overflow-y-auto">
          <div className="flex flex-col gap-6">
            
            {/* Mobile Admin switcher */}
            <div className="bg-[#151B26] border border-[#242F41] p-4.5 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2.5">
                Status Otoritas
              </span>
              {isAdmin ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-emerald-400 font-bold">✓ Anda masuk sebagai Administrator.</p>
                  <button
                    onClick={() => {
                      onSwitchToCashier();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-[#1A2333] text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-[#202C3F]"
                  >
                    <Lock className="w-4 h-4" />
                    Kunci Kembali Ke Kasir
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-400">Masuk sebagai admin untuk mengelola menu, harga, dan riwayat transaksi.</p>
                  <button
                    onClick={() => {
                      onOpenPinModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-sky-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Masuk Mode Admin
                  </button>
                </div>
              )}
            </div>

            {/* Auth Google Backup Section (Admin only) */}
            {isAdmin && (
              <div className="bg-[#151B26] border border-[#242F41] p-4.5 rounded-xl">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2.5">
                  User / Akun Backup Google
                </span>
                {user ? (
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm uppercase">
                        {user.email ? user.email.slice(0, 2) : <UserIcon className="w-4 h-4" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-200 truncate">{user.displayName || 'Admin Air'}</p>
                        <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-3 bg-[#1A2333] hover:bg-red-950/20 hover:text-red-400 border border-[#202C3F] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar Akun Google
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-slate-400 leading-relaxed mb-1">
                      Masuk dengan akun Google untuk sinkronisasi otomatis ke cloud.
                    </p>
                    <button
                      onClick={() => {
                        onLogin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Masuk Google
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-[#151B26] border border-[#242F41] p-4.5 rounded-xl flex flex-col gap-2.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
                Ringkasan Database
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Penyimpanan Cloud:</span>
                <span className={user && isFirebaseConfigured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {user && isFirebaseConfigured ? 'Aktif (Cloud)' : 'Nonaktif (Lokal)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-[#202C3F] pt-2">
                <span className="text-slate-400">Pending Sync:</span>
                <span className="text-sky-400 font-mono font-extrabold">{unsyncedCount} transaksi</span>
              </div>
            </div>
          </div>

          {/* Admin Tools Mobile Footer */}
          {isAdmin && (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onBackup();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 bg-[#151B26] text-white border border-[#242F41] rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-sky-400" />
                Ekspor JSON Backup
              </button>
              <button
                onClick={() => {
                  onDeleteAllLocal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 text-slate-500 hover:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Seluruh Data Lokal
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
