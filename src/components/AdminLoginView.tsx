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
    <div className="max-w-7xl mx-auto py-8 sm:py-16 px-4 sm:px-6">
      <div className="max-w-md mx-auto">

        {/* Back to Guestbook Link */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              setPendingTab(null);
              navigateToTab('guestbook');
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#334155] hover:text-[#0284C7] transition-colors rounded-full px-4 py-2 hover:bg-[#E0F2FE]/60 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Buku Kontrol Pengunjung
          </button>
        </div>

        {/* Intended destination notification */}
        {pendingTab && (
          <div className="mb-6 p-4 bg-[#E0F2FE] text-[#0C4A6E] border border-[#0284C7]/20 rounded-2xl flex items-start gap-3 shadow-2xs">
            <Lock className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold uppercase tracking-wide">Akses Terbatas Diperlukan</div>
              <div className="mt-0.5 leading-relaxed font-normal">
                Anda diarahkan ke login untuk mengakses <span className="font-bold underline">{getDestinationLabel(pendingTab)}</span>.
              </div>
            </div>
          </div>
        )}

        {/* Main Card - Material You Poster Card */}
        <div className="bg-[#F0F9FF] rounded-[32px] overflow-hidden border border-[#E0F2FE] shadow-md">
          {/* Card Header: Material You Gradient & Organic Blur */}
          <div className="bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#075985] text-white p-8 text-center relative overflow-hidden">
            {/* Background Organic Accent */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/15 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#BAE6FD]/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                <img
                  src="/logo-sman1-batu.png"
                  alt="Logo SMA Negeri 1 Batu"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Masuk Portal Admin UKS
              </h2>
              <p className="text-xs font-normal text-[#E0F2FE] mt-1">
                Panel Manajemen & Pelayanan Kesehatan Sekolah
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-4 bg-[#F9DEDC] text-[#410E0B] border border-[#B3261E]/30 rounded-2xl flex items-start gap-3 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-[#B3261E] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase">Gagal Masuk</div>
                  <div className="mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div>
                <label className="block text-xs font-medium text-[#334155] mb-1.5 uppercase tracking-wider" htmlFor="admin-username">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#E0F2FE] focus:bg-[#F0F9FF] text-[#0F172A] font-normal text-sm rounded-t-xl border-b-2 border-[#94A3B8] focus:border-[#0284C7] outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-medium text-[#334155] mb-1.5 uppercase tracking-wider" htmlFor="admin-password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-3 bg-[#E0F2FE] focus:bg-[#F0F9FF] text-[#0F172A] font-normal text-sm rounded-t-xl border-b-2 border-[#94A3B8] focus:border-[#0284C7] outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
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
                  className="w-full h-12 inline-flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-xs rounded-full active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </div>
            </form>

            {/* Public Access Note */}
            <div className="pt-4 border-t border-[#E0F2FE] text-center">
              <p className="text-xs text-[#334155] font-normal">
                Bukan petugas UKS? Anda dapat langsung mengisi buku kunjungan.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setPendingTab(null);
                    navigateToTab('guestbook');
                  }}
                  className="text-[#0284C7] font-medium hover:underline inline-block mt-1 cursor-pointer"
                >
                  Buka Formulir Kunjungan &rarr;
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
