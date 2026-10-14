// Keuangan — data "Sisa Nota & Uang Muka" per pelanggan/supplier, dipakai popup SaldoPickerModal
// di form Pelunasan Piutang/Hutang. Data ini MILIK modul Keuangan sendiri (bukan dihitung real-time
// dari INVOICE_SEED/PB_BELI — keduanya tidak punya field sisa/outstanding sama sekali di codebase
// ini), tapi kodeCust/namaCust & kodeSupp/namaSupp diambil dari PJ_PELANGGAN/PB_SUPPLIER ASLI supaya
// dropdown pemilihan partner di form Pelunasan konsisten dengan Katalog Pelanggan/Pemasok.
//
// jenis:'Nota' = tagihan yang mengurangi piutang/hutang saat dibayar (masuk kolom Kredit di tabel
// Pelunasan). jenis:'Uang Muka'/'Retur' = kredit yang sudah tersedia, bisa dipakai membantu bayar
// Nota (masuk kolom Debet). `sisa` sengaja ada yang < nilai (sudah pernah dipakai sebagian oleh
// record PELUNASAN_PIUTANG/HUTANG seed di kasbank.data.jsx) dan ada yang 0 (nota lama yang sudah
// lunas total, sengaja tetap disimpan sebagai riwayat — SaldoPickerModal cuma menampilkan sisa>0).

const SALDO_PIUTANG_ITEMS = [
  { id:'SP-P-001', jenis:'Nota',      kodeCust:'b7364', namaCust:'Budi Susanto Cahyono Siner', noBukti:'NJ-2026-0231', tgl:'05-07-2026', jthTempo:'19-07-2026', nilai:45000000, sisa:45000000 },
  { id:'SP-P-002', jenis:'Nota',      kodeCust:'b7364', namaCust:'Budi Susanto Cahyono Siner', noBukti:'NJ-2026-0245', tgl:'12-07-2026', jthTempo:'26-07-2026', nilai:18500000, sisa:18500000 },
  { id:'SP-P-003', jenis:'Uang Muka', kodeCust:'b7364', namaCust:'Budi Susanto Cahyono Siner', noBukti:'UM-2026-0012', tgl:'01-07-2026', jthTempo:'', nilai:10000000, sisa:10000000 },

  { id:'SP-P-004', jenis:'Nota',      kodeCust:'C001',  namaCust:'Brandon Fononta 3', noBukti:'NJ-2026-0198', tgl:'28-06-2026', jthTempo:'12-07-2026', nilai:32000000, sisa:12000000 },
  { id:'SP-P-005', jenis:'Nota',      kodeCust:'C001',  namaCust:'Brandon Fononta 3', noBukti:'NJ-2026-0256', tgl:'15-07-2026', jthTempo:'29-07-2026', nilai:27500000, sisa:27500000 },

  { id:'SP-P-006', jenis:'Nota',      kodeCust:'C012',  namaCust:'Charlie Reynold 2', noBukti:'NJ-2026-0210', tgl:'02-07-2026', jthTempo:'16-07-2026', nilai:65000000, sisa:65000000 },
  { id:'SP-P-007', jenis:'Retur',     kodeCust:'C012',  namaCust:'Charlie Reynold 2', noBukti:'SR-2026-0034', tgl:'08-07-2026', jthTempo:'', nilai:5500000, sisa:5500000 },

  { id:'SP-P-008', jenis:'Nota',      kodeCust:'KV001', namaCust:'KAVI', noBukti:'NJ-2026-0220', tgl:'04-07-2026', jthTempo:'18-07-2026', nilai:21000000, sisa:21000000 },
  { id:'SP-P-009', jenis:'Nota',      kodeCust:'KV001', namaCust:'KAVI', noBukti:'NJ-2026-0261', tgl:'17-07-2026', jthTempo:'31-07-2026', nilai:38000000, sisa:38000000 },

  { id:'SP-P-010', jenis:'Nota',      kodeCust:'L001',  namaCust:'Lia Malik', noBukti:'NJ-2026-0188', tgl:'25-06-2026', jthTempo:'09-07-2026', nilai:15000000, sisa:0 },
  { id:'SP-P-011', jenis:'Uang Muka', kodeCust:'L001',  namaCust:'Lia Malik', noBukti:'UM-2026-0018', tgl:'10-07-2026', jthTempo:'', nilai:7500000, sisa:7500000 },

  // Ditambahkan supaya Rekap/Kartu/Rincian Piutang (modul Laporan) py cakupan customer lebih luas
  // drpd cuma 5 partner di atas — noBukti/tgl dibuat variatif (ada yg > 90 hari, ada yg baru & lunas
  // sebagian) supaya kolom umur 0-30/31-60/61-90/>90 hari kelihatan variatif juga.
  { id:'SP-P-012', jenis:'Nota', kodeCust:'L002',  namaCust:'Lanny Wijaya',      noBukti:'NJ-2026-0301', tgl:'15-03-2026', jthTempo:'29-03-2026', nilai:22000000, sisa:22000000 },
  { id:'SP-P-013', jenis:'Nota', kodeCust:'L002',  namaCust:'Lanny Wijaya',      noBukti:'NJ-2026-0298', tgl:'10-06-2026', jthTempo:'24-06-2026', nilai:14500000, sisa:14500000 },
  { id:'SP-P-014', jenis:'Nota', kodeCust:'L015',  namaCust:'Lusista Wijaya 2',  noBukti:'NJ-2026-0287', tgl:'20-05-2026', jthTempo:'03-06-2026', nilai:9800000,  sisa:3800000 },
  { id:'SP-P-015', jenis:'Nota', kodeCust:'L0151', namaCust:'Lusiska',           noBukti:'NJ-2026-0302', tgl:'02-07-2026', jthTempo:'16-07-2026', nilai:17250000, sisa:17250000 },
  { id:'SP-P-016', jenis:'Nota', kodeCust:'P105',  namaCust:'INDOMILK 2',        noBukti:'NJ-2026-0155', tgl:'28-02-2026', jthTempo:'14-03-2026', nilai:31000000, sisa:31000000 },
  { id:'SP-P-017', jenis:'Nota', kodeCust:'P105',  namaCust:'INDOMILK 2',        noBukti:'NJ-2026-0303', tgl:'05-07-2026', jthTempo:'19-07-2026', nilai:12400000, sisa:12400000 },
  { id:'SP-P-018', jenis:'Nota', kodeCust:'R003',  namaCust:'Reynold',           noBukti:'NJ-2026-0295', tgl:'12-06-2026', jthTempo:'26-06-2026', nilai:6750000,  sisa:6750000 },
  { id:'SP-P-019', jenis:'Nota', kodeCust:'R006',  namaCust:'Reynold 2',         noBukti:'NJ-2026-0270', tgl:'18-04-2026', jthTempo:'02-05-2026', nilai:19900000, sisa:0 },
  { id:'SP-P-020', jenis:'Retur',kodeCust:'R009',  namaCust:'Reynold Pratama',   noBukti:'SR-2026-0041', tgl:'22-06-2026', jthTempo:'', nilai:2100000, sisa:2100000 },
  { id:'SP-P-021', jenis:'Nota', kodeCust:'R009',  namaCust:'Reynold Pratama',   noBukti:'NJ-2026-0296', tgl:'22-06-2026', jthTempo:'06-07-2026', nilai:24800000, sisa:24800000 },
  { id:'SP-P-022', jenis:'Nota', kodeCust:'S101',  namaCust:'Sari Mart',         noBukti:'NJ-2026-0304', tgl:'08-07-2026', jthTempo:'22-07-2026', nilai:5600000,  sisa:5600000 },
  { id:'SP-P-023', jenis:'Nota', kodeCust:'T201',  namaCust:'Toko Jaya Abadi',   noBukti:'NJ-2026-0180', tgl:'25-03-2026', jthTempo:'08-04-2026', nilai:41000000, sisa:41000000 },
  { id:'SP-P-024', jenis:'Nota', kodeCust:'T201',  namaCust:'Toko Jaya Abadi',   noBukti:'NJ-2026-0305', tgl:'15-07-2026', jthTempo:'29-07-2026', nilai:8900000,  sisa:8900000 },
];

