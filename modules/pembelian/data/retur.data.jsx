// Pembelian — data & config Retur Beli
//
// Retur Beli adalah dokumen final (tidak ada realisasi lanjutan seperti nota/PO) —
// status hanya Selesai / Batal, sama seperti pola awal GR.

function returItem(kode, jumlah, harga, disc1, discRp, deskripsi='') {
  const produk = PB_PRODUK.find(p => p.kode === kode);
  return {
    Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:deskripsi,
    Jumlah:jumlah, Satuan: produk ? produk.satuan : 'PCS', Hrg_Sat:harga,
    DiscPros_Det:disc1, DiscNilai_Det:discRp, Kode_Konversi:1, Konversi:1,
  };
}

function returBiayaItem(kodeAkun, jumlah, satuan, harga, disc1, discRp, deskripsi='') {
  const akun = PB_AKUN.find(a => a.kode === kodeAkun);
  return { Kode_Item:kodeAkun, Nama_Item: akun ? akun.nama : '', Deskripsi:deskripsi, Jumlah:jumlah, Satuan:satuan, Hrg_Sat:harga, DiscPros_Det:disc1, DiscNilai_Det:discRp };
}

function returHead(no, tgl, kodeSupp, kodeGudang, noBuktiFrom, kreditTunai, akunTunai, tempo, ket, details, details2, opts={}) {
  const supp = PB_SUPPLIER.find(s => s.Kode_Supp === kodeSupp);
  const akun = PB_AKUN.find(a => a.kode === akunTunai);
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Bukti_From:noBuktiFrom, Kode_Supp:kodeSupp, Nama_Supp: supp ? supp.Nama_Supp : kodeSupp,
    Kode_Gudang:kodeGudang, Nama_Gudang: pbGudangNama(kodeGudang),
    No_Pajak: opts.noPajak || '', Tgl_Pajak: opts.tglPajak || null,
    PPN:11, PPN_Include:false, DiscPros_Head: opts.disc ?? 0, DiscNilai_Head: opts.discRp ?? 0,
    Kredit_Tunai:kreditTunai, Akun_Tunai:akunTunai, Nama_Akun_Tunai: akun ? akun.nama : '', Tempo:tempo,
    Keterangan:ket, Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '',
    Details:details, Details2:details2,
  };
}

const PB_RETUR_BELI = [
  returHead('RB26070001', '2026-07-10', 'MRR001', 'GDG-001', 'BL26070001', 'KREDIT', '100.001', 14, 'Barang cacat produksi', [
    returItem('AA0450914100550', 10, 275000, 0, 0),
    returItem('BB040091470550', 5, 260000, 0, 0),
    returItem('CC0350914080550', 8, 245000, 0, 0),
  ], [
    returBiayaItem('200.002', 1, 'PCS', 50000, 0, 0, 'Biaya angkut retur'),
  ]),
  returHead('RB26070002', '2026-07-11', 'AG001', 'GDG-001', 'BL26070002', 'TUNAI', '100.001', 0, 'Retur sebagian, ukuran tidak sesuai', [
    returItem('BB040091470550', 6, 260000, 0, 0),
    returItem('CC0350914080550', 4, 245000, 0, 0),
    returItem('DD0500914120600', 3, 310000, 0, 0),
    returItem('EE0300762060500', 5, 185000, 0, 0),
  ], []),
  returHead('RB26070003', '2026-07-12', 'P003', 'GDG-002', 'BL26070004', 'KREDIT', '100.003', 30, 'Dibatalkan, salah input retur', [
    returItem('CC0350914080550', 7, 245000, 0, 0),
    returItem('DD0500914120600', 5, 310000, 0, 0),
    returItem('EE0300762060500', 9, 185000, 0, 0),
  ], [], { batal:true, alasanBatal:'Salah input, retur dibuat ulang' }),
  returHead('RB26070004', '2026-07-13', 'MRR001', 'GDG-004', 'BL26070004', 'KREDIT', '100.001', 14, 'Retur proyek gudang blok A, barang penyok', [
    returItem('AA0450914100550', 12, 275000, 0, 0),
    returItem('BB040091470550', 8, 260000, 0, 0),
    returItem('CC0350914080550', 6, 245000, 0, 0),
    returItem('DD0500914120600', 4, 310000, 0, 0),
    returItem('EE0300762060500', 3, 185000, 0, 0),
  ], [
    returBiayaItem('200.002', 1, 'PCS', 75000, 0, 0, 'Bongkar muat retur'),
  ]),
  returHead('RB26070005', '2026-07-14', 'AG001', 'GDG-001', 'BL26070005', 'TUNAI', '100.001', 0, 'Retur stok gudang Agustus, kelebihan kirim', [
    returItem('AA0450914100550', 15, 275000, 0, 0),
    returItem('BB040091470550', 10, 260000, 0, 0),
    returItem('CC0350914080550', 7, 245000, 0, 0),
    returItem('DD0500914120600', 5, 310000, 0, 0),
    returItem('EE0300762060500', 4, 185000, 0, 0),
    returItem('FF0400914090550', 6, 265000, 0, 0),
  ], []),
  returHead('RB26070006', '2026-07-15', 'P003', 'GDG-002', 'BL26070006', 'KREDIT', '100.001', 30, 'Retur genteng, cacat produksi', [
    returItem('GG0250610050450', 30, 75000, 0, 0),
    returItem('AA0450914100550', 8, 275000, 0, 0),
    returItem('BB040091470550', 6, 260000, 0, 0),
    returItem('CC0350914080550', 4, 245000, 0, 0),
  ], [
    returBiayaItem('200.001', 1, 'PCS', 40000, 0, 0, 'Ongkir retur ke supplier'),
  ]),
  returHead('RB26070007', '2026-07-16', 'MRR001', 'GDG-001', 'BL26070007', 'KREDIT', '100.001', 14, 'Retur bahan baku minggu 2, salah spesifikasi', [
    returItem('AA0450914100550', 12, 275000, 0, 0),
    returItem('BB040091470550', 8, 260000, 0, 0),
    returItem('CC0350914080550', 5, 245000, 0, 0),
    returItem('DD0500914120600', 3, 310000, 0, 0),
    returItem('EE0300762060500', 2, 185000, 0, 0),
    returItem('FF0400914090550', 6, 265000, 0, 0),
    returItem('GG0250610050450', 15, 75000, 0, 0),
  ], []),
  returHead('RB26070008', '2026-07-17', 'AG001', 'GDG-002', 'BL26070003', 'KREDIT', '100.003', 30, 'Dibatalkan, nota terkait sudah batal', [
    returItem('CC0350914080550', 6, 245000, 0, 0),
    returItem('DD0500914120600', 4, 310000, 0, 0),
    returItem('EE0300762060500', 5, 185000, 0, 0),
  ], [], { batal:true, alasanBatal:'Nota Pembelian terkait sudah dibatalkan' }),
  returHead('RB26070009', '2026-07-18', 'P003', 'GDG-002', 'BL26070009', 'KREDIT', '100.001', 30, 'Retur bahan baku minggu 3, kualitas kurang baik', [
    returItem('AA0450914100550', 10, 275000, 0, 0),
    returItem('BB040091470550', 6, 260000, 0, 0),
    returItem('CC0350914080550', 4, 245000, 0, 0),
    returItem('DD0500914120600', 3, 310000, 0, 0),
    returItem('EE0300762060500', 2, 185000, 0, 0),
  ], [
    returBiayaItem('200.002', 1, 'PCS', 60000, 0, 0, 'Bongkar muat retur minggu 3'),
  ]),
  returHead('RB26070010', '2026-07-19', 'MRR001', 'GDG-001', 'BL26070010', 'KREDIT', '100.001', 14, 'Retur stok besar gudang utama, sisa proyek', [
    returItem('AA0450914100550', 15, 275000, 0, 0),
    returItem('BB040091470550', 12, 260000, 0, 0),
    returItem('CC0350914080550', 9, 245000, 0, 0),
    returItem('DD0500914120600', 7, 310000, 0, 0),
    returItem('EE0300762060500', 5, 185000, 0, 0),
    returItem('FF0400914090550', 8, 265000, 0, 0),
    returItem('GG0250610050450', 20, 75000, 0, 0),
  ], [
    returBiayaItem('200.001', 1, 'PCS', 100000, 0, 0, 'Ongkir retur gudang utama'),
  ]),
];

