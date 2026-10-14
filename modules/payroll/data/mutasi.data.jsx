// Payroll — Mutasi Karyawan (histori perpindahan/kenaikan/penurunan jabatan). Field & nilai record
// pertama (Kharim Sugeng Arianto, 2 baris histori 01-10-2023 & 01-01-2024) diambil PERSIS dari
// screenshot referensi "Mutasi Karyawan" (uploads/payroll/WhatsApp Image ...16.33.38.jpeg): Unit 01,
// Divisi D005, Status P01, Departemen T002, Bagian B023, Jabatan J015, Kelompok K026, Waktu Kerja
// W02, Golongan IA, semua nilai Komponen Gaji Baru/Lama & kolom kanan-jauh (Pot SPSI 2000, dst).
//
// Komponen Gaji: `komponenBaru`/`komponenLama` masing² 8 field (Gaji Pokok/Premi Hadir/Premi Bulanan/
// Premi Khler Per Hari/Tunjangan Tetap/Upah Perhari/Tarif Lembur/Gaji Pokok (+); `komponenLama`
// tambahan `berlakuSd`). Field kolom kanan-jauh di screenshot TIDAK diduplikasi per Baru/Lama (cuma
// 1 daftar utk seluruh baris mutasi) — disimpan flat di level record (gajiAstek..pph).
// `potBpjsTkPct`/`potBpjsKesPct` = field "Pot. BPJS-TK %"/"Pot. BPJS-Kes %" di panel Detil (beda
// dari `potBpjsTk`/`potBpjsKes` Rupiah di kolom kanan-jauh Komponen Gaji).

function prKomponen(overrides = {}) {
  return {
    gajiPokok:0, premiHadir:0, premiBulanan:0, premiKhlerPerHari:0, tunjanganTetap:0,
    upahPerhari:0, tarifLembur:0, gajiPokokPlus:0, berlakuSd:'',
    ...overrides,
  };
}

function prMutasiRow(id, noInduk, tanggal, opts = {}) {
  return {
    id, noInduk, tanggal,
    unit: opts.unit || '01', kodeDivisi: opts.kodeDivisi || 'D005', kodeStatus: opts.kodeStatus || 'P01',
    kodeDepartemen: opts.kodeDepartemen || 'T002', kodeBagian: opts.kodeBagian,
    kodeJabatan: opts.kodeJabatan || 'J015', kodeKelompok: opts.kodeKelompok || 'K026',
    kodeWaktuKerja: opts.kodeWaktuKerja || 'W02', grade: opts.grade || '', kodeGolongan: opts.kodeGolongan || 'IA',
    potBpjsTkPct: opts.potBpjsTkPct ?? 0, potBpjsKesPct: opts.potBpjsKesPct ?? 0,
    tidakLembur: !!opts.tidakLembur, hitungJabatan: !!opts.hitungJabatan, keterangan: opts.keterangan || '',
    komponenBaru: opts.komponenBaru || prKomponen(),
    komponenLama: opts.komponenLama || prKomponen(),
    gajiAstek:0, gajiBpjsK:0, tunjJabatan:0, fixedCost:0, tunjInsentif:0, terimaLain:0, variableCost:0,
    potUpah:0, potSpsi: opts.potSpsi ?? 0, potBpjsTk:0, potBpjsKes:0, potLainLain:0, potPensiun:0, pph:0,
    ...(opts.extra || {}),
  };
}

