// Barang — komponen & helper bersama dipakai lintas sub-modul (Barang Lain, Bahan Baku, Barang
// Jadi, Mutasi/Penyesuaian/Opname). Dipindah dari root barang.jsx, tidak diubah.

// Field readonly ala mode VIEW (dipakai StokTransaksiPage.jsx) — sama gaya dengan .view-field/
// .view-value yang sudah dipakai PbModalShell/PjModalShell di Pembelian/Penjualan.
function BrgViewField({ label, value, mono }) {
  return (
    <div className="view-field">
      <label>{label}</label>
      <div className={`view-value ${mono ? 'mono' : ''} ${!value ? 'muted' : ''}`}>{value || '—'}</div>
    </div>
  );
}

// Kotak "Alasan Batal" ala PbModalShell/PjModalShell — dipakai StokTransaksiPage.jsx supaya mode
// VIEW/EDIT transaksi yang sudah batal menampilkan alasannya secara menonjol, bukan cuma field biasa.
function BrgAlasanBatal({ alasan }) {
  return (
    <div className="alasan-section">
      <h3>Alasan Batal</h3>
      <div className="alasan-box batal">
        <span className="icon">{I.x(16)}</span>
        <span>{alasan || 'Transaksi dibatalkan'}</span>
      </div>
    </div>
  );
}

function BrgHeader({ title, sub, onAdd, addLabel='Tambah', extra }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1><div className="sub">{sub}</div></div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="btn btn-sm">{I.refresh()} Refresh</button>
        <button className="btn btn-sm">{I.download()} Export</button>
        {extra}
        {onAdd && <button className="btn btn-primary" onClick={onAdd}>{I.plus()} {addLabel}</button>}
      </div>
    </div>
  );
}

