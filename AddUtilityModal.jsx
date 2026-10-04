import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AddUtilityModal({ isOpen, onClose, bill, onSuccess }) {
  const [prevMeter, setPrevMeter] = useState(0);
  const [currMeter, setCurrMeter] = useState(0);
  const [ratePerUnit, setRatePerUnit] = useState(2500); // Misal Rp 2.500 / kWh
  const [loading, setLoading] = useState(false);

  if (!isOpen || !bill) return null;

  const usage = Math.max(0, currMeter - prevMeter);
  const totalCost = usage * ratePerUnit;

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('bills')
        .update({
          utility_cost: totalCost,
          notes: `Listrik: (${currMeter} - ${prevMeter}) = ${usage} kWh @ Rp ${ratePerUnit.toLocaleString('id-ID')}`,
        })
        .eq('id', bill.id);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err) {
      alert(`Gagal menyimpan utilitas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Input Meteran Listrik</h3>
        <p className="text-xs text-slate-500 mb-4">Kamar {bill.rooms?.room_number} - {bill.tenants?.full_name}</p>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Meter Awal</label>
              <input
                type="number"
                value={prevMeter}
                onChange={(e) => setPrevMeter(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Meter Akhir</label>
              <input
                type="number"
                value={currMeter}
                onChange={(e) => setCurrMeter(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Tarif per kWh (Rp)</label>
            <input
              type="number"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Pemakaian:</span>
              <span className="font-semibold">{usage} kWh</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t pt-1 border-slate-200">
              <span>Biaya Tambahan:</span>
              <span>Rp {totalCost.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {loading ? 'Menghitung...' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
