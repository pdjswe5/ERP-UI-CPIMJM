// Penjualan — data & config Delivery Order (DO)
//
// Beda dengan dokumen Penjualan lain: barang DO TIDAK diketik manual/dari master BARANG, melainkan
// diambil dari baris barang Sales Order (bisa dari BEBERAPA SO sekaligus, mis. 3 barang dari SO A +
// 2 barang dari SO B dalam 1 DO), dengan syarat semua SO yang diambil harus punya customer yang sama
// dengan customer header DO. Karena itu urutan pengisian dipaksa: isi No. Bukti (F/K) -> pilih
// Customer -> field lain & tabel Barang baru terbuka (lihat disabledIf:f=>!f.Kode_Cust di semua field
// selain No_Bukti/Tgl_Bukti/Nama_Cust/Kode_Cust).
// Status DO dihitung otomatis dari realisasi barang (sama pola SO/KO/GR), kecuali "Selesai Manual".

function doItem(soRow, soNoBukti, soNoKo, idx, jumlah) {
  return {
    No_So: soNoBukti, No_So_Id_Det: idx + 1, No_Ko: soNoKo || '',
    Kode_Item: soRow.Kode_Item, Nama_Item: soRow.Nama_Item, Deskripsi: soRow.Deskripsi || '',
    Jumlah: jumlah, Realisasi: 0, Konversi: 1, Satuan: soRow.Satuan || 'PCS', Hrg_Sat: soRow.Hrg_Sat || 0,
    DiscPros_Det: soRow.DiscPros_Det || 0, DiscNilai_Det: soRow.DiscNilai_Det || 0,
  };
}

function doHead(no, tgl, custCode, ket, details, opts={}) {
  const cust = PJ_PELANGGAN.find(p => p.code === custCode);
  const gudang = opts.gudang ? PJ_GUDANG_LIST.find(g => g.kode === opts.gudang) : PJ_GUDANG_LIST[0];
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Referensi: opts.noReferensi || '',
    Kode_Cust:custCode, Nama_Cust: cust ? cust.name : custCode,
    Kode_Gudang: gudang ? gudang.kode : '', Nama_Gudang: gudang ? gudang.nama : '',
    Tgl_Kirim: opts.tglKirim || tgl, Alamat_Kirim: opts.alamatKirim || (cust ? cust.alamat : ''),
    Keterangan:ket, PPN:11, PPN_Include:false, DiscPros_Head: opts.disc ?? 0, DiscNilai_Head: opts.discRp ?? 0,
    Nm_Kirim: opts.nmKirim || (cust ? cust.namaPemesan : ''), Kt_Kirim: opts.ktKirim || (cust ? cust.kota : ''), Tel_Kirim: opts.telKirim || (cust ? cust.tel : ''),
    Locofranco: opts.incoterm || 'Franco', JualCoil: opts.jualCoil || 'N', Klasifikasi: opts.klasifikasi || (cust ? cust.klasifikasi : ''),
    Proyek: opts.proyek || '', No_Po: opts.noPo || '', Expedisi: opts.expedisi || '',
    Status: opts.status || '', Alasan_Status: opts.alasanStatus || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:30:00`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:15:00`,
    Details:details,
  };
}

// Helper dummy data: ambil N barang pertama dari 1 SO (dipakai membangun DELIVERY_ORDER_SEED)
function doItemsFromSo(so, count, jumlahOverride) {
  return (so.Details || []).slice(0, count).map((r, i) => doItem(r, so.No_Bukti, so.No_Ko, i, jumlahOverride ?? r.Jumlah));
}

const DELIVERY_ORDER_SEED = [
  doHead('KDO26070001', '2026-07-10', 'b7364', 'Kirim sebagian barang SO rutin', [
    ...doItemsFromSo(SALES_ORDER_SEED[0], 3),
  ], { noReferensi:'REF-DO-001', gudang:'GDG-001', noPo:'PO-BSC-001' }),
  doHead('FDO26070002', '2026-07-11', 'C001', 'Kirim aksesoris + jasa pemasangan', [
    ...doItemsFromSo(SALES_ORDER_SEED[1], 4),
  ], { gudang:'GDG-002', expedisi:'Indah Cargo' }),
  doHead('KDO26070003', '2026-07-12', 'g123', 'Dibatalkan, customer minta tunda kirim', [
    ...doItemsFromSo(SALES_ORDER_SEED[3], 3),
  ], { gudang:'GDG-001', batal:true, alasanStatus:'Customer meminta penundaan pengiriman' }),
  doHead('FDO26070004', '2026-07-12', 'H01', 'Kirim stok toko cabang', [
    ...doItemsFromSo(SALES_ORDER_SEED[4], 5),
  ], { gudang:'GDG-004', proyek:'Restock Cabang H01' }),
  doHead('KDO26070005', '2026-07-13', 'KV001', 'Kirim barang sesuai jadwal SO', [
    ...doItemsFromSo(SALES_ORDER_SEED[5], 2),
  ], { gudang:'GDG-001', noReferensi:'REF-DO-005' }),
  doHead('KDO26070006', '2026-07-14', 'L001', 'Kirim bertahap sesuai jadwal SO', [
    ...doItemsFromSo(SALES_ORDER_SEED[6], 4),
  ], { gudang:'GDG-003', expedisi:'Trans Jaya' }),
  doHead('FDO26070007', '2026-07-15', 'L002', 'Kirim penuh aksesoris lengkap', [
    ...doItemsFromSo(SALES_ORDER_SEED[7], 6),
  ], { gudang:'GDG-002' }),
  doHead('KDO26070008', '2026-07-16', 'L015', 'Dibatalkan, SO sumber sudah batal', [
    ...doItemsFromSo(SALES_ORDER_SEED[8], 3),
  ], { gudang:'GDG-001', batal:true, alasanBatal:'SO sumber dibatalkan customer' }),
  doHead('FDO26070009', '2026-07-17', 'p12345', 'DO ditutup manual, sisa barang menyusul', [
    ...doItemsFromSo(SALES_ORDER_SEED[9], 5),
  ], { gudang:'GDG-004', noPo:'PO-PRJ-9911', status:'SELESAI', alasanStatus:'Sisa barang dikirim terpisah, ditutup manual oleh operator' }),
];

