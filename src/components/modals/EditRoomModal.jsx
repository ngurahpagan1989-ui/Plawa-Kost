import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DoorOpen, AlertCircle, Wrench, CheckCircle, Home } from 'lucide-react';

export default function EditRoomModal({ isOpen, onClose, room, onSuccess }) {
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('empty');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (room) {
      setPrice(room.monthly_price || '');
      setStatus(room.status || 'empty');
      setErrorMsg('');
    }
  }, [room, isOpen]);

  if (!isOpen || !room) return null;

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          monthly_price: Number(price),
          status: status,
        })
        .eq('id', room.id);

      if (error) throw error;
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengubah data kamar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kelola Kamar {room.room_number}</h3>
              <p className="text-xs text-slate-500">Sesuaikan tarif sewa dan status kamar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tarif Sewa Bulanan (Rp)</label>
            <input
              type="number"
              min="0"
              step="50000"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Status Kamar</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={room.tenants && room.tenants.length > 0}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition disabled:opacity-60"
            >
              <option value="empty">Kosong (Tersedia untuk disewa)</option>
              <option value="occupied">Terisi (Sedang dihuni)</option>
              <option value="maintenance">Perbaikan (Renovasi / Maintenance)</option>
            </select>
            {room.tenants && room.tenants.length > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                ℹ️ Kamar sedang dihuni ({room.tenants[0]?.full_name}). Untuk mengosongkan kamar, lakukan checkout di tab Penyewa.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
