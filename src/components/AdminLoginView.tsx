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
            className="inline-flex items-center gap-2 text-xs font-medium text-[#49454F] hover:text-[#6750A4] transition-colors rounded-full px-4 py-2 hover:bg-[#E8DEF8]/60 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Buku Kontrol Pengunjung
          </button>
        </div>

        {/* Intended destination notification */}
        {pendingTab && (
          <div className="mb-6 p-4 bg-[#FFD8E4] text-[#31111D] border border-[#7D5260]/20 rounded-2xl flex items-start gap-3 shadow-2xs">
            <Lock className="w-5 h-5 text-[#7D5260] shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold uppercase tracking-wide">Akses Terbatas Diperlukan</div>
              <div className="mt-0.5 leading-relaxed font-normal">
                Anda diarahkan ke login untuk mengakses <span className="font-bold underline">{getDestinationLabel(pendingTab)}</span>.
              </div>
            </div>
          </div>
        )}

        {/* Main Card - Material You Poster Card */}
        <div className="bg-[#F3EDF7] rounded-[32px] overflow-hidden border border-[#E7E0EC] shadow-md">
          {/* Card Header: Material You Gradient & Organic Blur */}
          <div className="bg-gradient-to-br from-[#6750A4] via-[#5B3E96] to-[#4F378B] text-white p-8 text-center relative overflow-hidden">
            {/* Background Organic Accent */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/15 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#FFD8E4]/20 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[#FFFBFE] rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                <img
                  src="/logo-sman1-batu.png"
                  alt="Logo SMA Negeri 1 Batu"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Masuk Portal Admin UKS
              </h2>
              <p className="text-xs font-normal text-[#EADDFF] mt-1">
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
                <label className="block text-xs font-medium text-[#49454F] mb-1.5 uppercase tracking-wider" htmlFor="admin-username">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#79747E]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-3.5 py-3 bg-[#E7E0EC] focus:bg-[#EDE7F2] text-[#1C1B1F] font-normal text-sm rounded-t-xl border-b-2 border-[#79747E] focus:border-[#6750A4] outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-medium text-[#49454F] mb-1.5 uppercase tracking-wider" htmlFor="admin-password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#79747E]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-3 bg-[#E7E0EC] focus:bg-[#EDE7F2] text-[#1C1B1F] font-normal text-sm rounded-t-xl border-b-2 border-[#79747E] focus:border-[#6750A4] outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#79747E] hover:text-[#1C1B1F] cursor-pointer"
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
                  className="w-full h-12 inline-flex items-center justify-center gap-2 bg-[#6750A4] hover:bg-[#6750A4]/90 text-white font-medium text-xs rounded-full active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </div>
            </form>

            {/* Public Access Note */}
            <div className="pt-4 border-t border-[#E7E0EC] text-center">
              <p className="text-xs text-[#49454F] font-normal">
                Bukan petugas UKS? Anda dapat langsung mengisi buku kunjungan.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setPendingTab(null);
                    navigateToTab('guestbook');
                  }}
                  className="text-[#6750A4] font-medium hover:underline inline-block mt-1 cursor-pointer"
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
