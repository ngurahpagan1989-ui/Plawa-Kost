import { Receipt, Share2, CheckCircle2, Copy, Send, Printer } from 'lucide-react';
import { useState } from 'react';

export default function InvoiceModal({ isOpen, onClose, bill }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !bill) return null;

  const tenantName = bill.tenants?.full_name || 'Penghuni';
  const tenantPhone = bill.tenants?.phone || '';
  const roomNumber = bill.rooms?.room_number || '-';
  const rentAmount = Number(bill.rent_amount || 0);
  const utilityCost = Number(bill.utility_cost || 0);
  const totalAmount = Number(bill.total_amount || 0);
  const isPaid = bill.payment_status === 'paid';
  const paidDate = bill.paid_at ? new Date(bill.paid_at).toLocaleDateString('id-ID') : '-';

  // Format pesan WhatsApp yang ramah dan profesional
  const waMessage = `*KUITANSI & TAGIHAN PLAWA KOST* 🏠\n` +
    `---------------------------------------\n` +
    `Kepada Yth: *${tenantName}*\n` +
    `Kamar: *No. ${roomNumber}*\n` +
    `Periode: *${bill.billing_month}*\n` +
    `---------------------------------------\n` +
    `• Biaya Sewa Pokok: Rp ${rentAmount.toLocaleString('id-ID')}\n` +
    `• Biaya Utilitas (Listrik): Rp ${utilityCost.toLocaleString('id-ID')}\n` +
    (bill.notes ? `  _(${bill.notes})_\n` : '') +
    `---------------------------------------\n` +
    `*TOTAL TAGIHAN: Rp ${totalAmount.toLocaleString('id-ID')}*\n` +
    `Status: *${isPaid ? '✅ LUNAS' : '⏳ BELUM DIBAYAR'}*\n` +
    (isPaid ? `Tanggal Bayar: ${paidDate}\n` : `Mohon transfer sebelum tanggal jatuh tempo.\n`) +
    `---------------------------------------\n` +
    `_Terima kasih telah menjadi bagian dari keluarga Plawa Kost!_ 🙏`;

  // Sanitasi nomor HP untuk wa.me (ubah 08xx jadi 628xx)
  let cleanPhone = tenantPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}` : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  function handleCopyText() {
    navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Rincian Tagihan & Kuitansi</h3>
              <p className="text-xs text-slate-500">Invoice sewa kamar Plawa Kost</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
            ✕
          </button>
        </div>

        {/* Invoice Preview Card */}
        <div className="mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-3 font-sans">
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Properti</span>
              <h4 className="text-base font-extrabold text-slate-900">Plawa Kost</h4>
              <p className="text-xs text-slate-500">Kamar {roomNumber} • {bill.billing_month}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
              </span>
              {isPaid && <p className="text-[10px] text-slate-400 mt-1">{paidDate}</p>}
            </div>
          </div>

          <div className="text-xs space-y-1 text-slate-600 py-1">
            <div className="flex justify-between">
              <span>Penyewa:</span>
              <span className="font-semibold text-slate-900">{tenantName}</span>
            </div>
            <div className="flex justify-between">
              <span>No. WhatsApp:</span>
              <span className="font-mono text-slate-800">{tenantPhone || '-'}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>Sewa Kamar Pokok</span>
              <span>Rp {rentAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Biaya Utilitas (Listrik/Air)</span>
              <span>Rp {utilityCost.toLocaleString('id-ID')}</span>
            </div>
            {bill.notes && (
              <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                {bill.notes}
              </p>
            )}
            <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center font-extrabold text-sm text-slate-900">
              <span>Total Pembayaran</span>
              <span className="text-emerald-700 text-base">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium py-2.5 px-4 rounded-xl text-sm shadow-xs transition"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Invoice via WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 rounded-xl text-xs transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks Invoice'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 px-3 rounded-xl text-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Kuitansi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
