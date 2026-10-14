// Barang — seed data Penyesuaian Barang (Koreksi).
//
// 30 record dibangun lewat generator pkRow/pkDetailRows (pola sama seperti generator seed lain
// sesi ini) — tiap record 2-10 baris barang, diambil dari MUTASI_BARANG_MASTER (mutasi.data.jsx,
// dimuat sebelum file ini) supaya konsisten dengan picker "Barang Koreksi" di StokTransaksiPage.jsx.
// Shape detail baru: { kodeItem, namaItem, satuan, konversi, jumlah, hargaTotal } — field lama
// (hrgSatPokok/hrgTotPokok) dibuang karena form sekarang cuma punya 1 field harga (Harga Total).

function pkDetailRows(count, offset) {
  return Array.from({ length: count }, (_, i) => {
    const item = MUTASI_BARANG_MASTER[(offset + i) % MUTASI_BARANG_MASTER.length];
    const unit = item.units[i % item.units.length];
    const jumlah = ((offset + i) % 21) - 10; // -10..10, boleh negatif (koreksi kurang)
    const hargaTotal = Math.abs(jumlah) * (10000 + ((offset + i) % 20) * 5000);
    return { kodeItem:item.kode, namaItem:item.nama, satuan:unit.satuan, konversi:unit.konversi, jumlah, hargaTotal };
  });
}

function pkRow(idx) {
  const prefix = idx % 2 === 0 ? 'F' : 'K';
  const noBukti = `${prefix}PB26${String(1000 + idx).slice(-4)}`;
  const tglBukti = `2026-07-${String(1 + (idx % 28)).padStart(2, '0')}`;
  const kodeGudang = MT_GUDANG_CODES[idx % MT_GUDANG_CODES.length];
  const kodeKategori = MT_KATEGORI_CODES[idx % MT_KATEGORI_CODES.length];
  const detailCount = 2 + (idx % 9); // 2..10
  const batal = idx % 11 === 0;
  return {
    noBukti, tglBukti, kodeKategori, kodeGudang,
    keterangan: idx % 4 === 0 ? '' : `Koreksi stok ke-${idx + 1}`,
    batal, alasanBatal: batal ? 'Dibatalkan oleh operator' : '',
    details: pkDetailRows(detailCount, idx * 5),
  };
}

const PENYESUAIAN_BARANG = Array.from({ length: 30 }, (_, idx) => pkRow(idx));
