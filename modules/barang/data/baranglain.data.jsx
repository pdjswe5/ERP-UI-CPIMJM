// Barang — seed data Barang Lain.
//
// Shape sesuai redesain form: hppStandar & satuan tunggal dihapus, digantikan satuanKonversi[]
// (tiap baris: kodeSatuan dari BRG_SATUAN_KONVERSI_OPTS, isi, hargaJual, aktif '1'/'0').
// kodeKategori dibatasi ke LAIN/PENOLONG/SPARE/TOOLS, tipeData F/K saja, minimQty >= 1,
// keterangan wajib terisi. 40 record, tiap produk 1-5 baris konversi (dibangun lewat helper
// lnKonversi supaya variatif tanpa menulis tiap baris manual, mengikuti pola generator seed
// data lain sesi ini — mis. spkBjRows di modul Manufaktur).

const LN_SATUAN_CODES = BRG_SATUAN_KONVERSI_OPTS.map(s => s.kode); // ['51'..'57'] = PCS,KG,LBR,MTR,ROLL,ZAK,PSG
const LN_ISI_STEPS = [1, 6, 10, 12, 24, 50];

// Generator baris Satuan & Konversi (1-5 baris) — harga per satuan besar dihitung dari
// basePrice (harga satuan terkecil) dikali faktor isi, supaya masuk akal secara bisnis.
function lnKonversi(count, offset, basePrice) {
  return Array.from({ length: count }, (_, i) => {
    const idx = offset + i;
    const isi = LN_ISI_STEPS[i % LN_ISI_STEPS.length];
    return {
      kodeSatuan: LN_SATUAN_CODES[idx % LN_SATUAN_CODES.length],
      isi, hargaJual: Math.round(basePrice * isi),
      aktif: (idx % 11 === 0) ? '0' : '1',
    };
  });
}

function lnRow(kode, nama, kategori, tipe, aktif, minQty, ket, konversiCount, offset, basePrice) {
  return {
    kodeProduk:kode, namaProduk:nama, kodeKategori:kategori, tipeData:tipe, aktif, minimQty:minQty, keterangan:ket,
    satuanKonversi: lnKonversi(konversiCount, offset, basePrice),
  };
}

