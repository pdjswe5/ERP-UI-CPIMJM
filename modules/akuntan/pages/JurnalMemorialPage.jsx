// Akuntan — Jurnal Memorial. Terima `akunRows` sebagai prop (bukan baca AKUN_BB global langsung)
// supaya dropdown akun & Cetak jurnal ikut akun yang sudah diedit user di sesi yang sama (pola
// sama seperti SalesOrderPage menerima konfirmasiList) — kalau Katalog Akun BB diedit tapi Jurnal
// baca AKUN_BB mentah, edit itu tidak akan pernah terlihat di sini walau masih dalam 1 sesi.

function JurnalMemorial({ rows, onAdd, onEdit, onCetak, onCetakRow }) {
  const [q, setQ] = React.useState('');
  const [periode, setPeriode] = React.useState('');
  const [status, setStatus] = React.useState('');
  const filtered = rows.filter(j => {
    if (q && !j.no.toLowerCase().includes(q.toLowerCase()) && !j.desc.toLowerCase().includes(q.toLowerCase())) return false;
    if (periode) {
      const parts = j.tgl.split('-'); // DD-MM-YYYY
      if (parts.length === 3 && `${parts[2]}-${parts[1]}` !== periode) return false;
    }
    if (status && j.status !== status) return false;
    return true;
  });
  const reset = () => { setQ(''); setPeriode(''); setStatus(''); };

  return (
    <>
      <AkHeader title="Jurnal Memorial" sub={`${filtered.length} jurnal · ${filtered.filter(j=>j.status==='Posted').length} posted`} onAdd={onAdd} addLabel="Jurnal Baru"
        extra={onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>} />
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No. atau deskripsi…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
          <div className="field"><label>Periode</label><input className="input" type="month" value={periode} onChange={e=>setPeriode(e.target.value)}/></div>
          <div className="field"><label>Status</label>
            <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">Semua</option>
              {AK_STATUS_JURNAL_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-actions"><button className="btn" onClick={reset}>Reset</button><button className="btn btn-primary">{I.filter()} Cari</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>{filtered.length}</b> jurnal · Total {fmtRp(filtered.reduce((s,j)=>s+j.total,0))}</div></div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:38}}><input type="checkbox" className="cb"/></th>
                <th>Tanggal</th>
                <th>No. Jurnal</th>
                <th>Deskripsi</th>
                <th>Pembuat</th>
                <th className="num">Total Rp</th>
                <th>Status</th>
                <th style={{width:100}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.no} onClick={()=>onEdit(j)}>
                  <td onClick={e=>e.stopPropagation()}><input type="checkbox" className="cb"/></td>
                  <td className="mono">{j.tgl}</td>
                  <td><span className="cell-link mono">{j.no}</span></td>
                  <td>{j.desc}</td>
                  <td className="muted">{j.pembuat}</td>
                  <td className="num mono">{fmtRp(j.total)}</td>
                  <td><span className={`pill ${j.status==='Posted'?'realisasi':j.status==='Pending'?'pending':'draft'}`}>{j.status}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" onClick={()=>onEdit(j)} title="Edit">{I.edit()}</button>
                      {onCetakRow && <button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>onCetakRow(j)}>{I.print()}</button>}
                      <button className="btn btn-icon btn-sm del" title="Batalkan (belum tersedia)" disabled>{I.trash()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function JurnalModal({ data, akunRows, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = React.useState(() => ({
    tgl: akToIso(data?.tgl) || new Date().toISOString().slice(0,10),
    no: data?.no || '',
    desc: data?.desc || '',
    status: data?.status || 'Draft',
    pembuat: data?.pembuat || 'PDJ Administrator',
  }));
  const [lines, setLines] = React.useState(() => data?.lines?.length ? data.lines.map(l=>({...l})) : [
    { id:1, akun:'', desc:'', d:0, k:0 },
    { id:2, akun:'', desc:'', d:0, k:0 },
  ]);
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const addLine = () => setLines(ls => [...ls, { id:Date.now(), akun:'', desc:'', d:0, k:0 }]);
  const updLine = (id, p) => setLines(ls => ls.map(l => l.id===id ? {...l, ...p} : l));
  const remLine = id => setLines(ls => ls.filter(l => l.id !== id));
  const totalD = lines.reduce((s,l)=>s+(+l.d||0), 0);
  const totalK = lines.reduce((s,l)=>s+(+l.k||0), 0);
  const balanced = totalD === totalK && totalD > 0;

  const handleSave = () => onSave({ ...form, tgl: akFromIso(form.tgl), total: totalD, lines });

  return (
    <AkModalShell wide title={isEdit?`Edit Jurnal — ${data.no}`:'Jurnal Memorial'}
      sub={isEdit?data.desc:'Buat jurnal manual untuk adjusment atau koreksi'}
      onClose={onClose} onSave={handleSave} saveDisabled={!balanced}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div className="form-section">
        <h4>Header Jurnal</h4>
        <div className="form-row-3">
          <div className="field"><label>Tanggal *</label><input className="input" type="date" value={form.tgl} onChange={e=>set('tgl',e.target.value)}/></div>
          <div className="field"><label>No. Jurnal</label><input className="input mono" value={isEdit ? form.no : 'Otomatis saat disimpan'} readOnly/></div>
          <div className="field"><label>Status</label><span className={`pill ${form.status==='Posted'?'realisasi':form.status==='Pending'?'pending':'draft'}`} style={{alignSelf:'center'}}>{form.status}</span></div>
        </div>
        <div className="field"><label>Deskripsi *</label><textarea className="textarea" value={form.desc} onChange={e=>set('desc',e.target.value)} placeholder="Penjelasan jurnal — mis. 'Penyusutan aktiva tetap April 2026'"/></div>

        <h4 style={{marginTop:14}}>Detail Jurnal
          <span style={{float:'right', fontWeight:400, fontSize:11.5, textTransform:'none', letterSpacing:0,
            color: balanced ? 'var(--realisasi)' : (totalD || totalK) ? 'var(--danger)' : 'var(--text-3)'}}>
            {balanced ? '✓ Balance' : (totalD || totalK) ? '⚠ Tidak Balance' : `${lines.length} baris`}
          </span>
        </h4>
        <div className="line-items">
          <table>
            <thead>
              <tr>
                <th style={{width:'34%'}}>Akun</th>
                <th>Deskripsi</th>
                <th className="num" style={{width:140}}>Debit Rp</th>
                <th className="num" style={{width:140}}>Kredit Rp</th>
                <th style={{width:38}}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.id}>
                  <td>
                    <select className="cell" value={l.akun} onChange={e=>updLine(l.id, {akun:e.target.value})}
                      style={{height:28, padding:'0 6px', border:'1px solid transparent', background:'transparent', borderRadius:4, width:'100%', fontSize:13}}>
                      <option value="">— Pilih akun —</option>
                      {(akunRows || AKUN_BB).map(a => <option key={a.kode} value={a.kode}>{a.kode} — {a.name}</option>)}
                    </select>
                  </td>
                  <td><input className="cell" placeholder="Deskripsi…" value={l.desc} onChange={e=>updLine(l.id, {desc:e.target.value})} style={{padding:'0 8px'}}/></td>
                  <td><input className="cell num" type="number" value={l.d} onChange={e=>updLine(l.id, {d:+e.target.value, k:0})}/></td>
                  <td><input className="cell num" type="number" value={l.k} onChange={e=>updLine(l.id, {k:+e.target.value, d:0})}/></td>
                  <td><button className="btn btn-icon btn-sm del" onClick={()=>remLine(l.id)} style={{color:'var(--text-3)'}}>{I.trash()}</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{padding:'10px 8px', textAlign:'right', fontWeight:600, fontSize:12, textTransform:'uppercase', letterSpacing:'.04em', color:'var(--text-2)'}}>Total</td>
                <td className="num mono" style={{padding:'10px 8px', fontWeight:600, color:'var(--text)'}}>{fmtRp(totalD)}</td>
                <td className="num mono" style={{padding:'10px 8px', fontWeight:600, color:'var(--text)'}}>{fmtRp(totalK)}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={2} style={{padding:'4px 8px', textAlign:'right', fontSize:11.5, color:'var(--text-3)'}}>Selisih</td>
                <td colSpan={2} className="num mono" style={{padding:'4px 8px', fontSize:12, fontWeight:500, color: balanced?'var(--realisasi)':'var(--danger)'}}>
                  {balanced?'Rp 0 — Balance':fmtRp(Math.abs(totalD-totalK))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div className="add-row">
            <button className="btn btn-ghost btn-sm" onClick={addLine}>{I.plus()} Tambah Baris</button>
          </div>
        </div>
      </div>
    </AkModalShell>
  );
}

function akNextJurnalNo(rows) {
  const nums = rows.map(r => parseInt((r.no.match(/(\d+)$/) || [])[1] || '0', 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `JM-2026-${String(next).padStart(4,'0')}`;
}

function JurnalMemorialPage({ rows, setRows, akunRows }) {
  const [modal, setModal] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);

  const save = (form) => {
    const finalNo = form.no || akNextJurnalNo(rows);
    const saved = { ...form, no: finalNo };
    setRows(prev => prev.some(r => r.no === finalNo) ? prev.map(r => r.no === finalNo ? saved : r) : [...prev, saved]);
    setModal(null);
    window.__erpToast && window.__erpToast('Data berhasil disimpan.');
  };

  return (
    <>
      <JurnalMemorial rows={rows} onAdd={()=>setModal({})} onEdit={(d)=>setModal({data:d})}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(j)=>{setCetakRow(j); setShowCetak(true);}} />
      {modal && <JurnalModal data={modal.data} akunRows={akunRows} onClose={()=>setModal(null)} onSave={save} />}
      {showCetak && (
        <AkCetakModal variant="jurnal" docLabel="Jurnal Memorial" rows={rows} noKey="no" tglKey="tgl" akunRows={akunRows}
          statusFilter={{ options: AK_STATUS_JURNAL_OPTS.map(s => ({ value:s, label:s })), match:(r,v) => r.status === v }}
          getGroupLabel={r => r.pembuat}
          initialSelected={cetakRow ? [cetakRow.no] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
    </>
  );
}
