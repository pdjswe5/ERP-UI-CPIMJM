// Keuangan — data Kas, Bank, Giro, Transfer, dan Pelunasan. Dipindah dari root keuangan.jsx
// (dulu di-expose lewat Object.assign(window,{...}) — tidak perlu lagi, const top-level di sini
// sudah otomatis global lewat classic-script scope, sama seperti semua data file modul lain).

const KAS_BANK_GIRO = [
  { kode:'1000.005', nama:'KAS BESAR',     tipe:'KAS',  cabang:'Pusat',     saldo: 285450000, currency:'IDR' },
  { kode:'1000.011', nama:'KAS KECIL 1',   tipe:'KAS',  cabang:'Pusat',     saldo:  12750000, currency:'IDR' },
  { kode:'1000.033', nama:'KAS KECIL 2',   tipe:'KAS',  cabang:'Surabaya',  saldo:   8200000, currency:'IDR' },
  { kode:'1005.000', nama:'BANK BCA',      tipe:'BANK', cabang:'Pusat',     saldo:1842300000, currency:'IDR', noRek:'088-1234567' },
  { kode:'1005.001', nama:'BRI',           tipe:'BANK', cabang:'Pusat',     saldo: 425800000, currency:'IDR', noRek:'0124-01-002345-30-1' },
  { kode:'1005.002', nama:'MANDIRI',       tipe:'BANK', cabang:'Surabaya',  saldo: 318650000, currency:'IDR', noRek:'140-00-1234567-8' },
  { kode:'1010.000', nama:'DEPOSITO BCA',  tipe:'BANK', cabang:'Pusat',     saldo:2500000000, currency:'IDR', noRek:'088-DEP-9988' },
  { kode:'1020.000', nama:'PIUTANG GIRO 1', tipe:'GIRO', cabang:'Pusat',    saldo: 184250000, currency:'IDR' },
  { kode:'1020.001', nama:'PIUTANG GIRO 2', tipe:'GIRO', cabang:'Pusat',    saldo:  92800000, currency:'IDR' },
];

const KAS_MASUK = [
  { tgl:'30-04-2026', no:'KM-2026-0118', dari:'CV Mitra Sejahtera', deskripsi:'Pelunasan invoice INV-2026-0411',  akun:'KAS BESAR',   nominal:  45200000, status:'Posted' },
  { tgl:'29-04-2026', no:'KM-2026-0117', dari:'PT Anugerah Jaya',   deskripsi:'DP order parts April',              akun:'KAS BESAR',   nominal:  18500000, status:'Posted' },
  { tgl:'28-04-2026', no:'KM-2026-0116', dari:'Pelanggan Tunai',    deskripsi:'Penjualan service',                 akun:'KAS KECIL 1', nominal:   3850000, status:'Posted' },
  { tgl:'26-04-2026', no:'KM-2026-0115', dari:'PT Surya Permata',   deskripsi:'Pelunasan piutang sebagian',         akun:'KAS BESAR',   nominal:  12000000, status:'Posted' },
  { tgl:'24-04-2026', no:'KM-2026-0114', dari:'CV Bintang Timur',   deskripsi:'Pembayaran retur',                  akun:'KAS KECIL 2', nominal:   2150000, status:'Pending' },
  { tgl:'22-04-2026', no:'KM-2026-0113', dari:'Petty cash refund',  deskripsi:'Refund kelebihan setoran',           akun:'KAS BESAR',   nominal:    750000, status:'Posted' },
];

const KAS_KELUAR = [
  { tgl:'30-04-2026', no:'KK-2026-0089', untuk:'PT Pemasok Inti',     deskripsi:'Pembayaran PO-2026-0418',           akun:'KAS BESAR',   nominal: 28400000, status:'Posted' },
  { tgl:'29-04-2026', no:'KK-2026-0088', untuk:'Karyawan',            deskripsi:'Reimburse perjalanan dinas',         akun:'KAS KECIL 1', nominal:  4200000, status:'Posted' },
  { tgl:'28-04-2026', no:'KK-2026-0087', untuk:'Vendor ATK',          deskripsi:'Pembelian alat tulis kantor',        akun:'KAS KECIL 1', nominal:  1850000, status:'Posted' },
  { tgl:'26-04-2026', no:'KK-2026-0086', untuk:'PLN',                 deskripsi:'Pembayaran listrik April',           akun:'KAS BESAR',   nominal:  6750000, status:'Posted' },
  { tgl:'24-04-2026', no:'KK-2026-0085', untuk:'PT Logistik Cepat',   deskripsi:'Biaya pengiriman April',             akun:'KAS BESAR',   nominal:  3200000, status:'Pending' },
];

