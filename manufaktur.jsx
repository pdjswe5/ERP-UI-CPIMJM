// Modul Manufaktur — Surat Perintah Kerja & Hasil Produksi & Pemakaian Bahan

// ─── Dashboard ───────────────────────────────────────────────────────────────

function ManufakturDashboard({ onOpenSub }) {
  const tiles = [
    {
      id: 'spk',
      icon: I.list(20),
      title: 'Surat Perintah Kerja',
      desc: 'Buat dan kelola work order produksi.',
      badge: SPK_LIST.filter(s => s.status === 'Pending Approval').length + ' Menunggu',
      count: SPK_LIST.length + ' SPK',
    },
    {
      id: 'produksi',
      icon: I.box(20),
      title: 'Hasil Produksi & Pemakaian Bahan',
      desc: 'Catat hasil produksi dan pemakaian bahan baku.',
      badge: null,
      count: HP_LIST.length + ' Dokumen',
    },
    {
      id: 'bpbl',
      icon: I.invoice(20),
      title: 'Bukti Pemakaian Barang Lain',
      desc: 'Catat pemakaian barang lain dari gudang.',
      badge: null,
      count: BPBL_LIST.length + ' Dokumen',
    },
    {
      id: 'rpbl',
      icon: I.truck(20),
      title: 'Retur Pakai Barang Lain',
      desc: 'Catat pengembalian barang ke gudang.',
      badge: null,
      count: RPBL_LIST.length + ' Dokumen',
    },
    {
      id: 'planning',
      icon: I.cal(20),
      title: 'Planning Schedule Produksi',
      desc: 'Kelola antrian dan jadwal produksi per mesin.',
      badge: PLANNING_LIST.filter(r => r.status === 'planning').length + ' Antrian',
      count: MESIN_LIST.length + ' Mesin',
    },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Manufaktur</h1>
          <div className="sub">Kelola proses produksi dan pemakaian bahan</div>
        </div>
      </div>
      <div className="tile-grid">
        {tiles.map(t => (
          <button key={t.id} className="tile" onClick={() => onOpenSub(t.id)}>
            <div className="tile-head">
              <div className="tile-icon-wrap">{t.icon}</div>
              {t.badge && (
                <span className="tile-badge pulse">{t.badge}</span>
              )}
            </div>
            <div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
            <div className="tile-foot"><b>{t.count}</b> {I.arrowR(11)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Barang Jadi Entry Modal (for SPK) ───────────────────────────────────────

function BarangJadiEntryModal({ data, onClose, onSave }) {
  const [kodeBarang,    setKodeBarang]    = React.useState(data?.kodeBarang    || '');
  const [namaBarang,    setNamaBarang]    = React.useState(data?.namaBarang    || '');
  const [qtySPK,        setQtySPK]        = React.useState(data?.qtySPK        || '');
  const [satuan,        setSatuan]        = React.useState(data?.satuan        || 'LBR');
  const [kelompokWarna, setKelompokWarna] = React.useState(data?.kelompokWarna || '');
  const [az,            setAz]            = React.useState(data?.az            || '');
  const [brand,         setBrand]         = React.useState(data?.brand         || '');
  const [merkBarang,    setMerkBarang]    = React.useState(data?.merkBarang    || '');
  const [stempel,       setStempel]       = React.useState(data?.stempel       || '');
  const [mesinDipilih,  setMesinDipilih]  = React.useState(data?.mesinDipilih  || []);
  const [showBarangPicker, setShowBarangPicker] = React.useState(false);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !showBarangPicker) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [showBarangPicker, onClose]);

  const onBarangPick = (b) => {
    setKodeBarang(b.code);
    setNamaBarang(b.nama);
    setShowBarangPicker(false);
  };

  const toggleMesin = (nama) => {
    setMesinDipilih(ls => ls.includes(nama) ? ls.filter(m => m !== nama) : [...ls, nama]);
  };

  const handleSave = () => {
    onSave({ kodeBarang, namaBarang, qtySPK, satuan, kelompokWarna, az, brand, merkBarang, stempel, mesinDipilih });
  };

  const panelStyle = {
    border:'1px solid var(--border)', borderRadius:'var(--radius)',
    overflowY:'auto', height:190, background:'var(--bg)',
  };
  const panelHeadStyle = {
    padding:'6px 10px', background:'var(--primary)', color:'#fff',
    fontSize:11.5, fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase',
  };

  return (
    <>
      <div className="modal-backdrop" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:820}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit Barang Jadi' : 'Tambah Barang Jadi'}</h2>
              <div className="sub">Pilih barang, isi detail, dan tentukan mesin yang digunakan.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="modal-body">
            <div style={{display:'flex', flexDirection:'column', gap:14}}>

              {/* Row 1: Kode + Nama */}
              <div style={{display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap'}}>
                <div className="field" style={{width:220}}>
                  <label>Kode Barang *</label>
                  <div style={{display:'flex', gap:4}}>
                    <input className="input" style={{flex:1}} placeholder="— Pilih —"
                      value={kodeBarang} readOnly />
                    <button className="btn btn-icon" title="Cari Barang"
                      onClick={() => setShowBarangPicker(true)}>{I.search(14)}</button>
                  </div>
                </div>
                <div className="field" style={{flex:1}}>
                  <label>Nama Barang</label>
                  <input className="input" value={namaBarang} readOnly
                    style={{background:'var(--bg-sub)'}} placeholder="auto" />
                </div>
              </div>

              {/* Row 2: Qty + Satuan + Kelompok Warna + AZ */}
              <div className="form-grid-px4a" style={{gap:10}}>
                <div className="field">
                  <label>Qty SPK *</label>
                  <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                    value={qtySPK} onChange={e => setQtySPK(e.target.value)} />
                </div>
                <div className="field">
                  <label>Satuan</label>
                  <select className="select" value={satuan} onChange={e => setSatuan(e.target.value)}>
                    {SATUAN_SPK.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Kelompok Warna</label>
                  <select className="select" value={kelompokWarna} onChange={e => setKelompokWarna(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {KELOMPOK_WARNA.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>AZ</label>
                  <select className="select" value={az} onChange={e => setAz(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {AZ_LIST.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Brand + Merk Barang + Stempel */}
              <div className="form-row-3">
                <div className="field">
                  <label>Brand</label>
                  <select className="select" value={brand} onChange={e => setBrand(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {BRAND_LIST.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Merk Barang</label>
                  <select className="select" value={merkBarang} onChange={e => setMerkBarang(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {MERK_BARANG_LIST.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Stempel</label>
                  <select className="select" value={stempel} onChange={e => setStempel(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {STEMPEL_LIST.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Machine picker dual-panel */}
              <div>
                <div style={{fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em',
                  color:'var(--text-3)', marginBottom:8}}>Daftar Mesin</div>
                <div className="form-grid-2" style={{gap:12}}>
                  {/* Left: all machines */}
                  <div>
                    <div style={panelHeadStyle}>Daftar Mesin — klik untuk pilih</div>
                    <div style={panelStyle}>
                      {MESIN_LIST.map(m => {
                        const selected = mesinDipilih.includes(m);
                        return (
                          <div key={m} onClick={() => toggleMesin(m)} style={{
                            padding:'6px 10px', cursor:'pointer', fontSize:13,
                            background: selected ? 'var(--primary-soft, #e8f0fe)' : 'transparent',
                            color: selected ? 'var(--primary)' : 'var(--text)',
                            fontWeight: selected ? 600 : 400,
                            borderBottom:'1px solid var(--border)',
                            display:'flex', alignItems:'center', justifyContent:'space-between',
                          }}>
                            {m}
                            {selected && <span style={{fontSize:11, opacity:.7}}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Right: selected machines */}
                  <div>
                    <div style={panelHeadStyle}>Mesin YG Dipakai — klik untuk hapus</div>
                    <div style={panelStyle}>
                      <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                          <tr>
                            <th style={{padding:'5px 8px', fontSize:11.5, fontWeight:600, textAlign:'center',
                              borderBottom:'1px solid var(--border)', width:52}}>No.</th>
                            <th style={{padding:'5px 8px', fontSize:11.5, fontWeight:600,
                              borderBottom:'1px solid var(--border)'}}>Mesin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mesinDipilih.length === 0 && (
                            <tr><td colSpan={2} style={{padding:'16px 8px', textAlign:'center',
                              color:'var(--text-3)', fontSize:12}}>Belum ada mesin dipilih</td></tr>
                          )}
                          {mesinDipilih.map((m, i) => (
                            <tr key={m} onClick={() => toggleMesin(m)} style={{cursor:'pointer'}}
                              onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                              onMouseLeave={e => e.currentTarget.style.background=''}>
                              <td style={{padding:'5px 8px', textAlign:'center', borderBottom:'1px solid var(--border)',
                                fontSize:12, color:'var(--text-3)'}}>{i + 1}</td>
                              <td style={{padding:'5px 8px', borderBottom:'1px solid var(--border)', fontSize:13}}>{m}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" onClick={handleSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>
      {showBarangPicker && (
        <PilihBarangModal zIndex={300} onPick={onBarangPick} onClose={() => setShowBarangPicker(false)} />
      )}
    </>
  );
}

// ─── SPK Dialog ──────────────────────────────────────────────────────────────

function SpkDialog({ data, onClose, onSave }) {
  const nextNo = 'SPK-2026-00' + (SPK_LIST.length + 22);

  // Header fields
  const [tgl,      setTgl]      = React.useState(data?.tgl      || '2026-06-24');
  const [noSo,     setNoSo]     = React.useState(data?.noSo     || '');
  const [stempel,  setStempel]  = React.useState(data?.stempel  || '');
  const [merk,     setMerk]     = React.useState(data?.merk     || '');
  const [status,   setStatus]   = React.useState(data?.status   || 'Proses');
  const [tglKirim, setTglKirim] = React.useState(data?.tglKirim || '');

  // Line items
  const [bjLines,    setBjLines]    = React.useState([]);
  const [bahanLines, setBahanLines] = React.useState([]);
  const [bjModal,    setBjModal]    = React.useState(null);  // null | 'add' | {idx, data}
  const [activeTab,  setActiveTab]  = React.useState('bj');

  // Approval
  const fmtNow = () => {
    const d = new Date();
    const p = n => String(n).padStart(2,'0');
    return `${p(d.getDate())}-${p(d.getMonth()+1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const [dibuatOleh,    setDibuatOleh]    = React.useState(data?.dibuatOleh    || 'Admin');
  const [dibuatTgl,     setDibuatTgl]     = React.useState(data?.dibuatTgl     || fmtNow());
  const [isApproved,    setIsApproved]    = React.useState(data?.isApproved    || false);
  const [disetujuiOleh, setDisetujuiOleh] = React.useState(data?.disetujuiOleh || '');
  const [disetujuiTgl,  setDisetujuiTgl]  = React.useState(data?.disetujuiTgl  || '');

  const handleApprove = () => {
    setIsApproved(true);
    setDisetujuiOleh('Admin');
    setDisetujuiTgl(fmtNow());
  };

  const modalBodyRef = React.useRef(null);
  const bjRef        = React.useRef(null);
  const bahanRef     = React.useRef(null);

  const scrollTo = (id, ref) => {
    setActiveTab(id);
    if (!ref.current || !modalBodyRef.current) return;
    const body    = modalBodyRef.current;
    const bodyTop = body.getBoundingClientRect().top;
    const refTop  = ref.current.getBoundingClientRect().top;
    body.scrollBy({ top: refTop - bodyTop - 52, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !bjModal) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [bjModal, onClose]);

  const addBahanRow = () => setBahanLines(ls => [...ls, {
    id: Date.now(), gudang:'', kodeBahan:'', merkBahan:'', jumlah:'', satuan:'MTR',
  }]);

  const updateBahan = (idx, field, val) =>
    setBahanLines(ls => ls.map((r, i) => {
      if (i !== idx) return r;
      if (field === 'kodeBahan') {
        const b = MANUFAKTUR_BARANG.find(x => x.code === val);
        return {...r, kodeBahan: val, merkBahan: b?.merk || ''};
      }
      return {...r, [field]: val};
    }));

  const tdS = { padding:'5px 6px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };
  const thS = (w, center) => ({
    padding:'8px 8px', background:'var(--primary)', color:'#fff',
    fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
    textAlign: center ? 'center' : 'left', width: w || undefined,
  });

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal" style={{maxWidth:1440}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit Surat Perintah Kerja' : 'Buat Surat Perintah Kerja'}</h2>
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
              <div className="form-grid-px4b" style={{gap:12, marginBottom:10}}>
                <div className="field" style={{marginBottom:0}}>
                  <label>No. SPK</label>
                  <input className="input" value={data?.no || nextNo} readOnly />
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Tanggal *</label>
                  <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Stempel</label>
                  <select className="select" value={stempel} onChange={e => setStempel(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {STEMPEL_LIST.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>No. SO</label>
                  <input className="input" placeholder="SO-2026-…" value={noSo}
                    onChange={e => setNoSo(e.target.value)} />
                </div>
              </div>
              <div className="form-grid-px3a" style={{gap:12}}>
                <div className="field" style={{marginBottom:0}}>
                  <label>Status</label>
                  <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
                    {STATUS_SPK.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Tgl. Kirim</label>
                  <input className="input" type="date" value={tglKirim} onChange={e => setTglKirim(e.target.value)} />
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label>Merk</label>
                  <input className="input" placeholder="Merk…" value={merk} onChange={e => setMerk(e.target.value)} />
                </div>
              </div>
            </div>

            {/* ── Approval bar (edit mode only) ──────────────── */}
            {data && <div style={{
              background:'var(--bg-sub)',
              marginLeft:-24, marginRight:-24,
              padding:'10px 24px',
              borderBottom:'1px solid var(--border)',
              display:'flex', alignItems:'center', gap:24, flexWrap:'wrap',
            }}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{
                  width:28, height:28, borderRadius:'50%', flexShrink:0,
                  background:'var(--primary)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:12, color:'#fff', fontWeight:700,
                }}>✓</div>
                <div>
                  <div style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase',
                    letterSpacing:'.06em', color:'var(--text-3)', lineHeight:1}}>Dibuat Oleh</div>
                  <div style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>{dibuatOleh}</div>
                  <div style={{fontSize:11.5, color:'var(--text-3)'}}>{dibuatTgl}</div>
                </div>
              </div>

              {isApproved ? (
                <>
                  <div style={{width:40, height:2, background:'var(--primary)', flexShrink:0}} />
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div style={{
                      width:28, height:28, borderRadius:'50%', flexShrink:0,
                      background:'#22c55e', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:12, color:'#fff', fontWeight:700,
                    }}>✓</div>
                    <div>
                      <div style={{fontSize:10.5, fontWeight:700, textTransform:'uppercase',
                        letterSpacing:'.06em', color:'var(--text-3)', lineHeight:1}}>Disetujui Oleh</div>
                      <div style={{fontSize:13, fontWeight:600, color:'var(--text)'}}>{disetujuiOleh}</div>
                      <div style={{fontSize:11.5, color:'var(--text-3)'}}>{disetujuiTgl}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{width:40, height:2, background:'var(--border)', flexShrink:0}} />
                  <button className="btn btn-primary btn-sm" onClick={handleApprove}
                    style={{whiteSpace:'nowrap'}}>
                    {I.check()} Setujui Surat Perintah Kerja
                  </button>
                </>
              )}
            </div>}

            {/* ── Sticky tab bar ─────────────────────────────── */}
            <div style={{
              position:'sticky', top:0, zIndex:10,
              background:'var(--bg-elev)',
              borderBottom:'1px solid var(--border)',
              marginLeft:-24, marginRight:-24, paddingLeft:24, paddingRight:24,
              paddingTop:14,
            }}>
              <div className="tabs-pills" style={{marginBottom:0, borderBottom:0}}>
                <button className={activeTab === 'bj'    ? 'active' : ''} onClick={() => scrollTo('bj',    bjRef)}>Barang Jadi</button>
                <button className={activeTab === 'bahan' ? 'active' : ''} onClick={() => scrollTo('bahan', bahanRef)}>Bahan</button>
              </div>
            </div>

            {/* ── Content ────────────────────────────────────── */}
            <div style={{paddingTop:20, display:'flex', flexDirection:'column', gap:28}}>

              {/* Section: Barang Jadi */}
              <div ref={bjRef}>
                <p style={SEC_STYLE}>Barang Jadi</p>
                <div className="line-items" style={{overflowX:'auto'}}>
                  <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:900}}>
                    <thead>
                      <tr>
                        <th style={thS('20%')}>Nama Barang</th>
                        <th style={thS('13%')}>Kode Brg.</th>
                        <th style={thS('7%', true)}>Qty SPK</th>
                        <th style={thS('6%', true)}>Sat</th>
                        <th style={thS('12%')}>Kelompok Warna</th>
                        <th style={thS('8%')}>AZ</th>
                        <th style={thS('10%')}>Brand</th>
                        <th style={thS('10%')}>Merk Barang</th>
                        <th style={thS(null)}>Mesin</th>
                        <th style={thS('52px', true)}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bjLines.length === 0 && (
                        <tr><td colSpan={10} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                          Belum ada barang jadi. Klik "+ Tambah Barang" untuk menambahkan.
                        </td></tr>
                      )}
                      {bjLines.map((row, idx) => (
                        <tr key={row.id}>
                          <td style={tdS}>{row.namaBarang || <span style={{color:'var(--text-3)'}}>—</span>}</td>
                          <td style={tdS}><span style={{color:'var(--primary)', fontWeight:500}}>{row.kodeBarang}</span></td>
                          <td style={{...tdS, textAlign:'right'}} className="mono">{row.qtySPK}</td>
                          <td style={{...tdS, textAlign:'center'}}>{row.satuan}</td>
                          <td style={tdS}>{row.kelompokWarna || '—'}</td>
                          <td style={tdS}>{row.az || '—'}</td>
                          <td style={tdS}>{row.brand || '—'}</td>
                          <td style={tdS}>{row.merkBarang || '—'}</td>
                          <td style={tdS}>
                            <div style={{display:'flex', flexWrap:'wrap', gap:3}}>
                              {(row.mesinDipilih || []).slice(0,3).map(m => (
                                <span key={m} style={{
                                  display:'inline-block', padding:'1px 6px', borderRadius:4,
                                  background:'var(--bg-sub)', fontSize:11, fontWeight:500,
                                }}>{m}</span>
                              ))}
                              {(row.mesinDipilih || []).length > 3 && (
                                <span style={{fontSize:11, color:'var(--text-3)'}}>+{row.mesinDipilih.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td style={{...tdS, textAlign:'center'}}>
                            <div style={{display:'flex', gap:3, justifyContent:'center'}}>
                              <button className="btn btn-icon btn-sm" title="Edit"
                                onClick={() => setBjModal({idx, data: row})}>{I.edit()}</button>
                              <button className="btn btn-icon btn-sm" title="Hapus" style={{color:'var(--text-3)'}}
                                onClick={() => setBjLines(ls => ls.filter((_,i) => i !== idx))}>{I.trash()}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="add-row">
                    <button className="btn btn-ghost btn-sm" onClick={() => setBjModal('add')}>
                      {I.plus()} Tambah Barang
                    </button>
                  </div>
                </div>
              </div>

              {/* Section: Bahan */}
              <div ref={bahanRef}>
                <p style={SEC_STYLE}>Bahan</p>
                <div className="line-items" style={{overflowX:'auto'}}>
                  <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:700}}>
                    <thead>
                      <tr>
                        <th style={thS('36px', true)}>No</th>
                        <th style={thS('18%')}>Gd. Bahan</th>
                        <th style={thS('22%')}>Kode Bahan</th>
                        <th style={thS('16%')}>Merk Bahan</th>
                        <th style={thS('10%', true)}>Jumlah SPK</th>
                        <th style={thS('9%', true)}>Satuan</th>
                        <th style={thS('50px', true)}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bahanLines.length === 0 && (
                        <tr><td colSpan={7} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                          Belum ada bahan. Klik "+ Tambah Baris" untuk menambahkan.
                        </td></tr>
                      )}
                      {bahanLines.map((row, idx) => (
                        <tr key={row.id}>
                          <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.gudang} onChange={e => updateBahan(idx, 'gudang', e.target.value)}>
                              <option value="">— Pilih —</option>
                              {GUDANG_LIST.map(g => <option key={g}>{g}</option>)}
                            </select>
                          </td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.kodeBahan} onChange={e => updateBahan(idx, 'kodeBahan', e.target.value)}>
                              <option value="">— Pilih —</option>
                              {MANUFAKTUR_BARANG.map(b => <option key={b.code} value={b.code}>{b.code}</option>)}
                            </select>
                          </td>
                          <td style={tdS}>
                            <input className="input" style={{width:'100%', fontSize:12, padding:'3px 6px', background:'var(--bg-sub)'}}
                              value={row.merkBahan} readOnly placeholder="auto" />
                          </td>
                          <td style={tdS}>
                            <input className="input" type="number" min="0" step="0.01"
                              style={{width:'100%', fontSize:12, padding:'3px 6px', textAlign:'right'}}
                              placeholder="0.00" value={row.jumlah}
                              onChange={e => updateBahan(idx, 'jumlah', e.target.value)} />
                          </td>
                          <td style={tdS}>
                            <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                              value={row.satuan} onChange={e => updateBahan(idx, 'satuan', e.target.value)}>
                              {SATUAN_SPK.map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{...tdS, textAlign:'center'}}>
                            <button className="btn btn-icon btn-sm" title="Hapus" style={{color:'var(--text-3)'}}
                              onClick={() => setBahanLines(ls => ls.filter((_,i) => i !== idx))}>{I.trash()}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="add-row">
                    <button className="btn btn-ghost btn-sm" onClick={addBahanRow}>
                      {I.plus()} Tambah Baris
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" onClick={onSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {bjModal && (
        <BarangJadiEntryModal
          data={bjModal === 'add' ? null : bjModal.data}
          onClose={() => setBjModal(null)}
          onSave={(entry) => {
            if (bjModal === 'add') setBjLines(ls => [...ls, {...entry, id: Date.now()}]);
            else setBjLines(ls => ls.map((l, i) => i === bjModal.idx ? {...entry, id: l.id} : l));
            setBjModal(null);
          }}
        />
      )}
    </>
  );
}

// ─── SPK List ────────────────────────────────────────────────────────────────

function SpkList({ onAdd, onEdit, onNavigate }) {
  const [tglDari, setTglDari] = React.useState('');
  const [tglSmp, setTglSmp]   = React.useState('');
  const [statusF, setStatusF] = React.useState('');
  const [q, setQ]             = React.useState('');
  const [page, setPage]       = React.useState(1);
  const perPage = 10;

  const filtered = SPK_LIST.filter(r => {
    if (statusF && r.status !== statusF) return false;
    if (q && !r.no.toLowerCase().includes(q.toLowerCase()) &&
             !r.produk.toLowerCase().includes(q.toLowerCase()) &&
             !(r.stempel || '').toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Surat Perintah Kerja</h1>
          <div className="sub">Daftar work order produksi</div>
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
            <label>Status</label>
            <select className="select" value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="">Semua</option>
              {STATUS_SPK.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={() => setPage(1)}>{I.search(13)} Cari</button>
            <button className="btn" onClick={() => { setTglDari(''); setTglSmp(''); setStatusF(''); setQ(''); setPage(1); }}>Reset</button>
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
            <button className="btn btn-sm btn-icon" title="Print">{I.print()}</button>
            <button className="btn btn-sm btn-icon btn-danger" title="Hapus">{I.trash()}</button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:32}}><input type="checkbox" className="cb" /></th>
                <th>No SPK</th>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Gudang</th>
                <th>Stempel</th>
                <th>Status</th>
                <th className="center" style={{width:60}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', padding:32, color:'var(--text-3)'}}>Tidak ada data</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.no}>
                  <td><input type="checkbox" className="cb" /></td>
                  <td><span className="cell-link">{r.no}</span></td>
                  <td>{r.tgl}</td>
                  <td>{r.produk}</td>
                  <td>{r.gudang}</td>
                  <td>
                    {r.stempel
                      ? <span style={{display:'inline-block', padding:'2px 8px', borderRadius:999,
                          fontSize:11.5, fontWeight:600, background:'var(--primary)', color:'#fff'}}>
                          {r.stempel}
                        </span>
                      : <span style={{color:'var(--text-3)'}}>—</span>}
                  </td>
                  <td><span className={`pill ${STATUS_CLASS[r.status] || 'draft'}`}>{r.status}</span></td>
                  <td className="center">
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={() => onEdit(r)}>{I.edit()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>Menampilkan {rows.length} dari {filtered.length} data</span>
          <div className="pager-pages">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{I.chev(12,'left')}</button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{I.chev(12,'right')}</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared Picker Shell ─────────────────────────────────────────────────────

function PickerShell({ title, zIndex, width, onClose, children }) {
  return (
    <div className="modal-backdrop" style={{zIndex: zIndex || 200}}>
      <div className="modal" style={{maxWidth: width || 960, maxHeight:'72vh'}} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PickerTable({ columns, rows, onClose, emptyMsg }) {
  return (
    <div style={{overflowY:'auto', maxHeight:'calc(72vh - 180px)', padding:'0 32px'}}>
      <table className="data" style={{minWidth:'unset'}}>
        <thead>
          <tr>{columns.map(c => <th key={c.key} style={c.style}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{textAlign:'center', padding:24, color:'var(--text-3)'}}>
              {emptyMsg || 'Tidak ada hasil'}
            </td></tr>
          )}
          {rows}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pilih Barang Modal ───────────────────────────────────────────────────────

function PilihBarangModal({ onPick, onClose, zIndex }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const filtered = MANUFAKTUR_BARANG.filter(b => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return b.code.toLowerCase().includes(ql) || b.nama.toLowerCase().includes(ql);
  });
  return (
    <PickerShell title="Pilih Barang" zIndex={zIndex} onClose={onClose}>
      <div style={{padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
        <div className="input-w-icon">{I.search(14)}
          <input ref={inputRef} className="input" placeholder="Cari Kode atau Nama Barang…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <PickerTable
        columns={[{key:'k',label:'KODE',style:{width:'30%'}},{key:'n',label:'NAMA BARANG'}]}
        emptyMsg={`Tidak ada barang untuk "${q}"`}
        rows={filtered.map(b => (
          <tr key={b.code} style={{cursor:'pointer'}} onClick={() => onPick(b)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{b.code}</td>
            <td>{b.nama}</td>
          </tr>
        ))}
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </PickerShell>
  );
}

// ─── SPK Picker Modal ─────────────────────────────────────────────────────────

function SpkPickerModal({ onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const filtered = SPK_LIST.filter(s => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return s.no.toLowerCase().includes(ql) || s.produk.toLowerCase().includes(ql);
  });
  return (
    <PickerShell title="Pilih SPK" zIndex={300} width={800} onClose={onClose}>
      <div style={{padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
        <div className="input-w-icon">{I.search(14)}
          <input ref={inputRef} className="input" placeholder="Cari No. SPK atau Produk…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <PickerTable
        columns={[
          {key:'no', label:'NO. SPK',  style:{width:'22%'}},
          {key:'pr', label:'PRODUK'},
          {key:'gd', label:'GUDANG',   style:{width:'20%'}},
          {key:'st', label:'STATUS',   style:{width:'14%',textAlign:'center'}},
        ]}
        rows={filtered.map(s => (
          <tr key={s.no} style={{cursor:'pointer'}} onClick={() => onPick(s)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{s.no}</td>
            <td>{s.produk}</td>
            <td>{s.gudang}</td>
            <td style={{textAlign:'center'}}>
              <span className={`pill ${STATUS_CLASS[s.status] || 'draft'}`}>{s.status}</span>
            </td>
          </tr>
        ))}
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </PickerShell>
  );
}

// ─── COIL Picker Modal ────────────────────────────────────────────────────────

function CoilPickerModal({ onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const filtered = COIL_LIST.filter(c => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return c.no.toLowerCase().includes(ql) || c.barang.toLowerCase().includes(ql);
  });
  return (
    <PickerShell title="Pilih No. Coil" zIndex={300} width={800} onClose={onClose}>
      <div style={{padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
        <div className="input-w-icon">{I.search(14)}
          <input ref={inputRef} className="input" placeholder="Cari No. Coil atau nama barang…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <PickerTable
        columns={[
          {key:'no', label:'NO. COIL',  style:{width:'20%'}},
          {key:'br', label:'BARANG'},
          {key:'gd', label:'GUDANG',    style:{width:'20%'}},
          {key:'si', label:'SISA (MTR)',style:{width:'14%', textAlign:'right'}},
        ]}
        rows={filtered.map(c => (
          <tr key={c.no} style={{cursor:'pointer'}} onClick={() => onPick(c)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{c.no}</td>
            <td>{c.barang}</td>
            <td>{c.gudang}</td>
            <td style={{textAlign:'right'}}>{fmtNum(c.sisa)}</td>
          </tr>
        ))}
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </PickerShell>
  );
}

// ─── Barang Jadi Picker Modal ─────────────────────────────────────────────────

function BarangJadiPickerModal({ onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const filtered = BARANG_JADI_LIST.filter(b => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return b.kode.toLowerCase().includes(ql) || b.nama.toLowerCase().includes(ql);
  });
  return (
    <PickerShell title="Pilih Barang Jadi" zIndex={300} onClose={onClose}>
      <div style={{padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
        <div className="input-w-icon">{I.search(14)}
          <input ref={inputRef} className="input" placeholder="Cari Kode atau Nama Barang Jadi…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <PickerTable
        columns={[
          {key:'kd', label:'KODE',       style:{width:'18%'}},
          {key:'nm', label:'NAMA BARANG'},
          {key:'pu', label:'KODE PU',    style:{width:'14%'}},
          {key:'co', label:'NO. COIL',   style:{width:'16%'}},
          {key:'st', label:'SATUAN',     style:{width:'9%', textAlign:'center'}},
        ]}
        rows={filtered.map(b => (
          <tr key={b.kode} style={{cursor:'pointer'}} onClick={() => onPick(b)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{b.kode}</td>
            <td>{b.nama}</td>
            <td>{b.kodePU}</td>
            <td>{b.noCoil}</td>
            <td style={{textAlign:'center'}}>{b.satuan}</td>
          </tr>
        ))}
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </PickerShell>
  );
}

// ─── SPK Entry Modal ──────────────────────────────────────────────────────────

function SpkEntryModal({ data, onClose, onSave }) {
  const [noSpk,      setNoSpk]      = React.useState(data?.noSpk      || '');
  const [sisaStok,   setSisaStok]   = React.useState(data?.sisaStok   || '0.00');
  const [kodeBahan,  setKodeBahan]  = React.useState(data?.kodeBahan  || '');
  const [merkSpk,    setMerkSpk]    = React.useState(data?.merkSpk    || '');
  const [gudang,     setGudang]     = React.useState(data?.gudang     || '');
  const [noCoil,     setNoCoil]     = React.useState(data?.noCoil     || '');
  const [pembelian,  setPembelian]  = React.useState(data?.pembelian  || '');
  const [tgl,        setTgl]        = React.useState(data?.tgl        || '2026-06-24');
  const [merek,      setMerek]      = React.useState(data?.merek      || '');
  const [jumlah,     setJumlah]     = React.useState(data?.jumlah     || '');
  const [satuanJ,    setSatuanJ]    = React.useState(data?.satuanJ    || 'MTR');
  const [kondisi,    setKondisi]    = React.useState(data?.kondisi    || 'Normal');
  const [lapisanPu,  setLapisanPu]  = React.useState(data?.lapisanPu || 'Atas');

  const [showSpkPicker,  setShowSpkPicker]  = React.useState(false);
  const [showCoilPicker, setShowCoilPicker] = React.useState(false);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !showSpkPicker && !showCoilPicker) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [showSpkPicker, showCoilPicker, onClose]);

  const onSpkPick = (spk) => {
    setNoSpk(spk.no);
    setKodeBahan(spk.kodeBahan || '');
    setMerkSpk(spk.merkSpk || spk.produk || '');
    setGudang(spk.gudang || '');
    setSisaStok(String(spk.qty || '0.00'));
    setShowSpkPicker(false);
  };

  const onCoilPick = (coil) => {
    setNoCoil(coil.no);
    if (!sisaStok || sisaStok === '0.00') setSisaStok(String(coil.sisa));
    setShowCoilPicker(false);
  };

  const handleSave = () => {
    onSave({ noSpk, sisaStok, kodeBahan, merkSpk, gudang, noCoil, pembelian, tgl, merek, jumlah, satuanJ, kondisi, lapisanPu });
  };

  const tdStyle  = {padding:'6px 8px', verticalAlign:'middle'};
  const lbStyle  = {fontSize:11.5, color:'var(--text-3)', fontWeight:500, marginBottom:3, display:'block'};

  return (
    <>
      <div className="modal-backdrop" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:700}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit SPK' : 'Tambah SPK'}</h2>
              <div className="sub">Isi detail referensi SPK untuk dokumen ini.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="modal-body">
            <div style={{display:'flex', flexDirection:'column', gap:14}}>

              {/* Row 1: No. SPK + Sisa Stock */}
              <div style={{display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap'}}>
                <div className="field" style={{flex:1}}>
                  <label>No. SPK *</label>
                  <div style={{display:'flex', gap:4}}>
                    <input className="input" style={{flex:1}} placeholder="— Pilih SPK —"
                      value={noSpk} readOnly />
                    <button className="btn btn-icon" title="Cari SPK"
                      onClick={() => setShowSpkPicker(true)}>{I.search(14)}</button>
                  </div>
                </div>
                <div className="field" style={{width:190}}>
                  <label>Sisa Stock sebelumnya</label>
                  <input className="input" value={sisaStok} readOnly
                    style={{background:'var(--bg-sub)', textAlign:'right'}} />
                </div>
              </div>

              {/* Row 2: Kode Bahan + Merk SPK + Gudang */}
              <div className="form-row-3">
                <div className="field">
                  <label>Kode Bahan</label>
                  <input className="input" placeholder="Kode bahan…" value={kodeBahan} onChange={e => setKodeBahan(e.target.value)} />
                </div>
                <div className="field">
                  <label>Merk (SPK)</label>
                  <input className="input" placeholder="Merk SPK…" value={merkSpk} onChange={e => setMerkSpk(e.target.value)} />
                </div>
                <div className="field">
                  <label>Gudang</label>
                  <select className="select" value={gudang} onChange={e => setGudang(e.target.value)}>
                    <option value="">— Pilih —</option>
                    {GUDANG_LIST.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: No. COIL + Pembelian + Tgl */}
              <div className="form-row-3">
                <div className="field">
                  <label>No. COIL</label>
                  <div style={{display:'flex', gap:4}}>
                    <input className="input" style={{flex:1}} placeholder="— Pilih Coil —"
                      value={noCoil} readOnly />
                    <button className="btn btn-icon" title="Cari No. Coil"
                      onClick={() => setShowCoilPicker(true)}>{I.search(14)}</button>
                  </div>
                </div>
                <div className="field">
                  <label>Pembelian</label>
                  <input className="input" placeholder="No. Pembelian…" value={pembelian} onChange={e => setPembelian(e.target.value)} />
                </div>
                <div className="field">
                  <label>Tgl</label>
                  <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
                </div>
              </div>

              {/* Row 4: Merek */}
              <div className="field" style={{maxWidth:'50%'}}>
                <label>Merk</label>
                <input className="input" placeholder="Merk…" value={merek} onChange={e => setMerek(e.target.value)} />
              </div>

              {/* Row 5: Jumlah + Satuan  +  Lapisan PU (right) */}
              <div style={{display:'flex', alignItems:'flex-end', gap:16, flexWrap:'wrap'}}>
                <div className="field" style={{width:160}}>
                  <label>Jumlah</label>
                  <div style={{display:'flex', gap:4}}>
                    <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                      style={{flex:1}} value={jumlah} onChange={e => setJumlah(e.target.value)} />
                    <select className="select" style={{width:72}} value={satuanJ} onChange={e => setSatuanJ(e.target.value)}>
                      <option>MTR</option>
                      <option>PCS</option>
                      <option>CM</option>
                    </select>
                  </div>
                </div>
                <div className="field" style={{marginLeft:'auto'}}>
                  <label>Lapisan PU</label>
                  <div style={{display:'flex', gap:8, height:32, alignItems:'center'}}>
                    {['Atas','Bawah'].map(v => (
                      <label key={v} style={{
                        display:'inline-flex', alignItems:'center', gap:6,
                        cursor:'pointer', fontWeight:500, fontSize:13,
                        padding:'4px 12px', borderRadius:6,
                        background: lapisanPu === v ? 'var(--primary)' : 'var(--bg-sub)',
                        color: lapisanPu === v ? '#fff' : 'var(--text)',
                        transition:'background .12s, color .12s',
                      }}>
                        <input type="radio" name="lpSPK" value={v}
                          checked={lapisanPu === v} onChange={() => setLapisanPu(v)}
                          style={{display:'none'}} />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 6: Kondisi COIL */}
              <div className="field">
                <label>Kondisi COIL</label>
                <select className="select" value={kondisi} onChange={e => setKondisi(e.target.value)}>
                  <option>Normal</option>
                  <option>Termasuk Tong Coil</option>
                  <option>Sisa Slitting PU</option>
                  <option>Tong Coil &amp; Sisa Slitting PU</option>
                </select>
              </div>

            </div>
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" onClick={handleSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {showSpkPicker  && <SpkPickerModal  onPick={onSpkPick}  onClose={() => setShowSpkPicker(false)}  />}
      {showCoilPicker && <CoilPickerModal onPick={onCoilPick} onClose={() => setShowCoilPicker(false)} />}
    </>
  );
}

// ─── Hasil Produksi Dialog ────────────────────────────────────────────────────

const SEC_STYLE = {
  fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em',
  color:'var(--text-3)', margin:'0 0 14px',
  paddingBottom:8, borderBottom:'1px solid var(--border)',
};

function HasilProduksiDialog({ data, onClose, onSave }) {
  const [spkLines, setSpkLines]   = React.useState([]);
  const [bjLines, setBjLines]     = React.useState([]);
  const [spkModal, setSpkModal]   = React.useState(null);  // null | 'add' | {idx, data}
  const [bjPicker, setBjPicker]   = React.useState(null);  // null | rowIdx
  const [activeTab, setActiveTab] = React.useState('spk');

  const modalBodyRef = React.useRef(null);
  const spkRef       = React.useRef(null);
  const bjRef        = React.useRef(null);

  const scrollTo = (id, ref) => {
    setActiveTab(id);
    if (!ref.current || !modalBodyRef.current) return;
    const body    = modalBodyRef.current;
    const bodyTop = body.getBoundingClientRect().top;
    const refTop  = ref.current.getBoundingClientRect().top;
    body.scrollBy({ top: refTop - bodyTop - 52, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !spkModal && bjPicker === null) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [spkModal, bjPicker, onClose]);

  const addBjRow = () => setBjLines(ls => [...ls, {
    id: Date.now(), kodeBarang:'', namaBarang:'', kodePU:'', noCoil:'',
    jumlah:'', satuan:'mtr', berat:'', packing:'Tidak', shift:'1',
  }]);

  const updateBjRow = (idx, field, val) =>
    setBjLines(ls => ls.map((r, i) => i === idx ? {...r, [field]: val} : r));

  const tdS = { padding:'5px 6px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };

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

            {/* ── Sticky tab bar ─────────────────────────────── */}
            <div style={{
              position:'sticky', top:0, zIndex:10,
              background:'var(--bg-elev)',
              borderBottom:'1px solid var(--border)',
              marginLeft:-24, marginRight:-24, paddingLeft:24, paddingRight:24,
              paddingTop:14,
            }}>
              <div className="tabs-pills" style={{marginBottom:0, borderBottom:0}}>
                <button className={activeTab === 'spk' ? 'active' : ''} onClick={() => scrollTo('spk', spkRef)}>
                  Daftar SPK
                </button>
                <button className={activeTab === 'bj' ? 'active' : ''} onClick={() => scrollTo('bj', bjRef)}>
                  Barang Jadi
                </button>
              </div>
            </div>

            {/* ── Content ────────────────────────────────────── */}
            <div style={{paddingTop:20}}>

              <div style={{display:'flex', flexDirection:'column', gap:28}}>

                {/* Section: Daftar SPK */}
                <div ref={spkRef}>
                  <p style={SEC_STYLE}>Daftar SPK</p>
                  <div className="line-items">
                    <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
                      <thead>
                        <tr>
                          {[
                            ['No. SPK',    '18%'], ['Kode Bahan','13%'], ['Merk SPK','14%'],
                            ['Gudang','15%'], ['No. Coil','14%'], ['Kondisi', null],
                            ['Jumlah','9%'], ['', '60px'],
                          ].map(([label, w]) => (
                            <th key={label||'aksi'} style={{
                              padding:'8px 8px', background:'var(--primary)', color:'#fff',
                              fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
                              width: w || undefined,
                            }}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {spkLines.length === 0 && (
                          <tr><td colSpan={8} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                            Belum ada SPK. Klik "+ Tambah SPK" untuk menambahkan.
                          </td></tr>
                        )}
                        {spkLines.map((row, idx) => (
                          <tr key={row.id}>
                            <td style={tdS}><span style={{color:'var(--primary)',fontWeight:500}}>{row.noSpk}</span></td>
                            <td style={tdS}>{row.kodeBahan}</td>
                            <td style={tdS}>{row.merkSpk}</td>
                            <td style={tdS}>{row.gudang}</td>
                            <td style={tdS}><span className="mono">{row.noCoil}</span></td>
                            <td style={tdS}><span style={{fontSize:11.5}}>{row.kondisi}</span></td>
                            <td style={{...tdS, textAlign:'right'}} className="mono">{row.jumlah} {row.satuanJ}</td>
                            <td style={{...tdS, textAlign:'center'}}>
                              <div style={{display:'flex', gap:4, justifyContent:'center'}}>
                                <button className="btn btn-icon btn-sm" title="Edit"
                                  onClick={() => setSpkModal({idx, data: row})}>{I.edit()}</button>
                                <button className="btn btn-icon btn-sm" title="Hapus" style={{color:'var(--text-3)'}}
                                  onClick={() => setSpkLines(ls => ls.filter((_,i) => i !== idx))}>{I.trash()}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="add-row">
                      <button className="btn btn-ghost btn-sm" onClick={() => setSpkModal('add')}>
                        {I.plus()} Tambah SPK
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Barang Jadi */}
                <div ref={bjRef}>
                  <p style={SEC_STYLE}>Barang Jadi</p>
                  <div className="line-items" style={{overflowX:'auto'}}>
                    <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:1000}}>
                      <thead>
                        <tr>
                          {[
                            ['No','36px',true], ['Kode Brg. Jadi','14%',false], ['Kode Brg. P.U.','11%',false],
                            ['No. COIL','11%',false], ['Jumlah','8%',true], ['Satuan','7%',true],
                            ['Berat (Kg)','8%',true], ['Packing','8%',true], ['Shift','6%',true], ['','50px',true],
                          ].map(([label, w, center]) => (
                            <th key={label||'aksi'} style={{
                              padding:'8px 8px', background:'var(--primary)', color:'#fff',
                              fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
                              textAlign: center ? 'center' : 'left', width: w || undefined,
                            }}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bjLines.length === 0 && (
                          <tr><td colSpan={10} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                            Belum ada barang jadi. Klik "+ Tambah Baris" untuk menambahkan.
                          </td></tr>
                        )}
                        {bjLines.map((row, idx) => (
                          <tr key={row.id}>
                            <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                            <td style={tdS}>
                              <div style={{display:'flex', gap:4}}>
                                <input className="input" style={{flex:1, fontSize:12, padding:'3px 6px'}}
                                  placeholder="Kode…" value={row.kodeBarang}
                                  onChange={e => updateBjRow(idx, 'kodeBarang', e.target.value)} />
                                <button className="btn btn-icon btn-sm" title="Cari Barang Jadi"
                                  style={{flexShrink:0}} onClick={() => setBjPicker(idx)}>{I.search(13)}</button>
                              </div>
                            </td>
                            <td style={tdS}>
                              <input className="input" style={{width:'100%', fontSize:12, padding:'3px 6px', background:'var(--bg-sub)'}}
                                value={row.kodePU} readOnly placeholder="auto" />
                            </td>
                            <td style={tdS}>
                              <input className="input mono" style={{width:'100%', fontSize:12, padding:'3px 6px', background:'var(--bg-sub)'}}
                                value={row.noCoil} readOnly placeholder="auto" />
                            </td>
                            <td style={tdS}>
                              <input className="input" type="number" min="0" step="0.01"
                                style={{width:'100%', fontSize:12, padding:'3px 6px', textAlign:'right'}}
                                placeholder="0.00" value={row.jumlah}
                                onChange={e => updateBjRow(idx, 'jumlah', e.target.value)} />
                            </td>
                            <td style={tdS}>
                              <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                                value={row.satuan} onChange={e => updateBjRow(idx, 'satuan', e.target.value)}>
                                <option>mtr</option><option>pcs</option><option>CM</option>
                              </select>
                            </td>
                            <td style={tdS}>
                              <input className="input" type="number" min="0" step="0.01"
                                style={{width:'100%', fontSize:12, padding:'3px 6px', textAlign:'right'}}
                                placeholder="0.00" value={row.berat}
                                onChange={e => updateBjRow(idx, 'berat', e.target.value)} />
                            </td>
                            <td style={tdS}>
                              <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                                value={row.packing} onChange={e => updateBjRow(idx, 'packing', e.target.value)}>
                                <option>Ya</option><option>Tidak</option>
                              </select>
                            </td>
                            <td style={tdS}>
                              <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                                value={row.shift} onChange={e => updateBjRow(idx, 'shift', e.target.value)}>
                                <option>1</option><option>2</option><option>3</option>
                              </select>
                            </td>
                            <td style={{...tdS, textAlign:'center'}}>
                              <button className="btn btn-icon btn-sm" title="Hapus" style={{color:'var(--text-3)'}}
                                onClick={() => setBjLines(ls => ls.filter((_,i) => i !== idx))}>{I.trash()}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="add-row">
                      <button className="btn btn-ghost btn-sm" onClick={addBjRow}>
                        {I.plus()} Tambah Baris
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" onClick={onSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {spkModal && (
        <SpkEntryModal
          data={spkModal === 'add' ? null : spkModal.data}
          onClose={() => setSpkModal(null)}
          onSave={(entry) => {
            if (spkModal === 'add') setSpkLines(ls => [...ls, {...entry, id: Date.now()}]);
            else setSpkLines(ls => ls.map((l, i) => i === spkModal.idx ? {...entry, id: l.id} : l));
            setSpkModal(null);
          }}
        />
      )}
      {bjPicker !== null && (
        <BarangJadiPickerModal
          onPick={(bj) => {
            setBjLines(ls => ls.map((r, i) => i === bjPicker
              ? {...r, kodeBarang: bj.kode, namaBarang: bj.nama, kodePU: bj.kodePU, noCoil: bj.noCoil, satuan: bj.satuan}
              : r));
            setBjPicker(null);
          }}
          onClose={() => setBjPicker(null)}
        />
      )}
    </>
  );
}

// ─── Hasil Produksi List ──────────────────────────────────────────────────────

function HasilProduksiList({ onAdd, onEdit }) {
  const [tglDari, setTglDari] = React.useState('');
  const [tglSmp, setTglSmp]   = React.useState('');
  const [spkF, setSpkF]       = React.useState('');
  const [page, setPage]       = React.useState(1);
  const perPage = 10;

  const filtered = HP_LIST.filter(r => {
    if (spkF && !r.noSpk.toLowerCase().includes(spkF.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

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
            <button className="btn btn-sm btn-icon" title="Print">{I.print()}</button>
            <button className="btn btn-sm btn-icon btn-danger" title="Hapus">{I.trash()}</button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:32}}><input type="checkbox" className="cb" /></th>
                <th>No. HP</th>
                <th>No. SPK</th>
                <th>Tanggal</th>
                <th>Gudang</th>
                <th className="num">Jml SPK</th>
                <th className="num">Jml Brg. Jadi</th>
                <th className="center" style={{width:60}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} style={{textAlign:'center', padding:32, color:'var(--text-3)'}}>Tidak ada data</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.no}>
                  <td><input type="checkbox" className="cb" /></td>
                  <td><span className="cell-link">{r.no}</span></td>
                  <td className="muted">{r.noSpk}</td>
                  <td>{r.tgl}</td>
                  <td>{r.gudang}</td>
                  <td className="num mono">1</td>
                  <td className="num mono">{r.totalBarang}</td>
                  <td className="center">
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={() => onEdit(r)}>{I.edit()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>Menampilkan {rows.length} dari {filtered.length} data</span>
          <div className="pager-pages">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{I.chev(12,'left')}</button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{I.chev(12,'right')}</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Barang Pakai Entry Modal ─────────────────────────────────────────────────

function BarangPakaiEntryModal({ data, onClose, onSave }) {
  const [kodeBarang,     setKodeBarang]     = React.useState(data?.kodeBarang     || '');
  const [namaBarang,     setNamaBarang]     = React.useState(data?.namaBarang     || '');
  const [jumlah,         setJumlah]         = React.useState(data?.jumlah         || '');
  const [satuan,         setSatuan]         = React.useState(data?.satuan         || 'MTR');
  const [sisaSebelumnya, setSisaSebelumnya] = React.useState(data?.sisaSebelumnya || '');
  const [noSpk,          setNoSpk]          = React.useState(data?.noSpk          || '');
  const [showBarangPicker, setShowBarangPicker] = React.useState(false);
  const [showSpkPicker,    setShowSpkPicker]    = React.useState(false);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !showBarangPicker && !showSpkPicker) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [showBarangPicker, showSpkPicker, onClose]);

  const onBarangPick = (b) => { setKodeBarang(b.code); setNamaBarang(b.nama); setShowBarangPicker(false); };
  const onSpkPick    = (s) => { setNoSpk(s.no); setShowSpkPicker(false); };

  return (
    <>
      <div className="modal-backdrop" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:640}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit Barang' : 'Tambah Barang'}</h2>
              <div className="sub">Pilih barang dan isi detail pemakaian.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>
          <div className="modal-body">
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div style={{display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap'}}>
                <div className="field" style={{width:220}}>
                  <label>Kode Barang *</label>
                  <div style={{display:'flex', gap:4}}>
                    <input className="input" style={{flex:1}} placeholder="— Pilih —" value={kodeBarang} readOnly />
                    <button className="btn btn-icon" title="Cari Barang" onClick={() => setShowBarangPicker(true)}>{I.search(14)}</button>
                  </div>
                </div>
                <div className="field" style={{flex:1}}>
                  <label>Nama Barang</label>
                  <input className="input" value={namaBarang} readOnly style={{background:'var(--bg-sub)'}} placeholder="auto" />
                </div>
              </div>
              <div className="form-grid-px3b" style={{gap:10}}>
                <div className="field">
                  <label>Jumlah *</label>
                  <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                    value={jumlah} onChange={e => setJumlah(e.target.value)} />
                </div>
                <div className="field">
                  <label>Satuan</label>
                  <select className="select" value={satuan} onChange={e => setSatuan(e.target.value)}>
                    {['MTR','PCS','LBR','KG'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Sisa Sebelumnya</label>
                  <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                    value={sisaSebelumnya} onChange={e => setSisaSebelumnya(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>No. SPK (Referensi)</label>
                <div style={{display:'flex', gap:4}}>
                  <input className="input" style={{flex:1}} placeholder="— Pilih SPK —" value={noSpk} readOnly />
                  <button className="btn btn-icon" title="Cari SPK" onClick={() => setShowSpkPicker(true)}>{I.search(14)}</button>
                  {noSpk && <button className="btn btn-icon" title="Hapus" onClick={() => setNoSpk('')}>{I.x(14)}</button>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary"
                onClick={() => onSave({ kodeBarang, namaBarang, jumlah, satuan, sisaSebelumnya, noSpk })}>
                {I.check()} Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
      {showBarangPicker && (
        <PilihBarangModal zIndex={300} onPick={onBarangPick} onClose={() => setShowBarangPicker(false)} />
      )}
      {showSpkPicker && (
        <SpkPickerModal onPick={onSpkPick} onClose={() => setShowSpkPicker(false)} />
      )}
    </>
  );
}

// ─── Pemakaian / Retur Barang Dialog ─────────────────────────────────────────

function PemakaianBarangDialog({ type, data, onClose, onSave }) {
  const prefix  = type === 'bpbl' ? 'BPBL' : 'RPBL';
  const srcList = type === 'bpbl' ? BPBL_LIST : RPBL_LIST;
  const nextNo  = `${prefix}-2026-${String(srcList.length + 1).padStart(4,'0')}`;
  const title   = type === 'bpbl' ? 'Bukti Pemakaian Barang Lain' : 'Retur Pakai Barang Lain';

  const [tgl,         setTgl]         = React.useState(data?.tgl         || '2026-06-24');
  const [gudang,      setGudang]      = React.useState(data?.gudang      || '');
  const [bagian,      setBagian]      = React.useState(data?.bagian      || '');
  const [noOpb,       setNoOpb]       = React.useState(data?.noOpb       || '');
  const [catatan,     setCatatan]     = React.useState(data?.catatan     || '');
  const [barangLines, setBarangLines] = React.useState([]);
  const [barangModal, setBarangModal] = React.useState(null);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !barangModal) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [barangModal, onClose]);

  const tdS = { padding:'5px 6px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };
  const thS = (w, center) => ({
    padding:'8px 8px', background:'var(--primary)', color:'#fff',
    fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
    textAlign: center ? 'center' : 'left', width: w || undefined,
  });

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal" style={{maxWidth:1100}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? `Edit ${title}` : `Buat ${title}`}</h2>
              <div className="sub">Pastikan semua kolom bertanda (*) terisi.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="modal-body" style={{paddingTop:0}}>
            {/* Header info bar */}
            <div style={{background:'var(--bg-sub)', padding:'14px 24px', borderBottom:'1px solid var(--border)', marginBottom:24}}>
              <div className="form-grid-px4b" style={{gap:12, marginBottom:12}}>
                <div className="field">
                  <label>No. {prefix}</label>
                  <input className="input" value={data?.no || nextNo} readOnly
                    style={{background:'var(--bg)', fontWeight:600}} />
                </div>
                <div className="field">
                  <label>Tanggal *</label>
                  <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
                </div>
                <div className="field">
                  <label>Gudang *</label>
                  <select className="select" value={gudang} onChange={e => setGudang(e.target.value)}>
                    <option value="">— Pilih Gudang —</option>
                    {GUDANG_DATA.map(g => (
                      <option key={g.kode} value={g.kode}>{g.kode} — {g.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Bagian</label>
                  <input className="input" placeholder="e.g. Produksi" value={bagian}
                    onChange={e => setBagian(e.target.value)} />
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns: type === 'bpbl' ? '1fr 3fr' : '1fr', gap:12}}>
                {type === 'bpbl' && (
                  <div className="field">
                    <label>No. OPB</label>
                    <input className="input" placeholder="No. OPB" value={noOpb}
                      onChange={e => setNoOpb(e.target.value)} />
                  </div>
                )}
                <div className="field">
                  <label>Catatan</label>
                  <input className="input" placeholder="Catatan (opsional)" value={catatan}
                    onChange={e => setCatatan(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Detail Barang */}
            <div style={{padding:'0 24px 24px'}}>
              <p style={SEC_STYLE}>Detail Barang</p>
              <div className="line-items" style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:800}}>
                  <thead>
                    <tr>
                      <th style={thS('36px', true)}>No</th>
                      <th style={thS('18%')}>Kode Barang</th>
                      <th style={thS()}>Nama Barang</th>
                      <th style={thS('90px', true)}>Jumlah</th>
                      <th style={thS('70px', true)}>Satuan</th>
                      <th style={thS('120px', true)}>Sisa Sebelumnya</th>
                      <th style={thS('18%')}>No. SPK</th>
                      <th style={thS('52px', true)}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangLines.length === 0 && (
                      <tr><td colSpan={8} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                        Belum ada barang. Klik "+ Tambah Barang" untuk menambahkan.
                      </td></tr>
                    )}
                    {barangLines.map((line, idx) => (
                      <tr key={line.id}>
                        <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                        <td style={tdS}><span style={{color:'var(--primary)', fontWeight:500}}>{line.kodeBarang || '—'}</span></td>
                        <td style={tdS}>{line.namaBarang || '—'}</td>
                        <td style={{...tdS, textAlign:'right'}} className="mono">{line.jumlah || '—'}</td>
                        <td style={{...tdS, textAlign:'center'}}>{line.satuan}</td>
                        <td style={{...tdS, textAlign:'right'}} className="mono">{line.sisaSebelumnya || '—'}</td>
                        <td style={{...tdS, color:'var(--primary)', fontWeight:500}}>{line.noSpk || '—'}</td>
                        <td style={{...tdS, textAlign:'center'}}>
                          <div style={{display:'flex', gap:3, justifyContent:'center'}}>
                            <button className="btn btn-icon btn-sm" title="Edit"
                              onClick={() => setBarangModal({idx, data:line})}>{I.edit()}</button>
                            <button className="btn btn-icon btn-sm" title="Hapus" style={{color:'var(--text-3)'}}
                              onClick={() => setBarangLines(ls => ls.filter((_, i) => i !== idx))}>{I.trash()}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="add-row">
                  <button className="btn btn-ghost btn-sm" onClick={() => setBarangModal('add')}>
                    {I.plus()} Tambah Barang
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" onClick={onSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {barangModal && (
        <BarangPakaiEntryModal
          data={barangModal === 'add' ? null : barangModal.data}
          onClose={() => setBarangModal(null)}
          onSave={(entry) => {
            if (barangModal === 'add') {
              setBarangLines(ls => [...ls, {...entry, id:Date.now()}]);
            } else {
              setBarangLines(ls => ls.map((l, i) => i === barangModal.idx ? {...entry, id:l.id} : l));
            }
            setBarangModal(null);
          }}
        />
      )}
    </>
  );
}

// ─── Pemakaian / Retur Barang List ────────────────────────────────────────────

function PemakaianBarangList({ type, onAdd, onEdit }) {
  const prefix  = type === 'bpbl' ? 'BPBL' : 'RPBL';
  const title   = type === 'bpbl' ? 'Bukti Pemakaian Barang Lain' : 'Retur Pakai Barang Lain';
  const srcList = type === 'bpbl' ? BPBL_LIST : RPBL_LIST;

  const [tglDari,  setTglDari]  = React.useState('');
  const [tglSmpai, setTglSmpai] = React.useState('');
  const [qBagian,  setQBagian]  = React.useState('');
  const [page,     setPage]     = React.useState(1);
  const perPage = 10;

  const filtered = srcList.filter(r => {
    if (qBagian && !r.bagian.toLowerCase().includes(qBagian.toLowerCase())) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <div className="sub">Daftar dokumen {title.toLowerCase()}</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-grid filter-grid-4">
          <div className="field">
            <label>Tgl. Dari</label>
            <input className="input" type="date" value={tglDari}
              onChange={e => { setTglDari(e.target.value); setPage(1); }} />
          </div>
          <div className="field">
            <label>Tgl. Sampai</label>
            <input className="input" type="date" value={tglSmpai}
              onChange={e => { setTglSmpai(e.target.value); setPage(1); }} />
          </div>
          <div className="field">
            <label>Bagian</label>
            <input className="input" placeholder="Cari bagian…" value={qBagian}
              onChange={e => { setQBagian(e.target.value); setPage(1); }} />
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={() => setPage(1)}>{I.search(13)} Cari</button>
            <button className="btn" onClick={() => { setTglDari(''); setTglSmpai(''); setQBagian(''); setPage(1); }}>Reset</button>
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
            <button className="btn btn-sm btn-icon" title="Print">{I.print()}</button>
            <button className="btn btn-sm btn-icon btn-danger" title="Hapus">{I.trash()}</button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:32}}><input type="checkbox" className="cb" /></th>
                <th>No. {prefix}</th>
                <th>Tanggal</th>
                <th>Gudang</th>
                <th>Bagian</th>
                {type === 'bpbl' && <th>No. OPB</th>}
                <th className="num">Total Barang</th>
                <th className="center" style={{width:60}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={type === 'bpbl' ? 8 : 7}
                  style={{textAlign:'center', padding:32, color:'var(--text-3)'}}>
                  Tidak ada data</td></tr>
              )}
              {rows.map(r => (
                <tr key={r.no}>
                  <td><input type="checkbox" className="cb" /></td>
                  <td><span className="cell-link">{r.no}</span></td>
                  <td>{r.tgl}</td>
                  <td>{r.namaGudang}</td>
                  <td>{r.bagian}</td>
                  {type === 'bpbl' && <td className="muted">{r.noOpb || '—'}</td>}
                  <td className="num mono">{r.totalBarang}</td>
                  <td className="center">
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={() => onEdit(r)}>{I.edit()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span>Menampilkan {rows.length} dari {filtered.length} data</span>
          <div className="pager-pages">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{I.chev(12,'left')}</button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{I.chev(12,'right')}</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Planning Schedule Produksi Harian ───────────────────────────────────────

function PlanningScheduleList() {
  const showToast = (msg) => { window.__erpToast && window.__erpToast(msg); };

  const [selectedMesin,  setSelectedMesin]  = React.useState(null);
  const [tgl,            setTgl]            = React.useState('2026-06-24');
  const [jamMulai,       setJamMulai]       = React.useState('08:30');
  const [jamSelesai,     setJamSelesai]     = React.useState('17:00');
  const [items,          setItems]          = React.useState(PLANNING_LIST);
  const [selPlanning,    setSelPlanning]    = React.useState(new Set());
  const [selOutstanding, setSelOutstanding] = React.useState(new Set());
  const [showSpkPicker,  setShowSpkPicker]  = React.useState(false);

  const planningItems    = items.filter(r => r.mesin === selectedMesin && r.status === 'planning');
  const outstandingItems = items.filter(r => r.mesin === selectedMesin && r.status === 'outstanding');

  const updateStatus = (ids, newStatus) =>
    setItems(ls => ls.map(r => ids.has(r.id) ? {...r, status: newStatus} : r));

  const handleMulaiProduksi = () => {
    updateStatus(selPlanning, 'outstanding');
    setSelPlanning(new Set());
    showToast(`${selPlanning.size} SPK dipindahkan ke outstanding.`);
  };
  const handleSelesaikanProduksi = () => {
    updateStatus(selOutstanding, 'selesai');
    setSelOutstanding(new Set());
    showToast(`${selOutstanding.size} SPK diselesaikan.`);
  };
  const handleBatalkanPlanning = () => {
    updateStatus(selPlanning, 'batal');
    setSelPlanning(new Set());
    showToast(`${selPlanning.size} planning dibatalkan.`);
  };
  const handleBatalkanProduksi = () => {
    updateStatus(selOutstanding, 'batal');
    setSelOutstanding(new Set());
    showToast(`${selOutstanding.size} produksi dibatalkan.`);
  };

  const toggleSel = (set, setFn, id) =>
    setFn(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAllPlanning = (checked) =>
    setSelPlanning(checked ? new Set(planningItems.map(r => r.id)) : new Set());
  const toggleAllOutstanding = (checked) =>
    setSelOutstanding(checked ? new Set(outstandingItems.map(r => r.id)) : new Set());

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
              {MESIN_LIST.map(m => {
                const nPlanning    = items.filter(r => r.mesin === m && r.status === 'planning').length;
                const nOutstanding = items.filter(r => r.mesin === m && r.status === 'outstanding').length;
                return (
                  <button key={m} style={mesinStyle(selectedMesin === m)}
                    onClick={() => { setSelectedMesin(m); setSelPlanning(new Set()); setSelOutstanding(new Set()); }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:4}}>
                      <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{m}</span>
                      <div style={{display:'flex', gap:3, flexShrink:0}}>
                        {nPlanning    > 0 && <span style={{fontSize:10, padding:'1px 5px', borderRadius:10, background:'var(--primary)', color:'#fff'}}>{nPlanning}</span>}
                        {nOutstanding > 0 && <span style={{fontSize:10, padding:'1px 5px', borderRadius:10, background:'#f59e0b', color:'#fff'}}>{nOutstanding}</span>}
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
            <div className="filter-grid filter-grid-px3">
              <div className="field">
                <label>Tanggal</label>
                <input className="input" type="date" value={tgl} onChange={e => setTgl(e.target.value)} />
              </div>
              <div className="field">
                <label>Jam Mulai</label>
                <input className="input" type="time" value={jamMulai} onChange={e => setJamMulai(e.target.value)} />
              </div>
              <span style={{alignSelf:'flex-end', paddingBottom:9, textAlign:'center', color:'var(--text-3)', fontSize:13}}>–</span>
              <div className="field">
                <label>Jam Selesai</label>
                <input className="input" type="time" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)} />
              </div>
              <div className="filter-actions">
                <button className="btn btn-primary" disabled={!selectedMesin}
                  onClick={() => setShowSpkPicker(true)}>
                  {I.plus()} Mulai Planning
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
                  <button className="btn btn-primary btn-sm" onClick={handleMulaiProduksi}>
                    {I.check()} Mulai Produksi ({selPlanning.size})
                  </button>
                  <button className="btn btn-sm" style={{color:'var(--danger)', borderColor:'var(--danger)'}}
                    onClick={handleBatalkanPlanning}>
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
                    <th style={thS('16%')}>Merk</th>
                    <th style={thS()}>Nama Barang</th>
                    <th style={thS('80px', true)}>Jumlah</th>
                    <th style={thS('60px', true)}>Sat</th>
                    <th style={thS('70px', true)}>Menit</th>
                    <th style={thS('90px', true)}>Jam Mulai</th>
                    <th style={thS('90px', true)}>Jam Selesai</th>
                    <th style={thS('52px', true)}></th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedMesin && emptyRow(11, 'Pilih mesin di sidebar untuk melihat planning produksi.')}
                  {selectedMesin && planningItems.length === 0 && emptyRow(11, 'Tidak ada SPK dalam antrian planning untuk mesin ini.')}
                  {planningItems.map((r, idx) => (
                    <tr key={r.id} style={{background: selPlanning.has(r.id) ? 'var(--primary-soft, #f0f4ff)' : ''}}>
                      <td style={{...tdS, textAlign:'center'}}>
                        <input type="checkbox" className="cb"
                          checked={selPlanning.has(r.id)}
                          onChange={() => toggleSel(selPlanning, setSelPlanning, r.id)} />
                      </td>
                      <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                      <td style={tdS}><span className="cell-link">{r.noSpk}</span></td>
                      <td style={tdS}>{r.merk}</td>
                      <td style={tdS}>{r.namaBarang}</td>
                      <td style={{...tdS, textAlign:'right'}} className="mono">{r.jumlah}</td>
                      <td style={{...tdS, textAlign:'center'}}>{r.satuan}</td>
                      <td style={{...tdS, textAlign:'right'}} className="mono">{r.menit}</td>
                      <td style={{...tdS, textAlign:'center'}} className="mono">{r.jamMulai}</td>
                      <td style={{...tdS, textAlign:'center'}} className="mono">{r.jamSelesai}</td>
                      <td style={{...tdS, textAlign:'center'}}>
                        <div className="row-actions">
                          <button className="btn btn-icon btn-sm" title="Batalkan"
                            style={{color:'var(--text-3)'}}
                            onClick={() => { updateStatus(new Set([r.id]), 'batal'); showToast('Planning dibatalkan.'); }}>
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

          {/* Outstanding table */}
          <div className="table-card">
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <span style={{fontWeight:600}}>Outstanding SPK</span>
                {selectedMesin && <span style={{marginLeft:6, color:'var(--text-3)', fontWeight:400}}>— {selectedMesin}</span>}
                {selOutstanding.size > 0 && (
                  <span className="pill" style={{marginLeft:8}}>{selOutstanding.size} dipilih</span>
                )}
              </div>
              {selOutstanding.size > 0 && (
                <div className="table-toolbar-right">
                  <button className="btn btn-primary btn-sm" onClick={handleSelesaikanProduksi}>
                    {I.check()} Selesaikan Produksi ({selOutstanding.size})
                  </button>
                  <button className="btn btn-sm" style={{color:'var(--danger)', borderColor:'var(--danger)'}}
                    onClick={handleBatalkanProduksi}>
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
                        checked={outstandingItems.length > 0 && selOutstanding.size === outstandingItems.length}
                        onChange={e => toggleAllOutstanding(e.target.checked)} />
                    </th>
                    <th style={thS('36px', true)}>No</th>
                    <th style={thS('18%')}>No. SPK</th>
                    <th style={thS('16%')}>Merk</th>
                    <th style={thS()}>Nama Barang</th>
                    <th style={thS('80px', true)}>Jumlah</th>
                    <th style={thS('60px', true)}>Sat</th>
                    <th style={thS('70px', true)}>Menit</th>
                    <th style={thS('90px', true)}>Jam Mulai</th>
                    <th style={thS('90px', true)}>Jam Selesai</th>
                    <th style={thS('52px', true)}></th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedMesin && emptyRow(11, 'Pilih mesin di sidebar untuk melihat outstanding produksi.')}
                  {selectedMesin && outstandingItems.length === 0 && emptyRow(11, 'Tidak ada SPK dalam outstanding untuk mesin ini.')}
                  {outstandingItems.map((r, idx) => (
                    <tr key={r.id} style={{background: selOutstanding.has(r.id) ? 'var(--primary-soft, #f0f4ff)' : ''}}>
                      <td style={{...tdS, textAlign:'center'}}>
                        <input type="checkbox" className="cb"
                          checked={selOutstanding.has(r.id)}
                          onChange={() => toggleSel(selOutstanding, setSelOutstanding, r.id)} />
                      </td>
                      <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                      <td style={tdS}><span className="cell-link">{r.noSpk}</span></td>
                      <td style={tdS}>{r.merk}</td>
                      <td style={tdS}>{r.namaBarang}</td>
                      <td style={{...tdS, textAlign:'right'}} className="mono">{r.jumlah}</td>
                      <td style={{...tdS, textAlign:'center'}}>{r.satuan}</td>
                      <td style={{...tdS, textAlign:'right'}} className="mono">{r.menit}</td>
                      <td style={{...tdS, textAlign:'center'}} className="mono">{r.jamMulai}</td>
                      <td style={{...tdS, textAlign:'center'}} className="mono">{r.jamSelesai}</td>
                      <td style={{...tdS, textAlign:'center'}}>
                        <div className="row-actions">
                          <button className="btn btn-icon btn-sm" title="Batalkan"
                            style={{color:'var(--text-3)'}}
                            onClick={() => { updateStatus(new Set([r.id]), 'batal'); showToast('Produksi dibatalkan.'); }}>
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
        <SpkPickerModal
          onPick={(spk) => {
            setItems(ls => [...ls, {
              id: 'PL-' + Date.now(),
              mesin: selectedMesin, tgl, jamMulai, jamSelesai,
              noSpk: spk.no, merk: spk.merkSpk, namaBarang: spk.produk,
              jumlah: spk.qty, satuan: 'LBR', menit: 60,
              status: 'planning',
            }]);
            setShowSpkPicker(false);
            showToast('SPK berhasil ditambahkan ke planning.');
          }}
          onClose={() => setShowSpkPicker(false)}
        />
      )}
    </>
  );
}

// ─── Main Page Router ─────────────────────────────────────────────────────────

function ManufakturPage({ activeSub, onSubChange, onNavigate }) {
  const [modal, setModal] = React.useState(null);

  const showToast = (msg) => { window.__erpToast && window.__erpToast(msg); };

  const onSave = () => {
    setModal(null);
    showToast('Data berhasil disimpan.');
  };

  const onBack = () => onSubChange(null);

  const subLabel = {
    spk:      'Surat Perintah Kerja',
    produksi: 'Hasil Produksi & Pemakaian Bahan',
    bpbl:     'Bukti Pemakaian Barang Lain',
    rpbl:     'Retur Pakai Barang Lain',
    planning: 'Planning Schedule Produksi Harian',
  };

  if (!activeSub) {
    return <ManufakturDashboard onOpenSub={onSubChange} />;
  }

  return (
    <div className="page">
      <div className="crumbs">
        <a style={{cursor:'pointer'}} onClick={() => onNavigate('home')}>Home</a>
        <span className="sep">/</span>
        <a style={{cursor:'pointer'}} onClick={onBack}>Manufaktur</a>
        <span className="sep">/</span>
        <span className="current">{subLabel[activeSub] || activeSub}</span>
      </div>

      {activeSub === 'spk'      && <SpkList
        onAdd={() => setModal({type:'spk', data:null})}
        onEdit={r  => setModal({type:'spk', data:r})}
        onNavigate={onNavigate} />}
      {activeSub === 'produksi' && <HasilProduksiList
        onAdd={() => setModal({type:'produksi', data:null})}
        onEdit={r  => setModal({type:'produksi', data:r})} />}
      {activeSub === 'bpbl' && <PemakaianBarangList type="bpbl"
        onAdd={() => setModal({type:'bpbl', data:null})}
        onEdit={r  => setModal({type:'bpbl', data:r})} />}
      {activeSub === 'rpbl' && <PemakaianBarangList type="rpbl"
        onAdd={() => setModal({type:'rpbl', data:null})}
        onEdit={r  => setModal({type:'rpbl', data:r})} />}
      {activeSub === 'planning' && <PlanningScheduleList />}

      {modal?.type === 'spk'      && <SpkDialog           data={modal.data} onClose={() => setModal(null)} onSave={onSave} />}
      {modal?.type === 'produksi' && <HasilProduksiDialog data={modal.data} onClose={() => setModal(null)} onSave={onSave} />}
      {modal?.type === 'bpbl' && <PemakaianBarangDialog type="bpbl" data={modal.data} onClose={() => setModal(null)} onSave={onSave} />}
      {modal?.type === 'rpbl' && <PemakaianBarangDialog type="rpbl" data={modal.data} onClose={() => setModal(null)} onSave={onSave} />}
    </div>
  );
}
