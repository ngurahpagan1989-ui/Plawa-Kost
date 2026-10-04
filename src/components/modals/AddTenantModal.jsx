import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, Calendar, Phone, User, Home, AlertCircle } from 'lucide-react';

export default function AddTenantModal({ isOpen, onClose, onSuccess, preselectedRoomId = null }) {
  const [emptyRooms, setEmptyRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId || '');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDay, setDueDay] = useState(new Date().getDate());
  const [createInitialBill, setCreateInitialBill] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch kamar kosong setiap modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchEmptyRooms();
      if (preselectedRoomId) setSelectedRoomId(preselectedRoomId);
    }
  }, [isOpen, preselectedRoomId]);

  async function fetchEmptyRooms() {
    setErrorMsg('');
    const { data, error } = await supabase
      .from('rooms')
      .select('id, room_number, monthly_price')
      .eq('status', 'empty')
      .order('room_number', { ascending: true });

    if (error) {
      setErrorMsg('Gagal memuat kamar kosong: ' + error.message);
    } else {
      setEmptyRooms(data || []);
      if (!selectedRoomId && data && data.length > 0) {
        setSelectedRoomId(data[0].id);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedRoomId) {
      setErrorMsg('Silakan pilih kamar yang tersedia.');
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Nama lengkap dan nomor kontak wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const selectedRoom = emptyRooms.find((r) => r.id === selectedRoomId);
      const roomPrice = selectedRoom ? Number(selectedRoom.monthly_price) : 0;

      // 1. Insert penyewa baru ke tabel 'tenants'
      const { data: newTenant, error: tenantErr } = await supabase
        .from('tenants')
        .insert([
          {
            room_id: selectedRoomId,
            full_name: fullName.trim(),
            phone: phone.trim(),
            entry_date: entryDate,
            due_day: parseInt(dueDay, 10),
            is_active: true,
          },
        ])
        .select()
        .single();

      if (tenantErr) throw tenantErr;

      // 2. Ubah status kamar menjadi 'occupied'
      const { error: roomErr } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', selectedRoomId);

      if (roomErr) throw roomErr;

      // 3. Terbitkan tagihan sewa bulan pertama di tabel 'bills' jika diaktifkan
      if (createInitialBill && newTenant) {
        const billingMonth = entryDate.slice(0, 7); // Format: YYYY-MM
        const { error: billErr } = await supabase
          .from('bills')
          .insert([
            {
              tenant_id: newTenant.id,
              room_id: selectedRoomId,
              billing_month: billingMonth,
              rent_amount: roomPrice,
              utility_cost: 0,
              total_amount: roomPrice,
              payment_status: 'unpaid',
              paid_at: null,
              notes: `Tagihan sewa bulan pertama saat check-in (${entryDate})`,
            },
          ]);

        if (billErr) console.warn('Peringatan saat menerbitkan tagihan pertama:', billErr);
      }

      // Reset form
      setFullName('');
      setPhone('');
      setSelectedRoomId('');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saat check-in penyewa:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses check-in.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Check-In Penyewa Baru</h3>
              <p className="text-xs text-slate-500">Pendaftaran penghuni kost dan penerbitan tagihan awal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Pemilihan Kamar */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              Pilih Kamar Kosong
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              required
            >
              <option value="">-- Pilih Kamar Tersedia --</option>
              {emptyRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  Kamar {room.room_number} — Rp {Number(room.monthly_price).toLocaleString('id-ID')} / bulan
                </option>
              ))}
            </select>
            {emptyRooms.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                ⚠️ Tidak ada kamar berstatus kosong saat ini. Kosongkan kamar terlebih dahulu.
              </p>
            )}
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Lengkap Penghuni
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: I Made Bagus Wira"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Kontak WhatsApp */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Nomor WhatsApp / HP
            </label>
            <input
              type="tel"
              required
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          {/* Grid Tanggal Masuk & Jatuh Tempo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Masuk
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Jatuh Tempo (Tanggal Tiap Bulan)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Opsi Terbitkan Tagihan Pertama */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={createInitialBill}
                onChange={(e) => setCreateInitialBill(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block">Otomatis Terbitkan Tagihan Bulan Pertama</span>
                <span className="text-slate-500">Mencatat tagihan 'Belum Bayar' pada tab Tagihan & Kas Masuk</span>
              </div>
            </label>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || emptyRooms.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Check-in Sekarang</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
