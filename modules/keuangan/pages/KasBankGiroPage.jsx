// Keuangan — halaman Kas, Bank & Giro (master akun 'kbg'). Dipindah dari root keuangan.jsx.

function KasBankGiro({ rows, onAdd, onEdit }) {
  return (
    <>
      <div className="page-head">
        <div><h1>Kas, Bank & Giro</h1><div className="sub">{rows.length} akun · Total saldo {fmtRp(rows.reduce((s,a)=>s+a.saldo,0))}</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
          <button className="btn btn-primary" onClick={onAdd}>{I.plus()} Tambah Akun</button>
        </div>
      </div>
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Tipe</label><select className="select"><option>Semua</option><option>KAS</option><option>BANK</option><option>GIRO</option></select></div>
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama akun…"/></div></div>
          <div className="filter-actions"><button className="btn">Pilih Kolom</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {rows.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Kode</th><th>Nama Akun</th><th>Tipe</th><th>Cabang</th><th>No. Rekening</th><th>Currency</th><th className="num">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.kode} onClick={()=>onEdit(a)}>
                  <td className="mono cell-link">{a.kode}</td>
                  <td><span className="cell-link" style={{fontWeight:500}}>{a.nama}</span></td>
                  <td><span className="pill" style={{background: a.tipe==='KAS'?'#eef2ff':a.tipe==='BANK'?'#f0fdfa':'#fdf4ff', color:a.tipe==='KAS'?'#4338ca':a.tipe==='BANK'?'#0f766e':'#7c3aed'}}>{a.tipe}</span></td>
                  <td>{a.cabang}</td>
                  <td className="mono muted">{a.noRek || '—'}</td>
                  <td>{a.currency}</td>
                  <td className="num mono" style={{fontWeight:600}}>{fmtRp(a.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
