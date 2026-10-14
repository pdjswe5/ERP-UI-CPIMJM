// Barang — seed data Bahan Baku.
//
// 40 record dibangun lewat helper bbRow supaya variatif (mengikuti pola generator seed data lain
// sesi ini, mis. lnRow di Barang Lain) tanpa menulis tiap baris manual. warna/az/yield memakai
// kode dari BRG_WARNA_OPTS/BRG_AZ_OPTS/BRG_YIELD_OPTS (master.data.jsx, dimuat lebih dulu di
// index.html), keterangan dirangkai otomatis persis seperti logika autofill di BahanBakuModal.

const BB_WARNA_CODES = BRG_WARNA_OPTS.map(w => w.kode);
const BB_AZ_CODES = BRG_AZ_OPTS.map(a => a.kode);
const BB_YIELD_CODES = BRG_YIELD_OPTS.map(y => y.kode);
const BB_SATUAN_CODES = BRG_SATUAN_OPTS;
const BB_SUPPLIERS = ['PT Sinar Jaya', 'AG Steel', 'Bogowonto Metal', 'PT Baja Makmur', 'CV Logam Sejahtera', 'PT Metal Perkasa', 'UD Sumber Rejeki', 'PT Cahaya Logam'];
const BB_LEBAR_STEPS = [500, 750, 900, 914, 1000, 1219];

function bbNama(opts, kode) { return opts.find(o => o.kode === kode)?.nama || ''; }

function bbKeterangan(warna, az, yld) {
  return [
    warna && `Warna: ${bbNama(BRG_WARNA_OPTS, warna)} (${warna})`,
    az && `AZ: ${bbNama(BRG_AZ_OPTS, az)}`,
    yld && `Yield: ${bbNama(BRG_YIELD_OPTS, yld)}`,
  ].filter(Boolean).join('; ');
}

function bbRow(idx) {
  const warna = BB_WARNA_CODES[idx % BB_WARNA_CODES.length];
  const az = BB_AZ_CODES[idx % BB_AZ_CODES.length];
  const yld = BB_YIELD_CODES[idx % BB_YIELD_CODES.length];
  const satuan = BB_SATUAN_CODES[idx % BB_SATUAN_CODES.length];
  const tebal = +(0.2 + (idx % 8) * 0.05).toFixed(2);
  const lebar = BB_LEBAR_STEPS[idx % BB_LEBAR_STEPS.length];
  const kodeProduk = `BB-${String(idx + 1).padStart(3, '0')}`;
  const namaProduk = `BAHAN ${bbNama(BRG_WARNA_OPTS, warna).toUpperCase()} TEBAL ${tebal} LEBAR ${lebar} MM AZ ${az} G-${yld}`;
  return {
    kodeProduk, namaProduk, kodeKategori:'BAKU',
    warna, tebal, lebar, satuan,
    hppStandar: 80000 + (idx % 12) * 15000,
    namaProdukSupplier: BB_SUPPLIERS[idx % BB_SUPPLIERS.length],
    tipeData: idx % 5 === 0 ? 'F' : 'K',
    az, yield: yld,
    slow: idx % 7 === 0,
    marketing: idx % 3 !== 0,
    minimQty: 10 + (idx % 10) * 5,
    minimBhp: 5 + (idx % 8) * 2,
    minimNon: 3 + (idx % 6) * 2,
    koefisien: +(1 + (idx % 10) * 0.1).toFixed(2),
    toleransi: +(0.02 + (idx % 5) * 0.01).toFixed(2),
    margin: +((idx % 6) * 1.5).toFixed(1),
    aktif: idx % 13 !== 0,
    keterangan: bbKeterangan(warna, az, yld),
  };
}

const BAHAN_BAKU = Array.from({ length: 40 }, (_, idx) => bbRow(idx));
