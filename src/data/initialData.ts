import { Medicine, VisitRecord, AdminUser, SchoolInfo } from '../types';

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    username: 'nita',
    password: 'smabasehat',
    name: 'Nita Rimayanti, S.Pd',
    role: 'Koordinator UKS',
    nip: '19860728 200903 2 005',
    phone: '081234567890',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-2',
    username: 'irham',
    password: 'smabasehat',
    name: 'Moh. Irham Rozaqi, S.Kom, Gr.',
    role: 'Pembina UKS',
    nip: '19891021 202221 1 017',
    phone: '085655306033',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-3',
    username: 'mitha',
    password: 'smabasehat',
    name: 'Amitha Mustika Damayanti, M.Pd',
    role: 'Pembina UKS',
    nip: '19920219 202321 2 039',
    phone: '082187271650',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-4',
    username: 'muhajir',
    password: 'smabasehat',
    name: 'Ahmad Muhajir R, S.Pd',
    role: 'Pembina UKS',
    nip: '19820826 202221 1 011',
    phone: '081931895675',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-5',
    username: 'ribkha',
    password: 'smabasehat',
    name: 'Ribkha Ayu Adiningtyas, S.Pd',
    role: 'Pembina UKS',
    nip: '19920322 202521 2 115',
    phone: '081283038032',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-6',
    username: 'panji',
    password: 'smabasehat',
    name: 'Panji Penatas, S.Pd',
    role: 'Pembina UKS',
    nip: '19900608 202521 1 127',
    phone: '0895337139132',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-7',
    username: 'rindy',
    password: 'smabasehat',
    name: 'Rindy Antika Sari',
    role: 'Staf Administrasi UKS',
    nip: '19880502 202521 2 111',
    phone: '081249903049',
    isActive: true,
    createdAt: '2025-01-01'
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    category: 'Analgesik & Antipiretik',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 8, // Below minStock (15) -> Trigger low stock warning!
    minStock: 15,
    expiryDate: '2027-05-12',
    location: 'Lemari A - Rak 1',
    description: 'Pereda demam dan sakit kepala ringan hingga sedang',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-2',
    name: 'Antasida Doen',
    category: 'Saluran Pencernaan',
    unit: 'Tablet Kunyah',
    usageType: 'single_dose',
    stock: 24,
    minStock: 10,
    expiryDate: '2026-11-20',
    location: 'Lemari A - Rak 2',
    description: 'Mengurangi gejala maag, asam lambung berlebih, dan kembung',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-3',
    name: 'Promag',
    category: 'Saluran Pencernaan',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 5, // Below minStock (10) -> Low stock warning!
    minStock: 10,
    expiryDate: '2027-02-14',
    location: 'Lemari A - Rak 2',
    description: 'Obat sakit maag cepat untuk siswa dan guru',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-4',
    name: 'Minyak Kayu Putih 60ml',
    category: 'Obat Luar & Terapi',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 6,
    minStock: 5,
    expiryDate: '2028-01-10',
    location: 'Meja Periksa / P3K',
    description: 'Meredakan mual, kembung, pusing, dan menghangatkan tubuh (Pemakaian bersama)',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-5',
    name: 'Betadine / Povidone Iodine 30ml',
    category: 'Antiseptik Luka',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 4, // Below minStock (5) -> Low stock warning!
    minStock: 5,
    expiryDate: '2027-08-30',
    location: 'Kotak P3K Utama',
    description: 'Cairan antiseptik untuk pembersih dan pengering luka luar (Pemakaian bersama)',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-6',
    name: 'Oralit 200ml',
    category: 'Rehidrasi Cairan',
    unit: 'Sachet',
    usageType: 'single_dose',
    stock: 18,
    minStock: 10,
    expiryDate: '2027-03-25',
    location: 'Lemari A - Rak 3',
    description: 'Mencegah dan mengatasi dehidrasi akibat diare atau muntah',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-7',
    name: 'Tolak Angin Cair',
    category: 'Herbal & Masuk Angin',
    unit: 'Sachet',
    usageType: 'single_dose',
    stock: 35,
    minStock: 15,
    expiryDate: '2026-12-05',
    location: 'Lemari A - Rak 3',
    description: 'Meredakan masuk angin, perut mual, meriang, dan pusing',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-8',
    name: 'Counterpain Salep 15g',
    category: 'Salep Pereda Nyeri',
    unit: 'Tube',
    usageType: 'multi_dose',
    stock: 7,
    minStock: 5,
    expiryDate: '2027-09-18',
    location: 'Kotak P3K Lapangan Olahraga',
    description: 'Meredakan nyeri otot, pegal, memar, dan cedera terkilir (Pemakaian bersama)',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-9',
    name: 'Hansaplast / Plester Luka Elastis',
    category: 'Alat Medis P3K',
    unit: 'Pcs',
    usageType: 'single_dose',
    stock: 45,
    minStock: 20,
    expiryDate: '2028-10-01',
    location: 'Kotak P3K Utama',
    description: 'Plester penutup luka kecil dan goresan',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-10',
    name: 'Kasa Steril 16x16cm',
    category: 'Alat Medis P3K',
    unit: 'Pcs',
    usageType: 'single_dose',
    stock: 22,
    minStock: 10,
    expiryDate: '2028-06-15',
    location: 'Kotak P3K Utama',
    description: 'Kasa pembalut luka steril anti lengket',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-11',
    name: 'Cetirizine 10mg',
    category: 'Antialergi',
    unit: 'Tablet',
    usageType: 'single_dose',
    stock: 12,
    minStock: 10,
    expiryDate: '2027-04-10',
    location: 'Lemari B (Obat Khusus)',
    description: 'Mengatasi gatal alergi, biduran, dan bersin-bersin rinitis',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-12',
    name: 'Sangobion Kapsul',
    category: 'Vitamin & Tambah Darah',
    unit: 'Kapsul',
    usageType: 'single_dose',
    stock: 14,
    minStock: 10,
    expiryDate: '2027-01-20',
    location: 'Lemari A - Rak 1',
    description: 'Penambah darah untuk siswi/guru yang lemas karena anemia / menstruasi',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-13',
    name: 'Rivanol 100ml',
    category: 'Antiseptik Luka',
    unit: 'Botol',
    usageType: 'multi_dose',
    stock: 3, // Below minStock (5) -> Low stock warning!
    minStock: 5,
    expiryDate: '2027-07-11',
    location: 'Meja Tindakan UKS',
    description: 'Cairan pencuci luka basah dan kompres bengkak/nanah (Pemakaian bersama)',
    lastUpdated: new Date().toISOString()
  }
];

