// Barang — sub-modul Bahan Baku: list, modal, dan halaman. Dipindah dari root barang.jsx, tidak diubah.

function BahanBakuList({ rows, onAdd, onEdit, onDelete }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => !q || r.namaProduk.toLowerCase().includes(q.toLowerCase()) || r.kodeProduk.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <BrgHeader title="Bahan Baku" sub={`Jumlah: ${filtered.length} bahan baku`} onAdd={onAdd} addLabel="Tambah Bahan Baku" />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama bahan…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Kode Produk</th><th>Nama Produk</th><th>Warna</th><th>Tebal</th><th>Lebar</th><th>Satuan</th><th>HPP Standar</th><th>Status</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.kodeProduk} onClick={()=>onEdit(r)}>
                  <td className="mono muted">{r.kodeProduk}</td>
                  <td><span className="cell-link">{r.namaProduk}</span></td>
                  <td className="mono">{r.warna}</td>
                  <td className="mono">{r.tebal}</td>
                  <td className="mono">{r.lebar}</td>
                  <td className="mono">{r.satuan}</td>
                  <td className="mono">{fmtRp(r.hppStandar)}</td>
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

function BahanBakuModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const empty = { kodeProduk:'', namaProduk:'', kodeKategori:'BAKU', minimQty:0, hppStandar:0, namaProdukSupplier:'', tipeData:'F', warna:'', tebal:0, lebar:0, az:'', yield:'', slow:false, marketing:false, minimBhp:0, minimNon:0, koefisien:0, toleransi:0, margin:0, satuan:'PCS', aktif:true, keterangan:'' };
  const [form, setForm] = React.useState(data ? {...empty, ...data} : empty);
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  // Keterangan bersifat readonly, otomatis dirangkai dari nama Warna/AZ/Yield yang dipilih —
  // ditampilkan sebagai list unordered, bukan textarea bebas isi.
  const ketItems = [
    form.warna && `Warna: ${brgWarnaNama(form.warna)} (${form.warna})`,
    form.az && `AZ: ${brgAzNama(form.az)}`,
    form.yield && `Yield: ${brgYieldNama(form.yield)}`,
  ].filter(Boolean);
  const req = <span style={{color:'var(--danger)'}}>*</span>;
  const handleSave = () => onSave({ ...form, keterangan: ketItems.join('; ') });
  return (
    <BrgModalShell title={isEdit ? `Edit Bahan Baku — ${form.kodeProduk}` : 'Tambah Bahan Baku'} onClose={onClose} onSave={handleSave} wide>
      <div className="panel">
        <h3>Informasi Bahan Baku</h3>
        <div className="form-grid-3" style={{gap:24, alignItems:'start'}}>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field"><label>Nama Produk {req}</label><input className="input" value={form.namaProduk} onChange={e=>set('namaProduk',e.target.value)}/></div>
            <div className="field"><label>Nama Produk Supplier {req}</label><input className="input" value={form.namaProdukSupplier} onChange={e=>set('namaProdukSupplier',e.target.value)}/></div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Warna {req}</label><select className="select" value={form.warna} onChange={e=>set('warna',e.target.value)}><option value="">Pilih Warna</option>{BRG_WARNA_OPTS.map(w=><option key={w.kode} value={w.kode}>{w.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgWarnaNama(form.warna)} readOnly placeholder="Warna" /></div>
            </div>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>Satuan (Qty : 1) {req}</label><select className="select" value={form.satuan} onChange={e=>set('satuan',e.target.value)}>{BRG_SATUAN_OPTS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div className="field"><label>Tebal (Mm) {req}</label><input className="input mono" type="number" value={form.tebal} onChange={e=>set('tebal',+e.target.value)}/></div>
              <div className="field"><label>Lebar (Mm) {req}</label><input className="input mono" type="number" value={form.lebar} onChange={e=>set('lebar',+e.target.value)}/></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>AZ {req}</label><select className="select" value={form.az} onChange={e=>set('az',e.target.value)}><option value="">Pilih AZ</option>{BRG_AZ_OPTS.map(a=><option key={a.kode} value={a.kode}>{a.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgAzNama(form.az)} readOnly placeholder="AZ" /></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Yield {req}</label><select className="select" value={form.yield} onChange={e=>set('yield',e.target.value)}><option value="">Pilih Yield</option>{BRG_YIELD_OPTS.map(y=><option key={y.kode} value={y.kode}>{y.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgYieldNama(form.yield)} readOnly placeholder="Yield" /></div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field"><label>Kode Produk {req}</label><input className="input mono" value={form.kodeProduk} onChange={e=>set('kodeProduk',e.target.value)}/></div>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>Minimum Qty {req}</label><input className="input mono" type="number" value={form.minimQty} onChange={e=>set('minimQty',+e.target.value)}/></div>
              <div className="field"><label>Tipe Barang {req}</label><select className="select" value={form.tipeData} onChange={e=>set('tipeData',e.target.value)}><option value="F">F</option><option value="K">K</option></select></div>
              <div className="field"><label>Aktif {req}</label><select className="select" value={form.aktif ? '1':'0'} onChange={e=>set('aktif', e.target.value==='1')}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Buffer Stock BHP (Ton) {req}</label><input className="input mono" type="number" value={form.minimBhp} onChange={e=>set('minimBhp',+e.target.value)}/></div>
              <div className="field"><label>Buffer Stock NON (Ton) {req}</label><input className="input mono" type="number" value={form.minimNon} onChange={e=>set('minimNon',+e.target.value)}/></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Koefisien [Kg/M&apos;] {req}</label><input className="input mono" type="number" value={form.koefisien} onChange={e=>set('koefisien',+e.target.value)}/></div>
              <div className="field"><label>Toleransi (%) {req}</label><input className="input mono" type="number" value={form.toleransi} onChange={e=>set('toleransi',+e.target.value)}/></div>
            </div>
            <div className="field"><label>Margin (%) {req}</label><input className="input mono" type="number" value={form.margin} onChange={e=>set('margin',+e.target.value)}/></div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field">
              <label>Keterangan {req}</label>
              <div className="textarea" style={{background:'var(--bg-sub)', minHeight:88}}>
                {ketItems.length ? <ul style={{margin:0, paddingLeft:18}}>{ketItems.map((k,i)=><li key={i}>{k}</li>)}</ul> : <span className="muted">Otomatis dari Warna, AZ &amp; Yield</span>}
              </div>
            </div>
            <div className="field"><label>HPP Standar {req}</label><input className="input mono" type="number" value={form.hppStandar} onChange={e=>set('hppStandar',+e.target.value)}/></div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Marketing {req}</label><select className="select" value={form.marketing ? '1':'0'} onChange={e=>set('marketing', e.target.value==='1')}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
              <div className="field"><label>Slow Moving {req}</label><select className="select" value={form.slow ? '1':'0'} onChange={e=>set('slow', e.target.value==='1')}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
            </div>
          </div>
        </div>
      </div>
    </BrgModalShell>
  );
}

function BahanBakuPage() {
  const [rows, setRows] = React.useState(BAHAN_BAKU);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const save = (form) => {
    setRows(prev => showModal===2 ? prev.map(r => r.kodeProduk===modal.kodeProduk ? form : r) : [form, ...prev]);
    window.__erpToast && window.__erpToast('Bahan baku berhasil disimpan.');
    setShowModal(false); setModal(null);
  };
  const deleteRow = () => {
    setRows(prev => prev.filter(r => r.kodeProduk !== confirmDelete.kodeProduk));
    window.__erpToast && window.__erpToast('Bahan baku berhasil dihapus.');
    setConfirmDelete(null);
  };
  return (
    <>
      <BahanBakuList rows={rows} onAdd={()=>{setModal(null); setShowModal(1);}} onEdit={(r)=>{setModal(r); setShowModal(2);}} onDelete={setConfirmDelete} />
      {showModal && <BahanBakuModal data={modal} onClose={()=>setShowModal(false)} onSave={save} />}
      {confirmDelete && (
        <ConfirmationModal
          title="Hapus Bahan Baku"
          message={`Bahan baku "${confirmDelete.namaProduk}" (${confirmDelete.kodeProduk}) akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
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
