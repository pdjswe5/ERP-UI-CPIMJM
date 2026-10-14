// Pembelian — halaman Katalog Pemasok (master data, bukan dokumen transaksi)

// Pemasok cuma punya status Aktif/Non-aktif (boolean) — bukan alur dokumen DRAFT/APPROVED
// seperti pbStatusPill, jadi pakai pill khusus supaya tidak salah tampil "DRAFT".
function pemasokStatusPill(aktif) {
  return <span className={`pill ${aktif ? 'approved' : 'cancelled'}`}>{aktif ? 'Aktif' : 'Non-aktif'}</span>;
}

function PemasokList({ rows, onAdd, onView, onEdit, onDeactivate, onActivate }) {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const filtered = rows.filter(r => {
    if (q && !r.Nama_Supp.toLowerCase().includes(q.toLowerCase()) && !r.Kode_Supp.toLowerCase().includes(q.toLowerCase())) return false;
    if (status === 'aktif' && !r.Aktif) return false;
    if (status === 'nonaktif' && r.Aktif) return false;
    return true;
  });
  return (
    <>
      <PbHeader title="Katalog Pemasok" sub={`Jumlah: ${filtered.length} pemasok`} onAdd={onAdd} addLabel="Tambah Pemasok" />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Nama atau kode pemasok…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="field"><label>Status</label>
          <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Semua</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non-aktif</option>
          </select>
        </div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Kode</th><th>Nama Perusahaan</th><th>Kota</th><th>Telepon</th><th>Kontak</th><th>Tempo</th><th>Plafon</th><th>Status</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.Kode_Supp} onClick={()=>onView(r)}>
                  <td className="mono muted">{r.Kode_Supp}</td>
                  <td><span className="cell-link">{r.Nama_Supp}</span></td>
                  <td>{r.Kota || <span className="muted">—</span>}</td>
                  <td className="mono">{r.Telpon || <span className="muted">—</span>}</td>
                  <td>{r.Kontak || <span className="muted">—</span>}</td>
                  <td className="mono">{r.Tempo} hari</td>
                  <td className="mono">{fmtRp(r.Plafon)}</td>
                  <td>{pemasokStatusPill(r.Aktif)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit(r)}>{I.edit()}</button>
                      {r.Aktif ? (
                        <button className="btn btn-icon btn-sm del" title="Nonaktifkan" onClick={()=>onDeactivate(r)}>{I.trash()}</button>
                      ) : (
                        <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} title="Aktifkan Kembali" onClick={()=>onActivate(r)}>{I.refresh(14)}</button>
                      )}
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

function PemasokPage({ rows, setRows }) {
  const [modal, setModal] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null); // null (CREATE) | 'VIEW' | 'EDIT'
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(null);
  const [confirmActivate, setConfirmActivate] = React.useState(null);

  const save = (form) => {
    const normalized = { ...form, Aktif: form.Aktif === true || form.Aktif === 'true' };
    setRows(prev => modal ? prev.map(r => r.Kode_Supp===modal.Kode_Supp ? normalized : r) : [...prev, normalized]);
    window.__erpToast && window.__erpToast('Data pemasok berhasil disimpan.');
  };

  const openAdd = () => { setModal(null); setModalMode(null); setShow(true); };
  const openView = (r) => { setModal(r); setModalMode('VIEW'); setShow(true); };
  const openEdit = (r) => { setModal(r); setModalMode('EDIT'); setShow(true); };
  const closeModal = () => { setShow(false); setModal(null); setModalMode(null); };

  const deactivate = (reason) => {
    setRows(prev => prev.map(r => r.Kode_Supp===confirmDeactivate.Kode_Supp ? { ...r, Aktif:false, Alasan_Nonaktif: reason } : r));
    window.__erpToast && window.__erpToast(`Pemasok ${confirmDeactivate.Nama_Supp} dinonaktifkan.`);
    setConfirmDeactivate(null);
  };

  const activate = () => {
    setRows(prev => prev.map(x => x.Kode_Supp===confirmActivate.Kode_Supp ? { ...x, Aktif:true, Alasan_Nonaktif:'' } : x));
    window.__erpToast && window.__erpToast(`Pemasok ${confirmActivate.Nama_Supp} diaktifkan kembali.`);
    setConfirmActivate(null);
  };

  return (
    <>
      <PemasokList rows={rows} onAdd={openAdd} onView={openView} onEdit={openEdit} onDeactivate={(r)=>setConfirmDeactivate(r)} onActivate={(r)=>setConfirmActivate(r)} />
      {show && (
        <PbModalShell
          title="Pemasok"
          data={modal}
          tabs={pemasokModalTabs()}
          initialFields={['Kode_Supp','Nama_Supp']}
          initialMode={modalMode}
          onClose={closeModal}
          onSave={save}
        />
      )}
      {confirmDeactivate && (
        <ConfirmationModal
          title="Nonaktifkan Pemasok"
          message={`Pemasok "${confirmDeactivate.Nama_Supp}" akan dinonaktifkan dan tidak akan muncul sebagai pilihan pada dokumen baru. Data tetap tersimpan dan bisa diaktifkan kembali lewat form edit.`}
          confirmLabel="Nonaktifkan"
          confirmKind="danger"
          onCancel={()=>setConfirmDeactivate(null)}
          onConfirm={deactivate}
        />
      )}
      {confirmActivate && (
        <ConfirmationModal
          title="Aktifkan Kembali Pemasok"
          message={`Pemasok "${confirmActivate.Nama_Supp}" akan diaktifkan kembali dan muncul lagi sebagai pilihan pada dokumen baru.`}
          confirmLabel="Aktifkan"
          confirmKind="success"
          requireReason={false}
          onCancel={()=>setConfirmActivate(null)}
          onConfirm={activate}
        />
      )}
    </>
  );
}
