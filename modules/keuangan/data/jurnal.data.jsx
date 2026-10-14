// Akuntan — data Jurnal Memorial (jurnal manual: adjustment, reklasifikasi, koreksi)
//
// Setiap record dulu cuma punya field `total` (ringkasan), tidak ada breakdown baris debit/kredit
// sama sekali — akibatnya JurnalModal selalu mereset ke 2 baris kosong walau sedang edit jurnal
// yang sudah ada (lihat JurnalModal di JurnalMemorialPage.jsx). akJurnalLine() merekonstruksi 2
// baris debit/kredit yang balance ke `total` yang sudah ada, memakai akun nyata dari AKUN_BB yang
// cocok secara semantik dengan `desc` masing-masing jurnal (bukan akun acak).

const AK_STATUS_JURNAL_OPTS = ['Draft', 'Pending', 'Posted'];

function akJurnalLine(dAkun, dDesc, kAkun, kDesc, total) {
  return [
    { id:1, akun:dAkun, desc:dDesc, d:total, k:0 },
    { id:2, akun:kAkun, desc:kDesc, d:0, k:total },
  ];
}

const JURNAL_MEMO = [
  { tgl:'30-04-2026', no:'JM-2026-0042', desc:'Penyusutan aktiva tetap April 2026',                  total:  21541667, status:'Posted',  pembuat:'Accountant 1',
    lines: akJurnalLine('6000.000', 'Biaya penyusutan aktiva tetap', '1500.099', 'Akumulasi penyusutan aktiva tetap', 21541667) },
  { tgl:'30-04-2026', no:'JM-2026-0041', desc:'Reklasifikasi PPN masukan ke uang muka pajak',         total:  12350000, status:'Posted',  pembuat:'Accountant 1',
    lines: akJurnalLine('1022.001', 'Reklas ke piutang pajak PPh 22', '1022.000', 'Reklas dari PPN masukan', 12350000) },
  { tgl:'29-04-2026', no:'JM-2026-0040', desc:'Adjusment piutang ragu-ragu — CKR',                    total:   3200000, status:'Posted',  pembuat:'Accountant 2',
    lines: akJurnalLine('6000.000', 'Beban kerugian piutang', '1021.002', 'Cadangan kerugian piutang', 3200000) },
  { tgl:'28-04-2026', no:'JM-2026-0039', desc:'Pencatatan beban sewa kantor cabang Surabaya',         total:  18000000, status:'Pending', pembuat:'Accountant 2',
    lines: akJurnalLine('6000.000', 'Beban sewa kantor cabang Surabaya', '2000.000', 'Hutang sewa belum dibayar', 18000000) },
  { tgl:'25-04-2026', no:'JM-2026-0038', desc:'Koreksi pencatatan biaya BBM April',                   total:    850000, status:'Posted',  pembuat:'Accountant 1',
    lines: akJurnalLine('6000.000', 'Koreksi biaya BBM April', '100.002', 'Pengeluaran kas kecil', 850000) },
  { tgl:'22-04-2026', no:'JM-2026-0037', desc:'Pengakuan pendapatan jasa service tahap 1',            total:  14250000, status:'Posted',  pembuat:'Accountant 1',
    lines: akJurnalLine('1015.000', 'Piutang jasa service tahap 1', '4000.000', 'Pendapatan jasa service tahap 1', 14250000) },
  { tgl:'18-04-2026', no:'JM-2026-0036', desc:'Adjusment selisih kas opname',                          total:    150000, status:'Posted',  pembuat:'Accountant 2',
    lines: akJurnalLine('6000.000', 'Selisih kurang kas opname', '100.001', 'Penyesuaian kas besar', 150000) },
  { tgl:'15-04-2026', no:'JM-2026-0035', desc:'Reklasifikasi piutang karyawan',                        total:   5500000, status:'Draft',   pembuat:'Accountant 2',
    lines: akJurnalLine('1021.001', 'Reklas ke piutang direksi', '1021.000', 'Reklas dari piutang karyawan', 5500000) },
];
