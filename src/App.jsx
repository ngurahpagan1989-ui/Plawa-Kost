import { useState } from 'react';
import Navbar from './components/Navbar';
import RoomsTab from './components/tabs/RoomsTab';
import TenantsTab from './components/tabs/TenantsTab';
import BillingTab from './components/tabs/BillingTab';
import ExpensesTab from './components/tabs/ExpensesTab';
import ConfigModal from './components/modals/ConfigModal';
import { Sparkles, Database, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header & Modular Tab Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'rooms' && (
          <RoomsTab onNavigateToTenants={() => setActiveTab('tenants')} />
        )}
        {activeTab === 'tenants' && <TenantsTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Plawa Kost Management System</span>
            <span>•</span>
            <span>Sistem Pengelolaan Properti Kost Modern</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-blue-600 transition underline underline-offset-2"
            >
              Setup Supabase SQL
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Ditenagai oleh React + Tailwind + Supabase
            </span>
          </div>
        </div>
      </footer>

      {/* Modal Pengaturan Supabase */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}
