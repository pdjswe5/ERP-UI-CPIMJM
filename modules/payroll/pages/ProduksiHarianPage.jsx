// Payroll — Transaksi Produksi Harian: input borongan per karyawan per hari. Kode Kerja adalah FK
// ke Jenis Pekerjaan Borongan (Master Data Payroll) — pilih kode otomatis isi Divisi/Satuan/Harga
// per Satuan, Upah dihitung otomatis (Qty x Harga/Satuan, read-only) spt pola qty x harga garis item
// di modul lain (pjLineTotal/pbLineTotal). `rows`/`setRows` diangkat ke PayrollPage.jsx.

function prJenisKerja(kode) { return PR_JENIS_KERJA_BORONGAN.find(j => j.kode === kode); }

function ProduksiHarianModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const empty = { noInduk:'', tanggal:'', kodeKerja:'', qty:0 };
  const [form, setForm] = React.useState(data ? {...empty, ...data} : empty);
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const jenis = prJenisKerja(form.kodeKerja);
  const hargaSatuan = jenis?.hargaSatuan || 0;
  const upah = (form.qty || 0) * hargaSatuan;
  const canSave = form.noInduk && form.tanggal && form.kodeKerja && form.qty > 0;

  const save = () => onSave({ ...form, hargaSatuan, upah });

  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:640}}>
        <div className="modal-head">
          <div><h2>{isEdit ? 'Edit Produksi Harian' : 'Tambah Produksi Harian'}</h2><div className="sub">Pastikan semua kolom bertanda (*) terisi.</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="field" style={{gridColumn:'span 2'}}>
              <label>Karyawan <span style={{color:'var(--danger)'}}>*</span></label>
              <select className="select" value={form.noInduk} onChange={e=>set('noInduk', e.target.value)}>
                <option value="">— Pilih —</option>
                {PR_KARYAWAN.map(k => <option key={k.noInduk} value={k.noInduk}>{k.noInduk} - {k.nama}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tanggal <span style={{color:'var(--danger)'}}>*</span></label>
              <input className="input" type="date" value={form.tanggal} onChange={e=>set('tanggal', e.target.value)} />
            </div>
            <div className="field">
              <label>Kode Kerja <span style={{color:'var(--danger)'}}>*</span></label>
              <select className="select" value={form.kodeKerja} onChange={e=>set('kodeKerja', e.target.value)}>
                <option value="">— Pilih —</option>
                {PR_JENIS_KERJA_BORONGAN.filter(j=>j.aktif).map(j => <option key={j.kode} value={j.kode}>{j.kode} - {j.keterangan}</option>)}
              </select>
            </div>
            <div className="field"><label>Divisi</label><input className="input" disabled value={jenis ? prKodeDivisiLabel(jenis.kodeDivisi) : ''} /></div>
            <div className="field"><label>Satuan</label><input className="input" disabled value={jenis?.satuan || ''} /></div>
            <div className="field"><label>Harga/Satuan</label><input className="input" disabled value={fmtRp(hargaSatuan)} /></div>
            <div className="field"><label>Qty <span style={{color:'var(--danger)'}}>*</span></label><input className="input" type="number" value={form.qty} onChange={e=>set('qty', +e.target.value)} /></div>
            <div className="field"><label>Upah</label><input className="input mono" disabled value={fmtRp(upah)} /></div>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={save} disabled={!canSave}>{I.check()} Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollProduksiHarianPage({ rows, setRows }) {
  const [q, setQ] = React.useState('');
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState(null);

  const filtered = rows.filter(r => !q || prKaryawanLabel(r.noInduk).toLowerCase().includes(q.toLowerCase()) || r.tanggal.includes(q));

  const openAdd = () => { setModal(null); setShowModal(true); };
  const openEdit = (r) => { setModal(r); setShowModal(true); };
  const save = (form) => {
    setRows(prev => modal ? prev.map(r => r.id === modal.id ? { ...form, id: modal.id } : r) : [...prev, { ...form, id: `${form.noInduk}-${form.tanggal}-${Date.now()}` }]);
    window.__erpToast && window.__erpToast('Produksi harian berhasil disimpan.');
    setShowModal(false); setModal(null);
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Transaksi Produksi Harian</h1><div className="sub">Input hasil kerja borongan harian — dasar Proses Penggajian Borongan.</div></div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-primary" onClick={openAdd}>{I.plus()} Tambah Produksi</button>
        </div>
      </div>
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Nama, No Induk, atau tanggal…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Tanggal</th><th>Karyawan</th><th>Kode Kerja</th><th>Qty</th><th>Harga/Satuan</th><th>Upah</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={7} className="empty">Tidak ada data.</td></tr>}
              {filtered.slice().sort((a,b)=>b.tanggal.localeCompare(a.tanggal)).map(r => (
                <tr key={r.id} onClick={()=>openEdit(r)}>
                  <td className="mono">{r.tanggal}</td>
                  <td><span className="cell-link">{prKaryawanLabel(r.noInduk)}</span></td>
                  <td className="mono">{r.kodeKerja} - {prJenisKerja(r.kodeKerja)?.keterangan || ''}</td>
                  <td>{fmtNum(r.qty)} {prJenisKerja(r.kodeKerja)?.satuan || ''}</td>
                  <td>{fmtRp(r.hargaSatuan)}</td>
                  <td className="mono">{fmtRp(r.upah)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>openEdit(r)}>{I.edit()}</button>
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>setPendingDelete(r)}>{I.trash()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager"><div>Menampilkan <b>1</b>–<b>{filtered.length}</b> dari <b>{filtered.length}</b></div></div>
      </div>
      {showModal && <ProduksiHarianModal data={modal} onClose={()=>{setShowModal(false); setModal(null);}} onSave={save} />}
      {pendingDelete && (
        <ConfirmationModal
          title="Hapus Produksi Harian?" message={`Data produksi tanggal "${pendingDelete.tanggal}" akan dihapus permanen.`}
          confirmLabel="Hapus" confirmKind="danger" requireReason={false}
          onCancel={()=>setPendingDelete(null)}
          onConfirm={()=>{
            setRows(prev => prev.filter(x=>x.id!==pendingDelete.id));
            window.__erpToast && window.__erpToast('Produksi harian berhasil dihapus.');
            setPendingDelete(null);
          }} />
      )}
    </>
  );
}
