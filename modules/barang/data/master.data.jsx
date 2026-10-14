// Barang — master data & lintas-sub-modul (referensi bersama semua sub-modul Barang).
// Dipindah dari root barang.jsx, nilai tidak diubah.

const BRG_KATEGORI_OPTS = [
  { kode:'BAKU', nama:'Bahan Baku' }, { kode:'JADI', nama:'Barang Jadi' },
  { kode:'KAT001', nama:'Aksesoris' }, { kode:'KAT002', nama:'K3' }, { kode:'KAT003', nama:'Kemasan' },
  // Ditambahkan untuk form Barang Lain (lihat BRG_KATEGORI_LAIN_OPTS di bawah) — additive,
  // tidak menghapus opsi lama yang masih dipakai Bahan Baku/Barang Jadi.
  { kode:'JADIPU', nama:'Barang Jadi PU' }, { kode:'LAIN', nama:'Barang Lain' },
  { kode:'PENOLONG', nama:'Barang Penolong' }, { kode:'SPARE', nama:'Barang Spare' }, { kode:'TOOLS', nama:'Barang Tools' },
];
// Subset BRG_KATEGORI_OPTS yang boleh dipilih di form Barang Lain saja.
const BRG_KATEGORI_LAIN_OPTS = BRG_KATEGORI_OPTS.filter(k => ['LAIN','PENOLONG','SPARE','TOOLS'].includes(k.kode));

const BRG_SATUAN_OPTS = ['PCS', 'KG', 'LBR', 'MTR', 'ROLL', 'ZAK', 'PSG'];
// Pasangan kode+nama satuan (dipakai kolom "Satuan" di tabel Satuan & Konversi Barang Lain).
const BRG_SATUAN_KONVERSI_OPTS = BRG_SATUAN_OPTS.map((nama, i) => ({ kode:String(51 + i), nama }));

// Master Warna/AZ/Yield untuk form Bahan Baku — tiap dropdown pilih kode, nama terkait
// ditampilkan otomatis di field readonly sebelahnya (lihat BahanBakuModal).
const BRG_WARNA_OPTS = [
  { kode:'AG', nama:'Abu Gelap' }, { kode:'AA', nama:'Abu Angkola' }, { kode:'BB', nama:'Biru Bromo' },
  { kode:'AS', nama:'Abu Salju' }, { kode:'BR', nama:'Bata Merah' }, { kode:'HJ', nama:'Hijau Tosca' },
  { kode:'CK', nama:'Coklat Kayu' },
];
const BRG_AZ_OPTS = [
  { kode:'70', nama:'AZ 70' }, { kode:'100', nama:'AZ 100' }, { kode:'150', nama:'AZ 150' }, { kode:'200', nama:'AZ 200' },
];
const BRG_YIELD_OPTS = [
  { kode:'400', nama:'Yield G-400' }, { kode:'550', nama:'Yield G-550' }, { kode:'600', nama:'Yield G-600' },
];

// Master Jenis/Tipe/Merk untuk form Barang Jadi Umum — pola dropdown kode + nama readonly
// sebelahnya sama seperti Warna/AZ/Yield di form Bahan Baku.
const BRG_JENIS_OPTS = [
  { kode:'FBR', nama:'Fiber' }, { kode:'MTL', nama:'Metal' }, { kode:'GEN', nama:'Genteng' }, { kode:'PVC', nama:'PVC' },
];
const BRG_TIPE_OPTS = [
  { kode:'STD', nama:'Standard' }, { kode:'CST', nama:'Custom' }, { kode:'PRM', nama:'Premium' },
];
const BRG_MERK_OPTS = [
  { kode:'MK01', nama:'Solite' }, { kode:'MK02', nama:'Alderon' }, { kode:'MK03', nama:'Superroof' }, { kode:'MK04', nama:'Onduline' },
];

// Master Jenis/Tipe khusus form Barang PU (proses/jasa produksi, beda konteks dari Jenis/Tipe
// Barang Umum) — dan daftar Status PU (Aktif/Non-Aktif/Arsip).
const BRG_JENIS_PU_OPTS = [
  { kode:'*CO', nama:'Coil' }, { kode:'*F', nama:'Jasa Forming' }, { kode:'BT', nama:'Barang Tercetak' }, { kode:'ROLL', nama:'Roll' },
];
const BRG_TIPE_PU_OPTS = [
  { kode:'BK', nama:'Bak Air' }, { kode:'CUSTOM', nama:'Custom' }, { kode:'AB', nama:'Atap Bergelombang' }, { kode:'F', nama:'Flat' },
];
const BRG_STATUS_PU_OPTS = ['AKTIF', 'NON-AKTIF', 'ARSIP'];
const BRG_GUDANG_OPTS = [
  { kode:'GDG001', nama:'Gudang Utama' }, { kode:'GDG002', nama:'Gudang Konjoran' },
  { kode:'GDG003', nama:'Gudang Pusat' }, { kode:'GDG004', nama:'Gudang Cabang Surabaya' },
];

const ACTIVITY_LOG_BARANG = [
  { user:'pdjsw', action:'Melakukan Login:', detail:'Sistem Utama', time:'1 menit yang lalu', color:'var(--realisasi)' },
  { user:'admin', action:'Mengubah Data Pemasok:', detail:'PT. Sinar Jaya', time:'12 menit yang lalu', color:'#f59e0b' },
  { user:'operator_1', action:'Membuat Nota Penjualan:', detail:'INV-2026-9526', time:'1 jam yang lalu', color:'var(--realisasi)' },
  { user:'system', action:'Sinkronisasi Database:', detail:'Server Cloud Utama', time:'3 jam yang lalu', color:'var(--accent)' },
  { user:'admin', action:'Menghapus Batch Produksi:', detail:'PRD-2026-B1', time:'7 jam yang lalu', color:'var(--danger)' },
];
