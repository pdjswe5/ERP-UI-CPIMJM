// Barang — seed data Barang Jadi Umum & PU.
//
// Baris kodeKategori:'JADI' dipakai form Barang Umum (lihat BarangUmumModal), 'JADIPU' dipakai
// form Barang PU (BarangJadiModal) — detailsPU sekarang cuma { kodeBarang } per baris (urutan
// lapis = posisi array), kodeBarang merujuk kodeProduk barang jadi lain di daftar ini (dalam
// hal ini selalu ke salah satu produk JD-xxx). 20 record Umum + 20 record PU (tiap PU 2-5
// lapisan) dibangun lewat generator bjRow/bjPuRow supaya variatif tanpa menulis manual satu-satu
// (pola sama seperti generator seed lain sesi ini, mis. lnRow/bbRow).

function bjLookupNama(opts, kode) { return opts.find(o => o.kode === kode)?.nama || ''; }
function bjUmumKeterangan(jenis, tipe, warna, merk) {
  return [
    jenis && `Jenis: ${bjLookupNama(BRG_JENIS_OPTS, jenis)} (${jenis})`,
    tipe && `Tipe: ${bjLookupNama(BRG_TIPE_OPTS, tipe)} (${tipe})`,
    warna && `Warna: ${bjLookupNama(BRG_WARNA_OPTS, warna)} (${warna})`,
    merk && `Merk: ${bjLookupNama(BRG_MERK_OPTS, merk)} (${merk})`,
  ].filter(Boolean).join('; ');
}
function bjPuKeterangan(jenis, tipe, warnaTop, warnaBot) {
  return [
    jenis && `Jenis: ${bjLookupNama(BRG_JENIS_PU_OPTS, jenis)} (${jenis})`,
    tipe && `Tipe: ${bjLookupNama(BRG_TIPE_PU_OPTS, tipe)} (${tipe})`,
    warnaTop && `Warna Top: ${bjLookupNama(BRG_WARNA_OPTS, warnaTop)} (${warnaTop})`,
    warnaBot && `Warna Bottom: ${bjLookupNama(BRG_WARNA_OPTS, warnaBot)} (${warnaBot})`,
  ].filter(Boolean).join('; ');
}

const BJ_JENIS_CODES = BRG_JENIS_OPTS.map(j => j.kode);
const BJ_TIPE_CODES = BRG_TIPE_OPTS.map(t => t.kode);
const BJ_WARNA_CODES = BRG_WARNA_OPTS.map(w => w.kode);
const BJ_MERK_CODES = BRG_MERK_OPTS.map(m => m.kode);

function bjRow(idx) {
  const jenis = BJ_JENIS_CODES[idx % BJ_JENIS_CODES.length];
  const tipe = BJ_TIPE_CODES[idx % BJ_TIPE_CODES.length];
  const warna = BJ_WARNA_CODES[idx % BJ_WARNA_CODES.length];
  const merk = BJ_MERK_CODES[idx % BJ_MERK_CODES.length];
  const kodeProduk = `JD-${String(idx + 1).padStart(3, '0')}`;
  const namaProduk = `BARANG JADI ${bjLookupNama(BRG_JENIS_OPTS, jenis).toUpperCase()} ${bjLookupNama(BRG_TIPE_OPTS, tipe).toUpperCase()} ${bjLookupNama(BRG_WARNA_OPTS, warna).toUpperCase()}`;
  return {
    kodeProduk, namaProduk, kodeKategori:'JADI',
    jenis, tipe, warna, merk,
    minimQty: 5 + (idx % 8) * 5,
    tipeData: idx % 4 === 0 ? 'K' : 'F',
    aktif: idx % 9 !== 0,
    lebar: 500 + (idx % 6) * 100,
    panjang: 1000 + (idx % 5) * 500,
    lbrReal: 495 + (idx % 6) * 100,
    pjgReal: 995 + (idx % 5) * 500,
    bahan: (idx % 5) + 1,
    tebalTct: +(0.2 + (idx % 6) * 0.05).toFixed(2),
    tebalBmt: +(0.15 + (idx % 6) * 0.04).toFixed(2),
    hppStandar: 150000 + (idx % 14) * 25000,
    status: idx % 11 === 0 ? 'NONAKTIF' : 'AKTIF',
    ongkos: 10000 + (idx % 9) * 3000,
    keterangan: bjUmumKeterangan(jenis, tipe, warna, merk),
    detailsPU: [],
  };
}

function bjLapisRows(count, seedIdx) {
  return Array.from({ length: count }, (_, i) => ({ kodeBarang: `JD-${String(((seedIdx + i * 3) % 20) + 1).padStart(3, '0')}` }));
}

function bjPuRow(idx) {
  const jenis = BRG_JENIS_PU_OPTS[idx % BRG_JENIS_PU_OPTS.length].kode;
  const tipe = BRG_TIPE_PU_OPTS[idx % BRG_TIPE_PU_OPTS.length].kode;
  const warnaTop = BJ_WARNA_CODES[idx % BJ_WARNA_CODES.length];
  const warnaBot = BJ_WARNA_CODES[(idx + 3) % BJ_WARNA_CODES.length];
  const kodeProduk = `PU-${String(idx + 1).padStart(3, '0')}`;
  const namaProduk = `PANEL PU ${bjLookupNama(BRG_JENIS_PU_OPTS, jenis).toUpperCase()} ${bjLookupNama(BRG_TIPE_PU_OPTS, tipe).toUpperCase()} ${idx + 1}`;
  const lapisCount = 2 + (idx % 4); // 2..5
  return {
    kodeProduk, namaProduk, kodeKategori:'JADIPU',
    jenis, tipe, minimQty:1,
    tipeData: idx % 3 === 0 ? 'K' : 'F',
    aktif: idx % 7 !== 0,
    lebar: 800 + (idx % 5) * 100,
    panjang: 3000 + (idx % 6) * 500,
    hppStandar: 400000 + (idx % 10) * 50000,
    status: BRG_STATUS_PU_OPTS[idx % BRG_STATUS_PU_OPTS.length],
    ongkos: 20000 + (idx % 8) * 5000,
    warnaTop, warnaBot,
    tebalTop: +(0.3 + (idx % 5) * 0.05).toFixed(2),
    tebalBot: +(0.25 + (idx % 5) * 0.05).toFixed(2),
    keterangan: bjPuKeterangan(jenis, tipe, warnaTop, warnaBot),
    detailsPU: bjLapisRows(lapisCount, idx),
  };
}

const BARANG_JADI = [
  ...Array.from({ length: 20 }, (_, idx) => bjRow(idx)),
  ...Array.from({ length: 20 }, (_, idx) => bjPuRow(idx)),
];
