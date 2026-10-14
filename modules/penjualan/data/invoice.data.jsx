// Penjualan — data & config Invoice / Nota Penjualan
//
// Status Invoice dihitung otomatis dari realisasi barang (sama pola KO/SO/DO), kecuali "Selesai
// Manual". Invoice bisa diisi manual ATAU diambil dari 1 Sales Order (tombol "Buat Nota dari SO" di
// tab Informasi Umum, sama mekanismenya dengan "Buat SO dari KO").

function invItem(kode, jumlah, discPct, discRp, realisasi=0, deskripsi='') {
  const produk = BARANG.find(b => b.code === kode);
  return {
    Kode_Item:kode, Nama_Item: produk ? produk.name : '', Deskripsi:deskripsi,
    Jumlah:jumlah, Realisasi:realisasi, Konversi:1, Satuan:'PCS',
    Hrg_Sat: produk ? (produk.hpp || produk.hargaBeli || 0) : 0,
    DiscPros_Det:discPct, DiscNilai_Det:discRp,
  };
}

function invBiayaItem(kode, nama, jumlah, harga, deskripsi='') {
  return { Kode_Item:kode, Nama_Item:nama, Deskripsi:deskripsi, Jumlah:jumlah, Realisasi:0, Satuan:'PCS', Hrg_Sat:harga, DiscPros_Det:0, DiscNilai_Det:0 };
}

function invHead(no, tgl, custCode, kreditTunai, tempo, ket, details, details2, opts={}) {
  const cust = PJ_PELANGGAN.find(p => p.code === custCode);
  const akun = opts.akunTunai ? PJ_KASBANK.find(k => k.kode === opts.akunTunai) : null;
  const gudang = opts.gudang ? PJ_GUDANG_LIST.find(g => g.kode === opts.gudang) : PJ_GUDANG_LIST[0];
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Bukti_From: opts.noBuktiFrom || '',
    Kode_Cust:custCode, Nama_Cust: cust ? cust.name : custCode,
    Kode_Sales: cust ? cust.kodeSales || '' : '', Nama_Sales: cust ? cust.namaSales || '' : '',
    Kode_Gudang: gudang ? gudang.kode : '', Nama_Gudang: gudang ? gudang.nama : '',
    Kredit_Tunai:kreditTunai, Akun_Tunai: kreditTunai === 'TUNAI' ? (akun ? akun.kode : '') : '', Nama_Akun_Tunai: kreditTunai === 'TUNAI' ? (akun ? akun.nama : '') : '',
    Tempo:tempo, Tgl_Kirim: opts.tglKirim || tgl, Alamat_Kirim: opts.alamatKirim || (cust ? cust.alamat : ''),
    Keterangan:ket, PPN:11, DiscPros_Head: opts.disc ?? 0, DiscNilai_Head: opts.discRp ?? 0,
    Status: opts.status || '', Alasan_Status: opts.alasanStatus || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:30:00`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:15:00`,
    Details:details, Details2: details2 || [],
  };
}

const INVOICE_SEED = [
  invHead('FJL26070001', '2026-07-10', 'b7364', 'KREDIT', 14, 'Tagihan sesuai SO rutin', [
    invItem('P-EF1001', 20, 0, 0, 0),
    invItem('P-AF4022', 15, 0, 0, 0),
    invItem('P-OL7022', 30, 0, 0, 0),
  ], [], { noBuktiFrom:'KSO26070001', gudang:'GDG-001', creator:'Ucup', editor:'' }),
  invHead('KJL26070002', '2026-07-11', 'C001', 'TUNAI', 0, 'Nota tunai di tempat', [
    invItem('P-BK2104', 8, 5, 0, 8),
    invItem('P-BK2105', 4, 0, 0, 4),
  ], [
    invBiayaItem('100.101', 'Biaya Pengiriman', 1, 250000),
  ], { gudang:'GDG-002', akunTunai:'1005.001' }),
  invHead('FJL26070003', '2026-07-12', 'C012', 'KREDIT', 30, 'Dibatalkan, salah tagih customer', [
    invItem('P-SP3201', 10, 0, 0, 0),
    invItem('P-AF4022', 6, 0, 0, 0),
  ], [], { gudang:'GDG-001', batal:true, alasanStatus:'Salah tagih, nota dibatalkan' }),
  invHead('KJL26070004', '2026-07-13', 'g123', 'KREDIT', 21, 'Tagihan proyek renovasi armada', [
    invItem('P-BK2104', 20, 5, 0, 20),
    invItem('P-BK2105', 12, 0, 0, 12),
    invItem('P-SP3201', 16, 0, 0, 16),
  ], [
    invBiayaItem('100.102', 'Biaya Instalasi / Pemasangan', 1, 500000),
  ], { noBuktiFrom:'KSO26070004', gudang:'GDG-003' }),
  invHead('FJL26070005', '2026-07-14', 'H01', 'TUNAI', 0, 'Nota stok toko cabang', [
    invItem('P-TY8801', 10, 0, 0, 0),
    invItem('P-LT9210', 4, 0, 0, 0),
  ], [], { gudang:'GDG-004', akunTunai:'1005.000' }),
  invHead('KJL26070006', '2026-07-15', 'KV001', 'KREDIT', 14, 'Nota ditutup manual, sisa dibatalkan customer', [
    invItem('P-EF1001', 15, 0, 0, 15),
    invItem('P-AF4022', 10, 0, 0, 10),
  ], [], { noBuktiFrom:'KSO26070006', gudang:'GDG-001', status:'SELESAI', alasanStatus:'Sisa tagihan dibatalkan customer, ditutup manual oleh operator' }),
  invHead('FJL26070007', '2026-07-16', 'L001', 'KREDIT', 30, 'Tagihan bertahap sesuai pengiriman', [
    invItem('P-BK2104', 14, 5, 0, 14),
    invItem('P-BK2105', 8, 0, 0, 4),
    invItem('P-SP3201', 12, 0, 0, 0),
  ], [
    invBiayaItem('100.103', 'Biaya Packing', 1, 175000),
  ], { noBuktiFrom:'KSO26070007', gudang:'GDG-003' }),
  invHead('KJL26070008', '2026-07-17', 'L002', 'TUNAI', 0, 'Nota aksesoris lengkap', [
    invItem('P-BT3300', 15, 0, 0, 15),
    invItem('P-CO4411', 30, 0, 0, 30),
  ], [], { gudang:'GDG-002', akunTunai:'1005.003' }),
];

