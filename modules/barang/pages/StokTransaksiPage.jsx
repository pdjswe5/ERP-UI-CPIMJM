// Barang — transaksi stok: Mutasi, Penyesuaian, Opname (list & modal bersama, dibedakan lewat
// prop `title`/`isOpname`, sama seperti root barang.jsx asli). Dipindah dari root barang.jsx,
// tidak diubah — kecuali BrgTransList yang sekarang dapat prop opsional `addExtra` (dipakai
// MutasiBarangPage untuk 2 tombol Mutasi/Konsinyasi, lihat di bawah); Penyesuaian & Stock
// Opname tetap pakai `onAdd` tunggal seperti semula, tidak terpengaruh.
//
// Fix bug lama: header punya kolom `{gudangCol}` yang tidak pernah diisi pemanggil manapun
// (Mutasi/Penyesuaian/Opname semua tidak pernah pass prop itu), sementara body SELALU render
// <td> gudang — akibatnya header kolom geser satu ke kiri dari datanya (label "Jenis" nangkring
// di atas data gudang, dst). Diganti jadi <th> statis yang selalu match dengan body, plus kolom
// Kategori baru supaya rekap Mutasi/Konsinyasi konsisten dengan field kodeKategori yang sekarang ada.
//
// Prop `onCancel` (opsional): kalau diisi, tampil icon "Batalkan Transaksi" di kolom Aksi —
// disabled (bukan disembunyikan) kalau baris sudah batal. Sama pola dengan onCancelDoc di
// PjDocList/PbDocList (Penjualan/Pembelian): pemanggil buka ConfirmationModal sendiri, komponen
// ini cuma memicu callback dengan baris yang diklik.
//
// onView vs onEdit: klik baris/No. Bukti → onView (buka modal mode VIEW, readonly). Klik icon
// Edit di kolom Aksi → onEdit (buka modal langsung mode EDIT). Sama pola dengan PjDocList/
// PbDocList (KatalogPelangganPage/PemasokPage) — bedanya di sana modal generik (PjModalShell/
// PbModalShell) yang punya toggle VIEW/EDIT bawaan, di sini masing-masing modal Mutasi/Koreksi/
// Opname mengimplementasikan togglenya sendiri (lihat initialMode prop).
function BrgTransList({ title, rows, onAdd, addLabel='Transaksi Baru', addExtra, onView, onEdit, onCancel, onCetak, onCetakRow }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => !q || r.noBukti.toLowerCase().includes(q.toLowerCase()));
  const hasKategori = rows.some(r => r.kodeKategori);
  return (
    <>
      <BrgHeader title={title} sub={`${filtered.length} transaksi`} onAdd={addExtra ? undefined : onAdd} addLabel={addLabel}
        extra={<>{onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>}{addExtra}</>} />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No. Bukti…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>No. Bukti</th><th>Tgl. Bukti</th><th>Gudang</th><th>Jenis</th>{hasKategori && <th>Kategori</th>}<th>Keterangan</th><th>Jml Item</th><th>Status</th><th style={{width:120}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.noBukti} onClick={()=>onView(r)}>
                  <td><span className="cell-link mono">{r.noBukti}</span></td>
                  <td>{r.tglBukti}</td>
                  {r.kodeGudangDari !== undefined ? <td>{brgGudangNama(r.kodeGudangDari)} → {brgGudangNama(r.kodeGudangKe)}</td> : <td>{brgGudangNama(r.kodeGudang)}</td>}
                  <td>{r.jenis}</td>
                  {hasKategori && <td>{r.kodeKategori ? brgKategoriNama(r.kodeKategori) : <span className="muted">—</span>}</td>}
                  <td>{r.keterangan || <span className="muted">—</span>}</td>
                  <td className="mono">{r.details.length}</td>
                  <td>{brgBatalPill(r.batal)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title={r.batal ? 'Transaksi sudah dibatalkan' : 'Edit'} disabled={r.batal} onClick={()=>onEdit(r)}>{I.edit()}</button>
                      {onCancel && (
                        <button className="btn btn-icon btn-sm del" title={r.batal ? 'Sudah dibatalkan' : 'Batalkan Transaksi'} disabled={r.batal} onClick={()=>onCancel(r)}>{I.fileX(14)}</button>
                      )}
                      <button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>onCetakRow ? onCetakRow(r) : (window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.'))}>{I.print()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager"><div>Menampilkan <b>1</b>–<b>{filtered.length}</b> dari <b>{filtered.length}</b></div></div>
      </div>
    </>
  );
}


// ─── Mutasi Barang & Konsinyasi — form khusus (beda dari BrgTransModal generik di atas) ───────
//
// Picker barang untuk tabel "Barang Mutasi": checkbox multi-select dari MUTASI_BARANG_MASTER
// (gabungan Bahan Baku + Barang Jadi + Barang Lain, lihat mutasi.data.jsx), tiap baris yang
// dicentang langsung menampilkan Satuan (dropdown dari `units` barang itu)/Konversi
// (readonly, ikut satuan)/Jumlah (input)/Satuan Terkecil (readonly = konversi × jumlah).
function MutasiItemPickerModal({ onConfirm, onCancel }) {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({}); // kode -> { satuan, jumlah }
  const filtered = MUTASI_BARANG_MASTER.filter(it => !q || it.nama.toLowerCase().includes(q.toLowerCase()) || it.kode.toLowerCase().includes(q.toLowerCase()));
  const toggle = (item) => {
    setSelected(prev => {
      const next = {...prev};
      if (next[item.kode]) delete next[item.kode];
      else next[item.kode] = { satuan: item.units[0].satuan, jumlah:1 };
      return next;
    });
  };
  const setField = (kode, key, val) => setSelected(prev => ({...prev, [kode]: {...prev[kode], [key]:val}}));
  const selectedCount = Object.keys(selected).length;
  const handleConfirm = () => {
    const picked = Object.keys(selected).map(kode => {
      const item = MUTASI_BARANG_MASTER.find(x => x.kode === kode);
      const sel = selected[kode];
      const unit = item.units.find(u => u.satuan === sel.satuan) || item.units[0];
      const jumlah = Math.max(1, +sel.jumlah || 1);
      return { kodeItem:item.kode, namaItem:item.nama, satuan:unit.satuan, konversi:unit.konversi, jumlah, units:item.units, _added:true };
    });
    onConfirm(picked);
  };
  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal item-picker-modal" style={{maxWidth:900}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Pilih barang yang ingin ditambahkan</h2><div className="sub">Pilih barang untuk ditambahkan ke daftar barang</div></div>
          <button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari kode atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:360, overflowY:'auto'}}>
            <table>
              <thead><tr><th style={{width:36}}></th><th>Nama Barang</th><th style={{width:150}}>Kode Barang</th><th style={{width:110}}>Satuan</th><th style={{width:90}}>Konversi</th><th style={{width:90}}>Jumlah</th><th style={{width:110}}>Satuan Terkecil</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(it => {
                  const sel = selected[it.kode];
                  const isSel = !!sel;
                  const unit = isSel ? (it.units.find(u => u.satuan === sel.satuan) || it.units[0]) : null;
                  const jumlah = isSel ? Math.max(1, +sel.jumlah || 1) : 0;
                  return (
                    <tr key={it.kode} className={isSel ? 'selected' : ''} onClick={()=>toggle(it)}>
                      <td><input type="checkbox" checked={isSel} onChange={()=>toggle(it)} onClick={e=>e.stopPropagation()}/></td>
                      <td><span className="cell-link">{it.nama}</span></td>
                      <td className="mono">{it.kode}</td>
                      <td onClick={e=>e.stopPropagation()}>
                        {isSel ? (
                          <select className="cell" value={sel.satuan} onChange={e=>setField(it.kode,'satuan',e.target.value)}>
                            {it.units.map(u => <option key={u.satuan} value={u.satuan}>{u.satuan}</option>)}
                          </select>
                        ) : <span className="muted">—</span>}
                      </td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num mono" value={unit.konversi} readOnly/> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num" type="number" min={1} value={sel.jumlah} onChange={e=>setField(it.kode,'jumlah', Math.max(1,+e.target.value||1))}/> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num mono" value={unit.konversi * jumlah} readOnly/> : <span className="muted">—</span>}</td>
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
            <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedCount===0}>{I.plus()} Tambah {selectedCount} Item</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabel "Barang Mutasi" — soft-delete sama pola tabel barang Pembelian PR: hapus cuma menandai
// `_deleted:true` (baris pudar + tombol Restore), baru benar-benar dibuang saat form disimpan
// (lihat handleSave di MutasiBuatModal). Satuan Terkecil selalu dihitung ulang (konversi × jumlah),
// tidak disimpan sebagai state terpisah supaya tidak pernah desync dari Konversi/Jumlah.
function MutasiBarangTable({ rows, setRows, onAddClick, viewMode, addLocked, addLockedMsg='Lengkapi Tanggal, Kategori, dan Gudang terlebih dahulu.' }) {
  const updateSatuan = (idx, satuan) => setRows(rows.map((r,i) => {
    if (i !== idx) return r;
    const unit = (r.units || []).find(u => u.satuan === satuan) || { satuan, konversi:1 };
    return { ...r, satuan, konversi:unit.konversi };
  }));
  const updateJumlah = (idx, jumlah) => setRows(rows.map((r,i) => i===idx ? {...r, jumlah} : r));
  const remove = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:true} : r));
  const restore = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:false} : r));
  const viewRows = viewMode ? rows.filter(r => !r._deleted) : rows;
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>Barang Mutasi {!viewMode && <span style={{color:'var(--danger)'}}>*</span>}</h3>
        {!viewMode && (
          <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
            onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onAddClick(); }}>{I.plus()} Tambah Item</button>
        )}
      </div>
      <div className={`line-items ${viewMode ? 'view-only' : ''}`} style={{height:240, overflowY:'auto'}}>
        <table style={{width:'100%', minWidth:0, tableLayout:'fixed'}}>
          <thead><tr>
            <th style={{width:180}}>Nama Barang</th><th style={{width:140}}>Kode Barang</th><th style={{width:110}}>Satuan</th>
            <th style={{width:90}}>Konversi</th><th style={{width:90}}>Jumlah</th><th style={{width:120}}>Satuan Terkecil</th>{!viewMode && <th style={{width:56}}>Aksi</th>}
          </tr></thead>
          <tbody>
            {viewRows.length === 0 && <tr><td colSpan={viewMode ? 6 : 7} className="empty">Belum ada barang.</td></tr>}
            {viewRows.map((r, idx) => (
              <tr key={idx} className={!viewMode ? `${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}` : ''}
                title={!viewMode && r._deleted ? 'Baris ini akan dihapus' : ''}>
                <td style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={r.namaItem}>{r.namaItem}</td>
                <td className="mono">{r.kodeItem}</td>
                <td>
                  {viewMode || r._deleted || !(r.units && r.units.length > 1) ? (
                    <span className="cell mono" style={{display:'block', padding:'4px 0'}}>{r.satuan}</span>
                  ) : (
                    <select className="cell" value={r.satuan} onChange={e=>updateSatuan(idx, e.target.value)}>
                      {r.units.map(u => <option key={u.satuan} value={u.satuan}>{u.satuan}</option>)}
                    </select>
                  )}
                </td>
                <td><input className="cell num mono" value={r.konversi} readOnly/></td>
                <td>{viewMode || r._deleted ? <span className="cell num mono" style={{display:'block', padding:'4px 0'}}>{r.jumlah}</span> : <input className="cell num" type="number" min={1} value={r.jumlah} onChange={e=>updateJumlah(idx, Math.max(1, +e.target.value || 1))}/>}</td>
                <td><input className="cell num mono" value={(r.konversi || 1) * (r.jumlah || 0)} readOnly/></td>
                {!viewMode && (
                  <td>
                    {r._deleted ? (
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={()=>restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>remove(idx)}>{I.trash()}</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Form Buat Mutasi/Konsinyasi — No Bukti pakai gerbang F/K (sama pola SPK/Hasil Produksi): user
// ketik F atau K dulu, field lain (Tanggal/Kategori/Gudang/Keterangan) baru bisa diisi setelah
// itu, nomor lengkap dirakit saat Simpan mengikuti format existing data (mis. "KMB26070004").
//
// Mode VIEW/EDIT — dipelajari dari PbModalShell/PjModalShell (Pembelian/Penjualan, dipakai mis.
// Katalog Pemasok/Pelanggan): klik baris/No. Bukti di list → buka mode VIEW (field readonly ala
// .view-value, tombol Edit di footer). Klik icon Edit di kolom Aksi → langsung mode EDIT. Beda
// dari PbModalShell: "Batalkan Perubahan" di sini eksplisit menampilkan ConfirmationModal HANYA
// kalau form benar-benar berubah dari snapshot saat masuk mode edit (dibandingkan lewat
// JSON.stringify) — PbModalShell aslinya langsung revert tanpa konfirmasi sama sekali.
function MutasiBuatModal({ jenis, data, initialMode, onClose, onSave, onRequestCancel }) {
  const isEdit0 = !!data;
  const [mode, setMode] = React.useState(isEdit0 ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isCreate = mode === 'CREATE';
  const isView = mode === 'VIEW';
  const isEdit = mode === 'EDIT';
  const [noBuktiRaw, setNoBuktiRaw] = React.useState('');
  const [noBuktiError, setNoBuktiError] = React.useState('');
  const noBuktiRef = React.useRef(null);
  const handleNoBuktiChange = (val) => {
    const v = val.toUpperCase();
    setNoBuktiRaw(v);
    if (!v) setNoBuktiError('No. Bukti harus di isi');
    else if (!['F','K'].includes(v[0])) setNoBuktiError('Format No. Bukti salah');
    else setNoBuktiError('');
  };
  const noBuktiLocked = isCreate && (!noBuktiRaw || !['F','K'].includes(noBuktiRaw[0]));
  React.useEffect(() => { if (isCreate && noBuktiRef.current) noBuktiRef.current.focus(); }, [isCreate]);

  const empty = { tglBukti:new Date().toISOString().slice(0,10), kodeKategori:'LAIN', kodeCustomer:'', kodeGudangDari:'', kodeGudangKe:'', keterangan:'', jenis, batal:false, alasanBatal:'', details:[] };
  const [form, setForm] = React.useState(() => { const base = data ? {...empty, ...data} : {...empty}; if (!Array.isArray(base.details)) base.details = []; return base; });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const [picker, setPicker] = React.useState(false);
  const [snapshotForm, setSnapshotForm] = React.useState(null);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const enterEditMode = () => { setSnapshotForm({...form}); setMode('EDIT'); };
  const handleCancelEditClick = () => {
    if (snapshotForm && JSON.stringify(form) !== JSON.stringify(snapshotForm)) setConfirmDiscard(true);
    else { setForm(snapshotForm || form); setSnapshotForm(null); setMode('VIEW'); }
  };
  const discardChanges = () => { setForm(snapshotForm); setSnapshotForm(null); setMode('VIEW'); setConfirmDiscard(false); };

  const handlePickerConfirm = (picked) => { setForm(f => ({...f, details:[...f.details, ...picked]})); setPicker(false); };

  const handleSave = () => {
    const cleanDetails = form.details.filter(r => !r._deleted).map(({_deleted, _added, units, ...r}) => ({ ...r, satuanTerkecil:(r.konversi||1)*(r.jumlah||0) }));
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const finalNo = isCreate ? `${noBuktiRaw[0]}MB${yy}${mm}${String(Math.floor(Math.random()*9000)+1000)}` : data.noBukti;
    onSave({ ...form, noBukti:finalNo, details:cleanDetails });
  };

  const req = <span style={{color:'var(--danger)'}}>*</span>;
  const isKonsinyasi = jenis === 'KONSINYASI';
  const title = isKonsinyasi ? 'Konsinyasi' : 'Mutasi';
  const kategoriOpts = BRG_KATEGORI_OPTS.filter(k => ['BAKU','JADI','LAIN'].includes(k.kode));
  // PJ_PELANGGAN (modules/penjualan/data/pelanggan.data.jsx) dimuat setelah script modul Barang,
  // tapi ini cuma dipakai di dalam body komponen (dievaluasi saat render di browser, jauh setelah
  // semua <script> selesai dimuat), jadi urutan <script> di index.html tidak masalah di sini.
  const customerNama = (kode) => PJ_PELANGGAN.find(c => c.code === kode)?.name || '';
  const modalTitle = isCreate ? `Buat ${title}` : isEdit ? `Edit ${title} — ${form.noBukti}` : `${title} — ${form.noBukti}`;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{maxWidth:1300, maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>{modalTitle}</h2><div className="sub">{isView ? brgBatalPill(form.batal) : 'Pastikan semua kolom bertanda (*) terisi.'}</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={{overflowY:'auto', maxHeight:'calc(92vh - 180px)', padding:'16px 24px'}}>
          {form.batal && <BrgAlasanBatal alasan={form.alasanBatal} />}
          <div className="panel">
            <h3>Informasi {title}</h3>
            <div className="form-grid-3" style={{gap:12}}>
              {isView ? (
                <BrgViewField label="No Bukti" value={form.noBukti} mono />
              ) : (
                <div className="field">
                  <label>No Bukti {req}</label>
                  {isCreate ? (
                    <>
                      <input ref={noBuktiRef} className="input mono" type="text" value={noBuktiRaw} onChange={e=>handleNoBuktiChange(e.target.value)} placeholder="Ketik F atau K" maxLength={1} />
                      {noBuktiError && <div className="no-bukti-alert">{noBuktiError}</div>}
                    </>
                  ) : <input className="input mono" value={form.noBukti} readOnly />}
                </div>
              )}
              {isView ? <BrgViewField label="Tanggal" value={form.tglBukti} /> : (
                <div className="field"><label>Tanggal {req}</label><input className="input" type="date" disabled={noBuktiLocked} value={form.tglBukti} onChange={e=>set('tglBukti',e.target.value)}/></div>
              )}
              {isView ? <BrgViewField label="Kategori" value={brgKategoriNama(form.kodeKategori)} /> : (
                <div className="field"><label>Kategori {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeKategori} onChange={e=>set('kodeKategori',e.target.value)}>{kategoriOpts.map(k=><option key={k.kode} value={k.kode}>{k.nama}</option>)}</select></div>
              )}

              {isKonsinyasi && (
                isView ? <BrgViewField label="Customer" value={customerNama(form.kodeCustomer) ? `${customerNama(form.kodeCustomer)} (${form.kodeCustomer})` : form.kodeCustomer} /> : (
                  <div className="form-grid-2" style={{gap:8}}>
                    <div className="field"><label>Customer {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeCustomer} onChange={e=>set('kodeCustomer',e.target.value)}><option value="">Pilih Customer</option>{PJ_PELANGGAN.map(c=><option key={c.code} value={c.code}>{c.code}</option>)}</select></div>
                    <div className="field"><label>&nbsp;</label><input className="input" value={customerNama(form.kodeCustomer)} readOnly placeholder="Customer" /></div>
                  </div>
                )
              )}
              {isView ? <BrgViewField label="Gudang Asal" value={brgGudangNama(form.kodeGudangDari)} /> : (
                <div className="form-grid-2" style={{gap:8}}>
                  <div className="field"><label>Gudang Asal {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeGudangDari} onChange={e=>set('kodeGudangDari',e.target.value)}><option value="">Pilih Gudang</option>{BRG_GUDANG_OPTS.map(g=><option key={g.kode} value={g.kode}>{g.kode}</option>)}</select></div>
                  <div className="field"><label>&nbsp;</label><input className="input" value={brgGudangNama(form.kodeGudangDari)} readOnly placeholder="Gudang Asal" /></div>
                </div>
              )}
              {isView ? <BrgViewField label="Gudang Tujuan" value={brgGudangNama(form.kodeGudangKe)} /> : (
                <div className="form-grid-2" style={{gap:8}}>
                  <div className="field"><label>Gudang Tujuan {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeGudangKe} onChange={e=>set('kodeGudangKe',e.target.value)}><option value="">Pilih Gudang</option>{BRG_GUDANG_OPTS.map(g=><option key={g.kode} value={g.kode}>{g.kode}</option>)}</select></div>
                  <div className="field"><label>&nbsp;</label><input className="input" value={brgGudangNama(form.kodeGudangKe)} readOnly placeholder="Gudang Tujuan" /></div>
                </div>
              )}
              {!isKonsinyasi && !isView && <div />}

              {isView ? <BrgViewField label="Keterangan" value={form.keterangan} /> : (
                <div className="field" style={{gridColumn:'span 3'}}><label>Keterangan</label><textarea className="textarea" disabled={noBuktiLocked} value={form.keterangan} onChange={e=>set('keterangan',e.target.value)}/></div>
              )}
            </div>
          </div>
          <div className="panel" style={{marginTop:16}}>
            <MutasiBarangTable rows={form.details} setRows={v=>set('details', v)} onAddClick={()=>setPicker(true)} viewMode={isView} addLocked={noBuktiLocked} />
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            {isView && !form.batal && onRequestCancel && <button className="btn btn-danger" onClick={()=>onRequestCancel(form)}>{I.x(14)} Batalkan Transaksi</button>}
            {isView && !form.batal && <button className="btn btn-primary" onClick={enterEditMode}>{I.edit()} Edit</button>}
            {isEdit && <button className="btn" onClick={handleCancelEditClick}>Batalkan Perubahan</button>}
            <button className="btn" onClick={onClose}>Tutup</button>
            {!isView && <button className="btn btn-primary" onClick={handleSave}>{I.check()} Simpan</button>}
          </div>
        </div>
      </div>
      {picker && <MutasiItemPickerModal onConfirm={handlePickerConfirm} onCancel={()=>setPicker(false)} />}
      {confirmDiscard && (
        <ConfirmationModal
          title="Batalkan Perubahan"
          message="Perubahan yang belum disimpan akan hilang. Yakin ingin membatalkan perubahan?"
          confirmLabel="Ya, Batalkan"
          confirmKind="danger"
          requireReason={false}
          onCancel={()=>setConfirmDiscard(false)}
          onConfirm={discardChanges}
        />
      )}
    </div>
  );
}

function MutasiBarangPage() {
  const [rows, setRows] = React.useState(MUTASI_BARANG);
  const [modal, setModal] = React.useState(null);
  const [modalJenis, setModalJenis] = React.useState(null); // null | 'MUTASI' | 'KONSINYASI'
  const [modalMode, setModalMode] = React.useState(null); // null | 'VIEW' | 'EDIT'
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);
  const closeModal = () => { setModalJenis(null); setModal(null); setModalMode(null); };
  const save = (form) => {
    setRows(prev => modal ? prev.map(r => r.noBukti===modal.noBukti ? form : r) : [...prev, form]);
    window.__erpToast && window.__erpToast(`${form.jenis==='KONSINYASI' ? 'Konsinyasi' : 'Mutasi'} barang berhasil disimpan.`);
    closeModal();
  };
  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, batal:true, alasanBatal: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.noBukti===updated.noBukti ? updated : r));
    window.__erpToast && window.__erpToast(`${confirmCancel.jenis==='KONSINYASI' ? 'Konsinyasi' : 'Mutasi'} barang dibatalkan.`);
    setConfirmCancel(null);
    closeModal();
  };
  return (
    <>
      <BrgTransList title="Mutasi Barang & Konsinyasi" rows={rows}
        addExtra={<>
          <button className="btn btn-primary" onClick={()=>{setModal(null); setModalJenis('MUTASI'); setModalMode(null);}}>{I.plus()} Mutasi Baru</button>
          <button className="btn btn-primary" onClick={()=>{setModal(null); setModalJenis('KONSINYASI'); setModalMode(null);}}>{I.plus()} Konsinyasi Baru</button>
        </>}
        onView={(r)=>{setModal(r); setModalJenis(r.jenis || 'MUTASI'); setModalMode('VIEW');}}
        onEdit={(r)=>{setModal(r); setModalJenis(r.jenis || 'MUTASI'); setModalMode('EDIT');}}
        onCancel={(r)=>setConfirmCancel(r)}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(r)=>{setCetakRow(r); setShowCetak(true);}} />
      {modalJenis && <MutasiBuatModal jenis={modalJenis} data={modal} initialMode={modalMode} onClose={closeModal} onSave={save} onRequestCancel={(r)=>setConfirmCancel(r)} />}
      {showCetak && (
        <BrgCetakModal docLabel="Mutasi Barang & Konsinyasi" rows={rows}
          columns={[{label:'Satuan'},{label:'Konversi', numeric:true},{label:'Jumlah', numeric:true},{label:'Satuan Terkecil', numeric:true}]}
          getItems={r => (r.details||[]).map(d => ({ kode:d.kodeItem, nama:d.namaItem, values:[d.satuan, d.konversi, d.jumlah, d.satuanTerkecil] }))}
          getGroupLabel={r => `${brgGudangNama(r.kodeGudangDari)} → ${brgGudangNama(r.kodeGudangKe)}`}
          groupLabelText="Gudang Asal → Tujuan"
          initialSelected={cetakRow ? [cetakRow.noBukti] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`${confirmCancel.jenis==='KONSINYASI' ? 'Konsinyasi' : 'Mutasi'} "${confirmCancel.noBukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}

// ─── Penyesuaian Barang (Koreksi) — form khusus, sama pola dengan Mutasi di atas ──────────────
//
// Picker barang untuk "Barang Koreksi": checkbox multi-select dari MUTASI_BARANG_MASTER, tiap
// baris dicentang menampilkan Satuan (dropdown, SELALU dropdown meski cuma 1 opsi)/Konversi
// (readonly, ikut satuan)/Jumlah (input, boleh negatif buat koreksi kurang)/Harga Total (input).
// Beda dari Mutasi: di sini cuma Konversi yang readonly — Satuan tetap dropdown aktif, bukan
// teks statis, sesuai instruksi eksplisit user.
function KoreksiItemPickerModal({ onConfirm, onCancel }) {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({}); // kode -> { satuan, jumlah, hargaTotal }
  const filtered = MUTASI_BARANG_MASTER.filter(it => !q || it.nama.toLowerCase().includes(q.toLowerCase()) || it.kode.toLowerCase().includes(q.toLowerCase()));
  const toggle = (item) => {
    setSelected(prev => {
      const next = {...prev};
      if (next[item.kode]) delete next[item.kode];
      else next[item.kode] = { satuan: item.units[0].satuan, jumlah:1, hargaTotal:0 };
      return next;
    });
  };
  const setField = (kode, key, val) => setSelected(prev => ({...prev, [kode]: {...prev[kode], [key]:val}}));
  const selectedCount = Object.keys(selected).length;
  const handleConfirm = () => {
    const picked = Object.keys(selected).map(kode => {
      const item = MUTASI_BARANG_MASTER.find(x => x.kode === kode);
      const sel = selected[kode];
      const unit = item.units.find(u => u.satuan === sel.satuan) || item.units[0];
      return { kodeItem:item.kode, namaItem:item.nama, satuan:unit.satuan, konversi:unit.konversi, jumlah:+sel.jumlah || 0, hargaTotal:+sel.hargaTotal || 0, units:item.units, _added:true };
    });
    onConfirm(picked);
  };
  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal item-picker-modal" style={{maxWidth:900}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Pilih barang yang ingin ditambahkan</h2><div className="sub">Pilih barang untuk ditambahkan ke daftar barang</div></div>
          <button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari kode atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:360, overflowY:'auto'}}>
            <table>
              <thead><tr><th style={{width:36}}></th><th>Nama Barang</th><th style={{width:150}}>Kode Barang</th><th style={{width:110}}>Satuan</th><th style={{width:90}}>Konversi</th><th style={{width:90}}>Jumlah</th><th style={{width:110}}>Harga Total</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(it => {
                  const sel = selected[it.kode];
                  const isSel = !!sel;
                  const unit = isSel ? (it.units.find(u => u.satuan === sel.satuan) || it.units[0]) : null;
                  return (
                    <tr key={it.kode} className={isSel ? 'selected' : ''} onClick={()=>toggle(it)}>
                      <td><input type="checkbox" checked={isSel} onChange={()=>toggle(it)} onClick={e=>e.stopPropagation()}/></td>
                      <td><span className="cell-link">{it.nama}</span></td>
                      <td className="mono">{it.kode}</td>
                      <td onClick={e=>e.stopPropagation()}>
                        {isSel ? (
                          <select className="cell" value={sel.satuan} onChange={e=>setField(it.kode,'satuan',e.target.value)}>
                            {it.units.map(u => <option key={u.satuan} value={u.satuan}>{u.satuan}</option>)}
                          </select>
                        ) : <span className="muted">—</span>}
                      </td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num mono" value={unit.konversi} readOnly/> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num" type="number" value={sel.jumlah} onChange={e=>setField(it.kode,'jumlah', e.target.value)}/> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num" type="number" value={sel.hargaTotal} onChange={e=>setField(it.kode,'hargaTotal', e.target.value)}/> : <span className="muted">—</span>}</td>
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
            <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedCount===0}>{I.plus()} Tambah {selectedCount} Item</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabel "Barang Koreksi" — soft-delete sama pola Mutasi. Satuan selalu dropdown aktif (bukan teks
// statis meski cuma 1 opsi), Jumlah & Harga Total input bebas, cuma Konversi yang readonly.
function KoreksiBarangTable({ rows, setRows, onAddClick, viewMode, addLocked, addLockedMsg='Lengkapi Tanggal, Kategori, dan Gudang terlebih dahulu.' }) {
  const updateSatuan = (idx, satuan) => setRows(rows.map((r,i) => {
    if (i !== idx) return r;
    const unit = (r.units || []).find(u => u.satuan === satuan) || { satuan, konversi:1 };
    return { ...r, satuan, konversi:unit.konversi };
  }));
  const updateField = (idx, key, val) => setRows(rows.map((r,i) => i===idx ? {...r, [key]:val} : r));
  const remove = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:true} : r));
  const restore = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:false} : r));
  const viewRows = viewMode ? rows.filter(r => !r._deleted) : rows;
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>Barang Koreksi {!viewMode && <span style={{color:'var(--danger)'}}>*</span>}</h3>
        {!viewMode && (
          <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
            onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onAddClick(); }}>{I.plus()} Tambah Item</button>
        )}
      </div>
      <div className={`line-items ${viewMode ? 'view-only' : ''}`} style={{height:240, overflowY:'auto'}}>
        <table style={{width:'100%', minWidth:0, tableLayout:'fixed'}}>
          <thead><tr>
            <th style={{width:180}}>Nama Barang</th><th style={{width:140}}>Kode Barang</th><th style={{width:110}}>Satuan</th>
            <th style={{width:90}}>Konversi</th><th style={{width:90}}>Jumlah</th><th style={{width:120}}>Harga Total</th>{!viewMode && <th style={{width:56}}>Aksi</th>}
          </tr></thead>
          <tbody>
            {viewRows.length === 0 && <tr><td colSpan={viewMode ? 6 : 7} className="empty">Belum ada barang.</td></tr>}
            {viewRows.map((r, idx) => (
              <tr key={idx} className={!viewMode ? `${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}` : ''}
                title={!viewMode && r._deleted ? 'Baris ini akan dihapus' : ''}>
                <td style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={r.namaItem}>{r.namaItem}</td>
                <td className="mono">{r.kodeItem}</td>
                <td>
                  {viewMode || r._deleted ? (
                    <span className="cell mono" style={{display:'block', padding:'4px 0'}}>{r.satuan}</span>
                  ) : (
                    <select className="cell" value={r.satuan} onChange={e=>updateSatuan(idx, e.target.value)}>
                      {(r.units && r.units.length ? r.units : [{satuan:r.satuan, konversi:r.konversi}]).map(u => <option key={u.satuan} value={u.satuan}>{u.satuan}</option>)}
                    </select>
                  )}
                </td>
                <td><input className="cell num mono" value={r.konversi} readOnly/></td>
                <td>{viewMode || r._deleted ? <span className="cell num mono" style={{display:'block', padding:'4px 0'}}>{r.jumlah}</span> : <input className="cell num" type="number" value={r.jumlah} onChange={e=>updateField(idx,'jumlah', +e.target.value || 0)}/>}</td>
                <td>{viewMode || r._deleted ? <span className="cell num mono" style={{display:'block', padding:'4px 0'}}>{r.hargaTotal}</span> : <input className="cell num" type="number" value={r.hargaTotal} onChange={e=>updateField(idx,'hargaTotal', +e.target.value || 0)}/>}</td>
                {!viewMode && (
                  <td>
                    {r._deleted ? (
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={()=>restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>remove(idx)}>{I.trash()}</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Form Buat Koreksi — No Bukti pakai gerbang F/K sama seperti Mutasi. Beda: Gudang tunggal (bukan
// Asal/Tujuan), dan Keterangan wajib (bukan opsional seperti di Mutasi).
//
// Mode VIEW/EDIT — sama pola dengan MutasiBuatModal di atas (lihat komentarnya untuk detail).
function PenyesuaianKoreksiModal({ data, initialMode, onClose, onSave, onRequestCancel }) {
  const isEdit0 = !!data;
  const [mode, setMode] = React.useState(isEdit0 ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isCreate = mode === 'CREATE';
  const isView = mode === 'VIEW';
  const isEdit = mode === 'EDIT';
  const [noBuktiRaw, setNoBuktiRaw] = React.useState('');
  const [noBuktiError, setNoBuktiError] = React.useState('');
  const noBuktiRef = React.useRef(null);
  const handleNoBuktiChange = (val) => {
    const v = val.toUpperCase();
    setNoBuktiRaw(v);
    if (!v) setNoBuktiError('No. Bukti harus di isi');
    else if (!['F','K'].includes(v[0])) setNoBuktiError('Format No. Bukti salah');
    else setNoBuktiError('');
  };
  const noBuktiLocked = isCreate && (!noBuktiRaw || !['F','K'].includes(noBuktiRaw[0]));
  React.useEffect(() => { if (isCreate && noBuktiRef.current) noBuktiRef.current.focus(); }, [isCreate]);

  const empty = { tglBukti:new Date().toISOString().slice(0,10), kodeKategori:'LAIN', kodeGudang:'', keterangan:'', batal:false, alasanBatal:'', details:[] };
  const [form, setForm] = React.useState(() => { const base = data ? {...empty, ...data} : {...empty}; if (!Array.isArray(base.details)) base.details = []; return base; });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const [picker, setPicker] = React.useState(false);
  const [snapshotForm, setSnapshotForm] = React.useState(null);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const enterEditMode = () => { setSnapshotForm({...form}); setMode('EDIT'); };
  const handleCancelEditClick = () => {
    if (snapshotForm && JSON.stringify(form) !== JSON.stringify(snapshotForm)) setConfirmDiscard(true);
    else { setForm(snapshotForm || form); setSnapshotForm(null); setMode('VIEW'); }
  };
  const discardChanges = () => { setForm(snapshotForm); setSnapshotForm(null); setMode('VIEW'); setConfirmDiscard(false); };

  const handlePickerConfirm = (picked) => { setForm(f => ({...f, details:[...f.details, ...picked]})); setPicker(false); };

  const handleSave = () => {
    const cleanDetails = form.details.filter(r => !r._deleted).map(({_deleted, _added, units, ...r}) => r);
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const finalNo = isCreate ? `${noBuktiRaw[0]}PB${yy}${mm}${String(Math.floor(Math.random()*9000)+1000)}` : data.noBukti;
    onSave({ ...form, noBukti:finalNo, details:cleanDetails });
  };

  const req = <span style={{color:'var(--danger)'}}>*</span>;
  const kategoriOpts = BRG_KATEGORI_OPTS.filter(k => ['BAKU','JADI','LAIN'].includes(k.kode));
  const modalTitle = isCreate ? 'Buat Koreksi' : isEdit ? `Edit Koreksi — ${form.noBukti}` : `Koreksi — ${form.noBukti}`;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{maxWidth:1300, maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>{modalTitle}</h2><div className="sub">{isView ? brgBatalPill(form.batal) : 'Pastikan semua kolom bertanda (*) terisi.'}</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={{overflowY:'auto', maxHeight:'calc(92vh - 180px)', padding:'16px 24px'}}>
          {form.batal && <BrgAlasanBatal alasan={form.alasanBatal} />}
          <div className="panel">
            <h3>Informasi Koreksi</h3>
            <div className="form-grid-3" style={{gap:12}}>
              {isView ? (
                <BrgViewField label="No Bukti" value={form.noBukti} mono />
              ) : (
                <div className="field">
                  <label>No Bukti {req}</label>
                  {isCreate ? (
                    <>
                      <input ref={noBuktiRef} className="input mono" type="text" value={noBuktiRaw} onChange={e=>handleNoBuktiChange(e.target.value)} placeholder="Ketik F atau K" maxLength={1} />
                      {noBuktiError && <div className="no-bukti-alert">{noBuktiError}</div>}
                    </>
                  ) : <input className="input mono" value={form.noBukti} readOnly />}
                </div>
              )}
              {isView ? <BrgViewField label="Tanggal" value={form.tglBukti} /> : (
                <div className="field"><label>Tanggal {req}</label><input className="input" type="date" disabled={noBuktiLocked} value={form.tglBukti} onChange={e=>set('tglBukti',e.target.value)}/></div>
              )}
              {isView ? <BrgViewField label="Kategori" value={brgKategoriNama(form.kodeKategori)} /> : (
                <div className="field"><label>Kategori {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeKategori} onChange={e=>set('kodeKategori',e.target.value)}>{kategoriOpts.map(k=><option key={k.kode} value={k.kode}>{k.nama}</option>)}</select></div>
              )}

              {isView ? <BrgViewField label="Gudang" value={brgGudangNama(form.kodeGudang)} /> : (
                <div className="form-grid-2" style={{gap:8}}>
                  <div className="field"><label>Gudang {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeGudang} onChange={e=>set('kodeGudang',e.target.value)}><option value="">Pilih Gudang</option>{BRG_GUDANG_OPTS.map(g=><option key={g.kode} value={g.kode}>{g.kode}</option>)}</select></div>
                  <div className="field"><label>&nbsp;</label><input className="input" value={brgGudangNama(form.kodeGudang)} readOnly placeholder="Gudang" /></div>
                </div>
              )}
              {isView ? <BrgViewField label="Keterangan" value={form.keterangan} /> : (
                <div className="field" style={{gridColumn:'span 2'}}><label>Keterangan {req}</label><textarea className="textarea" disabled={noBuktiLocked} value={form.keterangan} onChange={e=>set('keterangan',e.target.value)}/></div>
              )}
            </div>
          </div>
          <div className="panel" style={{marginTop:16}}>
            <KoreksiBarangTable rows={form.details} setRows={v=>set('details', v)} onAddClick={()=>setPicker(true)} viewMode={isView} addLocked={noBuktiLocked} />
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            {isView && !form.batal && onRequestCancel && <button className="btn btn-danger" onClick={()=>onRequestCancel(form)}>{I.x(14)} Batalkan Transaksi</button>}
            {isView && !form.batal && <button className="btn btn-primary" onClick={enterEditMode}>{I.edit()} Edit</button>}
            {isEdit && <button className="btn" onClick={handleCancelEditClick}>Batalkan Perubahan</button>}
            <button className="btn" onClick={onClose}>Tutup</button>
            {!isView && <button className="btn btn-primary" onClick={handleSave}>{I.check()} Simpan</button>}
          </div>
        </div>
      </div>
      {picker && <KoreksiItemPickerModal onConfirm={handlePickerConfirm} onCancel={()=>setPicker(false)} />}
      {confirmDiscard && (
        <ConfirmationModal
          title="Batalkan Perubahan"
          message="Perubahan yang belum disimpan akan hilang. Yakin ingin membatalkan perubahan?"
          confirmLabel="Ya, Batalkan"
          confirmKind="danger"
          requireReason={false}
          onCancel={()=>setConfirmDiscard(false)}
          onConfirm={discardChanges}
        />
      )}
    </div>
  );
}

function PenyesuaianBarangPage() {
  const [rows, setRows] = React.useState(PENYESUAIAN_BARANG);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null); // null | 'VIEW' | 'EDIT'
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);
  const closeModal = () => { setShowModal(false); setModal(null); setModalMode(null); };
  const save = (form) => {
    setRows(prev => modal ? prev.map(r => r.noBukti===modal.noBukti ? form : r) : [...prev, form]);
    window.__erpToast && window.__erpToast('Penyesuaian barang berhasil disimpan.');
    closeModal();
  };
  // Dipanggil dari icon "Batalkan Transaksi" di kolom Aksi list ATAU tombol di dalam modal
  // (keduanya sekarang lewat ConfirmationModal yang sama, wajib isi alasan).
  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, batal:true, alasanBatal: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.noBukti===updated.noBukti ? updated : r));
    window.__erpToast && window.__erpToast('Transaksi penyesuaian dibatalkan.');
    setConfirmCancel(null);
    closeModal();
  };
  return (
    <>
      <BrgTransList title="Penyesuaian Barang" rows={rows} addLabel="Koreksi Baru"
        onAdd={()=>{setModal(null); setShowModal(true); setModalMode(null);}}
        onView={(r)=>{setModal(r); setShowModal(true); setModalMode('VIEW');}}
        onEdit={(r)=>{setModal(r); setShowModal(true); setModalMode('EDIT');}}
        onCancel={(r)=>setConfirmCancel(r)}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(r)=>{setCetakRow(r); setShowCetak(true);}} />
      {showModal && <PenyesuaianKoreksiModal data={modal} initialMode={modalMode} onClose={closeModal} onSave={save} onRequestCancel={(r)=>setConfirmCancel(r)} />}
      {showCetak && (
        <BrgCetakModal docLabel="Penyesuaian Barang (Koreksi)" rows={rows}
          columns={[{label:'Satuan'},{label:'Konversi', numeric:true},{label:'Jumlah', numeric:true},{label:'Harga Total', numeric:true}]}
          getItems={r => (r.details||[]).map(d => ({ kode:d.kodeItem, nama:d.namaItem, values:[d.satuan, d.konversi, d.jumlah, fmtRp(d.hargaTotal)] }))}
          getGroupLabel={r => brgGudangNama(r.kodeGudang)}
          groupLabelText="Gudang"
          initialSelected={cetakRow ? [cetakRow.noBukti] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Koreksi "${confirmCancel.noBukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}

// ─── Stock Opname — form khusus, sama pola dengan Mutasi/Koreksi di atas ──────────────────────
//
// Beda dari Mutasi/Koreksi: Satuan di sini SELALU readonly (ikut satuan dasar barang, tidak bisa
// diganti user), begitu juga Saldo (nilai stok sistem — dummy deterministik lewat opPseudoSaldo
// di opname.data.jsx supaya konsisten tiap render, bukan Math.random di render). Cuma Fisik yang
// bisa diisi user (hasil hitung stok riil).
function OpnameItemPickerModal({ onConfirm, onCancel }) {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({}); // kode -> { fisik }
  const filtered = MUTASI_BARANG_MASTER.filter(it => !q || it.nama.toLowerCase().includes(q.toLowerCase()) || it.kode.toLowerCase().includes(q.toLowerCase()));
  const toggle = (item) => {
    setSelected(prev => {
      const next = {...prev};
      if (next[item.kode]) delete next[item.kode];
      else next[item.kode] = { fisik: opPseudoSaldo(item.kode) };
      return next;
    });
  };
  const setFisik = (kode, val) => setSelected(prev => ({...prev, [kode]: {...prev[kode], fisik:val}}));
  const selectedCount = Object.keys(selected).length;
  const handleConfirm = () => {
    const picked = Object.keys(selected).map(kode => {
      const item = MUTASI_BARANG_MASTER.find(x => x.kode === kode);
      const unit = item.units[0];
      const saldo = opPseudoSaldo(item.kode);
      return { kodeItem:item.kode, namaItem:item.nama, satuan:unit.satuan, konversi:unit.konversi, saldo, fisik:+selected[kode].fisik || 0, _added:true };
    });
    onConfirm(picked);
  };
  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal item-picker-modal" style={{maxWidth:900}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Pilih barang yang ingin ditambahkan</h2><div className="sub">Pilih barang untuk ditambahkan ke daftar barang</div></div>
          <button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari kode atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:360, overflowY:'auto'}}>
            <table>
              <thead><tr><th style={{width:36}}></th><th>Nama Barang</th><th style={{width:150}}>Kode Barang</th><th style={{width:100}}>Satuan</th><th style={{width:90}}>Konversi</th><th style={{width:90}}>Saldo</th><th style={{width:90}}>Fisik</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(it => {
                  const sel = selected[it.kode];
                  const isSel = !!sel;
                  const unit = it.units[0];
                  const saldo = opPseudoSaldo(it.kode);
                  return (
                    <tr key={it.kode} className={isSel ? 'selected' : ''} onClick={()=>toggle(it)}>
                      <td><input type="checkbox" checked={isSel} onChange={()=>toggle(it)} onClick={e=>e.stopPropagation()}/></td>
                      <td><span className="cell-link">{it.nama}</span></td>
                      <td className="mono">{it.kode}</td>
                      <td>{isSel ? <span className="cell mono" style={{display:'block'}}>{unit.satuan}</span> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num mono" value={unit.konversi} readOnly/> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num mono" value={saldo} readOnly/> : <span className="muted">—</span>}</td>
                      <td onClick={e=>e.stopPropagation()}>{isSel ? <input className="cell num" type="number" min={0} value={sel.fisik} onChange={e=>setFisik(it.kode, e.target.value)}/> : <span className="muted">—</span>}</td>
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
            <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedCount===0}>{I.plus()} Tambah {selectedCount} Item</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabel "Barang Opname" — soft-delete sama pola Mutasi/Koreksi. Satuan & Konversi & Saldo semua
// readonly (nilai tetap dari sistem), cuma Fisik yang bisa diedit user.
function OpnameBarangTable({ rows, setRows, onAddClick, viewMode, addLocked, addLockedMsg='Lengkapi Tanggal, Kategori, dan Gudang terlebih dahulu.' }) {
  const updateFisik = (idx, fisik) => setRows(rows.map((r,i) => i===idx ? {...r, fisik} : r));
  const remove = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:true} : r));
  const restore = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:false} : r));
  const viewRows = viewMode ? rows.filter(r => !r._deleted) : rows;
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>Barang Opname {!viewMode && <span style={{color:'var(--danger)'}}>*</span>}</h3>
        {!viewMode && (
          <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
            onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onAddClick(); }}>{I.plus()} Tambah Item</button>
        )}
      </div>
      <div className={`line-items ${viewMode ? 'view-only' : ''}`} style={{height:240, overflowY:'auto'}}>
        <table style={{width:'100%', minWidth:0, tableLayout:'fixed'}}>
          <thead><tr>
            <th style={{width:190}}>Nama Barang</th><th style={{width:140}}>Kode Barang</th><th style={{width:100}}>Satuan</th>
            <th style={{width:90}}>Konversi</th><th style={{width:90}}>Saldo</th><th style={{width:90}}>Fisik</th>{!viewMode && <th style={{width:56}}>Aksi</th>}
          </tr></thead>
          <tbody>
            {viewRows.length === 0 && <tr><td colSpan={viewMode ? 6 : 7} className="empty">Belum ada barang.</td></tr>}
            {viewRows.map((r, idx) => (
              <tr key={idx} className={!viewMode ? `${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}` : ''}
                title={!viewMode && r._deleted ? 'Baris ini akan dihapus' : ''}>
                <td style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={r.namaItem}>{r.namaItem}</td>
                <td className="mono">{r.kodeItem}</td>
                <td><span className="cell mono" style={{display:'block', padding:'4px 0'}}>{r.satuan}</span></td>
                <td><input className="cell num mono" value={r.konversi} readOnly/></td>
                <td><input className="cell num mono" value={r.saldo} readOnly/></td>
                <td>{viewMode || r._deleted ? <span className="cell num mono" style={{display:'block', padding:'4px 0'}}>{r.fisik}</span> : <input className="cell num" type="number" min={0} value={r.fisik} onChange={e=>updateFisik(idx, Math.max(0, +e.target.value || 0))}/>}</td>
                {!viewMode && (
                  <td>
                    {r._deleted ? (
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={()=>restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>remove(idx)}>{I.trash()}</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Form Buat Opname — struktur header sama persis dengan Koreksi (No Bukti gerbang F/K, Tanggal,
// Kategori, Gudang dd+nama, Keterangan).
//
// Mode VIEW/EDIT — sama pola dengan MutasiBuatModal/PenyesuaianKoreksiModal di atas.
function StockOpnameModal({ data, initialMode, onClose, onSave, onRequestCancel }) {
  const isEdit0 = !!data;
  const [mode, setMode] = React.useState(isEdit0 ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isCreate = mode === 'CREATE';
  const isView = mode === 'VIEW';
  const isEdit = mode === 'EDIT';
  const [noBuktiRaw, setNoBuktiRaw] = React.useState('');
  const [noBuktiError, setNoBuktiError] = React.useState('');
  const noBuktiRef = React.useRef(null);
  const handleNoBuktiChange = (val) => {
    const v = val.toUpperCase();
    setNoBuktiRaw(v);
    if (!v) setNoBuktiError('No. Bukti harus di isi');
    else if (!['F','K'].includes(v[0])) setNoBuktiError('Format No. Bukti salah');
    else setNoBuktiError('');
  };
  const noBuktiLocked = isCreate && (!noBuktiRaw || !['F','K'].includes(noBuktiRaw[0]));
  React.useEffect(() => { if (isCreate && noBuktiRef.current) noBuktiRef.current.focus(); }, [isCreate]);

  const empty = { tglBukti:new Date().toISOString().slice(0,10), kodeKategori:'LAIN', kodeGudang:'', keterangan:'', batal:false, alasanBatal:'', details:[] };
  const [form, setForm] = React.useState(() => { const base = data ? {...empty, ...data} : {...empty}; if (!Array.isArray(base.details)) base.details = []; return base; });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const [picker, setPicker] = React.useState(false);
  const [snapshotForm, setSnapshotForm] = React.useState(null);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const enterEditMode = () => { setSnapshotForm({...form}); setMode('EDIT'); };
  const handleCancelEditClick = () => {
    if (snapshotForm && JSON.stringify(form) !== JSON.stringify(snapshotForm)) setConfirmDiscard(true);
    else { setForm(snapshotForm || form); setSnapshotForm(null); setMode('VIEW'); }
  };
  const discardChanges = () => { setForm(snapshotForm); setSnapshotForm(null); setMode('VIEW'); setConfirmDiscard(false); };

  const handlePickerConfirm = (picked) => { setForm(f => ({...f, details:[...f.details, ...picked]})); setPicker(false); };

  const handleSave = () => {
    const cleanDetails = form.details.filter(r => !r._deleted).map(({_deleted, _added, ...r}) => r);
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const finalNo = isCreate ? `${noBuktiRaw[0]}SO${yy}${mm}${String(Math.floor(Math.random()*9000)+1000)}` : data.noBukti;
    onSave({ ...form, noBukti:finalNo, details:cleanDetails });
  };

  const req = <span style={{color:'var(--danger)'}}>*</span>;
  const kategoriOpts = BRG_KATEGORI_OPTS.filter(k => ['BAKU','JADI','LAIN'].includes(k.kode));
  const modalTitle = isCreate ? 'Buat Opname' : isEdit ? `Edit Opname — ${form.noBukti}` : `Opname — ${form.noBukti}`;

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{maxWidth:1300, maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>{modalTitle}</h2><div className="sub">{isView ? brgBatalPill(form.batal) : 'Pastikan semua kolom bertanda (*) terisi.'}</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={{overflowY:'auto', maxHeight:'calc(92vh - 180px)', padding:'16px 24px'}}>
          {form.batal && <BrgAlasanBatal alasan={form.alasanBatal} />}
          <div className="panel">
            <h3>Informasi Opname</h3>
            <div className="form-grid-3" style={{gap:12}}>
              {isView ? (
                <BrgViewField label="No Bukti" value={form.noBukti} mono />
              ) : (
                <div className="field">
                  <label>No Bukti {req}</label>
                  {isCreate ? (
                    <>
                      <input ref={noBuktiRef} className="input mono" type="text" value={noBuktiRaw} onChange={e=>handleNoBuktiChange(e.target.value)} placeholder="Ketik F atau K" maxLength={1} />
                      {noBuktiError && <div className="no-bukti-alert">{noBuktiError}</div>}
                    </>
                  ) : <input className="input mono" value={form.noBukti} readOnly />}
                </div>
              )}
              {isView ? <BrgViewField label="Tanggal" value={form.tglBukti} /> : (
                <div className="field"><label>Tanggal {req}</label><input className="input" type="date" disabled={noBuktiLocked} value={form.tglBukti} onChange={e=>set('tglBukti',e.target.value)}/></div>
              )}
              {isView ? <BrgViewField label="Kategori" value={brgKategoriNama(form.kodeKategori)} /> : (
                <div className="field"><label>Kategori {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeKategori} onChange={e=>set('kodeKategori',e.target.value)}>{kategoriOpts.map(k=><option key={k.kode} value={k.kode}>{k.nama}</option>)}</select></div>
              )}

              {isView ? <BrgViewField label="Gudang" value={brgGudangNama(form.kodeGudang)} /> : (
                <div className="form-grid-2" style={{gap:8}}>
                  <div className="field"><label>Gudang {req}</label><select className="select" disabled={noBuktiLocked} value={form.kodeGudang} onChange={e=>set('kodeGudang',e.target.value)}><option value="">Pilih Gudang</option>{BRG_GUDANG_OPTS.map(g=><option key={g.kode} value={g.kode}>{g.kode}</option>)}</select></div>
                  <div className="field"><label>&nbsp;</label><input className="input" value={brgGudangNama(form.kodeGudang)} readOnly placeholder="Gudang" /></div>
                </div>
              )}
              {isView ? <BrgViewField label="Keterangan" value={form.keterangan} /> : (
                <div className="field" style={{gridColumn:'span 2'}}><label>Keterangan {req}</label><textarea className="textarea" disabled={noBuktiLocked} value={form.keterangan} onChange={e=>set('keterangan',e.target.value)}/></div>
              )}
            </div>
          </div>
          <div className="panel" style={{marginTop:16}}>
            <OpnameBarangTable rows={form.details} setRows={v=>set('details', v)} onAddClick={()=>setPicker(true)} viewMode={isView} addLocked={noBuktiLocked} />
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            {isView && !form.batal && onRequestCancel && <button className="btn btn-danger" onClick={()=>onRequestCancel(form)}>{I.x(14)} Batalkan Transaksi</button>}
            {isView && !form.batal && <button className="btn btn-primary" onClick={enterEditMode}>{I.edit()} Edit</button>}
            {isEdit && <button className="btn" onClick={handleCancelEditClick}>Batalkan Perubahan</button>}
            <button className="btn" onClick={onClose}>Tutup</button>
            {!isView && <button className="btn btn-primary" onClick={handleSave}>{I.check()} Simpan</button>}
          </div>
        </div>
      </div>
      {picker && <OpnameItemPickerModal onConfirm={handlePickerConfirm} onCancel={()=>setPicker(false)} />}
      {confirmDiscard && (
        <ConfirmationModal
          title="Batalkan Perubahan"
          message="Perubahan yang belum disimpan akan hilang. Yakin ingin membatalkan perubahan?"
          confirmLabel="Ya, Batalkan"
          confirmKind="danger"
          requireReason={false}
          onCancel={()=>setConfirmDiscard(false)}
          onConfirm={discardChanges}
        />
      )}
    </div>
  );
}

function StockOpnamePage() {
  const [rows, setRows] = React.useState(STOCK_OPNAME);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null); // null | 'VIEW' | 'EDIT'
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);
  const closeModal = () => { setShowModal(false); setModal(null); setModalMode(null); };
  const save = (form) => {
    setRows(prev => modal ? prev.map(r => r.noBukti===modal.noBukti ? form : r) : [...prev, form]);
    window.__erpToast && window.__erpToast('Stock opname berhasil disimpan.');
    closeModal();
  };
  // Dipanggil dari icon "Batalkan Transaksi" di kolom Aksi list ATAU tombol di dalam modal.
  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, batal:true, alasanBatal: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.noBukti===updated.noBukti ? updated : r));
    window.__erpToast && window.__erpToast('Stock opname dibatalkan.');
    setConfirmCancel(null);
    closeModal();
  };
  return (
    <>
      <BrgTransList title="Stock Opname" rows={rows} addLabel="Opname Baru"
        onAdd={()=>{setModal(null); setShowModal(true); setModalMode(null);}}
        onView={(r)=>{setModal(r); setShowModal(true); setModalMode('VIEW');}}
        onEdit={(r)=>{setModal(r); setShowModal(true); setModalMode('EDIT');}}
        onCancel={(r)=>setConfirmCancel(r)}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(r)=>{setCetakRow(r); setShowCetak(true);}} />
      {showModal && <StockOpnameModal data={modal} initialMode={modalMode} onClose={closeModal} onSave={save} onRequestCancel={(r)=>setConfirmCancel(r)} />}
      {showCetak && (
        <BrgCetakModal docLabel="Stock Opname" rows={rows}
          columns={[{label:'Satuan'},{label:'Konversi', numeric:true},{label:'Saldo', numeric:true},{label:'Fisik', numeric:true}]}
          getItems={r => (r.details||[]).map(d => ({ kode:d.kodeItem, nama:d.namaItem, values:[d.satuan, d.konversi, d.saldo, d.fisik] }))}
          getGroupLabel={r => brgGudangNama(r.kodeGudang)}
          groupLabelText="Gudang"
          initialSelected={cetakRow ? [cetakRow.noBukti] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Opname "${confirmCancel.noBukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}
