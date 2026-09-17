import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Medicine, MedicineBatch, VisitRecord, RestockLog, MedicineUsage, AppTab, AdminUser, SchoolInfo } from '../types';
import { INITIAL_MEDICINES, INITIAL_VISITS, INITIAL_ADMIN_USERS, SCHOOL_INFO } from '../data/initialData';
import { 
  subscribeToVisits, 
  subscribeToMedicines, 
  subscribeToUsers, 
  subscribeToSchoolInfo, 
  subscribeToRestockLogs,
  syncSaveVisit,
  syncDeleteVisit,
  syncSaveMedicine,
  syncDeleteMedicine,
  syncReplaceAllMedicines,
  syncSaveRestockLog,
  syncSaveUser,
  syncDeleteUser,
  syncSaveSchoolInfo,
  seedInitialFirestoreData
} from '../services/firestoreService';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// ==========================================
// FEFO (First Expired First Out) & Batch Helper Functions
// ==========================================
export const recalculateMedicineBatches = (med: Medicine): Medicine => {
  let batches = med.batches ? [...med.batches] : [];

  // If no batches exist but medicine has stock, create an initial batch
  if (batches.length === 0 && med.stock > 0) {
    batches.push({
      id: `batch-${med.id}-init`,
      batchNumber: 'KLOTER-AWAL',
      quantity: med.stock,
      expiryDate: med.expiryDate || '2027-12-31',
      receivedDate: med.lastUpdated ? med.lastUpdated.split('T')[0] : new Date().toISOString().split('T')[0],
      note: 'Stok awal sistem'
    });
  }

  // Filter out negative quantities
  batches = batches.map(b => ({ ...b, quantity: Math.max(0, b.quantity) }));

  // Sort batches by expiryDate ascending (FEFO)
  batches.sort((a, b) => (a.expiryDate || '9999-99-99').localeCompare(b.expiryDate || '9999-99-99'));

  // Calculate total active stock (sum of all batch quantities)
  const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

  // Find earliest active batch (with quantity > 0)
  const earliestActive = batches.find(b => b.quantity > 0);
  const earliestExpiryDate = earliestActive ? earliestActive.expiryDate : (med.expiryDate || '');

  return {
    ...med,
    batches,
    stock: totalStock,
    expiryDate: earliestExpiryDate,
    lastUpdated: new Date().toISOString()
  };
};

export const deductMedicineFefo = (med: Medicine, quantityToDeduct: number): Medicine => {
  // If multi-dose item, we don't deduct per-visit (handled via consumeMultiDoseBottle)
  const isMultiDose = med.usageType === 'multi_dose' || (med.unit?.toLowerCase().includes('botol') && med.usageType !== 'single_dose');
  if (isMultiDose) return med;

  const medNormalized = recalculateMedicineBatches(med);
  let remainingToDeduct = quantityToDeduct;
  const updatedBatches = (medNormalized.batches || []).map(b => ({ ...b }));

  // Deduct from batches starting from earliest expiry date (FEFO)
  for (let i = 0; i < updatedBatches.length && remainingToDeduct > 0; i++) {
    const batch = updatedBatches[i];
    if (batch.quantity > 0) {
      if (batch.quantity >= remainingToDeduct) {
        batch.quantity -= remainingToDeduct;
        remainingToDeduct = 0;
      } else {
        remainingToDeduct -= batch.quantity;
        batch.quantity = 0;
      }
    }
  }

  return recalculateMedicineBatches({
    ...medNormalized,
    batches: updatedBatches
  });
};

