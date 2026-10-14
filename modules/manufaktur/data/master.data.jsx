// Manufaktur — data master (referensi statis): gudang, mesin, atribut barang jadi, SPK, dan barang.
// Dipindah dari root data.jsx, prefix MF_ ditambahkan pada seluruh identifier. Nilai tidak diubah.

const MF_GUDANG_LIST = ['Gudang Utama', 'Gudang B', 'Gudang C', 'Gudang Produksi'];

const MF_MESIN_LIST = [
  'TRIM 1','TRIM 2 VIETNAM','SPAN 68','SPAN 93',
  'SLITTING 1 LEBAR 450','SLITTING 1 LEBAR 300','SLITTING 1 LEBAR 600',
  'NOK V GENTENG - V1.914','NOK - V2.450',
  'GEL-BULAT BIASA TINTED','GEL-BULAT VIETNAM 0.20 MM','GEL-BULAT DD-11',
  'GEL-BULAT KECIL VIET 0.2','GEL-BULAT KECIL 0.50 MM',
  'WALL ANGLE','CANAL C-75','RENG R-32','HOLLOW 2 X 4',
];
// Pasangan kode+nama (dipakai field Kelompok Warna/AZ/Brand/Merk Barang Jadi — kode+nama seperti
// dropdown Customer/Sales di Penjualan, bukan dropdown biasa).
const MF_KELOMPOK_WARNA_LIST = ['Abadi','CBC Ultra','Colorbond','Galvanis','Impor','Interior','Kemilau','Kirana','Maroon']
  .map((nama, i) => ({ kode:`WR${String(i+1).padStart(2,'0')}`, nama }));
const MF_AZ_LIST = ['AZ 10','AZ 100','AZ 120','AZ 150','AZ 200']
  .map(nama => ({ kode:nama.replace(/\s+/g,''), nama }));
const MF_BRAND_LIST = ['Naga','Atap Salju','Banteng','Diamond','Dinding Salju','Multi Panel','Sabe Steel']
  .map((nama, i) => ({ kode:`BR${String(i+1).padStart(2,'0')}`, nama }));
const MF_MERK_BARANG_LIST = ['Alumindo','Galvalex','Austeel','Az','NS BHP','Bhusan','Bofeng','Diamond']
  .map((nama, i) => ({ kode:`MK${String(i+1).padStart(2,'0')}`, nama }));
const MF_STEMPEL_LIST     = ['Urgent','Kapal Langka','Lunas COD','VIP Customer','Cek ada Gabungan'];
const MF_SATUAN_SPK       = ['LBR','MTR','PCS'];
const MF_STATUS_SPK       = ['Proses','Draft','Pending Approval','Approved','Realisasi','Selesai','Hold','Cancelled','Batal'];

// Dashboard Manufaktur (ManufakturPage.jsx, migrasi ke ModuleDashboard) — pola identik
// ACTIVITY_LOG_BARANG/ACTIVITY_LOG_PEMBELIAN, sebelumnya modul ini tidak punya panel activity log
// sama sekali (dashboard bespoke minimal, tidak konsisten dgn modul lain).
const ACTIVITY_LOG_MANUFAKTUR = [
  { user:'pdjsw', action:'Melakukan Login:', detail:'Sistem Utama', time:'3 menit yang lalu', color:'var(--realisasi)' },
  { user:'operator_1', action:'Menyetujui SPK:', detail:'SPK-2026-0021', time:'25 menit yang lalu', color:'var(--realisasi)' },
  { user:'admin', action:'Mencatat Hasil Produksi:', detail:'HP-2026-0009', time:'1 jam yang lalu', color:'var(--accent)' },
  { user:'operator_1', action:'Menjadwalkan Antrian:', detail:'TRIM 1 — 24-06-2026', time:'2 jam yang lalu', color:'var(--primary)' },
  { user:'admin', action:'Membatalkan SPK:', detail:'SPK-2026-0011', time:'5 jam yang lalu', color:'var(--danger)' },
];

