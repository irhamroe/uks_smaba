import { Medicine, VisitRecord, AdminUser, UksBed, SchoolInfo } from '../types';

export const INITIAL_BEDS: UksBed[] = [
  {
    id: 'bed-1',
    name: 'Ranjang 1 (Dekat Pintu)',
    location: 'Sisi Kanan Ruang UKS',
    status: 'Tersedia',
    genderCategory: 'Semua',
    description: 'Ranjang periksa & observasi utama dengan selimut dan bantal medis'
  },
  {
    id: 'bed-2',
    name: 'Ranjang 2 (Tengah)',
    location: 'Sisi Tengah Ruang UKS',
    status: 'Tersedia',
    genderCategory: 'Putra',
    description: 'Ranjang istirahat siswa putra dengan tirai privasi'
  },
  {
    id: 'bed-3',
    name: 'Ranjang 3 (Dekat Jendela)',
    location: 'Sisi Kiri Dekat Jendela',
    status: 'Tersedia',
    genderCategory: 'Putri',
    description: 'Ranjang istirahat siswi putri dengan sirkulasi udara baik'
  },
  {
    id: 'bed-4',
    name: 'Ranjang Khusus Isolasi',
    location: 'Bilik Observasi Khusus',
    status: 'Tersedia',
    genderCategory: 'Isolasi',
    description: 'Ranjang khusus untuk siswa dengan gejala demam tinggi / menular'
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    username: 'nita',
    password: 'smabasehat',
    name: 'Nita Rimayanti, S.Pd',
    role: 'Koordinator UKS',
    nip: '19860728 200903 2 005',
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-2',
    username: 'irham',
    password: 'smabasehat',
    name: 'Moh. Irham Rozaki, S.Kom, Gr.',
    role: 'Pembina UKS',
    nip: '19891021 202221 1 017',
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
    isActive: true,
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin',
    name: 'Nita Rimayanti, S.Pd',
    role: 'Koordinator UKS',
    nip: '19860728 200903 2 005',
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
    stock: 6,
    minStock: 5,
    expiryDate: '2028-01-10',
    location: 'Meja Periksa / P3K',
    description: 'Meredakan mual, kembung, pusing, dan menghangatkan tubuh',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-5',
    name: 'Betadine / Povidone Iodine 30ml',
    category: 'Antiseptik Luka',
    unit: 'Botol',
    stock: 4, // Below minStock (5) -> Low stock warning!
    minStock: 5,
    expiryDate: '2027-08-30',
    location: 'Kotak P3K Utama',
    description: 'Cairan antiseptik untuk pembersih dan pengering luka luar',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-6',
    name: 'Oralit 200ml',
    category: 'Rehidrasi Cairan',
    unit: 'Sachet',
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
    stock: 7,
    minStock: 5,
    expiryDate: '2027-09-18',
    location: 'Kotak P3K Lapangan Olahraga',
    description: 'Meredakan nyeri otot, pegal, memar, dan cedera terkilir',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'med-9',
    name: 'Hansaplast / Plester Luka Elastis',
    category: 'Alat Medis P3K',
    unit: 'Pcs',
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
    stock: 3, // Below minStock (5) -> Low stock warning!
    minStock: 5,
    expiryDate: '2027-07-11',
    location: 'Meja Tindakan UKS',
    description: 'Cairan pencuci luka basah dan kompres bengkak/nanah',
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

export const INITIAL_VISITS: VisitRecord[] = [
  {
    id: 'vis-1',
    timestamp: getDateOffset(0).timestamp,
    date: getDateOffset(0).date,
    time: '08:15',
    visitorName: 'Ahmad Faiz Pratama',
    role: 'siswa',
    classOrPosition: 'XI-2',
    gender: 'L',
    complaint: 'Pusing dan lemas setelah upacara bendera',
    actionTaken: 'Istirahat di kasur UKS, diberi teh hangat manis, dioles minyak kayu putih',
    needsMedicine: true,
    medicinesGiven: [
      {
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        quantity: 1,
        unit: 'Tablet',
        dosageNotes: '1 tablet sesudah minum teh hangat'
      }
    ],
    notes: 'Kondisi berangsur membaik setelah istirahat 30 menit',
    finalStatus: 'Kembali ke Kelas / Mengajar',
    temperature: '36.7',
    bedNumber: 'Ranjang 1'
  },
  {
    id: 'vis-2',
    timestamp: getDateOffset(0).timestamp,
    date: getDateOffset(0).date,
    time: '09:40',
    visitorName: 'Dra. Endang Purwanti',
    role: 'guru',
    classOrPosition: 'Guru Bahasa Indonesia',
    gender: 'P',
    complaint: 'Perut perih mendadak akibat telat sarapan (Gejala Maag)',
    actionTaken: 'Diberi minum air hangat dan obat antasida kunyah',
    needsMedicine: true,
    medicinesGiven: [
      {
        medicineId: 'med-2',
        medicineName: 'Antasida Doen',
        quantity: 1,
        unit: 'Tablet Kunyah',
        dosageNotes: '1 tablet dikunyah langsung'
      }
    ],
    notes: 'Istirahat di ruang UKS selama 15 menit',
    finalStatus: 'Kembali ke Kelas / Mengajar',
    bloodPressure: '120/80',
    bedNumber: 'Ranjang 2'
  },
  {
    id: 'vis-3',
    timestamp: getDateOffset(0).timestamp,
    date: getDateOffset(0).date,
    time: '11:05',
    visitorName: 'Muhammad Rizky Ramadhan',
    role: 'siswa',
    classOrPosition: 'X-5',
    gender: 'L',
    complaint: 'Lutut lecet dan siku berdarah saat bermain basket jam olahraga',
    actionTaken: 'Pembersihan luka dengan Rivanol, pemberian Betadine dan plester luka',
    needsMedicine: true,
    medicinesGiven: [
      {
        medicineId: 'med-9',
        medicineName: 'Hansaplast / Plester Luka Elastis',
        quantity: 2,
        unit: 'Pcs',
        dosageNotes: 'Ganti plester bila basah'
      }
    ],
    notes: 'Luka telah dibersihkan dan diplester steril',
    finalStatus: 'Kembali ke Kelas / Mengajar'
  },
  {
    id: 'vis-4',
    timestamp: getDateOffset(1).timestamp,
    date: getDateOffset(1).date,
    time: '10:20',
    visitorName: 'Siti Nur Aisyah',
    role: 'siswa',
    classOrPosition: 'XII-1',
    gender: 'P',
    complaint: 'Kram perut hebat hari pertama menstruasi (dismenore) & pucat',
    actionTaken: 'Kompres hangat di perut bawah, istirahat berbaring, diberi suplemen penambah darah',
    needsMedicine: true,
    medicinesGiven: [
      {
        medicineId: 'med-12',
        medicineName: 'Sangobion Kapsul',
        quantity: 1,
        unit: 'Kapsul',
        dosageNotes: '1 kapsul setelah makan'
      }
    ],
    notes: 'Istirahat selama 1 jam pelajaran sampai kram mereda',
    finalStatus: 'Kembali ke Kelas / Mengajar',
    bedNumber: 'Ranjang 3'
  },
  {
    id: 'vis-5',
    timestamp: getDateOffset(2).timestamp,
    date: getDateOffset(2).date,
    time: '13:10',
    visitorName: 'Bambang Irawan, S.Pd',
    role: 'guru',
    classOrPosition: 'Guru PJOK / Olahraga',
    gender: 'L',
    complaint: 'Otot betis kram dan pegal setelah memimpin lari jarak jauh',
    actionTaken: 'Pemijatan ringan dengan salep pereda nyeri Counterpain',
    needsMedicine: true,
    medicinesGiven: [
      {
        medicineId: 'med-8',
        medicineName: 'Counterpain Salep 15g',
        quantity: 1,
        unit: 'Tube',
        dosageNotes: 'Oleskan tipis pada bagian yang kram'
      }
    ],
    notes: 'Kram reda setelah 15 menit',
    finalStatus: 'Kembali ke Kelas / Mengajar'
  },
  {
    id: 'vis-6',
    timestamp: getDateOffset(3).timestamp,
    date: getDateOffset(3).date,
    time: '08:50',
    visitorName: 'Dewi Sartika Putri',
    role: 'siswa',
    classOrPosition: 'X-2',
    gender: 'P',
    complaint: 'Demam tinggi mendadak (suhu 38.8 C), menggigil dan mual',
    actionTaken: 'Pengukuran suhu digital, kompres dahi, orang tua dihubungi pihak sekolah',
    needsMedicine: true,
    medicinesGiven: [
      {
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        quantity: 1,
        unit: 'Tablet',
        dosageNotes: 'Penurun panas darurat'
      }
    ],
    notes: 'Orang tua datang menjemput ke UKS pukul 09:30',
    finalStatus: 'Izin Pulang / Dijemput',
    temperature: '38.8',
    bedNumber: 'Ranjang 1'
  }
];

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
