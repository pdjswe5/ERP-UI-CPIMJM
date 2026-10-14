// Pembelian — data & config Nota Pembelian (Beli)
//
// Status memakai model yang sama seperti PR/RFQ/Quotation/PO/GR: dihitung otomatis dari
// realisasi barang (mis. retur sebagian terhadap nota ini), kecuali "Selesai Manual".
// 5 kemungkinan: Belum Realisasi / Selesai Sebagian / Selesai / Selesai Manual / Batal.

function beliItem(kode, jumlah, harga, disc1, discRp, realisasi=0, noBuktiFrom='', deskripsi='') {
  const produk = PB_PRODUK.find(p => p.kode === kode);
  return {
    Kode_Item:kode, Nama_Item:pbProdukNama(kode), Deskripsi:deskripsi,
    Jumlah:jumlah, Satuan: produk ? produk.satuan : 'PCS', Hrg_Sat:harga,
    DiscPros_Det:disc1, DiscNilai_Det:discRp, Qty_Realisasi:realisasi,
    Kode_Konversi:1, Konversi:1, No_Bukti_From:noBuktiFrom, No_Id_From: noBuktiFrom ? 1 : 0, Jenis_Dok_From: noBuktiFrom ? 'GR' : '',
  };
}

function beliBiayaItem(kodeAkun, jumlah, satuan, harga, disc1, discRp, realisasi=0, deskripsi='') {
  const akun = PB_AKUN.find(a => a.kode === kodeAkun);
  return { Kode_Item:kodeAkun, Nama_Item: akun ? akun.nama : '', Deskripsi:deskripsi, Jumlah:jumlah, Satuan:satuan, Hrg_Sat:harga, DiscPros_Det:disc1, DiscNilai_Det:discRp, Qty_Realisasi:realisasi };
}

function beliHead(no, tgl, kodeSupp, kodeGudang, noBuktiFrom, kreditTunai, akunTunai, tempo, ket, details, details2, opts={}) {
  const supp = PB_SUPPLIER.find(s => s.Kode_Supp === kodeSupp);
  const akun = PB_AKUN.find(a => a.kode === akunTunai);
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Bukti_From:noBuktiFrom, Kode_Supp:kodeSupp, Nama_Supp: supp ? supp.Nama_Supp : kodeSupp,
    Kode_Gudang:kodeGudang, Nama_Gudang: pbGudangNama(kodeGudang),
    No_Sj_Inv: opts.noSjInv || '', Tgl_Sj_Inv: opts.tglSjInv || tgl, No_Pajak: opts.noPajak || '', Tgl_Pajak: opts.tglPajak || null,
    PPN:11, PPN_Include:false, DiscPros_Head: opts.disc ?? 0, DiscNilai_Head: opts.discRp ?? 0,
    Nilai_Bayar: opts.nilaiBayar ?? 0, Sisa_Nota: opts.sisaNota ?? 0,
    Kredit_Tunai:kreditTunai, Akun_Tunai:akunTunai, Nama_Akun_Tunai: akun ? akun.nama : '', Tempo:tempo,
    Keterangan:ket, Status: opts.status || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '', Alasan_Status: opts.alasanStatus || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:24:44`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:20:00`,
    Details:details, Details2:details2,
  };
}