function doComputeStatus(row) {
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

function doStatusPill(row) {
  const s = doComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

function doGudangOpts() { return PJ_GUDANG_LIST.map(g => ({ value:g.nama, label:g.nama })); }

// Picker barang DO: ambil barang dari 1 atau lebih Sales Order milik customer yang sama dengan
// customer header DO. Hanya menampilkan sisa (Jumlah - Realisasi) yang belum terkirim, dan hanya
// dari SO yang belum batal.
function DoSoItemPickerModal({ salesOrderList, form, onCancel, onConfirm }) {
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
          const sisa = (+r.Jumlah || 0) - (+r.Realisasi || 0);
          if (sisa <= 0) return;
          list.push({ rowKey:`${so.No_Bukti}#${idx}`, so, soRow:r, idx, sisa });
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
  const setQty = (rowKey, val, sisa) => setQtyMap(prev => ({ ...prev, [rowKey]: Math.max(1, Math.min(sisa, +val || 1)) }));
  const selectedCount = Object.keys(selected).length;

  const handleConfirm = () => {
    const items = Object.keys(selected).map(rowKey => {
      const c = candidates.find(x => x.rowKey === rowKey);
      const jumlah = qtyMap[rowKey] || c.sisa;
      return { ...doItem(c.soRow, c.so.No_Bukti, c.so.No_Ko, c.idx, jumlah), _added:true };
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
              <thead><tr><th style={{width:40}}></th><th>No. SO</th><th>Kode</th><th>Nama Barang</th><th style={{width:90}}>Sisa</th><th style={{width:100}}>Jumlah Kirim</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="empty">{candidates.length === 0 ? 'Tidak ada Sales Order aktif dengan sisa barang untuk customer ini.' : 'Tidak ditemukan.'}</td></tr>}
                {filtered.map(c => {
                  const isSel = !!selected[c.rowKey];
                  return (
                    <tr key={c.rowKey} className={isSel ? 'selected' : ''} onClick={()=>toggle(c.rowKey)}>
                      <td><input type="checkbox" checked={isSel} onChange={()=>toggle(c.rowKey)} onClick={e=>e.stopPropagation()}/></td>
                      <td className="mono">{c.so.No_Bukti}</td>
                      <td className="mono">{c.soRow.Kode_Item}</td>
                      <td>{c.soRow.Nama_Item}</td>
                      <td className="num mono">{c.sisa}</td>
                      <td>
                        {isSel ? (
                          <input className="cell num" type="number" min={1} max={c.sisa} value={qtyMap[c.rowKey] || c.sisa} onChange={e=>setQty(c.rowKey, e.target.value, c.sisa)} onClick={e=>e.stopPropagation()}/>
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

function doSoItemPickerFactory(salesOrderList) {
  return function BoundDoSoItemPickerModal(props) {
    return <DoSoItemPickerModal salesOrderList={salesOrderList} {...props} />;
  };
}

function deliveryOrderTabs(salesOrderList) {
  const gated = (f) => f.Kode_Cust ? false : true;
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'Nama_Cust', label:'Nama Customer', type:'select', required:true, span:2,
        options: () => PJ_PELANGGAN.map(p => ({ value:p.name, label:p.name })),
        onChange: (val, set) => { const p = PJ_PELANGGAN.find(x => x.name === val); set('Kode_Cust', p ? p.code : ''); } },
      { key:'Kode_Cust', label:'Kode Customer', mono:true, readOnly:true, span:1 },
      { key:'No_Referensi', label:'No. Referensi', disabledIf:gated },
      { key:'Nama_Gudang', label:'Gudang', type:'select', span:2, options:doGudangOpts, disabledIf:gated, lockOnEdit:true,
        onChange: (val, set) => { const g = PJ_GUDANG_LIST.find(x => x.nama === val); set('Kode_Gudang', g ? g.kode : ''); } },
      { key:'Kode_Gudang', label:'Kode Gudang', mono:true, readOnly:true, span:1, disabledIf:gated },
      { key:'Tgl_Kirim', label:'Tgl. Kirim', type:'date', disabledIf:gated },
      { key:'Klasifikasi', label:'Klasifikasi', type:'select', options:PJ_KLASIFIKASI_OPTS, disabledIf:gated },
      { key:'Locofranco', label:'Incoterm', type:'select', options:PJ_INCOTERM_OPTS, disabledIf:gated },
      { key:'JualCoil', label:'Jual Coil', type:'select', options:[{value:'N',label:'N'},{value:'Y',label:'Y'}], default:'N', disabledIf:gated, clearValue:'N' },
      { key:'Expedisi', label:'Expedisi', disabledIf:gated },
      { key:'No_Po', label:'No. PO', disabledIf:gated },
      { key:'Proyek', label:'Proyek', disabledIf:gated },
      { key:'Alamat_Kirim', label:'Alamat Kirim', type:'textarea', span:3, disabledIf:gated },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3, disabledIf:gated },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', lockItems:true, showTotal:true, PickerComponent: doSoItemPickerFactory(salesOrderList), columns:[
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
  ];
}
