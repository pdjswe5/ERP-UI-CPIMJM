// Manufaktur — popup "Cetak" untuk Hasil Produksi & Pemakaian Bahan. Sama pola & fitur dengan
// PbCetakModal (Pembelian)/PjCetakModal (Penjualan) — kiri filter (tanggal, No Bukti, checklist
// multi-pilih), kanan preview HTML digenerate dari data (mode "Bukti" 1 dokumen/halaman, mode
// "Register" gabungan semua dokumen terpilih). Beda dari Pembelian/Penjualan: dokumen ini TIDAK
// priced (tidak ada Hrg_Sat/Rp) — ringkasan cetak berupa jumlah item bahan & qty produksi, bukan
// Sub Total/Grand Total Rp. Hasil Produksi juga tidak punya konsep Batal, jadi tidak ada watermark.
//
// Dipanggil dari MfHasilProduksiList:
//   <MfCetakModal rows={rows} initialSelected={cetakRow ? [cetakRow.no] : null} onClose={...} />

function mfHpFmtTgl(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

function MfHpCetakBuktiBody({ row, orgInfo }) {
  const items = row.bahanLines || [];
  return (
    <div className="cetak-doc">
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
        {orgInfo.telpon && <div>Tel. {orgInfo.telpon}</div>}
        {orgInfo.email && <div>Email : {orgInfo.email}</div>}
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">HASIL PRODUKSI</div>
        <div className="cetak-title-no">No. {row.no}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>Barang Jadi</div>
          <b>{row.namaBarang || '—'}</b>
          <div className="mono">{row.kodeBarang}</div>
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Tanggal</span><span>: {mfHpFmtTgl(row.tgl)}</span></div>
          <div className="cetak-meta-row"><span>No. SPK</span><span>: {row.noSpk || '—'}</span></div>
          <div className="cetak-meta-row"><span>Gudang</span><span>: {row.gudang || '—'}</span></div>
          <div className="cetak-meta-row"><span>Qty Produksi</span><span>: {row.qtySPK} {row.satuan}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead>
          <tr>
            <th style={{width:28}}>No</th><th>Kode Bahan</th><th>Merk Bahan</th><th style={{width:80}}>Gudang</th>
            <th style={{width:90}}>Jumlah</th><th style={{width:100}}>No. Coil</th><th style={{width:90}}>Kondisi</th><th style={{width:80}}>Lapisan PU</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && <tr><td colSpan={8} className="empty">Tidak ada bahan.</td></tr>}
          {items.map((it,i) => (
            <tr key={i}>
              <td>{i+1}.</td>
              <td className="mono">{it.kodeBahan}</td>
              <td>{it.merkBahan || '—'}</td>
              <td>{it.gudang || '—'}</td>
              <td className="num">{it.jumlah} {it.satuan}</td>
              <td className="mono">{it.noCoil || '—'}</td>
              <td>{it.kondisi || '—'}</td>
              <td>{it.lapisanPu || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cetak-foot">
        <div className="cetak-sign">
          <div className="cetak-sign-box"><div className="line" /><div>Dibuat Oleh</div><b>{row.dibuatOleh || 'PDJ Administrator'}</b></div>
          <div className="cetak-sign-box"><div className="line" /><div>Mengetahui</div></div>
        </div>
        <div className="cetak-summary">
          <div><b>Ringkasan</b></div>
          <div>Jumlah Item Bahan<span>{items.length}</span></div>
          <div className="grand">Qty Produksi<span>{row.qtySPK} {row.satuan}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {mfHpFmtTgl(new Date().toISOString())} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

// Register dipaginasi jadi beberapa "kertas" (lihat mfHpBuildRegisterLines/mfHpChunk) — pola sama
// persis dgn pbBuildRegisterLines/pbChunk (Pembelian), termasuk baris group "(lanjutan)" saat 1
// dokumen terpotong ke halaman berikutnya.
function MfHpCetakRegisterBody({ lines, docLabel, orgInfo, tglRangeLabel, pageInfo, summary, isLastPage }) {
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
        <thead><tr><th>Kode Bahan</th><th>Merk Bahan</th><th style={{width:80}}>Gudang</th><th style={{width:100}}>Jumlah</th></tr></thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={4} className="empty">Tidak ada dokumen dipilih.</td></tr>}
          {lines.map((ln, i) => {
            if (ln.type === 'group') {
              return (
                <tr className="cetak-register-group" key={`g${i}`}>
                  <td className="mono">{ln.no}{ln.continuation && <span className="cetak-lanjutan"> (lanjutan)</span>}</td>
                  <td>{ln.tgl}</td>
                  <td colSpan={2}>{ln.label}</td>
                </tr>
              );
            }
            if (ln.type === 'empty') {
              return <tr key={`e${i}`}><td colSpan={4} className="empty">Tidak ada bahan.</td></tr>;
            }
            const it = ln.item;
            return (
              <tr key={`i${i}`}>
                <td style={{paddingLeft:18}} className="mono">{ln.idx}. {it.kodeBahan}</td>
                <td>{it.merkBahan || '—'}</td>
                <td>{it.gudang || '—'}</td>
                <td className="num">{it.jumlah} {it.satuan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div><b>Ringkasan</b></div>
            <div>Total Dokumen<span>{summary.docCount}</span></div>
            <div className="grand">Total Item Bahan<span>{summary.itemCount}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${mfHpFmtTgl(new Date().toISOString())} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

const MF_HP_REGISTER_ROWS_PER_PAGE = 16;
function mfHpBuildRegisterLines(rows, labelOf) {
  const lines = [];
  rows.forEach(r => {
    lines.push({ type:'group', no:r.no, tgl:mfHpFmtTgl(r.tgl), label:labelOf(r) });
    const items = r.bahanLines || [];
    if (items.length === 0) lines.push({ type:'empty' });
    else items.forEach((it,i) => lines.push({ type:'item', item:it, idx:i+1 }));
  });
  return lines;
}
function mfHpChunk(lines, size) {
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

function MfCetakModal({ docLabel='Hasil Produksi', rows, getGroupLabel, initialSelected, onClose }) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', telpon:'', email:'' };
  const labelOf = (r) => (getGroupLabel ? getGroupLabel(r) : r.namaBarang || '');

  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [noAwal, setNoAwal] = React.useState('');
  const [noAkhir, setNoAkhir] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set(initialSelected && initialSelected.length ? initialSelected : rows.map(r => r.no)));
  const [previewMode, setPreviewMode] = React.useState('bukti'); // 'bukti' | 'register'
  const [zoom, setZoom] = React.useState(100);

  const filtered = rows.filter(r => {
    if (tglAwal && r.tgl < tglAwal) return false;
    if (tglAkhir && r.tgl > tglAkhir) return false;
    if (noAwal && r.no < noAwal) return false;
    if (noAkhir && r.no > noAkhir) return false;
    if (search && !r.no.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r.no));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(r => next.delete(r.no)); return next; }
    const next = new Set(prev); filtered.forEach(r => next.add(r.no)); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });

  const selectedRows = rows.filter(r => selected.has(r.no));
  const registerLines = previewMode === 'register' ? mfHpBuildRegisterLines(selectedRows, labelOf) : [];
  const registerPages = previewMode === 'register' ? mfHpChunk(registerLines, MF_HP_REGISTER_ROWS_PER_PAGE) : [[]];
  const registerSummary = React.useMemo(() => {
    let itemCount = 0;
    registerLines.forEach(ln => { if (ln.type === 'item') itemCount++; });
    return { docCount: selectedRows.length, itemCount };
  }, [registerLines, selectedRows.length]);
  const totalPages = previewMode === 'register' ? registerPages.length : Math.max(1, selectedRows.length);

  const tglRangeLabel = tglAwal || tglAkhir
    ? `${mfHpFmtTgl(tglAwal) || '—'} s/d ${mfHpFmtTgl(tglAkhir) || '—'}`
    : (() => {
        if (selectedRows.length === 0) return '—';
        const sorted = [...selectedRows].map(r => r.tgl).sort();
        return sorted[0] === sorted[sorted.length-1] ? mfHpFmtTgl(sorted[0]) : `${mfHpFmtTgl(sorted[0])} s/d ${mfHpFmtTgl(sorted[sorted.length-1])}`;
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
                  <label key={r.no} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(r.no)} onChange={()=>toggleOne(r.no)}/>
                    <span className="mono">{r.no}</span>
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
                    <MfHpCetakRegisterBody lines={lines} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel}
                      pageInfo={{current:idx+1, total:totalPages}} summary={registerSummary} isLastPage={idx === totalPages-1} />
                  </div>
                ))
              ) : (
                selectedRows.map((row, idx) => (
                  <div className="cetak-page" key={row.no || idx} style={{transform:`scale(${zoom/100})`}}>
                    <MfHpCetakBuktiBody row={row} orgInfo={orgInfo} />
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

// ═══════════════════════════════════════════════════════════════════════════
// Popup "Cetak" untuk Surat Perintah Kerja (SPK). Beda dari Hasil Produksi: 1 SPK bisa punya LEBIH
// dari 1 Barang Jadi (bjLines), masing-masing dengan Bahan-nya sendiri (bahanLines, dikaitkan lewat
// bjLineId) — jadi tiap dokumen dicetak sebagai grup "Barang Jadi" (baris tebal) diikuti baris
// Bahan-nya yang menjorok, mirip pola baris "group"+"item" di mode Register Pembelian/Penjualan,
// tapi dipakai di dalam SATU dokumen mode Bukti. row.tgl SPK sudah tersimpan "DD-MM-YYYY" (BUKAN
// ISO seperti Hasil Produksi) — lihat mfToIso/mfFromIso di SpkPage.jsx, dipakai di sini juga utk
// filter tanggal (perbandingan string apa adanya salah kalau formatnya DD-MM-YYYY).

function mfSpkCetakLines(row) {
  const bjLines = (row.bjLines || []).filter(b => !b._deleted);
  const lines = [];
  bjLines.forEach(bj => {
    const bahan = (row.bahanLines || []).filter(b => b.bjLineId === bj.id && !b._deleted);
    lines.push({ type:'bj', bj, jmlBahan: bahan.length });
    if (bahan.length === 0) lines.push({ type:'bahanEmpty' });
    else bahan.forEach((b,i) => lines.push({ type:'bahan', item:b, idx:i+1 }));
  });
  return lines;
}

function MfSpkCetakBuktiBody({ row, orgInfo }) {
  const lines = mfSpkCetakLines(row);
  const bjCount = (row.bjLines || []).filter(b => !b._deleted).length;
  const bahanCount = (row.bahanLines || []).filter(b => !b._deleted).length;
  const isBatal = !!row.Batal;
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
        <div className="cetak-title-spaced">SURAT PERINTAH KERJA</div>
        <div className="cetak-title-no">No. {row.no}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>No. SO</div>
          <b>{row.noSo || '—'}</b>
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>Tanggal</span><span>: {row.tgl || '—'}</span></div>
          <div className="cetak-meta-row"><span>Tgl. Kirim</span><span>: {row.tglKirim || '—'}</span></div>
          <div className="cetak-meta-row"><span>Status</span><span>: {isBatal ? 'BATAL' : row.status}</span></div>
          <div className="cetak-meta-row"><span>Stempel</span><span>: {row.stempel || '—'}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead>
          <tr><th>Nama Barang / Bahan</th><th style={{width:130}}>Kode / Gudang</th><th style={{width:80}}>Qty</th><th style={{width:70}}>Satuan</th><th style={{width:170}}>Mesin</th></tr>
        </thead>
        <tbody>
          {lines.length === 0 && <tr><td colSpan={5} className="empty">Belum ada barang jadi.</td></tr>}
          {lines.map((ln, i) => {
            if (ln.type === 'bj') return (
              <tr className="cetak-register-group" key={`bj${i}`}>
                <td><b>{ln.bj.namaBarang}</b></td>
                <td className="mono">{ln.bj.kodeBarang}</td>
                <td className="num">{ln.bj.qtySPK}</td>
                <td>{ln.bj.satuan}</td>
                <td>{(ln.bj.mesinDipilih || []).join(', ') || '—'}</td>
              </tr>
            );
            if (ln.type === 'bahanEmpty') return <tr key={`e${i}`}><td colSpan={5} className="empty">Belum ada bahan.</td></tr>;
            const it = ln.item;
            return (
              <tr key={`b${i}`}>
                <td style={{paddingLeft:18}}>{ln.idx}. {it.kodeBahan}{it.merkBahan ? ` — ${it.merkBahan}` : ''}</td>
                <td className="mono">{it.gudang || '—'}</td>
                <td className="num">{it.jumlah}</td>
                <td>{it.satuan}</td>
                <td></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="cetak-foot">
        <div className="cetak-sign">
          <div className="cetak-sign-box"><div className="line" /><div>Dibuat Oleh</div><b>{row.dibuatOleh || '—'}</b></div>
          <div className="cetak-sign-box"><div className="line" /><div>Disetujui Oleh</div><b>{row.isApproved ? (row.disetujuiOleh || '—') : 'Belum disetujui'}</b></div>
        </div>
        <div className="cetak-summary">
          <div><b>Ringkasan</b></div>
          <div>Jumlah Barang Jadi<span>{bjCount}</span></div>
          <div className="grand">Jumlah Bahan<span>{bahanCount}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {mfHpFmtTgl(new Date().toISOString())} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

// Register: 1 baris group per SPK, item-nya level Barang Jadi (BUKAN turun ke Bahan lagi — kalau
// tetap dipakai daftar SPK banyak sekaligus, nge-drill ke Bahan bikin kertasnya kepanjangan;
// detail Bahan tetap bisa dilihat lewat cetak mode Bukti per-dokumen).
function mfSpkBuildRegisterLines(rows) {
  const lines = [];
  rows.forEach(r => {
    lines.push({ type:'group', no:r.no, tgl:r.tgl, label:r.produk || '', isBatal: !!r.Batal });
    const bjLines = (r.bjLines || []).filter(b => !b._deleted);
    if (bjLines.length === 0) lines.push({ type:'empty' });
    else bjLines.forEach((bj,i) => {
      const jmlBahan = (r.bahanLines || []).filter(b => b.bjLineId === bj.id && !b._deleted).length;
      lines.push({ type:'item', item:bj, jmlBahan, idx:i+1 });
    });
  });
  return lines;
}
function mfSpkChunk(lines, size) {
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

function MfSpkCetakRegisterBody({ lines, docLabel, orgInfo, tglRangeLabel, pageInfo, summary, isLastPage }) {
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
        <div className="cetak-kop-right">Tanggal<br/>{tglRangeLabel}</div>
      </div>
      <table className="cetak-table">
        <thead><tr><th>Nama Barang</th><th style={{width:130}}>Kode Barang</th><th style={{width:80}}>Qty</th><th style={{width:70}}>Satuan</th><th style={{width:90}}>Jml Bahan</th></tr></thead>
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
              return <tr key={`e${i}`}><td colSpan={5} className="empty">Belum ada barang jadi.</td></tr>;
            }
            const it = ln.item;
            return (
              <tr key={`i${i}`}>
                <td style={{paddingLeft:18}}>{ln.idx}. {it.namaBarang}</td>
                <td className="mono">{it.kodeBarang}</td>
                <td className="num">{it.qtySPK}</td>
                <td>{it.satuan}</td>
                <td className="num">{ln.jmlBahan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isLastPage && (
        <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
          <div className="cetak-summary">
            <div><b>Ringkasan</b></div>
            <div>Total Dokumen<span>{summary.docCount}</span></div>
            <div>Total Barang Jadi<span>{summary.bjCount}</span></div>
            <div className="grand">Total Bahan<span>{summary.bahanCount}</span></div>
          </div>
        </div>
      )}
      <div className="cetak-timestamp">
        Halaman {pageInfo.current} dari {pageInfo.total}
        {isLastPage && ` — Dicetak pada ${mfHpFmtTgl(new Date().toISOString())} ${new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator`}
      </div>
    </div>
  );
}

const MF_SPK_REGISTER_ROWS_PER_PAGE = 16;

function MfSpkCetakModal({ docLabel='Surat Perintah Kerja', rows, statusFilter, initialSelected, onClose }) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', telpon:'', email:'' };

  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [noAwal, setNoAwal] = React.useState('');
  const [noAkhir, setNoAkhir] = React.useState('');
  const [statusVal, setStatusVal] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set(initialSelected && initialSelected.length ? initialSelected : rows.map(r => r.no)));
  const [previewMode, setPreviewMode] = React.useState('bukti');
  const [zoom, setZoom] = React.useState(100);

  const filtered = rows.filter(r => {
    const iso = mfToIso(r.tgl);
    if (tglAwal && iso && iso < tglAwal) return false;
    if (tglAkhir && iso && iso > tglAkhir) return false;
    if (noAwal && r.no < noAwal) return false;
    if (noAkhir && r.no > noAkhir) return false;
    if (statusVal && r.status !== statusVal) return false;
    if (search && !r.no.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const allChecked = filtered.length > 0 && filtered.every(r => selected.has(r.no));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(r => next.delete(r.no)); return next; }
    const next = new Set(prev); filtered.forEach(r => next.add(r.no)); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });

  const selectedRows = rows.filter(r => selected.has(r.no));
  const registerLines = previewMode === 'register' ? mfSpkBuildRegisterLines(selectedRows) : [];
  const registerPages = previewMode === 'register' ? mfSpkChunk(registerLines, MF_SPK_REGISTER_ROWS_PER_PAGE) : [[]];
  const registerSummary = React.useMemo(() => {
    let bjCount = 0, bahanCount = 0;
    registerLines.forEach(ln => { if (ln.type === 'item') { bjCount++; bahanCount += ln.jmlBahan; } });
    return { docCount: selectedRows.length, bjCount, bahanCount };
  }, [registerLines, selectedRows.length]);
  const totalPages = previewMode === 'register' ? registerPages.length : Math.max(1, selectedRows.length);

  const tglRangeLabel = tglAwal || tglAkhir
    ? `${tglAwal ? mfFromIso(tglAwal) : '—'} s/d ${tglAkhir ? mfFromIso(tglAkhir) : '—'}`
    : (() => {
        if (selectedRows.length === 0) return '—';
        const sorted = [...selectedRows].map(r => mfToIso(r.tgl)).sort();
        return sorted[0] === sorted[sorted.length-1] ? mfFromIso(sorted[0]) : `${mfFromIso(sorted[0])} s/d ${mfFromIso(sorted[sorted.length-1])}`;
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
                {MF_STATUS_SPK.map(s => <option key={s} value={s}>{s}</option>)}
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
                  <label key={r.no} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(r.no)} onChange={()=>toggleOne(r.no)}/>
                    <span className="mono">{r.no}</span>
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
                    <MfSpkCetakRegisterBody lines={lines} docLabel={docLabel} orgInfo={orgInfo} tglRangeLabel={tglRangeLabel}
                      pageInfo={{current:idx+1, total:totalPages}} summary={registerSummary} isLastPage={idx === totalPages-1} />
                  </div>
                ))
              ) : (
                selectedRows.map((row, idx) => (
                  <div className="cetak-page" key={row.no || idx} style={{transform:`scale(${zoom/100})`}}>
                    <MfSpkCetakBuktiBody row={row} orgInfo={orgInfo} />
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
