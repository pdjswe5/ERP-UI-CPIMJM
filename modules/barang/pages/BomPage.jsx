// Barang — sub-modul BOM (Bill of Material): daftar resep produksi + dialog kelola komponennya.
// Menghubungkan Barang Jadi (BARANG_JADI) dengan komponen Bahan Baku (BAHAN_BAKU)/Penolong/Lain
// (keduanya dari BARANG_LAIN, dibedakan lewat kodeKategori) — lihat data/bom.data.jsx utk seed &
// resolver (brgBomFor/brgBomResolveKomponen/brgBomBuildBahanLines).
//
// Catatan arsitektur: sama seperti sub-modul Barang lain (BahanBakuPage dst.), state BOM di sini
// LOKAL ke komponen ini (tidak diangkat ke BarangPage) — konsisten dgn pola modul ini, tapi berarti
// BOM baru yang dibuat di sesi ini TIDAK otomatis kelihatan dari modul lain (mis. auto-fill Bahan
// di SPK, Manufaktur) yang membaca BRG_BOM_SEED secara langsung/statis — sama keterbatasannya
// dengan referensi lintas-modul lain di app ini (mis. Manufaktur baca PJ_PELANGGAN Penjualan tanpa
// ikut lihat perubahan sesi berjalan).

function BomList({ rows, onAdd, onEdit, onDelete }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => {
    if (!q) return true;
    const bj = BARANG_JADI.find(b => b.kodeProduk === r.kodeBarangJadi);
    const ql = q.toLowerCase();
    return r.kodeBarangJadi.toLowerCase().includes(ql) || (bj?.namaProduk || '').toLowerCase().includes(ql);
  });
  return (
    <>
      <BrgHeader title="BOM / Resep Produksi" sub={`Jumlah: ${filtered.length} resep`} onAdd={onAdd} addLabel="Tambah BOM" />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama barang jadi…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Kode Barang Jadi</th><th>Nama Barang Jadi</th><th className="num">Jml Komponen</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{textAlign:'center', padding:32, color:'var(--text-3)'}}>Belum ada BOM.</td></tr>
              )}
              {filtered.map(r => {
                const bj = BARANG_JADI.find(b => b.kodeProduk === r.kodeBarangJadi);
                return (
                  <tr key={r.kodeBarangJadi} onClick={()=>onEdit(r)}>
                    <td className="mono muted">{r.kodeBarangJadi}</td>
                    <td><span className="cell-link">{bj ? bj.namaProduk : <span className="muted">Barang tidak ditemukan</span>}</span></td>
                    <td className="num mono">{r.komponen.length}</td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit(r)}>{I.edit()}</button>
                        <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>onDelete(r)}>{I.trash()}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="pager"><div>Menampilkan <b>1</b>–<b>{filtered.length}</b> dari <b>{filtered.length}</b></div></div>
      </div>
    </>
  );
}

