import { useState } from 'react';
import { getClientStatus, saveSupabaseConfig, resetToDemoMode } from '../../lib/supabase';
import { Database, Key, Globe, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function ConfigModal({ isOpen, onClose }) {
  const status = getClientStatus();
  const [url, setUrl] = useState(status.url || '');
  const [anonKey, setAnonKey] = useState('');

  if (!isOpen) return null;

  function handleSave(e) {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert('Harap masukkan Supabase URL dan Anon Key dengan benar.');
      return;
    }
    saveSupabaseConfig(url, anonKey);
  }

  function handleReset() {
    if (confirm('Kembalikan ke Demo Mode dan reset data lokal?')) {
      resetToDemoMode();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${status.isConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Koneksi Database Supabase</h3>
              <p className="text-xs text-slate-500">Status & Konfigurasi Supabase PostgreSQL</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition">
            ✕
          </button>
        </div>

        {/* Status Card */}
        <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
          status.isConfigured 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          {status.isConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              {status.isConfigured ? 'Terhubung ke Supabase Cloud' : 'Mode Demo / Local Storage Aktif'}
            </p>
            <p className="mt-1 text-slate-600">
              {status.isConfigured
                ? `Proyek: ${status.url}`
                : 'Aplikasi berjalan menggunakan penyimpanan lokal browser. Data check-in, kalkulator utilitas, dan pengeluaran tetap tersimpan secara interaktif.'}
            </p>
          </div>
        </div>

        {/* Form Kredensial */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Project URL
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Project Anon / Public Key
            </label>
            <input
              type="password"
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono"
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">💡 Langkah Setup Database Supabase:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Buka dashboard Supabase Anda di <span className="font-mono text-blue-600">supabase.com</span>.</li>
              <li>Buka menu <b>SQL Editor</b> lalu paste seluruh isi file <span className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">supabase_schema.sql</span>.</li>
              <li>Klik <b>RUN</b> untuk membuat tabel <span className="font-mono">rooms, tenants, bills, expenses</span> beserta seed datanya.</li>
              <li>Copy Project URL & Anon Key dari <b>Settings &gt; API</b> ke form di atas, atau masukkan ke file <span className="font-mono">.env</span>.</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Demo Mode
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition"
              >
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
