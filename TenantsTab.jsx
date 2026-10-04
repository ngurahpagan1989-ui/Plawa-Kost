import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AddTenantModal from '../modals/AddTenantModal';

export default function TenantsTab() {
  const [tenants, setTenants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    const { data } = await supabase
      .from('tenants')
      .select('*, rooms(room_number, monthly_price)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setTenants(data);
  }

  async function handleCheckout(tenant) {
    if (!confirm(`Konfirmasi checkout untuk ${tenant.full_name}? Kamar akan kembali berstatus kosong.`)) return;

    // Nonaktifkan tenant & kosongkan kamar
    await supabase.from('tenants').update({ is_active: false }).eq('id', tenant.id);
    if (tenant.room_id) {
      await supabase.from('rooms').update({ status: 'empty' }).eq('id', tenant.room_id);
    }
    fetchTenants();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penyewa Aktif</h2>
          <p className="text-xs text-slate-500">Total {tenants.length} penghuni terdaftar</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm"
        >
          + Check-in Penyewa
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase">
              <tr>
                <th className="px-6 py-3">Kamar</th>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Kontak</th>
                <th className="px-6 py-3">Tgl Masuk</th>
                <th className="px-6 py-3">Jatuh Tempo</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-900">{t.rooms?.room_number || '-'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{t.full_name}</td>
                  <td className="px-6 py-4">{t.phone}</td>
                  <td className="px-6 py-4">{t.entry_date}</td>
                  <td className="px-6 py-4">Tiap tgl {t.due_day}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleCheckout(t)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                    >
                      Checkout
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">Belum ada penyewa aktif.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  );
}
