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
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sky-500/25',
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
      iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-rose-500/25',
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
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/25',
      description: 'Log riwayat kunjungan pasien'
    },
    {
      id: 'reports_medicines' as AppTab,
      label: 'Rekap Penggunaan Obat',
      icon: Pill,
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/25',
      description: 'Pemakaian & sisa stok obat'
    }
  ];

  const otherNavItems = [
    {
      id: 'users' as AppTab,
      label: 'Manajemen Pengguna',
      icon: Users,
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/25',
      description: 'Akun petugas & hak akses',
      badge: (
        <span className="bg-[#1E3A52] text-[#E0F2FE] text-[10px] font-medium px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      )
    },
    {
      id: 'guestbook' as AppTab,
      label: 'Buku Kontrol Pengunjung',
      icon: ClipboardList,
      iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-600 text-white shadow-teal-500/25',
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
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0C1E2E] text-[#E0F2FE] flex flex-col justify-between border-r border-[#0284C7]/20 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header & Brand */}
        <div>
          <div className="p-5 border-b border-[#1E3A52] flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNav('dashboard')}>
              <div className="w-11 h-11 bg-[#E0F2FE] rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
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
                <div className="text-[10px] font-medium text-[#BAE6FD] tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                  Admin Control Panel
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-[#94A3B8] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Card: MD3 Tonal Surface */}
          <div className="p-3.5 mx-3.5 my-3.5 bg-[#132A3E] rounded-2xl border border-[#1E3A52]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {adminUser?.name || 'Petugas UKS'}
                </div>
                <div className="text-[11px] text-[#BAE6FD] font-medium truncate">
                  {adminUser?.role || 'Administrator'}
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono">
                  @{adminUser?.username || 'admin'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="px-3 space-y-1.5">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#E0F2FE] to-white text-[#0C4A6E] shadow-sm font-bold border border-sky-200/50' 
                      : 'text-[#E0F2FE] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 ${item.iconBg} ${isActive ? 'scale-105' : 'opacity-90 group-hover:opacity-100'}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="truncate">
                      <div className="leading-tight font-semibold">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-sky-700' : 'text-[#94A3B8]'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0C4A6E]" />}
                  </div>
                </button>
              );
            })}

            {/* Laporan UKS Section */}
            <div className="pt-1">
              <button
                type="button"
                id="admin-nav-reports-parent"
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                  isReportsTabActive && !isReportsOpen
                    ? 'bg-gradient-to-r from-[#E0F2FE] to-white text-[#0C4A6E] font-bold border border-sky-200/50'
                    : 'text-[#E0F2FE] hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/25 shadow-xs flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold">Laporan UKS</span>
                    <div className="text-[10px] text-[#94A3B8]">Rekap & cetak data</div>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-300 ${isReportsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isReportsOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-[#1E3A52] space-y-1 py-1">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                          isSubActive
                            ? 'bg-gradient-to-r from-[#E0F2FE] to-white text-[#0C4A6E] font-bold shadow-xs border border-sky-200/50'
                            : 'text-[#94A3B8] hover:text-white hover:bg-white/10 font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${sub.iconBg}`}>
                            <SubIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="truncate font-medium">{sub.label}</span>
                        </div>
                        {isSubActive && <ChevronRight className="w-3 h-3 text-[#0C4A6E] shrink-0" />}
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium active:scale-95 transition-all duration-300 cursor-pointer text-left ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#E0F2FE] to-white text-[#0C4A6E] shadow-sm font-bold border border-sky-200/50' 
                      : 'text-[#E0F2FE] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 ${item.iconBg} ${isActive ? 'scale-105' : 'opacity-90'}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="truncate">
                      <div className="leading-tight font-semibold">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-sky-700' : 'text-[#94A3B8]'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0C4A6E]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Status & Logout */}
        <div className="p-4 border-t border-[#1E3A52]">
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
