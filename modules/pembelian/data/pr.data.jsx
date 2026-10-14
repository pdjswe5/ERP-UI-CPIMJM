// Pembelian — data & config Purchase Request (PR)
//
// Status PR TIDAK diisi manual — dihitung otomatis dari perbandingan Qty vs Qty_Realisasi
// tiap baris Details (lihat prComputeStatus/prStatusPill di bawah). Hanya 4 kemungkinan:
// Belum Realisasi (semua baris Qty_Realisasi 0) / Selesai Sebagian (sebagian sudah realisasi,
// belum semua) / Selesai (semua baris sudah Qty_Realisasi >= Qty) / Batal (field Batal=true).

function prItem(kode, qty, realisasi, deskripsi='') {
  const satuan = PB_PRODUK.find(p => p.kode === kode)?.satuan || 'PCS';
  return { Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:deskripsi, Qty:qty, Satuan:satuan, Kode_Konversi:1, Konversi:1, Qty_Realisasi:realisasi };
}

const PB_PR = [
  { No_Bukti:'PB26070001', Tgl_Bukti:'2026-07-01', Kode_PurchasingORG:'PCO_0001', Keterangan:'Pengadaan bahan baku Juli', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('AA0450914100550', 150, 0, 'Ukuran standar'),
      prItem('BB040091470550', 80, 0),
      prItem('CC0350914080550', 60, 0, 'Untuk stok cadangan'),
    ] },
  { No_Bukti:'PB26070002', Tgl_Bukti:'2026-07-02', Kode_PurchasingORG:'PCO_0002', Keterangan:'Pengadaan material minggu 1', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('AA0450914100550', 100, 100),
      prItem('BB040091470550', 50, 20, 'Realisasi bertahap'),
      prItem('CC0350914080550', 40, 0),
      prItem('DD0500914120600', 30, 30),
    ] },
  { No_Bukti:'PB26070003', Tgl_Bukti:'2026-07-03', Kode_PurchasingORG:'PCO_0001', Keterangan:'Dibatalkan karena supplier tidak tersedia', Status:'BATAL', Batal:true, Alasan_Batal:'Supplier tidak sanggup memenuhi jadwal',
    Details:[
      prItem('EE0300762060500', 25, 0),
      prItem('FF0400914090550', 15, 0),
    ] },
  { No_Bukti:'PB26070004', Tgl_Bukti:'2026-07-04', Kode_PurchasingORG:'PCO_0002', Keterangan:'Pengadaan proyek gudang blok A', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('AA0450914100550', 200, 200),
      prItem('CC0350914080550', 90, 90),
      prItem('DD0500914120600', 70, 70),
      prItem('EE0300762060500', 40, 40),
      prItem('GG0250610050450', 300, 300),
    ] },
  { No_Bukti:'PB26070005', Tgl_Bukti:'2026-07-05', Kode_PurchasingORG:'PCO_0001', Keterangan:'Pengadaan material cadangan', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('BB040091470550', 60, 0),
      prItem('FF0400914090550', 45, 0),
    ] },
  { No_Bukti:'PB26070006', Tgl_Bukti:'2026-07-06', Kode_PurchasingORG:'PCO_0002', Keterangan:'Pengadaan bahan baku minggu 2', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('AA0450914100550', 120, 120),
      prItem('BB040091470550', 80, 40, 'Realisasi tahap 1'),
      prItem('CC0350914080550', 50, 0),
      prItem('DD0500914120600', 35, 35),
      prItem('EE0300762060500', 20, 10, 'Realisasi tahap 1'),
      prItem('FF0400914090550', 60, 0),
    ] },
  { No_Bukti:'PB26070007', Tgl_Bukti:'2026-07-07', Kode_PurchasingORG:'PCO_0001', Keterangan:'Pengadaan genteng & aksesoris', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('GG0250610050450', 500, 500),
      prItem('AA0450914100550', 80, 80),
      prItem('BB040091470550', 65, 65),
    ] },
  { No_Bukti:'PB26070008', Tgl_Bukti:'2026-07-08', Kode_PurchasingORG:'PCO_0002', Keterangan:'Pengadaan stok gudang Agustus', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('AA0450914100550', 150, 0),
      prItem('BB040091470550', 90, 0),
      prItem('CC0350914080550', 70, 0),
      prItem('DD0500914120600', 55, 0),
      prItem('EE0300762060500', 40, 0),
      prItem('FF0400914090550', 65, 0),
      prItem('GG0250610050450', 200, 0),
      prItem('BB040091470550', 25, 0, 'Ukuran khusus, batch terpisah'),
    ] },
  { No_Bukti:'PB26070009', Tgl_Bukti:'2026-07-09', Kode_PurchasingORG:'PCO_0001', Keterangan:'Dibatalkan, anggaran dialihkan', Status:'BATAL', Batal:true, Alasan_Batal:'Anggaran dialihkan ke proyek lain',
    Details:[
      prItem('CC0350914080550', 45, 0),
      prItem('DD0500914120600', 30, 0),
      prItem('EE0300762060500', 55, 0),
      prItem('FF0400914090550', 20, 0),
    ] },
  { No_Bukti:'PB26070010', Tgl_Bukti:'2026-07-10', Kode_PurchasingORG:'PCO_0002', Keterangan:'Pengadaan bahan baku minggu 3', Status:'', Batal:false, Alasan_Batal:'',
    Details:[
      prItem('AA0450914100550', 100, 50, 'Realisasi tahap 1'),
      prItem('BB040091470550', 60, 60),
      prItem('CC0350914080550', 45, 0),
      prItem('DD0500914120600', 35, 35),
      prItem('EE0300762060500', 25, 10, 'Realisasi tahap 1'),
      prItem('FF0400914090550', 50, 0),
      prItem('GG0250610050450', 150, 75, 'Realisasi tahap 1'),
    ] },
];

function prComputeStatus(row) {
  if (row.Batal || row.Status === 'BATAL') return 'BATAL';
  const details = row.Details || [];
  if (details.length === 0) return 'BELUM_REALISASI';
  const realizedCount = details.filter(d => (+d.Qty_Realisasi || 0) > 0).length;
  const fullyRealizedCount = details.filter(d => (+d.Qty || 0) > 0 && (+d.Qty_Realisasi || 0) >= (+d.Qty || 0)).length;
  if (fullyRealizedCount === details.length) return 'SELESAI';
  if (realizedCount > 0) return 'SELESAI_SEBAGIAN';
  return 'BELUM_REALISASI';
}

function prStatusPill(row) {
  const s = prComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function prModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'Kode_PurchasingORG', label:'Purchasing Org', type:'select', options:PB_ORG_OPTS, required:true },
      { key:'Keterangan', label:'Catatan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', columns:[
      { key:'Nama_Item', label:'Nama Barang', width:280 },
      { key:'Kode_Item', label:'Kode Barang', mono:true, width:170 },
      { key:'Qty', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Deskripsi', label:'Deskripsi', width:260 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:110, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_PRODUK, codeKey:'Kode_Item', nameKey:'Nama_Item', satuanKey:'Satuan' }, lockItems:true },
  ];
}
