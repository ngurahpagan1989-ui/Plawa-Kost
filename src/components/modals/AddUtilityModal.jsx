import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Zap, Calculator, AlertCircle, CheckCircle } from 'lucide-react';

export default function AddUtilityModal({ isOpen, onClose, bill, onSuccess }) {
  const [prevMeter, setPrevMeter] = useState(0);
  const [currMeter, setCurrMeter] = useState(0);
  const [ratePerUnit, setRatePerUnit] = useState(2500); // Standar Rp 2.500 / kWh
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (bill) {
      // Coba ekstrak meteran lama dari catatan jika ada
      setPrevMeter(0);
      setCurrMeter(0);
      setRatePerUnit(2500);
      setErrorMsg('');
    }
  }, [bill, isOpen]);

  if (!isOpen || !bill) return null;

  const usage = Math.max(0, Number(currMeter) - Number(prevMeter));
  const totalUtilityCost = usage * Number(ratePerUnit);
  const rentAmount = Number(bill.rent_amount || 0);
  const newTotalBill = rentAmount + totalUtilityCost;

  async function handleSave(e) {
    e.preventDefault();
    if (currMeter < prevMeter) {
      setErrorMsg('Angka meteran akhir tidak boleh lebih kecil dari meteran awal.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const utilityNotes = `Listrik: (${currMeter} - ${prevMeter}) = ${usage} kWh @ Rp ${Number(ratePerUnit).toLocaleString('id-ID')}`;
      const combinedNotes = bill.notes ? `${bill.notes} | ${utilityNotes}` : utilityNotes;

      const { error } = await supabase
        .from('bills')
        .update({
          utility_cost: totalUtilityCost,
          total_amount: newTotalBill,
          notes: combinedNotes,
        })
        .eq('id', bill.id);

      if (error) throw error;

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Gagal menyimpan biaya utilitas:', err);
      setErrorMsg(err.message || 'Gagal memperbarui tagihan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kalkulator Utilitas Listrik</h3>
              <p className="text-xs text-slate-500">
                Kamar {bill.rooms?.room_number || '-'} — {bill.tenants?.full_name || 'Penghuni'}
              </p>
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

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Meter Awal (kWh)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={prevMeter}
                onChange={(e) => setPrevMeter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Meter Akhir (kWh)</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={currMeter}
                onChange={(e) => setCurrMeter(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                placeholder="35"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tarif per kWh (Rp)</label>
            <input
              type="number"
              min="0"
              step="100"
              required
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
              placeholder="2500"
            />
          </div>

          {/* Kalkulasi Otomatis Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Pemakaian Listrik:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {usage} kWh
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Biaya Tambahan Utilitas:</span>
              <span className="font-semibold text-amber-700">
                + Rp {totalUtilityCost.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>Sewa Pokok Kamar:</span>
              <span>Rp {rentAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Total Tagihan Baru:</span>
              <span className="text-sm font-extrabold text-blue-700">
                Rp {newTotalBill.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Menghitung...' : 'Terapkan ke Tagihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
