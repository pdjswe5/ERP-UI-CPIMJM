// Pembelian — header halaman list (title/sub + Refresh/Export/Tambah)

function PbHeader({ title, sub, onAdd, addLabel='Buat Baru', onCetak }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1><div className="sub">{sub}</div></div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="btn btn-sm" onClick={()=>window.__erpToast && window.__erpToast('Data diperbarui.')}>{I.refresh()} Refresh</button>
        <button className="btn btn-sm" onClick={()=>window.__erpToast && window.__erpToast('Fitur export akan tersedia pada integrasi backend.')}>{I.download()} Export</button>
        {onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>}
        {onAdd && <button className="btn btn-primary" onClick={onAdd}>{I.plus()} {addLabel}</button>}
      </div>
    </div>
  );
}
