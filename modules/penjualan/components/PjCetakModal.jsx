// Penjualan — popup "Cetak" generik dipakai semua dokumen (Konfirmasi Order/Sales Order/Delivery
// Order/Invoice/Sales Return). Sama pola & fitur dengan PbCetakModal (Pembelian) — kiri filter
// (tanggal, No Bukti, status, checklist multi-pilih), kanan preview HTML digenerate dari data
// (mode "Bukti" 1 dokumen/halaman, mode "Register" gabungan semua dokumen terpilih).
//
// Beda dari Pembelian:
// - Field key nama dokumen (No Bukti/Tgl Bukti/Status/Batal/daftar item) BISA beda antar halaman
//   Penjualan — 4 dari 5 (SO/DO/Invoice/Sales Return) pakai No_Bukti/Tgl_Bukti/Status/Batal/Details
//   seperti Pembelian, tapi Konfirmasi Order (KO) pakai huruf kecil semua: noBukti/tglBukti/status/
//   barang (tanpa field Batal terpisah, batal dicek dari status==='BATAL'). Makanya field key-nya
//   dibuat prop opsional (noBuktiKey/tglBuktiKey/statusKey/batalKey/itemsKey), default ke konvensi
//   4 dokumen yang mayoritas, KO pass override-nya sendiri.
// - Semua dokumen Penjualan SELALU priced (Hrg_Sat ada di tiap baris item), jadi PjCetakBuktiBody
//   tidak perlu mode ganda seperti Pembelian — selalu tampil Kuantum/Harga Satuan/Jumlah + Sub
//   Total/Discount/PPN/Grand Total, dan tanda tangan tunggal "Hormat kami," (bukan Disetujui/Pemohon).
//
// Dipanggil dari tiap halaman dokumen:
//   <PjCetakModal docLabel="Sales Order" rows={rows} statusFilter={statusFilter}
//     getGroupLabel={r => r.Nama_Cust} initialSelected={cetakRow ? [cetakRow.No_Bukti] : null}
//     onClose={...} />