const PB_BELI = [
  beliHead('BL26070001', '2026-07-09', 'MRR001', 'GDG-001', 'FTB26070001', 'KREDIT', '100.001', 14, 'Nota dari GR bahan baku Juli', [
    beliItem('AA0450914100550', 100, 275000, 10, 10000, 0, 'FTB26070001'),
    beliItem('AA0450914100550', 100, 275000, 10, 10000, 0, 'FTB26070001'),
    beliItem('BB040091470550', 60, 260000, 0, 0, 0, 'FTB26070001'),
    beliItem('CC0350914080550', 45, 245000, 0, 0, 0, 'FTB26070001'),
    beliItem('DD0500914120600', 30, 310000, 0, 0, 0, 'FTB26070001'),
  ], [
    beliBiayaItem('200.001', 1, 'PCS', 350000, 0, 0, 0, 'Ongkir Surabaya-gudang'),
  ], { creator:'Bubud', editor:'' }),
  beliHead('BL26070002', '2026-07-10', 'AG001', 'GDG-001', 'FTB26070002', 'TUNAI', '100.001', 0, 'Nota dari GR material minggu 1', [
    beliItem('BB040091470550', 50, 260000, 0, 10000, 50, 'FTB26070002'),
    beliItem('CC0350914080550', 40, 245000, 0, 0, 20, 'FTB26070002'),
    beliItem('DD0500914120600', 30, 310000, 0, 0, 0, 'FTB26070002'),
    beliItem('EE0300762060500', 25, 185000, 0, 0, 25, 'FTB26070002'),
    beliItem('FF0400914090550', 35, 265000, 0, 0, 0, 'FTB26070002'),
    beliItem('GG0250610050450', 20, 75000, 0, 0, 0, 'FTB26070002'),
  ], [
    beliBiayaItem('200.002', 1, 'PCS', 150000, 0, 0, 0, 'Bongkar muat gudang'),
  ]),
  beliHead('BL26070003', '2026-07-11', 'P003', 'GDG-002', 'FTB26070004', 'KREDIT', '100.003', 30, 'Dibatalkan, salah tagih supplier', [
    beliItem('CC0350914080550', 45, 245000, 0, 0, 0, 'FTB26070004'),
    beliItem('DD0500914120600', 30, 310000, 0, 0, 0, 'FTB26070004'),
    beliItem('EE0300762060500', 55, 185000, 0, 0, 0, 'FTB26070004'),
    beliItem('FF0400914090550', 20, 265000, 0, 0, 0, 'FTB26070004'),
    beliItem('GG0250610050450', 35, 75000, 0, 0, 0, 'FTB26070004'),
  ], [], { batal:true, alasanBatal:'Salah tagih, nota diganti supplier' }),
  beliHead('BL26070004', '2026-07-12', 'MRR001', 'GDG-004', 'FTB26070004', 'KREDIT', '100.001', 14, 'Nota dari GR proyek gudang blok A', [
    beliItem('AA0450914100550', 200, 275000, 5, 0, 200, 'FTB26070004'),
    beliItem('BB040091470550', 90, 260000, 0, 0, 90, 'FTB26070004'),
    beliItem('CC0350914080550', 70, 245000, 0, 0, 70, 'FTB26070004'),
    beliItem('DD0500914120600', 55, 310000, 0, 0, 55, 'FTB26070004'),
    beliItem('EE0300762060500', 40, 185000, 0, 0, 40, 'FTB26070004'),
    beliItem('FF0400914090550', 65, 265000, 0, 0, 65, 'FTB26070004'),
    beliItem('GG0250610050450', 200, 75000, 0, 0, 200, 'FTB26070004'),
  ], [
    beliBiayaItem('200.001', 1, 'PCS', 500000, 0, 0, 1, 'Ongkir proyek blok A'),
  ]),
  beliHead('BL26070005', '2026-07-13', 'AG001', 'GDG-001', 'FTB26070005', 'TUNAI', '100.001', 0, 'Nota dari GR stok gudang Agustus', [
    beliItem('AA0450914100550', 150, 275000, 0, 0, 0, 'FTB26070005'),
    beliItem('BB040091470550', 90, 260000, 0, 0, 0, 'FTB26070005'),
    beliItem('CC0350914080550', 70, 245000, 0, 0, 0, 'FTB26070005'),
    beliItem('DD0500914120600', 55, 310000, 0, 0, 0, 'FTB26070005'),
    beliItem('EE0300762060500', 40, 185000, 0, 0, 0, 'FTB26070005'),
    beliItem('FF0400914090550', 65, 265000, 0, 0, 0, 'FTB26070005'),
    beliItem('GG0250610050450', 200, 75000, 0, 0, 0, 'FTB26070005'),
    beliItem('BB040091470550', 25, 260000, 0, 0, 0, 'FTB26070005', 'Batch khusus'),
  ], []),
  beliHead('BL26070006', '2026-07-14', 'P003', 'GDG-002', 'FTB26070006', 'KREDIT', '100.001', 30, 'Nota ditutup manual, retur menyusul terpisah', [
    beliItem('GG0250610050450', 500, 75000, 0, 0, 0, 'FTB26070006'),
    beliItem('AA0450914100550', 80, 275000, 0, 0, 0, 'FTB26070006'),
    beliItem('BB040091470550', 65, 260000, 0, 0, 0, 'FTB26070006'),
    beliItem('CC0350914080550', 45, 245000, 0, 0, 0, 'FTB26070006'),
    beliItem('DD0500914120600', 30, 310000, 0, 0, 0, 'FTB26070006'),
    beliItem('EE0300762060500', 20, 185000, 0, 0, 0, 'FTB26070006'),
  ], [], { status:'SELESAI', alasanStatus:'Ditutup manual, retur dicatat terpisah oleh operator' }),
  beliHead('BL26070007', '2026-07-15', 'MRR001', 'GDG-001', 'FTB26070007', 'KREDIT', '100.001', 14, 'Nota dari GR bahan baku minggu 2', [
    beliItem('AA0450914100550', 120, 275000, 0, 0, 120, 'FTB26070007'),
    beliItem('BB040091470550', 80, 260000, 0, 0, 40, 'FTB26070007', 'Realisasi tahap 1'),
    beliItem('CC0350914080550', 50, 245000, 0, 0, 0, 'FTB26070007'),
    beliItem('DD0500914120600', 35, 310000, 0, 0, 35, 'FTB26070007'),
    beliItem('EE0300762060500', 20, 185000, 0, 0, 10, 'FTB26070007', 'Realisasi tahap 1'),
    beliItem('FF0400914090550', 60, 265000, 0, 0, 0, 'FTB26070007'),
    beliItem('GG0250610050450', 150, 75000, 0, 0, 75, 'FTB26070007', 'Realisasi tahap 1'),
    beliItem('AA0450914100550', 40, 275000, 0, 0, 0, 'FTB26070007', 'Batch 2'),
    beliItem('BB040091470550', 30, 260000, 0, 0, 30, 'FTB26070007', 'Batch 2'),
  ], [
    beliBiayaItem('200.002', 1, 'PCS', 200000, 0, 0, 1, 'Bongkar muat batch 2'),
  ]),
  beliHead('BL26070008', '2026-07-16', 'AG001', 'GDG-002', 'FTB26070003', 'KREDIT', '100.003', 30, 'Dibatalkan, barang GR ditolak', [
    beliItem('CC0350914080550', 45, 245000, 0, 0, 0, 'FTB26070003'),
    beliItem('DD0500914120600', 30, 310000, 0, 0, 0, 'FTB26070003'),
    beliItem('EE0300762060500', 55, 185000, 0, 0, 0, 'FTB26070003'),
    beliItem('FF0400914090550', 20, 265000, 0, 0, 0, 'FTB26070003'),
    beliItem('GG0250610050450', 35, 75000, 0, 0, 0, 'FTB26070003'),
  ], [], { batal:true, alasanBatal:'Terkait GR yang ditolak, nota dibatalkan' }),
  beliHead('BL26070009', '2026-07-17', 'P003', 'GDG-002', 'FTB26070009', 'KREDIT', '100.001', 30, 'Nota dari GR bahan baku minggu 3', [
    beliItem('AA0450914100550', 100, 275000, 0, 0, 50, 'FTB26070009', 'Realisasi tahap 1'),
    beliItem('BB040091470550', 60, 260000, 0, 0, 60, 'FTB26070009'),
    beliItem('CC0350914080550', 45, 245000, 0, 0, 0, 'FTB26070009'),
    beliItem('DD0500914120600', 35, 310000, 0, 0, 35, 'FTB26070009'),
    beliItem('EE0300762060500', 25, 185000, 0, 0, 10, 'FTB26070009', 'Realisasi tahap 1'),
    beliItem('FF0400914090550', 50, 265000, 0, 0, 0, 'FTB26070009'),
    beliItem('GG0250610050450', 150, 75000, 0, 0, 75, 'FTB26070009', 'Realisasi tahap 1'),
  ], [
    beliBiayaItem('200.002', 1, 'PCS', 300000, 0, 0, 0, 'Bongkar muat minggu 3'),
  ]),
  beliHead('BL26070010', '2026-07-18', 'MRR001', 'GDG-001', 'FTB26070010', 'KREDIT', '100.001', 14, 'Nota dari GR stok besar gudang utama', [
    beliItem('AA0450914100550', 100, 275000, 0, 0, 100, 'FTB26070010'),
    beliItem('BB040091470550', 90, 260000, 0, 0, 90, 'FTB26070010'),
    beliItem('CC0350914080550', 70, 245000, 0, 0, 70, 'FTB26070010'),
    beliItem('DD0500914120600', 55, 310000, 0, 0, 55, 'FTB26070010'),
    beliItem('EE0300762060500', 40, 185000, 0, 0, 40, 'FTB26070010'),
    beliItem('FF0400914090550', 65, 265000, 0, 0, 65, 'FTB26070010'),
    beliItem('GG0250610050450', 200, 75000, 0, 0, 200, 'FTB26070010'),
    beliItem('AA0450914100550', 50, 275000, 0, 0, 50, 'FTB26070010', 'Batch B'),
    beliItem('BB040091470550', 45, 260000, 0, 0, 45, 'FTB26070010', 'Batch B'),
    beliItem('CC0350914080550', 35, 245000, 0, 0, 35, 'FTB26070010', 'Batch B'),
  ], [
    beliBiayaItem('200.001', 1, 'PCS', 750000, 0, 0, 1, 'Ongkir gudang utama'),
  ]),
];

