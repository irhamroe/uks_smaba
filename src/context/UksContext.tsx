import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Medicine, VisitRecord, RestockLog, MedicineUsage, AppTab, AdminUser, UksBed, SchoolInfo } from '../types';
import { INITIAL_MEDICINES, INITIAL_VISITS, INITIAL_ADMIN_USERS, INITIAL_BEDS, SCHOOL_INFO } from '../data/initialData';
import { 
  subscribeToVisits, 
  subscribeToMedicines, 
  subscribeToUsers, 
  subscribeToSchoolInfo, 
  subscribeToBeds,
  syncSaveVisit,
  syncDeleteVisit,
  syncSaveMedicine,
  syncDeleteMedicine,
  syncReplaceAllMedicines,
  syncSaveUser,
  syncDeleteUser,
  syncSaveSchoolInfo,
  syncSaveBed,
  syncDeleteBed,
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
  beds: UksBed[];
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

  // Bed Management
  addBed: (bed: Omit<UksBed, 'id'>) => { success: boolean; error?: string };
  updateBed: (id: string, updates: Partial<UksBed>) => { success: boolean; error?: string };
  deleteBed: (id: string) => { success: boolean; error?: string };
  setBedStatus: (id: string, status: UksBed['status']) => void;
  releaseBed: (bedName: string) => void;
  
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
    bedNumber?: string;
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
  VISITS: 'uks_sman1batu_visits_v2',
  MEDICINES: 'uks_sman1batu_medicines_v2',
  RESTOCK: 'uks_sman1batu_restock_v2',
  ADMIN_SESSION: 'uks_sman1batu_admin_session_v2',
  USERS: 'uks_sman1batu_users_v2',
  BEDS: 'uks_sman1batu_beds_v2',
  SCHOOL_INFO: 'uks_sman1batu_school_info_v2',
  INITIALIZED: 'uks_sman1batu_initialized_v2'
};

