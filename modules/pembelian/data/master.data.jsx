// Pembelian — master data & lintas-dokumen (referensi bersama semua sub-modul Pembelian)
// Field mengikuti nama field API asli (Postman ERP Master/Transaksi), data dummy lokal saja.

const PB_SUPPLIER = [
  { Kode_Supp:'AG001', Nama_Supp:'PT. Antigravity Test', Owner:'Bob', Kontak:'Alice', Telpon:'0812345678', Email:'antigravity@test.com', Aktif:true,
    Alamat:'Jl. Teknik Kimia', Kelurahan:'Keputih', Kecamatan:'Sukolilo', Kota:'Surabaya', KodePos:'60111',
    No_NPWP:'123456789012345', No_NIK:'1234567890123456', Nama_Pajak:'PT. Antigravity Test', Alamat_Pajak:'Jl. Teknik Kimia', Kota_Pajak:'Surabaya',
    Tempo:30, Plafon:50000000, Keterangan:'Supplier bahan baku utama' },
  { Kode_Supp:'MRR001', Nama_Supp:'Mr. ReyRehan', Owner:'Rey Rehan', Kontak:'Rehan', Telpon:'081234567890', Email:'reyrehan@supplier.com', Aktif:true,
    Alamat:'Jl. Rungkut Industri No. 12', Kelurahan:'Rungkut', Kecamatan:'Rungkut', Kota:'Surabaya', KodePos:'60293',
    No_NPWP:'234567890123456', No_NIK:'2345678901234567', Nama_Pajak:'Mr. ReyRehan', Alamat_Pajak:'Jl. Rungkut Industri No. 12', Kota_Pajak:'Surabaya',
    Tempo:14, Plafon:30000000, Keterangan:'' },
  { Kode_Supp:'P003', Nama_Supp:'PT. Prima Baja Sentosa', Owner:'Hendra Wijaya', Kontak:'Fina', Telpon:'0315678901', Email:'prima@baja.co.id', Aktif:true,
    Alamat:'Jl. Rungkut Industri Raya 45', Kelurahan:'Kalirungkut', Kecamatan:'Rungkut', Kota:'Surabaya', KodePos:'60293',
    No_NPWP:'345678901234567', No_NIK:'', Nama_Pajak:'PT. Prima Baja Sentosa', Alamat_Pajak:'Jl. Rungkut Industri Raya 45', Kota_Pajak:'Surabaya',
    Tempo:30, Plafon:75000000, Keterangan:'' },
  { Kode_Supp:'S006', Nama_Supp:'CV. Sinar Metal', Owner:'Agus Salim', Kontak:'Agus', Telpon:'0317890123', Email:'sinarmetal@gmail.com', Aktif:true,
    Alamat:'Jl. Kedung Cowek 88', Kelurahan:'Kedinding', Kecamatan:'Kenjeran', Kota:'Surabaya', KodePos:'60129',
    No_NPWP:'', No_NIK:'4567890123456789', Nama_Pajak:'', Alamat_Pajak:'', Kota_Pajak:'',
    Tempo:7, Plafon:15000000, Keterangan:'Supplier lokal, bayar cepat' },
  { Kode_Supp:'S001', Nama_Supp:'PT. Sinar Jaya', Owner:'Budi Santoso', Kontak:'Budi', Telpon:'0315551234', Email:'sinarjaya@ptsj.co.id', Aktif:false,
    Alamat:'Jl. Dharmahusada 200', Kelurahan:'Mulyorejo', Kecamatan:'Mulyorejo', Kota:'Surabaya', KodePos:'60115',
    No_NPWP:'567890123456789', No_NIK:'', Nama_Pajak:'PT. Sinar Jaya', Alamat_Pajak:'Jl. Dharmahusada 200', Kota_Pajak:'Surabaya',
    Tempo:30, Plafon:0, Keterangan:'Non-aktif sementara' },
];

