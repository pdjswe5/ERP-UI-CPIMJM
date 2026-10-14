// Pembelian — data & config Request for Quotation (RFQ)
//
// Status RFQ dihitung otomatis dari realisasi barang, KECUALI "Selesai Manual" yang
// merupakan override manual (field Status='SELESAI' diset lewat aksi "Selesaikan Manual").
// 5 kemungkinan: Belum Realisasi / Selesai Sebagian / Selesai / Selesai Manual / Batal.

function rfqItem(kode, qty, realisasi, deskripsi='', orgKode='PCO_0001') {
  const produk = PB_PRODUK.find(p => p.kode === kode);
  const org = PB_PURCHASING_ORG.find(o => o.kode === orgKode);
  return {
    Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:deskripsi,
    Qty:qty, Satuan: produk ? produk.satuan : 'PCS', Qty_Realisasi:realisasi,
    Kode_PurchasingORG:orgKode, Ket_PurchasingORG: org ? org.nama : '',
    Kode_Konversi:1, Konversi:1, No_Bukti_From:'', No_Id_From:0,
  };
}

function rfqHead(no, tgl, kodeSupp, ket, details, opts={}) {
  const supp = PB_SUPPLIER.find(s => s.Kode_Supp === kodeSupp);
  return {
    No_Bukti:no, Tgl_Bukti:tgl, Kode_Supp:kodeSupp, Nama_Supp: supp ? supp.Nama_Supp : kodeSupp,
    Keterangan:ket, Status: opts.status || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '', Alasan_Status: opts.alasanStatus || '',
    Creator:'PDJ Administrator', Jam_Create:`${tgl}T09:00:00`, Editor:'PDJ Administrator', Jam_Edit:`${tgl}T10:30:00`,
    Details: details,
  };
}