const SALDO_HUTANG_ITEMS = [
  { id:'SP-H-001', jenis:'Nota',      kodeSupp:'AG001', namaSupp:'PT. Antigravity Test', noBukti:'BL26070001', tgl:'09-07-2026', jthTempo:'23-07-2026', nilai:55000000, sisa:55000000 },
  { id:'SP-H-002', jenis:'Nota',      kodeSupp:'AG001', namaSupp:'PT. Antigravity Test', noBukti:'BL26070005', tgl:'13-07-2026', jthTempo:'27-07-2026', nilai:32500000, sisa:32500000 },
  { id:'SP-H-003', jenis:'Uang Muka', kodeSupp:'AG001', namaSupp:'PT. Antigravity Test', noBukti:'UM-B-2026-004', tgl:'05-07-2026', jthTempo:'', nilai:15000000, sisa:15000000 },

  { id:'SP-H-004', jenis:'Nota',      kodeSupp:'MRR001', namaSupp:'Mr. ReyRehan', noBukti:'BL26070002', tgl:'10-07-2026', jthTempo:'24-07-2026', nilai:41000000, sisa:41000000 },
  { id:'SP-H-005', jenis:'Retur',     kodeSupp:'MRR001', namaSupp:'Mr. ReyRehan', noBukti:'RB26070001', tgl:'10-07-2026', jthTempo:'', nilai:4750000, sisa:4750000 },

  { id:'SP-H-006', jenis:'Nota',      kodeSupp:'P003', namaSupp:'PT. Prima Baja Sentosa', noBukti:'BL26070006', tgl:'14-07-2026', jthTempo:'13-08-2026', nilai:68000000, sisa:28000000 },
  { id:'SP-H-007', jenis:'Nota',      kodeSupp:'P003', namaSupp:'PT. Prima Baja Sentosa', noBukti:'BL26070009', tgl:'20-07-2026', jthTempo:'19-08-2026', nilai:22500000, sisa:22500000 },

  { id:'SP-H-008', jenis:'Nota',      kodeSupp:'S006', namaSupp:'CV. Sinar Metal', noBukti:'BL26070004', tgl:'12-07-2026', jthTempo:'26-07-2026', nilai:18000000, sisa:18000000 },
  { id:'SP-H-009', jenis:'Uang Muka', kodeSupp:'S006', namaSupp:'CV. Sinar Metal', noBukti:'UM-B-2026-007', tgl:'08-07-2026', jthTempo:'', nilai:6000000, sisa:6000000 },

  // Tambahan supaya Rekap/Kartu Hutang py variasi umur (>90 hari & lunas penuh)
  { id:'SP-H-010', jenis:'Nota', kodeSupp:'AG001', namaSupp:'PT. Antigravity Test', noBukti:'BL26030010', tgl:'10-03-2026', jthTempo:'24-03-2026', nilai:27000000, sisa:27000000 },
  { id:'SP-H-011', jenis:'Nota', kodeSupp:'P003',  namaSupp:'PT. Prima Baja Sentosa', noBukti:'BL26050020', tgl:'05-05-2026', jthTempo:'19-05-2026', nilai:15500000, sisa:0 },
];
