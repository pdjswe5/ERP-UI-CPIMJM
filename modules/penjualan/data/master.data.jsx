// Penjualan — master data & lintas-dokumen (referensi bersama semua sub-modul Penjualan)
// Field mengikuti nama field API asli (Postman ERP Master/Transaksi), data dummy lokal saja.
// PJ_GUDANG sengaja terpisah dari GUDANG_DATA (root data.jsx) — daftar gudang lokal khusus Penjualan,
// bukan pengganti master gudang inventory (keputusan eksplisit, lihat plan restrukturisasi).

const PJ_SALES_LIST = ['Sales Baru 2', 'Sales Senior', 'Sales Junior 1', 'Sales Junior 2'];
// Pasangan kode+nama salesman (sama formula kode dengan yang dipakai Sales Order: SL001..SL00N)
const PJ_SALES = PJ_SALES_LIST.map((nama, i) => ({ kode:`SL${String(i+1).padStart(3,'0')}`, nama }));
const PJ_AKUN_TUNAI = ['Kas Besar — IDR', 'Bank BCA 8810-99', 'Bank Mandiri 1212', 'Kas Kecil Cabang'];
// Pasangan kode+nama kas/bank (dipakai field "No Kasbank" Sales Order saat Kredit/Tunai = TUNAI)
const PJ_KASBANK = [
  { kode:'1005.000', nama:'Kas Besar — IDR' },
  { kode:'1005.001', nama:'Bank BCA 8810-99' },
  { kode:'1005.002', nama:'Bank Mandiri 1212' },
  { kode:'1005.003', nama:'Kas Kecil Cabang' },
];
const PJ_GUDANG = ['Gudang Konjoran', 'Gudang Utama', 'Gudang Pusat', 'Gudang Cabang Surabaya'];
// Pasangan kode+nama gudang (dipakai field "Gudang" Delivery Order — kode+nama seperti Customer/Sales,
// TIDAK menggantikan PJ_GUDANG/PJ_GUDANG_OPTS lama yang masih dipakai Invoice/Sales Return apa adanya).
const PJ_GUDANG_LIST = [
  { kode:'GDG-001', nama:'Gudang Utama' },
  { kode:'GDG-002', nama:'Gudang Konjoran' },
  { kode:'GDG-003', nama:'Gudang Pusat' },
  { kode:'GDG-004', nama:'Gudang Cabang Surabaya' },
];
const PJ_CARA_BAYAR = ['TUNAI', 'KREDIT'];
const PJ_INCOTERM_LIST = ['Franco', 'Loco', 'Ex Works'];
const PJ_KLASIFIKASI_LIST = ['Retail', 'Distributor', 'Korporat', 'Project'];
const PJ_STATUS_KONFIRMASI = ['AKTIF', 'BATAL', 'SELESAI MANUAL'];
// Master akun biaya non-produk/jasa sisi penjualan (dipakai tab "Non-Produk atau Biaya", setara PB_AKUN di Pembelian)
const PJ_AKUN_BIAYA = [
  { kode:'200.101', nama:'Biaya Pengiriman' },
  { kode:'200.102', nama:'Biaya Instalasi / Pemasangan' },
  { kode:'200.103', nama:'Biaya Packing' },
  { kode:'200.104', nama:'Komisi Sales' },
];
const PJ_PROGRESS_APPROVAL = ['PENGAJUAN SPV', 'PENGAJUAN MGR', 'DISETUJUI', 'DITOLAK SPV', 'DITOLAK MGR'];

// Helper pembentuk nomor bukti: [K/F][InisialMenu][Tahun][Counter]
// Contoh: KKO20260001, FKO20260002, KSO20260001
function fmtNoBukti(prefix, menuInitial, year, counter) {
  return `${prefix}${menuInitial}${year}${String(counter).padStart(4, '0')}`;
}
function pjNextNo(prefix) { return prefix + Date.now().toString().slice(-9); }

const PJ_KREDIT_TUNAI_OPTS = PJ_CARA_BAYAR.map(c => ({ value:c, label:c }));
const PJ_KLASIFIKASI_OPTS = PJ_KLASIFIKASI_LIST.map(k => ({ value:k, label:k }));
const PJ_INCOTERM_OPTS = PJ_INCOTERM_LIST.map(i => ({ value:i, label:i }));
const PJ_GUDANG_OPTS = PJ_GUDANG.map(g => ({ value:g, label:g }));
const PJ_AKUN_OPTS = PJ_AKUN_TUNAI.map(a => ({ value:a, label:a }));
const PJ_ALASAN_RETUR_OPTS = ['Cacat produksi', 'Salah kirim varian', 'Kemasan rusak', 'Tidak sesuai pesanan', 'Expired', 'Lain-lain'].map(a => ({ value:a, label:a }));

function pjCustOpts() { return PJ_PELANGGAN.map(p => ({ value:p.code, label:p.name })); }
function pjCustOnChange(val, set) { const p = PJ_PELANGGAN.find(x=>x.code===val); if (p) set('Nama_Cust', p.name); }

const PJ_SUBS = [
  { id:'katalog',    label:'Katalog Pelanggan' },
  { id:'konfirmasi', label:'Confirmation Order' },
  { id:'salesorder', label:'Sales Order' },
  { id:'delivery',   label:'Delivery Order' },
  { id:'invoice',    label:'Invoice' },
  { id:'retur',      label:'Sales Return' },
];
