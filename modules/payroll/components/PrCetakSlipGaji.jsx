// Payroll — Cetak Slip Gaji: dipakai bersama oleh Proses Penggajian Absensi & Proses Penggajian
// Borongan — field slip sudah digeneralisasi jadi `pendapatan`/`potongan` (array {label,value}) oleh
// masing² halaman proses (lihat prComputeSlipAbsensi/prComputeSlipBorongan), jadi komponen cetak ini
// tidak perlu tahu beda absensi/borongan. Pola panel filter+checklist kiri / canvas kanan meniru
// AkCetakModal (Keuangan), disederhanakan (tanpa mode Bukti/Register terpisah — slip gaji memang
// selalu 1 halaman per karyawan).

function prCetakTglNow() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

function PrSlipGajiBody({ slip, orgInfo, periode }) {
  return (
    <div className="cetak-doc">
      <div className="cetak-letterhead">
        <b>{orgInfo.nama}</b>
        <div>{orgInfo.alamat}</div>
        <div>{orgInfo.kota}{orgInfo.kodePos ? `, ${orgInfo.kodePos}` : ''}</div>
      </div>
      <div className="cetak-title-block">
        <div className="cetak-title-spaced">SLIP GAJI</div>
        <div className="cetak-title-no">Periode {periode}</div>
      </div>
      <div className="cetak-info-grid">
        <div>
          <div>Nama</div>
          <b>{slip.nama}</b>
          <div style={{marginTop:6}}>Bagian: {PR_BAGIAN.find(b=>b.kode===slip.kodeBagian)?.nama || '—'}</div>
        </div>
        <div className="cetak-meta-col">
          <div className="cetak-meta-row"><span>No. Induk</span><span>: {slip.noInduk}</span></div>
          <div className="cetak-meta-row"><span>Periode</span><span>: {periode}</span></div>
        </div>
      </div>
      <table className="cetak-table">
        <thead><tr><th>Pendapatan</th><th className="num" style={{width:130}}>Jumlah</th></tr></thead>
        <tbody>
          {slip.pendapatan.map((p,i) => <tr key={i}><td>{p.label}</td><td className="num">{fmtRp(p.value)}</td></tr>)}
          <tr><td><b>Total Pendapatan</b></td><td className="num"><b>{fmtRp(slip.total)}</b></td></tr>
        </tbody>
      </table>
      <table className="cetak-table" style={{marginTop:10}}>
        <thead><tr><th>Potongan</th><th className="num" style={{width:130}}>Jumlah</th></tr></thead>
        <tbody>
          {slip.potongan.map((p,i) => <tr key={i}><td>{p.label}</td><td className="num">{fmtRp(p.value)}</td></tr>)}
          <tr><td><b>Total Potongan</b></td><td className="num"><b>{fmtRp(slip.totalPotongan)}</b></td></tr>
        </tbody>
      </table>
      <div className="cetak-foot" style={{justifyContent:'flex-end'}}>
        <div className="cetak-summary">
          <div className="grand">Total Terima<span>{fmtRp(slip.totalTerima)}</span></div>
        </div>
      </div>
      <div className="cetak-timestamp">Dicetak pada {prCetakTglNow()} {new Date().toLocaleTimeString('id-ID')} oleh PDJ Administrator</div>
    </div>
  );
}

function PrCetakSlipGaji({ batch, onClose }) {
  const orgInfo = (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya', alamat:'', kota:'', kodePos:'' };
  const [selected, setSelected] = React.useState(() => new Set(batch.slips.map(s => s.noInduk)));
  const [zoom, setZoom] = React.useState(100);
  const [search, setSearch] = React.useState('');

  const filtered = batch.slips.filter(s => !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.noInduk.includes(search));
  const allChecked = filtered.length > 0 && filtered.every(s => selected.has(s.noInduk));
  const toggleAll = () => setSelected(prev => {
    if (allChecked) { const next = new Set(prev); filtered.forEach(s => next.delete(s.noInduk)); return next; }
    const next = new Set(prev); filtered.forEach(s => next.add(s.noInduk)); return next;
  });
  const toggleOne = (no) => setSelected(prev => { const next = new Set(prev); next.has(no) ? next.delete(no) : next.add(no); return next; });
  const selectedSlips = batch.slips.filter(s => selected.has(s.noInduk));

  const doCetak = () => {
    window.__erpToast && window.__erpToast(`Cetak dikirim ke printer (${selectedSlips.length} slip).`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal cetak-modal" style={{maxWidth:1400, maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Cetak Slip Gaji</h2><div className="sub">Periode {batch.periode}{batch.kodeBagian ? ` — ${PR_BAGIAN.find(b=>b.kode===batch.kodeBagian)?.nama || batch.kodeBagian}` : ''}</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="cetak-body">
          <div className="cetak-filter panel">
            <h3>Pilih Karyawan</h3>
            <div className="field">
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari nama/no induk…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
            </div>
            <div className="cetak-checklist">
              <div className="cetak-checklist-row head">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
                <span>Nama</span>
              </div>
              <div className="cetak-checklist-scroll">
                {filtered.length === 0 && <div className="empty" style={{padding:'16px 0'}}>Tidak ada data.</div>}
                {filtered.map(s => (
                  <label key={s.noInduk} className="cetak-checklist-row">
                    <input type="checkbox" checked={selected.has(s.noInduk)} onChange={()=>toggleOne(s.noInduk)}/>
                    <span>{s.nama}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="cetak-preview-pane">
            <div className="cetak-toolbar">
              <span className="cetak-pageof">{selectedSlips.length} slip</span>
              <div style={{display:'flex', gap:4, alignItems:'center'}}>
                <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.max(50,z-10))}>−</button>
                <span className="cetak-pageof">{zoom}%</span>
                <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.min(150,z+10))}>+</button>
              </div>
            </div>
            <div className="cetak-canvas cetak-canvas-scroll">
              {selectedSlips.length === 0 ? (
                <div className="empty" style={{padding:'60px 0'}}>Belum ada slip dipilih.</div>
              ) : selectedSlips.map(slip => (
                <div className="cetak-page" key={slip.noInduk} style={{transform:`scale(${zoom/100})`}}>
                  <PrSlipGajiBody slip={slip} orgInfo={orgInfo} periode={batch.periode} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk tutup</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Tutup</button>
            <button className="btn btn-primary" onClick={doCetak} disabled={selectedSlips.length===0}>{I.print()} Cetak ({selectedSlips.length}x)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
