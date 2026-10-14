// Manufaktur — seed data Bukti Pemakaian Barang Lain (BPBL).
//
// Data lengkap: setiap record sekarang punya barangLines terisi (sebelumnya tidak ada field
// barangLines sama sekali — kalau dibuka Edit, tabel Detail Barang selalu kosong walau
// totalBarang di list menunjukkan angka). No. Bukti pakai format F/K + BPBL + YYMM, sama pola
// dengan gerbang F/K yang sekarang dipakai di dialog-nya.
//
// kodeBarang sekarang dari BARANG_LAIN (modul Barang, kategori Penolong/Lain/Spare/Tools) —
// sebelumnya dari MF_BARANG (kode "*" palsu + beberapa kode barang JADI yang salah tempat di
// sini; barang jadi adalah OUTPUT produksi, bukan bahan lain yang "dipakai habis").

// Satuan TIDAK diketik manual di sini lagi (sebelumnya semua baris di-hardcode 'PCS' tanpa peduli
// satuan asli barangnya — salah utk barang yg sebenarnya LBR/ROLL/ZAK/MTR/PSG/KG) — di-derive
// langsung dari BARANG_LAIN.satuanKonversi[0] lewat brgBomResolveKomponen (resolver yang sama
// dipakai BOM & auto-fill di MfBarangPakaiEntryModal), supaya satu-satunya sumber kebenaran & tidak
// bisa lagi tidak sinkron dengan katalognya.
let _bpblRowId = 6000;
function bpblRow(kodeBarang, jumlah, sisaSebelumnya, noSpk) {
  const b = BARANG_LAIN.find(x => x.kodeProduk === kodeBarang);
  const resolved = brgBomResolveKomponen(kodeBarang);
  return { id: _bpblRowId++, kodeBarang, namaBarang: b ? b.namaProduk : '', jumlah, satuan: resolved?.satuan || '', sisaSebelumnya, noSpk: noSpk || '' };
}

const MF_BPBL_SEED = [
  { no:'KBPBL26060601', tgl:'20-06-2026', gudang:'GDG-003', namaGudang:'Gudang C', bagian:'Produksi', noOpb:'OPB-2026-007', catatan:'Pemakaian rutin bulanan',
    barangLines: [
      bpblRow('LN-005', 20, 80, 'FSPK26060601'),
      bpblRow('LN-003', 10, 40, ''),
    ] },
  { no:'FBPBL26060602', tgl:'21-06-2026', gudang:'GDG-001', namaGudang:'Gudang Utama', bagian:'Engineering', noOpb:'OPB-2026-008', catatan:'',
    barangLines: [
      bpblRow('LN-015', 2, 5, 'KSPK26060602'),
    ] },
  { no:'KBPBL26060603', tgl:'22-06-2026', gudang:'GDG-004', namaGudang:'Gudang Produksi', bagian:'Maintenance', noOpb:'OPB-2026-009', catatan:'Perbaikan mesin TRIM 1',
    barangLines: [
      bpblRow('LN-022', 15, 60, 'FSPK26060603'),
      bpblRow('LN-017', 10, 45, ''),
      bpblRow('LN-030', 5, 20, 'KSPK26060604'),
      bpblRow('LN-003', 8, 30, ''),
    ] },
  { no:'FBPBL26060604', tgl:'23-06-2026', gudang:'GDG-002', namaGudang:'Gudang B', bagian:'QC', noOpb:'OPB-2026-010', catatan:'',
    barangLines: [
      bpblRow('LN-013', 6, 25, 'FSPK26060605'),
      bpblRow('LN-015', 1, 3, ''),
    ] },
  { no:'KBPBL26060605', tgl:'24-06-2026', gudang:'GDG-001', namaGudang:'Gudang Utama', bagian:'Produksi', noOpb:'OPB-2026-011', catatan:'Pemakaian untuk SPK batch besar',
    barangLines: [
      bpblRow('LN-021', 25, 100, 'KSPK26060606'),
      bpblRow('LN-018', 12, 50, ''),
      bpblRow('LN-005', 18, 70, 'FSPK26060607'),
    ] },
];
