// Barang — seed data Stock Opname.
//
// 30 record dibangun lewat generator opRow/opDetailRows, tiap record 2-10 baris barang dari
// MUTASI_BARANG_MASTER (mutasi.data.jsx, dimuat sebelum file ini). Shape detail baru:
// { kodeItem, namaItem, satuan, konversi, saldo, fisik } — field lama (deskripsi/jumlah) dibuang
// karena form sekarang murni Saldo (readonly, nilai sistem) vs Fisik (input, hasil hitung nyata).
//
// opPseudoSaldo: hash string sederhana & deterministik (bukan Math.random, supaya nilai Saldo
// tidak berubah tiap render) — dipakai juga oleh OpnameItemPickerModal di StokTransaksiPage.jsx
// (dimuat setelah file ini) untuk menampilkan Saldo saat user memilih barang baru lewat picker.
function opPseudoSaldo(kode) {
  let h = 0;
  for (let i = 0; i < kode.length; i++) h = (h * 31 + kode.charCodeAt(i)) % 500;
  return h + 10;
}

function opDetailRows(count, offset) {
  return Array.from({ length: count }, (_, i) => {
    const item = MUTASI_BARANG_MASTER[(offset + i) % MUTASI_BARANG_MASTER.length];
    const unit = item.units[0];
    const saldo = opPseudoSaldo(item.kode);
    const fisik = Math.max(0, saldo + (((offset + i) % 7) - 3)); // sedikit selisih dari saldo
    return { kodeItem:item.kode, namaItem:item.nama, satuan:unit.satuan, konversi:unit.konversi, saldo, fisik };
  });
}

function opRow(idx) {
  const prefix = idx % 2 === 0 ? 'F' : 'K';
  const noBukti = `${prefix}SO26${String(1000 + idx).slice(-4)}`;
  const tglBukti = `2026-07-${String(1 + (idx % 28)).padStart(2, '0')}`;
  const kodeGudang = MT_GUDANG_CODES[idx % MT_GUDANG_CODES.length];
  const kodeKategori = MT_KATEGORI_CODES[idx % MT_KATEGORI_CODES.length];
  const detailCount = 2 + (idx % 9); // 2..10
  const batal = idx % 11 === 0;
  return {
    noBukti, tglBukti, kodeKategori, kodeGudang,
    keterangan: idx % 4 === 0 ? '' : `Opname stok ke-${idx + 1}`,
    batal, alasanBatal: batal ? 'Dibatalkan oleh operator' : '',
    details: opDetailRows(detailCount, idx * 5),
  };
}

const STOCK_OPNAME = Array.from({ length: 30 }, (_, idx) => opRow(idx));