function beliComputeStatus(row) {
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

function beliStatusPill(row) {
  const s = beliComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function beliModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'No_Bukti_From', label:'Ref. GR', mono:true, lockOnEdit:true },
      { key:'Nama_Supp', label:'Nama Supplier', type:'select', required:true, span:2,
        options: () => PB_SUPPLIER.map(s => ({ value:s.Nama_Supp, label:s.Nama_Supp })),
        onChange: (val, set) => { const s = PB_SUPPLIER.find(x => x.Nama_Supp === val); set('Kode_Supp', s ? s.Kode_Supp : ''); } },
      { key:'Kode_Supp', label:'Kode Supplier', mono:true, readOnly:true, span:1 },
      { key:'Kode_Gudang', label:'Gudang', type:'select', options:PB_GUDANG_OPTS },
      { key:'No_Sj_Inv', label:'No. SJ/Invoice', mono:true },
      { key:'Tgl_Sj_Inv', label:'Tgl. SJ/Invoice', type:'date' },
      { key:'No_Pajak', label:'No. Pajak', mono:true },
      { key:'Tgl_Pajak', label:'Tgl. Pajak', type:'date' },
      { key:'Akun_Tunai', label:'Akun Bayar', type:'select', options:()=>PB_AKUN.map(a=>({value:a.kode,label:a.nama})), lockOnEdit:true },
      { key:'Kredit_Tunai', label:'Kredit/Tunai', type:'select', options:[{value:'TUNAI',label:'Tunai'},{value:'KREDIT',label:'Kredit'}], lockOnEdit:true },
      { key:'Tempo', label:'Tempo (hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'Nilai_Bayar', label:'Nilai Bayar', type:'number' },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', showTotal:true, columns:[
      { key:'No_Bukti_From', label:'Ref. Dok', mono:true, width:130, lockIfFilled:true },
      { key:'Kode_Item', label:'Kode Item', mono:true, width:190 },
      { key:'Nama_Item', label:'Nama Item', width:380 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:130 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:90 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:120 },
      { key:'Total', label:'Total', compute: (r) => fmtRp(pbLineTotal(r)), width:160 },
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:100, readOnly:true, hideOnCreate:true },
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
      { key:'Qty_Realisasi', label:'Realisasi', type:'number', num:true, width:100, readOnly:true, hideOnCreate:true },
    ], itemSource:{ data:PB_AKUN, codeKey:'Kode_Item', nameKey:'Nama_Item' }, lockItems:true },
  ];
}