export const UksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Beds state with local cache + cloud sync
  const [beds, setBeds] = useState<UksBed[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BEDS);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (isInit) return [];
    return INITIAL_BEDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
    } catch {
      // Ignore
    }
  }, [beds]);

  // Users state with local cache + cloud sync
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter((u: any) => u.username?.toLowerCase() !== 'admin' && u.id !== 'usr-admin');
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_ADMIN_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {
      // Ignore
    }
  }, [users]);

  // School info state with local cache + cloud sync
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
      if (saved !== null) return { ...SCHOOL_INFO, ...JSON.parse(saved) };
    } catch {
      // Fallback
    }
    return SCHOOL_INFO;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(schoolInfo));
    } catch {
      // Ignore
    }
  }, [schoolInfo]);

  // Visits state with local cache + cloud sync
  const [records, setRecords] = useState<VisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (isInit) return [];
    return INITIAL_VISITS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(records));
    } catch {
      // Ignore
    }
  }, [records]);

  // Medicines state with local cache + cloud sync
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (isInit) return [];
    return INITIAL_MEDICINES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch {
      // Ignore
    }
  }, [medicines]);

  // Restock logs
  const [restockLogs, setRestockLogs] = useState<RestockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTOCK);
      if (saved !== null) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESTOCK, JSON.stringify(restockLogs));
    } catch {
      // Ignore
    }
  }, [restockLogs]);

  const updateSchoolInfo = (updates: Partial<SchoolInfo>) => {
    const updated = { ...schoolInfo, ...updates };
    setSchoolInfo(updated);
    syncSaveSchoolInfo(updated);
    showToast('Identitas sekolah berhasil diperbarui.', 'success');
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

  // Load admin session from sessionStorage/localStorage
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

  // Seed and Listen to Firebase Firestore Realtime Updates
  useEffect(() => {
    seedInitialFirestoreData();
    try {
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } catch {
      // Ignore
    }

    const unsubVisits = subscribeToVisits((cloudVisits) => {
      if (Array.isArray(cloudVisits)) {
        setRecords(prevLocal => {
          // If cloud has no visits and local has items, push local to cloud
          if (cloudVisits.length === 0) {
            if (prevLocal.length > 0) {
              prevLocal.forEach(v => syncSaveVisit(v));
              return prevLocal;
            }
            return [];
          }

          // Merge: Map cloud records by ID
          const cloudMap = new Map(cloudVisits.map(v => [v.id, v]));

          // Retain any locally-created records that haven't synced to cloud yet
          const localOnly = prevLocal.filter(v => !cloudMap.has(v.id));

          // If local-only records exist, push them to Firestore so they are never lost
          if (localOnly.length > 0) {
            localOnly.forEach(v => syncSaveVisit(v));
          }

          const merged = [...cloudVisits, ...localOnly];
          merged.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());

          try {
            localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(merged));
          } catch (e) {
            console.error('Failed to sync merged visits to localStorage:', e);
          }

          return merged;
        });
      }
    });

    const unsubMedicines = subscribeToMedicines((cloudMeds) => {
      if (Array.isArray(cloudMeds) && cloudMeds.length > 0) {
        setMedicines(prevLocal => {
          const cloudMap = new Map(cloudMeds.map(m => [m.id, m]));
          const localOnly = prevLocal.filter(m => !cloudMap.has(m.id));
          if (localOnly.length > 0) {
            localOnly.forEach(m => syncSaveMedicine(m));
          }
          const merged = [...cloudMeds, ...localOnly];
          try {
            localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    });

    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
        setUsers(prevLocal => {
          const cloudMap = new Map(cloudUsers.map(u => [u.id, u]));
          const localOnly = prevLocal.filter(u => !cloudMap.has(u.id));
          if (localOnly.length > 0) {
            localOnly.forEach(u => syncSaveUser(u));
          }
          const merged = [...cloudUsers, ...localOnly];
          try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    });

    const unsubSchool = subscribeToSchoolInfo((newSchool) => {
      if (newSchool && newSchool.name) {
        setSchoolInfo(newSchool);
      }
    });

    const unsubBeds = subscribeToBeds((cloudBeds) => {
      if (Array.isArray(cloudBeds) && cloudBeds.length > 0) {
        setBeds(prevLocal => {
          const cloudMap = new Map(cloudBeds.map(b => [b.id, b]));
          const localOnly = prevLocal.filter(b => !cloudMap.has(b.id));
          if (localOnly.length > 0) {
            localOnly.forEach(b => syncSaveBed(b));
          }
          const merged = [...cloudBeds, ...localOnly];
          try {
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }
    });

    return () => {
      unsubVisits();
      unsubMedicines();
      unsubUsers();
      unsubSchool();
      unsubBeds();
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

  // =====================
  // Bed Management Actions
  // =====================
  const addBed = (bedData: Omit<UksBed, 'id'>) => {
    const trimmedName = bedData.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Nama ranjang wajib diisi.' };
    }
    if (beds.some(b => b.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, error: `Ranjang dengan nama "${trimmedName}" sudah ada.` };
    }

    const newBed: UksBed = {
      ...bedData,
      id: `bed-${Date.now()}`,
      name: trimmedName,
      location: bedData.location.trim() || 'Ruang Utama UKS',
      status: bedData.status || 'Tersedia',
      genderCategory: bedData.genderCategory || 'Semua'
    };

    setBeds(prev => [...prev, newBed]);
    syncSaveBed(newBed);
    showToast(`Ranjang "${newBed.name}" berhasil ditambahkan ke inventaris UKS.`, 'success');
    return { success: true };
  };

  const updateBed = (id: string, updates: Partial<UksBed>) => {
    const existing = beds.find(b => b.id === id);
    if (!existing) {
      return { success: false, error: 'Ranjang tidak ditemukan.' };
    }

    if (updates.name) {
      const trimmedName = updates.name.trim();
      if (beds.some(b => b.id !== id && b.name.toLowerCase() === trimmedName.toLowerCase())) {
        return { success: false, error: `Nama ranjang "${trimmedName}" sudah digunakan.` };
      }
    }

    let updatedBedObj = existing;
    setBeds(prev => prev.map(b => {
      if (b.id === id) {
        const u = { ...b, ...updates };
        updatedBedObj = u;
        return u;
      }
      return b;
    }));
    syncSaveBed(updatedBedObj);
    showToast(`Data ranjang "${updates.name || existing.name}" berhasil diperbarui.`, 'success');
    return { success: true };
  };

  const deleteBed = (id: string) => {
    const bedToDelete = beds.find(b => b.id === id);
    if (!bedToDelete) {
      return { success: false, error: 'Ranjang tidak ditemukan.' };
    }

    // Check if bed is currently occupied by active resting patient
    const isOccupied = records.some(
      r => (r.finalStatus === 'Istirahat di UKS' || r.finalStatus === 'Sedang Istirahat di UKS') && r.bedNumber === bedToDelete.name
    );

    if (isOccupied) {
      showToast(`Ranjang "${bedToDelete.name}" sedang digunakan pasien istirahat. Harap selesaikan istirahat pasien terlebih dahulu.`, 'warning');
      return { success: false, error: 'Ranjang sedang digunakan pasien.' };
    }

    setBeds(prev => {
      const filtered = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });
    syncDeleteBed(id);
    showToast(`Ranjang "${bedToDelete.name}" berhasil dihapus dari UKS.`, 'info');
    return { success: true };
  };

  const setBedStatus = (id: string, status: UksBed['status']) => {
    const bed = beds.find(b => b.id === id);
    if (!bed) return;

    const updated = { ...bed, status };
    setBeds(prev => prev.map(b => (b.id === id ? updated : b)));
    syncSaveBed(updated);
    showToast(`Status "${bed.name}" diubah menjadi "${status}".`, 'info');
  };

  const releaseBed = (bedName: string) => {
    // Find active patient on this bed and complete rest
    const activePatient = records.find(
      r => (r.finalStatus === 'Istirahat di UKS' || r.finalStatus === 'Sedang Istirahat di UKS') && r.bedNumber === bedName
    );

    if (activePatient) {
      updateVisitStatus(activePatient.id, 'Kembali ke Kelas / Mengajar');
    }

    setBeds(prev => prev.map(b => {
      if (b.name === bedName) {
        const updated = { ...b, status: 'Tersedia' as const };
        syncSaveBed(updated);
        return updated;
      }
      return b;
    }));
    showToast(`Ranjang "${bedName}" telah dikosongkan dan siap digunakan kembali.`, 'success');
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
          if (found.stock < usage.quantity) {
            return {
              success: false,
              error: `Stok obat "${found.name}" tidak mencukupi! Tersedia: ${found.stock} ${found.unit}, diminta: ${usage.quantity} ${found.unit}.`
            };
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
        temperature: data.temperature?.trim(),
        bloodPressure: data.bloodPressure?.trim(),
        bedNumber: data.bedNumber,
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
        showToast(`Data tersimpan! Perhatian: Stok obat mulai menipis: ${lowStockAlerts.join(', ')}`, 'warning');
      } else {
        showToast(`Data kunjungan ${newRecord.visitorName} berhasil dicatat!`, 'success');
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
      temperature: data.temperature?.trim(),
      bloodPressure: data.bloodPressure?.trim(),
      bedNumber: data.bedNumber,
      approvalStatus: 'pending'
    };

    setRecords(prev => [newRecord, ...prev]);
    syncSaveVisit(newRecord);

    showToast(`Pengajuan kunjungan ${newRecord.visitorName} berhasil dikirim dan menunggu verifikasi Petugas UKS.`, 'info');
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
        if (found.stock < usage.quantity) {
          return {
            success: false,
            error: `Stok obat "${found.name}" tidak mencukupi! Tersedia: ${found.stock} ${found.unit}, diminta: ${usage.quantity} ${found.unit}.`
          };
        }
      }

      // Deduct stock upon approval
      let updatedMeds = [...medicines];
      const lowStockAlerts: string[] = [];

      updatedMeds = updatedMeds.map(med => {
        const used = visit.medicinesGiven.find(u => u.medicineId === med.id);
        if (used) {
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
    let updatedVisit: VisitRecord = visit;

    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const u: VisitRecord = {
          ...r,
          approvalStatus: 'approved',
          approvedBy: adminUser?.name || 'Petugas UKS',
          handledBy: adminUser?.name || 'Petugas UKS',
          approvedAt: now.toISOString()
        };
        updatedVisit = u;
        return u;
      }
      return r;
    }));

    syncSaveVisit(updatedVisit);
    showToast(`Kunjungan "${visit.visitorName}" berhasil disetujui & stok obat telah diperbarui!`, 'success');
    return { success: true };
  };

  // Reject Visit Record: Rejects fake/prank submission without deducting any medicine stock
  const rejectVisitRecord = (id: string, reason?: string) => {
    const visit = records.find(r => r.id === id);
    if (!visit) {
      return { success: false, error: 'Catatan kunjungan tidak ditemukan.' };
    }

    let updatedVisit: VisitRecord = visit;

    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const u: VisitRecord = {
          ...r,
          approvalStatus: 'rejected',
          rejectedReason: reason || 'Pengajuan kunjungan ditolak oleh Petugas UKS'
        };
        updatedVisit = u;
        return u;
      }
      return r;
    }));

    syncSaveVisit(updatedVisit);
    showToast(`Pengajuan kunjungan "${visit.visitorName}" telah ditolak. Stok obat aman & tidak berkurang.`, 'info');
    return { success: true };
  };

  const deleteVisitRecord = (id: string) => {
    setRecords(prev => {
      const filtered = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });
    syncDeleteVisit(id);
    showToast('Data kunjungan berhasil dihapus.', 'info');
  };

  const updateVisitStatus = (id: string, status: VisitRecord['finalStatus']) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, finalStatus: status };
        syncSaveVisit(updated);
        return updated;
      }
      return r;
    }));
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
    showToast(`Obat "${data.name}" berhasil ditambahkan ke inventaris.`, 'success');
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
    showToast('Data obat berhasil diperbarui.', 'success');
  };

  const deleteMedicine = (id: string) => {
    const target = medicines.find(m => m.id === id);
    setMedicines(prev => {
      const filtered = prev.filter(m => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });
    syncDeleteMedicine(id);
    showToast(`Obat "${target?.name || ''}" telah dihapus dari inventaris.`, 'info');
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

    showToast(`Stok "${target.name}" berhasil ditambah +${quantity} ${target.unit}. Total sekarang: ${newStock} ${target.unit}.`, 'success');
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
    setRecords(INITIAL_VISITS);
    setMedicines(INITIAL_MEDICINES);
    setRestockLogs([]);
    
    INITIAL_VISITS.forEach(v => syncSaveVisit(v));
    INITIAL_MEDICINES.forEach(m => syncSaveMedicine(m));
    showToast('Data berhasil diatur ulang ke data awal demonstrasi UKS SMAN 1 Batu.', 'info');
  };

  return (
    <UksContext.Provider
      value={{
        records,
        medicines,
        restockLogs,
        beds,
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
        addBed,
        updateBed,
        deleteBed,
        setBedStatus,
        releaseBed,
        addVisitRecord,
        approveVisitRecord,
        rejectVisitRecord,
        deleteVisitRecord,
        updateVisitStatus,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        restockMedicine,
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
