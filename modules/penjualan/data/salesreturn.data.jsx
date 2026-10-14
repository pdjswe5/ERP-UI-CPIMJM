// Penjualan — data & config Sales Return (Retur Jual)
//
// Sama seperti Delivery Order: barang Retur TIDAK diketik manual/dari master BARANG, melainkan
// diambil dari baris barang Sales Order yang SUDAH terealisasi (Realisasi > 0 — barang yang memang
// sudah terjual/terkirim, jadi bisa diretur), bisa dari BEBERAPA SO sekaligus, dengan syarat semua SO
// yang diambil harus customer yang sama dengan customer header Retur. Qty retur dibatasi maksimal
// sejumlah Realisasi SO tsb (tidak bisa retur lebih banyak dari yang sudah terjual).
// Status Retur dihitung otomatis dari realisasi proses retur (sama pola KO/SO/DO/Invoice), kecuali
// "Selesai Manual".

function returnItem(soRow, soNoBukti, soNoKo, idx, jumlah) {
  return {
    No_So: soNoBukti, No_So_Id_Det: idx + 1, No_Ko: soNoKo || '',
    Kode_Item: soRow.Kode_Item, Nama_Item: soRow.Nama_Item, Deskripsi: soRow.Deskripsi || '',
    Jumlah: jumlah, Realisasi: 0, Konversi: 1, Satuan: soRow.Satuan || 'PCS', Hrg_Sat: soRow.Hrg_Sat || 0,
    DiscPros_Det: soRow.DiscPros_Det || 0, DiscNilai_Det: soRow.DiscNilai_Det || 0,
  };
}

function returnBiayaItem(kode, nama, jumlah, harga, deskripsi='') {
  return { Kode_Item:kode, Nama_Item:nama, Deskripsi:deskripsi, Jumlah:jumlah, Realisasi:0, Satuan:'PCS', Hrg_Sat:harga, DiscPros_Det:0, DiscNilai_Det:0 };
}

function returnHead(no, tgl, custCode, kreditTunai, tempo, alasanRetur, ket, details, details2, opts={}) {
  const cust = PJ_PELANGGAN.find(p => p.code === custCode);
  const akun = opts.akunTunai ? PJ_KASBANK.find(k => k.kode === opts.akunTunai) : null;
  const gudang = opts.gudang ? PJ_GUDANG_LIST.find(g => g.kode === opts.gudang) : PJ_GUDANG_LIST[0];
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Jual: opts.noJual || '',
    Kode_Cust:custCode, Nama_Cust: cust ? cust.name : custCode,
    Kode_Sales: cust ? cust.kodeSales || '' : '', Nama_Sales: cust ? cust.namaSales || '' : '',
    Kode_Gudang: gudang ? gudang.kode : '', Nama_Gudang: gudang ? gudang.nama : '',
    Kredit_Tunai:kreditTunai, Akun_Tunai: kreditTunai === 'TUNAI' ? (akun ? akun.kode : '') : '', Nama_Akun_Tunai: kreditTunai === 'TUNAI' ? (akun ? akun.nama : '') : '',
    Tempo:tempo, Alasan_Retur:alasanRetur, Keterangan:ket, PPN:11, DiscPros_Head: opts.disc ?? 0, DiscNilai_Head: opts.discRp ?? 0,
    Status: opts.status || '', Alasan_Status: opts.alasanStatus || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:30:00`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:15:00`,
    Details:details, Details2: details2 || [],
  };
}

// Helper dummy data: ambil barang yang SUDAH terealisasi (Realisasi > 0) dari 1 SO, qty retur dibatasi
// maksimal Realisasi-nya (dipakai membangun SALES_RETURN_SEED).
function returnItemsFromSo(so, count, qtyOverride) {
  return (so.Details || [])
    .filter(r => (+r.Realisasi || 0) > 0)
    .slice(0, count)
    .map((r, i) => returnItem(r, so.No_Bukti, so.No_Ko, i, Math.min(qtyOverride ?? r.Realisasi, r.Realisasi)));
}

