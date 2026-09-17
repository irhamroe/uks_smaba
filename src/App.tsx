import React, { useState, useEffect } from 'react';
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
        return { title: 'Laporan Rekapitulasi & Arsip UKS', category: 'Laporan' };
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
      <div className="min-h-screen flex bg-slate-100/80 text-slate-800 font-sans antialiased">
        {/* Left Navigation Sidebar */}
        <AdminSidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenLowStockModal={() => setIsLowStockModalOpen(true)}
        />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Admin Header Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-4">

              {/* Left: Mobile Toggle & Breadcrumb Title */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  id="btn-admin-mobile-menu"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Buka Menu Samping"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 truncate">
                    <span className="hidden sm:inline">UKS {schoolInfo.shortName || 'SMAN 1 BATU'}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:inline" />
                    <span>{pageInfo.category}</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {pageInfo.title}
                  </h1>
                </div>
              </div>

              {/* Right: Actions, Live Time & Profile */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Live Clock */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-medium" title="Waktu Sekarang">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">{adminTime}</span>
                </div>

                {/* Quick Profile Badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                      {adminUser?.name || 'Petugas UKS'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {adminUser?.role || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Admin Main Body View */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {activeTab === 'dashboard' && <AdminDashboard onOpenRestockModal={handleOpenRestock} />}
            {activeTab === 'inventory' && (
              <MedicineInventory
                restockTargetId={targetRestockId}
                onClearRestockTarget={() => setTargetRestockId(null)}
              />
            )}
            {activeTab === 'reports' && <ReportsView />}
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
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800 font-sans antialiased">
      {/* Public Navbar */}
      <Navbar onOpenLowStockModal={() => setIsLowStockModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Public route */}
        {activeTab === 'guestbook' && <GuestBookForm />}

        {/* Dedicated Login View */}
        {activeTab === 'login' && <AdminLoginView />}

        {/* Fallback for protected routes if attempted without login */}
        {(activeTab === 'dashboard' || activeTab === 'inventory' || activeTab === 'reports' || activeTab === 'users') && (
          <AdminLoginView />
        )}
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <img
              src="/logo-sman1-batu.png"
              alt="Logo SMA Negeri 1 Batu"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">{schoolInfo.name}</div>
              <div className="text-slate-500 text-[11px]">{schoolInfo.address}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {schoolInfo.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
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
