// Manufaktur — seed data Surat Perintah Kerja (SPK).
//
// Data lengkap: setiap SPK punya beberapa baris Barang Jadi (bjLines, 2-4 baris), dan tiap Barang
// Jadi itu sendiri punya beberapa Bahan (bahanLines, 2-3 baris per barang) yang terhubung lewat
// field bjLineId — dipakai SpkPage.jsx (klik 1 baris Barang Jadi, Bahan di bawahnya ikut
// terfilter sesuai barang yang dipilih). Sebelumnya bjLines & bahanLines dua tabel independen
// tanpa hubungan sama sekali. Pola generator: helper per-baris (spkBjRow/spkBahanRow) + helper
// gabungan per-SPK (spkBjWithBahan) yang membangun bjLines sekaligus bahanLines-nya, + helper
// header (spkHead). 24 record, mencakup semua 9 status di MF_STATUS_SPK — sengaja diperbanyak
// yang berstatus 'Approved' (9 dari 24) supaya pool SPK "outstanding & sudah Approved" yang bisa
// dipilih dari Planning Schedule Produksi Harian juga lebih banyak. No. SPK memakai format F/K +
// SPK + YYMM + urut, sama seperti nomor yang dibuat otomatis oleh gerbang F/K di MfSpkDialog
// (lihat handleSave).

// Barang Jadi & Bahan SPK sekarang dari katalog modul Barang (BARANG_JADI/BAHAN_BAKU/BARANG_LAIN)
// — sebelumnya dari MF_BARANG, katalog kecil ad-hoc milik Manufaktur sendiri yang isinya campur
// barang jadi ASLI dan bahan "palsu" berkode "*" (mis. "*CO", "*P") yang bukan barang sungguhan.
// Modul Barang dimuat lebih dulu di index.html dari modul Manufaktur, jadi BARANG_JADI/BAHAN_BAKU/
// BARANG_LAIN/brgMerkNama/brgBomResolveKomponen sudah tersedia saat file ini di-parse.
let _spkRowId = 9000;
function mfLookupKode(list, nama) { const f = list.find(x => x.nama === nama); return f ? f.kode : ''; }

function spkBjRow(kodeBarang, qtySPK, satuan, namaKelompokWarna, namaAz, namaBrand, stempel, mesinDipilih) {
  const b = BARANG_JADI.find(x => x.kodeProduk === kodeBarang);
  const namaMerkBarang = b?.merk ? brgMerkNama(b.merk) : '';
  return {
    id: _spkRowId++, kodeBarang, namaBarang: b ? b.namaProduk : '', qtySPK, satuan,
    kelompokWarna: mfLookupKode(MF_KELOMPOK_WARNA_LIST, namaKelompokWarna), namaKelompokWarna,
    az: mfLookupKode(MF_AZ_LIST, namaAz), namaAz,
    brand: mfLookupKode(MF_BRAND_LIST, namaBrand), namaBrand,
    merkBarang: mfLookupKode(MF_MERK_BARANG_LIST, namaMerkBarang), namaMerkBarang,
    stempel: stempel || '', mesinDipilih: mesinDipilih || [],
  };
}
function spkBahanRow(gudang, kodeBahan, jumlah, satuan, bjLineId) {
  const resolved = brgBomResolveKomponen(kodeBahan);
  return { id: _spkRowId++, bjLineId, gudang, kodeBahan, merkBahan: resolved ? resolved.keterangan : '', jumlah, satuan };
}

// 5 Barang Jadi Umum (JD-001..JD-005 selalu ada — lihat generator bjRow di barangjadi.data.jsx)
// & pool Bahan Baku/Penolong/Lain yang relevan buat produksi atap/steel.
const SPK_BJ_CODES = ['JD-001', 'JD-002', 'JD-003', 'JD-004', 'JD-005'];
const SPK_BAHAN_CODES = ['BB-001', 'BB-002', 'BB-003', 'BB-004', 'BB-005', 'LN-003', 'LN-005', 'LN-013', 'LN-015', 'LN-017', 'LN-021'];
const SPK_WARNA = MF_KELOMPOK_WARNA_LIST.map(w => w.nama);
const SPK_AZ = MF_AZ_LIST.map(a => a.nama);
const SPK_BRAND = MF_BRAND_LIST.map(b => b.nama);

