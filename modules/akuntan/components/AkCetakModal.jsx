// Akuntan — popup "Cetak" generate-HTML untuk Aktiva & Jurnal Memorial (pola sama dengan
// PbCetakModal/PjCetakModal/BrgCetakModal: filter kiri + checklist multi-pilih, kanan preview
// Bukti/Register continuous-scroll, font Times New Roman via .cetak-page). Beda dari
// Pembelian/Penjualan/Barang: Aktiva TIDAK punya bentuk header+lineitems (1 baris = 1 aset, seperti
// kartu), sedangkan Jurnal Memorial PUNYA (header + baris debit/kredit) — makanya 1 modal ini
// dibedakan lewat prop `variant`, bukan dipaksa 1 bentuk generik seperti BrgCetakModal.
//
// Dipanggil:
//   <AkCetakModal variant="aktiva" docLabel="Katalog Aktiva" rows={aktivaRows} noKey="kode" tglKey="tglBeli"
//     statusFilter={{options:[{value:'true',label:'Aktif'},{value:'false',label:'Non-aktif'}], match:(r,v)=>String(r.aktif)===v}}
//     initialSelected={cetakRow?[cetakRow.kode]:null} onClose={...} />
//   <AkCetakModal variant="jurnal" docLabel="Jurnal Memorial" rows={jurnalRows} noKey="no" tglKey="tgl"
//     akunRows={akunRows} statusFilter={{options:AK_STATUS_JURNAL_OPTS.map(s=>({value:s,label:s})), match:(r,v)=>r.status===v}}
//     initialSelected={cetakRow?[cetakRow.no]:null} onClose={...} />
// Tidak pakai backdrop onClick (klik luar popup tidak boleh menutup modal — fix repo-wide sesi ini).

function akFmtTgl(dmy) { return dmy || '—'; }
function akFmtTglNow() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

const AK_REGISTER_ROWS_PER_PAGE = 16;

