import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  FileSpreadsheet, 
  Users, 
  ClipboardList, 
  LogOut, 
  HeartPulse, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  X,
  ExternalLink,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { useUks } from '../context/UksContext';
import { AppTab } from '../types';

interface AdminSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLowStockModal: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isOpenMobile, 
  onCloseMobile,
  onOpenLowStockModal 
}) => {
  const { 
    activeTab, 
    navigateToTab, 
    adminUser, 
    users, 
    schoolInfo,
    logoutAdmin, 
    lowStockMedicines,
    pendingVisits
  } = useUks();

  const totalAlerts = lowStockMedicines.length;

  const handleNav = (tab: AppTab) => {
    navigateToTab(tab);
    onCloseMobile();
  };

  const [isReportsOpen, setIsReportsOpen] = useState(true);

  const isReportsTabActive = activeTab === 'reports' || activeTab === 'reports_visits' || activeTab === 'reports_medicines';

  const navItems = [
    {
      id: 'dashboard' as AppTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Statistik & rekapitulasi pasien',
      badge: pendingVisits.length > 0 ? (
        <span className="bg-[#7D5260] text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-2xs">
          {pendingVisits.length} Verifikasi
        </span>
      ) : null
    },
    {
      id: 'inventory' as AppTab,
      label: 'Stok Obat & Farmasi',
      icon: Pill,
      description: 'Inventaris & restock obat',
      badge: totalAlerts > 0 ? (
        <span className="bg-[#B3261E] text-white text-[10px] font-medium px-2 py-0.5 rounded-full animate-pulse shadow-2xs">
          {totalAlerts} Kritis
        </span>
      ) : null
    }
  ];

  const reportSubItems = [
    {
      id: 'reports_visits' as AppTab,
      label: 'Rekap Pengunjung',
      icon: ClipboardList,
      description: 'Log riwayat kunjungan pasien'
    },
    {
      id: 'reports_medicines' as AppTab,
      label: 'Rekap Penggunaan Obat',
      icon: Pill,
      description: 'Pemakaian & sisa stok obat'
    }
  ];

  const otherNavItems = [
    {
      id: 'users' as AppTab,
      label: 'Manajemen Pengguna',
      icon: Users,
      description: 'Akun petugas & hak akses',
      badge: (
        <span className="bg-[#49454F] text-[#E8DEF8] text-[10px] font-medium px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      )
    },
    {
      id: 'guestbook' as AppTab,
      label: 'Buku Kontrol Pengunjung',
      icon: ClipboardList,
      description: 'Formulir kunjungan UKS',
      isPublic: true
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-[#1C1B1F]/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1D192B] text-[#E8DEF8] flex flex-col justify-between border-r border-[#6750A4]/20 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header & Brand */}
        <div>
          <div className="p-5 border-b border-[#49454F]/30 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav('dashboard')}>
              <div className="w-11 h-11 bg-[#E8DEF8] rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo-sman1-batu.png" 
                  alt="Logo SMA Negeri 1 Batu" 
                  className="w-8 h-8 object-contain shrink-0" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white uppercase">
                    UKS {schoolInfo.shortName || 'DIGITAL'}
                  </span>
                </div>
                <div className="text-[10px] font-medium text-[#EADDFF] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D0BCFF]"></span>
                  Admin Control Panel
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-[#CAC4D0] hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Card: MD3 Tonal Surface */}
          <div className="p-3.5 mx-3.5 my-3.5 bg-[#2B2930] rounded-2xl border border-[#49454F]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6750A4] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {adminUser?.name || 'Petugas UKS'}
                </div>
                <div className="text-[11px] text-[#D0BCFF] font-medium truncate">
                  {adminUser?.role || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#CAC4D0] font-mono">
                  @{adminUser?.username || 'admin'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="px-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
              Menu Utama Admin
            </div>

            {/* Main Nav (Dashboard & Stok Obat) */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`admin-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                    isActive 
                      ? 'bg-[#EADDFF] text-[#21005D] shadow-sm font-bold' 
                      : 'text-[#E8DEF8] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#21005D]' : 'text-[#CAC4D0]'}`} />
                    <div className="truncate">
                      <div className="leading-tight">{item.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#21005D]" />}
                  </div>
                </button>
              );
            })}

            {/* Laporan UKS Section */}
            <div className="pt-1.5">
              <button
                type="button"
                id="admin-nav-reports-parent"
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                  isReportsTabActive && !isReportsOpen
                    ? 'bg-[#EADDFF] text-[#21005D] font-bold'
                    : 'text-[#E8DEF8] hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className={`w-4 h-4 ${isReportsTabActive ? 'text-[#D0BCFF]' : 'text-[#CAC4D0]'}`} />
                  <span>Laporan UKS</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#CAC4D0] transition-transform duration-300 ${isReportsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isReportsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-[#49454F]/40 space-y-1 py-1">
                  {reportSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = (sub.id === 'reports_visits' && (activeTab === 'reports_visits' || activeTab === 'reports')) ||
                                        (sub.id === 'reports_medicines' && activeTab === 'reports_medicines');

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        id={`admin-nav-${sub.id}`}
                        onClick={() => handleNav(sub.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                          isSubActive
                            ? 'bg-[#EADDFF] text-[#21005D] font-bold shadow-xs'
                            : 'text-[#CAC4D0] hover:text-white hover:bg-white/10 font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-[#21005D]' : 'text-[#CAC4D0]'}`} />
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {isSubActive && <ChevronRight className="w-3 h-3 text-[#21005D] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other Nav Items (Users & Guestbook) */}
            {otherNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`admin-nav-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                    isActive 
                      ? 'bg-[#EADDFF] text-[#21005D] shadow-sm font-bold' 
                      : 'text-[#E8DEF8] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#21005D]' : 'text-[#CAC4D0]'}`} />
                    <div className="truncate">
                      <div className="leading-tight">{item.label}</div>
                      {item.isPublic && (
                        <span className="text-[10px] text-[#CAC4D0] font-normal">Halaman Publik</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#21005D]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Status & Logout */}
        <div className="p-4 border-t border-[#49454F]/30">
          <button
            type="button"
            id="btn-sidebar-logout"
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#31111D] hover:bg-[#B3261E] text-[#FFD8E4] hover:text-white text-xs font-medium uppercase tracking-wider active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout / Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
