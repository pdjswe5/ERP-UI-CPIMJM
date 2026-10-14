// Manufaktur — seed data Retur Pakai Barang Lain (RPBL).
//
// Data lengkap: setiap record sekarang punya barangLines terisi (sebelumnya tidak ada field
// barangLines sama sekali). No. Bukti pakai format F/K + RPBL + YYMM, sama pola dengan gerbang
// F/K yang sekarang dipakai di dialog-nya.
//
// kodeBarang sekarang dari BARANG_LAIN (modul Barang) — sama alasannya dengan BPBL (lihat
// bpbl.data.jsx): sebelumnya MF_BARANG, campuran kode "*" palsu dan barang jadi yang salah tempat.

// Satuan di-derive dari BARANG_LAIN.satuanKonversi[0] lewat brgBomResolveKomponen, sama alasannya
// dengan BPBL (lihat bpbl.data.jsx) — sebelumnya semua baris di-hardcode 'PCS'.
let _rpblRowId = 6500;
function rpblRow(kodeBarang, jumlah, sisaSebelumnya, noSpk) {
  const b = BARANG_LAIN.find(x => x.kodeProduk === kodeBarang);
  const resolved = brgBomResolveKomponen(kodeBarang);
  return { id: _rpblRowId++, kodeBarang, namaBarang: b ? b.namaProduk : '', jumlah, satuan: resolved?.satuan || '', sisaSebelumnya, noSpk: noSpk || '' };
}

const MF_RPBL_SEED = [
  { no:'FRPBL26060601', tgl:'21-06-2026', gudang:'GDG-003', namaGudang:'Gudang C', bagian:'Engineering', catatan:'Sisa bahan tidak terpakai',
    barangLines: [
      rpblRow('LN-022', 5, 15, 'FSPK26060601'),
    ] },
  { no:'KRPBL26060602', tgl:'22-06-2026', gudang:'GDG-004', namaGudang:'Gudang Produksi', bagian:'Maintenance', catatan:'',
    barangLines: [
      rpblRow('LN-017', 4, 12, ''),
      rpblRow('LN-003', 3, 10, 'KSPK26060604'),
      rpblRow('LN-015', 1, 2, ''),
    ] },
  { no:'FRPBL26060603', tgl:'23-06-2026', gudang:'GDG-002', namaGudang:'Gudang B', bagian:'QC', catatan:'Retur barang uji tidak jadi dipakai',
    barangLines: [
      rpblRow('LN-013', 2, 8, 'FSPK26060605'),
    ] },
  { no:'KRPBL26060604', tgl:'24-06-2026', gudang:'GDG-001', namaGudang:'Gudang Utama', bagian:'Produksi', catatan:'Kelebihan alokasi bahan SPK',
    barangLines: [
      rpblRow('LN-021', 8, 20, 'KSPK26060606'),
      rpblRow('LN-018', 3, 9, ''),
    ] },
];
