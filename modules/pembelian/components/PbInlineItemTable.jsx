// Pembelian — tabel item editable (produk & biaya), dengan picker & soft-delete baris

function PbInlineItemTable({ title, columns, rows, setRows, addLabel='Tambah Baris', shortcut, itemSource, showTotal, disabled, onPickItems, lockItems, addLocked, addLockedMsg='Lengkapi data utama terlebih dahulu.' }) {
  const update = (idx, key, value) => {
    let row = { ...rows[idx], [key]: value };
    if (itemSource && key === itemSource.codeKey && !lockItems) {
      const found = itemSource.data.find(p => (p.kode ?? p.Kode_Supp) === value);
      if (found) {
        row[itemSource.nameKey] = found.nama ?? found.Nama_Supp ?? '';
        if (itemSource.satuanKey && found.satuan) row[itemSource.satuanKey] = found.satuan;
        if (itemSource.hargaKey && found.harga !== undefined) row[itemSource.hargaKey] = found.harga;
      }
    }
    // Kolom dropdown generik dengan auto-isi kolom lain (mis. pilih Kode_PurchasingORG -> isi Ket_PurchasingORG)
    const col = columns.find(c => c.key === key);
    if (col && col.linkField && col.linkResolve) {
      row[col.linkField] = col.linkResolve(value);
    }
    const next = [...rows]; next[idx] = row; setRows(next);
  };
  const softDelete = (idx) => {
    const next = [...rows];
    next[idx] = { ...next[idx], _deleted: true };
    setRows(next);
  };
  const restore = (idx) => {
    const next = [...rows];
    next[idx] = { ...next[idx], _deleted: false };
    setRows(next);
  };
  const add = () => setRows([...rows, { ...Object.fromEntries(columns.map(c => [c.key, c.type === 'number' ? 0 : ''])), _added: true }]);
  const total = rows.reduce((s, r) => r._deleted ? s : s + pbLineTotal(r), 0);

  const isLockedItemCol = (c) => lockItems && itemSource && (c.key === itemSource.codeKey || c.key === itemSource.nameKey);

  const renderCell = (c, r, idx) => {
    if (c.compute) {
      return <span className="cell num mono" style={{display:'block',padding:'4px 0',borderBottom:'1px solid transparent'}}>{c.compute(r)}</span>;
    }
    const lockedByFill = c.lockIfFilled && r[c.key];
    if (disabled || isLockedItemCol(c) || c.readOnly || lockedByFill || r._deleted) {
      let display = r[c.key];
      if (c.type === 'select') {
        const opts = typeof c.options === 'function' ? c.options() : (c.options || []);
        display = opts.find(o => o.value === r[c.key])?.label ?? r[c.key];
      }
      return <span className={`cell ${c.num ? 'num mono' : c.mono ? 'mono' : ''}`} style={{display:'block',padding:'4px 0',borderBottom:'1px solid transparent'}}>{display}</span>;
    }
    if (itemSource && c.key === itemSource.codeKey) {
      return (
        <select className="cell mono" value={r[c.key]} onChange={e => update(idx, c.key, e.target.value)}>
          <option value="">— Pilih —</option>
          {itemSource.data.map(p => <option key={p.kode ?? p.Kode_Supp} value={p.kode ?? p.Kode_Supp}>{p.kode ?? p.Kode_Supp} — {p.nama ?? p.Nama_Supp}</option>)}
        </select>
      );
    }
    if (c.type === 'select') {
      const opts = typeof c.options === 'function' ? c.options() : (c.options || []);
      return (
        <select className="cell" value={r[c.key]} onChange={e => update(idx, c.key, e.target.value)}>
          <option value="">— Pilih —</option>
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return (
      <input
        className={`cell ${c.num ? 'num mono' : c.mono ? 'mono' : ''}`}
        type={c.type || 'text'}
        placeholder={c.placeholder || ''}
        readOnly={c.readOnly}
        value={r[c.key]}
        onChange={e => update(idx, c.key, c.type === 'number' ? +e.target.value : e.target.value)}
      />
    );
  };

  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>{title}</h3>
        {!disabled && (
          <div style={{display:'flex', gap:8}}>
            {lockItems && onPickItems ? (
              // Kode/Nama item terkunci -> satu tombol saja, pakai alur picker supaya kode+nama selalu terisi bersamaan
              <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onPickItems(); }}>{I.plus()} {addLabel}</button>
            ) : (
              <>
                {onPickItems && <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                  onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onPickItems(); }}>{I.plus()} Pilih Barang</button>}
                {!lockItems && <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                  onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } add(); }}>{I.plus()} {addLabel}</button>}
              </>
            )}
          </div>
        )}
      </div>
      {shortcut && !disabled && !lockItems && <div style={{textAlign:'right', fontSize:12, color:'var(--text-3)', marginBottom:8}}>Tambah: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>{shortcut}</kbd></div>}
      <div className={`line-items ${disabled ? 'view-only' : ''}`} style={{maxHeight:280, overflowY:'auto', overflowX:'auto'}}>
        <table>
          <thead><tr>{columns.map(c => <th key={c.key} style={c.width ? {width:c.width} : {}}>{c.label}</th>)}{!disabled && <th style={{width:40}}></th>}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={columns.length + (disabled?0:1)} className="empty">Belum ada data.</td></tr>}
            {rows.map((r, idx) => (
              <tr key={idx} className={`${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}`} title={r._deleted ? 'Barang ini akan dihapus' : ''}>
                {columns.map(c => (
                  <td key={c.key}>{renderCell(c, r, idx)}</td>
                ))}
                {!disabled && (
                  <td>
                    {r._deleted ? (
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={() => restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={() => softDelete(idx)}>{I.trash()}</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showTotal && <div style={{textAlign:'right', marginTop:8, fontSize:13}}>Subtotal baris: <b className="mono">{fmtRp(total)}</b></div>}
    </div>
  );
}