function invoiceComputeStatus(row) {
  if (row.Batal || row.Status === 'BATAL') return 'BATAL';
  if (row.Status === 'SELESAI') return 'SELESAI_MANUAL';
  const details = row.Details || [];
  if (details.length === 0) return 'BELUM_REALISASI';
  const realizedCount = details.filter(d => (+d.Realisasi || 0) > 0).length;
  const fullyRealizedCount = details.filter(d => (+d.Jumlah || 0) > 0 && (+d.Realisasi || 0) >= (+d.Jumlah || 0)).length;
  if (fullyRealizedCount === details.length) return 'SELESAI';
  if (realizedCount > 0) return 'SELESAI_SEBAGIAN';
  return 'BELUM_REALISASI';
}

function invoiceStatusPill(row) {
  const s = invoiceComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

// "Buat Nota dari SO" — ambil data dari 1 Sales Order (customer, sales, pembayaran, alamat, barang)
// ke form Invoice yang sedang dibuat. Sama mekanismenya dengan "Buat SO dari KO".
function invoiceApplySoData(set, so) {
  set('No_Bukti_From', so.No_Bukti);
  set('Kode_Cust', so.Kode_Cust || ''); set('Nama_Cust', so.Nama_Cust || '');
  set('Kode_Sales', so.Kode_Sales || ''); set('Nama_Sales', so.Nama_Sales || '');
  set('Kredit_Tunai', so.Kredit_Tunai || '');
  set('Tempo', so.Tempo || 0);
  set('Tgl_Kirim', so.Tgl_Kirim || '');
  set('Alamat_Kirim', so.Alamat_Kirim || '');
  set('Details', (so.Details || []).map(b => ({
    Kode_Item:b.Kode_Item, Nama_Item:b.Nama_Item, Deskripsi:b.Deskripsi || '', Jumlah:b.Jumlah || 0, Realisasi:0,
    Konversi:1, Satuan:b.Satuan || 'PCS', Hrg_Sat:b.Hrg_Sat || 0, DiscPros_Det:b.DiscPros_Det || 0, DiscNilai_Det:b.DiscNilai_Det || 0,
  })));
  set('Details2', (so.Details2 || []).map(b => ({
    Kode_Item:b.Kode_Item || '', Nama_Item:b.Nama_Item || '', Deskripsi:b.Deskripsi || '', Jumlah:b.Jumlah || 0, Realisasi:0,
    Satuan:b.Satuan || '', Hrg_Sat:b.Hrg_Sat || 0, DiscPros_Det:b.DiscPros_Det || 0, DiscNilai_Det:b.DiscNilai_Det || 0,
  })));
}

function invoiceClearSoData(set) {
  set('No_Bukti_From', ''); set('Kode_Cust', ''); set('Nama_Cust', ''); set('Kode_Sales', ''); set('Nama_Sales', '');
  set('Kredit_Tunai', ''); set('Tempo', 0); set('Tgl_Kirim', ''); set('Alamat_Kirim', '');
  set('Details', []); set('Details2', []);
}

// Picker dokumen Sales Order (pilih satu) — dipakai tombol "Buat Nota dari SO"/"Ganti Data SO".
function SoDocPickerModal({ list, onCancel, onConfirm }) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    if (!q) return list;
    const ql = q.toLowerCase();
    return list.filter(s => s.No_Bukti.toLowerCase().includes(ql) || (s.Nama_Cust || '').toLowerCase().includes(ql));
  }, [list, q]);
  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Pilih Sales Order</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari no. bukti atau customer…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:320, overflowY:'auto'}}>
            <table>
              <thead><tr><th>No. Bukti</th><th>Customer</th><th>Tgl. Bukti</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={4} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(s => (
                  <tr key={s.No_Bukti} style={{cursor:'pointer'}} onClick={()=>onConfirm(s)}>
                    <td className="mono">{s.No_Bukti}</td>
                    <td>{s.Nama_Cust}</td>
                    <td>{s.Tgl_Bukti}</td>
                    <td>{soStatusPill(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>Klik salah satu baris untuk memilih.</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onCancel}>Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function invoiceSoBannerFactory(salesOrderList) {
  return function InvoiceSoBanner({ form, set, isCreate }) {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    if (!isCreate) return null;
    const hasSo = !!form.No_Bukti_From;
    return (
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <div className="muted" style={{fontSize:12.5}}>
          {hasSo ? `Data diambil dari Sales Order: ${form.No_Bukti_From}` : 'Isi manual, atau ambil data dari Sales Order yang sudah ada.'}
        </div>
        <div style={{display:'flex', gap:8}}>
          {hasSo && <button type="button" className="btn btn-sm" onClick={()=>invoiceClearSoData(set)}>{I.x(14)} Clear Data SO</button>}
          <button type="button" className="btn btn-primary btn-sm" onClick={()=>setPickerOpen(true)}>{I.plus()} {hasSo ? 'Ganti Data SO' : 'Buat Nota dari SO'}</button>
        </div>
        {pickerOpen && (
          <SoDocPickerModal
            list={salesOrderList}
            onCancel={()=>setPickerOpen(false)}
            onConfirm={(so)=>{ invoiceApplySoData(set, so); setPickerOpen(false); }}
          />
        )}
      </div>
    );
  };
}

function invoiceGudangOpts() { return PJ_GUDANG_LIST.map(g => ({ value:g.nama, label:g.nama })); }
function invoiceAkunTunaiOpts() { return PJ_KASBANK.map(k => ({ value:k.nama, label:k.nama })); }

function invoiceTabs(salesOrderList) {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', TopComponent: invoiceSoBannerFactory(salesOrderList), fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'No_Bukti_From', label:'Ref. Sales Order', mono:true, lockOnEdit:true,
        type:'select', options: () => salesOrderList.map(s => ({ value:s.No_Bukti, label:s.No_Bukti })) },
      { key:'Nama_Cust', label:'Nama Customer', type:'select', required:true, span:2,
        options: () => PJ_PELANGGAN.map(p => ({ value:p.name, label:p.name })),
        onChange: (val, set) => {
          const p = PJ_PELANGGAN.find(x => x.name === val);
          set('Kode_Cust', p ? p.code : '');
          set('Kode_Sales', p ? p.kodeSales || '' : '');
          set('Nama_Sales', p ? p.namaSales || '' : '');
        } },
      { key:'Kode_Cust', label:'Kode Customer', mono:true, readOnly:true, span:1 },
      { key:'Nama_Sales', label:'Nama Sales', mono:true, readOnly:true, span:2 },
      { key:'Kode_Sales', label:'Kode Sales', mono:true, readOnly:true, span:1 },
      { key:'Nama_Gudang', label:'Gudang', type:'select', span:2, options:invoiceGudangOpts, lockOnEdit:true,
        onChange: (val, set) => { const g = PJ_GUDANG_LIST.find(x => x.nama === val); set('Kode_Gudang', g ? g.kode : ''); } },
      { key:'Kode_Gudang', label:'Kode Gudang', mono:true, readOnly:true, span:1 },
      { key:'Kredit_Tunai', label:'Kredit/Tunai', type:'select', options:PJ_KREDIT_TUNAI_OPTS, lockOnEdit:true },
      { key:'Tempo', label:'Tempo (hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'Nama_Akun_Tunai', label:'Akun Bayar', span:2, type:'select', options:invoiceAkunTunaiOpts,
        disabledIf: (f) => f.Kredit_Tunai !== 'TUNAI', clearValue:'',
        onChange: (val, set) => { const k = PJ_KASBANK.find(x => x.nama === val); set('Akun_Tunai', k ? k.kode : ''); } },
      { key:'Akun_Tunai', label:'Kode Akun Bayar', mono:true, readOnly:true, span:1, disabledIf: (f) => f.Kredit_Tunai !== 'TUNAI', clearValue:'' },
      { key:'Tgl_Kirim', label:'Tgl. Kirim', type:'date' },
      { key:'Alamat_Kirim', label:'Alamat Kirim', type:'textarea', span:3 },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', produk:true, lockItems:true },
    { id:'nonprodukjasa', label:'Non-Produk atau Jasa', type:'items', itemsKey:'Details2', showTotal:true, columns:[
      { key:'Kode_Item', label:'Kode', mono:true, width:110 },
      { key:'Nama_Item', label:'Nama', width:300 },
      { key:'Deskripsi', label:'Deskripsi', width:200 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:130 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:90 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:120 },
      { key:'Total', label:'Total', compute:(r)=>fmtRp(pjLineTotal(r)), width:150 },
      { key:'Realisasi', label:'Realisasi', readOnly:true, hideOnCreate:true, num:true, width:100 },
    ], itemSource:{ data:PJ_AKUN_BIAYA, codeKey:'Kode_Item', nameKey:'Nama_Item' }, lockItems:true },
  ];
}
