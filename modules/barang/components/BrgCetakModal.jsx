// Barang — popup "Cetak" untuk Mutasi Barang & Konsinyasi, Penyesuaian (Koreksi), dan Stock
// Opname. Sama pola dengan PbCetakModal/PjCetakModal (Pembelian/Penjualan): kiri filter (tanggal,
// No Bukti, status, checklist multi-pilih), kanan preview HTML digenerate dari data — mode Bukti
// (1 dokumen per "kertas") & Register (gabungan semua dokumen terpilih, dipaginasi per
// BRG_REGISTER_ROWS_PER_PAGE baris + footer "Halaman X dari Y", baris "(lanjutan)" kalau sebuah
// dokumen kepotong di batas halaman) — semua di-render terus-scroll (bukan pagination klik).
//
// Beda dari Pembelian/Penjualan:
// - Ketiga sub-modul Barang pakai field yang PERSIS sama (noBukti/tglBukti/kodeKategori/
//   keterangan/batal/alasanBatal/details), jadi tidak perlu prop field-key override seperti
//   PjCetakModal — tinggal `getGroupLabel`/`getItems`/`columns` untuk bedakan konten per sub-modul.
// - Kolom detail beda-beda tiap sub-modul (Mutasi: Satuan/Konversi/Jumlah/Satuan Terkecil;
//   Koreksi: .../Harga Total; Opname: Satuan/Konversi/Saldo/Fisik) — makanya kolom & item
//   generik lewat prop `columns` (array {label, width, numeric}) + `getItems` yang mengembalikan
//   `{ kode, nama, values:[...] }` sepanjang `columns`, bukan hardcode seperti hasHarga di Pembelian.
// - Dokumen ini bukan tagihan/invoice, jadi judul mode Bukti pakai nama menu asli (docLabel),
//   TIDAK dipaksa "INVOICE" seperti Pembelian/Penjualan.
//
// Dipanggil dari tiap halaman transaksi:
//   <BrgCetakModal docLabel="Mutasi Barang & Konsinyasi" rows={rows}
//     columns={[{label:'Satuan'},{label:'Konversi',numeric:true},{label:'Jumlah',numeric:true},{label:'Satuan Terkecil',numeric:true}]}
//     getItems={r => (r.details||[]).map(d => ({kode:d.kodeItem, nama:d.namaItem, values:[d.satuan, d.konversi, d.jumlah, d.satuanTerkecil]}))}
//     getGroupLabel={r => `${brgGudangNama(r.kodeGudangDari)} → ${brgGudangNama(r.kodeGudangKe)}`}
//     groupLabelText="Gudang" initialSelected={cetakRow ? [cetakRow.noBukti] : null} onClose={...} />

