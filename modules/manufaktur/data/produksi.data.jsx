// Manufaktur — seed data Hasil Produksi & Pemakaian Bahan.
//
// 1 No. Bukti = 1 Barang Jadi (bukan 1 dokumen berisi banyak baris SPK lagi) — kalau sebuah SPK
// yang dipilih punya 3 Barang Jadi, itu menghasilkan 3 record Hasil Produksi terpisah. Field Barang
// Jadi (kodeBarang/namaBarang/qtySPK/satuan/kelompokWarna/az/brand/merkBarang/stempel/mesinDipilih)
// disalin APA ADANYA dari spk.bjLines[] milik SPK yang dipilih (nama field sama persis, tidak ada
// lagi merkSpk/kodeMerkSpk dsb yang menduplikasi field itu dengan nama beda). bahanLines juga
// disalin dari spk.bahanLines[] (difilter per bjLineId), ditambah 5 field pemakaian
// (noCoil/kondisi/lapisanPu/pembelian/sisaStok) yang sekarang per-Bahan, bukan per-SPK — cocok
// dengan nama modul ini sendiri ("Pemakaian Bahan": 1 coil = 1 satuan bahan baku, bukan 1 satuan
// barang jadi/SPK).
//
// Seed dibangun HANYA dari SPK berstatus Approved (9 dari 24 SPK di MF_SPK_SEED) — Hasil Produksi
// hanya boleh mereferensikan SPK yang sudah Approved (lihat filter di MfSpkPickerModal pada
// HasilProduksiPage.jsx), jadi seed di sini mengikuti aturan yang sama supaya representatif.

let _hpBahanId = 8000;

// `opts.coilOffset`/`opts.kondisiOffset` — offset ke pool HP_COIL_NOS/HP_KONDISI supaya variasi
// antar record beda, bukan selalu mulai dari indeks 0.
function hpRecord(no, spkNo, bjIdx, opts = {}) {
  const spk = MF_SPK_SEED.find(s => s.no === spkNo);
  const bjLines = (spk?.bjLines || []).filter(b => !b._deleted);
  const bj = bjLines[bjIdx % (bjLines.length || 1)] || {};
  const bahanForBj = (spk?.bahanLines || []).filter(b => b.bjLineId === bj.id);
  const tgl = opts.tgl || spk?.tgl || '2026-06-24';
  const coilOffset = opts.coilOffset || 0;
  const kondisiOffset = opts.kondisiOffset || 0;

  return {
    no, tgl, gudang: spk?.gudang || '',
    dibuatOleh: 'Admin', dibuatTgl: `${tgl} 09:00`,

    noSpk: spkNo, bjLineId: bj.id || null,

    kodeBarang: bj.kodeBarang || '', namaBarang: bj.namaBarang || '',
    qtySPK: bj.qtySPK ?? '', satuan: bj.satuan || '',
    kelompokWarna: bj.kelompokWarna || '', namaKelompokWarna: bj.namaKelompokWarna || '',
    az: bj.az || '', namaAz: bj.namaAz || '',
    brand: bj.brand || '', namaBrand: bj.namaBrand || '',
    merkBarang: bj.merkBarang || '', namaMerkBarang: bj.namaMerkBarang || '',
    stempel: bj.stempel || '',
    mesinDipilih: bj.mesinDipilih || [],

    bahanLines: bahanForBj.map((b, i) => ({
      id: _hpBahanId++,
      gudang: b.gudang, kodeBahan: b.kodeBahan, merkBahan: b.merkBahan, jumlah: b.jumlah, satuan: b.satuan,
      noCoil: HP_COIL_NOS[(coilOffset + i) % HP_COIL_NOS.length],
      kondisi: HP_KONDISI[(kondisiOffset + i) % HP_KONDISI.length],
      lapisanPu: i % 2 === 0 ? 'Atas' : 'Bawah',
      pembelian: '',
      sisaStok: String(b.jumlah ?? '0'),
    })),
  };
}

const HP_COIL_NOS = ['CO-2026-001', 'CO-2026-002', 'CO-2026-003', 'CO-2026-004', 'CO-2026-005', 'CO-2026-006'];
const HP_KONDISI = ['Normal', 'Termasuk Tong Coil', 'Sisa Slitting PU', 'Tong Coil & Sisa Slitting PU'];

// SPK berstatus Approved di MF_SPK_SEED (9 record) — jumlah bjLines masing-masing menentukan berapa
// Hasil Produksi yang dihasilkan dari SPK itu (1 record per Barang Jadi).
const HP_APPROVED_SPK = [
  { no: 'FSPK26060603', bjCount: 3 },
  { no: 'FSPK26060611', bjCount: 3 },
  { no: 'FSPK26060617', bjCount: 3 },
  { no: 'KSPK26060618', bjCount: 2 },
  { no: 'FSPK26060619', bjCount: 4 },
  { no: 'KSPK26060620', bjCount: 3 },
  { no: 'FSPK26060621', bjCount: 2 },
  { no: 'KSPK26060622', bjCount: 3 },
  { no: 'FSPK26060623', bjCount: 2 },
];

function hpAutoNo(idx) {
  const prefix = idx % 2 === 0 ? 'K' : 'F';
  return prefix + 'HP2606' + String(601 + idx).padStart(4, '0');
}

const MF_PRODUKSI_SEED = [];
{
  let idx = 0;
  HP_APPROVED_SPK.forEach(({ no: spkNo, bjCount }) => {
    for (let bjIdx = 0; bjIdx < bjCount; bjIdx++) {
      MF_PRODUKSI_SEED.push(hpRecord(hpAutoNo(idx), spkNo, bjIdx, { coilOffset: idx, kondisiOffset: idx }));
      idx++;
    }
  });
}
