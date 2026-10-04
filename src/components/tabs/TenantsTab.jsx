import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  UserPlus, 
  Phone, 
  MessageCircle, 
  Calendar, 
  LogOut, 
  Search, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  Home
} from 'lucide-react';
import AddTenantModal from '../modals/AddTenantModal';

export default function TenantsTab() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, rooms(id, room_number, monthly_price)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tenants:', error);
      } else {
        setTenants(data || []);
      }
    } catch (err) {
      console.error('Fetch tenants error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Logika Checkout Penyewa:
  // 1. Set tenant is_active = false
  // 2. Kembalikan status kamar room_id menjadi 'empty'
  async function handleCheckout(tenant) {
    const confirmMessage = `Apakah Anda yakin ingin melakukan Checkout untuk penyewa:\n\n` +
      `Nama: ${tenant.full_name}\n` +
      `Kamar: No. ${tenant.rooms?.room_number || '-'}\n\n` +
      `Status kamar akan otomatis dikembalikan menjadi KOSONG.`;

    if (!window.confirm(confirmMessage)) return;

    setActionLoadingId(tenant.id);
    try {
      // Nonaktifkan penyewa
      const { error: tenantErr } = await supabase
        .from('tenants')
        .update({ is_active: false })
        .eq('id', tenant.id);

      if (tenantErr) throw tenantErr;

      // Kembalikan status kamar menjadi 'empty'
      if (tenant.room_id) {
        const { error: roomErr } = await supabase
          .from('rooms')
          .update({ status: 'empty' })
          .eq('id', tenant.room_id);

        if (roomErr) throw roomErr;
      }

      await fetchTenants();
    } catch (err) {
      alert(`Gagal memproses checkout: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Format link WhatsApp langsung
  function getWhatsAppUrl(phone, tenantName, roomNumber) {
    let clean = (phone || '').replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    const msg = encodeURIComponent(
      `Halo Kak ${tenantName} (Kamar ${roomNumber}), salam hangat dari pengelola Plawa Kost! 😊`
    );
    return clean ? `https://wa.me/${clean}?text=${msg}` : '#';
  }

  // Hitung status jatuh tempo bulan ini
  function getDueStatus(dueDay) {
    const today = new Date().getDate();
    const diff = dueDay - today;

    if (diff === 0) {
      return { text: 'Hari ini!', color: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' };
    } else if (diff > 0 && diff <= 3) {
      return { text: `${diff} hari lagi`, color: 'bg-amber-100 text-amber-800 border-amber-300' };
    } else if (diff < 0) {
      return { text: `Tiap tgl ${dueDay}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    } else {
      return { text: `Tiap tgl ${dueDay}`, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  }

  const filteredTenants = tenants.filter((t) => {
    const nameMatch = t.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const roomMatch = t.rooms?.room_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = t.phone?.includes(searchQuery);
    return nameMatch || roomMatch || phoneMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Daftar Penyewa Aktif</h2>
              <p className="text-xs text-slate-500">
                Total <span className="font-semibold text-slate-800">{tenants.length}</span> penghuni terdaftar saat ini di Plawa Kost
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCheckInOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Check-In Penyewa</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama penghuni, nomor kamar, atau no. telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Tabel Penyewa */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Memuat data penyewa...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="text-center py-16 p-6">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? 'Penyewa tidak ditemukan' : 'Belum ada penyewa aktif'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Tidak ada penyewa yang cocok dengan kata kunci pencarian Anda.'
                : 'Lakukan check-in penghuni baru untuk mengisi kamar kost yang kosong.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCheckInOpen(true)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Check-in Penghuni Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Kamar</th>
                  <th className="px-6 py-3.5">Nama Penghuni</th>
                  <th className="px-6 py-3.5">Kontak WhatsApp</th>
                  <th className="px-6 py-3.5">Tgl Masuk</th>
                  <th className="px-6 py-3.5">Jatuh Tempo</th>
                  <th className="px-6 py-3.5">Tarif Sewa</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTenants.map((t) => {
                  const roomNumber = t.rooms?.room_number || '-';
                  const roomPrice = t.rooms?.monthly_price ? Number(t.rooms.monthly_price) : 0;
                  const dueInfo = getDueStatus(t.due_day);
                  const waUrl = getWhatsAppUrl(t.phone, t.full_name, roomNumber);
                  const isActionLoading = actionLoadingId === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kamar */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                          <Home className="w-3.5 h-3.5 text-blue-500" />
                          Kamar {roomNumber}
                        </span>
                      </td>

                      {/* Nama Lengkap */}
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        {t.full_name}
                      </td>

                      {/* Kontak WhatsApp */}
                      <td className="px-6 py-4">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-mono hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{t.phone}</span>
                        </a>
                      </td>

                      {/* Tanggal Masuk */}
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.entry_date}</span>
                        </div>
                      </td>

                      {/* Jatuh Tempo */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] ${dueInfo.color}`}>
                          <Clock className="w-3 h-3" />
                          {dueInfo.text}
                        </span>
                      </td>

                      {/* Tarif Sewa */}
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        Rp {roomPrice.toLocaleString('id-ID')}
                        <span className="text-[10px] text-slate-400 font-normal"> / bln</span>
                      </td>

                      {/* Aksi Checkout */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCheckout(t)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold transition hover:shadow-2xs disabled:opacity-50"
                          title="Nonaktifkan penyewa dan kosongkan kamar"
                        >
                          {isActionLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                          ) : (
                            <LogOut className="w-3.5 h-3.5" />
                          )}
                          <span>Checkout</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Check-In */}
      <AddTenantModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={fetchTenants}
      />
    </div>
  );
}
