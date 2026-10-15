// Penjualan — daftar (list) bergaya ERP asli (PageTransaksiData / DxGrid):
// judul → ringkasan filter aktif + pencarian + tombol filter → toolbar "Urut Berdasarkan" +
// tombol "+ <Dokumen> Baru" → grid padat (checkbox, link nomor, chip kode) → footer
// "Halaman x / y (N Data)" + pager + ukuran halaman.
//
// Gaya ada di styles.css (blok ".erp-parity", hanya berlaku di dalam halaman Pelanggan/Penjualan).
//
// columns: [{ key, label, mono?, num?, render?(v,r), sortValue?(r), link? }]
//   - kolom pertama otomatis dirender sebagai link (klik = onRowClick)
// statusFilter (opsional): { options:[{value,label}], match:(row, value)=>boolean }
// renderActions(r): isi kolom Aksi (tombol ikon). Tanpa ini kolom Aksi tidak ditampilkan.

// tanggal ISO (yyyy-mm-dd) -> dd/mm/yyyy seperti di ERP asli; nilai lain apa adanya
function pjErpCell(v) {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) return v.slice(0, 10).split('-').reverse().join('/');
  return v;
}

function PjCodeChip({ name, code }) {
  if (!name && !code) return <span className="muted">—</span>;
  return (
    <span className="erp-chipcell">
      <span className="erp-chipcell-name">{name || '—'}</span>
      {code ? <span className="erp-chip">{code}</span> : null}
    </span>
  );
}