// Generator baris Barang Jadi (2-4 baris per SPK) — dipakai supaya tiap SPK punya beberapa barang
// jadi tanpa harus menulis tiap baris manual, tetap bervariasi lewat parameter offset.
function spkBjRows(count, offset, stempel) {
  return Array.from({ length: count }, (_, i) => {
    const idx = offset + i;
    return spkBjRow(
      SPK_BJ_CODES[idx % SPK_BJ_CODES.length],
      60 + ((idx * 37) % 440),
      MF_SATUAN_SPK[idx % MF_SATUAN_SPK.length],
      SPK_WARNA[idx % SPK_WARNA.length],
      SPK_AZ[idx % SPK_AZ.length],
      SPK_BRAND[idx % SPK_BRAND.length],
      i === 0 ? (stempel || '') : '',
      [MF_MESIN_LIST[idx % MF_MESIN_LIST.length], MF_MESIN_LIST[(idx + 3) % MF_MESIN_LIST.length]],
    );
  });
}

// Generator gabungan: bikin bjLines (spkBjRows di atas, TIDAK diubah) lalu, untuk TIAP baris
// barang jadi yang dihasilkan, bikin 2-3 baris bahan yang bjLineId-nya nunjuk balik ke baris
// barang jadi itu — inilah yang bikin 1 barang jadi bisa punya beberapa bahan (2-3 atau lebih)
// dan SpkPage.jsx bisa memfilter Bahan berdasarkan Barang Jadi yang diklik. Return array
// [bjLines, bahanLines] (bukan object) supaya bisa langsung di-spread jadi 2 argumen positional
// spkHead di bawah.
function spkBjWithBahan(bjCount, bjOffset, bahanOffset, stempel) {
  const bjLines = spkBjRows(bjCount, bjOffset, stempel);
  const bahanLines = [];
  let cursor = bahanOffset;
  bjLines.forEach((bj, i) => {
    const nBahan = 2 + ((bjOffset + i) % 2); // 2 atau 3 bahan per barang jadi, bervariasi
    for (let j = 0; j < nBahan; j++) {
      const idx = cursor++;
      const kode = SPK_BAHAN_CODES[idx % SPK_BAHAN_CODES.length];
      const satuan = brgBomResolveKomponen(kode)?.satuan || 'MTR';
      bahanLines.push(spkBahanRow(MF_GUDANG_LIST[idx % MF_GUDANG_LIST.length], kode, 15 + ((idx * 23) % 285), satuan, bj.id));
    }
  });
  return [bjLines, bahanLines];
}

function spkHead(no, tgl, status, bjLines, bahanLines, opts={}) {
  const isApproved = ['Approved', 'Realisasi', 'Selesai'].includes(status) || !!opts.isApproved;
  return {
    no, tgl, noSo: opts.noSo || '', stempel: opts.stempel || bjLines[0]?.stempel || '',
    status, tglKirim: opts.tglKirim || '',
    produk: bjLines[0]?.namaBarang || '', gudang: bahanLines[0]?.gudang || '',
    qty: bjLines[0]?.qtySPK || 0, kodeBahan: bahanLines[0]?.kodeBahan || '',
    bjLines, bahanLines,
    dibuatOleh: opts.dibuatOleh || 'Admin', dibuatTgl: opts.dibuatTgl || `${tgl} 08:00`,
    isApproved, disetujuiOleh: isApproved ? (opts.disetujuiOleh || 'Supervisor Produksi') : '',
    disetujuiTgl: isApproved ? (opts.disetujuiTgl || `${tgl} 10:30`) : '',
    Batal: status === 'Batal', Alasan_Batal: opts.alasanBatal || '',
  };
}