function pjFmtTgl(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// Default item extractor — semua dokumen Penjualan (termasuk `barang` KO) konsisten pakai
// Kode_Item/Nama_Item/Jumlah/Satuan/Hrg_Sat/DiscPros_Det/DiscNilai_Det, jadi cukup 1 extractor
// generik + `itemsKey` yang bisa diganti ('Details' vs 'barang').
function pjCetakDefaultItems(row, itemsKey) {
  return (row[itemsKey] || []).map(d => ({
    kode: d.Kode_Item, nama: d.Nama_Item, jumlah: +d.Jumlah || 0, satuan: d.Satuan,
    hrgSatuan: +d.Hrg_Sat || 0, total: pjLineTotal(d),
  }));
}

// Ratakan (dokumen + item) jadi satu daftar baris, lalu potong per PJ_REGISTER_ROWS_PER_PAGE
// baris — pendekatan sederhana ala laporan cetak asli (tabel otomatis lanjut ke halaman
// berikutnya kalau melebihi kapasitas 1 kertas), bukan pengukuran piksel yang presisi.
const PJ_REGISTER_ROWS_PER_PAGE = 16;
function pjBuildRegisterLines(rows, itemsOf, labelOf, isBatalRow, getNo, getTgl) {
  const lines = [];
  rows.forEach(r => {
    lines.push({ type:'group', no:getNo(r), tgl:pjFmtTgl(getTgl(r)), label:labelOf(r), isBatal:isBatalRow(r) });
    const items = itemsOf(r);
    if (items.length === 0) lines.push({ type:'empty' });
    else items.forEach((it,i) => lines.push({ type:'item', item:it, idx:i+1 }));
  });
  return lines;
}
// Beda dari potong rata biasa: kalau sebuah halaman mulai di TENGAH daftar item suatu dokumen
// (bukan pas di baris "group"-nya), baris group dokumen itu diulang di awal halaman itu dengan
// tanda "(lanjutan)" — supaya user tidak pernah melihat baris item nyasar tanpa tahu itu
// kelanjutan dokumen yang mana.
function pjChunk(lines, size) {
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

function PjCetakBuktiBody({ no, docLabel, orgInfo, items, groupLabel, tglLabel, isBatal }) {
  const subTotal = items.reduce((s,it) => s + (it.total || 0), 0);
  return (
    <div className="cetak-doc">
      {isBatal && <div className="cetak-watermark">BATAL</div>}
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
        {orgInfo.email && <div>Email : {orgInfo.email}</div>}
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">INVOICE</div>
        <div className="cetak-title-no">No. {no}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>Kepada Yth.</div>
          {groupLabel && <b>{groupLabel}</b>}
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Tanggal</span><span>: {tglLabel}</span></div>
          <div className="cetak-meta-row"><span>Status</span><span>: {isBatal ? 'BATAL' : 'Aktif'}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead><tr><th style={{width:28}}>No</th><th>Nama Barang</th><th style={{width:80}}>Satuan</th><th style={{width:80}}>Kuantum</th><th style={{width:110}}>Harga Satuan</th><th style={{width:110}}>Jumlah</th></tr></thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan={6} className="empty">Tidak ada item.</td></tr>}
          {items.map((it,i) => (
            <tr key={i}>
              <td>{i+1}.</td>
              <td>{it.nama}</td>
              <td>{it.satuan}</td>
              <td className="num">{it.jumlah}</td>
              <td className="num">{fmtRp(it.hrgSatuan)}</td>
              <td className="num">{fmtRp(it.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cetak-foot">
        <div className="cetak-sign">
          <div className="cetak-sign-box"><div className="line" /><div>Hormat kami,</div></div>
        </div>
        <div className="cetak-summary">
          <div>Sub Total<span>{fmtRp(subTotal)}</span></div>
          <div className="grand">Grand Total<span>{fmtRp(subTotal)}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {pjFmtTgl(new Date().toISOString())} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

// Register dipaginasi jadi beberapa "kertas" (lihat pjBuildRegisterLines/pjChunk di PjCetakModal)
// supaya kontennya tidak melebihi 1 halaman terus-menerus discroll. Grand Total (dihitung dari
// SEMUA dokumen terpilih, bukan cuma halaman ini) cuma muncul di halaman terakhir; tiap halaman
// tetap punya footer "Halaman X dari Y" supaya terasa nyambung sebagai 1 dokumen cetak.
function PjCetakRegisterBody({ lines, docLabel, orgInfo, tglRangeLabel, pageInfo, grandTotal, isLastPage }) {
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
        <thead><tr><th>Nama Barang</th><th style={{width:80}}>Satuan</th><th style={{width:80}}>Kuantum</th><th style={{width:110}}>Harga Satuan</th><th style={{width:110}}>Jumlah</th></tr></thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={5} className="empty">Tidak ada dokumen dipilih.</td></tr>}
          {lines.map((ln, i) => {
            if (ln.type === 'group') {
              return (
                <tr className="cetak-register-group" key={`g${i}`}>
                  <td className="mono">{ln.no}{ln.continuation && <span className="cetak-lanjutan"> (lanjutan)</span>}</td>
                  <td>{ln.tgl}</td>
                  <td colSpan={2}>{ln.label}</td>
                  <td>{ln.isBatal ? 'BATAL' : 'Aktif'}</td>
                </tr>
              );
            }
            if (ln.type === 'empty') {
              return <tr key={`e${i}`}><td colSpan={5} className="empty">Tidak ada item.</td></tr>;
            }
            const it = ln.item;
            return (
              <tr key={`i${i}`}>
                <td style={{paddingLeft:18}}>{ln.idx}. {it.nama}</td>
                <td>{it.satuan}</td>
                <td className="num">{it.jumlah}</td>
                <td className="num">{fmtRp(it.hrgSatuan)}</td>
                <td className="num">{fmtRp(it.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div className="grand">Grand Total<span>{fmtRp(grandTotal)}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${pjFmtTgl(new Date().toISOString())} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

function PjCetakModal({
  docLabel, rows, statusFilter, getItems, getGroupLabel, initialSelected, onClose,
  noBuktiKey='No_Bukti', tglBuktiKey='Tgl_Bukti', statusKey='Status', batalKey='Batal', itemsKey='Details',
}) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', telpon:'', email:'', noNpwp:'' };
  const getNo = (r) => r[noBuktiKey];
  const getTgl = (r) => r[tglBuktiKey];
  const isBatalRow = (r) => !!(r[batalKey] || r[statusKey] === 'BATAL');
  const itemsOf = (r) => (getItems ? getItems(r) : pjCetakDefaultItems(r, itemsKey));
  const labelOf = (r) => (getGroupLabel ? getGroupLabel(r) : '');

  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [noAwal, setNoAwal] = React.useState('');
  const [noAkhir, setNoAkhir] = React.useState('');
  const [statusVal, setStatusVal] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set(initialSelected && initialSelected.length ? initialSelected : rows.map(getNo)));
  const [previewMode, setPreviewMode] = React.useState('bukti'); // 'bukti' | 'register'
  const [zoom, setZoom] = React.useState(100);

  const filtered = rows.filter(r => {
    if (tglAwal && getTgl(r) < tglAwal) return false;
    if (tglAkhir && getTgl(r) > tglAkhir) return false;
    if (noAwal && getNo(r) < noAwal) return false;
    if (noAkhir && getNo(r) > noAkhir) return false;
    if (statusFilter && statusVal && !statusFilter.match(r, statusVal)) return false;
    if (search && !getNo(r).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(getNo(r)));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(r => next.delete(getNo(r))); return next; }
    const next = new Set(prev); filtered.forEach(r => next.add(getNo(r))); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });

  const selectedRows = rows.filter(r => selected.has(getNo(r)));
  const registerLines = previewMode === 'register' ? pjBuildRegisterLines(selectedRows, itemsOf, labelOf, isBatalRow, getNo, getTgl) : [];
  const registerPages = previewMode === 'register' ? pjChunk(registerLines, PJ_REGISTER_ROWS_PER_PAGE) : [[]];
  const registerGrandTotal = React.useMemo(() => registerLines.reduce((s, ln) => s + (ln.type === 'item' ? (ln.item.total || 0) : 0), 0), [registerLines]);
  const totalPages = previewMode === 'register' ? registerPages.length : Math.max(1, selectedRows.length);

  const tglRangeLabel = tglAwal || tglAkhir
    ? `${pjFmtTgl(tglAwal) || '—'} s/d ${pjFmtTgl(tglAkhir) || '—'}`
    : (() => {
        if (selectedRows.length === 0) return '—';
        const sorted = [...selectedRows].map(getTgl).sort();
        return sorted[0] === sorted[sorted.length-1] ? pjFmtTgl(sorted[0]) : `${pjFmtTgl(sorted[0])} s/d ${pjFmtTgl(sorted[sorted.length-1])}`;
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
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div className="field"><label>Tgl Awal</label><input className="input" type="date" value={tglAwal} onChange={e=>setTglAwal(e.target.value)}/></div>
              <div className="field"><label>Tgl Akhir</label><input className="input" type="date" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)}/></div>
              <div className="field"><label>No Bukti Awal</label><input className="input mono" value={noAwal} onChange={e=>setNoAwal(e.target.value)}/></div>
              <div className="field"><label>No Bukti Akhir</label><input className="input mono" value={noAkhir} onChange={e=>setNoAkhir(e.target.value)}/></div>
            </div>
            {statusFilter && (
              <div className="field"><label>Status</label>
                <select className="select" value={statusVal} onChange={e=>setStatusVal(e.target.value)}>
                  <option value="">Semua</option>
                  {statusFilter.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
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
                  <label key={getNo(r)} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(getNo(r))} onChange={()=>toggleOne(getNo(r))}/>
                    <span className="mono">{getNo(r)}</span>
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
                    <PjCetakRegisterBody lines={lines} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel}
                      pageInfo={{current:idx+1, total:totalPages}} grandTotal={registerGrandTotal} isLastPage={idx === totalPages-1} />
                  </div>
                ))
              ) : (
                selectedRows.map((row, idx) => (
                  <div className="cetak-page" key={getNo(row) || idx} style={{transform:`scale(${zoom/100})`}}>
                    <PjCetakBuktiBody no={getNo(row)} docLabel={docLabel} orgInfo={orgInfo}
                      items={itemsOf(row)} groupLabel={labelOf(row)}
                      tglLabel={pjFmtTgl(getTgl(row))} isBatal={isBatalRow(row)} />
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
