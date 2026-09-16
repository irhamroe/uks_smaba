export type VisitorRole = 'siswa' | 'guru' | 'staf';
export type Gender = 'L' | 'P';

export type VisitStatus = 
  | 'Kembali ke Kelas / Mengajar'
  | 'Sedang Istirahat di UKS'
  | 'Izin Pulang / Dijemput'
  | 'Rujukan ke Puskesmas/RS';

export interface MedicineUsage {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  dosageNotes?: string;
}

export interface VisitRecord {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  visitorName: string;
  role: VisitorRole;
  classOrPosition: string; // e.g. "X-3", "XI MIPA 2", "Guru Matematika"
  gender: Gender;
  complaint: string; // Keluhan
  actionTaken: string; // Tindakan
  needsMedicine: boolean;
  medicinesGiven: MedicineUsage[];
  notes?: string;
  finalStatus: VisitStatus;
  temperature?: string; // e.g. "36.8"
  bloodPressure?: string; // e.g. "110/70"
  bedNumber?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  unit: string; // Tablet, Kapsul, Botol, Sachet, Strip, Tube, Pcs
  stock: number;
  minStock: number;
  expiryDate?: string; // YYYY-MM-DD
  location?: string; // e.g. Lemari Obat A-1
  description?: string;
  lastUpdated: string;
}

export interface RestockLog {
  id: string;
  medicineId: string;
  medicineName: string;
  addedQuantity: number;
  date: string;
  note?: string;
}

export interface AdminUser {
  id?: string;
  username: string;
  password?: string;
  name: string;
  role: string;
  nip?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface UksBed {
  id: string;
  name: string;
  location: string;
  status: 'Tersedia' | 'Terisi' | 'Perbaikan / Pembersihan';
  genderCategory?: 'Semua' | 'Putra' | 'Putri' | 'Isolasi';
  description?: string;
}

export interface SchoolInfo {
  governmentHeader: string;
  name: string;
  shortName: string;
  division: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  schoolPrincipal: string;
  schoolPrincipalNip: string;
  logoUrl?: string;
}

export type AppTab = 'guestbook' | 'dashboard' | 'inventory' | 'reports' | 'users' | 'login';

export interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  role?: 'all' | VisitorRole;
  searchQuery: string;
  complaintFilter?: string;
}
