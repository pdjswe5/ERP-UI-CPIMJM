// Barang — Bill of Material (BOM): resep komponen per Barang Jadi, menghubungkan BARANG_JADI
// (kodeKategori JADI/JADIPU) dengan Bahan Baku (BAHAN_BAKU, kodeKategori BAKU), Bahan Penolong
// (BARANG_LAIN kodeKategori PENOLONG), dan Barang Lain (BARANG_LAIN kodeKategori LAIN/SPARE/TOOLS
// — disatukan sebagai jenisKomponen 'LAIN' di BOM ini, sesuai 3 kelompok yang diminta: Bahan Baku/
// Penolong/Lain). Dipakai popup Tambah/Edit BOM (BomPage.jsx) dan auto-fill Bahan saat SPK (modul
// Manufaktur) memilih Barang Jadi — lihat brgBomFor/brgBomBuildBahanLines dipakai langsung di
// modules/manufaktur/components/MfPickers.jsx & modules/manufaktur/pages/SpkPage.jsx (SPK & Barang
// sekarang satu katalog Barang Jadi/Bahan yang sama, MF_BARANG lama sudah dipensiunkan).
//
// qtyPerUnit = rasio komponen per 1 satuan Qty barang jadi; jumlah aktual dihitung saat BOM
// diterapkan (qtyPerUnit * qty), bukan disimpan statis di sini, supaya tetap benar kalau qty-nya
// diubah user. Komponen cuma simpan {kodeKomponen, qtyPerUnit} — nama/jenis/satuan di-resolve
// dinamis dari katalog aslinya (brgBomResolveKomponen) supaya BOM tidak pernah nyimpan data
// duplikat yang bisa basi kalau katalog sumbernya berubah.
const BRG_BOM_MANUAL = [
  { kodeBarangJadi:'JD-001', komponen:[
      { kodeKomponen:'BB-001', qtyPerUnit:1.05 },
      { kodeKomponen:'LN-015', qtyPerUnit:0.02 },
      { kodeKomponen:'LN-005', qtyPerUnit:1 },
    ] },
  { kodeBarangJadi:'JD-002', komponen:[
      { kodeKomponen:'BB-002', qtyPerUnit:1.08 },
      { kodeKomponen:'LN-017', qtyPerUnit:0.01 },
    ] },
  { kodeBarangJadi:'JD-003', komponen:[
      { kodeKomponen:'BB-003', qtyPerUnit:1.1 },
      { kodeKomponen:'LN-021', qtyPerUnit:0.03 },
      { kodeKomponen:'LN-003', qtyPerUnit:0.01 },
    ] },
  { kodeBarangJadi:'JD-004', komponen:[
      { kodeKomponen:'BB-004', qtyPerUnit:1.02 },
      { kodeKomponen:'LN-013', qtyPerUnit:0.005 },
    ] },
  { kodeBarangJadi:'JD-005', komponen:[
      { kodeKomponen:'BB-005', qtyPerUnit:1.15 },
      { kodeKomponen:'LN-005', qtyPerUnit:1 },
      { kodeKomponen:'LN-015', qtyPerUnit:0.02 },
    ] },
  { kodeBarangJadi:'PU-001', komponen:[
      { kodeKomponen:'BB-006', qtyPerUnit:1 },
      { kodeKomponen:'BB-007', qtyPerUnit:1 },
      { kodeKomponen:'LN-015', qtyPerUnit:0.05 },
    ] },
  { kodeBarangJadi:'PU-002', komponen:[
      { kodeKomponen:'BB-008', qtyPerUnit:1 },
      { kodeKomponen:'BB-009', qtyPerUnit:1 },
      { kodeKomponen:'LN-017', qtyPerUnit:0.02 },
    ] },
];

// 33 Barang Jadi sisanya (JD-006..020, PU-003..020) di-generate otomatis supaya SEMUA 40 Barang
// Jadi (bukan cuma 7 di atas) punya resep & auto-fill Bahan konsisten kapan pun dipilih di SPK —
// pola sama dgn resep manual: 1-2 komponen Bahan Baku sebagai bahan utama + 1 komponen Penolong/
// Lain, qtyPerUnit bervariasi wajar (mendekati 1 utk bahan utama, kecil utk penolong).
const BOM_PENOLONG_POOL = ['LN-003','LN-013','LN-014','LN-015','LN-016','LN-017','LN-018','LN-019','LN-020','LN-021'];
const BOM_LAIN_POOL = ['LN-001','LN-002','LN-005','LN-007','LN-008'];

