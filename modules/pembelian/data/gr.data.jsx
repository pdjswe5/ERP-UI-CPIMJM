// Pembelian — data & config Goods Receive (GR)
//
// GR tidak punya field Gudang di level header — Gudang ditentukan per baris barang (tiap item
// bisa masuk ke gudang berbeda), sama seperti Purchasing Org & referensi dokumen asal.

function grItem(kode, qty, harga, disc1, discRp, panjang, noCoil, kodeGudang, opts={}) {
  const produk = PB_PRODUK.find(p => p.kode === kode);
  const org = PB_PURCHASING_ORG.find(o => o.kode === (opts.orgKode || 'PCO_0001'));
  return {
    Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:opts.deskripsi || '',
    Qty:qty, Satuan: produk ? produk.satuan : 'PCS', Harga:harga,
    Disc1:disc1, Disc2:0, DiscRp:discRp, Panjang:panjang, No_Coil:noCoil,
    Kode_Gudang:kodeGudang, Nama_Gudang: pbGudangNama(kodeGudang),
    Kode_PurchasingORG: opts.orgKode || 'PCO_0001', Ket_PurchasingORG: org ? org.nama : '',
    Kode_Konversi:1, Konversi:1, Qty_Realisasi: opts.realisasi || 0,
    No_Bukti_From: opts.noBuktiFrom || '', No_Id_From: opts.noBuktiFrom ? 1 : 0, Jenis_Dok_From: opts.jenisDokFrom || '',
  };
}

function grHead(no, tgl, kodeSupp, ket, details, opts={}) {
  const supp = PB_SUPPLIER.find(s => s.Kode_Supp === kodeSupp);
  return {
    No_Bukti:no, Tgl_Bukti:tgl, Kode_Supp:kodeSupp, Nama_Supp: supp ? supp.Nama_Supp : kodeSupp,
    Keterangan:ket, Ppn:11, Ppn_Include:false, Disc: opts.disc ?? 0, Disc_Rp: opts.discRp ?? 0,
    No_Ref: opts.noRef || '', Tgl_Ref: opts.tglRef || null,
    Status: opts.status || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:51:10`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:20:00`,
    Details:details,
  };
}

