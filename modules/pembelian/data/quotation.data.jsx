// Pembelian — data & config Quotation
//
// Status Quotation memakai model yang sama seperti RFQ (lihat rfq.data.jsx): dihitung otomatis
// dari realisasi barang, kecuali "Selesai Manual" yang merupakan override manual.
// 5 kemungkinan: Belum Realisasi / Selesai Sebagian / Selesai / Selesai Manual / Batal.

function quotationItem(kode, qty, harga, disc1, discRp, realisasi=0, noBuktiFrom='', deskripsi='', orgKode='PCO_0001') {
  const produk = PB_PRODUK.find(p => p.kode === kode);
  const org = PB_PURCHASING_ORG.find(o => o.kode === orgKode);
  return {
    Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:deskripsi,
    Qty:qty, Satuan: produk ? produk.satuan : 'PCS', Harga:harga,
    Disc1:disc1, Disc2:0, DiscRp:discRp, Qty_Realisasi:realisasi,
    Kode_PurchasingORG:orgKode, Ket_PurchasingORG: org ? org.nama : '',
    Kode_Konversi:1, Konversi:1, No_Bukti_From:noBuktiFrom, No_Id_From: noBuktiFrom ? 1 : 0,
  };
}

function quotationHead(no, tgl, kodeSupp, ket, details, opts={}) {
  const supp = PB_SUPPLIER.find(s => s.Kode_Supp === kodeSupp);
  return {
    No_Bukti:no, Tgl_Bukti:tgl, Kode_Supp:kodeSupp, Nama_Supp: supp ? supp.Nama_Supp : kodeSupp,
    Keterangan:ket, Ppn:11, Ppn_Include:false, Disc: opts.disc ?? 0, Disc_Rp: opts.discRp ?? 0,
    Status: opts.status || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '', Alasan_Status: opts.alasanStatus || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:46:43`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:20:00`,
    Details: details,
  };
}

