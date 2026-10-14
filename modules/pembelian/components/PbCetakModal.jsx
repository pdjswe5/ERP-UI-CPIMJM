// Pembelian — popup "Cetak" generik dipakai semua dokumen (PR/RFQ/Quotation/PO/Nota Pembelian/
// Retur Beli/GR). Kiri: filter (tanggal, No Bukti, status, checklist multi-pilih). Kanan: preview
// dokumen — keduanya HTML digenerate dari data (bukan PDF statis): mode "Bukti" nampilin SATU
// dokumen per halaman (letterhead/No/Tgl/item/tanda tangan/ringkasan, lihat PbCetakBuktiBody),
// mode "Register" gabungan SEMUA dokumen terpilih berurutan dalam satu cetakan (lihat
// PbCetakRegisterBody), ditutup ringkasan Bahan Baku/Jadi/Lain gabungan semuanya. Layout kedua
// mode mengikuti tata letak dokumen PDF referensi (letterhead kiri, judul+No/Tgl kanan, tabel
// item, tanda tangan Disetujui/Pemohon, kotak Ringkasan Item, timestamp cetak).
//
// Dipanggil dari tiap halaman dokumen:
//   <PbCetakModal docLabel="Permintaan Pembelian" rows={rows} statusFilter={statusFilter}
//     getGroupLabel={r => pbOrgNama(r.Kode_PurchasingORG)} initialSelected={cetakRow ? [cetakRow.No_Bukti] : null}
//     onClose={...} />
// `getGroupLabel` opsional (label tambahan di header dokumen, mis. nama Purchasing Org/Supplier).
// `initialSelected` opsional — array No_Bukti yang otomatis dicentang saat modal dibuka; kalau
// null/undefined semua baris (hasil filter) dicentang seperti biasa. Dipakai untuk cetak per-row:
// klik icon Cetak di satu baris list buka modal ini dengan cuma baris itu yang tercentang, user
// tetap bisa menambah/mengurangi pilihan dari situ.
const PB_JENIS_LABEL = { BAKU:'Bahan Baku', JADI:'Bahan Jadi', LAIN:'Bahan Lain' };

