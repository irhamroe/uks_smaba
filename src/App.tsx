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
        return { title: 'Dashboard', category: 'Ringkasan Sistem' };
      case 'inventory':
        return { title: 'Manajemen Inventaris Stok Obat & Farmasi', category: 'Pengelolaan Farmasi' };
      case 'reports':
      case 'reports_visits':
        return { title: 'Laporan Rekap Kunjungan Pengunjung', category: 'Laporan UKS' };
      case 'reports_medicines':
        return { title: 'Laporan Rekap Penggunaan & Stok Obat', category: 'Laporan UKS' };
      case 'users':
        return { title: 'Manajemen Pengguna & Hak Akses', category: 'Pengaturan Admin' };
      case 'guestbook':
        return { title: 'Formulir Buku Kontrol Pengunjung UKS', category: 'Layanan Pengunjung' };
      case 'login':
        return { title: 'Autentikasi Petugas UKS', category: 'Keamanan' };
      default:
        return { title: 'Panel Administrator UKS', category: 'Sistem' };
    }
  };

  const pageInfo = getPageTitle();
  const totalAlerts = lowStockMedicines.length;

  // ==========================================
  // 1. ADMIN MODE: Dual-Pane Left Sidebar Layout
  // ==========================================
  if (isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex bg-gray-100 text-gray-900 font-sans antialiased">
        {/* Left Navigation Sidebar */}
        <AdminSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenLowStockModal={() => setIsLowStockModalOpen(true)}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Admin Header Bar */}
          <header className="sticky top-0 z-30 bg-white border-b-2 border-gray-200 px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between gap-4">

              {/* Left: Mobile Toggle & Breadcrumb Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  id="btn-admin-mobile-menu"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer"
                  title="Buka Menu Samping"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider truncate">
                    <span className="hidden sm:inline">UKS {schoolInfo.shortName || 'SMAN 1 BATU'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 hidden sm:inline" />
                    <span>{pageInfo.category}</span>
                  </div>
                  <h1 className="text-base sm:text-xl font-extrabold text-gray-900 truncate tracking-tight">
                    {pageInfo.title}
                  </h1>
                </div>
              </div>

              {/* Right: Actions, Live Time & Profile */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Live Clock */}
                <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-md bg-gray-100 text-gray-800 text-xs font-bold" title="Waktu Sekarang">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{adminTime}</span>
                </div>

                {/* Officer Profile Interactive Menu */}
                <div className="relative pl-3 border-l-2 border-gray-200" ref={profileMenuRef}>
                  <button
                    type="button"
                    id="btn-admin-profile-menu"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-100 transition cursor-pointer text-left select-none group"
                    title="Klik untuk melihat profil & logout"
                  >
                    <div className="w-8 h-8 rounded-md bg-blue-600 group-hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center transition">
                      {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-gray-900 truncate max-w-[140px]">
                        {adminUser?.name || 'Petugas UKS'}
                      </span>
                      <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider">
                        {adminUser?.role || 'Admin'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border-2 border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b-2 border-gray-100 bg-gray-50">
                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                          Akun Petugas Aktif
                        </div>
                        <div className="font-extrabold text-xs text-gray-900 truncate mt-0.5" title={adminUser?.name}>
                          {adminUser?.name || 'Petugas UKS'}
                        </div>
                        <div className="text-[11px] text-blue-600 font-bold mt-0.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>{adminUser?.role || 'Admin'} • @{adminUser?.username || 'admin'}</span>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          id="btn-profile-dropdown-logout"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logoutAdmin();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                        >
                          <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold">Logout / Keluar</div>
                            <div className="text-[10px] text-gray-500 font-normal">Akhiri sesi login admin</div>
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
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-gray-100">
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
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 font-sans antialiased">
      {/* Public Navbar */}
      <Navbar onOpenLowStockModal={() => setIsLowStockModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Public route */}
        {activeTab === 'guestbook' && <GuestBookForm />}

        {/* Dedicated Login View */}
        {activeTab === 'login' && <AdminLoginView />}

        {/* Fallback for protected routes if attempted without login */}
        {(activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'reports' || activeTab === 'reports_visits' || activeTab === 'reports_medicines' || activeTab === 'users') && (
          <AdminLoginView />
        )}
      </main>

      {/* Public Poster Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-10 border-t-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center shrink-0">
              <img
                src="/logo-sman1-batu.png"
                alt="Logo SMA Negeri 1 Batu"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm uppercase tracking-tight">{schoolInfo.name}</div>
              <div className="text-gray-400 text-xs mt-0.5">{schoolInfo.address}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-300 font-medium">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              {schoolInfo.phone}
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
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
