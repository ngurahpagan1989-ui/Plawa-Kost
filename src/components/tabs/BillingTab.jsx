import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Send, 
  DollarSign, 
  Calendar, 
  FileText, 
  Search, 
  AlertCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import AddUtilityModal from '../modals/AddUtilityModal';
import InvoiceModal from '../modals/InvoiceModal';

export default function BillingTab() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unpaid', 'paid'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals state
  const [selectedBillForUtility, setSelectedBillForUtility] = useState(null);
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*, tenants(id, full_name, phone), rooms(id, room_number)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bills:', error);
      } else {
        setBills(data || []);
      }
    } catch (err) {
      console.error('Fetch bills error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Aksi Tandai Lunas 1-klik
  async function markAsPaid(billId) {
    setActionLoadingId(billId);
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', billId);

      if (error) throw error;
      await fetchBills();
    } catch (err) {
      alert(`Gagal menandai lunas: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Aksi Kembalikan ke Belum Bayar jika perlu koreksi
  async function markAsUnpaid(billId) {
    if (!confirm('Kembalikan status tagihan ini menjadi Belum Bayar?')) return;
    setActionLoadingId(billId);
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          payment_status: 'unpaid',
          paid_at: null,
        })
        .eq('id', billId);

      if (error) throw error;
      await fetchBills();
    } catch (err) {
      alert(`Gagal memperbarui status: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Perhitungan Ringkasan Kas Masuk & Piutang
  const totalBillsCount = bills.length;
  const paidBills = bills.filter((b) => b.payment_status === 'paid');
  const unpaidBills = bills.filter((b) => b.payment_status === 'unpaid');

  const totalRevenueCollected = paidBills.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const totalUnpaidPending = unpaidBills.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
  const totalInvoiced = totalRevenueCollected + totalUnpaidPending;

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.payment_status === statusFilter;
    const tenantName = b.tenants?.full_name || '';
    const roomNumber = b.rooms?.room_number || '';
    const matchesSearch = 
      tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.billing_month?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  function handleOpenUtility(bill) {
    setSelectedBillForUtility(bill);
    setIsUtilityModalOpen(true);
  }

  function handleOpenInvoice(bill) {
    setSelectedBillForInvoice(bill);
    setIsInvoiceModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Kas Masuk & Tagihan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Kas Masuk (Lunas) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Kas Masuk (Lunas)</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              Rp {totalRevenueCollected.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{paidBills.length} tagihan telah dibayar</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Belum Bayar (Piutang) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Belum Bayar (Tertunda)</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              Rp {totalUnpaidPending.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{unpaidBills.length} tagihan menunggu pembayaran</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Keseluruhan */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-300 font-medium">Total Tagihan Diterbitkan</p>
            <p className="text-2xl font-extrabold text-white mt-1">
              Rp {totalInvoiced.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Total {totalBillsCount} transaksi</p>
          </div>
          <div className="p-3 bg-slate-800 text-blue-400 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Toolbar & Filter Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari penghuni, kamar, atau periode tagihan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `Semua (${totalBillsCount})` },
            { id: 'unpaid', label: `Belum Bayar (${unpaidBills.length})`, badge: 'text-amber-700' },
            { id: 'paid', label: `Lunas (${paidBills.length})`, badge: 'text-emerald-700' },
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

      {/* 3. Daftar Tagihan */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Memuat data tagihan kost...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-16 p-6">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada tagihan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada data tagihan yang sesuai dengan filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBills.map((bill) => {
              const isPaid = bill.payment_status === 'paid';
              const isActionLoading = actionLoadingId === bill.id;
              const rent = Number(bill.rent_amount || 0);
              const utility = Number(bill.utility_cost || 0);
              const total = Number(bill.total_amount || (rent + utility));

              return (
                <div
                  key={bill.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Info Kamar & Penyewa */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-slate-900 text-base">
                        Kamar {bill.rooms?.room_number || '-'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-800 text-sm">
                        {bill.tenants?.full_name || 'Penghuni'}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {bill.billing_month}
                      </span>
                    </div>

                    {/* Rincian Sewa + Utilitas */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Sewa: Rp {rent.toLocaleString('id-ID')}</span>
                      <span>+</span>
                      <span className={utility > 0 ? 'text-amber-700 font-semibold' : ''}>
                        Utilitas (Listrik): Rp {utility.toLocaleString('id-ID')}
                      </span>
                      {bill.notes && (
                        <span className="text-[11px] text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded italic">
                          {bill.notes}
                        </span>
                      )}
                    </div>

                    {isPaid && bill.paid_at && (
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dibayar pada: {new Date(bill.paid_at).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>

                  {/* Nominal Total & Status */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Total Tagihan</p>
                      <p className="text-lg font-black text-slate-900">
                        Rp {total.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="mt-1">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          LUNAS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          BELUM BAYAR
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 justify-end">
                    {/* Tombol Input Utilitas Listrik */}
                    <button
                      onClick={() => handleOpenUtility(bill)}
                      className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-1.5"
                      title="Hitung meteran listrik"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Kalkulator Listrik</span>
                    </button>

                    {/* Tombol Invoice WhatsApp */}
                    <button
                      onClick={() => handleOpenInvoice(bill)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                      title="Lihat kuitansi & kirim WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Kuitansi / WA</span>
                    </button>

                    {/* Tombol Tandai Lunas / Batal */}
                    {isPaid ? (
                      <button
                        onClick={() => markAsUnpaid(bill.id)}
                        disabled={isActionLoading}
                        className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                        title="Ubah kembali menjadi belum bayar"
                      >
                        Batal Lunas
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsPaid(bill.id)}
                        disabled={isActionLoading}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Tandai Lunas</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUtilityModal
        isOpen={isUtilityModalOpen}
        onClose={() => {
          setIsUtilityModalOpen(false);
          setSelectedBillForUtility(null);
        }}
        bill={selectedBillForUtility}
        onSuccess={fetchBills}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedBillForInvoice(null);
        }}
        bill={selectedBillForInvoice}
      />
    </div>
  );
}
