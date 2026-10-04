import { 
  Building2, 
  DoorOpen, 
  Users, 
  Receipt, 
  TrendingDown, 
  Database, 
  Settings, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { getClientStatus } from '../lib/supabase';

export default function Navbar({ activeTab, setActiveTab, onOpenConfig }) {
  const status = getClientStatus();

  const navItems = [
    {
      id: 'rooms',
      label: 'Denah Kamar',
      icon: DoorOpen,
      badge: 'Rooms',
    },
    {
      id: 'tenants',
      label: 'Penyewa Aktif',
      icon: Users,
      badge: 'Tenants',
    },
    {
      id: 'billing',
      label: 'Tagihan & Kas Masuk',
      icon: Receipt,
      badge: 'Billing',
    },
    {
      id: 'expenses',
      label: 'Kas Pengeluaran',
      icon: TrendingDown,
      badge: 'Expenses',
    },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Baris Atas: Brand Identity & Status Koneksi */}
        <div className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/10">
                <Building2 className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-slate-900">Plawa Kost</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    PMS v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Property Management & Billing System</p>
              </div>
            </div>

            {/* Tombol status di mobile */}
            <div className="md:hidden">
              <button
                onClick={onOpenConfig}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                  status.isConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Status Supabase & Tombol Pengaturan di Desktop */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              status.isConfigured
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/80 border-amber-200 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${status.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>
                {status.isConfigured ? '🟢 Supabase Cloud Connected' : '🟡 Demo Mode (Local Storage)'}
              </span>
            </div>

            <button
              onClick={onOpenConfig}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200/80"
              title="Pengaturan Koneksi Supabase"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Koneksi Supabase</span>
            </button>
          </div>
        </div>

        {/* Baris Bawah: Navigasi Tab Menu Modular */}
        <nav className="flex space-x-1.5 py-2.5 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
