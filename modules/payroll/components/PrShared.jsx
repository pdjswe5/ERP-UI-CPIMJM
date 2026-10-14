// Payroll — komponen generik bersama (list+modal master data kecil, pill-tab scroll-spy), kloning
// module-local dari pola KLSimpleCatalog/KLGenericModal/KLPillTabs (katalog-lain.jsx) — konsisten
// dgn cara tiap modul lain punya *Shared.jsx sendiri (PjModalShell/PbModalShell/BrgShared/AkShared/
// KuShared), bukan cross-import lintas modul. Beda dari versi awal KLSimpleCatalog sesi ini: tombol
// Hapus di sini LANGSUNG diwire benar dari awal (ConfirmationModal + hard delete), tidak lewat fase
// "tombol ada tapi tidak ngapa-ngapain" yang sempat jadi bug di 9 halaman Katalog Lain.

function prAktifPill(aktif) { return <span className={`pill ${aktif ? 'approved' : 'cancelled'}`}>{aktif ? 'Aktif' : 'Non-aktif'}</span>; }

// Dipakai lintas halaman (Absensi, Produksi Harian, Penggajian) — ditaruh di sini (bukan di salah
// satu halaman) supaya tidak bergantung urutan <script> antar halaman yang saling butuh helper ini.
function prKaryawanLabel(noInduk) {
  const k = PR_KARYAWAN.find(x => x.noInduk === noInduk);
  return k ? `${k.noInduk} - ${k.nama}` : noInduk;
}

function prKodeDivisiLabel(kode) { return PR_DIVISI.find(d=>d.kode===kode)?.nama || kode; }
function prKodeBagianLabel(kode) { return PR_BAGIAN.find(b=>b.kode===kode)?.nama || kode; }

// Mutasi yg berlaku pd suatu tanggal (baris Mutasi Karyawan terakhir dgn tanggal <= periodeAkhirIso)
// — dipakai Absensi (resolve Divisi/Bagian historis per tanggal absen) & kedua halaman Proses
// Penggajian (resolve Komponen Gaji aktif per akhir periode). Disatukan di sini (bukan didefinisikan
// ulang di tiap halaman) supaya tidak ada 3 salinan yg bisa saling drift.
function prMutasiAktif(noInduk, mutasiRows, periodeAkhirIso) {
  return mutasiRows
    .filter(m => m.noInduk === noInduk && m.tanggal <= periodeAkhirIso)
    .sort((a,b) => b.tanggal.localeCompare(a.tanggal))[0] || null;
}

function PrPillTabs({ tabs, active, onSelect }) {
  return (
    <div style={{display:'flex', gap:8, flexWrap:'wrap', padding:'12px 0 20px', position:'sticky', top:0, background:'var(--bg)', zIndex:5}}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onSelect(t.id)} style={{
          padding:'6px 16px', borderRadius:999, border:'1px solid var(--border)', fontSize:13, fontWeight:500,
          background: active===t.id ? 'var(--primary)' : 'var(--bg-sub)',
          color: active===t.id ? '#fff' : 'var(--text)', cursor:'pointer',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function PrGenericModal({ moduleTitle, data, fields, formCols=2, onClose, onSave }) {
  const isEdit = !!data;
  const empty = Object.fromEntries(fields.map(f => [f.key, f.type === 'aktif' ? true : f.type === 'number' ? 0 : '']));
  const [form, setForm] = React.useState(data ? {...empty, ...data} : empty);
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:720}}>
        <div className="modal-head">
          <div><h2>{isEdit ? `Edit ${moduleTitle}` : `Tambah ${moduleTitle}`}</h2><div className="sub">Pastikan semua kolom bertanda (*) terisi.</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div className={`form-grid-${formCols}`} style={{gap:12}}>
            {fields.map(f => {
              const spanStyle = f.span ? {gridColumn:`span ${f.span}`} : {};
              if (f.type === 'aktif') {
                return (
                  <div className="field" style={spanStyle} key={f.key}>
                    <label>Status</label>
                    <select className="select" value={form[f.key] ? '1' : '0'} onChange={e=>set(f.key, e.target.value === '1')}>
                      <option value="1">Aktif</option><option value="0">Non-aktif</option>
                    </select>
                  </div>
                );
              }
              if (f.type === 'select') {
                const opts = typeof f.options === 'function' ? f.options() : f.options;
                return (
                  <div className="field" style={spanStyle} key={f.key}>
                    <label>{f.label}{f.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
                    <select className="select" value={form[f.key]} onChange={e=>set(f.key, e.target.value)}>
                      <option value="">— Pilih —</option>
                      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                );
              }
              if (f.type === 'textarea') {
                return (
                  <div className="field" style={spanStyle} key={f.key}>
                    <label>{f.label}</label>
                    <textarea className="textarea" value={form[f.key]} onChange={e=>set(f.key, e.target.value)}/>
                  </div>
                );
              }
              return (
                <div className="field" style={spanStyle} key={f.key}>
                  <label>{f.label}{f.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
                  <input
                    className={`input ${f.mono ? 'mono' : ''}`}
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : 'text'}
                    disabled={f.disabled}
                    value={form[f.key]}
                    onChange={e=>set(f.key, f.type === 'number' ? +e.target.value : e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={()=>onSave(form)}>{I.check()} Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrSimpleCatalog({ moduleTitle, addLabel='Tambah Data', initialRows, keyField, listColumns, fields, formCols=2, note }) {
  const [rows, setRows] = React.useState(initialRows);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [pendingDelete, setPendingDelete] = React.useState(null);
  const filtered = rows.filter(r => !q || listColumns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q.toLowerCase())));
  const openAdd = () => { setModal(null); setShowModal(1); };
  const openEdit = (r) => { setModal(r); setShowModal(2); };
  const save = (form) => {
    setRows(prev => showModal === 2 ? prev.map(r => r[keyField] === modal[keyField] ? form : r) : [...prev, form]);
    window.__erpToast && window.__erpToast(`${moduleTitle} berhasil disimpan.`);
    setShowModal(false); setModal(null);
  };
  return (
    <>
      <div className="page-head">
        <div><h1>{moduleTitle}</h1><div className="sub">{`Jumlah: ${filtered.length} data${note ? ' · ' + note : ''}`}</div></div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-primary" onClick={openAdd}>{I.plus()} {addLabel}</button>
        </div>
      </div>
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr>{listColumns.map(c => <th key={c.key}>{c.label}</th>)}<th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r[keyField]} onClick={()=>openEdit(r)}>
                  {listColumns.map((c,i) => (
                    <td key={c.key} className={c.mono ? 'mono' : ''}>
                      {c.render ? c.render(r[c.key], r) : i === 0 ? <span className="cell-link">{r[c.key]}</span> : (r[c.key] ?? <span className="muted">—</span>)}
                    </td>
                  ))}
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
      {showModal && <PrGenericModal moduleTitle={moduleTitle} data={modal} fields={fields} formCols={formCols} onClose={()=>setShowModal(false)} onSave={save} />}
      {pendingDelete && (
        <ConfirmationModal
          title="Hapus Data?" message={`Data "${pendingDelete[keyField]}" akan dihapus permanen dari ${moduleTitle}.`}
          confirmLabel="Hapus" confirmKind="danger" requireReason={false}
          onCancel={()=>setPendingDelete(null)}
          onConfirm={()=>{
            setRows(prev => prev.filter(x => x[keyField] !== pendingDelete[keyField]));
            window.__erpToast && window.__erpToast(`${moduleTitle} berhasil dihapus.`);
            setPendingDelete(null);
          }} />
      )}
    </>
  );
}
