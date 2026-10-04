import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function BillingTab() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    const { data } = await supabase
      .from('bills')
      .select('*, tenants(full_name), rooms(room_number)')
      .order('payment_status', { ascending: false });
    if (data) setBills(data);
  }

  async function markAsPaid(billId) {
    await supabase
      .from('bills')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', billId);
    fetchBills();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Daftar Tagihan</h2>
      <div className="divide-y divide-slate-100">
        {bills.map((bill) => (
          <div key={bill.id} className="py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                Kamar {bill.rooms?.room_number} - {bill.tenants?.full_name}
              </p>
              <p className="text-sm text-slate-500">
                Total: Rp {Number(bill.total_amount).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              {bill.payment_status === 'paid' ? (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">Lunas</span>
              ) : (
                <button
                  onClick={() => markAsPaid(bill.id)}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                >
                  Tandai Lunas
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
