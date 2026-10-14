// Akuntan — 1 halaman generik dipakai 3x (Laba Rugi/Laporan Arus Kas/Neraca), dibedakan lewat
// config `report` (dari AK_LAPORAN_LIST) yang menentukan field ringkasan, mode periode
// (range/point), dan hasil hitung. Full CRUD (List + Modal, pola sama seperti menu lain), plus
// tombol Cetak yang membuka AkCetakModal variant="pdf" — kerangka popup sama dengan Aktiva/Jurnal
// (filter+checklist+zoom), tapi preview-nya iframe PDF referensi, bukan HTML digenerate dari data.

function LaporanKeuanganList({ report, rows, onAdd, onEdit, onCetak, onCetakRow }) {
  const [q, setQ] = React.useState('');
  const [status, setStatus] = React.useState('');
  const filtered = rows
    .filter(r => !status || r.status === status)
    .filter(r => !q || r.no.toLowerCase().includes(q.toLowerCase()) || r.keterangan.toLowerCase().includes(q.toLowerCase()));
  const reset = () => { setQ(''); setStatus(''); };
  const colCount = 6 + report.fields.length;

  return (
    <>
      <AkHeader title={report.label} sub={`${filtered.length} periode · ${filtered.filter(r=>r.status==='Final').length} final`} onAdd={onAdd} addLabel="Tambah Periode"
        extra={onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>} />
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No. atau keterangan…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
          <div className="field"><label>Status</label>
            <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">Semua</option>
              {AK_STATUS_LAPORAN_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-actions"><button className="btn" onClick={reset}>Reset</button><button className="btn btn-primary">{I.filter()} Cari</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>{filtered.length}</b> periode</div></div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>No.</th>
                <th>{report.periodMode==='point' ? 'Tanggal' : 'Periode'}</th>
                <th>Keterangan</th>
                {report.fields.map(f => <th key={f.key} className="num">{f.label}</th>)}
                <th className="num">{report.resultLabel}</th>
                <th>Status</th>
                <th style={{width:100}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={colCount} className="empty" style={{padding:'32px 16px', textAlign:'center', color:'var(--text-3)'}}>Belum ada data. Klik "Tambah Periode" untuk mulai.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.no} onClick={()=>onEdit(r)}>
                  <td className="mono cell-link">{r.no}</td>
                  <td className="mono">{report.periodMode==='point' ? r.tglAkhir : `${r.tglAwal} s/d ${r.tglAkhir}`}</td>
                  <td>{r.keterangan}</td>
                  {report.fields.map(f => <td key={f.key} className="num mono">{fmtRp(r[f.key])}</td>)}
                  <td className="num mono" style={{fontWeight:600}}>{fmtRp(r[report.resultKey])}</td>
                  <td><span className={`pill ${r.status==='Final'?'realisasi':'draft'}`}>{r.status}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" onClick={()=>onEdit(r)} title="Edit">{I.edit()}</button>
                      {onCetakRow && <button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>onCetakRow(r)}>{I.print()}</button>}
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

function LaporanKeuanganModal({ report, data, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = React.useState(() => {
    if (data) return { ...data };
    const base = { no:'', tglAwal:'', tglAkhir:'', keterangan:'', status:'Draft' };
    report.fields.forEach(f => { base[f.key] = 0; });
    base[report.resultKey] = 0;
    return base;
  });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const setDate = (which, isoVal) => {
    if (report.periodMode === 'point') setForm(f => ({...f, tglAwal: akFromIso(isoVal), tglAkhir: akFromIso(isoVal)}));
    else setForm(f => ({...f, [which]: akFromIso(isoVal)}));
  };
  const result = report.compute(form);
  const isBalanceCheck = report.id === 'neraca';

  const handleSave = () => onSave({ ...form, [report.resultKey]: result });

  return (
    <AkModalShell title={isEdit ? `Edit ${report.label} — ${data.no}` : `Tambah ${report.label}`}
      sub={isEdit ? data.keterangan : `Catat ringkasan ${report.label.toLowerCase()} untuk 1 periode`}
      onClose={onClose} onSave={handleSave} saveLabel={isEdit?'Simpan Perubahan':'Simpan'}>
      <div className="form-section">
        <div className="form-row-3">
          {report.periodMode === 'point' ? (
            <div className="field"><label>Tanggal *</label><input className="input" type="date" value={akToIso(form.tglAkhir)} onChange={e=>setDate('tglAkhir', e.target.value)}/></div>
          ) : (
            <>
              <div className="field"><label>Tgl Awal *</label><input className="input" type="date" value={akToIso(form.tglAwal)} onChange={e=>setDate('tglAwal', e.target.value)}/></div>
              <div className="field"><label>Tgl Akhir *</label><input className="input" type="date" value={akToIso(form.tglAkhir)} onChange={e=>setDate('tglAkhir', e.target.value)}/></div>
            </>
          )}
          <div className="field"><label>Status</label>
            <select className="select" value={form.status} onChange={e=>set('status', e.target.value)}>
              {AK_STATUS_LAPORAN_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>Keterangan *</label><textarea className="textarea" value={form.keterangan} onChange={e=>set('keterangan', e.target.value)} placeholder={`Penjelasan singkat periode ${report.label.toLowerCase()} ini`}/></div>

        <h4 style={{marginTop:14}}>Ringkasan Angka</h4>
        <div className="form-row-3">
          {report.fields.map(f => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              <input className="input mono" type="number" value={form[f.key]} onChange={e=>set(f.key, +e.target.value)}/>
            </div>
          ))}
        </div>
        <div className="field" style={{marginTop:10}}>
          <label>{report.resultLabel}</label>
          <div className="view-value mono" style={{fontWeight:700, color: isBalanceCheck ? (result===0?'var(--realisasi)':'var(--danger)') : 'var(--text)'}}>
            {isBalanceCheck ? (result===0 ? 'Rp 0 — Balance' : `${fmtRp(result)} — Tidak Balance`) : fmtRp(result)}
          </div>
        </div>
      </div>
    </AkModalShell>
  );
}

function LaporanKeuanganPage({ reportId, rows, setRows }) {
  const report = AK_LAPORAN_LIST.find(r => r.id === reportId);
  const [modal, setModal] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);
  if (!report) return null;

  const save = (form) => {
    const finalNo = form.no || akNextLaporanNo(rows, report.noPrefix);
    const saved = { ...form, no: finalNo };
    setRows(prev => prev.some(r => r.no === finalNo) ? prev.map(r => r.no === finalNo ? saved : r) : [...prev, saved]);
    setModal(null);
    window.__erpToast && window.__erpToast('Data berhasil disimpan.');
  };

  return (
    <>
      <LaporanKeuanganList report={report} rows={rows} onAdd={()=>setModal({})} onEdit={(d)=>setModal({data:d})}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(r)=>{setCetakRow(r); setShowCetak(true);}} />
      {modal && <LaporanKeuanganModal report={report} data={modal.data} onClose={()=>setModal(null)} onSave={save} />}
      {showCetak && (
        <AkCetakModal variant="pdf" docLabel={report.label} rows={rows} noKey="no" tglKey="tglAkhir"
          pdfPath={`uploads/${report.file}`}
          statusFilter={{ options: AK_STATUS_LAPORAN_OPTS.map(s => ({ value:s, label:s })), match:(r,v) => r.status === v }}
          initialSelected={cetakRow ? [cetakRow.no] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
    </>
  );
}
