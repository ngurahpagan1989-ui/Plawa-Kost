import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RoomsTab() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*, tenants(full_name, phone)')
      .order('room_number', { ascending: true });

    if (!error) setRooms(data || []);
    setLoading(false);
  }

  const badgeColors = {
    empty: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    occupied: 'bg-blue-100 text-blue-800 border-blue-300',
    maintenance: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  if (loading) return <p className="text-slate-500">Memuat data kamar...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Daftar Kamar ({rooms.length})</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const tenant = room.tenants?.[0];
          return (
            <div key={room.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-2xl font-bold text-slate-900">{room.room_number}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${badgeColors[room.status]}`}>
                  {room.status === 'occupied' ? 'Terisi' : room.status === 'empty' ? 'Kosong' : 'Perbaikan'}
                </span>
              </div>

              <div className="text-sm text-slate-600">
                <p>Rp {Number(room.monthly_price).toLocaleString('id-ID')} / bulan</p>
                {tenant && (
                  <p className="mt-2 text-slate-900 font-medium">Penghuni: {tenant.full_name}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