const BANK_MASUK = [
  { tgl:'30-04-2026', no:'BM-2026-0204', dari:'PT Anugerah Jaya',     deskripsi:'Transfer pelunasan INV-0382',        akun:'BANK BCA',  nominal: 142500000, status:'Posted' },
  { tgl:'29-04-2026', no:'BM-2026-0203', dari:'CV Mitra Sejahtera',   deskripsi:'Pembayaran sebagian invoice',         akun:'BANK BCA',  nominal:  85000000, status:'Posted' },
  { tgl:'29-04-2026', no:'BM-2026-0202', dari:'PT Surya Permata',     deskripsi:'Transfer SO-2026-0412',               akun:'MANDIRI',   nominal: 220000000, status:'Posted' },
  { tgl:'27-04-2026', no:'BM-2026-0201', dari:'PT Indra Karya',       deskripsi:'Pelunasan INV-0378',                  akun:'BRI',       nominal:  68250000, status:'Posted' },
  { tgl:'25-04-2026', no:'BM-2026-0200', dari:'Bunga deposito April',  deskripsi:'Bunga deposito BCA',                 akun:'DEPOSITO BCA', nominal: 18750000, status:'Posted' },
];

const BANK_KELUAR = [
  { tgl:'30-04-2026', no:'BK-2026-0156', untuk:'PT Pemasok Inti',     deskripsi:'Pembayaran PO-2026-0410',             akun:'BANK BCA', nominal: 245000000, status:'Posted' },
  { tgl:'29-04-2026', no:'BK-2026-0155', untuk:'PT Mega Auto Parts',  deskripsi:'Pembayaran sparepart April',           akun:'BANK BCA', nominal: 128400000, status:'Posted' },
  { tgl:'28-04-2026', no:'BK-2026-0154', untuk:'Pajak',               deskripsi:'Setoran PPN April 2026',              akun:'MANDIRI',  nominal:  92750000, status:'Posted' },
  { tgl:'26-04-2026', no:'BK-2026-0153', untuk:'Karyawan',            deskripsi:'Payroll April 2026',                  akun:'BANK BCA', nominal: 385600000, status:'Posted' },
  { tgl:'24-04-2026', no:'BK-2026-0152', untuk:'PT Asuransi Sentral', deskripsi:'Premi asuransi Q2',                   akun:'BRI',      nominal:  18500000, status:'Pending' },
];

const TRANSFER_MASUK = [
  { tgl:'30-04-2026', no:'TM-2026-0042', dari:'KAS BESAR',  ke:'BANK BCA', deskripsi:'Setoran tunai harian',          nominal: 50000000, status:'Posted' },
  { tgl:'28-04-2026', no:'TM-2026-0041', dari:'KAS KECIL 1', ke:'KAS BESAR', deskripsi:'Konsolidasi kas kecil',        nominal:  8500000, status:'Posted' },
  { tgl:'25-04-2026', no:'TM-2026-0040', dari:'BANK BCA',   ke:'MANDIRI',  deskripsi:'Transfer antar bank',           nominal:150000000, status:'Posted' },
];

const TRANSFER_KELUAR = [
  { tgl:'30-04-2026', no:'TK-2026-0038', dari:'BANK BCA',   ke:'KAS BESAR', deskripsi:'Penarikan tunai untuk operasional', nominal: 25000000, status:'Posted' },
  { tgl:'27-04-2026', no:'TK-2026-0037', dari:'BANK BCA',   ke:'KAS KECIL 2', deskripsi:'Top up kas kecil cabang Surabaya', nominal: 10000000, status:'Posted' },
  { tgl:'24-04-2026', no:'TK-2026-0036', dari:'MANDIRI',    ke:'BRI',      deskripsi:'Reposisi saldo bank',           nominal: 75000000, status:'Posted' },
];

