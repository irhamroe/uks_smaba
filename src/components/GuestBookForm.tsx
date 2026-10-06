import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  Heart,
  Activity,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  Bed,
  Thermometer,
  Gauge,
  AlertCircle,
  AlertTriangle,
  FileText,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { MedicineUsage, VisitRecord, VisitorRole, Gender, VisitStatus } from '../types';
import { STUDENT_CLASSES, ALL_STUDENT_CLASSES } from '../data/initialData';

export const GuestBookForm: React.FC = () => {
  const { medicines, addVisitRecord, navigateToTab, isAdminLoggedIn } = useUks();

  // Form State
  const [role, setRole] = useState<VisitorRole>('siswa');
  const [visitorName, setVisitorName] = useState('');
  const [gender, setGender] = useState<Gender>('L');
  const [classOrPosition, setClassOrPosition] = useState('');
  const [complaint, setComplaint] = useState('');
  const [hasDrugAllergy, setHasDrugAllergy] = useState(false);
  const [drugAllergyDescription, setDrugAllergyDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [needsMedicine, setNeedsMedicine] = useState(false);
  const [medicinesGiven, setMedicinesGiven] = useState<MedicineUsage[]>([]);
  const [notes, setNotes] = useState('');
  const [finalStatus, setFinalStatus] = useState<VisitStatus>('Kembali ke Kelas / Mengajar');
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [liveTime, setLiveTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Success Modal State
  const [lastSubmitted, setLastSubmitted] = useState<VisitRecord | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick class select handler
  const handleSelectStudentClass = (selectedClass: string) => {
    setClassOrPosition(selectedClass);
  };

  const handleRoleChange = (newRole: VisitorRole) => {
    setRole(newRole);
    if (newRole === 'siswa') {
      if (!ALL_STUDENT_CLASSES.includes(classOrPosition)) {
        setClassOrPosition('');
      }
    } else {
      if (ALL_STUDENT_CLASSES.includes(classOrPosition)) {
        setClassOrPosition('');
      }
    }
  };

  const quickSymptoms = [
    'Pusing / Sakit Kepala',
    'Mual / Muntah',
    'Sakit Tenggorokan',
    'Sariawan',
    'Flu (Batuk)',
    'Flu (Pilek)',
    'Demam / Meriang',
    'Diare',
    'Sakit Perut / Maag',
    'Kram Haid (Dismenore)',
    'Luka Lecet / Terkilir',
    'Pingsan',
    'Sesak Napas / Asma',
    'Sakit Gigi',
    'Mata Merah / Iritasi',
    'Alergi / Gatal-gatal'
  ];

  const quickActions = [
    'Istirahat di UKS',
    'Diberi Air Hangat / Teh Manis',
    'Kompres Hangat / Dingin',
    'Pembersihan Luka & Antiseptik',
    'Pemasangan Kasa / Plester',
    'Diberikan Obat Sesuai Gejala',
    'Pengukuran Suhu & Tensi',
    'Diizinkan Pulang Dijemput Ortu'
  ];

  // Helper untuk toggle (tambah / hapus) opsi pilih cepat pada textarea
  const toggleQuickTag = (currentText: string, tag: string): string => {
    if (!currentText || !currentText.trim()) {
      return tag;
    }

    const trimmedTag = tag.trim().toLowerCase();

    // Pisahkan teks saat ini berdasarkan pemisah koma
    const items = currentText
      .split(/,\s*/)
      .map(s => s.trim())
      .filter(Boolean);

    const matchIndex = items.findIndex(s => s.toLowerCase() === trimmedTag);

    if (matchIndex !== -1) {
      // Jika sudah ada, hapus opsi tersebut dari daftar
      items.splice(matchIndex, 1);
      return items.join(', ');
    }

    // Jika tag berada di dalam teks bebas
    if (currentText.toLowerCase().includes(trimmedTag)) {
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escaped = escapeRegExp(tag.trim());
      const regex = new RegExp(`(^|,\\s*)${escaped}(\\s*,|$)`, 'gi');
      const replaced = currentText.replace(regex, (match, p1, p2) => {
        if (p1.includes(',') && p2.includes(',')) return ', ';
        return '';
      });
      return replaced.replace(/^[\s,]+|[\s,]+$/g, '').trim();
    }

    // Jika belum ada, tambahkan ke teks
    const trimmed = currentText.trim();
    if (trimmed.endsWith(',')) {
      return `${trimmed} ${tag}`;
    }
    return `${trimmed}, ${tag}`;
  };

  const isTagActive = (currentText: string, tag: string): boolean => {
    if (!currentText) return false;
    const trimmedTag = tag.trim().toLowerCase();
    const items = currentText
      .split(/,\s*/)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    return items.includes(trimmedTag) || currentText.toLowerCase().includes(trimmedTag);
  };

  // Medicine selection handlers
  const handleAddMedicineRow = () => {
    // Find first medicine with available stock
    const available = medicines.find(m => m.stock > 0 && !medicinesGiven.some(mg => mg.medicineId === m.id));
    if (!available) return;

    const isMulti = available.usageType === 'multi_dose' || ((available.unit === 'Botol' || available.unit === 'Tube') && available.usageType !== 'single_dose');

    setMedicinesGiven(prev => [
      ...prev,
      {
        medicineId: available.id,
        medicineName: available.name,
        quantity: 1,
        unit: available.unit,
        dosageNotes: isMulti ? 'Oleskan / teteskan secukupnya di ruang UKS' : '1 dosis sesudah makan'
      }
    ]);
  };

  const handleUpdateMedicineRow = (index: number, medicineId: string) => {
    const selected = medicines.find(m => m.id === medicineId);
    if (!selected) return;

    const isMulti = selected.usageType === 'multi_dose' || ((selected.unit === 'Botol' || selected.unit === 'Tube') && selected.usageType !== 'single_dose');

    setMedicinesGiven(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        medicineId: selected.id,
        medicineName: selected.name,
        unit: selected.unit,
        quantity: isMulti ? 1 : Math.min(copy[index].quantity, Math.max(1, selected.stock)),
        dosageNotes: isMulti
          ? (copy[index].dosageNotes?.includes('makan') ? 'Oleskan / teteskan secukupnya di ruang UKS' : copy[index].dosageNotes || 'Oleskan / teteskan secukupnya di ruang UKS')
          : (copy[index].dosageNotes?.includes('Oleskan') ? '1 tablet/dosis sesudah makan' : copy[index].dosageNotes || '1 dosis sesudah makan')
      };
      return copy;
    });
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const medId = medicinesGiven[index]?.medicineId;
    const medObj = medicines.find(m => m.id === medId);
    const maxStock = medObj ? medObj.stock : 100;

    const validQty = Math.max(1, Math.min(qty, maxStock));
    setMedicinesGiven(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], quantity: validQty };
      return copy;
    });
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicinesGiven(prev => prev.filter((_, i) => i !== index));
  };

  const handleDosageChange = (index: number, notes: string) => {
    setMedicinesGiven(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], dosageNotes: notes };
      return copy;
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!visitorName.trim()) {
      setErrorMessage('Nama pengunjung wajib diisi.');
      return;
    }

    if (!classOrPosition.trim()) {
      setErrorMessage(role === 'siswa' ? 'Silakan pilih kelas siswa dari daftar dropdown (X-1 s/d XII-12).' : 'Jabatan / Tugas guru/staf wajib diisi.');
      return;
    }

    if (!complaint.trim()) {
      setErrorMessage('Keluhan atau alasan ke UKS wajib diisi.');
      return;
    }

    if (hasDrugAllergy && !drugAllergyDescription.trim()) {
      setErrorMessage('Anda menandai memiliki alergi obat. Silakan sebutkan nama obat atau jenis zat yang menyebabkan alergi.');
      return;
    }

    if (!actionTaken.trim()) {
      setErrorMessage('Tindakan atau penanganan awal wajib diisi.');
      return;
    }

    if (needsMedicine && medicinesGiven.length === 0) {
      setErrorMessage('Anda menandai butuh obat, silakan pilih minimal 1 nama obat atau nonaktifkan opsi obat.');
      return;
    }

    const result = addVisitRecord({
      visitorName,
      role,
      classOrPosition,
      gender,
      complaint,
      hasDrugAllergy,
      drugAllergyDescription: hasDrugAllergy ? drugAllergyDescription : '',
      actionTaken,
      needsMedicine,
      medicinesGiven: needsMedicine ? medicinesGiven : [],
      notes,
      finalStatus,
      temperature,
      bloodPressure
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Gagal menyimpan data.');
      return;
    }

    // Set last submitted record snapshot for modal preview
    setLastSubmitted({
      id: 'preview',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visitorName,
      role,
      classOrPosition,
      gender,
      complaint,
      hasDrugAllergy,
      drugAllergyDescription: hasDrugAllergy ? drugAllergyDescription : '',
      actionTaken,
      needsMedicine,
      medicinesGiven: needsMedicine ? medicinesGiven : [],
      notes,
      finalStatus,
      temperature,
      bloodPressure
    });

    setShowSuccessModal(true);

    // Reset Form
    setVisitorName('');
    setClassOrPosition('');
    setComplaint('');
    setHasDrugAllergy(false);
    setDrugAllergyDescription('');
    setActionTaken('');
    setNeedsMedicine(false);
    setMedicinesGiven([]);
    setNotes('');
    setTemperature('');
    setBloodPressure('');
    setFinalStatus('Kembali ke Kelas / Mengajar');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Welcome Banner Card - Material You Atmospheric Hero */}
      <div className="mb-8 bg-gradient-to-br from-[#6750A4] via-[#5B3E96] to-[#4F378B] text-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-9 relative overflow-hidden shadow-md">
        {/* Atmospheric Organic Blur Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D0BCFF]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#FFD8E4]/15 rounded-full blur-2xl -mb-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-white mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD8E4]" />
              Buku Kontrol Pengunjung Digital UKS
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat Datang di UKS SMAN 1 Batu
            </h2>
            <p className="text-xs sm:text-sm text-[#EADDFF] font-normal mt-1.5 max-w-xl leading-relaxed">
              Silakan isi formulir kunjungan UKS di bawah ini secara lengkap untuk pencatatan riwayat kesehatan sekolah.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto border border-white/20 shadow-xs">
            <div className="flex items-center justify-center gap-2 text-xs text-[#EADDFF] font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#A8DAB5]"></span>
              <span>Waktu Sekarang</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
              {liveTime || '--:--:--'}
            </div>
            <div className="text-xs text-[#EADDFF] font-normal mt-0.5">
              {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Main Guest Book Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#F3EDF7] rounded-[32px] sm:rounded-[40px] border border-[#E7E0EC] p-6 sm:p-9 space-y-8 shadow-sm">

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="flex items-start gap-3 bg-[#F9DEDC] text-[#410E0B] border border-[#B3261E]/30 p-4 rounded-2xl text-xs sm:text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-[#B3261E] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Perhatian: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* SECTION 1: Identitas Pengunjung */}
        <div>
          <div className="flex items-center gap-3 text-[#1C1B1F] font-bold text-base mb-5 pb-3 border-b border-[#E7E0EC]">
            <div className="w-8 h-8 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>
            <span className="tracking-tight">Identitas Pengunjung UKS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Peran / Status */}
            <div>
              <label className="block text-xs font-medium text-[#49454F] uppercase tracking-wider mb-2">
                Status Pengunjung <span className="text-[#B3261E]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="role-btn-siswa"
                  onClick={() => handleRoleChange('siswa')}
                  className={`flex items-center justify-center gap-1.5 h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer ${role === 'siswa'
                      ? 'bg-[#6750A4] text-white shadow-sm'
                      : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                    }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Siswa
                </button>

                <button
                  type="button"
                  id="role-btn-guru"
                  onClick={() => handleRoleChange('guru')}
                  className={`flex items-center justify-center gap-1.5 h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer ${role === 'guru'
                      ? 'bg-[#6750A4] text-white shadow-sm'
                      : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                    }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Guru
                </button>

                <button
                  type="button"
                  id="role-btn-staf"
                  onClick={() => handleRoleChange('staf')}
                  className={`flex items-center justify-center gap-1.5 h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer ${role === 'staf'
                      ? 'bg-[#6750A4] text-white shadow-sm'
                      : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                    }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Staf TU
                </button>
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-medium text-[#49454F] uppercase tracking-wider mb-2">
                Jenis Kelamin <span className="text-[#B3261E]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="gender-btn-l"
                  onClick={() => setGender('L')}
                  className={`h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-center ${gender === 'L'
                      ? 'bg-[#6750A4] text-white shadow-sm'
                      : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                    }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  id="gender-btn-p"
                  onClick={() => setGender('P')}
                  className={`h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-center ${gender === 'P'
                      ? 'bg-[#7D5260] text-white shadow-sm'
                      : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                    }`}
                >
                  Perempuan
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="input-visitor-name" className="block text-xs font-medium text-[#49454F] uppercase tracking-wider mb-2">
                Nama Lengkap <span className="text-[#B3261E]">*</span>
              </label>
              <input
                id="input-visitor-name"
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Contoh: Nita Rimayanti, S.Pd"
                className="md3-input"
              />
            </div>

            {/* Kelas / Jabatan */}
            <div>
              {role === 'siswa' ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="select-student-class" className="block text-xs font-medium text-[#49454F] uppercase tracking-wider">
                      Kelas Siswa <span className="text-[#B3261E]">*</span>
                    </label>
                    {classOrPosition && ALL_STUDENT_CLASSES.includes(classOrPosition) && (
                      <span className="text-[11px] font-medium text-[#1D192B] bg-[#E8DEF8] px-3 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6750A4]" />
                        Kelas {classOrPosition}
                      </span>
                    )}
                  </div>

                  {/* Clean MD3 Dropdown Select */}
                  <div className="relative">
                    <select
                      id="select-student-class"
                      required
                      value={classOrPosition}
                      onChange={(e) => handleSelectStudentClass(e.target.value)}
                      className="md3-select cursor-pointer appearance-none pr-10"
                    >
                      <option value="">-- Pilih Kelas Siswa (X-1 s/d XII-12) --</option>
                      <optgroup label="── KELAS X (X-1 s/d X-12) ──">
                        {STUDENT_CLASSES.X.map((cls) => (
                          <option key={cls} value={cls}>
                            Kelas {cls}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── KELAS XI (XI-1 s/d XI-12) ──">
                        {STUDENT_CLASSES.XI.map((cls) => (
                          <option key={cls} value={cls}>
                            Kelas {cls}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="── KELAS XII (XII-1 s/d XII-12) ──">
                        {STUDENT_CLASSES.XII.map((cls) => (
                          <option key={cls} value={cls}>
                            Kelas {cls}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#79747E]">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#79747E] font-normal mt-1.5">
                    Pilih rombongan belajar Anda dari daftar tingkat X, XI, atau XII.
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="input-class-position" className="block text-xs font-medium text-[#49454F] uppercase tracking-wider mb-2">
                    Jabatan / Posisi <span className="text-[#B3261E]">*</span>
                  </label>
                  <input
                    id="input-class-position"
                    type="text"
                    required
                    value={classOrPosition}
                    onChange={(e) => setClassOrPosition(e.target.value)}
                    placeholder="Contoh: Guru / Wali Kelas / Staf TU"
                    className="md3-input"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Keluhan & Gejala Medis */}
        <div>
          <div className="flex items-center gap-3 text-[#1C1B1F] font-bold text-base mb-5 pb-3 border-b border-[#E7E0EC]">
            <div className="w-8 h-8 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              2
            </div>
            <span className="tracking-tight">Keluhan & Gejala yang Dirasakan</span>
          </div>

          {/* Quick Symptoms clicker */}
          <div className="mb-3">
            <span className="text-xs text-[#49454F] mb-2 block font-medium uppercase tracking-wider">Pilih cepat keluhan umum:</span>
            <div className="flex flex-wrap gap-2">
              {quickSymptoms.map(sym => {
                const active = isTagActive(complaint, sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setComplaint(prev => toggleQuickTag(prev, sym));
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-medium active:scale-95 transition-all duration-300 cursor-pointer ${active
                        ? 'bg-[#6750A4] text-white shadow-xs'
                        : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                      }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <textarea
              id="input-complaint"
              required
              rows={3}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Jelaskan keluhan secara spesifik (misal: Pusing berputar sejak jam pelajaran ke-2, mual dan belum sarapan)..."
              className="md3-input min-h-[96px]"
            />
          </div>

          {/* Optional Vitals: Suhu & Tensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3 bg-[#E7E0EC] p-4 rounded-2xl">
              <Thermometer className="w-6 h-6 text-[#7D5260] shrink-0" />
              <div className="flex-1">
                <label htmlFor="input-temp" className="block text-[11px] font-medium text-[#49454F] uppercase tracking-wide mb-1">
                  Suhu Tubuh (°C) - Opsional
                </label>
                <input
                  id="input-temp"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="36.5"
                  className="w-full h-10 px-3 bg-[#FFFBFE] text-sm font-medium text-[#1C1B1F] rounded-xl border-b-2 border-[#79747E] focus:border-[#6750A4] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#E7E0EC] p-4 rounded-2xl">
              <Gauge className="w-6 h-6 text-[#6750A4] shrink-0" />
              <div className="flex-1">
                <label htmlFor="input-bp" className="block text-[11px] font-medium text-[#49454F] uppercase tracking-wide mb-1">
                  Tekanan Darah (mmHg) - Opsional
                </label>
                <input
                  id="input-bp"
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="110/70"
                  className="w-full h-10 px-3 bg-[#FFFBFE] text-sm font-medium text-[#1C1B1F] rounded-xl border-b-2 border-[#79747E] focus:border-[#6750A4] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Tindakan / Penanganan UKS */}
        <div>
          <div className="flex items-center gap-3 text-[#1C1B1F] font-bold text-base mb-5 pb-3 border-b border-[#E7E0EC]">
            <div className="w-8 h-8 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              3
            </div>
            <span className="tracking-tight">Tindakan / Penanganan UKS</span>
          </div>

          <div className="mb-3">
            <span className="text-xs text-[#49454F] mb-2 block font-medium uppercase tracking-wider">Pilih cepat tindakan yang diberikan:</span>
            <div className="flex flex-wrap gap-2">
              {quickActions.map(act => {
                const active = isTagActive(actionTaken, act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => {
                      setActionTaken(prev => toggleQuickTag(prev, act));
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-medium active:scale-95 transition-all duration-300 cursor-pointer ${active
                        ? 'bg-[#7D5260] text-white shadow-xs'
                        : 'bg-[#E7E0EC] text-[#49454F] hover:bg-[#EDE7F2]'
                      }`}
                  >
                    {act}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <textarea
              id="input-action-taken"
              required
              rows={3}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="Tindakan yang telah dilakukan petugas UKS (misal: Diberi teh manis hangat, diolesi minyak kayu putih, diobservasi di ruang UKS)..."
              className="md3-input min-h-[96px]"
            />
          </div>
        </div>

        {/* SECTION: Konfirmasi Riwayat Alergi Obat */}
        <div className={`rounded-3xl p-5 sm:p-6 transition-all border ${hasDrugAllergy
            ? 'bg-[#F9DEDC] border-[#B3261E]/40'
            : 'bg-[#E7E0EC] border-transparent'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-xs ${hasDrugAllergy ? 'bg-[#B3261E]' : 'bg-[#49454F]'
                }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1C1B1F] text-sm uppercase tracking-wide flex items-center gap-2">
                  Konfirmasi Riwayat Alergi Obat
                  <span className="text-[#B3261E]">*</span>
                </h3>
                <p className="text-xs text-[#49454F] font-normal">
                  Apakah pengunjung memiliki riwayat alergi terhadap obat-obatan tertentu?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                id="allergy-btn-no"
                onClick={() => {
                  setHasDrugAllergy(false);
                  setDrugAllergyDescription('');
                }}
                className={`h-11 px-5 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-center ${!hasDrugAllergy
                    ? 'bg-[#6750A4] text-white shadow-xs'
                    : 'bg-[#FFFBFE] text-[#49454F] hover:bg-white'
                  }`}
              >
                ✓ Tidak Ada Alergi
              </button>

              <button
                type="button"
                id="allergy-btn-yes"
                onClick={() => setHasDrugAllergy(true)}
                className={`h-11 px-5 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-center ${hasDrugAllergy
                    ? 'bg-[#B3261E] text-white shadow-xs'
                    : 'bg-[#FFFBFE] text-[#B3261E] hover:bg-[#F9DEDC]'
                  }`}
              >
                ⚠ Ada Alergi Obat
              </button>
            </div>
          </div>

          {hasDrugAllergy && (
            <div className="mt-4 pt-4 border-t border-[#B3261E]/20">
              <label htmlFor="input-allergy-desc" className="block text-xs font-medium text-[#410E0B] uppercase tracking-wider mb-2">
                Sebutkan Nama Obat yang Menyebabkan Alergi: <span className="text-[#B3261E]">*</span>
              </label>
              <input
                id="input-allergy-desc"
                type="text"
                required={hasDrugAllergy}
                value={drugAllergyDescription}
                onChange={(e) => setDrugAllergyDescription(e.target.value)}
                placeholder="Contoh: Alergi Paracetamol, Antibiotik Amoxicillin, Golongan Sulfa, Asam Mefenamat, dll."
                className="w-full h-12 px-4 rounded-xl bg-[#FFFBFE] text-[#1C1B1F] text-sm font-medium border-b-2 border-[#B3261E] outline-none"
              />
              <p className="text-xs text-[#B3261E] mt-2 font-medium">
                Peringatan: Petugas UKS tidak akan memberikan obat yang mengandung bahan/zat pemicu alergi di atas.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 4: Kebutuhan Obat */}
        <div className="bg-[#ECE6F0] rounded-3xl border border-[#CAC4D0] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#6750A4] text-white flex items-center justify-center shadow-xs">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1C1B1F] text-sm tracking-tight">
                  Kebutuhan Obat Pengunjung
                </h3>
                <p className="text-xs text-[#49454F] font-normal">
                  {isAdminLoggedIn
                    ? 'Stok obat otomatis berkurang dari inventaris UKS secara real-time.'
                    : 'Pengajuan obat akan divalidasi dan diserahkan oleh petugas UKS.'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="toggle-needs-medicine"
                type="checkbox"
                checked={needsMedicine}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setNeedsMedicine(checked);
                  if (checked && medicinesGiven.length === 0) {
                    handleAddMedicineRow();
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-[#CAC4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6750A4]"></div>
              <span className="ml-3 text-xs font-medium text-[#1C1B1F]">
                {needsMedicine ? 'Butuh Obat' : 'Tidak Butuh Obat'}
              </span>
            </label>
          </div>

          {/* If Needs Medicine is Active */}
          {needsMedicine && (
            <div className="space-y-4 pt-3">
              {medicinesGiven.length === 0 ? (
                <div className="text-center py-6 bg-[#FFFBFE] rounded-2xl border border-dashed border-[#CAC4D0] text-[#49454F] text-sm">
                  <span>Belum ada obat yang dipilih. </span>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-[#6750A4] font-medium hover:underline cursor-pointer"
                  >
                    + Klik untuk memilih obat
                  </button>
                </div>
              ) : (
                medicinesGiven.map((medRow, index) => {
                  const currentMedObj = medicines.find(m => m.id === medRow.medicineId);
                  const isOutOfStock = currentMedObj && currentMedObj.stock === 0;
                  const isLowStock = currentMedObj && currentMedObj.stock <= currentMedObj.minStock;
                  const isMultiDose = currentMedObj && (currentMedObj.usageType === 'multi_dose' || ((currentMedObj.unit === 'Botol' || currentMedObj.unit === 'Tube') && currentMedObj.usageType !== 'single_dose'));

                  return (
                    <div
                      key={index}
                      className="bg-[#FFFBFE] p-5 rounded-2xl border border-[#E7E0EC] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-4"
                    >
                      {/* Medicine Dropdown */}
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-[#49454F] uppercase tracking-wide">
                            Nama Obat Tersedia
                          </label>
                          {isMultiDose && (
                            <span className="bg-[#E8DEF8] text-[#1D192B] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                              Pemakaian Bersama di UKS
                            </span>
                          )}
                        </div>
                        <select
                          value={medRow.medicineId}
                          onChange={(e) => handleUpdateMedicineRow(index, e.target.value)}
                          className="w-full h-11 text-sm font-medium text-[#1C1B1F] bg-[#E7E0EC] border-b-2 border-[#79747E] rounded-t-xl px-3 focus:bg-[#EDE7F2] focus:border-[#6750A4] outline-none"
                        >
                          {medicines.map(m => {
                            const isMulti = m.usageType === 'multi_dose' || ((m.unit === 'Botol' || m.unit === 'Tube') && m.usageType !== 'single_dose');
                            const isExpired = m.expiryDate && m.expiryDate < new Date().toISOString().split('T')[0];
                            return (
                              <option
                                key={m.id}
                                value={m.id}
                                disabled={m.stock === 0 || isExpired}
                              >
                                {m.name} — Stok: {m.stock} {m.unit} {isMulti ? '(Multi-Pakai)' : ''} {m.stock === 0 ? '(HABIS)' : isExpired ? '(KEDALUWARSA)' : m.stock <= m.minStock ? '(MENIPIS)' : ''}
                              </option>
                            );
                          })}
                        </select>
                        {currentMedObj && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[#49454F] font-normal">
                              Kategori: <strong className="text-[#1C1B1F]">{currentMedObj.category}</strong>
                            </span>
                            <span className="text-[#CAC4D0]">•</span>
                            <span className={`font-medium ${isOutOfStock ? 'text-[#B3261E]' : isLowStock ? 'text-[#7D5260]' : 'text-[#6750A4]'
                              }`}>
                              Sisa: {currentMedObj.stock} {currentMedObj.unit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="w-full md:w-36">
                        <label className="block text-[11px] font-medium text-[#49454F] uppercase tracking-wide mb-1">
                          Jumlah Diberikan
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, medRow.quantity - 1)}
                            disabled={medRow.quantity <= 1}
                            className="w-10 h-11 bg-[#E7E0EC] hover:bg-[#EDE7F2] text-[#1C1B1F] font-bold rounded-l-xl border-b-2 border-[#79747E] disabled:opacity-40 active:scale-95 transition cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={currentMedObj ? currentMedObj.stock : 100}
                            value={medRow.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                            className="w-full text-center h-11 text-sm font-bold border-b-2 border-[#79747E] text-[#1C1B1F] bg-[#FFFBFE]"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, medRow.quantity + 1)}
                            disabled={currentMedObj ? medRow.quantity >= currentMedObj.stock : false}
                            className="w-10 h-11 bg-[#E7E0EC] hover:bg-[#EDE7F2] text-[#1C1B1F] font-bold rounded-r-xl border-b-2 border-[#79747E] disabled:opacity-40 active:scale-95 transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-[#79747E] font-normal block text-center mt-1">
                          Satuan: {medRow.unit}
                        </span>
                      </div>

                      {/* Dosage / Notes */}
                      <div className="flex-1 w-full">
                        <label className="block text-[11px] font-medium text-[#49454F] uppercase tracking-wide mb-1">
                          Aturan / Anjuran Pakai
                        </label>
                        <input
                          type="text"
                          value={medRow.dosageNotes || ''}
                          onChange={(e) => handleDosageChange(index, e.target.value)}
                          placeholder="Misal: 1 tablet sesudah makan"
                          className="w-full h-11 px-3 bg-[#E7E0EC] text-sm font-medium text-[#1C1B1F] border-b-2 border-[#79747E] rounded-t-xl focus:bg-[#EDE7F2] focus:border-[#6750A4] outline-none"
                        />
                      </div>

                      {/* Delete Row Button */}
                      <div className="flex md:pt-6 justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(index)}
                          className="h-11 px-3.5 text-[#B3261E] hover:bg-[#F9DEDC] rounded-full active:scale-95 transition-all duration-300 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                          title="Hapus obat ini"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="md:hidden">Hapus Obat</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#1D192B] bg-[#E8DEF8] hover:bg-[#EADDFF] px-5 py-2.5 rounded-full active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#6750A4]" />
                  Tambah Obat Lainnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Status Akhir Kunjungan */}
        <div>
          <div className="flex items-center gap-3 text-[#1C1B1F] font-bold text-base mb-5 pb-3 border-b border-[#E7E0EC]">
            <div className="w-8 h-8 rounded-full bg-[#6750A4] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              4
            </div>
            <span className="tracking-tight">Status Akhir Kunjungan</span>
          </div>

          <div>
            <label htmlFor="select-final-status" className="block text-xs font-medium text-[#49454F] uppercase tracking-wider mb-2">
              Kondisi / Disposisi Akhir Pengunjung UKS <span className="text-[#B3261E]">*</span>
            </label>
            <div className="relative">
              <select
                id="select-final-status"
                value={finalStatus}
                onChange={(e) => setFinalStatus(e.target.value as VisitStatus)}
                className="md3-select cursor-pointer appearance-none pr-10"
              >
                <option value="Kembali ke Kelas / Mengajar">Kembali ke Kelas / Mengajar</option>
                <option value="Istirahat di UKS">Istirahat di UKS</option>
                <option value="Izin Pulang / Dijemput">Izin Pulang / Dijemput Orang Tua</option>
                <option value="Rujukan ke Puskesmas/RS">Rujukan ke Puskesmas / Rumah Sakit</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#79747E]">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Catatan Tambahan (Opsional) */}
        <div>
          <label htmlFor="input-notes" className="block text-xs font-medium text-[#49454F] uppercase tracking-wider mb-2">
            Catatan Tambahan Petugas UKS (Opsional)
          </label>
          <input
            id="input-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Sudah menghubungi wali murid, dipantau hingga jam istirahat kedua..."
            className="md3-input"
          />
        </div>

        {/* Submit Button - Material You Pill Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[#E7E0EC]">
          <button
            id="btn-submit-guestbook"
            type="submit"
            className="md3-btn-filled w-full sm:w-auto h-14 px-10 text-sm shadow-sm hover:shadow-md cursor-pointer"
          >
            <Send className="w-5 h-5" />
            Simpan Data Kunjungan
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL / MATERIAL YOU DIALOG */}
      {showSuccessModal && lastSubmitted && (
        <div className="fixed inset-0 z-50 bg-[#1C1B1F]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFBFE] rounded-[32px] max-w-lg w-full p-6 sm:p-8 border border-[#E7E0EC] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#EADDFF] text-[#21005D] flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9 text-[#6750A4] stroke-[2.5]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-center text-[#1C1B1F] mb-1 tracking-tight">
              {isAdminLoggedIn
                ? 'Data Kunjungan Berhasil Disimpan!'
                : 'Pengajuan Kunjungan Berhasil!'}
            </h3>
            <p className="text-xs sm:text-sm text-center text-[#49454F] font-normal mb-6">
              {isAdminLoggedIn
                ? 'Data pasien telah terdata di log dan stok obat telah disinkronkan.'
                : 'Data kunjungan telah masuk ke antrean verifikasi petugas UKS.'}
            </p>

            {/* Material You Summary Card */}
            <div className="bg-[#F3EDF7] rounded-2xl p-5 text-xs space-y-2.5 mb-6 border border-[#E7E0EC]">
              <div className="flex justify-between py-1 border-b border-[#E7E0EC]">
                <span className="text-[#49454F] font-medium">Nama:</span>
                <span className="font-bold text-[#1C1B1F]">{lastSubmitted.visitorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E0EC]">
                <span className="text-[#49454F] font-medium">Status / Kelas:</span>
                <span className="font-bold text-[#1C1B1F]">
                  {lastSubmitted.role.toUpperCase()} — {lastSubmitted.classOrPosition}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E0EC]">
                <span className="text-[#49454F] font-medium">Keluhan:</span>
                <span className="font-medium text-[#1C1B1F] text-right max-w-[200px] truncate">
                  {lastSubmitted.complaint}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E0EC]">
                <span className="text-[#49454F] font-medium">Tindakan:</span>
                <span className="font-medium text-[#1C1B1F] text-right max-w-[200px] truncate">
                  {lastSubmitted.actionTaken}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E0EC]">
                <span className="text-[#49454F] font-medium">Obat:</span>
                <span className="font-bold text-[#6750A4] text-right">
                  {lastSubmitted.medicinesGiven.length > 0
                    ? lastSubmitted.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                    : 'Tidak ada obat'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#49454F] font-medium">Status:</span>
                <span className="font-medium bg-[#E8DEF8] text-[#1D192B] px-3 py-0.5 rounded-full text-[10px]">
                  {lastSubmitted.finalStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-modal-new-guest"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:flex-1 h-12 md3-btn-tonal text-xs font-medium text-center"
              >
                Isi Kunjungan Baru
              </button>
              {isAdminLoggedIn && (
                <button
                  type="button"
                  id="btn-modal-view-dashboard"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigateToTab('dashboard');
                  }}
                  className="w-full sm:flex-1 h-12 md3-btn-filled text-xs font-medium text-center flex items-center justify-center gap-2"
                >
                  Buka Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