function pbFmtTgl(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

// Default item extractor kalau pemanggil tidak kasih `getItems` — cukup untuk 7 dokumen Pembelian
// karena semua baris barangnya (Details) konsisten pakai Kode_Item/Nama_Item/Satuan, & Qty atau
// Jumlah (baris biaya). Kategori Bahan Baku/Jadi/Lain diambil dari PB_PRODUK (master.data.jsx).
function pbCetakDefaultItems(row) {
  return (row.Details || []).map(d => {
    const jumlah = d.Qty ?? d.Jumlah ?? 0;
    const hrgSatuan = +d.Hrg_Sat || PB_PRODUK.find(p => p.kode === d.Kode_Item)?.harga || 0;
    return {
      kode: d.Kode_Item, nama: d.Nama_Item, jumlah, satuan: d.Satuan,
      jenis: pbProdukJenis(d.Kode_Item), hrgSatuan, total: hrgSatuan * jumlah,
    };
  });
}

// Layout mengikuti dokumen PDF referensi (kop surat rata kiri + garis rangkap, judul digeser
// spasi & digarisbawahi di tengah, No dokumen di bawahnya, blok "Kepada Yth." kiri + meta kanan,
// tabel item, footer ringkasan). Kalau ada item yang punya harga (hrgSatuan>0, dicek `hasHarga`)
// tabel & ringkasan-nya ikut tampilkan Harga Satuan/Jumlah Rp + Sub Total/PPN/Grand Total —
// dokumen tanpa harga (PR/RFQ/GR) tetap fallback ke Qty polos + Ringkasan Item Bahan Baku/Jadi/Lain.
function PbCetakBuktiBody({ row, docLabel, orgInfo, getItems, groupLabel }) {
  const items = getItems(row);
  const hasHarga = items.some(it => (it.hrgSatuan || 0) > 0);
  const counts = { BAKU:0, JADI:0, LAIN:0 };
  items.forEach(it => { counts[it.jenis === 'BAKU' || it.jenis === 'JADI' ? it.jenis : 'LAIN']++; });
  const subTotal = items.reduce((s,it) => s + (it.total || 0), 0);
  const isBatal = !!(row.Batal || row.Status === 'BATAL');
  return (
    <div className="cetak-doc">
      {isBatal && <div className="cetak-watermark">BATAL</div>}
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
        {orgInfo.email && <div>Email : {orgInfo.email}</div>}
        {orgInfo.noNpwp && <div>NPWP {orgInfo.noNpwp}</div>}
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">INVOICE</div>
        <div className="cetak-title-no">No. {row.No_Bukti}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>Kepada Yth.</div>
          {groupLabel && <b>{groupLabel}</b>}
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Tanggal</span><span>: {pbFmtTgl(row.Tgl_Bukti)}</span></div>
          <div className="cetak-meta-row"><span>Status</span><span>: {isBatal ? 'BATAL' : 'Aktif'}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead>
          <tr>
            <th style={{width:28}}>No</th><th>Nama Barang</th><th style={{width:140}}>Kode</th>
            {hasHarga ? (<><th style={{width:80}}>Satuan</th><th style={{width:80}}>Kuantum</th><th style={{width:110}}>Harga Satuan</th><th style={{width:110}}>Jumlah</th></>) : (<><th style={{width:100}}>Jenis</th><th style={{width:90}}>Jumlah</th></>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan={hasHarga ? 7 : 5} className="empty">Tidak ada item.</td></tr>}
          {items.map((it,i) => (
            <tr key={i}>
              <td>{i+1}.</td>
              <td>{it.nama}</td>
              <td className="mono">{it.kode}</td>
              {hasHarga ? (<>
                <td>{it.satuan}</td>
                <td className="num">{it.jumlah}</td>
                <td className="num">{fmtRp(it.hrgSatuan)}</td>
                <td className="num">{fmtRp(it.total)}</td>
              </>) : (<>
                <td>{PB_JENIS_LABEL[it.jenis] || it.jenis}</td>
                <td className="num">{it.jumlah} {it.satuan}</td>
              </>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cetak-foot">
        <div className="cetak-sign">
          <div className="cetak-sign-box"><div className="line" /><div>Disetujui</div></div>
          <div className="cetak-sign-box"><div className="line" /><div>Pemohon</div><b>PDJ Administrator</b></div>
        </div>
        {hasHarga ? (
          <div className="cetak-summary">
            <div>Sub Total<span>{fmtRp(subTotal)}</span></div>
            <div className="grand">Grand Total<span>{fmtRp(subTotal)}</span></div>
          </div>
        ) : (
          <div className="cetak-summary">
            <div><b>Ringkasan Item</b></div>
            <div>Bahan Baku<span>{counts.BAKU}</span></div>
            <div>Bahan Jadi<span>{counts.JADI}</span></div>
            <div>Bahan Lain<span>{counts.LAIN}</span></div>
            <div className="grand">Grand Total<span>{items.length}</span></div>
          </div>
        )}
      </div>
      <div className="cetak-timestamp">Dicetak pada {pbFmtTgl(new Date().toISOString())} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

// Register dipaginasi jadi beberapa "kertas" (lihat pbBuildRegisterPages di PbCetakModal) supaya
// kontennya tidak melebihi 1 halaman terus-menerus discroll — tiap halaman dapat baris (`lines`)
// yang jadi jatahnya saja. Ringkasan Item/Grand Total (dihitung dari SEMUA dokumen terpilih,
// bukan cuma halaman ini) cuma muncul di halaman terakhir; tiap halaman tetap punya footer
// "Halaman X dari Y" supaya York halaman-halaman itu terasa nyambung sebagai 1 dokumen cetak.
function PbCetakRegisterBody({ lines, docLabel, orgInfo, tglRangeLabel, pageInfo, summary, isLastPage }) {
  return (
    <div className="cetak-doc">
      <div className="cetak-kop">
        <div className="cetak-kop-left">
          <b>{orgInfo.nama}</b>
          <div>{orgInfo.alamat}</div>
          <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
          {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
          {orgInfo.email && <div>Email : {orgInfo.email}</div>}
          {orgInfo.noNpwp && <div>NPWP {orgInfo.noNpwp}</div>}
        </div>
        <div className="cetak-kop-center">{docLabel}</div>
        <div className="cetak-kop-right">Tgl. Bukti<br/>{tglRangeLabel}</div>
      </div>
      <table className="cetak-table">
        <thead><tr><th>Nama Item</th><th style={{width:140}}>Kode</th><th style={{width:110}}>Jenis</th><th style={{width:90}}>Jumlah</th></tr></thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={4} className="empty">Tidak ada dokumen dipilih.</td></tr>}
          {lines.map((ln, i) => {
            if (ln.type === 'group') {
              return (
                <tr className="cetak-register-group" key={`g${i}`}>
                  <td className="mono">{ln.no}{ln.continuation && <span className="cetak-lanjutan"> (lanjutan)</span>}</td>
                  <td>{ln.tgl}</td>
                  <td>{ln.label}</td>
                  <td>{ln.isBatal ? 'BATAL' : 'Aktif'}</td>
                </tr>
              );
            }
            if (ln.type === 'empty') {
              return <tr key={`e${i}`}><td colSpan={4} className="empty">Tidak ada item.</td></tr>;
            }
            const it = ln.item;
            return (
              <tr key={`i${i}`}>
                <td style={{paddingLeft:18}}>{ln.idx}. {it.nama}</td>
                <td className="mono">{it.kode}</td>
                <td>{PB_JENIS_LABEL[it.jenis] || it.jenis}</td>
                <td className="num">{it.jumlah} {it.satuan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div><b>Ringkasan Item</b></div>
            <div>Bahan Baku<span>{summary.counts.BAKU}</span></div>
            <div>Bahan Jadi<span>{summary.counts.JADI}</span></div>
            <div>Bahan Lain<span>{summary.counts.LAIN}</span></div>
            <div className="grand">Grand Total<span>{summary.grandTotal}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${pbFmtTgl(new Date().toISOString())} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

// Ratakan (dokumen + item) jadi satu daftar baris, lalu potong per PB_REGISTER_ROWS_PER_PAGE
// baris — pendekatan sederhana ala laporan cetak asli (tabel yang otomatis lanjut ke halaman
// berikutnya kalau melebihi kapasitas 1 kertas), bukan pengukuran piksel yang presisi.
const PB_REGISTER_ROWS_PER_PAGE = 16;
function pbBuildRegisterLines(rows, itemsOf, labelOf) {
  const lines = [];
  rows.forEach(r => {
    lines.push({ type:'group', no:r.No_Bukti, tgl:pbFmtTgl(r.Tgl_Bukti), label:labelOf(r), isBatal: !!(r.Batal || r.Status === 'BATAL') });
    const items = itemsOf(r);
    if (items.length === 0) lines.push({ type:'empty' });
    else items.forEach((it,i) => lines.push({ type:'item', item:it, idx:i+1 }));
  });
  return lines;
}
// Beda dari potong rata biasa: kalau sebuah halaman mulai di TENGAH daftar item suatu dokumen
// (bukan pas di baris "group"-nya), baris group dokumen itu diulang di awal halaman itu dengan
// tanda "(lanjutan)" — supaya user tidak pernah melihat baris item nyasar tanpa tahu itu
// kelanjutan dokumen yang mana (bug yang dilaporkan: halaman baru mulai langsung dari item
// bernomor tanpa header dokumennya).
function pbChunk(lines, size) {
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

function PbCetakModal({ docLabel, rows, statusFilter, getItems, getGroupLabel, initialSelected, onClose }) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', telpon:'', email:'', noNpwp:'' };
  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [noAwal, setNoAwal] = React.useState('');
  const [noAkhir, setNoAkhir] = React.useState('');
  const [statusVal, setStatusVal] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set(initialSelected && initialSelected.length ? initialSelected : rows.map(r => r.No_Bukti)));
  const [previewMode, setPreviewMode] = React.useState('bukti'); // 'bukti' | 'register'
  const [zoom, setZoom] = React.useState(100);

  const filtered = rows.filter(r => {
    if (tglAwal && r.Tgl_Bukti < tglAwal) return false;
    if (tglAkhir && r.Tgl_Bukti > tglAkhir) return false;
    if (noAwal && r.No_Bukti < noAwal) return false;
    if (noAkhir && r.No_Bukti > noAkhir) return false;
    if (statusFilter && statusVal && !statusFilter.match(r, statusVal)) return false;
    if (search && !r.No_Bukti.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r.No_Bukti));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(r => next.delete(r.No_Bukti)); return next; }
    const next = new Set(prev); filtered.forEach(r => next.add(r.No_Bukti)); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });

  const selectedRows = rows.filter(r => selected.has(r.No_Bukti));
  const itemsOf = (r) => (getItems || pbCetakDefaultItems)(r);
  const labelOf = (r) => (getGroupLabel ? getGroupLabel(r) : '');
  const registerLines = previewMode === 'register' ? pbBuildRegisterLines(selectedRows, itemsOf, labelOf) : [];
  const registerPages = previewMode === 'register' ? pbChunk(registerLines, PB_REGISTER_ROWS_PER_PAGE) : [[]];
  const registerSummary = React.useMemo(() => {
    const counts = { BAKU:0, JADI:0, LAIN:0 };
    let grandTotal = 0;
    registerLines.forEach(ln => { if (ln.type === 'item') { counts[ln.item.jenis === 'BAKU' || ln.item.jenis === 'JADI' ? ln.item.jenis : 'LAIN']++; grandTotal++; } });
    return { counts, grandTotal };
  }, [registerLines]);
  const totalPages = previewMode === 'register' ? registerPages.length : Math.max(1, selectedRows.length);

  const tglRangeLabel = tglAwal || tglAkhir
    ? `${pbFmtTgl(tglAwal) || '—'} s/d ${pbFmtTgl(tglAkhir) || '—'}`
    : (() => {
        if (selectedRows.length === 0) return '—';
        const sorted = [...selectedRows].map(r => r.Tgl_Bukti).sort();
        return sorted[0] === sorted[sorted.length-1] ? pbFmtTgl(sorted[0]) : `${pbFmtTgl(sorted[0])} s/d ${pbFmtTgl(sorted[sorted.length-1])}`;
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
                  <label key={r.No_Bukti} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(r.No_Bukti)} onChange={()=>toggleOne(r.No_Bukti)}/>
                    <span className="mono">{r.No_Bukti}</span>
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
                    <PbCetakRegisterBody lines={lines} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel}
                      pageInfo={{current:idx+1, total:totalPages}} summary={registerSummary} isLastPage={idx === totalPages-1} />
                  </div>
                ))
              ) : (
                selectedRows.map((row, idx) => (
                  <div className="cetak-page" key={row.No_Bukti || idx} style={{transform:`scale(${zoom/100})`}}>
                    <PbCetakBuktiBody row={row} docLabel={docLabel} orgInfo={orgInfo} getItems={getItems || pbCetakDefaultItems} groupLabel={getGroupLabel ? getGroupLabel(row) : ''} />
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