// Shared section-title style used across the SPK, Hasil Produksi, and Pemakaian/Retur dialogs.
const MF_SEC_STYLE = {
  fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em',
  color:'var(--text-3)', margin:'0 0 14px',
  paddingBottom:8, borderBottom:'1px solid var(--border)',
};

const MF_SO_LIST = [
  { no:'SO-2026-0101', pelanggan:'PT Abadi Makmur',   tgl:'20-06-2026' },
  { no:'SO-2026-0102', pelanggan:'CV Bangun Jaya',     tgl:'21-06-2026' },
  { no:'SO-2026-0103', pelanggan:'PT Cipta Karya',     tgl:'22-06-2026' },
  { no:'SO-2026-0104', pelanggan:'UD Duta Bangunan',   tgl:'23-06-2026' },
  { no:'SO-2026-0105', pelanggan:'PT Eka Steel',       tgl:'24-06-2026' },
];

// MF_BARANG (katalog kecil ad-hoc, campur barang jadi asli & kode "*" palsu yang bukan barang
// sungguhan) sudah dipensiunkan — Barang Jadi/Bahan SPK & sub-modul lain di Manufaktur sekarang
// pakai katalog modul Barang langsung: BARANG_JADI, BAHAN_BAKU, BARANG_LAIN (lihat spk.data.jsx,
// bpbl.data.jsx, rpbl.data.jsx, MfPickers.jsx).

const MF_COIL_LIST = [
  { no:'CO-2026-001', barang:'Coil PPGL 0.23mm Galvalume',   gudang:'Gudang Utama',    sisa:1250.50 },
  { no:'CO-2026-002', barang:'Coil PPGI 0.25mm Galvanized',  gudang:'Gudang B',         sisa: 980.00 },
  { no:'CO-2026-003', barang:'Coil CR 0.30mm Silver',         gudang:'Gudang Produksi', sisa:2100.75 },
  { no:'CO-2026-004', barang:'Coil PPGL 0.20mm Truss',        gudang:'Gudang Utama',    sisa: 640.00 },
  { no:'CO-2026-005', barang:'Coil Zincalume 0.27mm',         gudang:'Gudang C',         sisa:1875.25 },
  { no:'CO-2026-006', barang:'Coil PPGI 0.35mm Heavy Gauge',  gudang:'Gudang B',         sisa: 320.00 },
];

const MF_BARANG_JADI_LIST = [
  { kode:'BJ-AG023-750',  nama:'Atap Galvalume 0.23mm 750mm',   kodePU:'PU-AG023', noCoil:'CO-2026-001', satuan:'mtr' },
  { kode:'BJ-AG023-1000', nama:'Atap Galvalume 0.23mm 1000mm',  kodePU:'PU-AG023', noCoil:'CO-2026-001', satuan:'mtr' },
  { kode:'BJ-AS4C-750',   nama:'Atap Salju 4CM 750mm',           kodePU:'PU-AS4C',  noCoil:'CO-2026-002', satuan:'mtr' },
  { kode:'BJ-AS4C-1500',  nama:'Atap Salju 4CM 1500mm',          kodePU:'PU-AS4C',  noCoil:'CO-2026-002', satuan:'mtr' },
  { kode:'BJ-TR100-020',  nama:'Truss Silver 1.00mm 0.20m',      kodePU:'PU-TR100', noCoil:'CO-2026-004', satuan:'mtr' },
  { kode:'BJ-GAL027',     nama:'Galvalume Sheet 0.27mm',          kodePU:'PU-GAL',   noCoil:'CO-2026-005', satuan:'pcs' },
  { kode:'BJ-CR030-750',  nama:'CR 0.30mm Silver 750mm',          kodePU:'PU-CR030', noCoil:'CO-2026-003', satuan:'mtr' },
  { kode:'BJ-ZNC027',     nama:'Zincalume 0.27mm Sheet',          kodePU:'PU-ZNC',   noCoil:'CO-2026-005', satuan:'pcs' },
];