const PB_QUOTATION = [
  quotationHead('KPN26070001', '2026-07-09', 'MRR001', 'Baik', [
    quotationItem('AA0450914100550', 100, 275000, 5, 10000, 0, 'KPP26070001'),
    quotationItem('BB040091470550', 60, 260000, 0, 0, 0, 'KPP26070001'),
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPP26070001'),
    quotationItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPP26070001'),
    quotationItem('EE0300762060500', 25, 185000, 0, 0, 0, 'KPP26070001'),
  ], { disc:5, discRp:250000, creator:'Ucup', editor:'' }),
  quotationHead('KPN26070002', '2026-07-10', 'AG001', '', [
    quotationItem('BB040091470550', 50, 260000, 0, 0, 50, 'KPP26070002'),
    quotationItem('CC0350914080550', 40, 245000, 0, 0, 20, 'KPP26070002'),
    quotationItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPP26070002'),
    quotationItem('EE0300762060500', 25, 185000, 0, 0, 25, 'KPP26070002'),
    quotationItem('FF0400914090550', 35, 265000, 0, 0, 0, 'KPP26070002'),
    quotationItem('GG0250610050450', 20, 75000, 0, 0, 0, 'KPP26070002'),
  ], { discRp:10000 }),
  quotationHead('KPN26070003', '2026-07-11', 'P003', 'Dibatalkan, harga tidak sesuai', [
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPP26070003'),
    quotationItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPP26070003'),
    quotationItem('EE0300762060500', 55, 185000, 0, 0, 0, 'KPP26070003'),
    quotationItem('FF0400914090550', 20, 265000, 0, 0, 0, 'KPP26070003'),
    quotationItem('GG0250610050450', 35, 75000, 0, 0, 0, 'KPP26070003'),
  ], { status:'BATAL', batal:true, alasanBatal:'Harga penawaran tidak sesuai anggaran' }),
  quotationHead('KPN26070004', '2026-07-12', 'MRR001', 'Pengadaan proyek gudang blok A', [
    quotationItem('AA0450914100550', 200, 275000, 5, 0, 200, 'KPP26070004'),
    quotationItem('BB040091470550', 90, 260000, 0, 0, 90, 'KPP26070004'),
    quotationItem('CC0350914080550', 70, 245000, 0, 0, 70, 'KPP26070004'),
    quotationItem('DD0500914120600', 55, 310000, 0, 0, 55, 'KPP26070004'),
    quotationItem('EE0300762060500', 40, 185000, 0, 0, 40, 'KPP26070004'),
    quotationItem('FF0400914090550', 65, 265000, 0, 0, 65, 'KPP26070004'),
    quotationItem('GG0250610050450', 200, 75000, 0, 0, 200, 'KPP26070004'),
  ]),
  quotationHead('KPN26070005', '2026-07-13', 'AG001', 'Pengadaan stok gudang Agustus', [
    quotationItem('AA0450914100550', 150, 275000, 0, 0, 0, 'KPP26070005'),
    quotationItem('BB040091470550', 90, 260000, 0, 0, 0, 'KPP26070005'),
    quotationItem('CC0350914080550', 70, 245000, 0, 0, 0, 'KPP26070005'),
    quotationItem('DD0500914120600', 55, 310000, 0, 0, 0, 'KPP26070005'),
    quotationItem('EE0300762060500', 40, 185000, 0, 0, 0, 'KPP26070005'),
    quotationItem('FF0400914090550', 65, 265000, 0, 0, 0, 'KPP26070005'),
    quotationItem('GG0250610050450', 200, 75000, 0, 0, 0, 'KPP26070005'),
    quotationItem('BB040091470550', 25, 260000, 0, 0, 0, 'KPP26070005', 'Batch khusus'),
  ]),
  quotationHead('KPN26070006', '2026-07-14', 'P003', 'Quotation ditutup manual, kebutuhan berubah', [
    quotationItem('AA0450914100550', 80, 275000, 0, 0, 0, 'KPP26070006'),
    quotationItem('BB040091470550', 60, 260000, 0, 0, 0, 'KPP26070006'),
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPP26070006'),
    quotationItem('DD0500914120600', 35, 310000, 0, 0, 0, 'KPP26070006'),
    quotationItem('EE0300762060500', 20, 185000, 0, 0, 0, 'KPP26070006'),
  ], { status:'SELESAI', alasanStatus:'Kebutuhan berubah, ditutup manual oleh operator' }),
  quotationHead('KPN26070007', '2026-07-15', 'MRR001', 'Pengadaan bahan baku minggu 2', [
    quotationItem('AA0450914100550', 120, 275000, 0, 0, 120, 'KPP26070007'),
    quotationItem('BB040091470550', 80, 260000, 0, 0, 40, 'KPP26070007', 'Realisasi tahap 1'),
    quotationItem('CC0350914080550', 50, 245000, 0, 0, 0, 'KPP26070007'),
    quotationItem('DD0500914120600', 35, 310000, 0, 0, 35, 'KPP26070007'),
    quotationItem('EE0300762060500', 20, 185000, 0, 0, 10, 'KPP26070007', 'Realisasi tahap 1'),
    quotationItem('FF0400914090550', 60, 265000, 0, 0, 0, 'KPP26070007'),
    quotationItem('GG0250610050450', 150, 75000, 0, 0, 75, 'KPP26070007', 'Realisasi tahap 1'),
    quotationItem('AA0450914100550', 40, 275000, 0, 0, 0, 'KPP26070007', 'Batch 2'),
    quotationItem('BB040091470550', 30, 260000, 0, 0, 30, 'KPP26070007', 'Batch 2'),
    quotationItem('CC0350914080550', 25, 245000, 0, 0, 0, 'KPP26070007', 'Batch 2'),
    quotationItem('DD0500914120600', 15, 310000, 0, 0, 15, 'KPP26070007', 'Batch 2'),
  ]),
  quotationHead('KPN26070008', '2026-07-16', 'AG001', 'Pengadaan genteng & aksesoris', [
    quotationItem('GG0250610050450', 500, 75000, 0, 0, 500, 'KPP26070008'),
    quotationItem('AA0450914100550', 80, 275000, 0, 0, 80, 'KPP26070008'),
    quotationItem('BB040091470550', 65, 260000, 0, 0, 65, 'KPP26070008'),
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 45, 'KPP26070008'),
    quotationItem('DD0500914120600', 30, 310000, 0, 0, 30, 'KPP26070008'),
    quotationItem('EE0300762060500', 20, 185000, 0, 0, 20, 'KPP26070008'),
  ]),
  quotationHead('KPN26070009', '2026-07-16', 'P003', 'Dibatalkan, anggaran dialihkan', [
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPP26070009'),
    quotationItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPP26070009'),
    quotationItem('EE0300762060500', 55, 185000, 0, 0, 0, 'KPP26070009'),
    quotationItem('FF0400914090550', 20, 265000, 0, 0, 0, 'KPP26070009'),
    quotationItem('GG0250610050450', 35, 75000, 0, 0, 0, 'KPP26070009'),
  ], { status:'BATAL', batal:true, alasanBatal:'Anggaran dialihkan ke proyek lain' }),
  quotationHead('KPN26070010', '2026-07-17', 'MRR001', 'Pengadaan stok besar gudang utama', [
    quotationItem('AA0450914100550', 100, 275000, 0, 0, 0, 'KPP26070010'),
    quotationItem('BB040091470550', 90, 260000, 0, 0, 0, 'KPP26070010'),
    quotationItem('CC0350914080550', 70, 245000, 0, 0, 0, 'KPP26070010'),
    quotationItem('DD0500914120600', 55, 310000, 0, 0, 0, 'KPP26070010'),
    quotationItem('EE0300762060500', 40, 185000, 0, 0, 0, 'KPP26070010'),
    quotationItem('FF0400914090550', 65, 265000, 0, 0, 0, 'KPP26070010'),
    quotationItem('GG0250610050450', 200, 75000, 0, 0, 0, 'KPP26070010'),
    quotationItem('AA0450914100550', 50, 275000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('BB040091470550', 45, 260000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('CC0350914080550', 35, 245000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('DD0500914120600', 28, 310000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('EE0300762060500', 20, 185000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('FF0400914090550', 33, 265000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('GG0250610050450', 100, 75000, 0, 0, 0, 'KPP26070010', 'Batch B'),
    quotationItem('AA0450914100550', 25, 275000, 0, 0, 0, 'KPP26070010', 'Batch C'),
  ]),
  quotationHead('KPN26070011', '2026-07-18', 'AG001', 'Quotation superseded, ditutup manual', [
    quotationItem('AA0450914100550', 90, 275000, 0, 0, 0, 'KPP26070011'),
    quotationItem('BB040091470550', 60, 260000, 0, 0, 0, 'KPP26070011'),
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPP26070011'),
    quotationItem('DD0500914120600', 35, 310000, 0, 0, 0, 'KPP26070011'),
    quotationItem('EE0300762060500', 20, 185000, 0, 0, 0, 'KPP26070011'),
    quotationItem('FF0400914090550', 50, 265000, 0, 0, 0, 'KPP26070011'),
    quotationItem('GG0250610050450', 150, 75000, 0, 0, 0, 'KPP26070011'),
  ], { status:'SELESAI', alasanStatus:'Digantikan Quotation baru, ditutup manual oleh operator' }),
  quotationHead('KPN26070012', '2026-07-19', 'P003', 'Pengadaan bahan baku minggu 3', [
    quotationItem('AA0450914100550', 100, 275000, 0, 0, 50, 'KPP26070012', 'Realisasi tahap 1'),
    quotationItem('BB040091470550', 60, 260000, 0, 0, 60, 'KPP26070012'),
    quotationItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPP26070012'),
    quotationItem('DD0500914120600', 35, 310000, 0, 0, 35, 'KPP26070012'),
    quotationItem('EE0300762060500', 25, 185000, 0, 0, 10, 'KPP26070012', 'Realisasi tahap 1'),
    quotationItem('FF0400914090550', 50, 265000, 0, 0, 0, 'KPP26070012'),
    quotationItem('GG0250610050450', 150, 75000, 0, 0, 75, 'KPP26070012', 'Realisasi tahap 1'),
    quotationItem('AA0450914100550', 40, 275000, 0, 0, 0, 'KPP26070012', 'Batch 2'),
    quotationItem('BB040091470550', 30, 260000, 0, 0, 0, 'KPP26070012', 'Batch 2'),
    quotationItem('CC0350914080550', 20, 245000, 0, 0, 20, 'KPP26070012', 'Batch 2'),
  ]),
];

function quotationComputeStatus(row) {
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

function quotationStatusPill(row) {
  const s = quotationComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function quotationModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'Nama_Supp', label:'Nama Supplier', type:'select', required:true, span:2,
        options: () => PB_SUPPLIER.map(s => ({ value:s.Nama_Supp, label:s.Nama_Supp })),
        onChange: (val, set) => { const s = PB_SUPPLIER.find(x => x.Nama_Supp === val); set('Kode_Supp', s ? s.Kode_Supp : ''); } },
      { key:'Kode_Supp', label:'Kode Supplier', mono:true, readOnly:true, span:1 },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', showTotal:true, columns: [
      { key:'No_Bukti_From', label:'Ref. RFQ', mono:true, width:110, lockIfFilled:true },
      { key:'Kode_Item', label:'Kode Item', mono:true, width:170 },
      { key:'Nama_Item', label:'Nama Item', width:240 },
      { key:'Qty', label:'Jumlah', type:'number', num:true, width:80 },
      { key:'Satuan', label:'Satuan', width:80 },
      { key:'Harga', label:'Harga', type:'number', num:true, width:110 },
      { key:'Disc1', label:'Disc (%)', type:'number', num:true, width:80 },
      { key:'DiscRp', label:'Disc (Rp)', type:'number', num:true, width:100 },
      { key:'Total', label:'Total', compute: (r) => fmtRp(pbLineTotal(r)), width:130 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:100, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_PRODUK, codeKey:'Kode_Item', nameKey:'Nama_Item', satuanKey:'Satuan', hargaKey:'Harga' }, lockItems:true },
  ];
}
