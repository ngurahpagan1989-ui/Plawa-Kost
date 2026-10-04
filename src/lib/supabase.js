import { createClient } from '@supabase/supabase-js';
import { INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_BILLS, INITIAL_EXPENSES } from '../../mockData';

// Ambil URL & Key dari Vite Environment Variables atau localStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('PLAWA_SUPABASE_URL') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('PLAWA_SUPABASE_KEY') : null;

const activeUrl = storedUrl || envUrl;
const activeKey = storedKey || envKey;

export const isSupabaseConfigured = Boolean(
  activeUrl && 
  activeKey && 
  !activeUrl.includes('your-project-id') && 
  activeUrl.startsWith('http')
);

// Inisialisasi Mock Store di LocalStorage jika Supabase belum diisi
const STORAGE_PREFIX = 'plawa_mock_';

function initMockStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(`${STORAGE_PREFIX}rooms`)) {
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(INITIAL_ROOMS));
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}tenants`)) {
    localStorage.setItem(`${STORAGE_PREFIX}tenants`, JSON.stringify(INITIAL_TENANTS));
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}bills`)) {
    localStorage.setItem(`${STORAGE_PREFIX}bills`, JSON.stringify(INITIAL_BILLS));
  }
  if (!localStorage.getItem(`${STORAGE_PREFIX}expenses`)) {
    localStorage.setItem(`${STORAGE_PREFIX}expenses`, JSON.stringify(INITIAL_EXPENSES));
  }
}

initMockStorage();

function getMockTable(tableName) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tableName}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading mock table ${tableName}:`, e);
    return [];
  }
}

function setMockTable(tableName, data) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${tableName}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving mock table ${tableName}:`, e);
  }
}

// Mock Query Builder yang meniru sintaks Supabase Client
function createMockQueryBuilder(tableName) {
  let filters = [];
  let sortField = null;
  let sortAscending = true;

  const builder = {
    select: (columns = '*') => {
      return builder;
    },
    eq: (column, value) => {
      filters.push({ column, value });
      return builder;
    },
    order: (column, { ascending = true } = {}) => {
      sortField = column;
      sortAscending = ascending;
      return builder;
    },
    single: async () => {
      const res = await builder.then();
      return { data: res.data ? res.data[0] || null : null, error: res.error };
    },
    insert: async (rows) => {
      const current = getMockTable(tableName);
      const inserted = (Array.isArray(rows) ? rows : [rows]).map((row) => {
        const id = row.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        return {
          ...row,
          id,
          created_at: row.created_at || new Date().toISOString(),
        };
      });

      // Special trigger simulation for bills: calculate total_amount = rent_amount + utility_cost
      if (tableName === 'bills') {
        inserted.forEach((b) => {
          b.total_amount = Number(b.rent_amount || 0) + Number(b.utility_cost || 0);
        });
      }

      const updated = [...inserted, ...current];
      setMockTable(tableName, updated);

      return {
        data: inserted,
        error: null,
        select: () => ({
          single: async () => ({ data: inserted[0], error: null }),
        }),
      };
    },
    update: (updates) => {
      return {
        eq: async (col, val) => {
          const current = getMockTable(tableName);
          let updatedItem = null;
          const updated = current.map((item) => {
            if (item[col] === val) {
              const merged = { ...item, ...updates };
              if (tableName === 'bills') {
                merged.total_amount = Number(merged.rent_amount || 0) + Number(merged.utility_cost || 0);
              }
              updatedItem = merged;
              return merged;
            }
            return item;
          });
          setMockTable(tableName, updated);
          return { data: updatedItem, error: null };
        },
      };
    },
    delete: () => {
      return {
        eq: async (col, val) => {
          const current = getMockTable(tableName);
          const filtered = current.filter((item) => item[col] !== val);
          setMockTable(tableName, filtered);
          return { data: null, error: null };
        },
      };
    },
    then: async (resolve) => {
      let data = [...getMockTable(tableName)];

      // Join relations simulation
      if (tableName === 'rooms') {
        const tenants = getMockTable('tenants');
        data = data.map((room) => ({
          ...room,
          tenants: tenants.filter((t) => t.room_id === room.id && t.is_active),
        }));
      } else if (tableName === 'tenants') {
        const rooms = getMockTable('rooms');
        data = data.map((t) => ({
          ...t,
          rooms: rooms.find((r) => r.id === t.room_id) || null,
        }));
      } else if (tableName === 'bills') {
        const tenants = getMockTable('tenants');
        const rooms = getMockTable('rooms');
        data = data.map((b) => ({
          ...b,
          tenants: tenants.find((t) => t.id === b.tenant_id) || null,
          rooms: rooms.find((r) => r.id === b.room_id) || null,
        }));
      }

      // Apply equality filters
      for (const f of filters) {
        data = data.filter((item) => item[f.column] === f.value);
      }

      // Apply sorting
      if (sortField) {
        data.sort((a, b) => {
          const valA = a[sortField];
          const valB = b[sortField];
          if (valA < valB) return sortAscending ? -1 : 1;
          if (valA > valB) return sortAscending ? 1 : -1;
          return 0;
        });
      }

      const result = { data, error: null };
      if (resolve) resolve(result);
      return result;
    },
  };

  return builder;
}

// Buat client Supabase nyata jika konfigurasi ada, jika belum gunakan Mock Client
let clientInstance = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(activeUrl, activeKey, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.warn('Gagal menginisialisasi Supabase Client nyata, menggunakan Fallback Mock:', err);
  }
}

export const supabase = clientInstance || {
  from: (table) => createMockQueryBuilder(table),
  isMock: true,
};

export function getClientStatus() {
  return {
    isConfigured: isSupabaseConfigured,
    url: activeUrl || '',
    isMock: !isSupabaseConfigured || !clientInstance,
  };
}

export function saveSupabaseConfig(url, key) {
  if (url && key) {
    localStorage.setItem('PLAWA_SUPABASE_URL', url.trim());
    localStorage.setItem('PLAWA_SUPABASE_KEY', key.trim());
    window.location.reload();
  }
}

export function resetToDemoMode() {
  localStorage.removeItem('PLAWA_SUPABASE_URL');
  localStorage.removeItem('PLAWA_SUPABASE_KEY');
  localStorage.removeItem(`${STORAGE_PREFIX}rooms`);
  localStorage.removeItem(`${STORAGE_PREFIX}tenants`);
  localStorage.removeItem(`${STORAGE_PREFIX}bills`);
  localStorage.removeItem(`${STORAGE_PREFIX}expenses`);
  window.location.reload();
}