const PR_MUTASI = [
  // Persis screenshot — 2 baris histori Kharim Sugeng Arianto
  prMutasiRow(1, '000001010523', '2023-10-01', {
    kodeBagian:'B023',
    komponenBaru: prKomponen({ gajiPokok:2000000, premiKhlerPerHari:1000, upahPerhari:66667, tarifLembur:0 }),
    komponenLama: prKomponen({ gajiPokok:1900000, upahPerhari:63333, berlakuSd:'2023-09-30' }),
    potSpsi:2000,
  }),
  prMutasiRow(2, '000001010523', '2024-01-01', {
    kodeBagian:'B023', keterangan:'Penyesuaian upah awal tahun',
    komponenBaru: prKomponen({ gajiPokok:2000000, premiHadir:1350, premiBulanan:145000, premiKhlerPerHari:1000, upahPerhari:66667, tarifLembur:9524 }),
    komponenLama: prKomponen({ gajiPokok:2000000, premiKhlerPerHari:1000, upahPerhari:66667, tarifLembur:0, berlakuSd:'2023-12-31' }),
    potSpsi:2000,
  }),

  // 1 baris histori awal utk karyawan lain — cukup utk resolve "Bagian saat ini" & jadi basis
  // Komponen Gaji Absensi (§7)/base Borongan (§9).
  prMutasiRow(3, '000002010122', '2021-01-22', { kodeBagian:'B021', kodeJabatan:'J010', kodeKelompok:'K020',
    komponenBaru: prKomponen({ gajiPokok:1950000, premiHadir:1250, premiBulanan:130000, premiKhlerPerHari:900, upahPerhari:65000, tarifLembur:9200 }) }),
  prMutasiRow(4, '000003210809', '2021-08-09', { kodeBagian:'B025', kodeDepartemen:'T003', kodeJabatan:'J020', kodeKelompok:'K035', kodeStatus:'P02',
    komponenBaru: prKomponen({ gajiPokok:2100000, premiHadir:1400, premiBulanan:150000, premiKhlerPerHari:1050, upahPerhari:70000, tarifLembur:9900 }) }),
  prMutasiRow(5, '000009970529', '2010-05-29', { kodeBagian:'B023', kodeJabatan:'J025',
    komponenBaru: prKomponen({ gajiPokok:2200000, premiHadir:1500, premiBulanan:160000, premiKhlerPerHari:1100, upahPerhari:73333, tarifLembur:10476 }) }),
  prMutasiRow(6, '000010110601', '2011-06-01', { kodeBagian:'B021', kodeDepartemen:'T005', kodeJabatan:'J030', kodeStatus:'P03', kodeGolongan:'IIA',
    komponenBaru: prKomponen({ gajiPokok:2400000, tunjanganTetap:250000, upahPerhari:80000 }) }),

  // Karyawan Bagian B022 - Packing 5 (persis nama+tgl masuk contoh PDF), semua kena set gaji sama
  // spt PDF (Gaji 4,646,582 / 4,656,582, Premi Bulan bervariasi, dst — nilai dari "MASA KERJA"
  // report periode Maret 2024, diprorata jadi Komponen Gaji bulanan Baru).
  prMutasiRow(7, '000011970319', '1997-03-19', { kodeBagian:'B022',
    komponenBaru: prKomponen({ gajiPokok:4646582, premiBulanan:205000, premiKhlerPerHari:1250, upahPerhari:154886 }) }),
  prMutasiRow(8, '000012990919', '1999-09-19', { kodeBagian:'B022',
    komponenBaru: prKomponen({ gajiPokok:4656582, premiBulanan:210000, premiKhlerPerHari:1250, upahPerhari:155219 }) }),
  prMutasiRow(9, '000013010113', '2001-01-13', { kodeBagian:'B022',
    komponenBaru: prKomponen({ gajiPokok:4656582, premiBulanan:0, premiKhlerPerHari:1350, upahPerhari:155219 }) }),
  prMutasiRow(10, '000014990217', '1999-02-17', { kodeBagian:'B022',
    komponenBaru: prKomponen({ gajiPokok:4656582, premiBulanan:505000, premiKhlerPerHari:1350, upahPerhari:155219 }) }),
  prMutasiRow(11, '000015941018', '1994-10-18', { kodeBagian:'B022',
    komponenBaru: prKomponen({ gajiPokok:4656582, premiBulanan:275000, premiKhlerPerHari:1350, upahPerhari:155219 }) }),
  prMutasiRow(12, '000016000803', '2000-08-03', { kodeBagian:'B022',
    komponenBaru: prKomponen({ gajiPokok:4646582, premiBulanan:180000, premiKhlerPerHari:1250, upahPerhari:154886 }) }),
];
