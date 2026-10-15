// Penjualan — tabel item inline: InlineTable (generik, dipakai form master pelanggan & non-produk/jasa)
// dan PjItemTable (khusus barang produk, dengan picker dari BARANG root data.jsx)

function InlineTable({ title, columns, rows, setRows, addLabel, shortcut, disabled, itemSource, onPickItems, lockItems, showTotal, addLocked, addLockedMsg='Lengkapi data utama terlebih dahulu.' }) {
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
    const col = columns.find(c => c.key === key);
    if (col && col.linkField && col.linkResolve) row[col.linkField] = col.linkResolve(value);
    const next = [...rows]; next[idx] = row; setRows(next);
  };
  const softDelete = (idx) => { const next=[...rows]; next[idx]={...next[idx],_deleted:true}; setRows(next); };
  const restore = (idx) => { const next=[...rows]; next[idx]={...next[idx],_deleted:false}; setRows(next); };
  const add = () => setRows([...rows, { ...Object.fromEntries(columns.map(c => [c.key, c.type === 'number' ? 0 : ''])), _added:true }]);
  const total = rows.reduce((s,r) => r._deleted ? s : s + pjLineTotal(r), 0);
  const isLockedItemCol = (c) => lockItems && itemSource && (c.key === itemSource.codeKey || c.key === itemSource.nameKey);

  const renderCell = (c, r, idx) => {
    if (c.compute) {
      return <span className="cell num mono" style={{display:'block',padding:'4px 0'}}>{c.compute(r)}</span>;
    }
    const lockedByFill = c.lockIfFilled && r[c.key];
    if (disabled || isLockedItemCol(c) || c.readOnly || lockedByFill || r._deleted) {
      let display = r[c.key];
      if (c.type === 'select') {
        const opts = typeof c.options === 'function' ? c.options() : (c.options || []);
        display = opts.find(o => o.value === r[c.key])?.label ?? r[c.key];
      }
      return <span className={`cell ${c.num ? 'num mono' : c.mono ? 'mono' : ''}`} style={{display:'block',padding:'4px 0'}}>{display}</span>;
    }
    if (itemSource && c.key === itemSource.codeKey) {
      return (
        <select className="cell mono" value={r[c.key]} onChange={e=>update(idx, c.key, e.target.value)}>
          <option value="">— Pilih —</option>
          {itemSource.data.map(p => <option key={p.kode ?? p.Kode_Supp} value={p.kode ?? p.Kode_Supp}>{p.kode ?? p.Kode_Supp} — {p.nama ?? p.Nama_Supp}</option>)}
        </select>
      );
    }
    if (c.type === 'select') {
      const opts = typeof c.options === 'function' ? c.options() : (c.options || []);
      return (
        <select className="cell" value={r[c.key]} onChange={e=>update(idx, c.key, e.target.value)}>
          <option value="">— Pilih —</option>
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return (
      <input
        className={`cell ${c.num ? 'num mono' : c.mono ? 'mono' : ''}`}
        type={c.type || 'text'}
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
                  onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onPickItems(); }}>{I.plus()} Pilih</button>}
                {!lockItems && <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                  onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } add(); }}>{I.plus()} {addLabel}</button>}
              </>
            )}
          </div>
        )}
      </div>
      {shortcut && !disabled && !lockItems && (
        <div style={{textAlign:'right', fontSize:12, color:'var(--text-3)', marginBottom:8}}>
          Tambah: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>{shortcut}</kbd>
        </div>
      )}
      <div className={`line-items ${disabled ? 'view-only' : ''}`} style={{maxHeight: 280, overflowY:'auto', overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              {columns.map(c => <th key={c.key} style={c.width ? {width:c.width} : c.style || {}}>{c.label}</th>)}
              {!disabled && <th style={{width:40}}></th>}
            </tr>
          </thead>
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
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={()=>restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>softDelete(idx)}>{I.trash()}</button>
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

// Katalog barang buat dropdown Kode Item: BARANG (sparepart, inventory.jsx) digabung BARANG_JADI
// (modul Barang — dipakai Order Penjualan sejak seed-nya diisi kode JD-xxx/PU-xxx supaya SPK "Buat
// dari SO" bisa auto-fill Bahan lewat BOM, lihat salesorder.data.jsx). Dinormalisasi ke bentuk
// {code,name,hpp} yang sama biar update()/dropdown di bawah tidak perlu tahu bedanya.
function pjBarangCatalog() {
  return [...BARANG, ...BARANG_JADI.map(b => ({ code:b.kodeProduk, name:b.namaProduk, hpp:b.hppStandar }))];
}

function PjItemTable({ title, rows, setRows, showRealisasi, disabled, onPickItems, lockItems, addLocked, addLockedMsg='Lengkapi data utama terlebih dahulu.' }) {
  const update = (idx, key, value) => {
    let row = { ...rows[idx], [key]: value };
    if (key === 'Kode_Item' && !row._deleted) {
      const found = pjBarangCatalog().find(b => b.code === value);
      if (found) { row.Nama_Item = found.name; row.Satuan = found.unit || row.Satuan; row.Hrg_Sat = found.price || found.hpp || 0; }
    }
    const next = [...rows]; next[idx] = row; setRows(next);
  };
  const softDelete = (idx) => { const next=[...rows]; next[idx]={...next[idx],_deleted:true}; setRows(next); };
  const restore = (idx) => { const next=[...rows]; next[idx]={...next[idx],_deleted:false}; setRows(next); };
  const add = () => setRows([...rows, { Kode_Item:'', Nama_Item:'', Deskripsi:'', Jumlah:1, Realisasi:0, Konversi:1, Satuan:'PCS', Hrg_Sat:0, DiscPros_Det:0, DiscNilai_Det:0, _added:true }]);
  const total = rows.reduce((s,r) => r._deleted ? s : s + pjLineTotal(r), 0);
  const lockedCodeCol = disabled || lockItems;
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>{title}</h3>
        {!disabled && (
          <div style={{display:'flex', gap:8}}>
            {lockItems && onPickItems ? (
              // Kode/Nama item terkunci -> satu tombol saja, pakai alur picker supaya kode+nama selalu terisi bersamaan
              <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onPickItems(); }}>{I.plus()} Tambah Barang</button>
            ) : (
              <>
                {onPickItems && <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                  onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } onPickItems(); }}>{I.plus()} Pilih Barang</button>}
                <button className="btn btn-primary btn-sm" disabled={addLocked} title={addLocked ? addLockedMsg : undefined}
                  onClick={()=>{ if (addLocked) { window.__erpToast && window.__erpToast(addLockedMsg); return; } add(); }}>{I.plus()} Tambah Item</button>
              </>
            )}
          </div>
        )}
      </div>
      <div className={`line-items ${disabled ? 'view-only' : ''}`} style={{maxHeight:280, overflowY:'auto', overflowX:'auto'}}>
        <table>
          <thead>
            <tr>
              <th style={{width:170}}>Kode Item</th><th style={{width:320}}>Nama Barang</th><th style={{width:200}}>Deskripsi</th>
              <th className="num" style={{width:90}}>Jumlah</th>
              {showRealisasi && <th className="num" style={{width:100}}>Realisasi</th>}
              <th style={{width:90}}>Satuan</th><th className="num" style={{width:130}}>Harga Satuan</th>
              <th className="num" style={{width:90}}>Disc %</th><th className="num" style={{width:120}}>Disc Rp</th><th className="num" style={{width:150}}>Total Rp</th>
              {!disabled && <th style={{width:38}}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={showRealisasi?11:10} className="empty" style={{padding:'32px 16px', textAlign:'center', color:'var(--text-3)'}}>Belum ada item.</td></tr>}
            {rows.map((r, idx) => (
              <tr key={idx} className={`${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}`} title={r._deleted ? 'Barang ini akan dihapus' : ''}>
                {lockedCodeCol || r._deleted ? (
                  <><td className="mono">{r.Kode_Item}</td><td>{r.Nama_Item || '—'}</td>{disabled || r._deleted ? <td>{r.Deskripsi}</td> : <td><input className="cell" value={r.Deskripsi} onChange={e=>update(idx,'Deskripsi',e.target.value)}/></td>}</>
                ) : (
                  <>
                    <td>
                      <select className="cell mono" value={r.Kode_Item} onChange={e=>update(idx,'Kode_Item',e.target.value)}>
                        <option value="">— Pilih —</option>
                        {pjBarangCatalog().map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
                      </select>
                    </td>
                    <td className="muted" style={{padding:'0 8px', fontSize:12.5}}>{r.Nama_Item || '—'}</td>
                    <td><input className="cell" value={r.Deskripsi} onChange={e=>update(idx,'Deskripsi',e.target.value)}/></td>
                  </>
                )}
                {disabled || r._deleted ? <td className="num mono">{r.Jumlah}</td> : <td><input className="cell num" type="number" value={r.Jumlah} onChange={e=>update(idx,'Jumlah',+e.target.value)}/></td>}
                {showRealisasi && <td className="num mono muted" style={{padding:'0 8px'}}>{r.Realisasi||0}</td>}
                {disabled || r._deleted ? <td>{r.Satuan}</td> : <td><input className="cell" value={r.Satuan} onChange={e=>update(idx,'Satuan',e.target.value)}/></td>}
                {disabled || r._deleted ? <td className="num mono">{fmtRp(r.Hrg_Sat)}</td> : <td><input className="cell num" type="number" value={r.Hrg_Sat} onChange={e=>update(idx,'Hrg_Sat',+e.target.value)}/></td>}
                {disabled || r._deleted ? <td className="num">{r.DiscPros_Det}%</td> : <td><input className="cell num" type="number" value={r.DiscPros_Det} onChange={e=>update(idx,'DiscPros_Det',+e.target.value)}/></td>}
                {disabled || r._deleted ? <td className="num mono">{fmtRp(r.DiscNilai_Det)}</td> : <td><input className="cell num" type="number" value={r.DiscNilai_Det} onChange={e=>update(idx,'DiscNilai_Det',+e.target.value)}/></td>}
                <td className="num mono">{fmtRp(pjLineTotal(r))}</td>
                {!disabled && (
                  <td>
                    {r._deleted ? (
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={()=>restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>softDelete(idx)}>{I.trash()}</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{textAlign:'right', marginTop:8, fontSize:13}}>Subtotal: <b className="mono">{fmtRp(total)}</b></div>
    </div>
  );
}