function brgFmtTgl(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

const BRG_REGISTER_ROWS_PER_PAGE = 16;
function brgBuildRegisterLines(rows, itemsOf, labelOf) {
  const lines = [];
  rows.forEach(r => {
    lines.push({ type:'group', no:r.noBukti, tgl:brgFmtTgl(r.tglBukti), label:labelOf(r), isBatal: !!r.batal });
    const items = itemsOf(r);
    if (items.length === 0) lines.push({ type:'empty' });
    else items.forEach((it,i) => lines.push({ type:'item', item:it, idx:i+1 }));
  });
  return lines;
}
// Kalau sebuah halaman mulai di tengah daftar item suatu dokumen (bukan pas baris "group"-nya),
// baris group dokumen itu diulang di awal halaman dengan tanda "(lanjutan)".
function brgChunk(lines, size) {
  const out = [];
  let currentGroup = null;
  for (let i = 0; i < lines.length; i += size) {
    const slice = lines.slice(i, i + size);
    const page = (slice[0] && slice[0].type !== 'group' && currentGroup)
      ? [{ ...currentGroup, continuation:true }, ...slice]
      : slice;
    slice.forEach(ln => { if (ln.type === 'group') currentGroup = ln; });
    out.push(page);
  }
  return out.length ? out : [[]];
}

function BrgCetakBuktiBody({ row, docLabel, orgInfo, items, columns, groupLabel, groupLabelText }) {
  return (
    <div className="cetak-doc">
      {row.batal && <div className="cetak-watermark">BATAL</div>}
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
        {orgInfo.email && <div>Email : {orgInfo.email}</div>}
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">{docLabel}</div>
        <div className="cetak-title-no">No. {row.noBukti}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>{groupLabelText}</div>
          {groupLabel && <b>{groupLabel}</b>}
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Tanggal</span><span>: {brgFmtTgl(row.tglBukti)}</span></div>
          <div className="cetak-meta-row"><span>Status</span><span>: {row.batal ? 'BATAL' : 'Aktif'}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead><tr><th style={{width:28}}>No</th><th>Nama Barang</th><th style={{width:140}}>Kode</th>{columns.map(c => <th key={c.label} style={c.width ? {width:c.width} : {}}>{c.label}</th>)}</tr></thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan={3 + columns.length} className="empty">Tidak ada item.</td></tr>}
          {items.map((it,i) => (
            <tr key={i}>
              <td>{i+1}.</td>
              <td>{it.nama}</td>
              <td className="mono">{it.kode}</td>
              {it.values.map((v,vi) => <td key={vi} className={columns[vi].numeric ? 'num' : ''}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cetak-foot">
        <div className="cetak-sign">
          <div className="cetak-sign-box"><div className="line" /><div>Diperiksa</div></div>
          <div className="cetak-sign-box"><div className="line" /><div>Dibuat oleh</div><b>PDJ Administrator</b></div>
        </div>
        <div className="cetak-summary">
          <div className="grand">Jumlah Item<span>{items.length}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {brgFmtTgl(new Date().toISOString())} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

function BrgCetakRegisterBody({ lines, docLabel, orgInfo, tglRangeLabel, columns, pageInfo, totalItems, isLastPage }) {
  const totalCols = 2 + columns.length;
  const labelSpan = Math.max(1, totalCols - 3);
  return (
    <div className="cetak-doc">
      <div className="cetak-kop">
        <div className="cetak-kop-left">
          <b>{orgInfo.nama}</b>
          <div>{orgInfo.alamat}</div>
          <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
          {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
          {orgInfo.email && <div>Email : {orgInfo.email}</div>}
        </div>
        <div className="cetak-kop-center">{docLabel}</div>
        <div className="cetak-kop-right">Tgl. Bukti<br/>{tglRangeLabel}</div>
      </div>
      <table className="cetak-table">
        <thead><tr><th>Nama Barang</th><th style={{width:140}}>Kode</th>{columns.map(c => <th key={c.label} style={c.width ? {width:c.width} : {}}>{c.label}</th>)}</tr></thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={totalCols} className="empty">Tidak ada dokumen dipilih.</td></tr>}
          {lines.map((ln, i) => {
            if (ln.type === 'group') {
              return (
                <tr className="cetak-register-group" key={`g${i}`}>
                  <td className="mono">{ln.no}{ln.continuation && <span className="cetak-lanjutan"> (lanjutan)</span>}</td>
                  <td>{ln.tgl}</td>
                  <td colSpan={labelSpan}>{ln.label}</td>
                  <td>{ln.isBatal ? 'BATAL' : 'Aktif'}</td>
                </tr>
              );
            }
            if (ln.type === 'empty') return <tr key={`e${i}`}><td colSpan={totalCols} className="empty">Tidak ada item.</td></tr>;
            const it = ln.item;
            return (
              <tr key={`i${i}`}>
                <td style={{paddingLeft:18}}>{ln.idx}. {it.nama}</td>
                <td className="mono">{it.kode}</td>
                {it.values.map((v,vi) => <td key={vi} className={columns[vi].numeric ? 'num' : ''}>{v}</td>)}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div className="grand">Grand Total Item<span>{totalItems}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${brgFmtTgl(new Date().toISOString())} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

function BrgCetakModal({ docLabel, rows, columns, getItems, getGroupLabel, groupLabelText='Gudang', initialSelected, onClose }) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', telpon:'', email:'', noNpwp:'' };
  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [noAwal, setNoAwal] = React.useState('');
  const [noAkhir, setNoAkhir] = React.useState('');
  const [statusVal, setStatusVal] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set(initialSelected && initialSelected.length ? initialSelected : rows.map(r => r.noBukti)));
  const [previewMode, setPreviewMode] = React.useState('bukti'); // 'bukti' | 'register'
  const [zoom, setZoom] = React.useState(100);

  const itemsOf = (r) => getItems(r);
  const labelOf = (r) => (getGroupLabel ? getGroupLabel(r) : '');

  const filtered = rows.filter(r => {
    if (tglAwal && r.tglBukti < tglAwal) return false;
    if (tglAkhir && r.tglBukti > tglAkhir) return false;
    if (noAwal && r.noBukti < noAwal) return false;
    if (noAkhir && r.noBukti > noAkhir) return false;
    if (statusVal === 'aktif' && r.batal) return false;
    if (statusVal === 'batal' && !r.batal) return false;
    if (search && !r.noBukti.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r.noBukti));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(r => next.delete(r.noBukti)); return next; }
    const next = new Set(prev); filtered.forEach(r => next.add(r.noBukti)); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });

  const selectedRows = rows.filter(r => selected.has(r.noBukti));
  const registerLines = previewMode === 'register' ? brgBuildRegisterLines(selectedRows, itemsOf, labelOf) : [];
  const registerPages = previewMode === 'register' ? brgChunk(registerLines, BRG_REGISTER_ROWS_PER_PAGE) : [[]];
  const registerTotalItems = React.useMemo(() => registerLines.filter(ln => ln.type === 'item').length, [registerLines]);
  const totalPages = previewMode === 'register' ? registerPages.length : Math.max(1, selectedRows.length);

  const tglRangeLabel = tglAwal || tglAkhir
    ? `${brgFmtTgl(tglAwal) || '—'} s/d ${brgFmtTgl(tglAkhir) || '—'}`
    : (() => {
        if (selectedRows.length === 0) return '—';
        const sorted = [...selectedRows].map(r => r.tglBukti).sort();
        return sorted[0] === sorted[sorted.length-1] ? brgFmtTgl(sorted[0]) : `${brgFmtTgl(sorted[0])} s/d ${brgFmtTgl(sorted[sorted.length-1])}`;
      })();

  const doCetak = () => {
    window.__erpToast && window.__erpToast(`Cetak dikirim ke printer (${selectedRows.length} dokumen).`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal cetak-modal" style={{maxWidth:1400, maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Cetak {docLabel}</h2><div className="sub">Pastikan semua kolom filter terisi sesuai kebutuhan.</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="cetak-body">
          <div className="cetak-filter panel">
            <h3>Filter Cetak</h3>
            <div className="form-grid-2" style={{gap:10}}>
              <div className="field"><label>Tgl Awal</label><input className="input" type="date" value={tglAwal} onChange={e=>setTglAwal(e.target.value)}/></div>
              <div className="field"><label>Tgl Akhir</label><input className="input" type="date" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)}/></div>
              <div className="field"><label>No Bukti Awal</label><input className="input mono" value={noAwal} onChange={e=>setNoAwal(e.target.value)}/></div>
              <div className="field"><label>No Bukti Akhir</label><input className="input mono" value={noAkhir} onChange={e=>setNoAkhir(e.target.value)}/></div>
            </div>
            <div className="field"><label>Status</label>
              <select className="select" value={statusVal} onChange={e=>setStatusVal(e.target.value)}>
                <option value="">Semua</option>
                <option value="aktif">Aktif</option>
                <option value="batal">Batal</option>
              </select>
            </div>
            <div className="field">
              <label>Pilih No Bukti</label>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari No Bukti…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            </div>
            <div className="cetak-checklist">
              <div className="cetak-checklist-row head">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
                <span>No Bukti</span>
              </div>
              <div className="cetak-checklist-scroll">
                {filtered.length === 0 && <div className="empty" style={{padding:'16px 0'}}>Tidak ada data.</div>}
                {filtered.map(r => (
                  <label key={r.noBukti} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(r.noBukti)} onChange={()=>toggleOne(r.noBukti)}/>
                    <span className="mono">{r.noBukti}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button className={`btn ${previewMode==='bukti' ? 'btn-primary' : 'btn-soft'}`} style={{flex:1, justifyContent:'center'}} onClick={()=>setPreviewMode('bukti')}>{I.print()} Bukti ({selectedRows.length})</button>
              <button className={`btn ${previewMode==='register' ? 'btn-primary' : 'btn-soft'}`} style={{flex:1, justifyContent:'center'}} onClick={()=>setPreviewMode('register')}>{I.print()} Register ({selectedRows.length})</button>
            </div>
          </div>

          <div className="cetak-preview-pane">
            <div className="cetak-toolbar">
              <span className="cetak-pageof">{selectedRows.length===0 ? '0 halaman' : previewMode==='register' ? `${totalPages} halaman` : `${selectedRows.length} dokumen`}</span>
              <div style={{display:'flex', gap:4, alignItems:'center'}}>
                <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.max(50,z-10))}>−</button>
                <span className="cetak-pageof">{zoom}%</span>
                <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.min(150,z+10))}>+</button>
              </div>
            </div>
            <div className="cetak-canvas cetak-canvas-scroll">
              {selectedRows.length === 0 ? (
                <div className="empty" style={{padding:'60px 0'}}>Belum ada dokumen dipilih untuk dicetak.</div>
              ) : previewMode === 'register' ? (
                registerPages.map((lines, idx) => (
                  <div className="cetak-page" key={idx} style={{transform:`scale(${zoom/100})`}}>
                    <BrgCetakRegisterBody lines={lines} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel} columns={columns}
                      pageInfo={{current:idx+1, total:totalPages}} totalItems={registerTotalItems} isLastPage={idx === totalPages-1} />
                  </div>
                ))
              ) : (
                selectedRows.map((row, idx) => (
                  <div className="cetak-page" key={row.noBukti || idx} style={{transform:`scale(${zoom/100})`}}>
                    <BrgCetakBuktiBody row={row} docLabel={docLabel} orgInfo={orgInfo} items={itemsOf(row)} columns={columns}
                      groupLabel={labelOf(row)} groupLabelText={groupLabelText} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk tutup</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Tutup</button>
            <button className="btn btn-primary" onClick={doCetak} disabled={selectedRows.length===0}>{I.print()} Cetak ({selectedRows.length}x)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