// ── Aktiva: Bukti = kartu info 1 aset (bukan dokumen+item, karena 1 baris memang 1 aset utuh) ──
function AkCetakAktivaBuktiBody({ row, orgInfo }) {
  return (
    <div className="cetak-doc">
      {!row.aktif && <div className="cetak-watermark">NON-AKTIF</div>}
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
        {orgInfo.email && <div>Email : {orgInfo.email}</div>}
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">KARTU AKTIVA TETAP</div>
        <div className="cetak-title-no">No. {row.kode}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>Nama Aktiva</div>
          <b>{row.nama}</b>
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Kategori</span><span>: {AK_KATEGORI_AKTIVA_OPTS.find(k=>k.kode===row.kategori)?.nama || row.kategori || '—'}</span></div>
          <div className="cetak-meta-row"><span>No. Kelompok</span><span>: {row.noKelompok || '—'}</span></div>
          <div className="cetak-meta-row"><span>Compro</span><span>: {row.compro || '—'}</span></div>
          <div className="cetak-meta-row"><span>Tgl. Beli</span><span>: {akFmtTgl(row.tglBeli)}</span></div>
          <div className="cetak-meta-row"><span>No. Bukti</span><span>: {row.noBukti || '—'}</span></div>
          <div className="cetak-meta-row"><span>Status</span><span>: {row.aktif ? 'Aktif' : `Non-aktif${row.tglJual ? ' (dijual '+akFmtTgl(row.tglJual)+')' : ''}`}</span></div>
        </div>
      </div>
      <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
        <div className="cetak-summary">
          <div>Harga Perolehan<span>{fmtRp(row.harga)}</span></div>
          <div>Akm. Penyusutan<span>{fmtRp(row.susut)}</span></div>
          <div className="grand">Nilai Buku<span>{fmtRp(row.nilai)}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {akFmtTglNow()} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

// Register Aktiva: flat (1 baris tabel = 1 aset), tanpa continuation karena tidak ada sub-item
// yang bisa terpotong halaman — beda dari Jurnal yang punya baris debit/kredit di bawahnya.
function AkCetakAktivaRegisterBody({ rows, docLabel, orgInfo, tglRangeLabel, pageInfo, summary, isLastPage }) {
  return (
    <div className="cetak-doc">
      <div className="cetak-kop">
        <div className="cetak-kop-left">
          <b>{orgInfo.nama}</b>
          <div>{orgInfo.alamat}</div>
          <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        </div>
        <div className="cetak-kop-center">{docLabel}</div>
        <div className="cetak-kop-right">Tgl. Beli<br/>{tglRangeLabel}</div>
      </div>
      <table className="cetak-table">
        <thead>
          <tr>
            <th style={{width:80}}>Kode</th><th>Nama Aktiva</th><th style={{width:90}}>Kategori</th><th style={{width:100}}>Tgl. Beli</th>
            <th className="num" style={{width:120}}>Harga Perolehan</th><th className="num" style={{width:120}}>Akm. Penyusutan</th><th className="num" style={{width:120}}>Nilai Buku</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={7} className="empty">Tidak ada aktiva dipilih.</td></tr>}
          {rows.map((r,i) => (
            <tr key={i}>
              <td className="mono">{r.kode}</td>
              <td>{r.nama}</td>
              <td>{AK_KATEGORI_AKTIVA_OPTS.find(k=>k.kode===r.kategori)?.nama || r.kategori}</td>
              <td>{akFmtTgl(r.tglBeli)}</td>
              <td className="num">{fmtRp(r.harga)}</td>
              <td className="num">{fmtRp(r.susut)}</td>
              <td className="num">{fmtRp(r.nilai)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div>Jumlah Aktiva<span>{summary.count}</span></div>
            <div>Total Harga Perolehan<span>{fmtRp(summary.harga)}</span></div>
            <div>Total Penyusutan<span>{fmtRp(summary.susut)}</span></div>
            <div className="grand">Total Nilai Buku<span>{fmtRp(summary.nilai)}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${akFmtTglNow()} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

// ── Jurnal Memorial: Bukti = 1 dokumen (header + tabel debit/kredit), sama bentuknya dengan
// PO/Invoice di Pembelian/Penjualan sejak `lines` ditambahkan ke seed JURNAL_MEMO ──
function AkCetakJurnalBuktiBody({ row, orgInfo, akunRows, groupLabel }) {
  const lines = row.lines || [];
  const totalD = lines.reduce((s,l)=>s+(+l.d||0),0);
  const totalK = lines.reduce((s,l)=>s+(+l.k||0),0);
  return (
    <div className="cetak-doc">
      {row.status === 'Draft' && <div className="cetak-watermark">DRAFT</div>}
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">JURNAL MEMORIAL</div>
        <div className="cetak-title-no">No. {row.no}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>Dibuat oleh</div>
          {groupLabel && <b>{groupLabel}</b>}
          <div style={{marginTop:6}}>{row.desc}</div>
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Tanggal</span><span>: {akFmtTgl(row.tgl)}</span></div>
          <div className="cetak-meta-row"><span>Status</span><span>: {row.status}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead><tr><th style={{width:130}}>Akun</th><th>Deskripsi</th><th className="num" style={{width:120}}>Debit Rp</th><th className="num" style={{width:120}}>Kredit Rp</th></tr></thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={4} className="empty">Tidak ada baris jurnal.</td></tr>}
          {lines.map((l,i) => (
            <tr key={i}>
              <td className="mono">{l.akun} — {akAkunNama(l.akun, akunRows)}</td>
              <td>{l.desc}</td>
              <td className="num">{l.d ? fmtRp(l.d) : ''}</td>
              <td className="num">{l.k ? fmtRp(l.k) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cetak-foot">
        <div className="cetak-sign">
          <div className="cetak-sign-box"><div className="line" /><div>Disetujui</div></div>
          <div className="cetak-sign-box"><div className="line" /><div>Dibuat oleh</div><b>{groupLabel}</b></div>
        </div>
        <div className="cetak-summary">
          <div>Total Debit<span>{fmtRp(totalD)}</span></div>
          <div className="grand">Total Kredit<span>{fmtRp(totalK)}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {akFmtTglNow()} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

// Register Jurnal: gabungan semua dokumen terpilih, grouped (header dokumen + baris debit/kredit
// di bawahnya) — porting langsung dari pbBuildRegisterLines/pbChunk termasuk continuation
// "(lanjutan)" kalau baris jurnal suatu dokumen terpotong batas halaman.
function AkCetakJurnalRegisterBody({ lines, docLabel, orgInfo, tglRangeLabel, pageInfo, summary, isLastPage }) {
  return (
    <div className="cetak-doc">
      <div className="cetak-kop">
        <div className="cetak-kop-left">
          <b>{orgInfo.nama}</b>
          <div>{orgInfo.alamat}</div>
          <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        </div>
        <div className="cetak-kop-center">{docLabel}</div>
        <div className="cetak-kop-right">Tanggal<br/>{tglRangeLabel}</div>
      </div>
      <table className="cetak-table">
        <thead><tr><th style={{width:130}}>Akun</th><th>Deskripsi</th><th className="num" style={{width:110}}>Debit Rp</th><th className="num" style={{width:110}}>Kredit Rp</th></tr></thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={4} className="empty">Tidak ada dokumen dipilih.</td></tr>}
          {lines.map((ln, i) => {
            if (ln.type === 'group') {
              return (
                <tr className="cetak-register-group" key={`g${i}`}>
                  <td className="mono">{ln.no}{ln.continuation && <span className="cetak-lanjutan"> (lanjutan)</span>}</td>
                  <td>{ln.tgl} — {ln.label}</td>
                  <td colSpan={2}>{ln.status}</td>
                </tr>
              );
            }
            if (ln.type === 'empty') {
              return <tr key={`e${i}`}><td colSpan={4} className="empty">Tidak ada baris jurnal.</td></tr>;
            }
            const it = ln.item;
            return (
              <tr key={`i${i}`}>
                <td className="mono" style={{paddingLeft:18}}>{it.akun}</td>
                <td>{it.desc}</td>
                <td className="num">{it.d ? fmtRp(it.d) : ''}</td>
                <td className="num">{it.k ? fmtRp(it.k) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div>Jumlah Jurnal<span>{summary.count}</span></div>
            <div>Total Debit<span>{fmtRp(summary.totalD)}</span></div>
            <div className="grand">Total Kredit<span>{fmtRp(summary.totalK)}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${akFmtTglNow()} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

function akBuildJurnalRegisterLines(rows) {
  const lines = [];
  rows.forEach(r => {
    lines.push({ type:'group', no:r.no, tgl:akFmtTgl(r.tgl), label:r.desc, status:r.status });
    const items = r.lines || [];
    if (items.length === 0) lines.push({ type:'empty' });
    else items.forEach(it => lines.push({ type:'item', item:it }));
  });
  return lines;
}
// Sama persis pola pbChunk: kalau sebuah halaman mulai di tengah baris jurnal suatu dokumen
// (bukan pas baris "group"-nya), baris group itu diulang di awal halaman dengan tanda "(lanjutan)".
function akChunk(lines, size) {
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
function akChunkFlat(rows, size) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out.length ? out : [[]];
}

function AkCetakModal({ variant, docLabel, rows, noKey, tglKey, akunRows, statusFilter, getGroupLabel, pdfPath, initialSelected, onClose }) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', telpon:'', email:'', noNpwp:'' };
  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [noAwal, setNoAwal] = React.useState('');
  const [noAkhir, setNoAkhir] = React.useState('');
  const [statusVal, setStatusVal] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set(initialSelected && initialSelected.length ? initialSelected : rows.map(r => r[noKey])));
  const [previewMode, setPreviewMode] = React.useState('bukti'); // 'bukti' | 'register'
  const [zoom, setZoom] = React.useState(100);

  const filtered = rows.filter(r => {
    const tglIso = akToIso(r[tglKey]);
    if (tglAwal && tglIso && tglIso < tglAwal) return false;
    if (tglAkhir && tglIso && tglIso > tglAkhir) return false;
    if (noAwal && r[noKey] < noAwal) return false;
    if (noAkhir && r[noKey] > noAkhir) return false;
    if (statusFilter && statusVal && !statusFilter.match(r, statusVal)) return false;
    if (search && !r[noKey].toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r[noKey]));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(r => next.delete(r[noKey])); return next; }
    const next = new Set(prev); filtered.forEach(r => next.add(r[noKey])); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });

  const selectedRows = rows.filter(r => selected.has(r[noKey]));

  const registerLines = variant === 'jurnal' && previewMode === 'register' ? akBuildJurnalRegisterLines(selectedRows) : [];
  const registerPages = previewMode === 'register'
    ? (variant === 'jurnal' ? akChunk(registerLines, AK_REGISTER_ROWS_PER_PAGE) : akChunkFlat(selectedRows, AK_REGISTER_ROWS_PER_PAGE))
    : [[]];
  const totalPages = previewMode === 'register' ? registerPages.length : Math.max(1, selectedRows.length);

  const aktivaSummary = React.useMemo(() => ({
    count: selectedRows.length,
    harga: selectedRows.reduce((s,r)=>s+(+r.harga||0),0),
    susut: selectedRows.reduce((s,r)=>s+(+r.susut||0),0),
    nilai: selectedRows.reduce((s,r)=>s+(+r.nilai||0),0),
  }), [selectedRows]);
  const jurnalSummary = React.useMemo(() => ({
    count: selectedRows.length,
    totalD: selectedRows.reduce((s,r)=>s+(r.lines||[]).reduce((t,l)=>t+(+l.d||0),0),0),
    totalK: selectedRows.reduce((s,r)=>s+(r.lines||[]).reduce((t,l)=>t+(+l.k||0),0),0),
  }), [selectedRows]);

  const tglRangeLabel = tglAwal || tglAkhir
    ? `${akFromIso(tglAwal) || '—'} s/d ${akFromIso(tglAkhir) || '—'}`
    : (() => {
        if (selectedRows.length === 0) return '—';
        const sorted = [...selectedRows].map(r => akToIso(r[tglKey])).sort();
        return sorted[0] === sorted[sorted.length-1] ? akFromIso(sorted[0]) : `${akFromIso(sorted[0])} s/d ${akFromIso(sorted[sorted.length-1])}`;
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
              <div className="field"><label>No Awal</label><input className="input mono" value={noAwal} onChange={e=>setNoAwal(e.target.value)}/></div>
              <div className="field"><label>No Akhir</label><input className="input mono" value={noAkhir} onChange={e=>setNoAkhir(e.target.value)}/></div>
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
              <label>Pilih Dokumen</label>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            </div>
            <div className="cetak-checklist">
              <div className="cetak-checklist-row head">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
                <span>{noKey === 'kode' ? 'Kode' : 'No.'}</span>
              </div>
              <div className="cetak-checklist-scroll">
                {filtered.length === 0 && <div className="empty" style={{padding:'16px 0'}}>Tidak ada data.</div>}
                {filtered.map(r => (
                  <label key={r[noKey]} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(r[noKey])} onChange={()=>toggleOne(r[noKey])}/>
                    <span className="mono">{r[noKey]}</span>
                  </label>
                ))}
              </div>
            </div>
            {variant !== 'pdf' && (
              <div style={{display:'flex', gap:8, marginTop:12}}>
                <button className={`btn ${previewMode==='bukti' ? 'btn-primary' : 'btn-soft'}`} style={{flex:1, justifyContent:'center'}} onClick={()=>setPreviewMode('bukti')}>{I.print()} Bukti ({selectedRows.length})</button>
                <button className={`btn ${previewMode==='register' ? 'btn-primary' : 'btn-soft'}`} style={{flex:1, justifyContent:'center'}} onClick={()=>setPreviewMode('register')}>{I.print()} Register ({selectedRows.length})</button>
              </div>
            )}
          </div>

          <div className="cetak-preview-pane">
            <div className="cetak-toolbar">
              <span className="cetak-pageof">
                {variant === 'pdf' ? 'Pratinjau dokumen referensi' : selectedRows.length===0 ? '0 halaman' : previewMode==='register' ? `${totalPages} halaman` : `${selectedRows.length} dokumen`}
              </span>
              {variant !== 'pdf' && (
                <div style={{display:'flex', gap:4, alignItems:'center'}}>
                  <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.max(50,z-10))}>−</button>
                  <span className="cetak-pageof">{zoom}%</span>
                  <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.min(150,z+10))}>+</button>
                </div>
              )}
            </div>
            <div className="cetak-canvas" style={variant === 'pdf' ? {padding:16, alignItems:'flex-start'} : null}>
              {selectedRows.length === 0 ? (
                <div className="empty" style={{padding:'60px 0'}}>Belum ada dokumen dipilih untuk dicetak.</div>
              ) : variant === 'pdf' ? (
                // Lebar selalu 100% mengikuti batas pane preview (bukan dibatasi lebih kecil), tinggi
                // mengikuti aspect-ratio supaya proporsinya tetap seperti dokumen portrait — bukan
                // width:100%+height:100% independen (itu bikin kotak ikut bentuk jendela browser:
                // di layar pendek/lebar kotaknya jadi landscape pendek, PDF viewer Chrome pun melebarkan
                // bar hitam kiri-kanan supaya halaman portrait tetap muat). Kalau hasil tingginya lebih
                // panjang dari pane yang kelihatan, tinggal discroll (.cetak-canvas sudah overflow:auto).
                <div style={{width:'100%', aspectRatio:'0.75', background:'#fff', boxShadow:'var(--shadow-lg)'}}>
                  <iframe src={encodeURI(pdfPath)} title={docLabel} style={{width:'100%', height:'100%', border:'none', display:'block'}} />
                </div>
              ) : previewMode === 'register' ? (
                variant === 'jurnal' ? (
                  registerPages.map((lines, idx) => (
                    <div className="cetak-page" key={idx} style={{transform:`scale(${zoom/100})`}}>
                      <AkCetakJurnalRegisterBody lines={lines} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel}
                        pageInfo={{current:idx+1, total:totalPages}} summary={jurnalSummary} isLastPage={idx === totalPages-1} />
                    </div>
                  ))
                ) : (
                  registerPages.map((pageRows, idx) => (
                    <div className="cetak-page" key={idx} style={{transform:`scale(${zoom/100})`}}>
                      <AkCetakAktivaRegisterBody rows={pageRows} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel}
                        pageInfo={{current:idx+1, total:totalPages}} summary={aktivaSummary} isLastPage={idx === totalPages-1} />
                    </div>
                  ))
                )
              ) : (
                selectedRows.map((row, idx) => (
                  <div className="cetak-page" key={row[noKey] || idx} style={{transform:`scale(${zoom/100})`}}>
                    {variant === 'jurnal'
                      ? <AkCetakJurnalBuktiBody row={row} orgInfo={orgInfo} akunRows={akunRows} groupLabel={getGroupLabel ? getGroupLabel(row) : row.pembuat} />
                      : <AkCetakAktivaBuktiBody row={row} orgInfo={orgInfo} />}
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
