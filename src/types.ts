export type VisitorRole = 'siswa' | 'guru' | 'staf';
export type Gender = 'L' | 'P';

export type VisitStatus = 
  | 'Kembali ke Kelas / Mengajar'
  | 'Istirahat di UKS'
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
  hasDrugAllergy?: boolean; // Konfirmasi apakah ada riwayat alergi obat atau tidak
  drugAllergyDescription?: string; // Keterangan obat yang dialergi jika ada
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  handledBy?: string;
  rejectedReason?: string;
}

export type MedicineUsageType = 'single_dose' | 'multi_dose';

export interface MedicineBatch {
  id: string;
  batchNumber?: string; // e.g. "LOT-2026-01" atau "KLOTER-A"
  quantity: number;     // Sisa stok dalam batch/kloter ini
  expiryDate: string;   // YYYY-MM-DD
  receivedDate?: string;// YYYY-MM-DD
  note?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  unit: string; // Tablet, Kapsul, Botol, Sachet, Strip, Tube, Pcs
  usageType?: MedicineUsageType; // 'single_dose' (tablet/sachet) vs 'multi_dose' (minyak/rivanol/betadine/salep)
  stock: number;
  minStock: number;
  expiryDate?: string; // YYYY-MM-DD (Earliest active batch expiry date)
  batches?: MedicineBatch[]; // Rincian kloter/batch obat
  location?: string; // e.g. Lemari Obat A-1
  description?: string;
  lastUpdated: string;
}

export interface RestockLog {
  id: string;
  medicineId: string;
  medicineName: string;
  addedQuantity: number;
  expiryDate?: string;
  batchNumber?: string;
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

export type AppTab = 
  | 'guestbook' 
  | 'dashboard' 
  | 'inventory' 
  | 'reports' 
  | 'reports_visits' 
  | 'reports_medicines' 
  | 'users' 
  | 'login';

export interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  role?: 'all' | VisitorRole;
  searchQuery: string;
  complaintFilter?: string;
}