function returComputeStatus(row) {
  if (row.Batal) return 'BATAL';
  return 'SELESAI';
}

function returStatusPill(row) {
  const s = returComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  return <span className="pill approved">Selesai</span>;
}

function returBeliModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'No_Bukti_From', label:'Ref. Nota Pembelian', mono:true, required:true, lockOnEdit:true },
      { key:'Nama_Supp', label:'Nama Supplier', type:'select', span:2,
        options: () => PB_SUPPLIER.map(s => ({ value:s.Nama_Supp, label:s.Nama_Supp })),
        onChange: (val, set) => { const s = PB_SUPPLIER.find(x => x.Nama_Supp === val); set('Kode_Supp', s ? s.Kode_Supp : ''); } },
      { key:'Kode_Supp', label:'Kode Supplier', mono:true, readOnly:true, span:1 },
      { key:'Kode_Gudang', label:'Gudang', type:'select', options:PB_GUDANG_OPTS },
      { key:'Akun_Tunai', label:'Akun Bayar', type:'select', options:()=>PB_AKUN.map(a=>({value:a.kode,label:a.nama})), lockOnEdit:true },
      { key:'Kredit_Tunai', label:'Kredit/Tunai', type:'select', options:[{value:'TUNAI',label:'Tunai'},{value:'KREDIT',label:'Kredit'}], lockOnEdit:true },
      { key:'Tempo', label:'Tempo (hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', showTotal:true, columns:[
      { key:'Kode_Item', label:'Kode Item', mono:true, width:190 },
      { key:'Nama_Item', label:'Nama Item', width:380 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:130 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:90 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:120 },
      { key:'Total', label:'Total', compute: (r) => fmtRp(pbLineTotal(r)), width:160 },
    ], itemSource:{ data:PB_PRODUK, codeKey:'Kode_Item', nameKey:'Nama_Item', satuanKey:'Satuan', hargaKey:'Hrg_Sat' }, lockItems:true },
    { id:'biaya', label:'Non-Produk atau Biaya', type:'items', itemsKey:'Details2', showTotal:true, columns:[
      { key:'Kode_Item', label:'Kode Akun', mono:true, width:130 },
      { key:'Nama_Item', label:'Nama Akun', width:220 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:130 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:90 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:120 },
      { key:'Total', label:'Total', compute: (r) => fmtRp(pbLineTotal(r)), width:160 },
    ], itemSource:{ data:PB_AKUN, codeKey:'Kode_Item', nameKey:'Nama_Item' }, lockItems:true },
  ];
}
