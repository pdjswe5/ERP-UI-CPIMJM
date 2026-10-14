// Manufaktur — Hasil Produksi & Pemakaian Bahan: list dan dialog (create/edit).
// Dipindah dari manufaktur.jsx, identifier diprefix Mf/MF_.
//
// Root-cause fix (merge SPK <-> Hasil Produksi): sebelumnya dialog ini punya tabel "Daftar SPK"
// sendiri yang MENIRU ULANG field Barang Jadi/Bahan milik SPK dengan nama beda (merkSpk/kodeMerkSpk
// dsb "double field") dan cuma ambil SATU barang jadi representatif per SPK (bjLines[0]) — barang
// jadi ke-2/3 sebuah SPK nggak pernah bisa direkam di sini. Sekarang aturannya: 1 No. Bukti = 1
// Barang Jadi. Field Barang Jadi disalin APA ADANYA dari spk.bjLines[] (nama field sama persis),
// Bahan-nya (bahanLines) juga dari spk.bahanLines[] tapi bisa ditambah/diubah/dihapus di sini kalau
// pemakaian aktual beda dari rencana SPK — dan field pemakaian (No. Coil/Kondisi/Lapisan PU/
// Pembelian/Sisa Stok) sekarang per-Bahan (bukan per-SPK lagi), sesuai nama modul ini sendiri.

// ─── Hasil Produksi Dialog ────────────────────────────────────────────────────

