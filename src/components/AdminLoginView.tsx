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
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Buku Kontrol Pengunjung
          </button>
        </div>

        {/* Intended destination notification */}
        {pendingTab && (
          <div className="mb-6 p-5 bg-amber-500 text-white rounded-lg flex items-start gap-3">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-extrabold uppercase tracking-wider">Akses Terbatas Diperlukan</div>
              <div className="mt-1 leading-relaxed font-medium">
                Anda diarahkan ke login untuk mengakses <span className="font-bold underline">{getDestinationLabel(pendingTab)}</span>.
              </div>
            </div>
          </div>
        )}

        {/* Main Card - Pure Flat Poster Style */}
        <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200">
          {/* Card Header: Solid Color Block */}
          <div className="bg-blue-600 text-white p-8 text-center relative">
            {/* Background Geometric Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center mb-3">
                <img
                  src="/logo-sman1-batu.png"
                  alt="Logo SMA Negeri 1 Batu"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                Masuk Portal Admin UKS
              </h2>
              <p className="text-xs font-semibold text-blue-100 mt-1">
                Panel Manajemen & Pelayanan Kesehatan Sekolah
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMessage && (
              <div className="p-4 bg-rose-500 text-white rounded-md flex items-start gap-3 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold uppercase">Gagal Masuk</div>
                  <div className="mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider" htmlFor="admin-username">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-3.5 py-3 bg-gray-100 focus:bg-white text-gray-900 font-semibold text-sm rounded-md border-2 border-transparent focus:border-blue-600 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider" htmlFor="admin-password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-3 bg-gray-100 focus:bg-white text-gray-900 font-semibold text-sm rounded-md border-2 border-transparent focus:border-blue-600 outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-900 cursor-pointer"
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
                  className="w-full h-12 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-wider text-xs rounded-md transition-all duration-200 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-4 h-4" />
                  {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
                </button>
              </div>
            </form>

            {/* Public Access Note */}
            <div className="pt-4 border-t-2 border-gray-100 text-center">
              <p className="text-xs text-gray-600 font-medium">
                Bukan petugas UKS? Anda dapat langsung mengisi buku kunjungan.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setPendingTab(null);
                    navigateToTab('guestbook');
                  }}
                  className="text-blue-600 font-bold hover:underline inline-block mt-1 cursor-pointer"
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
