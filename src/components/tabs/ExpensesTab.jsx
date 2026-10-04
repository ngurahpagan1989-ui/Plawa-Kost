import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  PiggyBank, 
  Wifi, 
  Trash2, 
  Zap, 
  Wrench, 
  MoreHorizontal, 
  Plus, 
  Calendar, 
  TrendingDown, 
  Receipt, 
  CheckCircle,
  AlertCircle,
  Filter,
  Trash
} from 'lucide-react';

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('wifi');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');
  const [billsPaidTotal, setBillsPaidTotal] = useState(0);

  useEffect(() => {
    fetchExpenses();
    fetchPaidBillsTotal();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
      } else {
        setExpenses(data || []);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Hitung total kas masuk dari bills untuk kalkulasi Net Cashflow
  async function fetchPaidBillsTotal() {
    try {
      const { data } = await supabase
        .from('bills')
        .select('total_amount')
        .eq('payment_status', 'paid');
      
      if (data) {
        const sum = data.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
        setBillsPaidTotal(sum);
      }
    } catch (err) {
      console.error('Fetch paid bills error:', err);
    }
  }

  // Tambah Pengeluaran Baru
  async function handleAddExpense(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('expenses').insert([
        {
          category,
          amount: parseFloat(amount),
          expense_date: expenseDate,
          description: description.trim(),
        },
      ]);

      if (error) throw error;

      setAmount('');
      setDescription('');
      setCategory('wifi');
      await fetchExpenses();
    } catch (err) {
      alert(`Gagal menyimpan pengeluaran: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Hapus Catatan Pengeluaran
  async function handleDeleteExpense(id) {
    if (!confirm('Hapus catatan pengeluaran ini?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      await fetchExpenses();
    } catch (err) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  }

  // Kategori icon & styling
  const categoryConfig = {
    wifi: {
      label: 'WiFi / Internet',
      icon: Wifi,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    sampah: {
      label: 'Iuran Sampah & Banjar',
      icon: Trash2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    listrik_umum: {
      label: 'Listrik Fasilitas Umum / Pompa',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    perbaikan: {
      label: 'Perbaikan & Servis Bangunan',
      icon: Wrench,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    lainnya: {
      label: 'Lain-lain / Kebersihan',
      icon: MoreHorizontal,
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netCashflow = billsPaidTotal - totalExpense;

  // Breakdown per kategori
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  const filteredExpenses = expenses.filter((item) => {
    return selectedFilterCategory === 'all' || item.category === selectedFilterCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Kas & Arus Kas Bersih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Akumulasi Pengeluaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Akumulasi Pengeluaran</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              Rp {totalExpense.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{expenses.length} transaksi kas keluar</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Kas Masuk (Lunas) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pemasukan Sewa Terkumpul</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              Rp {billsPaidTotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Dari tagihan sewa berstatus lunas</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Arus Kas Bersih (Net Cashflow) */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300 font-medium">Arus Kas Bersih (Net Profit)</p>
            <p className={`text-2xl font-extrabold mt-1 ${netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netCashflow >= 0 ? '+' : ''}Rp {netCashflow.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pemasukan dikurangi pengeluaran</p>
          </div>
          <div className="p-3 bg-slate-800 text-blue-400 rounded-2xl">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Grid Konten: Form Kas Keluar & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom 1: Form Pencatatan Kas Keluar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Catat Kas Keluar</h3>
              <p className="text-xs text-slate-500">Pencatatan beban operasional Plawa Kost</p>
            </div>
          </div>

          <form onSubmit={handleAddExpense} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Kategori Pengeluaran</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              >
                <option value="wifi">WiFi / Internet Kost</option>
                <option value="sampah">Iuran Sampah & Lingkungan</option>
                <option value="listrik_umum">Token Listrik Bersama / Pompa Air</option>
                <option value="perbaikan">Perbaikan & Tukang Bangunan</option>
                <option value="lainnya">Lain-lain / Kebersihan Kost</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Nominal Kas Keluar (Rp)</label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                placeholder="Contoh: 350000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Keterangan / Catatan</label>
              <textarea
                rows="2"
                placeholder="Contoh: Ganti kran wastafel & selang air kamar 105"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Simpan Pengeluaran</span>
                </>
              )}
            </button>
          </form>

          {/* Breakdown Pengeluaran per Kategori */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Breakdown per Kategori</h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(categoryConfig).map(([key, item]) => {
                const subTotal = categoryTotals[key] || 0;
                const percentage = totalExpense > 0 ? Math.round((subTotal / totalExpense) * 100) : 0;
                return (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-slate-600 truncate max-w-[150px]">{item.label}</span>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">Rp {subTotal.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Kolom 2 & 3: Riwayat Kas Keluar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Kas Keluar</h3>
              <p className="text-xs text-slate-500">Daftar beban operasional yang telah dikeluarkan</p>
            </div>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedFilterCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua
              </button>
              {Object.entries(categoryConfig).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilterCategory(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedFilterCategory === key
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label.split('/')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Memuat riwayat pengeluaran...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-16 p-6">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum ada pengeluaran</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Belum ada transaksi kas keluar yang dicatat untuk kategori ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1">
              {filteredExpenses.map((item) => {
                const config = categoryConfig[item.category] || categoryConfig.lainnya;
                const IconComponent = config.icon;

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${config.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{config.label}</p>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.expense_date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.description || 'Tidak ada catatan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-extrabold text-rose-600">
                        - Rp {Number(item.amount).toLocaleString('id-ID')}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus pengeluaran"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