interface UksContextType {
  records: VisitRecord[];
  medicines: Medicine[];
  restockLogs: RestockLog[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  navigateToTab: (tab: AppTab) => void;
  
  // School Information & Logo
  schoolInfo: SchoolInfo;
  updateSchoolInfo: (updates: Partial<SchoolInfo>) => void;
  resetSchoolInfo: () => void;
  koordinatorUks: AdminUser | null;

  // Admin Authentication & Users Management
  isAdminLoggedIn: boolean;
  adminUser: AdminUser | null;
  users: AdminUser[];
  loginAsAdmin: (username: string, password: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  pendingTab: AppTab | null;
  setPendingTab: (tab: AppTab | null) => void;
  addUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<AdminUser>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (id: string, newPass: string) => { success: boolean; error?: string };
  
  // Visit Actions & Approval Workflow
  addVisitRecord: (data: {
    visitorName: string;
    role: 'siswa' | 'guru' | 'staf';
    classOrPosition: string;
    gender: 'L' | 'P';
    complaint: string;
    actionTaken: string;
    needsMedicine: boolean;
    medicinesGiven: MedicineUsage[];
    notes?: string;
    temperature?: string;
    bloodPressure?: string;
    hasDrugAllergy?: boolean;
    drugAllergyDescription?: string;
    customDate?: string;
    customTime?: string;
  }) => { success: boolean; error?: string };
  
  approveVisitRecord: (id: string) => { success: boolean; error?: string };
  rejectVisitRecord: (id: string, reason?: string) => { success: boolean; error?: string };
  deleteVisitRecord: (id: string) => void;
  updateVisitStatus: (id: string, status: VisitRecord['finalStatus']) => void;
  
  // Medicine Actions
  addMedicine: (data: Omit<Medicine, 'id' | 'lastUpdated'>) => void;
  updateMedicine: (id: string, updates: Partial<Omit<Medicine, 'id'>>) => void;
  deleteMedicine: (id: string) => void;
  restockMedicine: (id: string, quantity: number, expiryDate?: string, batchNumber?: string, note?: string) => void;
  disposeExpiredBatch: (medicineId: string, batchId: string, reason?: string) => void;
  consumeMultiDoseBottle: (id: string) => void;
  importMedicinesFromExcel: (list: Omit<Medicine, 'id' | 'lastUpdated'>[], mode: 'merge' | 'replace') => { added: number; updated: number };
  resetToDefaultData: () => void;
  
  // Computed
  pendingVisits: VisitRecord[];
  approvedVisits: VisitRecord[];
  lowStockMedicines: Medicine[];
  outOfStockMedicines: Medicine[];
  expiringSoonMedicines: Medicine[];
  expiredMedicines: Medicine[];
  todayVisits: VisitRecord[];
  activePatients: VisitRecord[];
  
  // Toast notifications
  toast: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  dismissToast: () => void;
}

const UksContext = createContext<UksContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ADMIN_SESSION: 'uks_sman1batu_admin_session_v2'
};

export const UksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State aplikasi murni tersinkronisasi realtime dengan Cloud Firestore (Single Source of Truth)
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(SCHOOL_INFO);
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [restockLogs, setRestockLogs] = useState<RestockLog[]>([]);

  const updateSchoolInfo = (updates: Partial<SchoolInfo>) => {
    const updated = { ...schoolInfo, ...updates };
    setSchoolInfo(updated);
    syncSaveSchoolInfo(updated);
    showToast('Identitas sekolah berhasil diperbarui di cloud database.', 'success');
  };

  const resetSchoolInfo = () => {
    setSchoolInfo(SCHOOL_INFO);
    syncSaveSchoolInfo(SCHOOL_INFO);
    showToast('Identitas sekolah dikembalikan ke pengaturan standar.', 'info');
  };

  // Koordinator UKS: Ditemukan secara dinamis dari manajemen pengguna
  const koordinatorUks = useMemo(() => {
    const activeCoord = users.find(u => u.role.toLowerCase().includes('koordinator') && u.isActive !== false);
    if (activeCoord) return activeCoord;
    const anyCoord = users.find(u => u.role.toLowerCase().includes('koordinator'));
    if (anyCoord) return anyCoord;
    return users[0] || null;
  }, [users]);

