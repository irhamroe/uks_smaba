import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  Printer,
  FileCheck,
  Search,
  X,
  RotateCcw,
  Check,
  ShieldCheck,
  XCircle,
  Share2
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { MedicineUsage, VisitRecord, VisitorRole, Gender, VisitStatus } from '../types';
import { STUDENT_CLASSES, ALL_STUDENT_CLASSES } from '../data/initialData';
import { SickLeaveLetterModal } from './SickLeaveLetterModal';
import { isEligibleForSickLetter, exportSickLeaveLetterToPdf } from '../utils/pdfHelper';

export const GuestBookForm: React.FC = () => {
  const { 
    records, 
    medicines, 
    addVisitRecord, 
    navigateToTab, 
    isAdminLoggedIn, 
    schoolInfo, 
    koordinatorUks 
  } = useUks();

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

  // Active Tracking State for submitted visit
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('uks_active_visit_id') || null;
    } catch {
      return null;
    }
  });
  const [lastSubmittedSnapshot, setLastSubmittedSnapshot] = useState<VisitRecord | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Surat Keterangan Sakit Modal State
  const [sickLetterRecord, setSickLetterRecord] = useState<VisitRecord | null>(null);
  const [showSearchSickLetterModal, setShowSearchSickLetterModal] = useState(false);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');

  // Live tracked record from context or fallback snapshot
  const activeTrackedRecord = useMemo(() => {
    if (!activeTrackingId && !lastSubmittedSnapshot) return null;
    if (activeTrackingId) {
      const fromRecords = records.find(r => r.id === activeTrackingId);
      if (fromRecords) return fromRecords;
    }
    return lastSubmittedSnapshot;
  }, [records, activeTrackingId, lastSubmittedSnapshot]);

  // Reset to empty visit form
  const handleResetToNewVisit = () => {
    setActiveTrackingId(null);
    setLastSubmittedSnapshot(null);
    setHasAutoOpened(false);
    try {
      sessionStorage.removeItem('uks_active_visit_id');
    } catch (err) {
      console.error(err);
    }
  };

  // Manual refresh status simulator
  const handleManualRefreshStatus = () => {
    setIsRefreshingStatus(true);
    setTimeout(() => {
      setIsRefreshingStatus(false);
    }, 600);
  };

  // Auto-open official sick leave letter when approved
  useEffect(() => {
    if (
      activeTrackedRecord &&
      activeTrackedRecord.approvalStatus === 'approved' &&
      isEligibleForSickLetter(activeTrackedRecord) &&
      !hasAutoOpened
    ) {
      setSickLetterRecord(activeTrackedRecord);
      setHasAutoOpened(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // ignore
        }
      }
    }
  }, [activeTrackedRecord, hasAutoOpened]);

  // Is candidate for sick leave (student resting in UKS or going home sick)
  const isCandidateForSickLetter = useMemo(() => {
    if (!activeTrackedRecord) return false;
    if (activeTrackedRecord.role !== 'siswa') return false;
    const status = activeTrackedRecord.finalStatus;
    const action = activeTrackedRecord.actionTaken?.toLowerCase() || '';
    return (
      status === 'Istirahat di UKS' ||
      status === 'Sedang Istirahat di UKS' ||
      status === 'Izin Pulang / Dijemput' ||
      action.includes('istirahat') ||
      action.includes('pulang') ||
      action.includes('dijemput')
    );
  }, [activeTrackedRecord]);

  // Filtered approved sick letters for student search lookup
  const eligibleSickRecords = useMemo(() => {
    return records.filter(r => isEligibleForSickLetter(r));
  }, [records]);

  const filteredSickRecords = useMemo(() => {
    if (!searchStudentQuery.trim()) {
      return eligibleSickRecords.slice(0, 8);
    }
    const q = searchStudentQuery.toLowerCase();
    return eligibleSickRecords.filter(r =>
      r.visitorName.toLowerCase().includes(q) ||
      r.classOrPosition.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [eligibleSickRecords, searchStudentQuery]);

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

    // Set active tracking record snapshot and update session
    const recordPayload: VisitRecord = result.record || {
      id: `vis-${Date.now()}`,
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
      bloodPressure,
      approvalStatus: isAdminLoggedIn ? 'approved' : 'pending',
      approvedBy: isAdminLoggedIn ? 'Petugas UKS' : undefined
    };

    setActiveTrackingId(recordPayload.id);
    setLastSubmittedSnapshot(recordPayload);
    setHasAutoOpened(false);

    try {
      sessionStorage.setItem('uks_active_visit_id', recordPayload.id);
    } catch (e) {
      console.error('Session storage error:', e);
    }

    // Reset Form fields
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
    <div className="max-w-4xl mx-auto py-3 sm:py-8 px-3 sm:px-6">
      {/* JIKA ADA PENGAJUAN KUNJUNGAN AKTIF: TAMPILKAN STATUS SCREEN (BUKAN ALERT MODAL) */}
      {activeTrackedRecord ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={handleResetToNewVisit}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50 px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Isi Kunjungan Baru</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{liveTime || '--:--:--'} WIB</span>
              </div>
              {isAdminLoggedIn && (
                <button
                  type="button"
                  onClick={() => navigateToTab('dashboard')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
                >
                  <span>Dashboard Petugas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SIKLUS PENGAJUAN SURAT SAKIT SISWA (ISTIRAHAT DI UKS / PULANG DIJEMPUT) */}
          {isCandidateForSickLetter ? (
            activeTrackedRecord.approvalStatus === 'approved' ? (
              /* KONDISI 1: TELAH DISETUJUI PETUGAS (SURAT KETERANGAN SAKIT TERBIT) */
              <div className="bg-gradient-to-b from-emerald-500/10 via-emerald-50/40 to-white rounded-3xl sm:rounded-[36px] border-2 border-emerald-400 p-5 sm:p-9 shadow-lg">
                {/* Pill Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-emerald-200/70">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold tracking-wide shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    STATUS: TELAH DISETUJUI PETUGAS UKS
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Waktu Selesai: <span className="font-bold">{activeTrackedRecord.time} WIB</span>
                  </div>
                </div>

                {/* Hero Visual */}
                <div className="text-center max-w-xl mx-auto mb-8">
                  <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md ring-8 ring-emerald-50 mb-4">
                    <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.5]" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Pengajuan Disetujui! Surat Sakit Telah Terbit
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 leading-relaxed">
                    Pengajuan atas nama <strong className="text-slate-900">{activeTrackedRecord.visitorName}</strong> ({activeTrackedRecord.classOrPosition}) telah disetujui oleh <strong className="text-emerald-800">{activeTrackedRecord.approvedBy || 'Petugas UKS'}</strong>. Surat Keterangan Sakit resmi telah terbit dan siap digunakan.
                  </p>
                </div>

                {/* Stepper 3 Tahap (Semua Hijau Selesai) */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-200 shadow-xs mb-6">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Tahapan Pengajuan Selesai
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-900">1. Formulir Terkirim</div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Tercatat pukul {activeTrackedRecord.time} WIB</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-900">2. Disetujui Petugas</div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Oleh: {activeTrackedRecord.approvedBy || 'Petugas UKS'}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-100/70 border-2 border-emerald-400 flex items-start gap-3 shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-emerald-950">3. Surat Sakit Terbit</div>
                        <p className="text-[11px] text-emerald-800 mt-0.5 font-medium">Siap dicetak, diunduh & ditunjukkan</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner Callout Surat Sakit */}
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
                  
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    Dokumen Resmi SMAN 1 Batu Valid
                  </div>

                  <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                    Surat Izin / Keterangan Sakit Digital
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto leading-relaxed">
                    Surat ini sah dengan tanda tangan digital Petugas UKS dan QR Code validasi resmi untuk ditunjukkan kepada Guru Mata Pelajaran atau Wali Kelas.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSickLetterRecord(activeTrackedRecord)}
                      className="w-full sm:w-auto px-7 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      Buka & Cetak Surat Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => exportSickLeaveLetterToPdf(activeTrackedRecord, schoolInfo, koordinatorUks)}
                      className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 shadow-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Unduh PDF Surat
                    </button>
                  </div>
                </div>

                {/* Ringkasan Data Kunjungan */}
                <div className="bg-white/80 rounded-2xl p-5 text-xs space-y-2.5 mb-6 border border-emerald-200 shadow-2xs">
                  <div className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-200 flex items-center justify-between">
                    <span>Ringkasan Data Pasien</span>
                    <span className="text-emerald-700 font-semibold">{activeTrackedRecord.date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Nama Siswa:</span>
                    <span className="font-bold text-slate-900">{activeTrackedRecord.visitorName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Kelas / Status:</span>
                    <span className="font-bold text-slate-900">SISWA — {activeTrackedRecord.classOrPosition}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Keluhan:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[240px]">{activeTrackedRecord.complaint}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Tindakan UKS:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[240px]">{activeTrackedRecord.actionTaken}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Disposisi Akhir:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full text-[11px]">
                      {activeTrackedRecord.finalStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Obat Diberikan:</span>
                    <span className="font-bold text-sky-700 text-right">
                      {activeTrackedRecord.medicinesGiven && activeTrackedRecord.medicinesGiven.length > 0
                        ? activeTrackedRecord.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                        : 'Tidak ada obat'}
                    </span>
                  </div>
                  {activeTrackedRecord.notes && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Catatan Petugas:</span>
                      <span className="text-slate-700 italic text-right max-w-[240px]">{activeTrackedRecord.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetToNewVisit}
                    className="w-full sm:flex-1 h-12 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Isi Kunjungan Baru
                  </button>
                  {isAdminLoggedIn && (
                    <button
                      type="button"
                      onClick={() => navigateToTab('dashboard')}
                      className="w-full sm:flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      Buka Dashboard Petugas
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : activeTrackedRecord.approvalStatus === 'rejected' ? (
              /* KONDISI 2: DITOLAK PETUGAS */
              <div className="bg-gradient-to-b from-rose-500/10 via-rose-50/40 to-white rounded-3xl sm:rounded-[36px] border-2 border-rose-300 p-5 sm:p-9 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-rose-200/70">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold tracking-wide shadow-2xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    STATUS: PENGAJUAN DITOLAK
                  </div>
                  <div className="text-[11px] text-rose-800 font-medium">
                    Waktu: <span className="font-bold">{activeTrackedRecord.time} WIB</span>
                  </div>
                </div>

                <div className="text-center max-w-xl mx-auto mb-8">
                  <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-md ring-8 ring-rose-50 mb-4">
                    <XCircle className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2]" />
                  </div>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Pengajuan Kunjungan Ditolak
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 leading-relaxed">
                    Pengajuan atas nama <strong className="text-slate-900">{activeTrackedRecord.visitorName}</strong> tidak dapat disetujui oleh Petugas UKS.
                  </p>
                  {activeTrackedRecord.rejectedReason && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-rose-100 text-rose-950 text-xs font-semibold border border-rose-200">
                      Alasan: &ldquo;{activeTrackedRecord.rejectedReason}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleResetToNewVisit}
                    className="w-full sm:w-auto px-8 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Kembali & Isi Kunjungan Baru
                  </button>
                </div>
              </div>
            ) : (
              /* KONDISI 3: PENDING (MENUNGGU PERSETUJUAN PETUGAS UKS) - SESUAI PERMINTAAN USER */
              <div className="bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white rounded-3xl sm:rounded-[36px] border-2 border-amber-300 p-5 sm:p-9 shadow-lg">
                {/* Pill Status Menunggu */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-200/70">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold tracking-wide shadow-2xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    STATUS: MENUNGGU PERSETUJUAN PETUGAS UKS
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium">
                    Waktu Pengajuan: <span className="font-bold">{activeTrackedRecord.time} WIB</span>
                  </div>
                </div>

                {/* Hero Animated Waiting Visual & Heading */}
                <div className="text-center max-w-xl mx-auto mb-8">
                  <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 shadow-md ring-8 ring-amber-100/70 mb-4 animate-pulse">
                    <Clock className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Menunggu Persetujuan Petugas UKS
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 leading-relaxed">
                    Pengajuan kunjungan atas nama <strong className="text-slate-900">{activeTrackedRecord.visitorName}</strong> ({activeTrackedRecord.classOrPosition}) telah berhasil dikirim ke sistem UKS SMAN 1 Batu. Petugas UKS di ruang piket sedang meninjau kondisi Anda.
                  </p>
                  <p className="text-xs sm:text-sm text-amber-900 font-semibold mt-2 bg-amber-100/80 px-4 py-2 rounded-xl inline-block border border-amber-200">
                    📄 Surat Keterangan Sakit resmi otomatis terbit di layar ini begitu disetujui petugas.
                  </p>
                </div>

                {/* Stepper 3 Tahap Pengajuan */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-200/80 shadow-xs mb-6">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-600" />
                    Tahapan Proses Pengajuan
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Langkah 1 */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-900">1. Formulir Terkirim</div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Tercatat pukul {activeTrackedRecord.time} WIB</p>
                      </div>
                    </div>

                    {/* Langkah 2 */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 flex items-start gap-3 relative overflow-hidden shadow-xs">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold animate-pulse shadow-xs">
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                          2. Persetujuan Petugas
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        </div>
                        <p className="text-[11px] text-amber-800 mt-0.5 font-medium">Petugas UKS sedang meninjau di ruang piket</p>
                      </div>
                    </div>

                    {/* Langkah 3 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 opacity-75">
                      <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 text-xs font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700">3. Surat Sakit Terbit</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Otomatis siap cetak begitu disetujui</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indikator Koneksi Realtime & Tombol Periksa Status */}
                <div className="bg-amber-100/70 rounded-2xl p-4 border border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3 text-xs text-amber-950">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span>
                      <strong>Pembaruan Otomatis Aktif:</strong> Anda tidak perlu me-refresh halaman. Layar ini memantau persetujuan petugas UKS secara langsung (real-time).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefreshStatus}
                    disabled={isRefreshingStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs border border-amber-300 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-amber-700 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                    {isRefreshingStatus ? 'Memeriksa...' : 'Periksa Status'}
                  </button>
                </div>

                {/* Ringkasan Data Kunjungan */}
                <div className="bg-white/80 rounded-2xl p-5 text-xs space-y-2.5 mb-6 border border-amber-200 shadow-2xs">
                  <div className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-200 flex items-center justify-between">
                    <span>Ringkasan Data Pengajuan Kunjungan</span>
                    <span className="text-amber-800 font-semibold">{activeTrackedRecord.date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Nama Siswa:</span>
                    <span className="font-bold text-slate-900">{activeTrackedRecord.visitorName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Kelas / Status:</span>
                    <span className="font-bold text-slate-900">SISWA — {activeTrackedRecord.classOrPosition}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Keluhan:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[240px]">{activeTrackedRecord.complaint}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Tindakan yang Diajukan:</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[240px]">{activeTrackedRecord.actionTaken}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Disposisi yang Diajukan:</span>
                    <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      {activeTrackedRecord.finalStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Obat Diminta:</span>
                    <span className="font-bold text-sky-700 text-right">
                      {activeTrackedRecord.medicinesGiven && activeTrackedRecord.medicinesGiven.length > 0
                        ? activeTrackedRecord.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                        : 'Tidak ada obat'}
                    </span>
                  </div>
                  {activeTrackedRecord.notes && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Catatan Tambahan:</span>
                      <span className="text-slate-700 italic text-right max-w-[240px]">{activeTrackedRecord.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetToNewVisit}
                    className="w-full sm:flex-1 h-12 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Isi Kunjungan Baru
                  </button>
                  {isAdminLoggedIn && (
                    <button
                      type="button"
                      onClick={() => navigateToTab('dashboard')}
                      className="w-full sm:flex-1 h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      Buka Dashboard Petugas
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* NON SICK LEAVE FLOW (GURU / STAF / SISWA KEMBALI KE KELAS) */
            <div className="bg-white rounded-3xl sm:rounded-[36px] border border-slate-200 p-5 sm:p-9 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  {activeTrackedRecord.approvalStatus === 'approved' ? 'STATUS: SELESAI / TERVERIFIKASI' : 'STATUS: MENUNGGU VERIFIKASI PETUGAS'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Waktu: <span className="font-bold text-slate-800">{activeTrackedRecord.time} WIB</span>
                </div>
              </div>

              <div className="text-center max-w-xl mx-auto mb-8">
                <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {activeTrackedRecord.approvalStatus === 'approved'
                    ? 'Data Kunjungan Berhasil Disimpan & Terverifikasi'
                    : 'Pengajuan Kunjungan Telah Masuk ke Sistem'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1.5 leading-relaxed">
                  Terima kasih, data kunjungan atas nama <strong className="text-slate-900">{activeTrackedRecord.visitorName}</strong> telah tersimpan di catatan UKS.
                </p>
              </div>

              {/* Ringkasan Data Kunjungan */}
              <div className="bg-slate-50 rounded-2xl p-5 text-xs space-y-2.5 mb-6 border border-slate-200">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Nama:</span>
                  <span className="font-bold text-slate-900">{activeTrackedRecord.visitorName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Status / Jabatan:</span>
                  <span className="font-bold text-slate-900">{activeTrackedRecord.role.toUpperCase()} — {activeTrackedRecord.classOrPosition}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Keluhan:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[220px]">{activeTrackedRecord.complaint}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Tindakan:</span>
                  <span className="font-medium text-slate-800 text-right max-w-[220px]">{activeTrackedRecord.actionTaken}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Obat:</span>
                  <span className="font-bold text-sky-700 text-right">
                    {activeTrackedRecord.medicinesGiven && activeTrackedRecord.medicinesGiven.length > 0
                      ? activeTrackedRecord.medicinesGiven.map(m => `${m.medicineName} (${m.quantity} ${m.unit})`).join(', ')
                      : 'Tidak ada obat'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Status Kunjungan:</span>
                  <span className="font-semibold bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full text-[11px]">
                    {activeTrackedRecord.finalStatus}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetToNewVisit}
                  className="w-full sm:flex-1 h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  Isi Kunjungan Baru
                </button>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={() => navigateToTab('dashboard')}
                    className="w-full sm:flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Buka Dashboard
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Welcome Banner Card - Material You Atmospheric Hero */}
          <div className="mb-6 sm:mb-8 bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#075985] text-white rounded-2xl sm:rounded-[36px] p-4 sm:p-9 relative overflow-hidden shadow-md">
        {/* Atmospheric Organic Blur Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#BAE6FD]/15 rounded-full blur-2xl -mb-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-white mb-2.5 sm:mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#BAE6FD]" />
              Buku Kontrol Pengunjung Digital UKS
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight">
              Selamat Datang di UKS SMAN 1 Batu
            </h2>
            <p className="text-xs sm:text-sm text-[#E0F2FE] font-normal mt-1 max-w-xl leading-relaxed">
              Silakan isi formulir kunjungan UKS di bawah ini secara lengkap untuk pencatatan riwayat kesehatan sekolah.
            </p>

            {/* Tombol Cek & Unduh Surat Sakit: HANYA TAMPIL JIKA LOGIN SEBAGAI PETUGAS UKS / ADMIN */}
            {isAdminLoggedIn && (
              <div className="mt-3.5 sm:mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSearchSickLetterModal(true)}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/30 transition cursor-pointer shadow-xs active:scale-95"
                >
                  <FileText className="w-4 h-4 text-[#BAE6FD]" />
                  Cek & Unduh Surat Sakit Siswa
                </button>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center shrink-0 w-full sm:w-auto border border-white/20 shadow-xs flex sm:flex-col items-center justify-between sm:justify-center">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#E0F2FE] font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
              <span>Waktu Sekarang</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold font-mono text-white sm:mt-1">
              {liveTime || '--:--:--'}
            </div>
            <div className="hidden sm:block text-xs text-[#E0F2FE] font-normal mt-0.5">
              {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}
            </div>
          </div>
        </div>
      </div>

      {/* Main Guest Book Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#F0F9FF] rounded-2xl sm:rounded-[36px] border border-[#E0F2FE] p-4 sm:p-8 space-y-6 sm:space-y-8 shadow-sm">

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
          <div className="flex items-center gap-3 text-[#0F172A] font-bold text-base mb-5 pb-3 border-b border-[#E0F2FE]">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>
            <span className="tracking-tight">Identitas Pengunjung UKS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Peran / Status */}
            <div>
              <label className="block text-xs font-medium text-[#334155] uppercase tracking-wider mb-2">
                Status Pengunjung <span className="text-[#B3261E]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="role-btn-siswa"
                  onClick={() => handleRoleChange('siswa')}
                  className={`flex items-center justify-center gap-1.5 h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer ${role === 'siswa'
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
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
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
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
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
                    }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Staf TU
                </button>
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-medium text-[#334155] uppercase tracking-wider mb-2">
                Jenis Kelamin <span className="text-[#B3261E]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="gender-btn-l"
                  onClick={() => setGender('L')}
                  className={`h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-center ${gender === 'L'
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
                    }`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  id="gender-btn-p"
                  onClick={() => setGender('P')}
                  className={`h-12 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-center ${gender === 'P'
                      ? 'bg-[#0369A1] text-white shadow-sm'
                      : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
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
                    <label htmlFor="select-student-class" className="block text-xs font-medium text-[#334155] uppercase tracking-wider">
                      Kelas Siswa <span className="text-[#B3261E]">*</span>
                    </label>
                    {classOrPosition && ALL_STUDENT_CLASSES.includes(classOrPosition) && (
                      <span className="text-[11px] font-medium text-[#0C4A6E] bg-[#E0F2FE] px-3 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
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
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#94A3B8]">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] font-normal mt-1.5">
                    Pilih rombongan belajar Anda dari daftar tingkat X, XI, atau XII.
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="input-class-position" className="block text-xs font-medium text-[#334155] uppercase tracking-wider mb-2">
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
          <div className="flex items-center gap-3 text-[#0F172A] font-bold text-base mb-5 pb-3 border-b border-[#E0F2FE]">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              2
            </div>
            <span className="tracking-tight">Keluhan & Gejala yang Dirasakan</span>
          </div>

          {/* Quick Symptoms clicker */}
          <div className="mb-3">
            <span className="text-xs text-[#334155] mb-2 block font-medium uppercase tracking-wider">Pilih cepat keluhan umum:</span>
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
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
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
            <div className="flex items-center gap-3 bg-[#E0F2FE] p-4 rounded-2xl">
              <Thermometer className="w-6 h-6 text-[#0284C7] shrink-0" />
              <div className="flex-1">
                <label htmlFor="input-temp" className="block text-[11px] font-medium text-[#334155] uppercase tracking-wide mb-1">
                  Suhu Tubuh (°C) - Opsional
                </label>
                <input
                  id="input-temp"
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="36.5"
                  className="w-full h-10 px-3 bg-[#F8FAFC] text-sm font-medium text-[#0F172A] rounded-xl border-b-2 border-[#94A3B8] focus:border-[#0284C7] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#E0F2FE] p-4 rounded-2xl">
              <Gauge className="w-6 h-6 text-[#0284C7] shrink-0" />
              <div className="flex-1">
                <label htmlFor="input-bp" className="block text-[11px] font-medium text-[#334155] uppercase tracking-wide mb-1">
                  Tekanan Darah (mmHg) - Opsional
                </label>
                <input
                  id="input-bp"
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="110/70"
                  className="w-full h-10 px-3 bg-[#F8FAFC] text-sm font-medium text-[#0F172A] rounded-xl border-b-2 border-[#94A3B8] focus:border-[#0284C7] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Tindakan / Penanganan UKS */}
        <div>
          <div className="flex items-center gap-3 text-[#0F172A] font-bold text-base mb-5 pb-3 border-b border-[#E0F2FE]">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              3
            </div>
            <span className="tracking-tight">Tindakan / Penanganan UKS</span>
          </div>

          <div className="mb-3">
            <span className="text-xs text-[#334155] mb-2 block font-medium uppercase tracking-wider">Pilih cepat tindakan yang diberikan:</span>
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
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'bg-[#E0F2FE] text-[#334155] hover:bg-[#BAE6FD]'
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
            : 'bg-[#E0F2FE] border-transparent'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-xs ${hasDrugAllergy ? 'bg-[#B3261E]' : 'bg-[#334155]'
                }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm uppercase tracking-wide flex items-center gap-2">
                  Konfirmasi Riwayat Alergi Obat
                  <span className="text-[#B3261E]">*</span>
                </h3>
                <p className="text-xs text-[#334155] font-normal">
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
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#334155] hover:bg-white'
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
                    : 'bg-[#F8FAFC] text-[#B3261E] hover:bg-[#F9DEDC]'
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
                className="w-full h-12 px-4 rounded-xl bg-[#F8FAFC] text-[#0F172A] text-sm font-medium border-b-2 border-[#B3261E] outline-none"
              />
              <p className="text-xs text-[#B3261E] mt-2 font-medium">
                Peringatan: Petugas UKS tidak akan memberikan obat yang mengandung bahan/zat pemicu alergi di atas.
              </p>
            </div>
          )}
        </div>

        {/* SECTION 4: Kebutuhan Obat */}
        <div className="bg-[#E0F2FE] rounded-3xl border border-[#CBD5E1] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#0284C7] text-white flex items-center justify-center shadow-xs">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm tracking-tight">
                  Kebutuhan Obat Pengunjung
                </h3>
                <p className="text-xs text-[#334155] font-normal">
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
              <div className="w-12 h-6 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0284C7]"></div>
              <span className="ml-3 text-xs font-medium text-[#0F172A]">
                {needsMedicine ? 'Butuh Obat' : 'Tidak Butuh Obat'}
              </span>
            </label>
          </div>

          {/* If Needs Medicine is Active */}
          {needsMedicine && (
            <div className="space-y-4 pt-3">
              {medicinesGiven.length === 0 ? (
                <div className="text-center py-6 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1] text-[#334155] text-sm">
                  <span>Belum ada obat yang dipilih. </span>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="text-[#0284C7] font-medium hover:underline cursor-pointer"
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
                      className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E0F2FE] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-4"
                    >
                      {/* Medicine Dropdown */}
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-[#334155] uppercase tracking-wide">
                            Nama Obat Tersedia
                          </label>
                          {isMultiDose && (
                            <span className="bg-[#E0F2FE] text-[#0C4A6E] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                              Pemakaian Bersama di UKS
                            </span>
                          )}
                        </div>
                        <select
                          value={medRow.medicineId}
                          onChange={(e) => handleUpdateMedicineRow(index, e.target.value)}
                          className="w-full h-11 text-sm font-medium text-[#0F172A] bg-[#E0F2FE] border-b-2 border-[#94A3B8] rounded-t-xl px-3 focus:bg-[#F0F9FF] focus:border-[#0284C7] outline-none"
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
                            <span className="text-[#334155] font-normal">
                              Kategori: <strong className="text-[#0F172A]">{currentMedObj.category}</strong>
                            </span>
                            <span className="text-[#94A3B8]">•</span>
                            <span className={`font-medium ${isOutOfStock ? 'text-[#B3261E]' : isLowStock ? 'text-[#D97706]' : 'text-[#0284C7]'
                              }`}>
                              Sisa: {currentMedObj.stock} {currentMedObj.unit}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="w-full md:w-36">
                        <label className="block text-[11px] font-medium text-[#334155] uppercase tracking-wide mb-1">
                          Jumlah Diberikan
                        </label>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, medRow.quantity - 1)}
                            disabled={medRow.quantity <= 1}
                            className="w-10 h-11 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0F172A] font-bold rounded-l-xl border-b-2 border-[#94A3B8] disabled:opacity-40 active:scale-95 transition cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={currentMedObj ? currentMedObj.stock : 100}
                            value={medRow.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                            className="w-full text-center h-11 text-sm font-bold border-b-2 border-[#94A3B8] text-[#0F172A] bg-[#F8FAFC]"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, medRow.quantity + 1)}
                            disabled={currentMedObj ? medRow.quantity >= currentMedObj.stock : false}
                            className="w-10 h-11 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0F172A] font-bold rounded-r-xl border-b-2 border-[#94A3B8] disabled:opacity-40 active:scale-95 transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-[#94A3B8] font-normal block text-center mt-1">
                          Satuan: {medRow.unit}
                        </span>
                      </div>

                      {/* Dosage / Notes */}
                      <div className="flex-1 w-full">
                        <label className="block text-[11px] font-medium text-[#334155] uppercase tracking-wide mb-1">
                          Aturan / Anjuran Pakai
                        </label>
                        <input
                          type="text"
                          value={medRow.dosageNotes || ''}
                          onChange={(e) => handleDosageChange(index, e.target.value)}
                          placeholder="Misal: 1 tablet sesudah makan"
                          className="w-full h-11 px-3 bg-[#E0F2FE] text-sm font-medium text-[#0F172A] border-b-2 border-[#94A3B8] rounded-t-xl focus:bg-[#F0F9FF] focus:border-[#0284C7] outline-none"
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
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#0C4A6E] bg-[#E0F2FE] hover:bg-[#BAE6FD] px-5 py-2.5 rounded-full active:scale-95 transition-all duration-300 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#0284C7]" />
                  Tambah Obat Lainnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: Status Akhir Kunjungan */}
        <div>
          <div className="flex items-center gap-3 text-[#0F172A] font-bold text-base mb-5 pb-3 border-b border-[#E0F2FE]">
            <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              4
            </div>
            <span className="tracking-tight">Status Akhir Kunjungan</span>
          </div>

          <div>
            <label htmlFor="select-final-status" className="block text-xs font-medium text-[#334155] uppercase tracking-wider mb-2">
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#94A3B8]">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: Catatan Tambahan (Opsional) */}
        <div>
          <label htmlFor="input-notes" className="block text-xs font-medium text-[#334155] uppercase tracking-wider mb-2">
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
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-[#E0F2FE]">
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
        </>
      )}

      {/* Modal Pencarian & Unduh Surat Sakit Siswa */}
      {showSearchSickLetterModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cek & Unduh Surat Sakit Siswa</h3>
                  <p className="text-xs text-slate-500">Pilih atau cari nama siswa yang telah disetujui petugas UKS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchSickLetterModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  placeholder="Cari nama siswa atau kelas..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredSickRecords.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Belum ditemukan data surat sakit yang telah disetujui petugas.
                  </div>
                ) : (
                  filteredSickRecords.map(rec => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 transition flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {rec.visitorName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            {rec.classOrPosition}
                          </span>
                          <span>{rec.date} • {rec.time} WIB</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          Status: {rec.finalStatus} ({rec.complaint})
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSickLetterRecord(rec);
                          setShowSearchSickLetterModal(false);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Buka
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSearchSickLetterModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Surat Keterangan Sakit Modal */}
      <SickLeaveLetterModal
        isOpen={!!sickLetterRecord}
        onClose={() => setSickLetterRecord(null)}
        record={sickLetterRecord}
        schoolInfo={schoolInfo}
        koordinator={koordinatorUks}
      />
    </div>
  );
};