const BARANG_LAIN = [
  lnRow('LN-001', 'Jam Dinding Custom',            'LAIN',     'F', true,  10,  'Barang non-manufaktur',                          2, 0,  35000),
  lnRow('LN-002', 'Kalender Promosi',               'LAIN',     'F', true,  50,  'Cetak musiman akhir tahun',                      1, 1,  8000),
  lnRow('LN-003', 'Sarung Tangan Kerja',             'PENOLONG', 'F', true,  20,  'Alat pelindung diri operator produksi',          2, 2,  12000),
  lnRow('LN-004', 'Stiker Logo Perusahaan',          'LAIN',     'F', false, 100, 'Discontinued',                                   1, 3,  1500),
  lnRow('LN-005', 'Kemasan Dus Kecil',               'LAIN',     'F', true,  200, 'Kemasan produk jadi ukuran kecil',               2, 4,  2500),
  lnRow('LN-006', 'Tali Pengikat Coil',              'SPARE',    'K', true,  15,  'Kebutuhan pengikat hasil produksi coil',         1, 5,  45000),
  lnRow('LN-007', 'Payung Promosi',                  'LAIN',     'F', true,  25,  'Merchandise event pameran',                      2, 6,  55000),
  lnRow('LN-008', 'Mug Custom Logo',                 'LAIN',     'F', true,  40,  'Souvenir tamu kantor',                           1, 7,  22000),
  lnRow('LN-009', 'Kaos Seragam Kerja',               'LAIN',     'F', true,  30,  'Seragam operator produksi',                      5, 8,  45000),
  lnRow('LN-010', 'Topi Promosi',                    'LAIN',     'F', true,  30,  'Merchandise event pameran',                      1, 9,  18000),
  lnRow('LN-011', 'Gantungan Kunci Logo',             'LAIN',     'F', true,  100, 'Souvenir kecil untuk customer',                  2, 10, 5000),
  lnRow('LN-012', 'Plakat Penghargaan',               'LAIN',     'F', true,  5,   'Penghargaan karyawan teladan',                   1, 11, 150000),
  lnRow('LN-013', 'Masker N95',                       'PENOLONG', 'F', true,  100, 'APD area produksi debu tinggi',                  2, 12, 6000),
  lnRow('LN-014', 'Kacamata Safety',                  'PENOLONG', 'F', true,  30,  'APD wajib area cutting',                         1, 13, 25000),
  lnRow('LN-015', 'Lem Perekat Industri',             'PENOLONG', 'K', true,  20,  'Bahan penolong proses packing',                  2, 14, 32000),
  lnRow('LN-016', 'Solar Industri',                   'PENOLONG', 'K', true,  200, 'Bahan bakar genset cadangan',                    1, 15, 13500),
  lnRow('LN-017', 'Oli Pelumas Mesin',                'PENOLONG', 'K', true,  40,  'Perawatan berkala mesin produksi',               4, 16, 65000),
  lnRow('LN-018', 'Kain Majun',                       'PENOLONG', 'F', true,  50,  'Pembersih area mesin & lantai produksi',         1, 17, 9000),
  lnRow('LN-019', 'Cairan Pembersih Mesin',           'PENOLONG', 'K', true,  25,  'Perawatan rutin mesin slitting',                 2, 18, 28000),
  lnRow('LN-020', 'Isolasi Listrik',                  'PENOLONG', 'F', true,  60,  'Perbaikan instalasi kelistrikan panel',          1, 19, 4500),
  lnRow('LN-021', 'Kertas Amplas',                    'PENOLONG', 'F', true,  80,  'Finishing permukaan sebelum cat',                 2, 20, 3500),
  lnRow('LN-022', 'Bearing Mesin TRIM',               'SPARE',    'K', true,  6,   'Spare part mesin TRIM 1 & TRIM 2',               1, 21, 185000),
  lnRow('LN-023', 'Belt Conveyor',                    'SPARE',    'K', true,  4,   'Spare part jalur conveyor produksi',             2, 22, 275000),
  lnRow('LN-024', 'Sekring Panel Listrik',            'SPARE',    'F', true,  30,  'Cadangan panel listrik area produksi',           1, 23, 15000),
  lnRow('LN-025', 'Baut & Mur Set',                   'SPARE',    'F', true,  50,  'Kebutuhan maintenance rutin mesin',              3, 24, 8000),
  lnRow('LN-026', 'Roda Gigi Mesin Slitting',         'SPARE',    'K', false, 3,   'Spare part khusus, stok terbatas',               1, 25, 620000),
  lnRow('LN-027', 'Kabel Power Mesin',                'SPARE',    'K', true,  10,  'Cadangan kabel power mesin produksi',            2, 26, 45000),
  lnRow('LN-028', 'Filter Udara Kompresor',           'SPARE',    'F', true,  12,  'Perawatan berkala kompresor udara',              1, 27, 65000),
  lnRow('LN-029', 'Seal Karet Mesin',                 'SPARE',    'K', true,  20,  'Spare part seal mesin coating',                  2, 28, 18000),
  lnRow('LN-030', 'Mata Pisau Potong',                'SPARE',    'K', true,  15,  'Consumable mesin slitting & cutting',            2, 29, 95000),
  lnRow('LN-031', 'Kunci Pas Set',                    'TOOLS',    'F', true,  8,   'Alat kerja bengkel maintenance',                 1, 30, 250000),
  lnRow('LN-032', 'Palu Karet',                       'TOOLS',    'F', true,  10,  'Alat kerja perakitan',                           1, 31, 45000),
  lnRow('LN-033', 'Obeng Set Elektrik',               'TOOLS',    'F', true,  6,   'Alat kerja perbaikan panel listrik',             1, 32, 320000),
  lnRow('LN-034', 'Meteran Baja 5M',                  'TOOLS',    'F', true,  15,  'Alat ukur produksi & QC',                        1, 33, 35000),
  lnRow('LN-035', 'Gerinda Tangan',                   'TOOLS',    'F', true,  4,   'Alat kerja maintenance & fabrikasi',             2, 34, 450000),
  lnRow('LN-036', 'Tang Kombinasi',                   'TOOLS',    'F', true,  20,  'Alat kerja bengkel maintenance',                 1, 35, 55000),
  lnRow('LN-037', 'Waterpass Digital',                'TOOLS',    'F', true,  5,   'Alat ukur presisi instalasi mesin',              1, 36, 275000),
  lnRow('LN-038', 'Bor Tangan',                       'TOOLS',    'F', true,  6,   'Alat kerja maintenance & fabrikasi',             2, 37, 385000),
  lnRow('LN-039', 'Cutter Industri',                  'TOOLS',    'F', true,  25,  'Alat kerja area packing',                        1, 38, 28000),
  lnRow('LN-040', 'Gunting Plat',                     'TOOLS',    'F', true,  10,  'Alat kerja fabrikasi plat metal',                2, 39, 95000),
];
