import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  School, 
  Upload, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  ArrowRight,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { SchoolInfo } from '../types';

export const SchoolSettings: React.FC = () => {
  const { 
    schoolInfo, 
    updateSchoolInfo, 
    resetSchoolInfo, 
    koordinatorUks, 
    navigateToTab, 
    showToast 
  } = useUks();

  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  const [logoPreview, setLogoPreview] = useState<string | undefined>(schoolInfo.logoUrl);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if schoolInfo changes externally
  useEffect(() => {
    setFormData({ ...schoolInfo });
    setLogoPreview(schoolInfo.logoUrl);
  }, [schoolInfo]);

  // Handle Logo Upload (Convert to Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (PNG, JPG, JPEG, WebP, SVG).', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file logo maksimal 2MB agar performa tetap optimal.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({ ...prev, logoUrl: base64 }));
      showToast('Logo berhasil dimuat. Klik "Simpan Perubahan" untuk menerapkan.', 'info');
    };
    reader.onerror = () => {
      showToast('Gagal membaca file logo.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logoUrl: '' }));
    showToast('Logo dihapus dari pratinjau.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama resmi sekolah wajib diisi.', 'error');
      return;
    }
    if (!formData.schoolPrincipal.trim()) {
      showToast('Nama Kepala Sekolah wajib diisi untuk penandatangan laporan.', 'error');
      return;
    }

    updateSchoolInfo(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh identitas sekolah ke pengaturan standar awal?')) {
      resetSchoolInfo();
    }
  };

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Pengaturan Profil & Laporan
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Identitas Sekolah & Kop Laporan
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Sesuaikan nama instansi, logo, kepala sekolah, dan kontak resmi. Informasi ini otomatis dicetak pada seluruh kop surat, pratinjau rekapitulasi, dan berkas PDF/Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            title="Kembalikan ke data awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Default
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Input Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CARD 1: Identitas Resmi Sekolah */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <School className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-base text-slate-900">
                  Nama Instansi & Sekolah
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Instansi Pembina / Header Kop Surat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.governmentHeader}
                  onChange={(e) => setFormData({ ...formData, governmentHeader: e.target.value })}
                  placeholder="Contoh: PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm font-medium text-slate-800 transition outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Baris teratas pada kop surat dokumen resmi UKS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Resmi Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: SEKOLAH MENENGAH ATAS NEGERI 1 BATU"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm font-bold text-slate-800 transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Singkat Sekolah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="Contoh: SMAN 1 BATU"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm font-semibold text-slate-800 transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Unit / Layanan
                  </label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="Contoh: UNIT KESEHATAN SEKOLAH (UKS)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm font-semibold text-emerald-800 transition outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: Kontak & Alamat */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-base text-slate-900">
                  Alamat & Kontak Sekolah
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Lengkap Sekolah <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. KH. Agus Salim No. 57, Kel. Sisir, Kec. Batu, Kota Batu, Jawa Timur 65314"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm text-slate-800 transition outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kota / Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Contoh: Kota Batu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm text-slate-800 transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    No. Telepon Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: (0341) 591310"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm text-slate-800 transition outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: sman1batu@yahoo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm text-slate-800 transition outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Penandatangan Laporan (Kepala Sekolah & Koordinator UKS) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-base text-slate-900">
                  Penandatangan Dokumen Laporan
                </h2>
              </div>

              {/* Kepala Sekolah Input */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-700 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Pihak Mengetahui: Kepala Sekolah
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.schoolPrincipal}
                      onChange={(e) => setFormData({ ...formData, schoolPrincipal: e.target.value })}
                      placeholder="Contoh: Drs. R. Agus Santoso, M.Pd"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm font-semibold text-slate-800 bg-white transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.schoolPrincipalNip}
                      onChange={(e) => setFormData({ ...formData, schoolPrincipalNip: e.target.value })}
                      placeholder="Contoh: 19690315 199412 1 002"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-sm font-mono text-slate-800 bg-white transition outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Koordinator UKS Info (Dynamic from User Management) */}
              <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-purple-900 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    Pihak Penanggung Jawab: Koordinator UKS
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    Otomatis dari Manajemen Pengguna
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {koordinatorUks?.name || 'Belum Ditetapkan di Manajemen Pengguna'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      NIP. {koordinatorUks?.nip || '-'} • Jabatan: {koordinatorUks?.role || 'Koordinator UKS'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateToTab('users')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-100 border border-purple-300 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs shrink-0"
                  >
                    <span>Ubah di Manajemen Pengguna</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Logo & Live Letterhead Preview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD 4: Upload Logo Sekolah */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-base text-slate-900">
                    Logo Resmi Sekolah
                  </h2>
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Logo
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Logo Display */}
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Sekolah" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <School className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                      <span className="text-[10px] block mt-1">Tanpa Logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Format: PNG, JPG, SVG. Disarankan logo transparan / persegi agar tampak optimal di kop surat.
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 5: Live Kop Surat Preview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Pratinjau Kop & TTD Laporan
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  Live Preview
                </span>
              </div>

              {/* Document Mockup Box */}
              <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-sm text-center space-y-3">
                {/* Header Kop */}
                <div className="border-b-2 border-slate-800 pb-3 relative flex items-center justify-center gap-3">
                  {logoPreview && (
                    <div className="w-12 h-12 shrink-0 hidden sm:block">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      {formData.governmentHeader || 'PEMERINTAH PROVINSI • DINAS PENDIDIKAN'}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 tracking-tight mt-0.5">
                      {formData.name || 'NAMA SEKOLAH'}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-800 tracking-wide mt-0.5">
                      {formData.division || 'UNIT KESEHATAN SEKOLAH (UKS)'}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                      {formData.address}
                    </div>
                    {(formData.phone || formData.email) && (
                      <div className="text-[9px] text-slate-400">
                        {formData.phone ? `Telp: ${formData.phone}` : ''} {formData.phone && formData.email ? '|' : ''} {formData.email ? `Email: ${formData.email}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sample Document Title */}
                <div className="pt-1">
                  <div className="text-xs font-extrabold uppercase underline text-slate-900">
                    Rekapitulasi Pelayanan Pasien UKS
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Periode: {currentDateStr}
                  </div>
                </div>

                {/* Table Mockup Placeholder */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-400">
                  [ Tabel Daftar Kunjungan Siswa & Rekap Obat ]
                </div>

                {/* Signature Preview */}
                <div className="pt-3 grid grid-cols-2 text-center text-[10px] gap-2 border-t border-slate-100">
                  <div>
                    <p className="text-slate-500">Mengetahui,</p>
                    <p className="font-semibold text-slate-800">Kepala {formData.shortName || 'SMAN 1 Batu'}</p>
                    <div className="h-10"></div>
                    <p className="font-bold text-slate-900">{formData.schoolPrincipal || 'Nama Kepala Sekolah'}</p>
                    <p className="text-[9px] text-slate-500">NIP. {formData.schoolPrincipalNip || '-'}</p>
                  </div>

                  <div>
                    <p className="text-slate-500">{formData.city || 'Kota'}, {currentDateStr}</p>
                    <p className="font-semibold text-slate-800">Koordinator UKS {formData.shortName || 'Sekolah'}</p>
                    <div className="h-10"></div>
                    <p className="font-bold text-slate-900">{koordinatorUks?.name || 'Nama Koordinator'}</p>
                    <p className="text-[9px] text-slate-500">NIP. {koordinatorUks?.nip || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Bottom Sticky Save Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-300 shadow-xl flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Identitas Berhasil Disimpan & Diterapkan ke Laporan!
              </span>
            ) : (
              <span className="text-xs text-slate-500 hidden sm:inline">
                Pastikan data identitas sekolah sudah tepat sebelum menyimpan.
              </span>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Identitas
          </button>
        </div>
      </form>
    </div>
  );
};
