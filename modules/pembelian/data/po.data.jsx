// Pembelian — data & config Purchase Order (PO)
//
// Status PO memakai model yang sama seperti RFQ/Quotation (lihat rfq.data.jsx): dihitung otomatis
// dari realisasi barang (Details), kecuali "Selesai Manual" yang merupakan override manual.
// 5 kemungkinan: Belum Realisasi / Selesai Sebagian / Selesai / Selesai Manual / Batal.

function poItem(kode, jumlah, harga, disc1, discRp, realisasi=0, noBuktiFrom='', deskripsi='', orgKode='PCO_0001') {
  const produk = PB_PRODUK.find(p => p.kode === kode);
  const org = PB_PURCHASING_ORG.find(o => o.kode === orgKode);
  return {
    Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:deskripsi,
    Jumlah:jumlah, Satuan: produk ? produk.satuan : 'PCS', Hrg_Sat:harga,
    DiscPros_Det:disc1, DiscNilai_Det:discRp, Qty_Realisasi:realisasi,
    Kode_PurchasingORG:orgKode, Ket_PurchasingORG: org ? org.nama : '',
    Kode_Konversi:1, Konversi:1, No_Bukti_From:noBuktiFrom, No_Id_From: noBuktiFrom ? 1 : 0, Jenis_Dok_From: noBuktiFrom ? 'PP' : '',
  };
}

function poBiayaItem(kodeAkun, jumlah, satuan, harga, disc1, discRp, realisasi=0, deskripsi='') {
  const akun = PB_AKUN.find(a => a.kode === kodeAkun);
  return {
    Kode_Item:kodeAkun, Nama_Item: akun ? akun.nama : '', Deskripsi:deskripsi,
    Jumlah:jumlah, Satuan:satuan, Hrg_Sat:harga, DiscPros_Det:disc1, DiscNilai_Det:discRp, Qty_Realisasi:realisasi,
  };
}

function poHead(no, tgl, kodeSupp, noReferensi, kreditTunai, tempo, ket, details, details2, opts={}) {
  const supp = PB_SUPPLIER.find(s => s.Kode_Supp === kodeSupp);
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Referensi:noReferensi, Kode_Supp:kodeSupp, Nama_Supp: supp ? supp.Nama_Supp : kodeSupp,
    PPN:11, PPN_Include:false, DiscPros_Head:0, DiscNilai_Head:0, Kredit_Tunai:kreditTunai, Tempo:tempo, Keterangan:ket,
    Status: opts.status || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '', Alasan_Status: opts.alasanStatus || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:46:43`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:20:00`,
    Details:details, Details2:details2,
  };
}

