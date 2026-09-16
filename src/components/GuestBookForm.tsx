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
    'Mual / Sakit Perut (Maag)',
    'Demam / Meriang',
    'Kram Haid (Dismenore)',
    'Luka Lecet / Terkilir',
    'Pingsan saat Upacara',
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

  // Medicine selection handlers
  const handleAddMedicineRow = () => {
    // Find first medicine with available stock
    const available = medicines.find(m => m.stock > 0 && !medicinesGiven.some(mg => mg.medicineId === m.id));
    if (!available) return;

    setMedicinesGiven(prev => [
      ...prev,
      {
        medicineId: available.id,
        medicineName: available.name,
        quantity: 1,
        unit: available.unit,
        dosageNotes: '1 dosis sesudah makan'
      }
    ]);
  };

  const handleUpdateMedicineRow = (index: number, medicineId: string) => {
    const selected = medicines.find(m => m.id === medicineId);
    if (!selected) return;

    setMedicinesGiven(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        medicineId: selected.id,
        medicineName: selected.name,
        unit: selected.unit,
        quantity: Math.min(copy[index].quantity, Math.max(1, selected.stock))
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
    setActionTaken('');
    setNeedsMedicine(false);
    setMedicinesGiven([]);
    setNotes('');
    setTemperature('');
    setBloodPressure('');
    setFinalStatus('Kembali ke Kelas / Mengajar');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6">
      {/* Welcome Banner Card - Modern Bootstrap Jumbotron style */}
      <div className="mb-5 sm:mb-6 bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-2xl p-5 sm:p-7 shadow-sm border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Buku Tamu Digital UKS Terintegrasi
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat Datang di UKS SMAN 1 Batu
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Silakan mengisi formulir kunjungan di bawah ini.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-3.5 border border-white/20 text-center shrink-0 w-full sm:w-auto">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Waktu Saat Ini</span>
            </div>
            <div className="text-base sm:text-xl font-bold font-mono tracking-wider text-white mt-0.5">
              {liveTime || '--:--:--'}
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-200/90 mt-0.5">
              {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Main Guest Book Form Card */}
      <form onSubmit={handleSubmit} className="bs-card p-4 sm:p-7 space-y-6">
        
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 p-3.5 sm:p-4 rounded-xl text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Mohon Periksa Kembali: </span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* SECTION 1: Identitas Pengunjung */}
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3.5 pb-2.5 border-b border-slate-100">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <span>Identitas Pengunjung UKS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Peran / Status */}
            <div>
              <label className="bs-form-label mb-2">
                Status Pengunjung <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="role-btn-siswa"
                  onClick={() => handleRoleChange('siswa')}
                  className={`flex items-center justify-center gap-1.5 min-h-[46px] py-2.5 px-2 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                    role === 'siswa'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  Siswa
                </button>

                <button
                  type="button"
                  id="role-btn-guru"
                  onClick={() => handleRoleChange('guru')}
                  className={`flex items-center justify-center gap-1.5 min-h-[46px] py-2.5 px-2 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                    role === 'guru'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Guru
                </button>

                <button
                  type="button"
                  id="role-btn-staf"
                  onClick={() => handleRoleChange('staf')}
                  className={`flex items-center justify-center gap-1.5 min-h-[46px] py-2.5 px-2 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                    role === 'staf'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Staf TU
                </button>
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="bs-form-label mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="gender-btn-l"
                  onClick={() => setGender('L')}
                  className={`min-h-[46px] py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer text-center ${
                    gender === 'L'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  id="gender-btn-p"
                  onClick={() => setGender('P')}
                  className={`min-h-[46px] py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer text-center ${
                    gender === 'P'
                      ? 'bg-pink-50 border-pink-500 text-pink-800 ring-2 ring-pink-500/20 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                  }`}
                >
                  Perempuan
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="input-visitor-name" className="bs-form-label mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="input-visitor-name"
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Contoh : Nita Rimayanti, S.Pd"
                className="bs-form-control w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-sm text-slate-800 placeholder-slate-400 transition"
              />
            </div>

            {/* Kelas / Jabatan */}
            <div>
              {role === 'siswa' ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="select-student-class" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Kelas Siswa <span className="text-red-500">*</span>
                    </label>
                    {classOrPosition && ALL_STUDENT_CLASSES.includes(classOrPosition) && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Kelas: {classOrPosition}
                      </span>
                    )}
                  </div>

                  {/* Clean Dropdown Select for Student Class - Full Width & Mobile Friendly */}
                  <div className="relative">
                    <select
                      id="select-student-class"
                      required
                      value={classOrPosition}
                      onChange={(e) => handleSelectStudentClass(e.target.value)}
                      className="bs-form-select w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-sm font-semibold text-slate-800 bg-white transition cursor-pointer shadow-xs appearance-none pr-10"
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Pilih rombongan belajar Anda dari daftar tingkat X, XI, atau XII.
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="input-class-position" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Jabatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-class-position"
                    type="text"
                    required
                    value={classOrPosition}
                    onChange={(e) => setClassOrPosition(e.target.value)}
                    placeholder="Contoh: Guru / Wali Kelas / Staf TU"
                    className="bs-form-control w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-sm text-slate-800 placeholder-slate-400 transition"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Keluhan & Gejala Medis */}
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
              2
            </div>
            <span>Keluhan & Gejala yang Dirasakan</span>
          </div>

          {/* Quick Symptoms clicker */}
          <div className="mb-3">
            <span className="text-xs text-slate-500 mb-1.5 block font-medium">Pilih cepat keluhan umum:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickSymptoms.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    if (complaint.includes(sym)) return;
                    setComplaint(prev => prev ? `${prev}, ${sym}` : sym);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                    complaint.includes(sym)
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              id="input-complaint"
              required
              rows={2}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Jelaskan keluhan secara spesifik (misal: Pusing berputar sejak jam pelajaran ke-2, mual dan belum sarapan)..."
              className="bs-form-control w-full min-h-[75px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-sm text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Optional Vitals: Suhu & Tensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 pt-1">
            <div className="flex items-center gap-2.5 bg-slate-50/90 p-3 rounded-xl border border-slate-200">
              <Thermometer className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <label htmlFor="input-temp" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Suhu Tubuh (°C) - Opsional
                </label>
                <input
                  id="input-temp"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="36.5"
                  className="bs-form-control w-full min-h-[38px] bg-white px-3 py-1.5 text-base sm:text-sm rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-50/90 p-3 rounded-xl border border-slate-200">
              <Gauge className="w-5 h-5 text-indigo-500 shrink-0" />
              <div className="flex-1">
                <label htmlFor="input-bp" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Tekanan Darah (mmHg) - Opsional
                </label>
                <input
                  id="input-bp"
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="110/70"
                  className="bs-form-control w-full min-h-[38px] bg-white px-3 py-1.5 text-base sm:text-sm rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Tindakan / Penanganan UKS */}
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3.5 pb-2.5 border-b border-slate-100">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span>Tindakan / Penanganan UKS</span>
          </div>

          <div className="mb-3">
            <span className="text-xs text-slate-500 mb-1.5 block font-medium">Pilih cepat tindakan yang diberikan:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map(act => (
                <button
                  key={act}
                  type="button"
                  onClick={() => {
                    if (actionTaken.includes(act)) return;
                    setActionTaken(prev => prev ? `${prev}, ${act}` : act);
                  }}
                  className={`text-xs px-2.5 py-1.5 min-h-[36px] rounded-lg border transition font-medium cursor-pointer ${
                    actionTaken.includes(act)
                      ? 'bg-teal-100 border-teal-400 text-teal-800 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              id="input-action-taken"
              required
              rows={2}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="Tindakan yang telah dilakukan petugas UKS (misal: Diberi teh manis hangat, diolesi minyak kayu putih, diobservasi di ruang UKS)..."
              className="bs-form-control w-full min-h-[75px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-sm text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Kondisi Akhir */}
          <div className="mt-3">
            <label htmlFor="select-final-status" className="bs-form-label mb-1.5">
              Status Akhir Kunjungan
            </label>
            <div className="relative">
              <select
                id="select-final-status"
                value={finalStatus}
                onChange={(e) => setFinalStatus(e.target.value as VisitStatus)}
                className="bs-form-select w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base sm:text-sm text-slate-800 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 transition font-semibold appearance-none pr-10"
              >
                <option value="Kembali ke Kelas / Mengajar">Kembali ke Kelas / Mengajar</option>
                <option value="Sedang Istirahat di UKS">Sedang Istirahat di UKS</option>
                <option value="Izin Pulang / Dijemput">Izin Pulang / Dijemput Orang Tua</option>
                <option value="Rujukan ke Puskesmas/RS">Rujukan ke Puskesmas / Rumah Sakit</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Kebutuhan Obat (Otomatis Kurangi Stok) */}
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Kebutuhan Obat Pengunjung
                </h3>
                <p className="text-xs text-slate-500">
                  {isAdminLoggedIn 
                    ? 'Stok obat akan otomatis berkurang dari inventaris UKS secara real-time.' 
                    : 'Pengajuan obat akan diverifikasi terlebih dahulu oleh petugas UKS sebelum diserahkan.'}
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
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-2.5 text-xs font-semibold text-slate-700">
                {needsMedicine ? 'Membutuhkan Obat' : 'Tidak Butuh Obat'}
              </span>
            </label>
          </div>

          {/* If Needs Medicine is Active */}
          {needsMedicine && (
            <div className="space-y-3 pt-2">
              {medicinesGiven.length === 0 ? (
                <div className="text-center py-4 bg-white rounded-xl border border-dashed border-emerald-300 text-slate-500 text-sm">
                  <span>Belum ada obat yang dipilih. </span>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    + Klik untuk memilih obat
                  </button>
                </div>
              ) : (
                medicinesGiven.map((medRow, index) => {
                  const currentMedObj = medicines.find(m => m.id === medRow.medicineId);
                  const isOutOfStock = currentMedObj && currentMedObj.stock === 0;
                  const isLowStock = currentMedObj && currentMedObj.stock <= currentMedObj.minStock;

                  return (
                    <div
                      key={index}
                      className="bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3 sm:gap-4"
                    >
                      {/* Medicine Dropdown */}
                      <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Nama Obat Tersedia
                        </label>
                        <select
                          value={medRow.medicineId}
                          onChange={(e) => handleUpdateMedicineRow(index, e.target.value)}
                          className="bs-form-select w-full min-h-[44px] text-base sm:text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl p-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        >
                          {medicines.map(m => (
                            <option
                              key={m.id}
                              value={m.id}
                              disabled={m.stock === 0}
                            >
                              {m.name} — Stok: {m.stock} {m.unit} {m.stock === 0 ? '(HABIS)' : m.stock <= m.minStock ? '(MENIPIS)' : ''}
                            </option>
                          ))}
                        </select>
                        {currentMedObj && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-slate-500">
                              Kategori: <strong className="text-slate-700">{currentMedObj.category}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className={`font-semibold ${
                              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              Sisa Stok: {currentMedObj.stock} {currentMedObj.unit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Satuan */}
                      <div className="w-full md:w-36">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Jumlah Diberikan
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, medRow.quantity - 1)}
                            disabled={medRow.quantity <= 1}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-l-xl border border-r-0 border-slate-300 font-bold text-lg disabled:opacity-40 transition flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={currentMedObj ? currentMedObj.stock : 100}
                            value={medRow.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                            className="w-full text-center h-10 text-base sm:text-sm font-bold border-y border-slate-300 text-slate-800 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, medRow.quantity + 1)}
                            disabled={currentMedObj ? medRow.quantity >= currentMedObj.stock : false}
                            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-r-xl border border-l-0 border-slate-300 font-bold text-lg disabled:opacity-40 transition flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-500 block text-center mt-1">
                          Satuan: <strong>{medRow.unit}</strong>
                        </span>
                      </div>

                      {/* Dosage / Notes */}
                      <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                          Aturan / Anjuran Pakai
                        </label>
                        <input
                          type="text"
                          value={medRow.dosageNotes || ''}
                          onChange={(e) => handleDosageChange(index, e.target.value)}
                          placeholder="Misal: 1 tablet sesudah makan"
                          className="bs-form-control w-full min-h-[44px] text-base sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-xl px-3.5 py-2 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      {/* Delete Row Button */}
                      <div className="flex md:pt-6 justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(index)}
                          className="min-h-[40px] px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
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

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 px-3.5 py-2 min-h-[40px] rounded-xl transition border border-emerald-300 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-700" />
                  Tambah Obat Lainnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Catatan Tambahan (Opsional) */}
        <div>
          <label htmlFor="input-notes" className="bs-form-label mb-2">
            Catatan Tambahan Petugas UKS (Opsional)
          </label>
          <input
            id="input-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Misal: Sudah menghubungi wali murid, dipantau hingga jam istirahat kedua..."
            className="bs-form-control w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 text-base sm:text-sm text-slate-800 placeholder-slate-400 transition"
          />
        </div>

        {/* Submit Button - Full Width on Mobile with Clear Feedback */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-100">
          <button
            id="btn-submit-guestbook"
            type="submit"
            className="w-full sm:w-auto min-h-[50px] inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-base sm:text-sm tracking-wide"
          >
            <Send className="w-4 h-4" />
            Simpan
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL / CARD */}
      {showSuccessModal && lastSubmitted && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-bold text-center text-slate-900 mb-1">
              {isAdminLoggedIn 
                ? 'Data Kunjungan Berhasil Disimpan!' 
                : 'Pengajuan Kunjungan Berhasil Terkirim!'}
            </h3>
            <p className="text-sm text-center text-slate-500 mb-6">
              {isAdminLoggedIn 
                ? 'Semoga lekas pulih dan sehat selalu untuk ananda / bapak / ibu.' 
                : 'Data kunjungan telah masuk ke antrean verifikasi petugas UKS. Pengambilan obat akan divalidasi oleh petugas.'}
            </p>

            {/* Receipt / Summary card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Nama Pengunjung:</span>
                <span className="font-bold text-slate-800">{lastSubmitted.visitorName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Status / Kelas:</span>
                <span className="font-semibold text-slate-800">
                  {lastSubmitted.role.toUpperCase()} — {lastSubmitted.classOrPosition}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Keluhan Utama:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  {lastSubmitted.complaint}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Tindakan UKS:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                  {lastSubmitted.actionTaken}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Obat Diberikan:</span>
                <span className="font-bold text-emerald-700 text-right">
                  {lastSubmitted.medicinesGiven.length > 0
                    ? lastSubmitted.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                    : 'Tidak ada obat'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Status Akhir:</span>
                <span className="font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {lastSubmitted.finalStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                id="btn-modal-new-guest"
                onClick={() => setShowSuccessModal(false)}
                className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition text-center ${
                  isAdminLoggedIn
                    ? 'flex-1 border border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }`}
              >
                {isAdminLoggedIn ? 'Isi Kunjungan Baru' : 'Selesai & Isi Kunjungan Baru'}
              </button>
              {isAdminLoggedIn && (
                <button
                  type="button"
                  id="btn-modal-view-dashboard"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigateToTab('dashboard');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition text-center flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Lihat di Dashboard
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
