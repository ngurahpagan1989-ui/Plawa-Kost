import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AddTenantModal({ isOpen, onClose, onSuccess }) {
  const [emptyRooms, setEmptyRooms] = useState([]);
  const [formData, setFormData] = useState({
    room_id: '',
    full_name: '',
    phone: '',
    entry_date: new Date().toISOString().split('T')[0],
    due_day: new Date().getDate(),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchEmptyRooms();
  }, [isOpen]);

  async function fetchEmptyRooms() {
    const { data } = await supabase
      .from('rooms')
      .select('id, room_number, monthly_price')
      .eq('status', 'empty')
      .order('room_number');
    setEmptyRooms(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.room_id) return alert('Pilih kamar terlebih dahulu');

    setLoading(true);
    const selectedRoom = emptyRooms.find((r) => r.id === formData.room_id);

    try {
      // 1. Tambah Penyewa
      const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert([{
          room_id: formData.room_id,
          full_name: formData.full_name,
          phone: formData.phone,
          entry_date: formData.entry_date,
          due_day: parseInt(formData.due_day),
        }])
        .select()
        .single();

      if (tenantErr) throw tenantErr;

      // 2. Update Status Kamar jadi 'occupied'
      const { error: roomErr } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', formData.room_id);

      if (roomErr) throw roomErr;

      // 3. Generate Tagihan Bulan Pertama
      const billingMonth = new Date(formData.entry_date);
      billingMonth.setDate(1); // Set tanggal 1 awal bulan

      const { error: billErr } = await supabase
        .from('bills')
        .insert([{
          tenant_id: tenant.id,
          room_id: formData.room_id,
          billing_month: billingMonth.toISOString().split('T')[0],
          rent_amount: selectedRoom.monthly_price,
          utility_cost: 0,
          payment_status: 'unpaid',
          notes: 'Tagihan sewa bulan pertama',
        }]);

      if (billErr) throw billErr;

      onSuccess();
      onClose();
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Check-in Penyewa Baru</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Pilih Kamar Kosong</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
              required
            >
              <option value="">-- Pilih Kamar --</option>
              {emptyRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Kamar {r.room_number} - Rp {Number(r.monthly_price).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Contoh: Made Bagus"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">No. WhatsApp / HP</label>
            <input
              type="tel"
              required
              placeholder="081234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tanggal Masuk</label>
              <input
                type="date"
                required
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Jatuh Tempo (Tgl)</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:bg-blue-300"
            >
              {loading ? 'Menyimpan...' : 'Simpan & Terbitkan Tagihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