const PB_PO = [
  poHead('KPO26070001', '2026-07-09', 'MRR001', 'KPN26070001', 'KREDIT', 14, 'PO hasil quotation Juli', [
    poItem('AA0450914100550', 150, 275000, 5, 0, 0, 'KPN26070001'),
    poItem('BB040091470550', 60, 260000, 0, 0, 0, 'KPN26070001'),
    poItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPN26070001'),
    poItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPN26070001'),
    poItem('EE0300762060500', 25, 185000, 0, 0, 0, 'KPN26070001'),
  ], [
    poBiayaItem('200.001', 1, 'PCS', 350000, 0, 0, 0, 'Ongkir Surabaya-gudang'),
  ], { creator:'Ucup', editor:'' }),
  poHead('KPO26070002', '2026-07-10', 'AG001', 'KPN26070002', 'TUNAI', 0, '', [
    poItem('BB040091470550', 50, 260000, 0, 10000, 50, 'KPN26070002'),
    poItem('CC0350914080550', 40, 245000, 0, 0, 20, 'KPN26070002'),
    poItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPN26070002'),
    poItem('EE0300762060500', 25, 185000, 0, 0, 25, 'KPN26070002'),
    poItem('FF0400914090550', 35, 265000, 0, 0, 0, 'KPN26070002'),
    poItem('GG0250610050450', 20, 75000, 0, 0, 0, 'KPN26070002'),
  ], [
    poBiayaItem('200.002', 1, 'PCS', 150000, 0, 0, 0, 'Bongkar muat gudang'),
  ]),
  poHead('KPO26070003', '2026-07-11', 'P003', 'KPN26070003', 'KREDIT', 30, 'Dibatalkan, harga tidak sesuai', [
    poItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPN26070003'),
    poItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPN26070003'),
    poItem('EE0300762060500', 55, 185000, 0, 0, 0, 'KPN26070003'),
    poItem('FF0400914090550', 20, 265000, 0, 0, 0, 'KPN26070003'),
    poItem('GG0250610050450', 35, 75000, 0, 0, 0, 'KPN26070003'),
  ], [], { status:'BATAL', batal:true, alasanBatal:'Harga penawaran tidak sesuai anggaran' }),
  poHead('KPO26070004', '2026-07-12', 'MRR001', 'KPN26070004', 'KREDIT', 14, 'Pengadaan proyek gudang blok A', [
    poItem('AA0450914100550', 200, 275000, 5, 0, 200, 'KPN26070004'),
    poItem('BB040091470550', 90, 260000, 0, 0, 90, 'KPN26070004'),
    poItem('CC0350914080550', 70, 245000, 0, 0, 70, 'KPN26070004'),
    poItem('DD0500914120600', 55, 310000, 0, 0, 55, 'KPN26070004'),
    poItem('EE0300762060500', 40, 185000, 0, 0, 40, 'KPN26070004'),
    poItem('FF0400914090550', 65, 265000, 0, 0, 65, 'KPN26070004'),
    poItem('GG0250610050450', 200, 75000, 0, 0, 200, 'KPN26070004'),
  ], [
    poBiayaItem('200.001', 1, 'PCS', 500000, 0, 0, 1, 'Ongkir proyek blok A'),
  ]),
  poHead('KPO26070005', '2026-07-13', 'AG001', 'KPN26070005', 'TUNAI', 0, 'Pengadaan stok gudang Agustus', [
    poItem('AA0450914100550', 150, 275000, 0, 0, 0, 'KPN26070005'),
    poItem('BB040091470550', 90, 260000, 0, 0, 0, 'KPN26070005'),
    poItem('CC0350914080550', 70, 245000, 0, 0, 0, 'KPN26070005'),
    poItem('DD0500914120600', 55, 310000, 0, 0, 0, 'KPN26070005'),
    poItem('EE0300762060500', 40, 185000, 0, 0, 0, 'KPN26070005'),
    poItem('FF0400914090550', 65, 265000, 0, 0, 0, 'KPN26070005'),
    poItem('GG0250610050450', 200, 75000, 0, 0, 0, 'KPN26070005'),
    poItem('BB040091470550', 25, 260000, 0, 0, 0, 'KPN26070005', 'Batch khusus'),
  ], []),
  poHead('KPO26070006', '2026-07-14', 'P003', 'KPN26070006', 'KREDIT', 30, 'PO ditutup manual, kebutuhan berubah', [
    poItem('AA0450914100550', 80, 275000, 0, 0, 0, 'KPN26070006'),
    poItem('BB040091470550', 60, 260000, 0, 0, 0, 'KPN26070006'),
    poItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPN26070006'),
    poItem('DD0500914120600', 35, 310000, 0, 0, 0, 'KPN26070006'),
    poItem('EE0300762060500', 20, 185000, 0, 0, 0, 'KPN26070006'),
  ], [], { status:'SELESAI', alasanStatus:'Kebutuhan berubah, ditutup manual oleh operator' }),
  poHead('KPO26070007', '2026-07-15', 'MRR001', 'KPN26070007', 'KREDIT', 14, 'Pengadaan bahan baku minggu 2', [
    poItem('AA0450914100550', 120, 275000, 0, 0, 120, 'KPN26070007'),
    poItem('BB040091470550', 80, 260000, 0, 0, 40, 'KPN26070007', 'Realisasi tahap 1'),
    poItem('CC0350914080550', 50, 245000, 0, 0, 0, 'KPN26070007'),
    poItem('DD0500914120600', 35, 310000, 0, 0, 35, 'KPN26070007'),
    poItem('EE0300762060500', 20, 185000, 0, 0, 10, 'KPN26070007', 'Realisasi tahap 1'),
    poItem('FF0400914090550', 60, 265000, 0, 0, 0, 'KPN26070007'),
    poItem('GG0250610050450', 150, 75000, 0, 0, 75, 'KPN26070007', 'Realisasi tahap 1'),
    poItem('AA0450914100550', 40, 275000, 0, 0, 0, 'KPN26070007', 'Batch 2'),
    poItem('BB040091470550', 30, 260000, 0, 0, 30, 'KPN26070007', 'Batch 2'),
    poItem('CC0350914080550', 25, 245000, 0, 0, 0, 'KPN26070007', 'Batch 2'),
    poItem('DD0500914120600', 15, 310000, 0, 0, 15, 'KPN26070007', 'Batch 2'),
  ], [
    poBiayaItem('200.002', 1, 'PCS', 200000, 0, 0, 1, 'Bongkar muat batch 2'),
  ]),
  poHead('KPO26070008', '2026-07-16', 'AG001', 'KPN26070008', 'TUNAI', 0, 'Pengadaan genteng & aksesoris', [
    poItem('GG0250610050450', 500, 75000, 0, 0, 500, 'KPN26070008'),
    poItem('AA0450914100550', 80, 275000, 0, 0, 80, 'KPN26070008'),
    poItem('BB040091470550', 65, 260000, 0, 0, 65, 'KPN26070008'),
    poItem('CC0350914080550', 45, 245000, 0, 0, 45, 'KPN26070008'),
    poItem('DD0500914120600', 30, 310000, 0, 0, 30, 'KPN26070008'),
    poItem('EE0300762060500', 20, 185000, 0, 0, 20, 'KPN26070008'),
  ], []),
  poHead('KPO26070009', '2026-07-16', 'P003', 'KPN26070009', 'KREDIT', 30, 'Dibatalkan, anggaran dialihkan', [
    poItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPN26070009'),
    poItem('DD0500914120600', 30, 310000, 0, 0, 0, 'KPN26070009'),
    poItem('EE0300762060500', 55, 185000, 0, 0, 0, 'KPN26070009'),
    poItem('FF0400914090550', 20, 265000, 0, 0, 0, 'KPN26070009'),
    poItem('GG0250610050450', 35, 75000, 0, 0, 0, 'KPN26070009'),
  ], [], { status:'BATAL', batal:true, alasanBatal:'Anggaran dialihkan ke proyek lain' }),
  poHead('KPO26070010', '2026-07-17', 'MRR001', 'KPN26070010', 'KREDIT', 14, 'Pengadaan stok besar gudang utama', [
    poItem('AA0450914100550', 100, 275000, 0, 0, 0, 'KPN26070010'),
    poItem('BB040091470550', 90, 260000, 0, 0, 0, 'KPN26070010'),
    poItem('CC0350914080550', 70, 245000, 0, 0, 0, 'KPN26070010'),
    poItem('DD0500914120600', 55, 310000, 0, 0, 0, 'KPN26070010'),
    poItem('EE0300762060500', 40, 185000, 0, 0, 0, 'KPN26070010'),
    poItem('FF0400914090550', 65, 265000, 0, 0, 0, 'KPN26070010'),
    poItem('GG0250610050450', 200, 75000, 0, 0, 0, 'KPN26070010'),
    poItem('AA0450914100550', 50, 275000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('BB040091470550', 45, 260000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('CC0350914080550', 35, 245000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('DD0500914120600', 28, 310000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('EE0300762060500', 20, 185000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('FF0400914090550', 33, 265000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('GG0250610050450', 100, 75000, 0, 0, 0, 'KPN26070010', 'Batch B'),
    poItem('AA0450914100550', 25, 275000, 0, 0, 0, 'KPN26070010', 'Batch C'),
  ], [
    poBiayaItem('200.001', 1, 'PCS', 750000, 0, 0, 0, 'Ongkir gudang utama'),
  ]),
  poHead('KPO26070011', '2026-07-18', 'AG001', 'KPN26070011', 'TUNAI', 0, 'PO superseded, ditutup manual', [
    poItem('AA0450914100550', 90, 275000, 0, 0, 0, 'KPN26070011'),
    poItem('BB040091470550', 60, 260000, 0, 0, 0, 'KPN26070011'),
    poItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPN26070011'),
    poItem('DD0500914120600', 35, 310000, 0, 0, 0, 'KPN26070011'),
    poItem('EE0300762060500', 20, 185000, 0, 0, 0, 'KPN26070011'),
    poItem('FF0400914090550', 50, 265000, 0, 0, 0, 'KPN26070011'),
    poItem('GG0250610050450', 150, 75000, 0, 0, 0, 'KPN26070011'),
  ], [], { status:'SELESAI', alasanStatus:'Digantikan PO baru, ditutup manual oleh operator' }),
  poHead('KPO26070012', '2026-07-19', 'P003', 'KPN26070012', 'KREDIT', 30, 'Pengadaan bahan baku minggu 3', [
    poItem('AA0450914100550', 100, 275000, 0, 0, 50, 'KPN26070012', 'Realisasi tahap 1'),
    poItem('BB040091470550', 60, 260000, 0, 0, 60, 'KPN26070012'),
    poItem('CC0350914080550', 45, 245000, 0, 0, 0, 'KPN26070012'),
    poItem('DD0500914120600', 35, 310000, 0, 0, 35, 'KPN26070012'),
    poItem('EE0300762060500', 25, 185000, 0, 0, 10, 'KPN26070012', 'Realisasi tahap 1'),
    poItem('FF0400914090550', 50, 265000, 0, 0, 0, 'KPN26070012'),
    poItem('GG0250610050450', 150, 75000, 0, 0, 75, 'KPN26070012', 'Realisasi tahap 1'),
    poItem('AA0450914100550', 40, 275000, 0, 0, 0, 'KPN26070012', 'Batch 2'),
    poItem('BB040091470550', 30, 260000, 0, 0, 0, 'KPN26070012', 'Batch 2'),
    poItem('CC0350914080550', 20, 245000, 0, 0, 20, 'KPN26070012', 'Batch 2'),
  ], [
    poBiayaItem('200.002', 1, 'PCS', 300000, 0, 0, 0, 'Bongkar muat minggu 3'),
  ]),
];

function poComputeStatus(row) {
  if (row.Batal || row.Status === 'BATAL') return 'BATAL';
  if (row.Status === 'SELESAI') return 'SELESAI_MANUAL';
  const details = row.Details || [];
  if (details.length === 0) return 'BELUM_REALISASI';
  const realizedCount = details.filter(d => (+d.Qty_Realisasi || 0) > 0).length;
  const fullyRealizedCount = details.filter(d => (+d.Jumlah || 0) > 0 && (+d.Qty_Realisasi || 0) >= (+d.Jumlah || 0)).length;
  if (fullyRealizedCount === details.length) return 'SELESAI';
  if (realizedCount > 0) return 'SELESAI_SEBAGIAN';
  return 'BELUM_REALISASI';
}

function poStatusPill(row) {
  const s = poComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function poModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'Nama_Supp', label:'Nama Supplier', type:'select', required:true, span:2,
        options: () => PB_SUPPLIER.map(s => ({ value:s.Nama_Supp, label:s.Nama_Supp })),
        onChange: (val, set) => { const s = PB_SUPPLIER.find(x => x.Nama_Supp === val); set('Kode_Supp', s ? s.Kode_Supp : ''); } },
      { key:'Kode_Supp', label:'Kode Supplier', mono:true, readOnly:true, span:1 },
      { key:'No_Referensi', label:'No. Referensi', mono:true, lockOnEdit:true },
      { key:'Kredit_Tunai', label:'Kredit/Tunai', type:'select', options:[{value:'TUNAI',label:'Tunai'},{value:'KREDIT',label:'Kredit'}], lockOnEdit:true },
      { key:'Tempo', label:'Tempo (hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', showTotal:true, columns:[
      { key:'No_Bukti_From', label:'Ref. Dok', mono:true, width:110, lockIfFilled:true },
      { key:'Kode_Item', label:'Kode Item', mono:true, width:170 },
      { key:'Nama_Item', label:'Nama Item', width:240 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:80 },
      { key:'Satuan', label:'Satuan', width:80 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:110 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:80 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:100 },
      { key:'Total', label:'Total', compute: (r) => fmtRp(pbLineTotal(r)), width:130 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:100, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_PRODUK, codeKey:'Kode_Item', nameKey:'Nama_Item', satuanKey:'Satuan', hargaKey:'Hrg_Sat' }, lockItems:true },
    { id:'biaya', label:'Non-Produk atau Biaya', type:'items', itemsKey:'Details2', showTotal:true, columns:[
      { key:'Kode_Item', label:'Kode Akun', mono:true, width:110 },
      { key:'Nama_Item', label:'Nama Akun', width:200 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:80 },
      { key:'Satuan', label:'Satuan', width:80 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:110 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:80 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:100 },
      { key:'Total', label:'Total', compute: (r) => fmtRp(pbLineTotal(r)), width:130 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:100, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_AKUN, codeKey:'Kode_Item', nameKey:'Nama_Item' }, lockItems:true },
  ];
}
