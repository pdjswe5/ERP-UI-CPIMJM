// Akuntan — Katalog Akun Buku Besar (Chart of Accounts). Tidak dapat fitur Cetak (konsisten
// dengan Katalog Pemasok/Katalog Pelanggan di Pembelian/Penjualan — katalog master data polos
// tidak pernah dapat Cetak, hanya dokumen transaksi/aktiva/jurnal yang dapat).

// "Kriteria" dulu dekoratif (select tanpa value/onChange) — kini benar-benar memfilter, memetakan
// tiap opsi ke field `tipe`/`grup` yang sesuai (dicek langsung dari data: Kas/Bank pakai `tipe`,
// sisanya pakai rentang `grup` — lihat panel "Komposisi Akun BB per Grup" di AkuntanDashboard).
const AK_KRITERIA_AKUN_MAP = {
  kas:        a => a.tipe === 'K' || a.tipe === 'KAS',
  bank:       a => a.tipe === 'BANK',
  aktiva:     a => a.grup === '10' || a.grup === '15',
  hutang:     a => a.grup === '20',
  pendapatan: a => a.grup === '40',
  beban:      a => a.grup === '50' || a.grup === '60',
};

function KatalogAkunBB({ rows, onAdd, onEdit }) {
  const [q, setQ] = React.useState('');
  const [kriteria, setKriteria] = React.useState('');
  const filtered = rows
    .filter(a => !kriteria || (AK_KRITERIA_AKUN_MAP[kriteria] && AK_KRITERIA_AKUN_MAP[kriteria](a)))
    .filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.kode.includes(q));
  return (
    <>
      <AkHeader title="Katalog Akun Buku Besar" sub={`Jumlah: ${filtered.length}`} onAdd={onAdd} addLabel="Tambah Item" />
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Kriteria</label>
            <select className="select" value={kriteria} onChange={e=>setKriteria(e.target.value)}>
              <option value="">Semua</option>
              <option value="kas">Kas</option><option value="bank">Bank</option><option value="aktiva">Aktiva</option>
              <option value="hutang">Hutang</option><option value="pendapatan">Pendapatan</option><option value="beban">Beban</option>
            </select>
          </div>
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Nama atau kode akun…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
          <div className="filter-actions"><button className="btn">Pilih Kolom</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:'30%'}}>Nama Akun</th>
                <th>Kode Akun</th>
                <th>Tipe</th>
                <th>Grup</th>
                <th>Sub Grup</th>
                <th>Keterangan</th>
                <th className="center" style={{width:60}}>Aktif</th>
                <th style={{width:100}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.kode} onClick={()=>onEdit(a)}>
                  <td><span className="cell-link">{a.name}</span></td>
                  <td className="mono cell-link">{a.kode}</td>
                  <td>{a.tipe || <span className="muted">—</span>}</td>
                  <td className="mono">{a.grup}</td>
                  <td className="mono cell-link">{a.subgrup}</td>
                  <td>{a.ket ? <span className="cell-link">{a.ket}</span> : <span className="muted">—</span>}</td>
                  <td className="center">{a.aktif ? <span>{I.check(14)}</span> : <span className="muted">—</span>}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" onClick={()=>onEdit(a)} title="Edit">{I.edit()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <div>Jumlah: <b style={{color:'var(--text)'}}>{filtered.length}</b></div>
          <div className="pager-pages"><button className="active">1</button></div>
          <div>Tampilkan <b style={{color:'var(--text)'}}>50</b> per halaman</div>
        </div>
      </div>
    </>
  );
}

function AkunBBModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = React.useState(data || { name:'', kode:'', tipe:'', grup:'', subgrup:'', ket:'', aktif:true });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  return (
    <AkModalShell title={isEdit?`Edit Akun — ${data.kode}`:'Tambah Akun Buku Besar'}
      sub={isEdit?data.name:'Buat akun baru di chart of accounts'}
      onClose={onClose} onSave={()=>onSave(form)}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan Akun'}>
      <div className="form-section">
        <div className="form-row">
          <div className="field"><label>Nama Akun *</label><input className="input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Contoh: KAS BESAR"/></div>
          <div className="field"><label>Kode Akun *</label><input className="input mono" value={form.kode} onChange={e=>set('kode',e.target.value)} placeholder="0000.000"/></div>
        </div>
        <div className="form-row-3">
          <div className="field"><label>Tipe</label>
            <select className="select" value={form.tipe} onChange={e=>set('tipe',e.target.value)}>
              <option value="">— Pilih —</option>
              {AK_TIPE_AKUN_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>Grup</label><input className="input mono" value={form.grup} onChange={e=>set('grup',e.target.value)} placeholder="00"/></div>
          <div className="field"><label>Sub Grup</label><input className="input mono" value={form.subgrup} onChange={e=>set('subgrup',e.target.value)} placeholder="0000"/></div>
        </div>
        <div className="field"><label>Keterangan</label><textarea className="textarea" value={form.ket} onChange={e=>set('ket',e.target.value)}/></div>
        <div className="field">
          <label>Status</label>
          <label style={{display:'inline-flex', alignItems:'center', gap:8, fontSize:13, marginTop:6}}>
            <input type="checkbox" className="cb" checked={form.aktif} onChange={e=>set('aktif',e.target.checked)}/> Akun Aktif
          </label>
        </div>
      </div>
    </AkModalShell>
  );
}

function KatalogAkunPage({ rows, setRows }) {
  const [modal, setModal] = React.useState(null); // null | {} (create) | {data} (edit)

  const save = (form) => {
    setRows(prev => prev.some(r => r.kode === form.kode) ? prev.map(r => r.kode === form.kode ? form : r) : [...prev, form]);
    setModal(null);
    window.__erpToast && window.__erpToast('Data berhasil disimpan.');
  };

  return (
    <>
      <KatalogAkunBB rows={rows} onAdd={()=>setModal({})} onEdit={(d)=>setModal({data:d})} />
      {modal && <AkunBBModal data={modal.data} onClose={()=>setModal(null)} onSave={save} />}
    </>
  );
}
