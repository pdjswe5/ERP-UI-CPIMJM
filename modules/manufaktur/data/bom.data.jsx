// Manufaktur — Bill of Material (BOM): resep bahan & mesin standar per Barang Jadi (kode dari
// katalog MF_BARANG — sama katalog yang dipakai popup "Pilih Barang" di MfBarangJadiEntryModal,
// jadi begitu user pilih salah satu barang jadi di bawah, bahan+mesin-nya otomatis kebentuk tanpa
// diketik manual). qtyPerUnit = rasio bahan per 1 satuan Qty SPK barang jadi; jumlah aktual di
// tabel Bahan dihitung saat di-apply (qtyPerUnit * qtySPK), bukan disimpan statis di sini, supaya
// tetap benar kalau Qty SPK-nya diubah user (lihat mfBomBuildBahanLines & pemakaiannya di
// MfBarangJadiEntryModal).
//
// Catatan: katalog Penjualan (BARANG, di inventory.jsx — dipakai Sales Order) beda sama sekali
// dari MF_BARANG (sparepart otomotif vs produk atap/steel manufaktur) — jadi barang jadi yang
// diimpor dari SO (lihat onConfirm MfSoPickerModal di SpkPage.jsx) TIDAK otomatis match BOM ini
// kecuali user mengoreksi Kode Barang-nya lewat "Pilih Barang" ke salah satu kode di bawah.
const MF_BOM_LIST = [
  { kodeBarang:'AS1023ATBBKW750', bahan:[
      { kodeBahan:'*CO', qtyPerUnit:1, satuan:'PCS' },
      { kodeBahan:'*P', qtyPerUnit:0.05, satuan:'PCS' },
      { kodeBahan:'*F', qtyPerUnit:1, satuan:'PCS' },
    ], mesinDipilih:['TRIM 1','SPAN 68'] },
  { kodeBarang:'AS1023ATBBKW1500', bahan:[
      { kodeBahan:'*CO AGBESHD', qtyPerUnit:1, satuan:'PCS' },
      { kodeBahan:'*P', qtyPerUnit:0.04, satuan:'PCS' },
    ], mesinDipilih:['TRIM 2 VIETNAM'] },
  { kodeBarang:'AS1023ATGAKW1600', bahan:[
      { kodeBahan:'*CO100TRS00020', qtyPerUnit:1, satuan:'MTR' },
      { kodeBahan:'*PCR3120AN120', qtyPerUnit:0.06, satuan:'PCS' },
    ], mesinDipilih:['SLITTING 1 LEBAR 600'] },
  { kodeBarang:'CO100TRSL0020', bahan:[
      { kodeBahan:'*CO100TRS00020', qtyPerUnit:1.02, satuan:'MTR' },
    ], mesinDipilih:['SLITTING 1 LEBAR 300'] },
  { kodeBarang:'GAL023BRU750', bahan:[
      { kodeBahan:'*CO AGBESHD', qtyPerUnit:1, satuan:'PCS' },
      { kodeBahan:'*F', qtyPerUnit:1, satuan:'PCS' },
    ], mesinDipilih:['TRIM 1'] },
];

function mfBomFor(kodeBarang) {
  return MF_BOM_LIST.find(b => b.kodeBarang === kodeBarang) || null;
}

// Bangun baris Bahan siap-pakai (shape sama dgn localBahan/onBahanPick di MfBarangJadiEntryModal
// & bahanLines SPK), di-scale ke qtySPK aktual. Kode barang tanpa BOM (mis. hasil impor SO) return
// [] — fallback ke alur manual (tombol "+ Tambah Bahan") seperti sebelum fitur ini ada.
function mfBomBuildBahanLines(kodeBarang, qtySPK) {
  const bom = mfBomFor(kodeBarang);
  if (!bom) return [];
  const qty = +qtySPK || 0;
  return bom.bahan.map((b, i) => {
    const master = MF_BARANG.find(x => x.code === b.kodeBahan);
    return {
      id: Date.now() + i, gudang:'', kodeBahan: b.kodeBahan, merkBahan: master?.merk || '',
      jumlah: +(b.qtyPerUnit * qty).toFixed(2), satuan: b.satuan,
    };
  });
}