function bomAutoRow(kodeBarangJadi, idx) {
  const bakuKode1 = `BB-${String((idx * 3) % 40 + 1).padStart(3,'0')}`;
  const bakuKode2 = `BB-${String((idx * 3 + 11) % 40 + 1).padStart(3,'0')}`;
  const penolong = BOM_PENOLONG_POOL[idx % BOM_PENOLONG_POOL.length];
  const lain = BOM_LAIN_POOL[idx % BOM_LAIN_POOL.length];
  const komponen = [
    { kodeKomponen: bakuKode1, qtyPerUnit: +(1 + (idx % 6) * 0.03).toFixed(2) },
    { kodeKomponen: penolong, qtyPerUnit: +(0.01 + (idx % 4) * 0.01).toFixed(3) },
  ];
  if (idx % 3 === 0) komponen.push({ kodeKomponen: bakuKode2, qtyPerUnit: +(0.15 + (idx % 5) * 0.05).toFixed(2) });
  else if (idx % 3 === 1) komponen.push({ kodeKomponen: lain, qtyPerUnit: 1 });
  return { kodeBarangJadi, komponen };
}

const BRG_BOM_AUTO = [
  ...Array.from({ length: 15 }, (_, i) => bomAutoRow(`JD-${String(i + 6).padStart(3,'0')}`, i)),
  ...Array.from({ length: 18 }, (_, i) => bomAutoRow(`PU-${String(i + 3).padStart(3,'0')}`, i + 15)),
];

const BRG_BOM_SEED = [...BRG_BOM_MANUAL, ...BRG_BOM_AUTO];

function brgBomFor(kodeBarangJadi) {
  return BRG_BOM_SEED.find(b => b.kodeBarangJadi === kodeBarangJadi) || null;
}

// Cari nama+jenis+satuan komponen dari katalog aslinya (BAHAN_BAKU dulu, baru BARANG_LAIN) — satu
// fungsi ini jadi titik tunggal buat semua tempat yang perlu "apa itu kode komponen X".
function brgBomResolveKomponen(kodeKomponen) {
  const bb = BAHAN_BAKU.find(b => b.kodeProduk === kodeKomponen);
  if (bb) {
    return {
      kodeKomponen, namaKomponen: bb.namaProduk, jenisKomponen:'BAKU', jenisLabel:'Bahan Baku',
      satuan: bb.satuan, keterangan: bb.namaProdukSupplier || '',
    };
  }
  const ln = BARANG_LAIN.find(b => b.kodeProduk === kodeKomponen);
  if (ln) {
    const jenisKomponen = ln.kodeKategori === 'PENOLONG' ? 'PENOLONG' : 'LAIN';
    const satuanKode = ln.satuanKonversi?.[0]?.kodeSatuan;
    const satuan = BRG_SATUAN_KONVERSI_OPTS.find(s => s.kode === satuanKode)?.nama || '';
    return {
      kodeKomponen, namaKomponen: ln.namaProduk, jenisKomponen,
      jenisLabel: jenisKomponen === 'PENOLONG' ? 'Penolong' : 'Lain',
      satuan, keterangan: brgKategoriNama(ln.kodeKategori),
    };
  }
  return null;
}

// Bangun baris Bahan siap-pakai (shape sama dgn bahanLines SPK: id/bjLineId/gudang/kodeBahan/
// merkBahan/jumlah/satuan) dari BOM, di-scale ke qty aktual. kodeBarangJadi tanpa BOM (mis. hasil
// impor SO yang kodenya tidak match) return [] — fallback ke alur tambah bahan manual.
function brgBomBuildBahanLines(kodeBarangJadi, qty) {
  const bom = brgBomFor(kodeBarangJadi);
  if (!bom) return [];
  const q = +qty || 0;
  return bom.komponen.map((k, i) => {
    const resolved = brgBomResolveKomponen(k.kodeKomponen);
    return {
      id: Date.now() + i, gudang:'', kodeBahan: k.kodeKomponen,
      merkBahan: resolved ? resolved.keterangan : '', jenisKomponen: resolved?.jenisKomponen || '',
      jumlah: +(k.qtyPerUnit * q).toFixed(2), satuan: resolved?.satuan || '',
    };
  });
}