  // Load admin session from sessionStorage/localStorage khusus sesi login perangkat ini
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) || localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return {
            ...parsed,
            role: (parsed.role === 'Pembina Utama UKS' || !parsed.role) ? 'Koordinator UKS' : parsed.role
          };
        }
      }
    } catch (e) {
      console.error('Error loading admin session:', e);
    }
    return null;
  });

  const isAdminLoggedIn = !!adminUser;
  const [pendingTab, setPendingTab] = useState<AppTab | null>(null);

  const [activeTab, setActiveTab] = useState<AppTab>('guestbook');
  const [toast, setToast] = useState<ToastState | null>(null);

  // Realtime Listeners ke Firebase Firestore Realtime Database
  useEffect(() => {
    // Inisialisasi awal koleksi cloud jika belum ada
    seedInitialFirestoreData();

    // 1. Realtime Visits Subscription
    const unsubVisits = subscribeToVisits((cloudVisits) => {
      if (Array.isArray(cloudVisits)) {
        // Otomatis bersihkan data dummy demonstrasi lama jika ada
        const dummyIds = ['vis-1', 'vis-2', 'vis-3', 'vis-4', 'vis-5', 'vis-6'];
        cloudVisits.forEach(v => {
          if (dummyIds.includes(v.id)) {
            syncDeleteVisit(v.id);
          }
        });

        const cleanVisits = cloudVisits.filter(v => !dummyIds.includes(v.id));
        cleanVisits.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());
        setRecords(cleanVisits);
      }
    });

    // 2. Realtime Medicines Subscription
    const unsubMedicines = subscribeToMedicines((cloudMeds) => {
      if (Array.isArray(cloudMeds) && cloudMeds.length > 0) {
        const normalized = cloudMeds.map(m => recalculateMedicineBatches(m));
        setMedicines(normalized);
      }
    });

    // 3. Realtime Users Subscription
    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        setUsers(cloudUsers);
      }
    });

    // 4. Realtime Restock Logs Subscription
    const unsubRestock = subscribeToRestockLogs((cloudLogs) => {
      if (Array.isArray(cloudLogs)) {
        setRestockLogs(cloudLogs);
      }
    });

    // 5. Realtime School Info Subscription
    const unsubSchool = subscribeToSchoolInfo((newSchool) => {
      if (newSchool && newSchool.name) {
        setSchoolInfo(newSchool);
      }
    });

    return () => {
      unsubVisits();
      unsubMedicines();
      unsubUsers();
      unsubRestock();
      unsubSchool();
    };
  }, []);

  const navigateToTab = (tab: AppTab) => {
    if (tab === 'guestbook' || tab === 'login') {
      setActiveTab(tab);
      return;
    }

    // Protected tabs
    if (isAdminLoggedIn) {
      setActiveTab(tab);
    } else {
      setPendingTab(tab);
      setActiveTab('login');
      showToast('Halaman ini khusus Petugas / Pembina UKS. Silakan login terlebih dahulu.', 'warning');
    }
  };

  const loginAsAdmin = (username: string, pass: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = pass.trim();

    // 1. Check in registered users list
    const matchedUser = users.find(u => 
      u.username.toLowerCase() === trimmedUser && 
      (u.password === trimmedPass || (!u.password && trimmedPass === 'smabasehat'))
    );

    if (matchedUser) {
      if (matchedUser.isActive === false) {
        return {
          success: false,
          error: 'Akun ini dinonaktifkan oleh administrator. Silakan hubungi Pembina UKS.'
        };
      }

      const sessionUser: AdminUser = {
        id: matchedUser.id,
        username: matchedUser.username,
        name: matchedUser.name,
        role: matchedUser.role,
        nip: matchedUser.nip,
        email: matchedUser.email,
        phone: matchedUser.phone,
        isActive: matchedUser.isActive
      };

      setAdminUser(sessionUser);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionUser));
      } catch (e) {
        console.error('Failed to save admin session:', e);
      }

      showToast(`Selamat datang kembali, ${matchedUser.name}! (${matchedUser.role})`, 'success');
      
      const destination = pendingTab || 'dashboard';
      setPendingTab(null);
      setActiveTab(destination);
      return { success: true };
    }

    return {
      success: false,
      error: 'Username atau password yang Anda masukkan tidak sesuai.'
    };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setPendingTab(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    } catch (e) {
      console.error('Failed to clear admin session:', e);
    }
    setActiveTab('guestbook');
    showToast('Anda telah berhasil keluar dari sesi admin.', 'info');
  };

  // User Management Actions
  const addUser = (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const trimmedUser = userData.username.trim().toLowerCase();
    
    if (users.some(u => u.username.toLowerCase() === trimmedUser)) {
      return { success: false, error: `Username "${trimmedUser}" sudah digunakan.` };
    }

    const newUser: AdminUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      username: trimmedUser,
      password: userData.password?.trim() || 'smabasehat',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);
    syncSaveUser(newUser);
    showToast(`Pengguna baru "${newUser.name}" (${newUser.role}) berhasil ditambahkan.`, 'success');
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<AdminUser>) => {
    const existing = users.find(u => u.id === id);
    if (!existing) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (updates.username) {
      const trimmedUser = updates.username.trim().toLowerCase();
      if (users.some(u => u.id !== id && u.username.toLowerCase() === trimmedUser)) {
        return { success: false, error: `Username "${trimmedUser}" sudah digunakan.` };
      }
    }

    let updatedUserObj: AdminUser = existing;
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        if (updates.username) updated.username = updates.username.trim().toLowerCase();
        updatedUserObj = updated;
        return updated;
      }
      return u;
    }));

    syncSaveUser(updatedUserObj);

    // If currently logged in user was updated, refresh session
    if (adminUser && adminUser.id === id) {
      const refreshedSession = { ...adminUser, ...updates };
      setAdminUser(refreshedSession);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(refreshedSession));
      } catch (e) {
        console.error('Failed to update admin session:', e);
      }
    }

    showToast(`Data pengguna "${updatedUserObj.name}" berhasil diperbarui.`, 'success');
    return { success: true };
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    if (target.role === 'Koordinator UKS') {
      const koorCount = users.filter(u => u.role === 'Koordinator UKS').length;
      if (koorCount <= 1) {
        return {
          success: false,
          error: 'Tidak dapat menghapus satu-satunya Koordinator UKS. Tetapkan pengguna lain terlebih dahulu.'
        };
      }
    }

    if (adminUser && adminUser.id === id) {
      return {
        success: false,
        error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.'
      };
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    syncDeleteUser(id);
    showToast(`Pengguna "${target.name}" telah dihapus dari sistem.`, 'info');
    return { success: true };
  };

  const toggleUserStatus = (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;

    if (adminUser && adminUser.id === id && target.isActive !== false) {
      showToast('Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login.', 'error');
      return;
    }

    const updated = { ...target, isActive: !target.isActive };
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    syncSaveUser(updated);
    showToast(`Status akun "${target.name}" berhasil diubah menjadi: ${updated.isActive ? 'Aktif' : 'Non-Aktif'}.`, 'info');
  };

  const resetUserPassword = (id: string, newPass: string) => {
    const target = users.find(u => u.id === id);
    if (!target) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    const updated = { ...target, password: newPass.trim() };
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
    syncSaveUser(updated);
    showToast(`Password untuk "${target.name}" berhasil direset.`, 'success');
    return { success: true };
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      message,
      type
    });
  };

  const dismissToast = () => {
    setToast(null);
  };

  // Automatically dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Computed state
  const pendingVisits = useMemo(() => {
    return records.filter(r => r.approvalStatus === 'pending');
  }, [records]);

  const approvedVisits = useMemo(() => {
    return records.filter(r => r.approvalStatus === 'approved' || !r.approvalStatus);
  }, [records]);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter(m => m.stock <= m.minStock);
  }, [medicines]);

  const outOfStockMedicines = useMemo(() => {
    return medicines.filter(m => m.stock === 0);
  }, [medicines]);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const expiringSoonMedicines = useMemo(() => {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + 90); // 90 days warning
    const todayFormatted = today.toISOString().split('T')[0];
    const thresholdFormatted = thresholdDate.toISOString().split('T')[0];

    return medicines.filter(m => {
      if (m.stock <= 0) return false;
      const batches = m.batches && m.batches.length > 0 ? m.batches : [];
      if (batches.length > 0) {
        return batches.some(b => b.quantity > 0 && b.expiryDate <= thresholdFormatted && b.expiryDate >= todayFormatted);
      }
      return m.expiryDate ? (m.expiryDate <= thresholdFormatted && m.expiryDate >= todayFormatted) : false;
    });
  }, [medicines]);

  const expiredMedicines = useMemo(() => {
    const todayFormatted = new Date().toISOString().split('T')[0];

    return medicines.filter(m => {
      if (m.stock <= 0) return false;
      const batches = m.batches && m.batches.length > 0 ? m.batches : [];
      if (batches.length > 0) {
        return batches.some(b => b.quantity > 0 && b.expiryDate < todayFormatted);
      }
      return m.expiryDate ? (m.expiryDate < todayFormatted) : false;
    });
  }, [medicines]);

  const todayVisits = useMemo(() => {
    return records.filter(r => r.date === todayStr && (r.approvalStatus === 'approved' || !r.approvalStatus));
  }, [records, todayStr]);

  const activePatients = useMemo(() => {
    return records.filter(r => (r.finalStatus === 'Istirahat di UKS' || r.finalStatus === 'Sedang Istirahat di UKS') && (r.approvalStatus === 'approved' || !r.approvalStatus));
  }, [records]);

  // Add Visit Record & Real-time stock reduction (Only for Admin; Public submissions go to pending queue)
  const addVisitRecord = (data: {
    visitorName: string;
    role: 'siswa' | 'guru' | 'staf';
    classOrPosition: string;
    gender: 'L' | 'P';
    complaint: string;
    actionTaken: string;
    needsMedicine: boolean;
    medicinesGiven: MedicineUsage[];
    notes?: string;
    finalStatus: VisitRecord['finalStatus'];
    temperature?: string;
    bloodPressure?: string;
    hasDrugAllergy?: boolean;
    drugAllergyDescription?: string;
    customDate?: string;
    customTime?: string;
  }) => {
    const now = new Date();
    const currentDate = data.customDate || now.toISOString().split('T')[0];
    const currentTime = data.customTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // CASE 1: DIRECT ADMIN ENTRY (Automatically approved and stock is deducted immediately)
    if (isAdminLoggedIn) {
      if (data.needsMedicine && data.medicinesGiven.length > 0) {
        for (const usage of data.medicinesGiven) {
          const found = medicines.find(m => m.id === usage.medicineId);
          if (!found) {
            return { success: false, error: `Obat "${usage.medicineName}" tidak ditemukan dalam sistem.` };
          }
          const isMultiDose = found.usageType === 'multi_dose' || (found.unit?.toLowerCase().includes('botol') && found.usageType !== 'single_dose');
          if (isMultiDose) {
            if (found.stock <= 0) {
              return {
                success: false,
                error: `Stok botol/tube "${found.name}" di UKS kosong (0 ${found.unit})! Harap lakukan restock botol baru terlebih dahulu.`
              };
            }
          } else {
            if (found.stock < usage.quantity) {
              return {
                success: false,
                error: `Stok obat "${found.name}" tidak mencukupi! Tersedia: ${found.stock} ${found.unit}, diminta: ${usage.quantity} ${found.unit}.`
              };
            }
          }
        }
      }

      const newRecord: VisitRecord = {
        id: `vis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now.toISOString(),
        date: currentDate,
        time: currentTime,
        visitorName: data.visitorName.trim(),
        role: data.role,
        classOrPosition: data.classOrPosition.trim(),
        gender: data.gender,
        complaint: data.complaint.trim(),
        actionTaken: data.actionTaken.trim(),
        needsMedicine: data.needsMedicine,
        medicinesGiven: data.needsMedicine ? data.medicinesGiven : [],
        notes: data.notes?.trim() || '',
        finalStatus: data.finalStatus,
        temperature: data.temperature?.trim() || '',
        bloodPressure: data.bloodPressure?.trim() || '',
        hasDrugAllergy: data.hasDrugAllergy ?? false,
        drugAllergyDescription: data.drugAllergyDescription?.trim() || '',
        approvalStatus: 'approved',
        approvedBy: adminUser?.name || 'Petugas UKS',
        handledBy: adminUser?.name || 'Petugas UKS',
        approvedAt: now.toISOString()
      };

      // Deduct stock in real-time
      let updatedMeds = [...medicines];
      const lowStockAlerts: string[] = [];

      if (data.needsMedicine && data.medicinesGiven.length > 0) {
        updatedMeds = updatedMeds.map(med => {
          const used = data.medicinesGiven.find(u => u.medicineId === med.id);
          if (used) {
            const isMultiDose = med.usageType === 'multi_dose' || (med.unit?.toLowerCase().includes('botol') && med.usageType !== 'single_dose');
            // Multi-dose item: do not deduct stock per visit
            if (isMultiDose) {
              return med;
            }
            const updatedMedObj = deductMedicineFefo(med, used.quantity);
            if (updatedMedObj.stock <= updatedMedObj.minStock) {
              lowStockAlerts.push(`${updatedMedObj.name} (Sisa: ${updatedMedObj.stock} ${updatedMedObj.unit})`);
            }
            syncSaveMedicine(updatedMedObj);
            return updatedMedObj;
          }
          return med;
        });
        setMedicines(updatedMeds);
      }

      setRecords(prev => [newRecord, ...prev]);
      syncSaveVisit(newRecord);

      if (lowStockAlerts.length > 0) {
        showToast(`Data tersimpan di cloud! Perhatian: Stok obat mulai menipis: ${lowStockAlerts.join(', ')}`, 'warning');
      } else {
        showToast(`Data kunjungan ${newRecord.visitorName} berhasil dicatat & disinkronkan ke cloud!`, 'success');
      }

      return { success: true };
    }

    // CASE 2: PUBLIC VISITOR ENTRY (Goes to Pending Approval Queue, stock is NOT deducted yet)
    const newRecord: VisitRecord = {
      id: `vis-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      date: currentDate,
      time: currentTime,
      visitorName: data.visitorName.trim(),
      role: data.role,
      classOrPosition: data.classOrPosition.trim(),
      gender: data.gender,
      complaint: data.complaint.trim(),
      actionTaken: data.actionTaken.trim(),
      needsMedicine: data.needsMedicine,
      medicinesGiven: data.needsMedicine ? data.medicinesGiven : [],
      notes: data.notes?.trim() || '',
      finalStatus: data.finalStatus,
      temperature: data.temperature?.trim() || '',
      bloodPressure: data.bloodPressure?.trim() || '',
      hasDrugAllergy: data.hasDrugAllergy ?? false,
      drugAllergyDescription: data.drugAllergyDescription?.trim() || '',
      approvalStatus: 'pending'
    };

    setRecords(prev => [newRecord, ...prev]);
    syncSaveVisit(newRecord);

    showToast(`Pengajuan kunjungan ${newRecord.visitorName} berhasil dikirim ke database online dan menunggu verifikasi Petugas UKS.`, 'info');
    return { success: true };
  };

  // Approve Visit Record: Validates stock, deducts medicine stock, marks as approved
  const approveVisitRecord = (id: string) => {
    const visit = records.find(r => r.id === id);
    if (!visit) {
      return { success: false, error: 'Catatan kunjungan tidak ditemukan.' };
    }
    if (visit.approvalStatus === 'approved') {
      return { success: false, error: 'Kunjungan ini sudah disetujui sebelumnya.' };
    }

    // Validate medicine availability first
    if (visit.needsMedicine && visit.medicinesGiven.length > 0) {
      for (const usage of visit.medicinesGiven) {
        const found = medicines.find(m => m.id === usage.medicineId);
        if (!found) {
          return { success: false, error: `Obat "${usage.medicineName}" tidak ditemukan dalam master inventaris.` };
        }
        const isMultiDose = found.usageType === 'multi_dose' || (found.unit?.toLowerCase().includes('botol') && found.usageType !== 'single_dose');
        if (isMultiDose) {
          if (found.stock <= 0) {
            return {
              success: false,
              error: `Stok botol/tube "${found.name}" di UKS kosong (0 ${found.unit})! Harap lakukan restock botol baru.`
            };
          }
        } else {
          if (found.stock < usage.quantity) {
            return {
              success: false,
              error: `Stok obat "${found.name}" tidak mencukupi! Tersedia: ${found.stock} ${found.unit}, diminta: ${usage.quantity} ${found.unit}.`
            };
          }
        }
      }

      // Deduct stock upon approval
      let updatedMeds = [...medicines];
      const lowStockAlerts: string[] = [];

      updatedMeds = updatedMeds.map(med => {
        const used = visit.medicinesGiven.find(u => u.medicineId === med.id);
        if (used) {
          const isMultiDose = med.usageType === 'multi_dose' || (med.unit?.toLowerCase().includes('botol') && med.usageType !== 'single_dose');
          if (isMultiDose) {
            // Multi-dose item: do not deduct bottle stock
            return med;
          }
          const updatedMedObj = deductMedicineFefo(med, used.quantity);
          if (updatedMedObj.stock <= updatedMedObj.minStock) {
            lowStockAlerts.push(`${updatedMedObj.name} (Sisa: ${updatedMedObj.stock} ${updatedMedObj.unit})`);
          }
          syncSaveMedicine(updatedMedObj);
          return updatedMedObj;
        }
        return med;
      });
      setMedicines(updatedMeds);

      if (lowStockAlerts.length > 0) {
        showToast(`Peringatan: Stok obat menipis setelah disetujui: ${lowStockAlerts.join(', ')}`, 'warning');
      }
    }

    const now = new Date();
    const updatedVisit: VisitRecord = {
      ...visit,
      approvalStatus: 'approved',
      approvedBy: adminUser?.name || 'Petugas UKS',
      handledBy: adminUser?.name || 'Petugas UKS',
      approvedAt: now.toISOString()
    };

    setRecords(prev => prev.map(r => r.id === id ? updatedVisit : r));
    syncSaveVisit(updatedVisit);
    showToast(`Kunjungan "${visit.visitorName}" berhasil disetujui & data inventaris sinkron!`, 'success');
    return { success: true };
  };

  // Reject Visit Record: Rejects fake/prank submission without deducting any medicine stock
  const rejectVisitRecord = (id: string, reason?: string) => {
    const visit = records.find(r => r.id === id);
    if (!visit) {
      return { success: false, error: 'Catatan kunjungan tidak ditemukan.' };
    }

    const updatedVisit: VisitRecord = {
      ...visit,
      approvalStatus: 'rejected',
      rejectedReason: reason || 'Pengajuan kunjungan ditolak oleh Petugas UKS'
    };

    setRecords(prev => prev.map(r => r.id === id ? updatedVisit : r));
    syncSaveVisit(updatedVisit);
    showToast(`Pengajuan kunjungan "${visit.visitorName}" telah ditolak. Stok obat aman & tidak berkurang.`, 'info');
    return { success: true };
  };

  const deleteVisitRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    syncDeleteVisit(id);
    showToast('Data kunjungan berhasil dihapus dari cloud database.', 'info');
  };

  const updateVisitStatus = (id: string, status: VisitRecord['finalStatus']) => {
    const visit = records.find(r => r.id === id);
    if (!visit) return;
    const updated: VisitRecord = { ...visit, finalStatus: status };
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
    syncSaveVisit(updated);
    showToast('Status kunjungan berhasil diperbarui.', 'success');
  };

  // Medicine Management
  const addMedicine = (data: Omit<Medicine, 'id' | 'lastUpdated'>) => {
    const medId = `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const initialBatch: MedicineBatch = {
      id: `batch-${medId}-init`,
      batchNumber: 'KLOTER-AWAL',
      quantity: data.stock,
      expiryDate: data.expiryDate || '2027-12-31',
      receivedDate: new Date().toISOString().split('T')[0],
      note: 'Stok awal penambahan obat'
    };

    const newMed: Medicine = recalculateMedicineBatches({
      ...data,
      id: medId,
      batches: data.batches && data.batches.length > 0 ? data.batches : (data.stock > 0 ? [initialBatch] : []),
      lastUpdated: new Date().toISOString()
    });
    setMedicines(prev => [newMed, ...prev]);
    syncSaveMedicine(newMed);
    showToast(`Obat "${data.name}" berhasil ditambahkan ke inventaris cloud.`, 'success');
  };

  const updateMedicine = (id: string, updates: Partial<Omit<Medicine, 'id'>>) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const updated = recalculateMedicineBatches({
          ...m,
          ...updates,
          lastUpdated: new Date().toISOString()
        });
        syncSaveMedicine(updated);
        return updated;
      }
      return m;
    }));
    showToast('Data obat berhasil diperbarui di cloud.', 'success');
  };

  const deleteMedicine = (id: string) => {
    const target = medicines.find(m => m.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    syncDeleteMedicine(id);
    showToast(`Obat "${target?.name || ''}" telah dihapus dari cloud.`, 'info');
  };

  const restockMedicine = (
    id: string, 
    quantity: number, 
    expiryDate?: string, 
    batchNumber?: string, 
    note?: string
  ) => {
    const target = medicines.find(m => m.id === id);
    if (!target) return;

    const targetNormalized = recalculateMedicineBatches(target);
    const expDate = expiryDate || target.expiryDate || '2027-12-31';
    const bNumber = batchNumber?.trim() || `LOT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const newBatch: MedicineBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      batchNumber: bNumber,
      quantity: quantity,
      expiryDate: expDate,
      receivedDate: new Date().toISOString().split('T')[0],
      note: note || 'Penambahan stok kloter baru'
    };

    const updatedBatches = [...(targetNormalized.batches || []), newBatch];
    const updatedMed = recalculateMedicineBatches({
      ...targetNormalized,
      batches: updatedBatches
    });

    setMedicines(prev => prev.map(m => m.id === id ? updatedMed : m));
    syncSaveMedicine(updatedMed);

    const newLog: RestockLog = {
      id: `restock-${Date.now()}`,
      medicineId: id,
      medicineName: target.name,
      addedQuantity: quantity,
      expiryDate: expDate,
      batchNumber: bNumber,
      date: new Date().toISOString().split('T')[0],
      note: note || 'Penambahan stok kloter baru'
    };
    setRestockLogs(prev => [newLog, ...prev]);
    syncSaveRestockLog(newLog);

    showToast(`Stok "${target.name}" berhasil ditambah +${quantity} ${target.unit} (Kloter Exp: ${expDate}). Total sekarang: ${updatedMed.stock} ${target.unit}.`, 'success');
  };

  const disposeExpiredBatch = (medicineId: string, batchId: string, reason?: string) => {
    const target = medicines.find(m => m.id === medicineId);
    if (!target) return;

    const targetNormalized = recalculateMedicineBatches(target);
    const foundBatch = targetNormalized.batches?.find(b => b.id === batchId);
    if (!foundBatch) return;

    const disposedQty = foundBatch.quantity;
    const updatedBatches = (targetNormalized.batches || []).filter(b => b.id !== batchId);
    const updatedMed = recalculateMedicineBatches({
      ...targetNormalized,
      batches: updatedBatches
    });

    setMedicines(prev => prev.map(m => m.id === medicineId ? updatedMed : m));
    syncSaveMedicine(updatedMed);

    const newLog: RestockLog = {
      id: `dispose-${Date.now()}`,
      medicineId: medicineId,
      medicineName: target.name,
      addedQuantity: -disposedQty,
      expiryDate: foundBatch.expiryDate,
      batchNumber: foundBatch.batchNumber,
      date: new Date().toISOString().split('T')[0],
      note: reason || `Pemusnahan stok kedaluwarsa (${disposedQty} ${target.unit})`
    };
    setRestockLogs(prev => [newLog, ...prev]);
    syncSaveRestockLog(newLog);

    showToast(`Kloter ${foundBatch.batchNumber || foundBatch.expiryDate} (${disposedQty} ${target.unit}) "${target.name}" berhasil dimusnahkan/dihapus dari stok aktif.`, 'info');
  };

  // Consume 1 bottle/tube of multi-dose medicine when completely finished
  const consumeMultiDoseBottle = (id: string) => {
    const target = medicines.find(m => m.id === id);
    if (!target) return;

    if (target.stock <= 0) {
      showToast(`Stok "${target.name}" sudah 0 ${target.unit}. Silakan lakukan restock terlebih dahulu.`, 'warning');
      return;
    }

    const updatedMed = deductMedicineFefo(target, 1);
    setMedicines(prev => prev.map(m => m.id === id ? updatedMed : m));
    syncSaveMedicine(updatedMed);

    showToast(`1 ${target.unit} "${target.name}" ditandai habis. Sisa stok di UKS: ${updatedMed.stock} ${target.unit}.`, updatedMed.stock <= target.minStock ? 'warning' : 'success');
  };

  const importMedicinesFromExcel = (
    list: Omit<Medicine, 'id' | 'lastUpdated'>[],
    mode: 'merge' | 'replace'
  ) => {
    let added = 0;
    let updated = 0;

    if (mode === 'replace') {
      const oldIds = medicines.map(m => m.id);
      const newItems: Medicine[] = list.map((item, idx) => {
        const medId = `med-import-${Date.now()}-${idx}`;
        const initialBatch: MedicineBatch = {
          id: `batch-${medId}-init`,
          batchNumber: 'KLOTER-IMPORT',
          quantity: item.stock,
          expiryDate: item.expiryDate || '2027-12-31',
          receivedDate: new Date().toISOString().split('T')[0],
          note: 'Impor Excel'
        };
        return recalculateMedicineBatches({
          ...item,
          id: medId,
          batches: [initialBatch],
          lastUpdated: new Date().toISOString()
        });
      });
      setMedicines(newItems);
      syncReplaceAllMedicines(oldIds, newItems);
      added = newItems.length;
      showToast(`Berhasil mengganti seluruh daftar obat (${added} item) dari file Excel.`, 'success');
      return { added, updated: 0 };
    }

    // Mode: Merge (Update if existing name matches, otherwise insert)
    setMedicines(prev => {
      const currentMap = new Map<string, Medicine>();
      prev.forEach(m => currentMap.set(m.name.toLowerCase().trim(), m));

      const result: Medicine[] = [...prev];

      list.forEach((item, idx) => {
        const key = item.name.toLowerCase().trim();
        if (currentMap.has(key)) {
          // Update existing
          const existing = currentMap.get(key)!;
          const targetIndex = result.findIndex(m => m.id === existing.id);
          if (targetIndex !== -1) {
            const extraBatch: MedicineBatch = {
              id: `batch-${existing.id}-${Date.now()}-${idx}`,
              batchNumber: 'KLOTER-IMPORT',
              quantity: item.stock,
              expiryDate: item.expiryDate || existing.expiryDate || '2027-12-31',
              receivedDate: new Date().toISOString().split('T')[0],
              note: 'Impor Excel Merge'
            };

            const updatedBatches = [...(existing.batches || []), extraBatch];
            const updatedMed = recalculateMedicineBatches({
              ...result[targetIndex],
              category: item.category || result[targetIndex].category,
              unit: item.unit || result[targetIndex].unit,
              usageType: item.usageType || result[targetIndex].usageType,
              minStock: item.minStock || result[targetIndex].minStock,
              location: item.location || result[targetIndex].location,
              description: item.description || result[targetIndex].description,
              batches: updatedBatches,
              lastUpdated: new Date().toISOString()
            });

            result[targetIndex] = updatedMed;
            syncSaveMedicine(updatedMed);
            updated++;
          }
        } else {
          // Add new
          const medId = `med-import-${Date.now()}-${idx}`;
          const initialBatch: MedicineBatch = {
            id: `batch-${medId}-init`,
            batchNumber: 'KLOTER-IMPORT',
            quantity: item.stock,
            expiryDate: item.expiryDate || '2027-12-31',
            receivedDate: new Date().toISOString().split('T')[0],
            note: 'Impor Excel'
          };
          const newMed: Medicine = recalculateMedicineBatches({
            ...item,
            id: medId,
            batches: [initialBatch],
            lastUpdated: new Date().toISOString()
          });
          result.push(newMed);
          currentMap.set(key, newMed);
          syncSaveMedicine(newMed);
          added++;
        }
      });

      return result;
    });

    showToast(`Impor Excel berhasil: ${added} obat baru ditambahkan, ${updated} obat diperbarui stoknya.`, 'success');
    return { added, updated };
  };

  const resetToDefaultData = () => {
    setRecords([]);
    const normalizedInitial = INITIAL_MEDICINES.map(m => recalculateMedicineBatches(m));
    setMedicines(normalizedInitial);
    setRestockLogs([]);
    
    normalizedInitial.forEach(m => syncSaveMedicine(m));
    showToast('Data master obat dan pengaturan berhasil diatur ulang.', 'info');
  };

  return (
    <UksContext.Provider
      value={{
        records,
        medicines,
        restockLogs,
        activeTab,
        setActiveTab,
        navigateToTab,
        schoolInfo,
        updateSchoolInfo,
        resetSchoolInfo,
        koordinatorUks,
        isAdminLoggedIn,
        adminUser,
        users,
        loginAsAdmin,
        logoutAdmin,
        pendingTab,
        setPendingTab,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPassword,
        addVisitRecord,
        approveVisitRecord,
        rejectVisitRecord,
        deleteVisitRecord,
        updateVisitStatus,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        restockMedicine,
        disposeExpiredBatch,
        consumeMultiDoseBottle,
        importMedicinesFromExcel,
        resetToDefaultData,
        pendingVisits,
        approvedVisits,
        lowStockMedicines,
        outOfStockMedicines,
        expiringSoonMedicines,
        expiredMedicines,
        todayVisits,
        activePatients,
        toast,
        showToast,
        dismissToast
      }}
    >
      {children}
    </UksContext.Provider>
  );
};

export const useUks = (): UksContextType => {
  const context = useContext(UksContext);
  if (!context) {
    throw new Error('useUks must be used within a UksProvider');
  }
  return context;
};