// Helper to format ISO date offset
function getDateOffset(daysAgo: number): { date: string; timestamp: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dateStr = d.toISOString().split('T')[0];
  return { date: dateStr, timestamp: d.toISOString() };
}

export const INITIAL_VISITS: VisitRecord[] = [];

export const STUDENT_CLASSES = {
  X: Array.from({ length: 12 }, (_, i) => `X-${i + 1}`),
  XI: Array.from({ length: 12 }, (_, i) => `XI-${i + 1}`),
  XII: Array.from({ length: 12 }, (_, i) => `XII-${i + 1}`)
};

export const ALL_STUDENT_CLASSES: string[] = [
  ...STUDENT_CLASSES.X,
  ...STUDENT_CLASSES.XI,
  ...STUDENT_CLASSES.XII
];

export const SCHOOL_INFO: SchoolInfo = {
  governmentHeader: 'PEMERINTAH PROVINSI JAWA TIMUR • DINAS PENDIDIKAN',
  name: 'SEKOLAH MENENGAH ATAS NEGERI 1 BATU',
  shortName: 'SMAN 1 BATU',
  division: 'UNIT KESEHATAN SEKOLAH (UKS)',
  address: 'Jl. KH. Agus Salim No. 57, Kel. Sisir, Kec. Batu, Kota Batu, Jawa Timur 65314',
  city: 'Kota Batu',
  phone: '(0341) 591310',
  email: 'sman1batu@yahoo.com',
  schoolPrincipal: 'Drs. R. Agus Santoso, M.Pd',
  schoolPrincipalNip: '19690315 199412 1 002',
  logoUrl: '/logo-sman1-batu.png'
};
