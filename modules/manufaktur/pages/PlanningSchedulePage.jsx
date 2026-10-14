// Manufaktur — Planning Schedule Produksi Harian.
// Dipindah dari manufaktur.jsx, identifier diprefix Mf/MF_.
//
// State-lifting fix: antrian planning/outstanding sudah berupa state di komponen asli
// (bukan bug seperti SPK/HP/BPBL/RPBL), tapi state-nya lokal ke komponen ini sehingga hilang
// saat berpindah sub-modul. Di sini state diangkat ke MfManufakturPage lewat props rows/setRows,
// mengikuti pola yang sama dipakai 4 sub-modul lain.

function mfAddMinutes(hhmm, minutes) {
  const [h, m] = (hhmm || '00:00').split(':').map(Number);
  const total = ((h * 60 + m + (+minutes || 0)) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

// Rechain jamMulai/jamSelesai utk baris status 'planning' milik 1 mesin, urutan = urutan array
// (baris outstanding/selesai/batal tidak disentuh — dianggap "terkunci"). Baris pertama dalam
// antrian pakai jamMulai miliknya sendiri sebagai anchor kecuali resetFirst=true (dipakai saat
// baris yang SEDANG jadi baris pertama itu sendiri yang baru saja dibatalkan/ditukar urutannya).
function mfRechainMesinRows(allRows, mesin, fallbackAnchor, resetFirst) {
  const idxs = [];
  allRows.forEach((r, i) => { if (r.mesin === mesin && r.status === 'planning') idxs.push(i); });
  if (idxs.length === 0) return allRows;
  const next = [...allRows];
  let cursor = resetFirst ? (fallbackAnchor || '08:00') : (next[idxs[0]].jamMulai || fallbackAnchor || '08:00');
  idxs.forEach(i => {
    const jamSelesai = mfAddMinutes(cursor, +next[i].menit || 0);
    next[i] = { ...next[i], jamMulai: cursor, jamSelesai };
    cursor = jamSelesai;
  });
  return next;
}

// Konversi baris planning yang baru diselesaikan jadi record Hasil Produksi — SEKARANG 1 planning
// row = 1 record HP tersendiri (dulu semua baris yang "Selesaikan Produksi" bareng digabung jadi 1
// record HP dengan banyak spkLines; itu nggak cocok lagi dengan aturan baru "1 No. Bukti = 1
// Barang Jadi" di produksi.data.jsx). `spkRows` WAJIB parameter live (bukan MF_SPK_SEED statis) —
// SPK yang baru dibuat/diubah user dalam sesi harus ikut ke-resolve di sini. Barang jadi yang
// diambil juga HARUS yang sesuai `row.bjLineId` (diisi saat SPK dipilih di planning, lihat onSpkPick
// di bawah), bukan selalu bjLines[0] — sebuah SPK bisa dijadwalkan utk lebih dari 1 barang jadinya.
// Toleran kalau noSpk/bjLineId tidak match apa pun (seed MF_PLANNING_SEED pakai format No. SPK yang
// nggak match MF_SPK_SEED sama sekali, dan baris 'Tambah Proses' literal noSpk:'Proses') — fallback
// men-sintesis 1 baris bahan dari field milik baris planning itu sendiri.
function mfPlanningRowToHpRecord(row, spkRows) {
  const spk = (spkRows || []).find(s => s.no === row.noSpk);
  const bjLines = (spk?.bjLines || []).filter(b => !b._deleted);
  const bjLine = bjLines.find(b => b.id === row.bjLineId) || bjLines[0];
  const now = new Date();
  const no = 'KHP' + now.toISOString().slice(2,4) + now.toISOString().slice(5,7) + String(Math.floor(Math.random()*9000)+1000);

  if (bjLine) {
    const bahanForBj = (spk.bahanLines || []).filter(b => b.bjLineId === bjLine.id);
    return {
      no, tgl: row.tgl, gudang: spk.gudang || '',
      dibuatOleh: 'Admin', dibuatTgl: `${row.tgl} 09:00`,
      noSpk: row.noSpk, bjLineId: bjLine.id,
      kodeBarang: bjLine.kodeBarang, namaBarang: bjLine.namaBarang, qtySPK: bjLine.qtySPK, satuan: bjLine.satuan,
      namaKelompokWarna: bjLine.namaKelompokWarna, namaAz: bjLine.namaAz, namaBrand: bjLine.namaBrand,
      namaMerkBarang: bjLine.namaMerkBarang, stempel: bjLine.stempel, mesinDipilih: bjLine.mesinDipilih || [],
      bahanLines: bahanForBj.map(b => ({
        id: Date.now() + Math.random(), gudang: b.gudang, kodeBahan: b.kodeBahan, merkBahan: b.merkBahan,
        jumlah: b.jumlah, satuan: b.satuan,
        noCoil:'', kondisi:'Normal', lapisanPu:'Atas', pembelian:'', sisaStok: String(row.jumlah ?? '0'),
      })),
    };
  }

  return {
    no, tgl: row.tgl, gudang: '',
    dibuatOleh: 'Admin', dibuatTgl: `${row.tgl} 09:00`,
    noSpk: row.noSpk, bjLineId: null,
    kodeBarang: '', namaBarang: row.namaBarang, qtySPK: row.jumlah, satuan: row.satuan,
    namaKelompokWarna: '', namaAz: '', namaBrand: '', namaMerkBarang: row.merk || '', stempel: '', mesinDipilih: [],
    bahanLines: [{
      id: Date.now() + Math.random(), gudang: '', kodeBahan: '', merkBahan: row.merk || '',
      jumlah: row.jumlah, satuan: row.satuan,
      noCoil:'', kondisi:'Normal', lapisanPu:'Atas', pembelian:'', sisaStok: String(row.jumlah ?? '0'),
    }],
  };
}

function mfBuildHpRecordsFromPlanning(rowsCompleted, spkRows) {
  return rowsCompleted.map(row => mfPlanningRowToHpRecord(row, spkRows));
}

function MfPlanningScheduleList({ rows, setRows, spkRows, onSelesai }) {
  const showToast = (msg) => { window.__erpToast && window.__erpToast(msg); };

  const [selectedMesin,  setSelectedMesin]  = React.useState(null);
  const [tgl,            setTgl]            = React.useState('2026-06-24');
  const [jamMulai,       setJamMulai]       = React.useState('08:30');
  const [selPlanning,    setSelPlanning]    = React.useState(new Set());
  const [showSpkPicker,  setShowSpkPicker]  = React.useState(false);
  const [showProsesModal, setShowProsesModal] = React.useState(false);

  const items = rows;
  const setItems = setRows;

  // Tidak ada lagi bucket "outstanding" terpisah — SPK yang dipilih dari dropdown (sudah difilter
  // outstanding & Approved di MfSpkPickerModal) langsung masuk ke planning, lalu dari planning
  // langsung "Selesaikan Produksi" ke Hasil Produksi. status 'outstanding' tidak dipakai lagi.
  const planningItems = items.filter(r => r.mesin === selectedMesin && r.status === 'planning');

  const updateStatus = (ids, newStatus) =>
    setItems(ls => ls.map(r => ids.has(r.id) ? {...r, status: newStatus} : r));

  const rechain = (anchorOverride, resetFirst) =>
    setItems(ls => mfRechainMesinRows(ls, selectedMesin, anchorOverride ?? jamMulai, !!resetFirst));

  // Simpan bjLineId (bukan cuma namaBarang/jumlah/satuan yang didenormalisasi) supaya nanti bisa
  // di-resolve balik ke Barang Jadi yang BENAR (bukan selalu bjLines[0]) saat "Selesaikan Produksi"
  // dikonversi jadi Hasil Produksi (lihat mfPlanningRowToHpRecord). Terima array pasangan
  // {spk, bj} sekaligus (bisa lintas SPK) supaya user bisa pilih beberapa barang dalam satu kali
  // konfirmasi di MfPlanningSpkPickerModal, lalu di-rechain SEKALI di akhir (bukan per-baris).
  const addPlanningRowsForBjs = (pairs) => {
    setItems(ls => mfRechainMesinRows([
      ...ls,
      ...pairs.map(({spk, bj}, i) => ({
        id: `PL-${Date.now()}-${i}`,
        mesin: selectedMesin, tgl, jamMulai: '', jamSelesai: '',
        noSpk: spk.no, bjLineId: bj.id, namaBarang: bj.namaBarang,
        jumlah: bj.qtySPK, satuan: bj.satuan || '', merk: bj.namaMerkBarang || '',
        menit: 60, status: 'planning',
      })),
    ], selectedMesin, jamMulai, false));
    showToast(`${pairs.length} barang berhasil ditambahkan ke planning.`);
  };

  const handleSelesaikanProduksi = () => {
    const completed = planningItems.filter(r => selPlanning.has(r.id)); // capture SEBELUM status berubah
    updateStatus(selPlanning, 'selesai');
    rechain(); // resetFirst=false: job selesai berarti benar-benar terjadi di slot itu, baris berikutnya tidak maju
    if (onSelesai && completed.length > 0) onSelesai(completed);
    setSelPlanning(new Set());
    showToast(`${selPlanning.size} SPK diselesaikan, ditambahkan ke Hasil Produksi.`);
  };

  // Batalkan planning (baik massal maupun per-baris) sekarang lewat dialog konfirmasi dulu — nilai
  // null = dialog tertutup, 'bulk' = konfirmasi utk selPlanning, {row} = konfirmasi utk 1 baris
  // (tombol trash per baris).
  const [confirmBatal, setConfirmBatal] = React.useState(null);
  const doBatalkanBulk = () => {
    const wasFirstCancelled = planningItems.length > 0 && selPlanning.has(planningItems[0].id);
    const reclaimAnchor = wasFirstCancelled ? planningItems[0].jamMulai : null;
    updateStatus(selPlanning, 'batal');
    rechain(reclaimAnchor, wasFirstCancelled);
    showToast(`${selPlanning.size} planning dibatalkan.`);
    setSelPlanning(new Set());
    setConfirmBatal(null);
  };
  const doBatalkanRow = (row) => {
    const wasFirst = planningItems.length > 0 && planningItems[0].id === row.id;
    updateStatus(new Set([row.id]), 'batal');
    rechain(wasFirst ? row.jamMulai : null, wasFirst);
    showToast('Planning dibatalkan.');
    setConfirmBatal(null);
  };

  const updateJumlah = (id, val) =>
    setItems(ls => ls.map(r => r.id === id ? {...r, jumlah: +val || 0} : r));

  const updateMenit = (id, val) =>
    setItems(ls => mfRechainMesinRows(
      ls.map(r => r.id === id ? {...r, menit: +val || 0} : r), selectedMesin, jamMulai, false));

  const moveRow = (id, dir) => {
    const originalAnchor = planningItems[0]?.jamMulai || jamMulai; // slot pertama SEBELUM ditukar
    setItems(ls => {
      const idxs = [];
      ls.forEach((r, i) => { if (r.mesin === selectedMesin && r.status === 'planning') idxs.push(i); });
      const pos = idxs.findIndex(i => ls[i].id === id);
      const swapWith = dir === 'up' ? pos - 1 : pos + 1;
      if (pos < 0 || swapWith < 0 || swapWith >= idxs.length) return ls;
      const next = [...ls];
      const a = idxs[pos], b = idxs[swapWith]; // posisi ASLI di array penuh, bukan posisi di idxs
      [next[a], next[b]] = [next[b], next[a]];
      return mfRechainMesinRows(next, selectedMesin, originalAnchor, true);
    });
  };

  const toggleSel = (set, setFn, id) =>
    setFn(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAllPlanning = (checked) =>
    setSelPlanning(checked ? new Set(planningItems.map(r => r.id)) : new Set());

  const mesinStyle = (active) => ({
    display:'block', width:'100%', textAlign:'left',
    padding:'8px 14px', fontSize:13, border:'none', outline:'none',
    background: active ? 'var(--primary-soft, #e8f0fe)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text)',
    fontWeight: active ? 600 : 400,
    borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
    cursor:'pointer', borderBottom:'1px solid var(--border)',
  });

  const thS = (w, center) => ({
    padding:'8px 8px', background:'var(--primary)', color:'#fff',
    fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
    textAlign: center ? 'center' : 'left', width: w || undefined,
  });
  const tdS = { padding:'6px 8px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };

  const emptyRow = (cols, msg) => (
    <tr><td colSpan={cols} style={{textAlign:'center', padding:'28px 8px', color:'var(--text-3)', fontSize:13}}>
      {msg}
    </td></tr>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Planning Schedule Produksi Harian</h1>
          <div className="sub">Kelola antrian dan jadwal produksi per mesin</div>
        </div>
      </div>

      <div className="mf-mesin-layout">

        {/* ── Left: Machine sidebar ── */}
        <div className="mf-mesin-sidebar">
          <div className="table-card">
            <div className="table-toolbar" style={{minHeight:42}}>
              <div className="table-toolbar-left" style={{fontWeight:600, fontSize:12.5, letterSpacing:'.04em', textTransform:'uppercase'}}>
                Nama Mesin
              </div>
            </div>
            <div style={{maxHeight:520, overflowY:'auto'}}>
              {MF_MESIN_LIST.map(m => {
                const nPlanning = items.filter(r => r.mesin === m && r.status === 'planning').length;
                return (
                  <button key={m} style={mesinStyle(selectedMesin === m)}
                    onClick={() => { setSelectedMesin(m); setSelPlanning(new Set()); }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:4}}>
                      <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m}</span>
                      <div style={{display:'flex', gap:3, flexShrink:0}}>
                        {nPlanning > 0 && <span style={{fontSize:10, padding:'1px 5px', borderRadius:10, background:'var(--primary)', color:'#fff'}}>{nPlanning}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Content ── */}
        <div style={{flex:1, minWidth:0}}>

          {/* Action bar */}
          <div className="filter-bar">
            <div className="filter-grid filter-grid-px2">
              <div className="field">
                <label>Tanggal</label>
                <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
              </div>
              <div className="field">
                <label>Jam Mulai</label>
                <input className="input" type="time" value={jamMulai}
                  onChange={e => {
                    const v = e.target.value;
                    setJamMulai(v);
                    // Ganti Jam Mulai langsung nge-reset ulang jam barang PERTAMA di antrian mesin
                    // terpilih ke waktu ini, lalu semua barang berikutnya ikut geser berantai
                    // (mfRechainMesinRows, resetFirst=true) — sebelumnya field ini cuma dipakai sbg
                    // anchor SAAT nambah baris baru ke antrian kosong, jadi kalau antrian sudah ada
                    // isinya, ubah Jam Mulai di sini tidak berpengaruh apa-apa ke jadwal yang berjalan.
                    rechain(v, true);
                  }} />
              </div>
              <div className="filter-actions">
                <button className="btn btn-primary" disabled={!selectedMesin}
                  onClick={() => setShowSpkPicker(true)}>
                  {I.plus()} Pilih SPK
                </button>
                <button className="btn" disabled={!selectedMesin}
                  onClick={() => setShowProsesModal(true)}>
                  {I.plus()} Tambah Proses
                </button>
              </div>
            </div>
          </div>

          {/* Planning table */}
          <div className="table-card" style={{marginBottom:16}}>
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <span style={{fontWeight:600}}>Planning Produksi</span>
                {selectedMesin && <span style={{marginLeft:6, color:'var(--text-3)', fontWeight:400}}>— {selectedMesin}</span>}
                {selPlanning.size > 0 && (
                  <span className="pill" style={{marginLeft:8}}>{selPlanning.size} dipilih</span>
                )}
              </div>
              {selPlanning.size > 0 && (
                <div className="table-toolbar-right">
                  <button className="btn btn-primary btn-sm" onClick={handleSelesaikanProduksi}>
                    {I.check()} Selesaikan Produksi ({selPlanning.size})
                  </button>
                  <button className="btn btn-sm" style={{color:'var(--danger)', borderColor:'var(--danger)'}}
                    onClick={() => setConfirmBatal('bulk')}>
                    {I.x()} Batalkan
                  </button>
                </div>
              )}
            </div>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th style={thS('36px', true)}>
                      <input type="checkbox" className="cb"
                        checked={planningItems.length > 0 && selPlanning.size === planningItems.length}
                        onChange={e => toggleAllPlanning(e.target.checked)} />
                    </th>
                    <th style={thS('36px', true)}>No</th>
                    <th style={thS('18%')}>No. SPK</th>
                    <th style={thS()}>Nama Barang / Proses</th>
                    <th style={thS('80px', true)}>Jumlah</th>
                    <th style={thS('60px', true)}>Sat</th>
                    <th style={thS('70px', true)}>Menit</th>
                    <th style={thS('90px', true)}>Jam Mulai</th>
                    <th style={thS('90px', true)}>Jam Selesai</th>
                    <th style={thS('96px', true)}></th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedMesin && emptyRow(10, 'Pilih mesin di sidebar untuk melihat planning produksi.')}
                  {selectedMesin && planningItems.length === 0 && emptyRow(10, 'Tidak ada SPK dalam antrian planning untuk mesin ini.')}
                  {planningItems.map((r, idx) => (
                    <tr key={r.id} style={{background: selPlanning.has(r.id) ? 'var(--primary-soft, #f0f4ff)' : ''}}>
                      <td style={{...tdS, textAlign:'center'}}>
                        <input type="checkbox" className="cb"
                          checked={selPlanning.has(r.id)}
                          onChange={() => toggleSel(selPlanning, setSelPlanning, r.id)} />
                      </td>
                      <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                      <td style={tdS}><span className="cell-link">{r.noSpk}</span></td>
                      <td style={tdS}>{r.namaBarang}</td>
                      <td style={{...tdS, textAlign:'right'}}>
                        {r.noSpk === 'Proses' ? <span style={{color:'var(--text-3)'}}>—</span> : (
                          <input className="input" type="number" min="0" style={{width:70, textAlign:'right', padding:'2px 6px'}}
                            value={r.jumlah} onChange={e => updateJumlah(r.id, e.target.value)} />
                        )}
                      </td>
                      <td style={{...tdS, textAlign:'center'}}>{r.satuan}</td>
                      <td style={{...tdS, textAlign:'right'}}>
                        <input className="input" type="number" min="0" style={{width:60, textAlign:'right', padding:'2px 6px'}}
                          value={r.menit} onChange={e => updateMenit(r.id, e.target.value)} />
                      </td>
                      <td style={{...tdS, textAlign:'center'}} className="mono">{r.jamMulai}</td>
                      <td style={{...tdS, textAlign:'center'}} className="mono">{r.jamSelesai}</td>
                      <td style={{...tdS, textAlign:'center'}}>
                        <div className="row-actions">
                          <button className="btn btn-icon btn-sm" title="Naikkan urutan" disabled={idx === 0}
                            onClick={() => moveRow(r.id, 'up')}>▲</button>
                          <button className="btn btn-icon btn-sm" title="Turunkan urutan" disabled={idx === planningItems.length - 1}
                            onClick={() => moveRow(r.id, 'down')}>▼</button>
                          <button className="btn btn-icon btn-sm" title="Batalkan"
                            style={{color:'var(--text-3)'}}
                            onClick={() => setConfirmBatal({row: r})}>
                            {I.trash()}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {showSpkPicker && (
        <MfPlanningSpkPickerModal
          rows={spkRows}
          onConfirm={(picked) => { addPlanningRowsForBjs(picked); setShowSpkPicker(false); }}
          onCancel={() => setShowSpkPicker(false)}
        />
      )}

      {showProsesModal && (
        <MfProsesEntryModal
          onSave={({ nama, menit }) => {
            setItems(ls => mfRechainMesinRows([...ls, {
              id: 'PL-' + Date.now(),
              mesin: selectedMesin, tgl, jamMulai: '', jamSelesai: '',
              noSpk: 'Proses', namaBarang: nama,
              jumlah: '', satuan: '', menit,
              status: 'planning',
            }], selectedMesin, jamMulai, false));
            setShowProsesModal(false);
            showToast('Proses berhasil ditambahkan ke planning.');
          }}
          onClose={() => setShowProsesModal(false)}
        />
      )}

      {confirmBatal && (
        <ConfirmationModal
          title="Batalkan Planning?"
          message={confirmBatal === 'bulk'
            ? `${selPlanning.size} planning yang dipilih akan dibatalkan. Lanjutkan?`
            : 'Planning ini akan dibatalkan. Lanjutkan?'}
          requireReason={false} confirmLabel="Ya, Batalkan" confirmKind="danger-solid" cancelLabel="Tutup"
          onConfirm={() => confirmBatal === 'bulk' ? doBatalkanBulk() : doBatalkanRow(confirmBatal.row)}
          onCancel={() => setConfirmBatal(null)}
        />
      )}
    </>
  );
}

// ─── Pilih SPK (multi-select, level Barang Jadi) ─────────────────────────────
// Beda dari MfSpkPickerModal (pilih 1 SPK utuh, dipakai Hasil Produksi/Pemakaian Bahan) — di sini
// tiap SPK Approved di-flatten jadi 1 baris PER Barang Jadi (1 SPK bisa punya >1 barang jadi),
// pola checkbox multi-select sama seperti MfPilihBarangModal/SaldoPickerModal, supaya user bisa
// pilih beberapa barang sekaligus (dari SPK yang sama atau lintas SPK) buat dimasukkan ke antrian
// planning 1 mesin dalam satu kali konfirmasi (sebelumnya cuma bisa 1 SPK/1 barang per klik).
function MfPlanningSpkPickerModal({ rows, onConfirm, onCancel }) {
  const [q, setQ] = React.useState('');
  const [spkFilter, setSpkFilter] = React.useState('');
  const [selected, setSelected] = React.useState({});

  const approvedSpks = React.useMemo(() =>
    (rows || MF_SPK_SEED).filter(s => s.status === 'Approved'), [rows]);

  const flatRows = React.useMemo(() => {
    const out = [];
    approvedSpks.forEach(spk => {
      (spk.bjLines || []).filter(b => !b._deleted).forEach(bj => {
        out.push({ key: `${spk.no}::${bj.id}`, spk, bj });
      });
    });
    return out;
  }, [approvedSpks]);

  const filtered = flatRows.filter(r => {
    if (spkFilter && r.spk.no !== spkFilter) return false;
    if (!q) return true;
    return r.spk.no.toLowerCase().includes(q.toLowerCase()) ||
      (r.bj.namaBarang || '').toLowerCase().includes(q.toLowerCase());
  });

  const toggle = (key) => setSelected(prev => { const next = {...prev}; if (next[key]) delete next[key]; else next[key] = true; return next; });
  const selectedCount = Object.keys(selected).length;
  const handleConfirm = () => onConfirm(flatRows.filter(r => selected[r.key]));

  return (
    <div className="modal-backdrop" style={{zIndex:200}}>
      <div className="modal item-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Pilih SPK</h2><div className="sub">Centang satu atau lebih barang untuk ditambahkan ke planning.</div></div>
          <button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div style={{display:'flex', gap:8, marginBottom:12, flexWrap:'wrap'}}>
            <div className="input-w-icon" style={{flex:1}}>{I.search(14)}<input className="input" placeholder="Cari No. SPK atau Nama Barang…" value={q} onChange={e => setQ(e.target.value)}/></div>
            <select className="select" style={{width:200}} value={spkFilter} onChange={e => setSpkFilter(e.target.value)}>
              <option value="">Semua No. SPK</option>
              {approvedSpks.map(spk => <option key={spk.no} value={spk.no}>{spk.no}</option>)}
            </select>
          </div>
          <div className="line-items picker-table" style={{maxHeight:420, overflowY:'auto'}}>
            <table>
              <thead>
                <tr>
                  <th style={{width:44, textAlign:'center'}}></th>
                  <th>No. SPK</th><th>Nama Barang</th><th>Kode Barang</th>
                  <th className="num">Qty</th><th>Gudang</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="empty">Tidak ada SPK Approved dengan barang jadi.</td></tr>}
                {filtered.map(r => (
                  <tr key={r.key} style={{cursor:'pointer'}} onClick={() => toggle(r.key)}>
                    <td style={{textAlign:'center'}} onClick={e => e.stopPropagation()}><input type="checkbox" className="cb" checked={!!selected[r.key]} onChange={() => toggle(r.key)}/></td>
                    <td className="mono">{r.spk.no}</td>
                    <td>{r.bj.namaBarang}</td>
                    <td className="mono">{r.bj.kodeBarang}</td>
                    <td className="num mono">{r.bj.qtySPK} {r.bj.satuan}</td>
                    <td>{r.spk.gudang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>{selectedCount} dipilih</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onCancel}>Batal</button>
            <button className="btn btn-primary" disabled={selectedCount===0} onClick={handleConfirm}>Tambah ke Planning ({selectedCount})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tambah Proses (aktivitas non-SPK: pembersihan mesin, inspeksi, dll) ─────
// No. SPK baris ini sengaja diisi literal 'Proses' (bukan referensi SPK asli), Nama Barang/Proses
// diisi bebas oleh user, Menit diisi manual, jam mulai/selesai mengikuti chain otomatis mesin
// terpilih (mfRechainMesinRows) — sama seperti baris SPK biasa.
function MfProsesEntryModal({ onClose, onSave }) {
  const [nama, setNama] = React.useState('');
  const [menit, setMenit] = React.useState('');

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const valid = nama.trim() && (+menit || 0) > 0;
  const handleSave = () => { if (valid) onSave({ nama: nama.trim(), menit: +menit || 0 }); };

  return (
    <div className="modal-backdrop" style={{zIndex:200}}>
      <div className="modal" style={{maxWidth:420}} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Tambah Proses</h2>
            <div className="sub">Aktivitas non-SPK, mis. pembersihan mesin, inspeksi, dll.</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={{display:'flex', flexDirection:'column', gap:14}}>
          <div className="field">
            <label>Nama Proses *</label>
            <input className="input" placeholder="mis. Pembersihan mesin, Inspeksi…" autoFocus
              value={nama} onChange={e => setNama(e.target.value)} />
          </div>
          <div className="field">
            <label>Menit *</label>
            <input className="input" type="number" min="0" placeholder="0"
              value={menit} onChange={e => setMenit(e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" disabled={!valid} onClick={handleSave}>{I.check()} Tambah</button>
          </div>
        </div>
      </div>
    </div>
  );
}