const GIRO_MASUK = [
  { tgl:'30-04-2026', no:'GM-2026-0028', dari:'PT Anugerah Jaya',  noGiro:'BG-CDE-7782341', bank:'BCA',     jthTempo:'15-05-2026', nominal:185000000, status:'Outstanding' },
  { tgl:'28-04-2026', no:'GM-2026-0027', dari:'CV Mitra Sejahtera',noGiro:'BG-MND-9912445', bank:'Mandiri', jthTempo:'12-05-2026', nominal: 95000000, status:'Outstanding' },
  { tgl:'25-04-2026', no:'GM-2026-0026', dari:'PT Surya Permata',  noGiro:'BG-BRI-1184502', bank:'BRI',     jthTempo:'08-05-2026', nominal:142000000, status:'Cair' },
  { tgl:'22-04-2026', no:'GM-2026-0025', dari:'PT Indra Karya',    noGiro:'BG-CDE-7765980', bank:'BCA',     jthTempo:'06-05-2026', nominal: 68500000, status:'Outstanding' },
  { tgl:'18-04-2026', no:'GM-2026-0024', dari:'CV Bintang Timur',  noGiro:'BG-MND-9905623', bank:'Mandiri', jthTempo:'02-05-2026', nominal: 34200000, status:'Tolak' },
];

const GIRO_KELUAR = [
  { tgl:'29-04-2026', no:'GK-2026-0019', untuk:'PT Pemasok Inti',    noGiro:'GR-PDJ-0058', bank:'BCA',  jthTempo:'14-05-2026', nominal:225000000, status:'Outstanding' },
  { tgl:'26-04-2026', no:'GK-2026-0018', untuk:'PT Mega Auto Parts', noGiro:'GR-PDJ-0057', bank:'BCA',  jthTempo:'10-05-2026', nominal:148000000, status:'Outstanding' },
  { tgl:'22-04-2026', no:'GK-2026-0017', untuk:'PT Sumber Karya',    noGiro:'GR-PDJ-0056', bank:'BRI',  jthTempo:'06-05-2026', nominal: 78500000, status:'Cair' },
];

// Shape baru (multi-baris) — 1 pelunasan bisa mencakup beberapa Nota/Uang Muka/Retur sekaligus
// (tabel `items`, kolom debet/kredit persis seperti yang diedit user di PelunasanModal) dibayar
// lewat 1 atau beberapa metode (tabel `penerimaan`). `total` = Σkredit − Σdebet di `items`, harus
// selalu sama dengan Σmasuk − Σkeluar di `penerimaan` (balance, sama seperti Jurnal Memorial).
// kodeCust/kodeSupp & sebagian noBukti di `items` konsisten dengan SALDO_PIUTANG_ITEMS/
// SALDO_HUTANG_ITEMS (saldo.data.jsx) — merepresentasikan pelunasan yang sudah mengurangi sisa
// beberapa nota di sana (mis. NJ-2026-0198 nilai 32jt sekarang sisa 12jt karena PP-2026-0001).
const PELUNASAN_PIUTANG = [
  { no:'PP-2026-0001', tgl:'10-07-2026', noReferensi:'TF-10072026', kodeCust:'C001', namaCust:'Brandon Fononta 3', catatan:'',
    items:[ { id:1, jenis:'Nota', noBukti:'NJ-2026-0198', sisaSaatItu:32000000, debet:0, kredit:20000000 } ],
    penerimaan:[ { id:1, metode:'Transfer', kodeAkun:'1005.000', namaAkun:'BANK BCA', masuk:20000000, keluar:0 } ],
    total:20000000, status:'Posted' },
  { no:'PP-2026-0002', tgl:'27-06-2026', noReferensi:'', kodeCust:'L001', namaCust:'Lia Malik', catatan:'Pelunasan penuh',
    items:[ { id:1, jenis:'Nota', noBukti:'NJ-2026-0188', sisaSaatItu:15000000, debet:0, kredit:15000000 } ],
    penerimaan:[ { id:1, metode:'Tunai', kodeAkun:'1000.005', namaAkun:'KAS BESAR', masuk:15000000, keluar:0 } ],
    total:15000000, status:'Posted' },
  { no:'PP-2026-0003', tgl:'20-06-2026', noReferensi:'BG-CDE-1122', kodeCust:'C012', namaCust:'Charlie Reynold 2', catatan:'',
    items:[ { id:1, jenis:'Nota', noBukti:'NJ-2026-0175', sisaSaatItu:9800000, debet:0, kredit:9800000 } ],
    penerimaan:[ { id:1, metode:'Giro', kodeAkun:'1020.000', namaAkun:'PIUTANG GIRO 1', masuk:9800000, keluar:0, noGiro:'BG-CDE-1122', jthTempoGiro:'05-07-2026' } ],
    total:9800000, status:'Posted' },
  { no:'PP-2026-0004', tgl:'22-06-2026', noReferensi:'', kodeCust:'KV001', namaCust:'KAVI', catatan:'',
    items:[ { id:1, jenis:'Nota', noBukti:'NJ-2026-0160', sisaSaatItu:14200000, debet:0, kredit:14200000 } ],
    penerimaan:[ { id:1, metode:'Tunai', kodeAkun:'1000.011', namaAkun:'KAS KECIL 1', masuk:14200000, keluar:0 } ],
    total:14200000, status:'Posted' },
  { no:'PP-2026-0005', tgl:'05-06-2026', noReferensi:'TF-05062026', kodeCust:'L015', namaCust:'Lusista Wijaya 2', catatan:'Pelunasan sebagian',
    items:[ { id:1, jenis:'Nota', noBukti:'NJ-2026-0287', sisaSaatItu:9800000, debet:0, kredit:6000000 } ],
    penerimaan:[ { id:1, metode:'Transfer', kodeAkun:'1005.000', namaAkun:'BANK BCA', masuk:6000000, keluar:0 } ],
    total:6000000, status:'Posted' },
  { no:'PP-2026-0006', tgl:'25-04-2026', noReferensi:'', kodeCust:'R006', namaCust:'Reynold 2', catatan:'Pelunasan penuh',
    items:[ { id:1, jenis:'Nota', noBukti:'NJ-2026-0270', sisaSaatItu:19900000, debet:0, kredit:19900000 } ],
    penerimaan:[ { id:1, metode:'Tunai', kodeAkun:'1000.005', namaAkun:'KAS BESAR', masuk:19900000, keluar:0 } ],
    total:19900000, status:'Posted' },
];

