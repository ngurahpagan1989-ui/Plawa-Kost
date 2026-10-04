import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('wifi');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });
    if (data) setExpenses(data);
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!amount) return;

    await supabase.from('expenses').insert([{
      category,
      amount: parseFloat(amount),
      description,
      expense_date: new Date().toISOString().split('T')[0],
    }]);

    setAmount('');
    setDescription('');
    fetchExpenses();
  }

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Input Kas Keluar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
        <h3 className="text-base font-bold text-slate-900 mb-4">Catat Pengeluaran</h3>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
            >
              <option value="wifi">WiFi / Internet</option>
              <option value="sampah">Iuran Sampah / Lingkungan</option>
              <option value="listrik_umum">Token Listrik Bersama</option>
              <option value="perbaikan">Perbaikan & Tukang</option>
              <option value="lainnya">Lain-lain</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Nominal (Rp)</label>
            <input
              type="number"
              required
              placeholder="350000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Keterangan</label>
            <textarea
              rows="2"
              placeholder="Misal: Ganti kran kamar mandi #3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-xl text-sm transition"
          >
            Simpan Pengeluaran
          </button>
        </form>
      </div>

      {/* Riwayat Kas Keluar */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Riwayat Kas Keluar</h3>
          <span className="text-xs font-medium bg-rose-50 text-rose-700 px-3 py-1 rounded-full">
            Total: Rp {totalExpense.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
          {expenses.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-900 capitalize">{item.category.replace('_', ' ')}</p>
                <p className="text-xs text-slate-500">{item.description || '-'}</p>
                <span className="text-[10px] text-slate-400">{item.expense_date}</span>
              </div>
              <span className="text-sm font-bold text-rose-600">
                - Rp {Number(item.amount).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
          {expenses.length === 0 && (
            <p className="text-center py-8 text-sm text-slate-400">Belum ada pengeluaran tercatat.</p>
          )}
        </div>
      </div>
    </div>
  );
}
