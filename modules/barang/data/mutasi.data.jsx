// Barang — seed data Mutasi Barang & Konsinyasi.
//
// MUTASI_BARANG_MASTER: daftar gabungan Bahan Baku + Barang Jadi (Umum & PU) + Barang Lain yang
// jadi sumber picker "Barang Mutasi" (lihat MutasiItemPickerModal di StokTransaksiPage.jsx).
// Tiap entri punya `units` = daftar { satuan, konversi } yang bisa dipilih — untuk Barang Lain
// diambil dari satuanKonversi-nya (banyak satuan), untuk Bahan Baku/Barang Jadi cuma 1 satuan
// (konversi selalu 1) karena kedua modul itu belum punya multi-satuan.

function mutasiUnitsFrom(item) {
  if (Array.isArray(item.satuanKonversi) && item.satuanKonversi.length) {
    return item.satuanKonversi.map(sk => ({
      satuan: BRG_SATUAN_KONVERSI_OPTS.find(o => o.kode === sk.kodeSatuan)?.nama || sk.kodeSatuan,
      konversi: sk.isi || 1,
    }));
  }
  return [{ satuan: item.satuan || 'PCS', konversi: 1 }];
}

const MUTASI_BARANG_MASTER = [
  ...BAHAN_BAKU.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk, units:mutasiUnitsFrom(b) })),
  ...BARANG_JADI.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk, units:mutasiUnitsFrom(b) })),
  ...BARANG_LAIN.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk, units:mutasiUnitsFrom(b) })),
];

// Kode customer literal (bukan referensi ke PJ_PELANGGAN — script Penjualan dimuat SETELAH
// modul Barang di index.html, jadi tidak bisa dipakai di top-level const seperti ini; nilainya
// diambil manual dari modules/penjualan/data/pelanggan.data.jsx supaya tetap valid saat form
// Konsinyasi menampilkan nama customer lewat PJ_PELANGGAN pada saat render/runtime).
const MT_CUSTOMER_CODES = ['b7364','C001','C012','g123','H01','KV001','L001','L002','L015','p12345','P105','P34567'];
const MT_GUDANG_CODES = BRG_GUDANG_OPTS.map(g => g.kode);
const MT_KATEGORI_CODES = ['BAKU','JADI','LAIN'];

function mtDetailRows(count, offset) {
  return Array.from({ length: count }, (_, i) => {
    const item = MUTASI_BARANG_MASTER[(offset + i) % MUTASI_BARANG_MASTER.length];
    const unit = item.units[i % item.units.length];
    const jumlah = 5 + ((offset + i) % 10) * 5;
    return { kodeItem:item.kode, namaItem:item.nama, satuan:unit.satuan, konversi:unit.konversi, jumlah, satuanTerkecil: unit.konversi * jumlah };
  });
}

function mtRow(idx, jenis) {
  const prefix = idx % 2 === 0 ? 'K' : 'F';
  const noBukti = `${prefix}MB26${String(1000 + idx).slice(-4)}`;
  const tglBukti = `2026-07-${String(1 + (idx % 28)).padStart(2, '0')}`;
  const kodeGudangDari = MT_GUDANG_CODES[idx % MT_GUDANG_CODES.length];
  const kodeGudangKe = MT_GUDANG_CODES[(idx + 1) % MT_GUDANG_CODES.length];
  const kodeKategori = MT_KATEGORI_CODES[idx % MT_KATEGORI_CODES.length];
  const detailCount = 5 + (idx % 16); // 5..20
  const batal = idx % 9 === 0;
  return {
    noBukti, tglBukti, kodeKategori,
    ...(jenis === 'KONSINYASI' ? { kodeCustomer: MT_CUSTOMER_CODES[idx % MT_CUSTOMER_CODES.length] } : {}),
    kodeGudangDari, kodeGudangKe, jenis,
    keterangan: idx % 3 === 0 ? '' : `Catatan transaksi ${jenis.toLowerCase()} ke-${idx + 1}`,
    batal, alasanBatal: batal ? 'Dibatalkan oleh operator' : '',
    details: mtDetailRows(detailCount, idx * 3),
  };
}

const MUTASI_BARANG = [
  ...Array.from({ length: 13 }, (_, idx) => mtRow(idx, 'MUTASI')),
  ...Array.from({ length: 13 }, (_, idx) => mtRow(idx + 100, 'KONSINYASI')),
];