function MfHasilProduksiDialog({ data, spkRows, onClose, onSave }) {
  const isCreate = !data;

  // No. Bukti: gerbang F/K sama pola dengan KO/SO/DO/SPK — user ketik F atau K, field lain
  // (Tgl. Bukti, Gudang) baru bisa diisi setelah itu, nomor lengkap dibuat saat Simpan.
  const [noBuktiRaw, setNoBuktiRaw] = React.useState('');
  const [noBuktiError, setNoBuktiError] = React.useState('');
  const noBuktiRef = React.useRef(null);
  const handleNoBuktiChange = (val) => {
    const v = val.toUpperCase();
    setNoBuktiRaw(v);
    if (!v) setNoBuktiError('No. Bukti harus di isi');
    else if (!['F','K'].includes(v[0])) setNoBuktiError('Format No. Bukti salah');
    else setNoBuktiError('');
  };
  const noBuktiLocked = isCreate && (!noBuktiRaw || !['F','K'].includes(noBuktiRaw[0]));
  React.useEffect(() => { if (isCreate && noBuktiRef.current) noBuktiRef.current.focus(); }, [isCreate]);

  const [tgl,    setTgl]    = React.useState(data?.tgl    || '2026-06-24');
  const [gudang, setGudang] = React.useState(data?.gudang || '');

  // SPK + Barang Jadi — hanya bisa dipilih sekali saat CREATE (mengunci konsisten dgn pola gerbang
  // No. Bukti); di EDIT, field ini murni tampilan dari data yang sudah tersimpan.
  const [noSpk, setNoSpk] = React.useState(data?.noSpk || '');
  const [bj, setBj] = React.useState(() => data ? {
    bjLineId: data.bjLineId, kodeBarang: data.kodeBarang, namaBarang: data.namaBarang,
    qtySPK: data.qtySPK, satuan: data.satuan,
    namaKelompokWarna: data.namaKelompokWarna, namaAz: data.namaAz, namaBrand: data.namaBrand,
    namaMerkBarang: data.namaMerkBarang, stempel: data.stempel, mesinDipilih: data.mesinDipilih || [],
  } : null);
  const [bahanLines, setBahanLines] = React.useState(() => (data?.bahanLines || []).map(r => ({...r})));

  const [showSpkPicker, setShowSpkPicker] = React.useState(false);
  const [pendingSpk, setPendingSpk] = React.useState(null); // SPK sudah dipilih, nunggu pilih Barang Jadi (kalau >1)
  const [showBahanPicker, setShowBahanPicker] = React.useState(false);
  const [coilPickerForRowId, setCoilPickerForRowId] = React.useState(null);

  const modalBodyRef = React.useRef(null);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !showSpkPicker && !pendingSpk && !showBahanPicker && !coilPickerForRowId) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [showSpkPicker, pendingSpk, showBahanPicker, coilPickerForRowId, onClose]);

  const applyBjPick = (spk, bjLine) => {
    setNoSpk(spk.no);
    setBj({
      bjLineId: bjLine.id, kodeBarang: bjLine.kodeBarang, namaBarang: bjLine.namaBarang,
      qtySPK: bjLine.qtySPK, satuan: bjLine.satuan,
      namaKelompokWarna: bjLine.namaKelompokWarna, namaAz: bjLine.namaAz, namaBrand: bjLine.namaBrand,
      namaMerkBarang: bjLine.namaMerkBarang, stempel: bjLine.stempel, mesinDipilih: bjLine.mesinDipilih || [],
    });
    setBahanLines((spk.bahanLines || []).filter(b => b.bjLineId === bjLine.id).map(b => ({
      id: Date.now() + Math.random(), gudang: b.gudang, kodeBahan: b.kodeBahan, merkBahan: b.merkBahan,
      jumlah: b.jumlah, satuan: b.satuan,
      noCoil: '', kondisi: 'Normal', lapisanPu: 'Atas', pembelian: '', sisaStok: '',
    })));
  };

  const onSpkPick = (spk) => {
    setShowSpkPicker(false);
    const bjLines = (spk.bjLines || []).filter(b => !b._deleted);
    if (bjLines.length <= 1) {
      if (bjLines[0]) applyBjPick(spk, bjLines[0]);
    } else {
      setPendingSpk(spk);
    }
  };

  // Bahan sekarang dari BAHAN_BAKU/BARANG_LAIN (modul Barang), bukan MF_BARANG lagi.
  const bahanPickerItems = React.useMemo(() => [
    ...BAHAN_BAKU.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk })),
    ...BARANG_LAIN.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk })),
  ], []);
  const onBahanPick = (picked) => {
    setBahanLines(ls => [...ls, ...picked.map((b, i) => {
      const resolved = brgBomResolveKomponen(b.kode);
      return {
        id: Date.now() + i, gudang:'', kodeBahan:b.kode, merkBahan: resolved?.keterangan || '', jumlah:b._qty || '', satuan: resolved?.satuan || '',
        noCoil:'', kondisi:'Normal', lapisanPu:'Atas', pembelian:'', sisaStok:'',
      };
    })]);
    setShowBahanPicker(false);
  };
  const updateBahan = (id, field, val) =>
    setBahanLines(ls => ls.map(r => r.id === id ? {...r, [field]: val} : r));
  const removeBahan = (id) => setBahanLines(ls => ls.filter(r => r.id !== id));
  const onCoilPick = (coil) => {
    setBahanLines(ls => ls.map(r => r.id === coilPickerForRowId
      ? {...r, noCoil: coil.no, sisaStok: r.sisaStok || String(coil.sisa)} : r));
    setCoilPickerForRowId(null);
  };

  const handleSave = () => {
    const finalNo = isCreate
      ? (noBuktiRaw[0] || '') + 'HP' + new Date().toISOString().slice(2,4) + new Date().toISOString().slice(5,7) + String(Math.floor(Math.random()*9000)+1000)
      : data.no;
    onSave({
      no: finalNo, tgl, gudang,
      dibuatOleh: data?.dibuatOleh || 'Admin', dibuatTgl: data?.dibuatTgl || `${tgl} 09:00`,
      noSpk, bjLineId: bj?.bjLineId ?? null,
      kodeBarang: bj?.kodeBarang || '', namaBarang: bj?.namaBarang || '',
      qtySPK: bj?.qtySPK ?? '', satuan: bj?.satuan || '',
      namaKelompokWarna: bj?.namaKelompokWarna || '', namaAz: bj?.namaAz || '',
      namaBrand: bj?.namaBrand || '', namaMerkBarang: bj?.namaMerkBarang || '',
      stempel: bj?.stempel || '', mesinDipilih: bj?.mesinDipilih || [],
      bahanLines,
    });
  };

  const tdS = { padding:'5px 6px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };
  const thS = (w, center) => ({
    padding:'10px 10px', fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
    textAlign: center ? 'center' : 'left', width: w || undefined,
  });

  const canEditBj = isCreate; // SPK/Barang Jadi terkunci begitu tersimpan (mode Edit)

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal" style={{maxWidth:1440}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit Hasil Produksi' : 'Buat Hasil Produksi & Pemakaian Bahan'}</h2>
              <div className="sub">Pastikan semua kolom bertanda (*) terisi.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="modal-body" ref={modalBodyRef} style={{paddingTop:0, position:'relative'}}>

            {/* ── Header info bar ────────────────────────────── */}
            <div style={{
              background:'var(--bg-sub)', padding:'14px 0 14px',
              marginLeft:-24, marginRight:-24, paddingLeft:24, paddingRight:24,
              borderBottom:'1px solid var(--border)', marginBottom:0,
            }}>
              <div style={{display:'grid', gridTemplateColumns:'220px 160px 1fr', gap:12}}>
                <div className="field" style={{marginBottom:0}}>
                  <label>No. Bukti *</label>
                  {isCreate ? (
                    <>
                      <input ref={noBuktiRef} className="input mono" type="text" value={noBuktiRaw}
                        onChange={e => handleNoBuktiChange(e.target.value)} placeholder="Ketik F atau K" maxLength={1} />
                      {noBuktiError && <div className="no-bukti-alert">{noBuktiError}</div>}
                    </>
                  ) : (
                    <input className="input" value={data?.no} readOnly />
                  )}
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Tgl. Bukti *</label>
                  <input className="input" type="date" value={tgl} disabled={noBuktiLocked} onChange={e => setTgl(e.target.value)} />
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Gudang *</label>
                  <select className="select" value={gudang} disabled={noBuktiLocked} onChange={e => setGudang(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {MF_GUDANG_LIST.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Content ────────────────────────────────────── */}
            <div style={{paddingTop:20, display:'flex', flexDirection:'column', gap:24}}>

              {/* Section: SPK + Barang Jadi (1 No. Bukti = 1 Barang Jadi) */}
              <div>
                <h3 style={{margin:'0 0 8px', fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text)'}}>
                  Barang Jadi
                </h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(12, minmax(0,1fr))', gap:16}}>
                  <div className="field" style={{gridColumn:'span 4', marginBottom:0}}>
                    <label>No. SPK *</label>
                    <input className="input" readOnly
                      style={{cursor: canEditBj ? 'pointer' : 'default', background:'var(--bg-elev)'}}
                      placeholder="— Pilih SPK —" value={noSpk}
                      onClick={() => { if (canEditBj) setShowSpkPicker(true); }} />
                  </div>
                  <div className="field" style={{gridColumn:'span 4', marginBottom:0}}>
                    <label>Nama Barang</label>
                    <input className="input" value={bj?.namaBarang || ''} readOnly placeholder="Otomatis dari SPK" />
                  </div>
                  <div className="field" style={{gridColumn:'span 2', marginBottom:0}}>
                    <label>Qty SPK</label>
                    <input className="input mono" value={bj ? `${bj.qtySPK} ${bj.satuan}` : ''} readOnly placeholder="Otomatis" />
                  </div>
                  <div className="field" style={{gridColumn:'span 2', marginBottom:0}}>
                    <label>Kode Barang</label>
                    <input className="input mono" value={bj?.kodeBarang || ''} readOnly placeholder="Otomatis" />
                  </div>

                  <div className="field" style={{gridColumn:'span 3', marginBottom:0}}>
                    <label>Kelompok Warna</label>
                    <input className="input" value={bj?.namaKelompokWarna || ''} readOnly placeholder="Otomatis dari SPK" />
                  </div>
                  <div className="field" style={{gridColumn:'span 3', marginBottom:0}}>
                    <label>AZ</label>
                    <input className="input" value={bj?.namaAz || ''} readOnly placeholder="Otomatis dari SPK" />
                  </div>
                  <div className="field" style={{gridColumn:'span 3', marginBottom:0}}>
                    <label>Brand</label>
                    <input className="input" value={bj?.namaBrand || ''} readOnly placeholder="Otomatis dari SPK" />
                  </div>
                  <div className="field" style={{gridColumn:'span 3', marginBottom:0}}>
                    <label>Merk Barang</label>
                    <input className="input" value={bj?.namaMerkBarang || ''} readOnly placeholder="Otomatis dari SPK" />
                  </div>

                  <div className="field" style={{gridColumn:'span 12', marginBottom:0}}>
                    <label>Mesin (dari SPK)</label>
                    <div style={{display:'flex', flexWrap:'wrap', gap:6, minHeight:32, alignItems:'center'}}>
                      {(bj?.mesinDipilih || []).length === 0 ? (
                        <span style={{color:'var(--text-3)', fontSize:13}}>—</span>
                      ) : bj.mesinDipilih.map(m => (
                        <span key={m} style={{display:'inline-block', padding:'3px 10px', borderRadius:999,
                          fontSize:12, fontWeight:500, background:'var(--bg-sub)', border:'1px solid var(--border)',
                          color:'var(--text-2)'}}>{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Bahan — default dari SPK, bisa ditambah/diubah/dihapus kalau pemakaian
                  aktual beda dari rencana. No. Coil/Kondisi/Lapisan PU/Pembelian/Sisa Stok di sini
                  per-Bahan (bukan per-SPK lagi) — cocok sama nama modul "Pemakaian Bahan". */}
              <div className="inline-table">
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                  <h3 style={{margin:0, fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text)'}}>Bahan</h3>
                  <button className="btn btn-primary btn-sm" disabled={!bj} onClick={() => setShowBahanPicker(true)}>{I.plus()} Tambah Bahan</button>
                </div>
                <div className="line-items" style={{overflowX:'auto'}}>
                  {/* Kolom fixed-px (No/Aksi) + % HARUS pas 100% total, sama kayak tabel Barang Jadi
                      di SpkPage.jsx — kalau kurang, table-layout:fixed nge-stretch SEMUA kolom
                      (termasuk yg px) buat nutup sisanya. Merk Bahan dijadiin sisa via calc(). */}
                  <table style={{width:'100%', tableLayout:'fixed', borderCollapse:'separate', borderSpacing:0, minWidth:1300}}>
                    <thead>
                      <tr>
                        <th style={thS('30px', true)}>No</th>
                        <th style={thS('11%')}>Gudang</th>
                        <th style={thS('11%')}>Kode Bahan</th>
                        <th style={thS('calc(100% - 80px - 86%)')}>Merk Bahan</th>
                        <th style={thS('7%', true)}>Jumlah</th>
                        <th style={thS('6%', true)}>Satuan</th>
                        <th style={thS('12%')}>No. Coil</th>
                        <th style={thS('13%')}>Kondisi COIL</th>
                        <th style={thS('8%')}>Lapisan PU</th>
                        <th style={thS('10%')}>Pembelian</th>
                        <th style={thS('8%', true)}>Sisa Stok</th>
                        <th style={thS('50px', true)}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bahanLines.length === 0 && (
                        <tr><td colSpan={12} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                          {bj ? 'Belum ada bahan. Klik "+ Tambah Bahan" untuk menambahkan.' : 'Pilih SPK terlebih dahulu untuk melihat bahan.'}
                        </td></tr>
                      )}
                      {bahanLines.map((row, idx) => (
                        <tr key={row.id}>
                          <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.gudang} onChange={e => updateBahan(row.id, 'gudang', e.target.value)}>
                              <option value="">— Pilih —</option>
                              {MF_GUDANG_LIST.map(g => <option key={g}>{g}</option>)}
                            </select>
                          </td>
                          <td style={{...tdS, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                            <span style={{color:'var(--primary)', fontWeight:500}}>{row.kodeBahan}</span>
                          </td>
                          <td style={{...tdS, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                            {row.merkBahan || <span style={{color:'var(--text-3)'}}>—</span>}
                          </td>
                          <td style={tdS}>
                            <input className="input" type="number" min="0" step="0.01"
                              style={{width:'100%', fontSize:12, padding:'3px 6px', textAlign:'right'}}
                              placeholder="0.00" value={row.jumlah}
                              onChange={e => updateBahan(row.id, 'jumlah', e.target.value)} />
                          </td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.satuan} onChange={e => updateBahan(row.id, 'satuan', e.target.value)}>
                              {MF_SATUAN_SPK.map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={tdS}>
                            <input className="input mono" readOnly style={{width:'100%', fontSize:12, padding:'3px 6px', cursor:'pointer', background:'var(--bg-elev)'}}
                              placeholder="— Pilih —" value={row.noCoil}
                              onClick={() => setCoilPickerForRowId(row.id)} />
                          </td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.kondisi} onChange={e => updateBahan(row.id, 'kondisi', e.target.value)}>
                              {HP_KONDISI.map(k => <option key={k}>{k}</option>)}
                            </select>
                          </td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.lapisanPu} onChange={e => updateBahan(row.id, 'lapisanPu', e.target.value)}>
                              <option>Atas</option>
                              <option>Bawah</option>
                            </select>
                          </td>
                          <td style={tdS}>
                            <input className="input" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              placeholder="No. Pembelian…" value={row.pembelian}
                              onChange={e => updateBahan(row.id, 'pembelian', e.target.value)} />
                          </td>
                          <td style={tdS}>
                            <input className="input" style={{width:'100%', fontSize:12, padding:'3px 6px', textAlign:'right'}}
                              placeholder="0.00" value={row.sisaStok}
                              onChange={e => updateBahan(row.id, 'sisaStok', e.target.value)} />
                          </td>
                          <td style={{...tdS, textAlign:'center'}}>
                            <button className="btn btn-icon btn-sm del" title="Hapus" onClick={() => removeBahan(row.id)}>{I.trash()}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" disabled={!bj} onClick={handleSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {showSpkPicker && (
        <MfSpkPickerModal rows={spkRows} filter={s => s.status === 'Approved'}
          onPick={onSpkPick} onClose={() => setShowSpkPicker(false)} />
      )}
      {pendingSpk && (
        <MfSpkBjPickerModal spk={pendingSpk}
          onPick={(bjLine) => { applyBjPick(pendingSpk, bjLine); setPendingSpk(null); }}
          onClose={() => setPendingSpk(null)} />
      )}
      {showBahanPicker && (
        <MfPilihBarangModal zIndex={300} items={bahanPickerItems} onConfirm={onBahanPick} onCancel={() => setShowBahanPicker(false)} />
      )}
      {coilPickerForRowId && (
        <MfCoilPickerModal onPick={onCoilPick} onClose={() => setCoilPickerForRowId(null)} />
      )}
    </>
  );
}

// ─── Hasil Produksi List ──────────────────────────────────────────────────────

function MfHasilProduksiList({ rows, onAdd, onEdit }) {
  const [tglDari, setTglDari] = React.useState('');
  const [tglSmp, setTglSmp]   = React.useState('');
  const [spkF, setSpkF]       = React.useState('');
  const [page, setPage]       = React.useState(1);
  const perPage = 10;
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow]   = React.useState(null);

  const filtered = rows.filter(r => {
    if (spkF && !r.noSpk.toLowerCase().includes(spkF.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hasil Produksi &amp; Pemakaian Bahan</h1>
          <div className="sub">Daftar dokumen hasil produksi</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-grid filter-grid-5">
          <div className="field">
            <label>Tgl. Dari</label>
            <input className="input" type="date" value={tglDari} onChange={e => setTglDari(e.target.value)} />
          </div>
          <div className="field">
            <label>Tgl. Sampai</label>
            <input className="input" type="date" value={tglSmp} onChange={e => setTglSmp(e.target.value)} />
          </div>
          <div className="field">
            <label>No. SPK</label>
            <input className="input" placeholder="SPK-2026-…" value={spkF} onChange={e => setSpkF(e.target.value)} />
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={() => setPage(1)}>{I.search(13)} Cari</button>
            <button className="btn" onClick={() => { setTglDari(''); setTglSmp(''); setSpkF(''); setPage(1); }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            Total Item <b>({filtered.length})</b>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-primary btn-sm" onClick={onAdd}>{I.plus()} Tambah Data</button>
            <button className="btn btn-sm btn-icon" title="Refresh">{I.refresh()}</button>
            <button className="btn btn-sm btn-icon" title="Cetak" onClick={() => { setCetakRow(null); setShowCetak(true); }}>{I.print()}</button>
            <button className="btn btn-sm btn-icon btn-danger" title="Hapus">{I.trash()}</button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:32}}><input type="checkbox" className="cb" /></th>
                <th>No. Bukti</th>
                <th>No. SPK</th>
                <th>Barang Jadi</th>
                <th className="num">Qty Produksi</th>
                <th>Tanggal</th>
                <th>Gudang</th>
                <th>Stempel</th>
                <th className="num">Jml Bahan</th>
                <th className="center" style={{width:60}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr><td colSpan={10} style={{textAlign:'center', padding:32, color:'var(--text-3)'}}>Tidak ada data</td></tr>
              )}
              {pageRows.map(r => (
                <tr key={r.no}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" className="cb" /></td>
                  <td><span className="cell-link" style={{cursor:'pointer'}} onClick={() => onEdit(r)}>{r.no}</span></td>
                  <td className="muted">{r.noSpk}</td>
                  <td>{r.namaBarang}</td>
                  <td className="num mono">{r.qtySPK} {r.satuan}</td>
                  <td>{r.tgl}</td>
                  <td>{r.gudang}</td>
                  <td>
                    {r.stempel
                      ? <span style={{display:'inline-block', padding:'2px 8px', borderRadius:999,
                          fontSize:11.5, fontWeight:600, background:'var(--primary)', color:'#fff'}}>
                          {r.stempel}
                        </span>
                      : <span style={{color:'var(--text-3)'}}>—</span>}
                  </td>
                  <td className="num mono">{(r.bahanLines || []).length}</td>
                  <td className="center">
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={() => onEdit(r)}>{I.edit()}</button>
                      <button className="btn btn-icon btn-sm" title="Cetak" onClick={() => { setCetakRow(r); setShowCetak(true); }}>{I.print()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>Menampilkan {pageRows.length} dari {filtered.length} data</span>
          <div className="pager-pages">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{I.chev(12,'left')}</button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{I.chev(12,'right')}</button>
          </div>
        </div>
      </div>

      {showCetak && (
        <MfCetakModal docLabel="Hasil Produksi" rows={rows}
          initialSelected={cetakRow ? [cetakRow.no] : null}
          onClose={() => { setShowCetak(false); setCetakRow(null); }} />
      )}
    </>
  );
}
