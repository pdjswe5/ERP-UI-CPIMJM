// Barang — sub-modul Barang Lain: list, modal, dan halaman.
//
// Form dirombak (lihat plan redesain Barang Lain): field header disederhanakan jadi Nama/Kode
// Produk, Kategori (dibatasi 4 opsi: Lain/Penolong/Spare/Tools via BRG_KATEGORI_LAIN_OPTS),
// Tipe Barang (F/K saja), Aktif, Minimum Stock (min 1), Keterangan (wajib) — field hppStandar
// dan satuan tunggal dihapus, digantikan tabel "Satuan & Konversi" (banyak baris per produk,
// masing-masing punya Satuan+Isi+Harga Jual+Status sendiri via BrgInlineTable kolom select).

function BarangLainList({ rows, onAdd, onEdit, onDelete }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => !q || r.namaProduk.toLowerCase().includes(q.toLowerCase()) || r.kodeProduk.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <BrgHeader title="Barang Lain" sub={`Jumlah: ${filtered.length} barang`} onAdd={onAdd} addLabel="Tambah Barang Lain" />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Kode Produk</th><th>Nama Produk</th><th>Kategori</th><th>Tipe</th><th>Minimum Stock</th><th className="num">Jml Satuan</th><th>Status</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.kodeProduk} onClick={()=>onEdit(r)}>
                  <td className="mono muted">{r.kodeProduk}</td>
                  <td><span className="cell-link">{r.namaProduk}</span></td>
                  <td>{brgKategoriNama(r.kodeKategori)}</td>
                  <td className="mono">{r.tipeData}</td>
                  <td className="mono">{r.minimQty}</td>
                  <td className="num mono">{(r.satuanKonversi || []).length}</td>
                  <td>{brgAktifPill(r.aktif)}</td>
                  <td onClick={e=>e.stopPropagation()}><div className="row-actions"><button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit(r)}>{I.edit()}</button><button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>onDelete(r)}>{I.trash()}</button></div></td>
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

function BarangLainModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const empty = { kodeProduk:'', namaProduk:'', kodeKategori:'LAIN', tipeData:'F', aktif:true, minimQty:1, keterangan:'', satuanKonversi:[] };
  const [form, setForm] = React.useState(() => {
    const base = data ? {...empty, ...data} : {...empty};
    if (!Array.isArray(base.satuanKonversi)) base.satuanKonversi = [];
    return base;
  });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const handleSave = () => {
    // Buang baris Satuan & Konversi yang ditandai _deleted (soft-delete) + strip flag
    // _deleted/_added sebelum disimpan — sama pola dengan tabel item Penjualan/Pembelian/Manufaktur.
    const cleanSatuan = form.satuanKonversi.filter(r => !r._deleted).map(({_deleted, _added, ...r}) => r);
    onSave({ ...form, satuanKonversi: cleanSatuan });
  };
  return (
    <BrgModalShell title={isEdit ? `Edit Barang Lain — ${form.kodeProduk}` : 'Tambah Barang Lain'} onClose={onClose} onSave={handleSave} wide>
      <div className="panel">
        <h3>Informasi Persediaan</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:12}}>
          <div className="field"><label>Nama Produk <span style={{color:'var(--danger)'}}>*</span></label><input className="input" value={form.namaProduk} onChange={e=>set('namaProduk',e.target.value)}/></div>
          <div className="field"><label>Kode Produk <span style={{color:'var(--danger)'}}>*</span></label><input className="input mono" value={form.kodeProduk} onChange={e=>set('kodeProduk',e.target.value)}/></div>
          <div className="field"><label>Kategori <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.kodeKategori} onChange={e=>set('kodeKategori',e.target.value)}>{BRG_KATEGORI_LAIN_OPTS.map(k=><option key={k.kode} value={k.kode}>{k.nama}</option>)}</select></div>
          <div className="field"><label>Tipe Barang <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.tipeData} onChange={e=>set('tipeData',e.target.value)}><option value="F">F</option><option value="K">K</option></select></div>
          <div className="field"><label>Aktif <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.aktif ? '1' : '0'} onChange={e=>set('aktif', e.target.value==='1')}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
          <div className="field"><label>Minimum Stock <span style={{color:'var(--danger)'}}>*</span></label><input className="input mono" type="number" min={1} value={form.minimQty} onChange={e=>set('minimQty', Math.max(1, +e.target.value || 1))}/></div>
          <div className="field" style={{gridColumn:'span 2'}}><label>Keterangan <span style={{color:'var(--danger)'}}>*</span></label><textarea className="textarea" value={form.keterangan} onChange={e=>set('keterangan',e.target.value)}/></div>
        </div>
      </div>
      <div className="panel" style={{marginTop:16}}>
        <BrgInlineTable
          title="Satuan & Konversi"
          columns={[
            { key:'kodeSatuan', label:'Satuan', type:'select', width:140, options: () => BRG_SATUAN_KONVERSI_OPTS.map(s => ({ value:s.kode, label:s.nama })) },
            { key:'isi', label:'Isi', type:'number', num:true, width:100 },
            { key:'hargaJual', label:'Harga Jual', type:'currency', width:160 },
            { key:'aktif', label:'Status', type:'select', width:130, default:'1', options:[{value:'1',label:'Aktif'},{value:'0',label:'Non-aktif'}] },
          ]}
          rows={form.satuanKonversi}
          setRows={v => set('satuanKonversi', v)}
          addLabel="Item"
          softDelete
        />
      </div>
    </BrgModalShell>
  );
}

function BarangLainPage() {
  const [rows, setRows] = React.useState(BARANG_LAIN);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const save = (form) => {
    setRows(prev => showModal===2 ? prev.map(r => r.kodeProduk===modal.kodeProduk ? form : r) : [form, ...prev]);
    window.__erpToast && window.__erpToast('Barang lain berhasil disimpan.');
    setShowModal(false); setModal(null);
  };
  const deleteRow = () => {
    setRows(prev => prev.filter(r => r.kodeProduk !== confirmDelete.kodeProduk));
    window.__erpToast && window.__erpToast('Barang lain berhasil dihapus.');
    setConfirmDelete(null);
  };
  return (
    <>
      <BarangLainList rows={rows} onAdd={()=>{setModal(null); setShowModal(1);}} onEdit={(r)=>{setModal(r); setShowModal(2);}} onDelete={setConfirmDelete} />
      {showModal && <BarangLainModal data={modal} onClose={()=>setShowModal(false)} onSave={save} />}
      {confirmDelete && (
        <ConfirmationModal
          title="Hapus Barang Lain"
          message={`Barang "${confirmDelete.namaProduk}" (${confirmDelete.kodeProduk}) akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus"
          confirmKind="danger"
          requireReason={false}
          onCancel={()=>setConfirmDelete(null)}
          onConfirm={deleteRow}
        />
      )}
    </>
  );
}