function PjErpList({
  title, rows, columns, rowKey, onAdd, addLabel = 'Baru', onRowClick, renderActions,
  statusFilter, onCetak, onRefresh, onExport, searchPlaceholder = 'Pencarian umum...',
  searchKeys, defaultPageSize = 100,
}) {
  const [q, setQ] = React.useState('');
  const [statusVal, setStatusVal] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [sortKey, setSortKey] = React.useState('');   // '' = urutan asli ("Aktivitas Terakhir": data baru di atas)
  const [sortDir, setSortDir] = React.useState('desc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [sel, setSel] = React.useState({});

  const keys = searchKeys || columns.map(c => c.key);
  const activeFilters = [q && 'Pencarian', statusFilter && statusVal && 'Status'].filter(Boolean);
  const resetFilter = () => { setQ(''); setStatusVal(''); setPage(1); };

  const filtered = rows.filter(r => {
    if (q && !keys.some(k => String(r[k] ?? '').toLowerCase().includes(q.toLowerCase()))) return false;
    if (statusFilter && statusVal && !statusFilter.match(r, statusVal)) return false;
    return true;
  });

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find(c => c.key === sortKey);
    const val = (r) => col && col.sortValue ? col.sortValue(r) : r[sortKey];
    const dir = sortDir === 'asc' ? 1 : -1;
    return filtered.slice().sort((a, b) => {
      const x = val(a), y = val(b);
      const nx = typeof x === 'number', ny = typeof y === 'number';
      return (nx && ny ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'id', { numeric: true })) * dir;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((curPage - 1) * pageSize, curPage * pageSize);
  const keyOf = (r, i) => (rowKey ? r[rowKey] : i);
  const allChecked = pageRows.length > 0 && pageRows.every((r, i) => sel[keyOf(r, i)]);
  const toggleAll = () => {
    const next = { ...sel };
    pageRows.forEach((r, i) => { next[keyOf(r, i)] = !allChecked; });
    setSel(next);
  };

  // rows bertambah (data baru di atas) -> kembali ke halaman 1 supaya langsung terlihat
  React.useEffect(() => { setPage(1); }, [rows.length]);

  return (
    <div className="erp-list">
      <h1 className="erp-title">{title}</h1>

      <div className="erp-filter-row">
        <div className="erp-filter-summary">
          {activeFilters.length > 0
            ? <>{activeFilters.length} filter aktif: <b>{activeFilters.join(', ')}</b> · <a onClick={resetFilter}>Hapus</a> / <a onClick={resetFilter}>Reset Filter</a></>
            : <><i>Tidak ada filter aktif</i> · <a onClick={resetFilter}>Reset Filter</a></>}
        </div>
        <div className="erp-search">
          <div className="erp-search-input">
            <input placeholder={searchPlaceholder} value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
          </div>
          <button className={`erp-btn-filter${filterOpen ? ' on' : ''}`} title="Filter" onClick={() => setFilterOpen(v => !v)}>{I.filter(14)}</button>
        </div>
      </div>

      {filterOpen && (
        <div className="erp-filter-panel">
          {statusFilter ? (
            <div className="erp-field">
              <label>Status</label>
              <select value={statusVal} onChange={e => { setStatusVal(e.target.value); setPage(1); }}>
                <option value="">Semua</option>
                {statusFilter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ) : <span className="muted">Tidak ada filter tambahan untuk halaman ini.</span>}
          <button className="erp-btn" onClick={resetFilter}>Reset Filter</button>
        </div>
      )}

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-toolbar-left">
            <span>Urut Berdasarkan :</span>
            <select value={sortKey} onChange={e => { setSortKey(e.target.value); setPage(1); }}>
              <option value="">Aktivitas Terakhir</option>
              {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <button className="erp-btn-icon" title={sortDir === 'asc' ? 'Urut naik' : 'Urut turun'}
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>{sortDir === 'asc' ? '↑' : '↓'}</button>
          </div>
          <div className="erp-toolbar-right">
            {onAdd && <button className="erp-btn-primary" onClick={onAdd}>{I.plus(13)} {addLabel}</button>}
            <button className="erp-btn-icon" title="Refresh"
              onClick={onRefresh || (() => window.__erpToast && window.__erpToast('Data diperbarui.'))}>{I.refresh(14)}</button>
            {onCetak && <button className="erp-btn-icon" title="Cetak" onClick={onCetak}>{I.print(14)}</button>}
            <button className="erp-btn-icon" title="Unduh"
              onClick={onExport || (() => window.__erpToast && window.__erpToast('Fitur export akan tersedia pada integrasi backend.'))}>{I.download(14)}</button>
          </div>
        </div>

        <div className="erp-table-wrap">
          <table className="erp-grid">
            <thead>
              <tr>
                <th style={{ width: 34 }}><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                {columns.map(c => <th key={c.key} className={c.num ? 'num' : ''}>{c.label}</th>)}
                {renderActions && <th style={{ width: 92 }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr><td colSpan={columns.length + 1 + (renderActions ? 1 : 0)} className="erp-empty">Tidak ada data.</td></tr>
              )}
              {pageRows.map((r, i) => {
                const k = keyOf(r, i);
                return (
                  <tr key={k} className={sel[k] ? 'sel' : ''} onClick={() => onRowClick && onRowClick(r)}>
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={!!sel[k]} onChange={() => setSel(s => ({ ...s, [k]: !s[k] }))} />
                    </td>
                    {columns.map((c, ci) => (
                      <td key={c.key} className={(c.num ? 'num ' : '') + (c.mono ? 'mono' : '')}>
                        {c.render
                          ? c.render(r[c.key], r)
                          : ci === 0
                            ? <span className="erp-link">{pjErpCell(r[c.key])}</span>
                            : (r[c.key] === undefined || r[c.key] === '' || r[c.key] === null ? <span className="muted">—</span> : pjErpCell(r[c.key]))}
                      </td>
                    ))}
                    {renderActions && <td onClick={e => e.stopPropagation()}><div className="erp-actions">{renderActions(r)}</div></td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="erp-footer">
          <div>Halaman {curPage} / {totalPages} ({sorted.length} Data)</div>
          <div className="erp-pager">
            <button disabled={curPage <= 1} onClick={() => setPage(1)}>«</button>
            <button disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}>‹</button>
            <span className="erp-pager-cur">{curPage}</span>
            <button disabled={curPage >= totalPages} onClick={() => setPage(curPage + 1)}>›</button>
            <button disabled={curPage >= totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
          <div>
            <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setPage(1); }}>
              {[25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PjErpList = PjErpList;
window.PjCodeChip = PjCodeChip;
