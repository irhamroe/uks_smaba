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

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
        <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-xs">
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
        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
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
        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-gray-900 text-white flex flex-col justify-between border-r-2 border-gray-800 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Header & Brand */}
        <div>
          <div className="p-5 border-b-2 border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('dashboard')}>
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center shrink-0">
                <img 
                  src="/logo-sman1-batu.png" 
                  alt="Logo SMA Negeri 1 Batu" 
                  className="w-8 h-8 object-contain shrink-0" 
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white uppercase">
                    UKS {schoolInfo.shortName || 'DIGITAL'}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-sky-400 tracking-wider uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  Admin Control Panel
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin User Card: Solid Flat Block */}
          <div className="p-4 mx-3 my-3.5 bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {adminUser?.name || 'Petugas UKS'}
                </div>
                <div className="text-[11px] text-sky-300 font-semibold truncate">
                  {adminUser?.role || 'Administrator'}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  @{adminUser?.username || 'admin'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="px-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                    isActive 
                      ? 'bg-sky-500 text-white font-extrabold' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <div className="truncate">
                      <div className="leading-tight">{item.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}

            {/* Laporan UKS Section with 2 Dedicated Submenus */}
            <div className="pt-1.5">
              <button
                type="button"
                id="admin-nav-reports-parent"
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                  isReportsTabActive && !isReportsOpen
                    ? 'bg-sky-500 text-white font-extrabold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className={`w-4 h-4 ${isReportsTabActive ? 'text-sky-400' : 'text-gray-400'}`} />
                  <span className="font-bold">Laporan UKS</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isReportsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isReportsOpen && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-gray-800 space-y-1 py-1">
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs transition-all duration-150 cursor-pointer text-left ${
                          isSubActive
                            ? 'bg-sky-500 text-white font-extrabold'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800 font-semibold'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-gray-400'}`} />
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {isSubActive && <ChevronRight className="w-3 h-3 text-white shrink-0" />}
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
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer text-left ${
                    isActive 
                      ? 'bg-sky-500 text-white font-extrabold' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <div className="truncate">
                      <div className="leading-tight">{item.label}</div>
                      {item.isPublic && (
                        <span className="text-[10px] text-gray-400 font-normal">Halaman Publik</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Status & Logout */}
        <div className="p-4 border-t-2 border-gray-800">
          {/* Logout Button */}
          <button
            type="button"
            id="btn-sidebar-logout"
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-gray-800 hover:bg-rose-600 text-gray-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-102 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
