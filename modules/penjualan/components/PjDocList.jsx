// Penjualan — tabel list generik + filter bar (dipakai halaman dokumen Sales Order/Invoice/
// Sales Return/Delivery Order)
//
// statusFilter (opsional): { options:[{value,label}], match:(row, selectedValue)=>boolean }
// onCancelDoc (opsional): kalau diisi, tampil icon "Batalkan Transaksi" di kolom Aksi —
//   disabled (bukan disembunyikan) kalau dokumen sudah batal.
// onView (opsional): klik baris/No.Bukti buka mode VIEW. Kalau tidak diisi, klik baris
//   memanggil onEdit juga (perilaku lama, dipakai halaman yang belum di-split VIEW/EDIT).
// onCetak (opsional): tombol "Cetak" di toolbar header (lewat slot `extra` PjHeader), buka
//   PjCetakModal dengan semua baris tercentang. onCetakRow (opsional): icon Cetak per baris di
//   kolom Aksi, buka modal yang sama tapi cuma baris itu yang tercentang.

function PjDocList({ title, sub, rows, columns, onAdd, onView, onEdit, onCancelDoc, onCetak, onCetakRow, addLabel='Buat Baru', statusFilter }) {
  const [q, setQ] = React.useState('');
  const handleRowClick = onView || onEdit;
  const [statusVal, setStatusVal] = React.useState('');
  const filtered = rows.filter(r => {
    if (q && !columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q.toLowerCase()))) return false;
    if (statusFilter && statusVal && !statusFilter.match(r, statusVal)) return false;
    return true;
  });
  const isCancelled = (r) => !!(r.Batal || r.Status === 'BATAL');
  return (
    <>
      <PjHeader title={title} sub={sub ?? `${filtered.length} transaksi`} onAdd={onAdd} addLabel={addLabel}
        extra={onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>} />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No. Bukti, customer…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        {statusFilter && (
          <div className="field"><label>Status</label>
            <select className="select" value={statusVal} onChange={e=>setStatusVal(e.target.value)}>
              <option value="">Semua</option>
              {statusFilter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
        <div className="filter-actions"><button className="btn" onClick={()=>setQ('')}>Reset</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th style={{width:120}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map((r,i) => (
                <tr key={r.No_Bukti ?? i} onClick={()=>handleRowClick(r)}>
                  {columns.map((c,ci) => (
                    <td key={c.key} className={c.mono ? 'mono' : ''}>
                      {c.render ? c.render(r[c.key], r) : ci === 0 ? <span className="cell-link">{r[c.key]}</span> : (r[c.key] || <span className="muted">—</span>)}
                    </td>
                  ))}
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit(r)}>{I.edit()}</button>
                      {onCancelDoc && (
                        <button className="btn btn-icon btn-sm del" title={isCancelled(r) ? 'Sudah dibatalkan' : 'Batalkan Transaksi'} disabled={isCancelled(r)} onClick={()=>onCancelDoc(r)}>{I.fileX(14)}</button>
                      )}
                      <button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>onCetakRow ? onCetakRow(r) : (window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.'))}>{I.print()}</button>
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