function BomBarangJadiPickerModal({ onPick, onCancel }) {
  const [q, setQ] = React.useState('');
  const filtered = BARANG_JADI.filter(b => !q ||
    b.kodeProduk.toLowerCase().includes(q.toLowerCase()) || b.namaProduk.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="modal-backdrop" style={{zIndex:200}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Pilih Barang Jadi</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
        <div className="modal-body">
          <div className="input-w-icon" style={{marginBottom:12}}>{I.search(14)}<input className="input" placeholder="Cari kode atau nama…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <div className="line-items picker-table" style={{maxHeight:400, overflowY:'auto'}}>
            <table>
              <thead><tr><th style={{width:'16%'}}>Kode</th><th>Nama</th><th style={{width:'20%'}}>Kategori</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={3} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(b => (
                  <tr key={b.kodeProduk} style={{cursor:'pointer'}} onClick={()=>onPick(b.kodeProduk)}>
                    <td className="mono">{b.kodeProduk}</td>
                    <td>{b.namaProduk}</td>
                    <td>{b.kodeKategori === 'JADIPU' ? 'Barang Jadi PU' : 'Barang Jadi'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot" style={{justifyContent:'flex-end'}}>
          <button className="btn" onClick={onCancel}>Batal</button>
        </div>
      </div>
    </div>
  );
}

// Popup multi-select komponen — gabungan BAHAN_BAKU + BARANG_LAIN (Penolong/Lain), pola checkbox
// sama seperti ItemPickerModal (components.jsx) / SaldoPickerModal (Keuangan).
function BomKomponenPickerModal({ excludeCodes, onConfirm, onCancel }) {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({});

  const allItems = React.useMemo(() => {
    const baku = BAHAN_BAKU.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk, jenisLabel:'Bahan Baku' }));
    const lain = BARANG_LAIN.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk, jenisLabel: b.kodeKategori === 'PENOLONG' ? 'Penolong' : 'Lain' }));
    return [...baku, ...lain].filter(it => !(excludeCodes || []).includes(it.kode));
  }, [excludeCodes]);

  const filtered = allItems.filter(it => !q ||
    it.kode.toLowerCase().includes(q.toLowerCase()) || it.nama.toLowerCase().includes(q.toLowerCase()));

  const toggle = (kode) => setSelected(prev => { const next = {...prev}; if (next[kode]) delete next[kode]; else next[kode] = true; return next; });
  const selectedCount = Object.keys(selected).length;
  const handleConfirm = () => onConfirm(allItems.filter(it => selected[it.kode]));

  return (
    <div className="modal-backdrop" style={{zIndex:210}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Pilih Komponen</h2><div className="sub">Centang satu atau lebih Bahan Baku/Penolong/Lain.</div></div>
          <button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div className="input-w-icon" style={{marginBottom:12}}>{I.search(14)}<input className="input" placeholder="Cari kode atau nama…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <div className="line-items picker-table" style={{maxHeight:400, overflowY:'auto'}}>
            <table>
              <thead><tr><th style={{width:32}}></th><th style={{width:'16%'}}>Jenis</th><th style={{width:'20%'}}>Kode</th><th>Nama</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={4} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(it => (
                  <tr key={it.kode} style={{cursor:'pointer'}} onClick={()=>toggle(it.kode)}>
                    <td onClick={e=>e.stopPropagation()}><input type="checkbox" className="cb" checked={!!selected[it.kode]} onChange={()=>toggle(it.kode)}/></td>
                    <td>{it.jenisLabel}</td>
                    <td className="mono">{it.kode}</td>
                    <td>{it.nama}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>{selectedCount} dipilih</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onCancel}>Batal</button>
            <button className="btn btn-primary" disabled={selectedCount===0} onClick={handleConfirm}>Pilih ({selectedCount})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BomDialog({ data, onClose, onSave }) {
  const isCreate = !data;
  const [kodeBarangJadi, setKodeBarangJadi] = React.useState(data?.kodeBarangJadi || '');
  const [komponen, setKomponen] = React.useState(() => (data?.komponen || []).map(k => ({...k})));
  const [showBjPicker, setShowBjPicker] = React.useState(false);
  const [showKomponenPicker, setShowKomponenPicker] = React.useState(false);

  const bj = BARANG_JADI.find(b => b.kodeProduk === kodeBarangJadi);

  const updateQty = (kodeKomponen, val) =>
    setKomponen(ls => ls.map(k => k.kodeKomponen === kodeKomponen ? {...k, qtyPerUnit: +val || 0} : k));
  const removeKomponen = (kodeKomponen) => setKomponen(ls => ls.filter(k => k.kodeKomponen !== kodeKomponen));
  const onKomponenPick = (picked) => {
    setKomponen(ls => [...ls, ...picked
      .filter(p => !ls.some(k => k.kodeKomponen === p.kode))
      .map(p => ({ kodeKomponen: p.kode, qtyPerUnit: 1 }))]);
    setShowKomponenPicker(false);
  };

  const handleSave = () => {
    if (!kodeBarangJadi || komponen.length === 0) return;
    onSave({ kodeBarangJadi, komponen });
  };

  return (
    <>
      <BrgModalShell title={isCreate ? 'Tambah BOM' : `Edit BOM — ${kodeBarangJadi}`}
        sub="Hubungkan Barang Jadi dengan komponen Bahan Baku/Penolong/Lain."
        onClose={onClose} onSave={handleSave} wide maxWidth={1120}
        saveDisabled={!kodeBarangJadi || komponen.length === 0}>
        <div className="field">
          <label>Barang Jadi *</label>
          <input className="input" readOnly disabled={!isCreate}
            style={{cursor: isCreate ? 'pointer' : 'default', background:'var(--bg-elev)'}}
            placeholder="— Pilih Barang Jadi —"
            value={bj ? `${bj.kodeProduk} — ${bj.namaProduk}` : kodeBarangJadi}
            onClick={() => { if (isCreate) setShowBjPicker(true); }} />
        </div>

        <div className="inline-table" style={{marginTop:20}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
            <h3 style={{margin:0}}>Komponen</h3>
            <button className="btn btn-primary btn-sm" disabled={!kodeBarangJadi} onClick={()=>setShowKomponenPicker(true)}>{I.plus()} Tambah Komponen</button>
          </div>
          <div className="line-items" style={{overflowX:'auto'}}>
            <table>
              <thead>
                <tr>
                  <th style={{width:'13%'}}>Jenis</th><th style={{width:'12%'}}>Kode</th><th>Nama</th>
                  <th style={{width:'14%'}} className="num">Qty / Unit</th><th style={{width:'9%'}}>Satuan</th><th style={{width:'6%'}}></th>
                </tr>
              </thead>
              <tbody>
                {komponen.length === 0 && (
                  <tr><td colSpan={6} className="empty">Belum ada komponen. Klik "+ Tambah Komponen".</td></tr>
                )}
                {komponen.map(k => {
                  const resolved = brgBomResolveKomponen(k.kodeKomponen);
                  return (
                    <tr key={k.kodeKomponen}>
                      <td style={{whiteSpace:'nowrap'}}>{resolved?.jenisLabel || '—'}</td>
                      <td className="mono">{k.kodeKomponen}</td>
                      <td>{resolved ? resolved.namaKomponen : <span className="muted">Tidak ditemukan</span>}</td>
                      <td className="num">
                        <input className="cell num" type="number" min="0" step="0.01"
                          value={k.qtyPerUnit} onChange={e=>updateQty(k.kodeKomponen, e.target.value)} />
                      </td>
                      <td>{resolved?.satuan || '—'}</td>
                      <td><button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>removeKomponen(k.kodeKomponen)}>{I.trash()}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </BrgModalShell>

      {showBjPicker && (
        <BomBarangJadiPickerModal onPick={(kode)=>{setKodeBarangJadi(kode); setShowBjPicker(false);}} onCancel={()=>setShowBjPicker(false)} />
      )}
      {showKomponenPicker && (
        <BomKomponenPickerModal excludeCodes={komponen.map(k=>k.kodeKomponen)} onConfirm={onKomponenPick} onCancel={()=>setShowKomponenPicker(false)} />
      )}
    </>
  );
}

function BomPage() {
  const [rows, setRows] = React.useState(BRG_BOM_SEED);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  const save = (form) => {
    setRows(prev => showModal === 2 ? prev.map(r => r.kodeBarangJadi === modal.kodeBarangJadi ? form : r) : [form, ...prev]);
    window.__erpToast && window.__erpToast('BOM berhasil disimpan.');
    setShowModal(false); setModal(null);
  };
  const deleteRow = () => {
    setRows(prev => prev.filter(r => r.kodeBarangJadi !== confirmDelete.kodeBarangJadi));
    window.__erpToast && window.__erpToast('BOM berhasil dihapus.');
    setConfirmDelete(null);
  };

  return (
    <>
      <BomList rows={rows} onAdd={()=>{setModal(null); setShowModal(1);}} onEdit={(r)=>{setModal(r); setShowModal(2);}} onDelete={setConfirmDelete} />
      {showModal && <BomDialog data={modal} onClose={()=>setShowModal(false)} onSave={save} />}
      {confirmDelete && (
        <ConfirmationModal
          title="Hapus BOM"
          message={`BOM untuk barang jadi "${confirmDelete.kodeBarangJadi}" akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus" confirmKind="danger" requireReason={false}
          onCancel={()=>setConfirmDelete(null)} onConfirm={deleteRow} />
      )}
    </>
  );
}