const SALES_RETURN_SEED = [
  returnHead('KRJ26070001', '2026-07-12', 'C001', 'TUNAI', 0, 'Cacat produksi', 'Retur barang cacat dari nota tunai', [
    ...returnItemsFromSo(SALES_ORDER_SEED[1], 2),
  ], [], { noJual:'KJL26070002', gudang:'GDG-002', akunTunai:'1005.001' }),
  returnHead('FRJ26070002', '2026-07-13', 'g123', 'KREDIT', 21, 'Salah kirim varian', 'Retur sebagian barang proyek renovasi', [
    ...returnItemsFromSo(SALES_ORDER_SEED[3], 3),
  ], [
    returnBiayaItem('100.101', 'Biaya Pengiriman Retur', 1, 100000),
  ], { noJual:'KJL26070004', gudang:'GDG-003' }),
  returnHead('KRJ26070003', '2026-07-14', 'L001', 'KREDIT', 30, 'Kemasan rusak', 'Dibatalkan, customer batal retur', [
    ...returnItemsFromSo(SALES_ORDER_SEED[6], 2),
  ], [], { gudang:'GDG-003', batal:true, alasanStatus:'Customer membatalkan permintaan retur' }),
  returnHead('FRJ26070004', '2026-07-15', 'L002', 'TUNAI', 0, 'Tidak sesuai pesanan', 'Retur aksesoris tidak sesuai pesanan', [
    ...returnItemsFromSo(SALES_ORDER_SEED[7], 4),
  ], [], { gudang:'GDG-002', akunTunai:'1005.003' }),
  returnHead('KRJ26070005', '2026-07-16', 'p12345', 'KREDIT', 14, 'Expired', 'Retur ditutup manual, sisa retur dibatalkan', [
    ...returnItemsFromSo(SALES_ORDER_SEED[9], 3),
  ], [], { gudang:'GDG-004', noPo:'PO-PRJ-9911', status:'SELESAI', alasanStatus:'Sisa retur dibatalkan, ditutup manual oleh operator' }),
  returnHead('FRJ26070006', '2026-07-17', 'g123', 'KREDIT', 21, 'Salah kirim varian', 'Retur bertahap sisa barang proyek', [
    ...returnItemsFromSo(SALES_ORDER_SEED[3], 4),
  ], [
    returnBiayaItem('100.103', 'Biaya Packing Retur', 1, 75000),
  ], { noJual:'KJL26070004', gudang:'GDG-003' }),
];

