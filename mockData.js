// Mock data awal untuk Plawa Kost (sinkron dengan supabase_schema.sql)
// Digunakan saat variabel lingkungan VITE_SUPABASE_URL belum dikonfigurasi

export const INITIAL_ROOMS = [
  { id: 'room-101', room_number: '101', monthly_price: 1500000, status: 'occupied', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-102', room_number: '102', monthly_price: 1500000, status: 'occupied', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-103', room_number: '103', monthly_price: 1500000, status: 'empty', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-104', room_number: '104', monthly_price: 1600000, status: 'occupied', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-105', room_number: '105', monthly_price: 1600000, status: 'maintenance', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-201', room_number: '201', monthly_price: 1750000, status: 'occupied', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-202', room_number: '202', monthly_price: 1750000, status: 'empty', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-203', room_number: '203', monthly_price: 1750000, status: 'occupied', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-204', room_number: '204', monthly_price: 1850000, status: 'empty', created_at: '2026-08-01T00:00:00Z' },
  { id: 'room-205', room_number: '205', monthly_price: 1850000, status: 'occupied', created_at: '2026-08-01T00:00:00Z' },
];

export const INITIAL_TENANTS = [
  {
    id: 'tenant-1',
    room_id: 'room-101',
    full_name: 'I Made Bagus Wira',
    phone: '081234567890',
    entry_date: '2026-08-01',
    due_day: 1,
    is_active: true,
    created_at: '2026-08-01T08:00:00Z',
    rooms: { room_number: '101', monthly_price: 1500000 }
  },
  {
    id: 'tenant-2',
    room_id: 'room-102',
    full_name: 'Ni Putu Ayu Saraswati',
    phone: '081987654321',
    entry_date: '2026-08-05',
    due_day: 5,
    is_active: true,
    created_at: '2026-08-05T09:00:00Z',
    rooms: { room_number: '102', monthly_price: 1500000 }
  },
  {
    id: 'tenant-3',
    room_id: 'room-104',
    full_name: 'Dimas Prasetyo',
    phone: '085712345678',
    entry_date: '2026-08-10',
    due_day: 10,
    is_active: true,
    created_at: '2026-08-10T10:00:00Z',
    rooms: { room_number: '104', monthly_price: 1600000 }
  },
  {
    id: 'tenant-4',
    room_id: 'room-201',
    full_name: 'Rian Hidayat',
    phone: '082198761234',
    entry_date: '2026-09-01',
    due_day: 1,
    is_active: true,
    created_at: '2026-09-01T11:00:00Z',
    rooms: { room_number: '201', monthly_price: 1750000 }
  },
  {
    id: 'tenant-5',
    room_id: 'room-203',
    full_name: 'Kadek Dwi Cahyani',
    phone: '087812349876',
    entry_date: '2026-09-15',
    due_day: 15,
    is_active: true,
    created_at: '2026-09-15T13:30:00Z',
    rooms: { room_number: '203', monthly_price: 1750000 }
  },
  {
    id: 'tenant-6',
    room_id: 'room-205',
    full_name: 'Budi Santoso',
    phone: '081399887766',
    entry_date: '2026-09-20',
    due_day: 20,
    is_active: true,
    created_at: '2026-09-20T14:00:00Z',
    rooms: { room_number: '205', monthly_price: 1850000 }
  },
];

export const INITIAL_BILLS = [
  {
    id: 'bill-1',
    tenant_id: 'tenant-1',
    room_id: 'room-101',
    billing_month: '2026-10',
    rent_amount: 1500000,
    utility_cost: 125000,
    total_amount: 1625000,
    payment_status: 'paid',
    paid_at: '2026-10-01T10:30:00Z',
    notes: 'Listrik 50 kWh @ Rp 2.500. Transfer BCA',
    tenants: { full_name: 'I Made Bagus Wira', phone: '081234567890' },
    rooms: { room_number: '101' }
  },
  {
    id: 'bill-2',
    tenant_id: 'tenant-2',
    room_id: 'room-102',
    billing_month: '2026-10',
    rent_amount: 1500000,
    utility_cost: 0,
    total_amount: 1500000,
    payment_status: 'unpaid',
    paid_at: null,
    notes: 'Jatuh tempo tgl 5 Oktober',
    tenants: { full_name: 'Ni Putu Ayu Saraswati', phone: '081987654321' },
    rooms: { room_number: '102' }
  },
  {
    id: 'bill-3',
    tenant_id: 'tenant-3',
    room_id: 'room-104',
    billing_month: '2026-10',
    rent_amount: 1600000,
    utility_cost: 85000,
    total_amount: 1685000,
    payment_status: 'unpaid',
    paid_at: null,
    notes: 'Listrik: (1450 - 1416) = 34 kWh @ Rp 2.500',
    tenants: { full_name: 'Dimas Prasetyo', phone: '085712345678' },
    rooms: { room_number: '104' }
  },
  {
    id: 'bill-4',
    tenant_id: 'tenant-4',
    room_id: 'room-201',
    billing_month: '2026-10',
    rent_amount: 1750000,
    utility_cost: 150000,
    total_amount: 1900000,
    payment_status: 'paid',
    paid_at: '2026-10-02T14:15:00Z',
    notes: 'Listrik 60 kWh @ Rp 2.500. Lunas tunai',
    tenants: { full_name: 'Rian Hidayat', phone: '082198761234' },
    rooms: { room_number: '201' }
  },
  {
    id: 'bill-5',
    tenant_id: 'tenant-5',
    room_id: 'room-203',
    billing_month: '2026-10',
    rent_amount: 1750000,
    utility_cost: 0,
    total_amount: 1750000,
    payment_status: 'unpaid',
    paid_at: null,
    notes: 'Jatuh tempo tgl 15 Oktober',
    tenants: { full_name: 'Kadek Dwi Cahyani', phone: '087812349876' },
    rooms: { room_number: '203' }
  },
  {
    id: 'bill-6',
    tenant_id: 'tenant-6',
    room_id: 'room-205',
    billing_month: '2026-10',
    rent_amount: 1850000,
    utility_cost: 0,
    total_amount: 1850000,
    payment_status: 'unpaid',
    paid_at: null,
    notes: 'Jatuh tempo tgl 20 Oktober',
    tenants: { full_name: 'Budi Santoso', phone: '081399887766' },
    rooms: { room_number: '205' }
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    category: 'wifi',
    amount: 450000,
    expense_date: '2026-10-01',
    description: 'Pembayaran WiFi Indihome 100Mbps bulan Oktober',
    created_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'exp-2',
    category: 'sampah',
    amount: 75000,
    expense_date: '2026-10-02',
    description: 'Iuran kebersihan & sampah Banjar Plawa',
    created_at: '2026-10-02T10:00:00Z'
  },
  {
    id: 'exp-3',
    category: 'listrik_umum',
    amount: 200000,
    expense_date: '2026-10-03',
    description: 'Token listrik pompa air & penerangan lorong bersama',
    created_at: '2026-10-03T11:00:00Z'
  },
  {
    id: 'exp-4',
    category: 'perbaikan',
    amount: 180000,
    expense_date: '2026-10-04',
    description: 'Ganti kran wastafel & selang shower kamar 105',
    created_at: '2026-10-04T13:00:00Z'
  },
  {
    id: 'exp-5',
    category: 'lainnya',
    amount: 65000,
    expense_date: '2026-10-04',
    description: 'Beli cairan pembersih lantai & pengharum lorong',
    created_at: '2026-10-04T15:00:00Z'
  }
];
