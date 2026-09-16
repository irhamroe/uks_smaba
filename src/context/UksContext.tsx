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
  syncSaveUser,
  syncDeleteUser,
  syncSaveSchoolInfo,
  syncSaveBed,
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
  
  // Actions
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
  
  deleteVisitRecord: (id: string) => void;
  updateVisitStatus: (id: string, status: VisitRecord['finalStatus']) => void;
  
  addMedicine: (data: Omit<Medicine, 'id' | 'lastUpdated'>) => void;
  updateMedicine: (id: string, updates: Partial<Omit<Medicine, 'id'>>) => void;
  deleteMedicine: (id: string) => void;
  restockMedicine: (id: string, quantity: number, note?: string) => void;
  importMedicinesFromExcel: (list: Omit<Medicine, 'id' | 'lastUpdated'>[], mode: 'merge' | 'replace') => { added: number; updated: number };
  resetToDefaultData: () => void;
  
  // Computed
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
  ADMIN_SESSION: 'uks_sman1batu_admin_session_v1'
};

export const UksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Proactively clear legacy localStorage keys so all devices use cloud database
  useEffect(() => {
    try {
      localStorage.removeItem('uks_sman1batu_visits_v1');
      localStorage.removeItem('uks_sman1batu_medicines_v1');
      localStorage.removeItem('uks_sman1batu_restock_v1');
      localStorage.removeItem('uks_sman1batu_users_v1');
      localStorage.removeItem('uks_sman1batu_beds_v1');
      localStorage.removeItem('uks_sman1batu_school_info_v1');
    } catch {
      // Ignore
    }
  }, []);

  // Online Cloud-Driven State
  const [beds, setBeds] = useState<UksBed[]>(INITIAL_BEDS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(SCHOOL_INFO);
  const [records, setRecords] = useState<VisitRecord[]>(INITIAL_VISITS);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [restockLogs, setRestockLogs] = useState<RestockLog[]>([]);

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

    const unsubVisits = subscribeToVisits((newVisits) => {
      if (newVisits && newVisits.length > 0) {
        setRecords(newVisits);
      }
    });

    const unsubMedicines = subscribeToMedicines((newMeds) => {
      if (newMeds && newMeds.length > 0) {
        setMedicines(newMeds);
      }
    });

    const unsubUsers = subscribeToUsers((newUsers) => {
      if (newUsers && newUsers.length > 0) {
        setUsers(newUsers);
      }
    });

    const unsubSchool = subscribeToSchoolInfo((newSchool) => {
      if (newSchool && newSchool.name) {
        setSchoolInfo(newSchool);
      }
    });

    const unsubBeds = subscribeToBeds((newBeds) => {
      if (newBeds && newBeds.length > 0) {
        setBeds(newBeds);
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
      (u.password === trimmedPass || (!u.password && trimmedPass === 'admin') || (trimmedUser === 'admin' && trimmedPass === 'admin'))
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

    // 2. Fallback for demo admin credentials
    if (trimmedUser === 'admin' && trimmedPass === 'admin') {
      const defaultAdmin: AdminUser = {
        id: 'usr-admin',
        username: 'admin',
        name: 'Hj. Sri Rahayu, S.Pd., M.Kes',
        role: 'Koordinator UKS',
        nip: '19760812 200212 2 003',
        email: 'sman1batu@yahoo.com',
        phone: '081234567890',
        isActive: true
      };

      setAdminUser(defaultAdmin);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(defaultAdmin));
      } catch (e) {
        console.error('Failed to save admin session:', e);
      }

      showToast('Login berhasil sebagai Administrator UKS SMAN 1 Batu.', 'success');
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
      password: userData.password?.trim() || 'admin123',
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

    if (adminUser && (adminUser.id === id || adminUser.username.toLowerCase() === userToDelete.username.toLowerCase())) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.', 'warning');
      return { success: false, error: 'Tidak dapat menghapus akun yang sedang aktif.' };
    }

    if (users.length <= 1) {
      showToast('Harus tersisa setidaknya satu akun administrator di sistem UKS.', 'warning');
      return { success: false, error: 'Minimal harus ada satu akun administrator.' };
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    syncDeleteUser(id);
    showToast(`Pengguna "${userToDelete.name}" berhasil dihapus dari sistem.`, 'info');
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
      r => r.finalStatus === 'Sedang Istirahat di UKS' && r.bedNumber === bedToDelete.name
    );

    if (isOccupied) {
      showToast(`Ranjang "${bedToDelete.name}" sedang digunakan pasien istirahat. Harap selesaikan istirahat pasien terlebih dahulu.`, 'warning');
      return { success: false, error: 'Ranjang sedang digunakan pasien.' };
    }

    setBeds(prev => prev.filter(b => b.id !== id));
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
      r => r.finalStatus === 'Sedang Istirahat di UKS' && r.bedNumber === bedName
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save visits:', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    } catch (e) {
      console.error('Failed to save medicines:', e);
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESTOCK, JSON.stringify(restockLogs));
    } catch (e) {
      console.error('Failed to save restock logs:', e);
    }
  }, [restockLogs]);

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
    return records.filter(r => r.date === todayStr);
  }, [records, todayStr]);

  const activePatients = useMemo(() => {
    return records.filter(r => r.finalStatus === 'Sedang Istirahat di UKS');
  }, [records]);

  // Add Visit Record & Real-time stock reduction
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
    // Validate medicine availability first
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

    const now = new Date();
    const currentDate = data.customDate || now.toISOString().split('T')[0];
    const currentTime = data.customTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

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
      bedNumber: data.bedNumber
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

    // Add to records (newest on top) and sync to Firestore
    setRecords(prev => [newRecord, ...prev]);
    syncSaveVisit(newRecord);

    if (lowStockAlerts.length > 0) {
      showToast(`Data tersimpan! Perhatian: Stok obat mulai menipis: ${lowStockAlerts.join(', ')}`, 'warning');
    } else {
      showToast(`Data kunjungan ${newRecord.visitorName} berhasil dicatat!`, 'success');
    }

    return { success: true };
  };

  const deleteVisitRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
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
    setMedicines(prev => prev.filter(m => m.id !== id));
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
      const newItems: Medicine[] = list.map((item, idx) => ({
        ...item,
        id: `med-import-${Date.now()}-${idx}`,
        lastUpdated: new Date().toISOString()
      }));
      setMedicines(newItems);
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
        deleteVisitRecord,
        updateVisitStatus,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        restockMedicine,
        importMedicinesFromExcel,
        resetToDefaultData,
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
