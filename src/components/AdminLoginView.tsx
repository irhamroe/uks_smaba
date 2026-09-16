import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { AppTab } from '../types';

export const AdminLoginView: React.FC = () => {
  const { loginAsAdmin, navigateToTab, pendingTab, setPendingTab } = useUks();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Friendly name for intended destination tab
  const getDestinationLabel = (tab: AppTab | null) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard Rekapitulasi & Statistik UKS';
      case 'inventory':
        return 'Manajemen Stok Obat & Farmasi';
      case 'reports':
        return 'Laporan Rekapitulasi & Arsip UKS';
      default:
        return 'Menu Manajemen UKS';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginAsAdmin(username, password);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Username atau password salah.');
      }
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto">

        {/* Back to Guestbook Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              setPendingTab(null);
              navigateToTab('guestbook');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Buku Tamu (Tanpa Login)
          </button>
        </div>

        {/* Intended destination notification */}
        {pendingTab && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-2xs">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <div className="font-bold text-amber-950">Akses Terbatas Diperlukan</div>
              <div className="mt-0.5 leading-relaxed">
                Anda diarahkan ke halaman login karena ingin mengakses{' '}
                <strong className="font-bold underline">{getDestinationLabel(pendingTab)}</strong>.
                Halaman ini khusus untuk Pembina & Petugas UKS SMA Negeri 1 Batu.
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white p-7 sm:p-8 relative text-center">
            <div className="flex flex-col items-center justify-center text-center">
              <img
                src="/logo-sman1-batu.png"
                alt="Logo SMA Negeri 1 Batu"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-3 drop-shadow-md"
              />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Masuk Portal Admin UKS
              </h2>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-7 space-y-5">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Gagal Masuk</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="admin-username">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="admin-password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-submit-admin-login"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {isSubmitting ? 'Memproses...' : 'Masuk'}
                </button>
              </div>
            </form>

            {/* Public Access Note */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-500">
                Bukan petugas UKS? Anda dapat langsung mengisi buku kunjungan tanpa perlu akun.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setPendingTab(null);
                    navigateToTab('guestbook');
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Buka Buku Tamu Siswa/Guru &rarr;
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