const PB_PURCHASING_ORG = [
  { kode:'PCO_0001', nama:'Divisi Pengadaan Pusat' },
  { kode:'PCO_0002', nama:'Divisi Pengadaan Bahan Baku' },
];
const PB_SATUAN = ['LBR', 'PCS', 'KG', 'MTR', 'ROLL'];
const PB_AKUN = [
  { kode:'100.001', nama:'Kas Besar' },
  { kode:'100.003', nama:'Kas Kecil' },
  { kode:'200.001', nama:'Biaya Angkut Pembelian' },
  { kode:'200.002', nama:'Biaya Bongkar Muat' },
];
// `jenis` (BAKU/JADI/LAIN) dipakai popup Cetak (PbCetakModal) buat hitung ringkasan item per
// kategori di dokumen Register — tidak ada di data API asli, murni penanda lokal buat cetak.
const PB_PRODUK = [
  { kode:'AA0450914100550', nama:'BAHAN ABU ANGKOLA TEBAL 0.45 LEBAR 914 MM AZ 100 G-550', satuan:'LBR', harga:275000, jenis:'BAKU' },
  { kode:'BB040091470550', nama:'BAHAGIA BIRU BROMO TEBAL 0.40 LEBAR 914 MM AZ 70 G-550', satuan:'LBR', harga:260000, jenis:'BAKU' },
  { kode:'AS1025ATBONON075000410', nama:'ATAP SALJU 4CM TEBAL 0.25 ATAP BIRU BOGOWONTO NON BSI LEBAR 750 MM PANJANG 4.10 MTR', satuan:'PCS', harga:98000, jenis:'JADI' },
  { kode:'CC0350914080550', nama:'COKELAT CERAH TEBAL 0.35 LEBAR 914 MM AZ 80 G-550', satuan:'LBR', harga:245000, jenis:'BAKU' },
  { kode:'DD0500914120600', nama:'DASAR DOFF TEBAL 0.50 LEBAR 914 MM AZ 120 G-600', satuan:'LBR', harga:310000, jenis:'BAKU' },
  { kode:'EE0300762060500', nama:'EMAS ELEGAN TEBAL 0.30 LEBAR 762 MM AZ 60 G-500', satuan:'LBR', harga:185000, jenis:'JADI' },
  { kode:'FF0400914090550', nama:'FIBER FROST TEBAL 0.40 LEBAR 914 MM AZ 90 G-550', satuan:'LBR', harga:265000, jenis:'JADI' },
  { kode:'GG0250610050450', nama:'GENTENG GRANIT TEBAL 0.25 LEBAR 610 MM AZ 50 G-450', satuan:'PCS', harga:75000, jenis:'LAIN' },
];

function pbProdukNama(kode) { return PB_PRODUK.find(p => p.kode === kode)?.nama || ''; }
function pbProdukJenis(kode) { return PB_PRODUK.find(p => p.kode === kode)?.jenis || 'LAIN'; }
function pbSuppNama(kode) { return PB_SUPPLIER.find(s => s.Kode_Supp === kode)?.Nama_Supp || kode; }
function pbOrgNama(kode) { return PB_PURCHASING_ORG.find(o => o.kode === kode)?.nama || kode; }
function pbGudangNama(kode) { return GUDANG_DATA.find(g => g.kode === kode)?.nama || kode; }

const PB_ORG_OPTS = () => PB_PURCHASING_ORG.map(o => ({ value:o.kode, label:`${o.nama} (${o.kode})` }));
const PB_SUPP_OPTS = () => PB_SUPPLIER.map(s => ({ value:s.Kode_Supp, label:s.Nama_Supp }));
const PB_GUDANG_OPTS = () => GUDANG_DATA.map(g => ({ value:g.kode, label:g.nama }));

// Builder kolom item yang dipakai bersama oleh beberapa dokumen (RFQ/PO/Beli/Retur Beli)
function pbBarangCols(extra=[]) {
  return [
    { key:'Kode_Item', label:'Kode Item', mono:true, width:170 },
    { key:'Nama_Item', label:'Nama Item', width:260 },
    { key:'Deskripsi', label:'Deskripsi' },
    { key:'Qty', label:'Qty', type:'number', num:true, width:80 },
    { key:'Satuan', label:'Satuan', width:80 },
    ...extra,
  ];
}
function pbBiayaCols() {
  return [
    { key:'Kode_Item', label:'Kode Akun', mono:true, width:110 },
    { key:'Nama_Item', label:'Nama Akun', width:200 },
    { key:'Deskripsi', label:'Deskripsi' },
    { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:90 },
    { key:'Satuan', label:'Satuan', width:80 },
    { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true },
    { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:80 },
    { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true },
  ];
}

const ACTIVITY_LOG_PEMBELIAN = [
  { user:'pdjsw', action:'Melakukan Login:', detail:'Sistem Utama', time:'2 menit yang lalu', color:'var(--realisasi)' },
  { user:'admin', action:'Membuat Purchase Order:', detail:'KPO26070002', time:'25 menit yang lalu', color:'var(--realisasi)' },
  { user:'operator_1', action:'Menerima Barang (GR):', detail:'FTB26070001', time:'1 jam yang lalu', color:'var(--accent)' },
  { user:'system', action:'Sinkronisasi Database:', detail:'Server Cloud Utama', time:'3 jam yang lalu', color:'var(--accent)' },
  { user:'admin', action:'Retur Pembelian:', detail:'RB26070001', time:'5 jam yang lalu', color:'var(--danger)' },
];
