// Akuntan — Katalog Aktiva (fixed assets). Dapat fitur Cetak (AkCetakModal variant="aktiva") —
// beda dari Katalog Akun BB karena Aktiva adalah dokumen bernilai (harga perolehan/penyusutan/
// nilai buku) yang lazim dicetak sebagai kartu aktiva, bukan sekadar master data referensi.

const AK_AKTIVA_STATUS_FILTER = {
  options: [{ value:'true', label:'Aktif' }, { value:'false', label:'Non-aktif' }],
  match: (r, v) => String(r.aktif) === v,
};

function KatalogAktiva({ rows, onAdd, onEdit, onCetak, onCetakRow }) {
  const [q, setQ] = React.useState('');
  const [kategori, setKategori] = React.useState('');
  const filtered = rows
    .filter(a => !kategori || a.kategori === kategori)
    .filter(a => !q || a.nama.toLowerCase().includes(q.toLowerCase()) || a.kode.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <AkHeader title="Katalog Aktiva" sub={`${filtered.length} aktiva · ${filtered.filter(a=>a.aktif).length} aktif`} onAdd={onAdd} addLabel="Tambah Item"
        extra={onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>} />
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Kriteria</label>
            <select className="select" value={kategori} onChange={e=>setKategori(e.target.value)}>
              <option value="">Semua</option>
              {AK_KATEGORI_AKTIVA_OPTS.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
            </select>
          </div>
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama aktiva…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
          <div className="filter-actions"><button className="btn">Pilih Kolom</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Kode Produk</th>
                <th>Nama Produk</th>
                <th className="center" style={{width:60}}>Aktif</th>
                <th>Tgl. Jual</th>
                <th>Tgl. Beli</th>
                <th>No. Bukti</th>
                <th>No. Kelompok</th>
                <th>Compro Nama</th>
                <th>Kode Kategori</th>
                <th className="num">Harga Perolehan</th>
                <th className="num">Akm. Penyusutan</th>
                <th className="num">Nilai Buku</th>
                <th style={{width:100}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.kode} onClick={()=>onEdit(a)}>
                  <td className="mono cell-link">{a.kode}</td>
                  <td>{a.nama}</td>
                  <td className="center">{a.aktif ? <span>{I.check(14)}</span> : <span className="muted">—</span>}</td>
                  <td className="mono">{a.tglJual || <span className="muted">—</span>}</td>
                  <td className="mono">{a.tglBeli}</td>
                  <td className="mono cell-link">{a.noBukti}</td>
                  <td className="mono">{a.noKelompok}</td>
                  <td>{a.compro}</td>
                  <td className="mono">{a.kategori}</td>
                  <td className="num mono">{fmtRp(a.harga)}</td>
                  <td className="num mono" style={{color:'var(--text-3)'}}>{fmtRp(a.susut)}</td>
                  <td className="num mono" style={{fontWeight:600}}>{fmtRp(a.nilai)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" onClick={()=>onEdit(a)} title="Edit">{I.edit()}</button>
                      {onCetakRow && <button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>onCetakRow(a)}>{I.print()}</button>}
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
          <div>Tampilkan <b style={{color:'var(--text)'}}>25</b> per halaman</div>
        </div>
      </div>
    </>
  );
}

function AktivaModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = React.useState(() => {
    const base = data || { kode:'', nama:'', aktif:true, tglBeli:'', tglJual:'', noBukti:'', noKelompok:'', compro:'PT Pacific Data', kategori:'', harga:0, susut:0, nilai:0 };
    return { ...base, tglBeli: akToIso(base.tglBeli), tglJual: akToIso(base.tglJual) };
  });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const handleSave = () => onSave({ ...form, tglBeli: akFromIso(form.tglBeli), tglJual: akFromIso(form.tglJual) });
  return (
    <AkModalShell wide title={isEdit?`Edit Aktiva — ${data.kode}`:'Tambah Aktiva Tetap'}
      sub={isEdit?data.nama:'Daftarkan aktiva tetap baru beserta jadwal penyusutan'}
      onClose={onClose} onSave={handleSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan Aktiva'}>
      <div className="form-grid-2" style={{gap:24}}>
        <div className="form-section">
          <h4>Identitas Aktiva</h4>
          <div className="form-row">
            <div className="field"><label>Kode Produk *</label><input className="input mono" value={form.kode} onChange={e=>set('kode',e.target.value)} placeholder="AT-XXX"/></div>
            <div className="field"><label>Kode Kategori</label>
              <select className="select" value={form.kategori} onChange={e=>set('kategori',e.target.value)}>
                <option value="">— Pilih —</option>
                {AK_KATEGORI_AKTIVA_OPTS.map(k => <option key={k.kode} value={k.kode}>{k.kode} — {k.nama}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Nama Produk *</label><input className="input" value={form.nama} onChange={e=>set('nama',e.target.value)}/></div>
          <div className="form-row">
            <div className="field"><label>No. Kelompok</label><input className="input mono" value={form.noKelompok} onChange={e=>set('noKelompok',e.target.value)}/></div>
            <div className="field"><label>Compro Nama</label><input className="input" value={form.compro} onChange={e=>set('compro',e.target.value)}/></div>
          </div>
          <div className="field"><label>Status</label>
            <label style={{display:'inline-flex', alignItems:'center', gap:8, fontSize:13, marginTop:6}}>
              <input type="checkbox" className="cb" checked={form.aktif} onChange={e=>set('aktif',e.target.checked)}/> Aktiva Aktif
            </label>
          </div>
        </div>

        <div className="form-section">
          <h4>Pembelian & Penyusutan</h4>
          <div className="form-row">
            <div className="field"><label>Tgl. Beli *</label><input className="input" type="date" value={form.tglBeli} onChange={e=>set('tglBeli',e.target.value)}/></div>
            <div className="field"><label>No. Bukti</label><input className="input mono" value={form.noBukti} onChange={e=>set('noBukti',e.target.value)}/></div>
          </div>
          <div className="field"><label>Harga Perolehan (Rp) *</label><input className="input mono" type="number" value={form.harga} onChange={e=>set('harga',+e.target.value)}/></div>
          <div className="form-row">
            <div className="field"><label>Akm. Penyusutan (Rp)</label><input className="input mono" type="number" value={form.susut} onChange={e=>set('susut',+e.target.value)}/></div>
            <div className="field"><label>Nilai Buku (Rp)</label><input className="input mono" type="number" value={form.nilai} onChange={e=>set('nilai',+e.target.value)}/></div>
          </div>
          <div className="field"><label>Tgl. Jual (jika dilepas)</label><input className="input" type="date" value={form.tglJual} onChange={e=>set('tglJual',e.target.value)}/></div>
        </div>
      </div>
    </AkModalShell>
  );
}

function AktivaPage({ rows, setRows }) {
  const [modal, setModal] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);

  const save = (form) => {
    setRows(prev => prev.some(r => r.kode === form.kode) ? prev.map(r => r.kode === form.kode ? form : r) : [...prev, form]);
    setModal(null);
    window.__erpToast && window.__erpToast('Data berhasil disimpan.');
  };

  return (
    <>
      <KatalogAktiva rows={rows} onAdd={()=>setModal({})} onEdit={(d)=>setModal({data:d})}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(a)=>{setCetakRow(a); setShowCetak(true);}} />
      {modal && <AktivaModal data={modal.data} onClose={()=>setModal(null)} onSave={save} />}
      {showCetak && (
        <AkCetakModal variant="aktiva" docLabel="Katalog Aktiva" rows={rows} noKey="kode" tglKey="tglBeli"
          statusFilter={AK_AKTIVA_STATUS_FILTER}
          initialSelected={cetakRow ? [cetakRow.kode] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
    </>
  );
}