function returnComputeStatus(row) {
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

function returnStatusPill(row) {
  const s = returnComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function returnGudangOpts() { return PJ_GUDANG_LIST.map(g => ({ value:g.nama, label:g.nama })); }
function returnAkunTunaiOpts() { return PJ_KASBANK.map(k => ({ value:k.nama, label:k.nama })); }

// Picker barang Retur: ambil barang yang sudah terealisasi (Realisasi > 0) dari 1 atau lebih Sales
// Order milik customer yang sama dengan customer header Retur. Qty retur dibatasi maksimal Realisasi.
function ReturSoItemPickerModal({ salesOrderList, form, onCancel, onConfirm }) {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({});
  const [qtyMap, setQtyMap] = React.useState({});

  if (!form.Kode_Cust) {
    return (
      <div className="modal-backdrop" style={{zIndex:110}}>
        <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:480}}>
          <div className="modal-head"><h2>Pilih Barang dari Sales Order</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
          <div className="modal-body"><div className="muted">Pilih Customer terlebih dahulu di tab Informasi Umum sebelum mengambil barang dari Sales Order.</div></div>
          <div className="modal-foot"><div className="right"><button className="btn" onClick={onCancel}>Tutup</button></div></div>
        </div>
      </div>
    );
  }

  const candidates = React.useMemo(() => {
    const list = [];
    salesOrderList
      .filter(so => so.Kode_Cust === form.Kode_Cust && soComputeStatus(so) !== 'BATAL')
      .forEach(so => {
        (so.Details || []).forEach((r, idx) => {
          const terealisasi = +r.Realisasi || 0;
          if (terealisasi <= 0) return;
          list.push({ rowKey:`${so.No_Bukti}#${idx}`, so, soRow:r, idx, terealisasi });
        });
      });
    return list;
  }, [salesOrderList, form.Kode_Cust]);

  const filtered = React.useMemo(() => {
    if (!q) return candidates;
    const ql = q.toLowerCase();
    return candidates.filter(c => c.so.No_Bukti.toLowerCase().includes(ql) || c.soRow.Kode_Item.toLowerCase().includes(ql) || (c.soRow.Nama_Item||'').toLowerCase().includes(ql));
  }, [candidates, q]);

  const toggle = (rowKey) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[rowKey]) { delete next[rowKey]; setQtyMap(qm => { const nqm={...qm}; delete nqm[rowKey]; return nqm; }); }
      else next[rowKey] = true;
      return next;
    });
  };
  const setQty = (rowKey, val, max) => setQtyMap(prev => ({ ...prev, [rowKey]: Math.max(1, Math.min(max, +val || 1)) }));
  const selectedCount = Object.keys(selected).length;

  const handleConfirm = () => {
    const items = Object.keys(selected).map(rowKey => {
      const c = candidates.find(x => x.rowKey === rowKey);
      const jumlah = qtyMap[rowKey] || c.terealisasi;
      return { ...returnItem(c.soRow, c.so.No_Bukti, c.so.No_Ko, c.idx, jumlah), _added:true };
    });
    onConfirm(items);
  };

  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Pilih Barang dari Sales Order — {form.Nama_Cust}</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari no. SO, kode, atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:340, overflowY:'auto'}}>
            <table>
              <thead><tr><th style={{width:40}}></th><th>No. SO</th><th>Kode</th><th>Nama Barang</th><th style={{width:110}}>Terjual</th><th style={{width:100}}>Jumlah Retur</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="empty">{candidates.length === 0 ? 'Tidak ada barang terealisasi (terjual) untuk customer ini.' : 'Tidak ditemukan.'}</td></tr>}
                {filtered.map(c => {
                  const isSel = !!selected[c.rowKey];
                  return (
                    <tr key={c.rowKey} className={isSel ? 'selected' : ''} onClick={()=>toggle(c.rowKey)}>
                      <td><input type="checkbox" checked={isSel} onChange={()=>toggle(c.rowKey)} onClick={e=>e.stopPropagation()}/></td>
                      <td className="mono">{c.so.No_Bukti}</td>
                      <td className="mono">{c.soRow.Kode_Item}</td>
                      <td>{c.soRow.Nama_Item}</td>
                      <td className="num mono">{c.terealisasi}</td>
                      <td>
                        {isSel ? (
                          <input className="cell num" type="number" min={1} max={c.terealisasi} value={qtyMap[c.rowKey] || c.terealisasi} onChange={e=>setQty(c.rowKey, e.target.value, c.terealisasi)} onClick={e=>e.stopPropagation()}/>
                        ) : <span className="muted">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>{selectedCount} barang dipilih</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onCancel}>Batal</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedCount===0}>{I.plus()} Tambah Barang ({selectedCount})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function returnSoItemPickerFactory(salesOrderList) {
  return function BoundReturSoItemPickerModal(props) {
    return <ReturSoItemPickerModal salesOrderList={salesOrderList} {...props} />;
  };
}

function salesReturnTabs(salesOrderList, invoiceList) {
  const gated = (f) => f.Kode_Cust ? false : true;
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'No_Jual', label:'Ref. Invoice', mono:true, lockOnEdit:true,
        type:'select', options: () => invoiceList.map(v => ({ value:v.No_Bukti, label:v.No_Bukti })) },
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
      { key:'Nama_Gudang', label:'Gudang', type:'select', span:2, options:returnGudangOpts, disabledIf:gated, lockOnEdit:true,
        onChange: (val, set) => { const g = PJ_GUDANG_LIST.find(x => x.nama === val); set('Kode_Gudang', g ? g.kode : ''); } },
      { key:'Kode_Gudang', label:'Kode Gudang', mono:true, readOnly:true, span:1, disabledIf:gated },
      { key:'Kredit_Tunai', label:'Kredit/Tunai', type:'select', options:PJ_KREDIT_TUNAI_OPTS, disabledIf:gated, lockOnEdit:true },
      { key:'Tempo', label:'Tempo (hari)', type:'number', disabledIf: (f) => gated(f) || f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'Nama_Akun_Tunai', label:'Akun Bayar', span:2, type:'select', options:returnAkunTunaiOpts,
        disabledIf: (f) => gated(f) || f.Kredit_Tunai !== 'TUNAI', clearValue:'',
        onChange: (val, set) => { const k = PJ_KASBANK.find(x => x.nama === val); set('Akun_Tunai', k ? k.kode : ''); } },
      { key:'Akun_Tunai', label:'Kode Akun Bayar', mono:true, readOnly:true, span:1, disabledIf: (f) => gated(f) || f.Kredit_Tunai !== 'TUNAI', clearValue:'' },
      { key:'Alasan_Retur', label:'Alasan Retur', type:'select', options:PJ_ALASAN_RETUR_OPTS, required:true, disabledIf:gated },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3, disabledIf:gated },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', lockItems:true, showTotal:true, PickerComponent: returnSoItemPickerFactory(salesOrderList), columns:[
      { key:'No_So', label:'Ref. SO', mono:true, width:130, readOnly:true },
      { key:'No_Ko', label:'Ref. KO', mono:true, width:130, readOnly:true },
      { key:'Kode_Item', label:'Kode', mono:true, width:170, readOnly:true },
      { key:'Nama_Item', label:'Nama Barang', width:320, readOnly:true },
      { key:'Deskripsi', label:'Deskripsi', width:200 },
      { key:'Jumlah', label:'Jumlah', type:'number', num:true, width:90 },
      { key:'Satuan', label:'Satuan', width:90 },
      { key:'Hrg_Sat', label:'Harga Satuan', type:'number', num:true, width:130 },
      { key:'DiscPros_Det', label:'Disc (%)', type:'number', num:true, width:90 },
      { key:'DiscNilai_Det', label:'Disc (Rp)', type:'number', num:true, width:120 },
      { key:'Total', label:'Total', compute:(r)=>fmtRp(pjLineTotal(r)), width:150 },
      { key:'Realisasi', label:'Realisasi', readOnly:true, hideOnCreate:true, num:true, width:100 },
    ]},
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