const PB_GR = [
  grHead('FTB26070001', '2026-07-08', 'MRR001', 'Penerimaan bahan baku Juli', [
    grItem('AA0450914100550', 100, 275000, 10, 10000, 6, 'C-001', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPN26070001', jenisDokFrom:'PN', deskripsi:'Bahan produksi' }),
    grItem('AA0450914100550', 100, 275000, 10, 10000, 6, 'C-002', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPN26070001', jenisDokFrom:'PN', deskripsi:'Bahan produksi' }),
    grItem('BB040091470550', 60, 260000, 0, 0, 0, 'C-003', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPN26070001', jenisDokFrom:'PN' }),
    grItem('CC0350914080550', 45, 245000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0002', noBuktiFrom:'KPN26070001', jenisDokFrom:'PN' }),
    grItem('DD0500914120600', 30, 310000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0002', noBuktiFrom:'KPN26070001', jenisDokFrom:'PN' }),
  ], { disc:5, discRp:250000, noRef:'KPN26070001', creator:'Administrator', editor:'' }),
  grHead('FTB26070002', '2026-07-09', 'AG001', 'Penerimaan material minggu 1', [
    grItem('BB040091470550', 50, 260000, 0, 10000, 0, 'C-010', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070002', jenisDokFrom:'PO' }),
    grItem('CC0350914080550', 40, 245000, 0, 0, 0, 'C-011', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070002', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 30, 310000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070002', jenisDokFrom:'PO' }),
    grItem('EE0300762060500', 25, 185000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070002', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 35, 265000, 0, 0, 0, 'C-012', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070002', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 20, 75000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070002', jenisDokFrom:'PO' }),
  ], { discRp:10000, noRef:'KPN26070002' }),
  grHead('FTB26070003', '2026-07-10', 'P003', 'Dibatalkan, barang tidak sesuai spesifikasi', [
    grItem('CC0350914080550', 45, 245000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070003', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 30, 310000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070003', jenisDokFrom:'PO' }),
    grItem('EE0300762060500', 55, 185000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070003', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 20, 265000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070003', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 35, 75000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070003', jenisDokFrom:'PO' }),
  ], { batal:true, alasanBatal:'Barang tidak sesuai spesifikasi, dikembalikan ke supplier' }),
  grHead('FTB26070004', '2026-07-11', 'MRR001', 'Penerimaan proyek gudang blok A', [
    grItem('AA0450914100550', 200, 275000, 5, 0, 6, 'C-020', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
    grItem('BB040091470550', 90, 260000, 0, 0, 0, 'C-021', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
    grItem('CC0350914080550', 70, 245000, 0, 0, 0, 'C-022', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 55, 310000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
    grItem('EE0300762060500', 40, 185000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 65, 265000, 0, 0, 0, 'C-023', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 200, 75000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070004', jenisDokFrom:'PO' }),
  ], { noRef:'KPN26070004' }),
  grHead('FTB26070005', '2026-07-12', 'AG001', 'Penerimaan stok gudang Agustus', [
    grItem('AA0450914100550', 150, 275000, 0, 0, 6, 'C-030', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO', realisasi:150 }),
    grItem('BB040091470550', 90, 260000, 0, 0, 0, 'C-031', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO', realisasi:90 }),
    grItem('CC0350914080550', 70, 245000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 55, 310000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO', realisasi:55 }),
    grItem('EE0300762060500', 40, 185000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 65, 265000, 0, 0, 0, 'C-032', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 200, 75000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO' }),
    grItem('BB040091470550', 25, 260000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070005', jenisDokFrom:'PO', deskripsi:'Batch khusus' }),
  ], { discRp:10000, noRef:'KPN26070005' }),
  grHead('FTB26070006', '2026-07-13', 'P003', 'Penerimaan genteng & aksesoris', [
    grItem('GG0250610050450', 500, 75000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070008', jenisDokFrom:'PO', realisasi:500 }),
    grItem('AA0450914100550', 80, 275000, 0, 0, 6, 'C-040', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070008', jenisDokFrom:'PO', realisasi:80 }),
    grItem('BB040091470550', 65, 260000, 0, 0, 0, 'C-041', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070008', jenisDokFrom:'PO', realisasi:65 }),
    grItem('CC0350914080550', 45, 245000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070008', jenisDokFrom:'PO', realisasi:45 }),
    grItem('DD0500914120600', 30, 310000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070008', jenisDokFrom:'PO', realisasi:30 }),
    grItem('EE0300762060500', 20, 185000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070008', jenisDokFrom:'PO', realisasi:20 }),
  ], { noRef:'KPN26070008' }),
  grHead('FTB26070007', '2026-07-14', 'MRR001', 'Penerimaan bahan baku minggu 2', [
    grItem('AA0450914100550', 120, 275000, 0, 0, 6, 'C-050', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', realisasi:120 }),
    grItem('BB040091470550', 80, 260000, 0, 0, 0, 'C-051', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', realisasi:40 }),
    grItem('CC0350914080550', 50, 245000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 35, 310000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', realisasi:35 }),
    grItem('EE0300762060500', 20, 185000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 60, 265000, 0, 0, 0, 'C-052', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 150, 75000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO' }),
    grItem('AA0450914100550', 40, 275000, 0, 0, 6, 'C-053', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', deskripsi:'Batch 2' }),
    grItem('BB040091470550', 30, 260000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', deskripsi:'Batch 2' }),
    grItem('CC0350914080550', 25, 245000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', deskripsi:'Batch 2' }),
    grItem('DD0500914120600', 15, 310000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070007', jenisDokFrom:'PO', deskripsi:'Batch 2' }),
  ], { noRef:'KPN26070007' }),
  grHead('FTB26070008', '2026-07-15', 'AG001', 'Dibatalkan, salah kirim gudang', [
    grItem('CC0350914080550', 45, 245000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070009', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 30, 310000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070009', jenisDokFrom:'PO' }),
    grItem('EE0300762060500', 55, 185000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070009', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 20, 265000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070009', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 35, 75000, 0, 0, 0, '', 'GDG-003', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070009', jenisDokFrom:'PO' }),
  ], { batal:true, alasanBatal:'Salah kirim gudang, barang diretur ke supplier' }),
  grHead('FTB26070009', '2026-07-16', 'P003', 'Penerimaan bahan baku minggu 3', [
    grItem('AA0450914100550', 100, 275000, 0, 0, 6, 'C-060', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
    grItem('BB040091470550', 60, 260000, 0, 0, 0, 'C-061', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
    grItem('CC0350914080550', 45, 245000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 35, 310000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
    grItem('EE0300762060500', 25, 185000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 50, 265000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 150, 75000, 0, 0, 0, '', 'GDG-002', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070012', jenisDokFrom:'PO' }),
  ], { noRef:'KPN26070012' }),
  grHead('FTB26070010', '2026-07-17', 'MRR001', 'Penerimaan stok besar gudang utama', [
    grItem('AA0450914100550', 100, 275000, 0, 0, 6, 'C-070', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:100 }),
    grItem('BB040091470550', 90, 260000, 0, 0, 0, 'C-071', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:90 }),
    grItem('CC0350914080550', 70, 245000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:70 }),
    grItem('DD0500914120600', 55, 310000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:55 }),
    grItem('EE0300762060500', 40, 185000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:40 }),
    grItem('FF0400914090550', 65, 265000, 0, 0, 0, 'C-072', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:65 }),
    grItem('GG0250610050450', 200, 75000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', realisasi:200 }),
    grItem('AA0450914100550', 50, 275000, 0, 0, 6, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:50 }),
    grItem('BB040091470550', 45, 260000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:45 }),
    grItem('CC0350914080550', 35, 245000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:35 }),
    grItem('DD0500914120600', 28, 310000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:28 }),
    grItem('EE0300762060500', 20, 185000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:20 }),
    grItem('FF0400914090550', 33, 265000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:33 }),
    grItem('GG0250610050450', 100, 75000, 0, 0, 0, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch B', realisasi:100 }),
    grItem('AA0450914100550', 25, 275000, 0, 0, 6, '', 'GDG-001', { orgKode:'PCO_0001', noBuktiFrom:'KPO26070010', jenisDokFrom:'PO', deskripsi:'Batch C', realisasi:25 }),
  ], { noRef:'KPN26070010' }),
  grHead('FTB26070011', '2026-07-18', 'AG001', 'GR ditutup manual, sebagian barang menyusul', [
    grItem('AA0450914100550', 90, 275000, 0, 0, 6, 'C-080', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
    grItem('BB040091470550', 60, 260000, 0, 0, 0, 'C-081', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
    grItem('CC0350914080550', 45, 245000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
    grItem('DD0500914120600', 35, 310000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
    grItem('EE0300762060500', 20, 185000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
    grItem('FF0400914090550', 50, 265000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
    grItem('GG0250610050450', 150, 75000, 0, 0, 0, '', 'GDG-004', { orgKode:'PCO_0002', noBuktiFrom:'KPO26070011', jenisDokFrom:'PO' }),
  ], { noRef:'KPN26070011', status:'SELESAI', alasanStatus:'Sisa barang menyusul terpisah, ditutup manual oleh operator' }),
];

function grComputeStatus(row) {
  if (row.Batal || row.Status === 'BATAL') return 'BATAL';
  if (row.Status === 'SELESAI') return 'SELESAI_MANUAL';
  const details = row.Details || [];
  if (details.length === 0) return 'BELUM_REALISASI';
  const realizedCount = details.filter(d => (+d.Qty_Realisasi || 0) > 0).length;
  const fullyRealizedCount = details.filter(d => (+d.Qty || 0) > 0 && (+d.Qty_Realisasi || 0) >= (+d.Qty || 0)).length;
  if (fullyRealizedCount === details.length) return 'SELESAI';
  if (realizedCount > 0) return 'SELESAI_SEBAGIAN';
  return 'BELUM_REALISASI';
}

function grStatusPill(row) {
  const s = grComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function grModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'No_Ref', label:'No. Ref (Quotation)', mono:true },
      { key:'Nama_Supp', label:'Nama Supplier', type:'select', required:true, span:2,
        options: () => PB_SUPPLIER.map(s => ({ value:s.Nama_Supp, label:s.Nama_Supp })),
        onChange: (val, set) => { const s = PB_SUPPLIER.find(x => x.Nama_Supp === val); set('Kode_Supp', s ? s.Kode_Supp : ''); } },
      { key:'Kode_Supp', label:'Kode Supplier', mono:true, readOnly:true, span:1 },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', showTotal:true, columns:[
      { key:'No_Bukti_From', label:'Doc Ref', mono:true, width:130, lockIfFilled:true },
      { key:'Kode_Gudang', label:'Gudang', type:'select', width:180,
        options: PB_GUDANG_OPTS,
        linkField:'Nama_Gudang', linkResolve: (val) => pbGudangNama(val) },
      { key:'Kode_PurchasingORG', label:'Purchasing Org', type:'select', width:250,
        options: () => PB_PURCHASING_ORG.map(o => ({ value:o.kode, label:o.nama })),
        linkField:'Ket_PurchasingORG', linkResolve: (val) => PB_PURCHASING_ORG.find(o => o.kode === val)?.nama || '' },
      { key:'Kode_Item', label:'Kode Item', mono:true, width:190 },
      { key:'Nama_Item', label:'Nama Item', width:380 },
      { key:'No_Coil', label:'No. Coil', mono:true, width:100 },
      { key:'Qty', label:'Qty', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Harga', label:'Harga', type:'number', num:true, width:130 },
      { key:'Disc1', label:'Disc (%)', type:'number', num:true, width:90 },
      { key:'DiscRp', label:'Disc (Rp)', type:'number', num:true, width:120 },
      { key:'Panjang', label:'Panjang', type:'number', num:true, width:90 },
      { key:'Jumlah', label:'Jumlah', compute: (r) => fmtRp(pbLineTotal(r)), width:160 },
      { key:'Jumlah_Dpp', label:'Jumlah Dpp', compute: (r) => fmtRp(pbLineTotal(r)), width:160 },
      { key:'Jumlah_Ppn', label:'Jumlah Ppn', compute: (r) => fmtRp(pbLineTotal(r) * 0.11), width:160 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:100, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_PRODUK, codeKey:'Kode_Item', nameKey:'Nama_Item', satuanKey:'Satuan', hargaKey:'Harga' }, lockItems:true },
  ];
}
