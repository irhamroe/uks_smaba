import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Medicine, VisitRecord, RestockLog, MedicineUsage, AppTab, AdminUser, SchoolInfo } from '../types';
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
    finalStatus: VisitRecord['finalStatus'];
    temperature?: string;
    bloodPressure?: string;
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
  restockMedicine: (id: string, quantity: number, note?: string) => void;
  consumeMultiDoseBottle: (id: string) => void;
  importMedicinesFromExcel: (list: Omit<Medicine, 'id' | 'lastUpdated'>[], mode: 'merge' | 'replace') => { added: number; updated: number };
  resetToDefaultData: () => void;
  
  // Computed
  pendingVisits: VisitRecord[];
  approvedVisits: VisitRecord[];
  lowStockMedicines: Medicine[];
  outOfStockMedicines: Medicine[];
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
        setMedicines(cloudMeds);
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
    if (adminUser && (adminUser.id === id || adminUser.username.toLowerCase() === existing.username.toLowerCase())) {
      const refreshed: AdminUser = {
        ...adminUser,
        name: updates.name || adminUser.name,
        role: updates.role || adminUser.role,
        nip: updates.nip !== undefined ? updates.nip : adminUser.nip,
        email: updates.email !== undefined ? updates.email : adminUser.email,
        phone: updates.phone !== undefined ? updates.phone : adminUser.phone,
        username: updates.username ? updates.username.trim().toLowerCase() : adminUser.username
      };
      setAdminUser(refreshed);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(refreshed));
      } catch (e) {
        console.error('Failed to update current admin session:', e);
      }
    }

    showToast(`Data pengguna "${updates.name || existing.name}" berhasil diperbarui.`, 'success');
    return { success: true };
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    // Protection for Koordinator UKS (Nita Rimayanti)
    if (userToDelete.username.toLowerCase() === 'nita' || userToDelete.role.toLowerCase().includes('koordinator')) {
      showToast('Akun Koordinator UKS (Nita Rimayanti) adalah akun utama dan tidak dapat dihapus.', 'warning');
      return { success: false, error: 'Akun Koordinator UKS tidak dapat dihapus.' };
    }

    if (users.length <= 1) {
      showToast('Harus tersisa setidaknya satu akun administrator di sistem UKS.', 'warning');
      return { success: false, error: 'Minimal harus ada satu akun administrator.' };
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    syncDeleteUser(id);

    // If deleted the active logged in user, logout smoothly
    if (adminUser && (adminUser.id === id || adminUser.username.toLowerCase() === userToDelete.username.toLowerCase())) {
      logoutAdmin();
      showToast(`Akun "${userToDelete.name}" berhasil dihapus. Anda telah keluar dari sesi.`, 'info');
    } else {
      showToast(`Pengguna "${userToDelete.name}" berhasil dihapus dari sistem.`, 'info');
    }

    return { success: true };
  };

  const toggleUserStatus = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (adminUser && (adminUser.id === id || adminUser.username.toLowerCase() === user.username.toLowerCase())) {
      showToast('Anda tidak dapat menonaktifkan akun yang sedang Anda gunakan saat ini.', 'warning');
      return;
    }

    const newStatus = !user.isActive;
    const updatedUser = { ...user, isActive: newStatus };
    setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    syncSaveUser(updatedUser);
    showToast(
      `Status akun "${user.name}" diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
      newStatus ? 'success' : 'info'
    );
  };

  const resetUserPassword = (id: string, newPass: string) => {
    const trimmed = newPass.trim();
    if (!trimmed || trimmed.length < 4) {
      return { success: false, error: 'Password minimal 4 karakter.' };
    }

    const user = users.find(u => u.id === id);
    if (!user) {
      return { success: false, error: 'Pengguna tidak ditemukan.' };
    }

    const updatedUser = { ...user, password: trimmed };
    setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    syncSaveUser(updatedUser);
    showToast(`Password untuk pengguna "${user.name}" (${user.username}) berhasil direset.`, 'success');
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
    bedNumber?: string;
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
            const newStock = Math.max(0, med.stock - used.quantity);
            if (newStock <= med.minStock) {
              lowStockAlerts.push(`${med.name} (Sisa: ${newStock} ${med.unit})`);
            }
            const updatedMedObj = {
              ...med,
              stock: newStock,
              lastUpdated: new Date().toISOString()
            };
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
          const newStock = Math.max(0, med.stock - used.quantity);
          if (newStock <= med.minStock) {
            lowStockAlerts.push(`${med.name} (Sisa: ${newStock} ${med.unit})`);
          }
          const updatedMedObj = {
            ...med,
            stock: newStock,
            lastUpdated: new Date().toISOString()
          };
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
    const newMed: Medicine = {
      ...data,
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lastUpdated: new Date().toISOString()
    };
    setMedicines(prev => [newMed, ...prev]);
    syncSaveMedicine(newMed);
    showToast(`Obat "${data.name}" berhasil ditambahkan ke inventaris cloud.`, 'success');
  };

  const updateMedicine = (id: string, updates: Partial<Omit<Medicine, 'id'>>) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const updated = {
          ...m,
          ...updates,
          lastUpdated: new Date().toISOString()
        };
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

  const restockMedicine = (id: string, quantity: number, note?: string) => {
    const target = medicines.find(m => m.id === id);
    if (!target) return;

    const newStock = target.stock + quantity;
    const updatedMed = {
      ...target,
      stock: newStock,
      lastUpdated: new Date().toISOString()
    };
    setMedicines(prev => prev.map(m => m.id === id ? updatedMed : m));
    syncSaveMedicine(updatedMed);

    const newLog: RestockLog = {
      id: `restock-${Date.now()}`,
      medicineId: id,
      medicineName: target.name,
      addedQuantity: quantity,
      date: new Date().toISOString().split('T')[0],
      note: note || 'Penambahan stok manual'
    };
    setRestockLogs(prev => [newLog, ...prev]);
    syncSaveRestockLog(newLog);

    showToast(`Stok "${target.name}" berhasil ditambah +${quantity} ${target.unit}. Total sekarang: ${newStock} ${target.unit}.`, 'success');
  };

  // Consume 1 bottle/tube of multi-dose medicine when completely finished
  const consumeMultiDoseBottle = (id: string) => {
    const target = medicines.find(m => m.id === id);
    if (!target) return;

    if (target.stock <= 0) {
      showToast(`Stok "${target.name}" sudah 0 ${target.unit}. Silakan lakukan restock terlebih dahulu.`, 'warning');
      return;
    }

    const newStock = Math.max(0, target.stock - 1);
    const updatedMed = {
      ...target,
      stock: newStock,
      lastUpdated: new Date().toISOString()
    };
    setMedicines(prev => prev.map(m => m.id === id ? updatedMed : m));
    syncSaveMedicine(updatedMed);

    showToast(`1 ${target.unit} "${target.name}" ditandai habis. Sisa stok di UKS: ${newStock} ${target.unit}.`, newStock <= target.minStock ? 'warning' : 'success');
  };

  const importMedicinesFromExcel = (
    list: Omit<Medicine, 'id' | 'lastUpdated'>[],
    mode: 'merge' | 'replace'
  ) => {
    let added = 0;
    let updated = 0;

    if (mode === 'replace') {
      const oldIds = medicines.map(m => m.id);
      const newItems: Medicine[] = list.map((item, idx) => ({
        ...item,
        id: `med-import-${Date.now()}-${idx}`,
        lastUpdated: new Date().toISOString()
      }));
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
            result[targetIndex] = {
              ...result[targetIndex],
              stock: result[targetIndex].stock + item.stock, // Add incoming stock
              category: item.category || result[targetIndex].category,
              unit: item.unit || result[targetIndex].unit,
              usageType: item.usageType || result[targetIndex].usageType,
              minStock: item.minStock || result[targetIndex].minStock,
              expiryDate: item.expiryDate || result[targetIndex].expiryDate,
              location: item.location || result[targetIndex].location,
              description: item.description || result[targetIndex].description,
              lastUpdated: new Date().toISOString()
            };
            syncSaveMedicine(result[targetIndex]);
            updated++;
          }
        } else {
          // Add new
          const newMed: Medicine = {
            ...item,
            id: `med-import-${Date.now()}-${idx}`,
            lastUpdated: new Date().toISOString()
          };
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
    setMedicines(INITIAL_MEDICINES);
    setRestockLogs([]);
    
    INITIAL_MEDICINES.forEach(m => syncSaveMedicine(m));
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
        consumeMultiDoseBottle,
        importMedicinesFromExcel,
        resetToDefaultData,
        pendingVisits,
        approvedVisits,
        lowStockMedicines,
        outOfStockMedicines,
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
