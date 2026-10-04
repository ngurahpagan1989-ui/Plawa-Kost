import { useState } from 'react';
import RoomsTab from './components/tabs/RoomsTab';
import TenantsTab from './components/tabs/TenantsTab';
import BillingTab from './components/tabs/BillingTab';
import ExpensesTab from './components/tabs/ExpensesTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('rooms');

  const tabs = [
    { id: 'rooms', label: 'Denah Kamar' },
    { id: 'tenants', label: 'Penyewa' },
    { id: 'billing', label: 'Tagihan & Bayar' },
    { id: 'expenses', label: 'Kas Pengeluaran' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Manajemen Kost</h1>
          
          {/* Navigation Bar */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Konten Tab Terpisah */}
      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'rooms' && <RoomsTab />}
        {activeTab === 'tenants' && <TenantsTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
      </main>
    </div>
  );
}
