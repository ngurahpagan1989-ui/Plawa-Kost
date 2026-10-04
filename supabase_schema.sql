-- ==============================================================================
-- DATABASE SCHEMA: Plawa Kost Property Management System
-- Database: Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable UUID Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if needed (urutan drop mematuhi foreign key constraint)
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- ==============================================================================
-- 3. TABEL: rooms (Data Kamar Kost)
-- ==============================================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number TEXT NOT NULL UNIQUE,
    monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'empty' CHECK (status IN ('empty', 'occupied', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. TABEL: tenants (Data Penyewa Kost)
-- ==============================================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_day INT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. TABEL: bills (Tagihan Sewa & Utilitas)
-- ==============================================================================
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    billing_month TEXT NOT NULL, -- Format: YYYY-MM atau teks bulan
    rent_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    utility_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger untuk otomatis menghitung total_amount = rent_amount + utility_cost
CREATE OR REPLACE FUNCTION calculate_bill_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_amount := COALESCE(NEW.rent_amount, 0) + COALESCE(NEW.utility_cost, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_bill_total ON bills;
CREATE TRIGGER trigger_calculate_bill_total
BEFORE INSERT OR UPDATE ON bills
FOR EACH ROW
EXECUTE FUNCTION calculate_bill_total();

-- ==============================================================================
-- 6. TABEL: expenses (Kas Pengeluaran Operasional)
-- ==============================================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('wifi', 'sampah', 'listrik_umum', 'perbaikan', 'lainnya')),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. KEAMANAN & ROW LEVEL SECURITY (RLS)
-- Untuk aplikasi manajemen internal kost, berikan akses penuh kepada role 'anon' dan 'authenticated'.
-- ==============================================================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on tenants" ON tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on bills" ON bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime Replication jika diinginkan (opsional)
ALTER PUBLICATION supabase_realtime ADD TABLE rooms, tenants, bills, expenses;

-- ==============================================================================
-- 8. INITIAL SEED DATA (Data Contoh Siap Pakai untuk Plawa Kost)
-- ==============================================================================

-- A. Insert Kamar (Lantai 1 dan Lantai 2)
INSERT INTO rooms (id, room_number, monthly_price, status) VALUES
    ('a0000000-0000-0000-0000-000000000101', '101', 1500000, 'occupied'),
    ('a0000000-0000-0000-0000-000000000102', '102', 1500000, 'occupied'),
    ('a0000000-0000-0000-0000-000000000103', '103', 1500000, 'empty'),
    ('a0000000-0000-0000-0000-000000000104', '104', 1600000, 'occupied'),
    ('a0000000-0000-0000-0000-000000000105', '105', 1600000, 'maintenance'),
    ('a0000000-0000-0000-0000-000000000201', '201', 1750000, 'occupied'),
    ('a0000000-0000-0000-0000-000000000202', '202', 1750000, 'empty'),
    ('a0000000-0000-0000-0000-000000000203', '203', 1750000, 'occupied'),
    ('a0000000-0000-0000-0000-000000000204', '204', 1850000, 'empty'),
    ('a0000000-0000-0000-0000-000000000205', '205', 1850000, 'occupied')
ON CONFLICT (room_number) DO NOTHING;

-- B. Insert Penyewa Aktif
INSERT INTO tenants (id, room_id, full_name, phone, entry_date, due_day, is_active) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000101', 'I Made Bagus Wira', '081234567890', '2026-08-01', 1, true),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000102', 'Ni Putu Ayu Saraswati', '081987654321', '2026-08-05', 5, true),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000104', 'Dimas Prasetyo', '085712345678', '2026-08-10', 10, true),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000201', 'Rian Hidayat', '082198761234', '2026-09-01', 1, true),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000203', 'Kadek Dwi Cahyani', '087812349876', '2026-09-15', 15, true),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000205', 'Budi Santoso', '081399887766', '2026-09-20', 20, true)
ON CONFLICT DO NOTHING;

-- C. Insert Tagihan Bulan Ini (Campuran Lunas dan Belum Bayar)
INSERT INTO bills (id, tenant_id, room_id, billing_month, rent_amount, utility_cost, total_amount, payment_status, paid_at, notes) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000101', '2026-10', 1500000, 125000, 1625000, 'paid', '2026-10-01 10:30:00+08', 'Lunas via Transfer BCA. Listrik 50 kWh @ Rp 2.500'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000102', '2026-10', 1500000, 0, 1500000, 'unpaid', NULL, 'Tagihan bulan Oktober, jatuh tempo tgl 5'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000104', '2026-10', 1600000, 85000, 1685000, 'unpaid', NULL, 'Listrik 34 kWh @ Rp 2.500'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000201', 'a0000000-0000-0000-0000-000000000201', '2026-10', 1750000, 150000, 1900000, 'paid', '2026-10-02 14:15:00+08', 'Lunas tunai'),
    ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000203', 'a0000000-0000-0000-0000-000000000203', '2026-10', 1750000, 0, 1750000, 'unpaid', NULL, 'Jatuh tempo tanggal 15'),
    ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000205', 'a0000000-0000-0000-0000-000000000205', '2026-10', 1850000, 0, 1850000, 'unpaid', NULL, 'Jatuh tempo tanggal 20')
ON CONFLICT DO NOTHING;

-- D. Insert Pengeluaran Kas Operasional
INSERT INTO expenses (category, amount, expense_date, description) VALUES
    ('wifi', 450000, '2026-10-01', 'Pembayaran WiFi Indihome 100Mbps bulan Oktober'),
    ('sampah', 75000, '2026-10-02', 'Iuran kebersihan lingkungan & sampah Banjar Plawa'),
    ('listrik_umum', 200000, '2026-10-03', 'Token listrik pompa air dan lampu lorong utama'),
    ('perbaikan', 180000, '2026-10-04', 'Ganti kran wastafel & selang shower kamar 105'),
    ('lainnya', 65000, '2026-10-04', 'Beli sabun pel lantai dan pewangi lorong')
ON CONFLICT DO NOTHING;