const PELUNASAN_HUTANG = [
  { no:'PH-2026-0001', tgl:'16-07-2026', noReferensi:'TF-16072026', kodeSupp:'P003', namaSupp:'PT. Prima Baja Sentosa', catatan:'Pelunasan sebagian',
    items:[ { id:1, jenis:'Nota', noBukti:'BL26070006', sisaSaatItu:68000000, debet:0, kredit:40000000 } ],
    penerimaan:[ { id:1, metode:'Transfer', kodeAkun:'1005.000', namaAkun:'BANK BCA', masuk:40000000, keluar:0 } ],
    total:40000000, status:'Posted' },
  { no:'PH-2026-0002', tgl:'18-06-2026', noReferensi:'', kodeSupp:'S006', namaSupp:'CV. Sinar Metal', catatan:'',
    items:[ { id:1, jenis:'Nota', noBukti:'BL26060012', sisaSaatItu:9500000, debet:0, kredit:9500000 } ],
    penerimaan:[ { id:1, metode:'Transfer', kodeAkun:'1005.001', namaAkun:'BRI', masuk:9500000, keluar:0 } ],
    total:9500000, status:'Posted' },
  { no:'PH-2026-0003', tgl:'25-06-2026', noReferensi:'', kodeSupp:'MRR001', namaSupp:'Mr. ReyRehan', catatan:'Nota dibayar sebagian pakai retur',
    items:[
      { id:1, jenis:'Nota',  noBukti:'BL26060020', sisaSaatItu:21000000, debet:0, kredit:21000000 },
      { id:2, jenis:'Retur', noBukti:'RB26060005', sisaSaatItu:3000000,  debet:3000000, kredit:0 },
    ],
    penerimaan:[ { id:1, metode:'Tunai', kodeAkun:'1000.005', namaAkun:'KAS BESAR', masuk:18000000, keluar:0 } ],
    total:18000000, status:'Posted' },
  { no:'PH-2026-0004', tgl:'20-05-2026', noReferensi:'TF-20052026', kodeSupp:'P003', namaSupp:'PT. Prima Baja Sentosa', catatan:'Pelunasan penuh',
    items:[ { id:1, jenis:'Nota', noBukti:'BL26050020', sisaSaatItu:15500000, debet:0, kredit:15500000 } ],
    penerimaan:[ { id:1, metode:'Transfer', kodeAkun:'1005.000', namaAkun:'BANK BCA', masuk:15500000, keluar:0 } ],
    total:15500000, status:'Posted' },
];
