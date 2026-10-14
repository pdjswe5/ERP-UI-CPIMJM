// Sample data for the prototype
const SUPPLIERS = [
  { code: 'S5001', name: 'PT Auto Parts Nusantara', city: 'Jakarta', phone: '021-5550001' },
  { code: 'S5002', name: 'CV Sumber Mesin Jaya',    city: 'Surabaya', phone: '031-5550012' },
  { code: 'S5003', name: 'PT Karya Otomotif',       city: 'Bandung',  phone: '022-5550023' },
  { code: 'S5004', name: 'PT Mitra Suku Cadang',    city: 'Semarang', phone: '024-5550034' },
  { code: 'S5005', name: 'PT Global Lubricants',    city: 'Tangerang',phone: '021-5550045' },
  { code: 'S5006', name: 'CV Bengkel Sentosa',      city: 'Bekasi',   phone: '021-5550056' },
  { code: 'S5007', name: 'PT Indo Ban Prima',       city: 'Medan',    phone: '061-5550067' },
  { code: 'S5008', name: 'PT Mandiri Lighting',     city: 'Jakarta',  phone: '021-5550078' },
];

const ITEMS = [
  { code: 'P-EF1001', name: 'Engine Oil Filter — 5.0L',         unit: 'pcs', price:  185000 },
  { code: 'P-BK2104', name: 'Brake Pad Set Front — Ranger',     unit: 'set', price:  925000 },
  { code: 'P-BK2105', name: 'Brake Disc Rear — Everest',        unit: 'pcs', price: 1450000 },
  { code: 'P-SP3201', name: 'Spark Plug Iridium (4-pack)',      unit: 'set', price:  640000 },
  { code: 'P-AF4022', name: 'Air Filter — Ranger 2.2L',         unit: 'pcs', price:  235000 },
  { code: 'P-CL5500', name: 'Clutch Disc — Manual 6-spd',       unit: 'pcs', price: 3250000 },
  { code: 'P-TR6611', name: 'Timing Belt Kit — EcoBoost',       unit: 'set', price: 4180000 },
  { code: 'P-OL7022', name: 'Engine Oil 5W-30 (4L)',            unit: 'btl', price:  595000 },
  { code: 'P-TY8801', name: 'Tire 265/65R17 All-Terrain',       unit: 'pcs', price: 2100000 },
  { code: 'P-LT9210', name: 'Headlamp LED Assy — Ranger',       unit: 'pcs', price: 5450000 },
  { code: 'P-SH1140', name: 'Shock Absorber Rear — Everest',    unit: 'pcs', price: 1875000 },
  { code: 'P-BT3300', name: 'Battery 70Ah MF',                  unit: 'pcs', price: 1325000 },
];

const STATUSES = ['Draft', 'Pending Approval', 'Approved', 'Realisasi', 'Partial', 'Cancelled'];
const STATUS_CLASS = {
  'Draft': 'draft',
  'Pending Approval': 'pending',
  'Approved': 'approved',
  'Realisasi': 'realisasi',
  'Partial': 'partial',
  'Cancelled': 'cancelled',
  // Status tambahan modul Manufaktur (MF_STATUS_SPK) — sebelumnya tidak dipetakan sehingga
  // selalu jatuh ke pill "draft" (fallback di StatusClass[x] || 'draft'), padahal seharusnya
  // punya warna beda-beda sesuai maknanya.
  'Proses': 'pending',
  'Selesai': 'approved',
  'Hold': 'partial',
  'Batal': 'cancelled',
};

// pre-built PO list (deterministic)
const PO_LIST = [
  { no:'PO-2026-0631', date:'30-04-2026', supplier:'PT Auto Parts Nusantara',  ref:'REF-AP-1108', status:'Pending Approval', due:'14-05-2026', total: 18450000, items: 6 },
  { no:'PO-2026-0630', date:'30-04-2026', supplier:'PT Mandiri Lighting',      ref:'REF-ML-2204', status:'Realisasi',        due:'13-05-2026', total: 27200000, items: 4 },
  { no:'PO-2026-0629', date:'29-04-2026', supplier:'CV Sumber Mesin Jaya',     ref:'REF-SM-9912', status:'Approved',         due:'13-05-2026', total: 41750000, items: 9 },
  { no:'PO-2026-0628', date:'29-04-2026', supplier:'PT Karya Otomotif',        ref:'REF-KO-3344', status:'Realisasi',        due:'12-05-2026', total: 12880000, items: 3 },
  { no:'PO-2026-0627', date:'28-04-2026', supplier:'PT Mitra Suku Cadang',     ref:'REF-MS-7781', status:'Partial',          due:'11-05-2026', total:  8650000, items: 5 },
  { no:'PO-2026-0626', date:'28-04-2026', supplier:'PT Global Lubricants',     ref:'REF-GL-4456', status:'Pending Approval', due:'10-05-2026', total: 15920000, items: 8 },
  { no:'PO-2026-0625', date:'28-04-2026', supplier:'PT Indo Ban Prima',        ref:'REF-IB-1129', status:'Realisasi',        due:'10-05-2026', total: 63420000, items: 12 },
  { no:'PO-2026-0624', date:'27-04-2026', supplier:'CV Bengkel Sentosa',       ref:'REF-BS-6612', status:'Draft',            due:'09-05-2026', total:  4180000, items: 2 },
  { no:'PO-2026-0623', date:'27-04-2026', supplier:'PT Auto Parts Nusantara',  ref:'REF-AP-1107', status:'Approved',         due:'09-05-2026', total: 22450000, items: 7 },
  { no:'PO-2026-0622', date:'26-04-2026', supplier:'PT Mandiri Lighting',      ref:'REF-ML-2203', status:'Cancelled',        due:'08-05-2026', total:  6300000, items: 2 },
  { no:'PO-2026-0621', date:'26-04-2026', supplier:'PT Mitra Suku Cadang',     ref:'REF-MS-7780', status:'Realisasi',        due:'08-05-2026', total: 11800000, items: 4 },
  { no:'PO-2026-0620', date:'25-04-2026', supplier:'CV Sumber Mesin Jaya',     ref:'REF-SM-9911', status:'Approved',         due:'07-05-2026', total: 38900000, items: 10 },
  { no:'PO-2026-0619', date:'25-04-2026', supplier:'PT Global Lubricants',     ref:'REF-GL-4455', status:'Pending Approval', due:'07-05-2026', total:  9450000, items: 5 },
  { no:'PO-2026-0618', date:'24-04-2026', supplier:'PT Karya Otomotif',        ref:'REF-KO-3343', status:'Realisasi',        due:'06-05-2026', total: 14200000, items: 6 },
];

const fmtRp = (n) => 'Rp ' + (n || 0).toLocaleString('id-ID');
const fmtNum = (n) => (n || 0).toLocaleString('id-ID');

const GUDANG_DATA = [
  { kode:'GDG-001', nama:'Gudang Utama' },
  { kode:'GDG-002', nama:'Gudang B' },
  { kode:'GDG-003', nama:'Gudang C' },
  { kode:'GDG-004', nama:'Gudang Produksi' },
];

Object.assign(window, { SUPPLIERS, ITEMS, STATUSES, STATUS_CLASS, PO_LIST, fmtRp, fmtNum, GUDANG_DATA });
