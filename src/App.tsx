import React, { useState, useEffect, useRef } from 'react';
import { UksProvider, useUks } from './context/UksContext';
import { Navbar } from './components/Navbar';
import { AdminSidebar } from './components/AdminSidebar';
import { GuestBookForm } from './components/GuestBookForm';
import { AdminDashboard } from './components/AdminDashboard';
import { MedicineInventory } from './components/MedicineInventory';
import { ReportsView } from './components/ReportsView';
import { UserManagement } from './components/UserManagement';
import { AdminLoginView } from './components/AdminLoginView';
import { LowStockAlertModal } from './components/LowStockAlertModal';
import { Toast } from './components/Toast';
import {
  HeartPulse,
  Phone,
  Mail,
  Menu,
  Clock,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sparkles
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    navigateToTab,
    isAdminLoggedIn,
    adminUser,
    schoolInfo,
    logoutAdmin,
    lowStockMedicines,
    setPendingTab,
    showToast
  } = useUks();

  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [targetRestockId, setTargetRestockId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminTime, setAdminTime] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setAdminTime(
        new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenRestock = (medicineId?: string) => {
    if (medicineId) {
      setTargetRestockId(medicineId);
    }

    if (!isAdminLoggedIn) {
      setPendingTab('inventory');
      setActiveTab('login');
      showToast('Silakan login sebagai Admin UKS untuk restock obat.', 'warning');
      return;
    }
    setActiveTab('inventory');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard UKS', category: 'Ringkasan Sistem' };
      case 'inventory':
        return { title: 'Inventaris Obat & Farmasi', category: 'Pengelolaan Farmasi' };
      case 'reports':
      case 'reports_visits':
        return { title: 'Laporan Rekap Kunjungan', category: 'Laporan UKS' };
      case 'reports_medicines':
        return { title: 'Laporan Rekap Obat & Stok', category: 'Laporan UKS' };
      case 'users':
        return { title: 'Manajemen Pengguna & Otoritas', category: 'Pengaturan Admin' };
      case 'guestbook':
        return { title: 'Formulir Buku Kontrol Pengunjung', category: 'Layanan Pengunjung' };
      case 'login':
        return { title: 'Autentikasi Petugas UKS', category: 'Keamanan' };
      default:
        return { title: 'Panel Administrator UKS', category: 'Sistem' };
    }
  };

  const pageInfo = getPageTitle();

  // ==========================================
  // 1. ADMIN MODE: Material You Dual-Pane Layout
  // ==========================================
  if (isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex bg-[#FFFBFE] text-[#1C1B1F] font-sans antialiased relative selection:bg-[#E8DEF8] selection:text-[#1D192B]">
        {/* Ambient atmospheric shapes */}
        <div className="md3-ambient-blob-1 w-[40rem] h-[40rem] -top-32 -left-32" />
        <div className="md3-ambient-blob-2 w-[35rem] h-[35rem] top-1/2 -right-32" />

        {/* Left Navigation Sidebar */}
        <AdminSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenLowStockModal={() => setIsLowStockModalOpen(true)}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          {/* Top Admin Header Bar */}
          <header className="sticky top-0 z-30 bg-[#FFFBFE]/90 backdrop-blur-md border-b border-[#E7E0EC] px-4 sm:px-8 py-3.5 transition-all duration-300">
            <div className="flex items-center justify-between gap-4">

              {/* Left: Mobile Toggle & Breadcrumb Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  id="btn-admin-mobile-menu"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-full bg-[#E7E0EC] hover:bg-[#EDE7F2] text-[#1C1B1F] active:scale-95 transition cursor-pointer"
                  title="Buka Menu Samping"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#6750A4] uppercase tracking-wider truncate">
                    <span className="hidden sm:inline">UKS {schoolInfo.shortName || 'SMAN 1 BATU'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#79747E] hidden sm:inline" />
                    <span>{pageInfo.category}</span>
                  </div>
                  <h1 className="text-base sm:text-xl font-bold text-[#1C1B1F] truncate tracking-tight">
                    {pageInfo.title}
                  </h1>
                </div>
              </div>

              {/* Right: Actions, Live Time & Profile */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Live Clock Pill */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3EDF7] text-[#49454F] text-xs font-medium shadow-2xs" title="Waktu Sekarang">
                  <Clock className="w-4 h-4 text-[#6750A4]" />
                  <span>{adminTime}</span>
                </div>

                {/* Officer Profile Interactive Menu */}
                <div className="relative pl-3 border-l border-[#E7E0EC]" ref={profileMenuRef}>
                  <button
                    type="button"
                    id="btn-admin-profile-menu"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full hover:bg-[#F3EDF7] active:scale-95 transition cursor-pointer text-left select-none group"
                    title="Klik untuk melihat profil & logout"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#6750A4] group-hover:bg-[#6750A4]/90 text-white font-bold text-xs flex items-center justify-center shadow-xs transition">
                      {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-medium text-[#1C1B1F] truncate max-w-[140px]">
                        {adminUser?.name || 'Petugas UKS'}
                      </span>
                      <span className="text-[10px] text-[#6750A4] font-medium uppercase tracking-wider">
                        {adminUser?.role || 'Admin'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#79747E] transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180 text-[#6750A4]' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#F3EDF7] rounded-3xl border border-[#CAC4D0] p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 rounded-2xl bg-[#E8DEF8] mb-1">
                        <div className="text-[10px] font-medium text-[#49454F] uppercase tracking-wider">
                          Akun Petugas Aktif
                        </div>
                        <div className="font-bold text-xs text-[#1D192B] truncate mt-0.5" title={adminUser?.name}>
                          {adminUser?.name || 'Petugas UKS'}
                        </div>
                        <div className="text-[11px] text-[#6750A4] font-medium mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6750A4]"></span>
                          <span>{adminUser?.role || 'Admin'} • @{adminUser?.username || 'admin'}</span>
                        </div>
                      </div>

                      <div className="p-1">
                        <button
                          type="button"
                          id="btn-profile-dropdown-logout"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logoutAdmin();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-xs font-medium text-[#B3261E] hover:bg-[#F9DEDC] active:scale-95 transition cursor-pointer text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-[#F9DEDC] text-[#B3261E] flex items-center justify-center shrink-0">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">Logout / Keluar</div>
                            <div className="text-[10px] text-[#79747E] font-normal">Akhiri sesi login admin</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Admin Main Body View */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-transparent">
            {activeTab === 'dashboard' && <AdminDashboard onOpenRestockModal={handleOpenRestock} />}
            {activeTab === 'inventory' && (
              <MedicineInventory
                restockTargetId={targetRestockId}
                onClearRestockTarget={() => setTargetRestockId(null)}
              />
            )}
            {(activeTab === 'reports' || activeTab === 'reports_visits') && <ReportsView type="visits" />}
            {activeTab === 'reports_medicines' && <ReportsView type="medicines" />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'guestbook' && <GuestBookForm />}
          </main>
        </div>

        {/* Global Modals & Notifications */}
        <LowStockAlertModal
          isOpen={isLowStockModalOpen}
          onClose={() => setIsLowStockModalOpen(false)}
          onOpenRestock={(id) => handleOpenRestock(id)}
        />
        <Toast />
      </div>
    );
  }

  // ==========================================
  // 2. PUBLIC MODE (GUEST BOOK / LOGIN)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBFE] text-[#1C1B1F] font-sans antialiased relative selection:bg-[#E8DEF8] selection:text-[#1D192B]">
      {/* Ambient background glows */}
      <div className="md3-ambient-blob-1 w-[45rem] h-[45rem] -top-36 -left-36" />
      <div className="md3-ambient-blob-2 w-[40rem] h-[40rem] top-1/3 -right-36" />
      <div className="md3-ambient-blob-3 w-[50rem] h-[50rem] bottom-10 left-1/4" />

      {/* Public Navbar */}
      <Navbar onOpenLowStockModal={() => setIsLowStockModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {/* Public route */}
        {activeTab === 'guestbook' && <GuestBookForm />}

        {/* Dedicated Login View */}
        {activeTab === 'login' && <AdminLoginView />}

        {/* Fallback for protected routes if attempted without login */}
        {(activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'reports' || activeTab === 'reports_visits' || activeTab === 'reports_medicines' || activeTab === 'users') && (
          <AdminLoginView />
        )}
      </main>

      {/* Public Material You Footer */}
      <footer className="bg-[#1D192B] text-[#E8DEF8] mt-16 py-12 rounded-t-[36px] sm:rounded-t-[48px] border-t border-[#6750A4]/20 relative z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-[#31111D] rounded-2xl flex items-center justify-center shrink-0 border border-[#7D5260]/30 shadow-xs">
              <img
                src="/logo-sman1-batu.png"
                alt="Logo SMA Negeri 1 Batu"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight">{schoolInfo.name}</div>
              <div className="text-[#CAC4D0] text-xs mt-0.5">{schoolInfo.address}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#E8DEF8] font-medium">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#31111D] border border-[#7D5260]/20">
              <Phone className="w-3.5 h-3.5 text-[#FFD8E4]" />
              {schoolInfo.phone}
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#31111D] border border-[#7D5260]/20">
              <Mail className="w-3.5 h-3.5 text-[#FFD8E4]" />
              {schoolInfo.email}
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <LowStockAlertModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
        onOpenRestock={(id) => handleOpenRestock(id)}
      />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <UksProvider>
      <AppContent />
    </UksProvider>
  );
}