function BrgModalShell({ title, sub, onClose, onSave, children, saveLabel='Simpan', wide=false, maxWidth, footerExtra, saveDisabled=false }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={wide ? {maxWidth: maxWidth || 1100, maxHeight:'92vh'} : {maxWidth:700}}>
        <div className="modal-head">
          <div><h2>{title}</h2>{sub && <div className="sub">{sub}</div>}</div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={wide ? {overflowY:'auto', maxHeight:'calc(92vh - 180px)'} : {}}>{children}</div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {footerExtra}
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={onSave} disabled={saveDisabled}>{I.check()} {saveLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Prop `softDelete` (opsional, default false — supaya BarangJadiModal yang belum pakainya tidak
// berubah perilaku): kalau true, tombol hapus cuma menandai baris `_deleted:true`
// (baris tampil pudar/dicoret + tombol Restore) alih-alih langsung hilang dari array. Baris yang
// masih ditandai `_deleted` baru benar-benar dibuang saat form disimpan — lihat pemanggil yang
// harus filter `_deleted` sebelum mengirim ke onSave (contoh: BarangLainModal).
function BrgInlineTable({ title, columns, rows, setRows, addLabel, shortcut, softDelete }) {
  const update = (idx, key, value) => { const next = [...rows]; next[idx] = { ...next[idx], [key]: value }; setRows(next); };
  const remove = (idx) => {
    if (softDelete) setRows(rows.map((r, i) => i === idx ? { ...r, _deleted:true } : r));
    else setRows(rows.filter((_, i) => i !== idx));
  };
  const restore = (idx) => setRows(rows.map((r, i) => i === idx ? { ...r, _deleted:false } : r));
  const add = () => setRows([...rows, {
    ...Object.fromEntries(columns.map(c => [c.key, c.type === 'number' ? 0 : (c.default ?? '')])),
    ...(softDelete ? { _added:true } : {}),
  }]);
  // Kolom type:'select' render <select>, type:'currency' render input teks berformat ribuan
  // (disimpan sebagai angka polos), kolom lain tetap <input> seperti sebelumnya. Baris yang
  // ditandai _deleted (softDelete mode) ditampilkan read-only (teks biasa, tidak bisa diedit lagi).
  const renderCell = (c, r, idx) => {
    if (softDelete && r._deleted) {
      let display = r[c.key];
      if (c.type === 'select') {
        const opts = typeof c.options === 'function' ? c.options() : (c.options || []);
        display = opts.find(o => o.value === r[c.key])?.label ?? r[c.key];
      } else if (c.type === 'currency') {
        display = r[c.key] ? Number(r[c.key]).toLocaleString('id-ID') : '';
      }
      return <span className={`cell ${c.num ? 'num mono' : c.mono ? 'mono' : ''}`} style={{display:'block', padding:'4px 0'}}>{display}</span>;
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
    if (c.type === 'currency') {
      return (
        <input className="cell num mono" type="text" inputMode="numeric" placeholder={c.placeholder || '0'}
          value={r[c.key] ? Number(r[c.key]).toLocaleString('id-ID') : ''}
          onChange={e => { const raw = e.target.value.replace(/[^\d]/g, ''); update(idx, c.key, raw ? +raw : 0); }} />
      );
    }
    return (
      <input className={`cell ${c.num ? 'num mono' : c.mono ? 'mono' : ''}`} type={c.type || 'text'} placeholder={c.placeholder || ''}
        value={r[c.key]} onChange={e => update(idx, c.key, c.type === 'number' ? +e.target.value : e.target.value)} />
    );
  };
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>{title}</h3>
        <button className="btn btn-primary btn-sm" onClick={add}>{I.plus()} {addLabel}</button>
      </div>
      {shortcut && <div style={{textAlign:'right', fontSize:12, color:'var(--text-3)', marginBottom:8}}>Tambah: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>{shortcut}</kbd></div>}
      <div className="line-items" style={{height:200, overflowY:'auto', overflowX:'auto'}}>
        <table>
          <thead><tr>{columns.map(c => <th key={c.key} style={c.width ? {width:c.width} : {}}>{c.label}</th>)}<th style={{width:40}}></th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="empty">Belum ada data.</td></tr>}
            {rows.map((r, idx) => (
              <tr key={idx} className={softDelete ? `${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}` : ''}
                title={softDelete && r._deleted ? 'Baris ini akan dihapus' : ''}>
                {columns.map(c => (
                  <td key={c.key}>{renderCell(c, r, idx)}</td>
                ))}
                <td>
                  {softDelete && r._deleted ? (
                    <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={() => restore(idx)} title="Restore">{I.refresh(14)}</button>
                  ) : (
                    <button className="btn btn-icon btn-sm del" title="Hapus" onClick={() => remove(idx)}>{I.trash()}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function brgAktifPill(aktif) { return <span className={`pill ${aktif ? 'approved' : 'cancelled'}`}>{aktif ? 'Aktif' : 'Non-aktif'}</span>; }
function brgBatalPill(batal) { return <span className={`pill ${batal ? 'cancelled' : 'approved'}`}>{batal ? 'BATAL' : 'AKTIF'}</span>; }
function brgKategoriNama(kode) { return BRG_KATEGORI_OPTS.find(k => k.kode === kode)?.nama || kode; }
function brgGudangNama(kode) { return BRG_GUDANG_OPTS.find(g => g.kode === kode)?.nama || kode; }
function brgWarnaNama(kode) { return BRG_WARNA_OPTS.find(w => w.kode === kode)?.nama || ''; }
function brgAzNama(kode) { return BRG_AZ_OPTS.find(a => a.kode === kode)?.nama || ''; }
function brgYieldNama(kode) { return BRG_YIELD_OPTS.find(y => y.kode === kode)?.nama || ''; }
function brgJenisNama(kode) { return BRG_JENIS_OPTS.find(j => j.kode === kode)?.nama || ''; }
function brgTipeNama(kode) { return BRG_TIPE_OPTS.find(t => t.kode === kode)?.nama || ''; }
function brgMerkNama(kode) { return BRG_MERK_OPTS.find(m => m.kode === kode)?.nama || ''; }
function brgJenisPuNama(kode) { return BRG_JENIS_PU_OPTS.find(j => j.kode === kode)?.nama || ''; }
function brgTipePuNama(kode) { return BRG_TIPE_PU_OPTS.find(t => t.kode === kode)?.nama || ''; }