const PB_RFQ = [
  rfqHead('KPP26070001', '2026-07-02', 'MRR001', 'Pengadaan bahan baku minggu 1', [
    rfqItem('AA0450914100550', 150, 0),
    rfqItem('BB040091470550', 80, 0),
    rfqItem('CC0350914080550', 60, 0),
    rfqItem('DD0500914120600', 40, 0),
    rfqItem('EE0300762060500', 30, 0),
  ]),
  rfqHead('KPP26070002', '2026-07-03', 'AG001', 'Permintaan penawaran bahan cadangan', [
    rfqItem('AA0450914100550', 100, 100),
    rfqItem('BB040091470550', 50, 20, 'Realisasi tahap 1'),
    rfqItem('CC0350914080550', 40, 0),
    rfqItem('DD0500914120600', 30, 30),
    rfqItem('EE0300762060500', 25, 10, 'Realisasi tahap 1'),
    rfqItem('FF0400914090550', 35, 0),
    rfqItem('GG0250610050450', 20, 0),
  ]),
  rfqHead('KPP26070003', '2026-07-04', 'P003', 'Dibatalkan, harga tidak sesuai', [
    rfqItem('CC0350914080550', 45, 0),
    rfqItem('DD0500914120600', 30, 0),
    rfqItem('EE0300762060500', 55, 0),
    rfqItem('FF0400914090550', 20, 0),
    rfqItem('GG0250610050450', 35, 0),
    rfqItem('AA0450914100550', 25, 0),
  ], { status:'BATAL', batal:true, alasanBatal:'Harga penawaran tidak sesuai anggaran' }),
  rfqHead('KPP26070004', '2026-07-05', 'MRR001', 'Pengadaan proyek gudang blok A', [
    rfqItem('AA0450914100550', 200, 200),
    rfqItem('BB040091470550', 90, 90),
    rfqItem('CC0350914080550', 70, 70),
    rfqItem('DD0500914120600', 55, 55),
    rfqItem('EE0300762060500', 40, 40),
    rfqItem('FF0400914090550', 65, 65),
    rfqItem('GG0250610050450', 200, 200),
    rfqItem('AA0450914100550', 50, 50, 'Batch 2'),
    rfqItem('BB040091470550', 30, 30, 'Batch 2'),
  ]),
  rfqHead('KPP26070005', '2026-07-06', 'AG001', 'Pengadaan stok gudang Agustus', [
    rfqItem('AA0450914100550', 150, 0),
    rfqItem('BB040091470550', 90, 0),
    rfqItem('CC0350914080550', 70, 0),
    rfqItem('DD0500914120600', 55, 0),
    rfqItem('EE0300762060500', 40, 0),
    rfqItem('FF0400914090550', 65, 0),
    rfqItem('GG0250610050450', 200, 0),
    rfqItem('BB040091470550', 25, 0, 'Batch khusus'),
  ]),
  rfqHead('KPP26070006', '2026-07-07', 'P003', 'RFQ ditutup manual, kebutuhan berubah', [
    rfqItem('AA0450914100550', 80, 0),
    rfqItem('BB040091470550', 60, 0),
    rfqItem('CC0350914080550', 45, 0),
    rfqItem('DD0500914120600', 35, 0),
    rfqItem('EE0300762060500', 20, 0),
  ], { status:'SELESAI', alasanStatus:'Kebutuhan berubah, ditutup manual oleh operator' }),
  rfqHead('KPP26070007', '2026-07-08', 'MRR001', 'Pengadaan bahan baku minggu 2', [
    rfqItem('AA0450914100550', 120, 120),
    rfqItem('BB040091470550', 80, 40, 'Realisasi tahap 1'),
    rfqItem('CC0350914080550', 50, 0),
    rfqItem('DD0500914120600', 35, 35),
    rfqItem('EE0300762060500', 20, 10, 'Realisasi tahap 1'),
    rfqItem('FF0400914090550', 60, 0),
    rfqItem('GG0250610050450', 150, 75, 'Realisasi tahap 1'),
    rfqItem('AA0450914100550', 40, 0, 'Batch 2'),
    rfqItem('BB040091470550', 30, 30, 'Batch 2'),
    rfqItem('CC0350914080550', 25, 0, 'Batch 2'),
    rfqItem('DD0500914120600', 15, 15, 'Batch 2'),
  ]),
  rfqHead('KPP26070008', '2026-07-09', 'AG001', 'Pengadaan genteng & aksesoris', [
    rfqItem('GG0250610050450', 500, 500),
    rfqItem('AA0450914100550', 80, 80),
    rfqItem('BB040091470550', 65, 65),
    rfqItem('CC0350914080550', 45, 45),
    rfqItem('DD0500914120600', 30, 30),
    rfqItem('EE0300762060500', 20, 20),
  ]),
  rfqHead('KPP26070009', '2026-07-10', 'P003', 'Dibatalkan, anggaran dialihkan', [
    rfqItem('CC0350914080550', 45, 0),
    rfqItem('DD0500914120600', 30, 0),
    rfqItem('EE0300762060500', 55, 0),
    rfqItem('FF0400914090550', 20, 0),
    rfqItem('GG0250610050450', 35, 0),
  ], { status:'BATAL', batal:true, alasanBatal:'Anggaran dialihkan ke proyek lain' }),
  rfqHead('KPP26070010', '2026-07-11', 'MRR001', 'Pengadaan stok besar gudang utama', [
    rfqItem('AA0450914100550', 100, 0),
    rfqItem('BB040091470550', 90, 0),
    rfqItem('CC0350914080550', 70, 0),
    rfqItem('DD0500914120600', 55, 0),
    rfqItem('EE0300762060500', 40, 0),
    rfqItem('FF0400914090550', 65, 0),
    rfqItem('GG0250610050450', 200, 0),
    rfqItem('AA0450914100550', 50, 0, 'Batch B'),
    rfqItem('BB040091470550', 45, 0, 'Batch B'),
    rfqItem('CC0350914080550', 35, 0, 'Batch B'),
    rfqItem('DD0500914120600', 28, 0, 'Batch B'),
    rfqItem('EE0300762060500', 20, 0, 'Batch B'),
    rfqItem('FF0400914090550', 33, 0, 'Batch B'),
    rfqItem('GG0250610050450', 100, 0, 'Batch B'),
    rfqItem('AA0450914100550', 25, 0, 'Batch C'),
  ]),
  rfqHead('KPP26070011', '2026-07-12', 'AG001', 'RFQ superseded, ditutup manual', [
    rfqItem('AA0450914100550', 90, 0),
    rfqItem('BB040091470550', 60, 0),
    rfqItem('CC0350914080550', 45, 0),
    rfqItem('DD0500914120600', 35, 0),
    rfqItem('EE0300762060500', 20, 0),
    rfqItem('FF0400914090550', 50, 0),
    rfqItem('GG0250610050450', 150, 0),
  ], { status:'SELESAI', alasanStatus:'Digantikan RFQ baru, ditutup manual oleh operator' }),
  rfqHead('KPP26070012', '2026-07-13', 'P003', 'Pengadaan bahan baku minggu 3', [
    rfqItem('AA0450914100550', 100, 50, 'Realisasi tahap 1'),
    rfqItem('BB040091470550', 60, 60),
    rfqItem('CC0350914080550', 45, 0),
    rfqItem('DD0500914120600', 35, 35),
    rfqItem('EE0300762060500', 25, 10, 'Realisasi tahap 1'),
    rfqItem('FF0400914090550', 50, 0),
    rfqItem('GG0250610050450', 150, 75, 'Realisasi tahap 1'),
    rfqItem('AA0450914100550', 40, 0, 'Batch 2'),
    rfqItem('BB040091470550', 30, 0, 'Batch 2'),
    rfqItem('CC0350914080550', 20, 20, 'Batch 2'),
  ]),
];

function rfqComputeStatus(row) {
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

function rfqStatusPill(row) {
  const s = rfqComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function rfqModalTabs() {
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
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', columns:[
      { key:'Nama_Item', label:'Nama Barang', width:260 },
      { key:'Kode_Item', label:'Kode Barang', mono:true, width:170 },
      { key:'Qty', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Deskripsi', label:'Deskripsi', width:200 },
      { key:'Kode_PurchasingORG', label:'Purchasing Org', type:'select', width:190,
        options: () => PB_PURCHASING_ORG.map(o => ({ value:o.kode, label:o.nama })),
        linkField:'Ket_PurchasingORG',
        linkResolve: (val) => PB_PURCHASING_ORG.find(o => o.kode === val)?.nama || '' },
      { key:'Ket_PurchasingORG', label:'Ket. Purchasing Org', width:190 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:110, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_PRODUK, codeKey:'Kode_Item', nameKey:'Nama_Item', satuanKey:'Satuan' }, lockItems:true },
  ];
}