const MF_SPK_SEED = [
  spkHead('FSPK26060601', '01-06-2026', 'Draft',
    ...spkBjWithBahan(2, 0, 0), {}),

  spkHead('KSPK26060602', '02-06-2026', 'Pending Approval',
    ...spkBjWithBahan(3, 2, 10, 'Urgent'), { noSo:'KSO26070001', tglKirim:'2026-06-10' }),

  spkHead('FSPK26060603', '03-06-2026', 'Approved',
    ...spkBjWithBahan(3, 5, 20, 'Lunas COD'), { noSo:'FSO26070002', tglKirim:'2026-06-11' }),

  spkHead('KSPK26060604', '04-06-2026', 'Proses',
    ...spkBjWithBahan(2, 8, 30), {}),

  spkHead('FSPK26060605', '05-06-2026', 'Realisasi',
    ...spkBjWithBahan(4, 10, 40, 'VIP Customer'), { noSo:'KSO26070003', tglKirim:'2026-06-12' }),

  spkHead('KSPK26060606', '06-06-2026', 'Realisasi',
    ...spkBjWithBahan(3, 14, 55), { tglKirim:'2026-06-13' }),

  spkHead('FSPK26060607', '07-06-2026', 'Selesai',
    ...spkBjWithBahan(3, 17, 65, 'Kapal Langka'), { noSo:'KSO26070004', tglKirim:'2026-06-14' }),

  spkHead('KSPK26060608', '08-06-2026', 'Hold',
    ...spkBjWithBahan(2, 20, 75), {}),

  spkHead('FSPK26060609', '09-06-2026', 'Draft',
    ...spkBjWithBahan(2, 22, 82), {}),

  spkHead('KSPK26060610', '10-06-2026', 'Pending Approval',
    ...spkBjWithBahan(4, 24, 89, 'Cek ada Gabungan'), { noSo:'FSO26070005', tglKirim:'2026-06-16' }),

  spkHead('FSPK26060611', '11-06-2026', 'Approved',
    ...spkBjWithBahan(3, 28, 100), { tglKirim:'2026-06-17' }),

  spkHead('KSPK26060612', '12-06-2026', 'Batal',
    ...spkBjWithBahan(2, 31, 110), { alasanBatal:'Order dibatalkan customer, bahan belum diproses' }),

  spkHead('FSPK26060613', '13-06-2026', 'Proses',
    ...spkBjWithBahan(3, 33, 116, 'Urgent'), { noSo:'KSO26070006', tglKirim:'2026-06-19' }),

  spkHead('KSPK26060614', '14-06-2026', 'Realisasi',
    ...spkBjWithBahan(3, 36, 126), { noSo:'KSO26070007', tglKirim:'2026-06-20' }),

  spkHead('FSPK26060615', '15-06-2026', 'Selesai',
    ...spkBjWithBahan(2, 39, 136, 'Lunas COD'), { tglKirim:'2026-06-21' }),

  spkHead('KSPK26060616', '16-06-2026', 'Batal',
    ...spkBjWithBahan(2, 41, 142), { alasanBatal:'Salah input spesifikasi warna, dibuat ulang sebagai SPK baru' }),

  // Tambahan baru — mayoritas 'Approved' supaya SPK outstanding yang bisa dipilih di Planning
  // Schedule Produksi Harian jauh lebih banyak (sebelumnya cuma 2 dari 16 record berstatus Approved).
  spkHead('FSPK26060617', '17-06-2026', 'Approved',
    ...spkBjWithBahan(3, 43, 148, 'Urgent'), { noSo:'FSO26070008', tglKirim:'2026-06-23' }),

  spkHead('KSPK26060618', '18-06-2026', 'Approved',
    ...spkBjWithBahan(2, 46, 158), { tglKirim:'2026-06-24' }),

  spkHead('FSPK26060619', '19-06-2026', 'Approved',
    ...spkBjWithBahan(4, 48, 165, 'VIP Customer'), { noSo:'KSO26070009', tglKirim:'2026-06-25' }),

  spkHead('KSPK26060620', '20-06-2026', 'Approved',
    ...spkBjWithBahan(3, 52, 176), { tglKirim:'2026-06-26' }),

  spkHead('FSPK26060621', '21-06-2026', 'Approved',
    ...spkBjWithBahan(2, 55, 186), { noSo:'FSO26070010', tglKirim:'2026-06-27' }),

  spkHead('KSPK26060622', '22-06-2026', 'Approved',
    ...spkBjWithBahan(3, 57, 193, 'Lunas COD'), { tglKirim:'2026-06-28' }),

  spkHead('FSPK26060623', '23-06-2026', 'Approved',
    ...spkBjWithBahan(2, 60, 204), { tglKirim:'2026-06-29' }),

  spkHead('KSPK26060624', '24-06-2026', 'Proses',
    ...spkBjWithBahan(3, 62, 211), {}),
];
