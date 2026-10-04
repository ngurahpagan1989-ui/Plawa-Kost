import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Building2, 
  DoorOpen, 
  UserCheck, 
  Wrench, 
  Sparkles, 
  Plus, 
  Phone, 
  Calendar, 
  Edit3, 
  TrendingUp, 
  CheckCircle2, 
  Search,
  Filter
} from 'lucide-react';
import AddTenantModal from '../modals/AddTenantModal';
import EditRoomModal from '../modals/EditRoomModal';

export default function RoomsTab({ onNavigateToTenants }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInRoomId, setCheckInRoomId] = useState(null);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [selectedRoomToEdit, setSelectedRoomToEdit] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*, tenants(id, full_name, phone, entry_date, is_active)')
        .order('room_number', { ascending: true });

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        setRooms(data || []);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Statistik Ringkasan Kamar
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const emptyRooms = rooms.filter((r) => r.status === 'empty').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Filter List Kamar
  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const tenantName = room.tenants?.[0]?.full_name || '';
    const matchesSearch = 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const badgeConfig = {
    empty: {
      label: 'Kosong',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
      dotColor: 'bg-emerald-500',
    },
    occupied: {
      label: 'Terisi',
      className: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
      dotColor: 'bg-blue-500',
    },
    maintenance: {
      label: 'Perbaikan',
      className: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
      dotColor: 'bg-amber-500',
    },
  };

  function handleOpenCheckIn(roomId) {
    setCheckInRoomId(roomId);
    setIsCheckInOpen(true);
  }

  function handleOpenEditRoom(room) {
    setSelectedRoomToEdit(room);
    setIsEditRoomOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Okupansi & Statistik Denah Kamar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Kamar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Kamar</p>
            <p className="text-xl font-bold text-slate-900">{totalRooms}</p>
          </div>
        </div>

        {/* Terisi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Kamar Terisi</p>
            <p className="text-xl font-bold text-blue-600">{occupiedRooms}</p>
          </div>
        </div>

        {/* Kosong */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DoorOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Kamar Kosong</p>
            <p className="text-xl font-bold text-emerald-600">{emptyRooms}</p>
          </div>
        </div>

        {/* Perbaikan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Perbaikan</p>
            <p className="text-xl font-bold text-amber-600">{maintenanceRooms}</p>
          </div>
        </div>

        {/* Okupansi Rate */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-300 font-medium">Tingkat Okupansi</p>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight text-white">{occupancyRate}%</span>
              <span className="text-[11px] text-slate-300">{occupiedRooms} dari {totalRooms} unit</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Filter Navigasi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor kamar atau nama penghuni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Kamar' },
            { id: 'occupied', label: `Terisi (${occupiedRooms})` },
            { id: 'empty', label: `Kosong (${emptyRooms})` },
            { id: 'maintenance', label: `Perbaikan (${maintenanceRooms})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid Denah Kamar Kost */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Memuat denah kamar Plawa Kost...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-6">
          <DoorOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak ada kamar ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada kamar yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          <button
            onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
            className="mt-4 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const activeTenant = room.tenants?.find((t) => t.is_active) || room.tenants?.[0];
            const badge = badgeConfig[room.status] || badgeConfig.empty;

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Header Kartu Kamar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit</span>
                      <h4 className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                        {room.room_number}
                      </h4>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Tarif Sewa */}
                  <div className="mt-3 pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Tarif Bulanan</p>
                    <p className="text-sm font-bold text-slate-900">
                      Rp {Number(room.monthly_price).toLocaleString('id-ID')}
                      <span className="text-xs font-normal text-slate-400"> / bulan</span>
                    </p>
                  </div>

                  {/* Informasi Penghuni */}
                  <div className="py-3 min-h-[72px]">
                    {room.status === 'occupied' && activeTenant ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-800">
                          <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-xs font-semibold truncate">{activeTenant.full_name}</span>
                        </div>
                        {activeTenant.phone && (
                          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <a
                              href={`https://wa.me/${activeTenant.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-emerald-600 font-mono hover:underline"
                            >
                              {activeTenant.phone}
                            </a>
                          </div>
                        )}
                        {activeTenant.entry_date && (
                          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span>Masuk: {activeTenant.entry_date}</span>
                          </div>
                        )}
                      </div>
                    ) : room.status === 'empty' ? (
                      <div className="flex flex-col items-center justify-center py-2 text-center text-slate-400">
                        <Sparkles className="w-5 h-5 text-emerald-500/60 mb-1" />
                        <p className="text-xs font-medium text-emerald-700">Kamar siap dihuni</p>
                        <p className="text-[10px] text-slate-400">Kondisi bersih & siap sewa</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-center text-amber-700/80">
                        <Wrench className="w-5 h-5 text-amber-500 mb-1" />
                        <p className="text-xs font-medium">Dalam perbaikan</p>
                        <p className="text-[10px] text-slate-400">Sedang dilakukan renovasi</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi Cepat per Kamar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditRoom(room)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition text-xs font-medium flex items-center gap-1"
                    title="Ubah tarif & status kamar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Atur</span>
                  </button>

                  {room.status === 'empty' ? (
                    <button
                      onClick={() => handleOpenCheckIn(room.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Check-In</span>
                    </button>
                  ) : room.status === 'occupied' ? (
                    <button
                      onClick={() => onNavigateToTenants?.()}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                    >
                      Lihat Penyewa
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenEditRoom(room)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-medium transition"
                    >
                      Selesai Servis
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialogs */}
      <AddTenantModal
        isOpen={isCheckInOpen}
        onClose={() => {
          setIsCheckInOpen(false);
          setCheckInRoomId(null);
        }}
        preselectedRoomId={checkInRoomId}
        onSuccess={fetchRooms}
      />

      <EditRoomModal
        isOpen={isEditRoomOpen}
        onClose={() => {
          setIsEditRoomOpen(false);
          setSelectedRoomToEdit(null);
        }}
        room={selectedRoomToEdit}
        onSuccess={fetchRooms}
      />
    </div>
  );
}
