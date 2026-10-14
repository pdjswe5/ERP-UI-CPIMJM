// Payroll — Absensi Karyawan: entri kehadiran harian (simulasi fingerprint — tidak ada integrasi
// device di prototipe ini, data manual/seed spt modul lain), DIKELOMPOKKAN PER TANGGAL (expand/
// collapse per grup) supaya lebih terbaca drpd flat 80+ baris (dulu 1 tabel panjang tanpa filter
// selain pencarian teks — sulit dibaca per user). Pola expand row sama dgn tabel Barang Jadi→Bahan
// di SpkPage.jsx (Manufaktur): tombol ▸/▾ + `expandedDates` (Set) + baris detail nested
// (`<tr><td colSpan>`). Divisi/Bagian tiap entri diresolve dari Mutasi Karyawan yg berlaku PADA
// tanggal absen itu (prMutasiAktif, PrShared.jsx) supaya filter Divisi/Bagian akurat secara historis,
// bukan cuma jabatan terkini. `rows`/`setRows`/`karyawanRows`/`mutasiRows` diangkat ke PayrollPage.jsx.

const PR_ABSENSI_STATUS = ['Hadir','Izin','Sakit','Alpha','Cuti'];

function prAbsensiStatusPill(status) {
  const kind = status === 'Hadir' ? 'approved' : status === 'Alpha' ? 'cancelled' : 'pending';
  return <span className={`pill ${kind}`}>{status}</span>;
}

function prFmtTglGroup(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}

function PayrollAbsensiPage({ rows, setRows, karyawanRows, mutasiRows }) {
  const [q, setQ] = React.useState('');
  const [tglAwal, setTglAwal] = React.useState('');
  const [tglAkhir, setTglAkhir] = React.useState('');
  const [kodeDivisi, setKodeDivisi] = React.useState('');
  const [kodeBagian, setKodeBagian] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState(null);
  const [expandedDates, setExpandedDates] = React.useState(new Set());
  const toggleDate = (tgl) => setExpandedDates(prev => { const s = new Set(prev); s.has(tgl) ? s.delete(tgl) : s.add(tgl); return s; });

  // Gabungkan tiap entri absensi dgn Nama & Divisi/Bagian yg berlaku PADA tanggal itu (bukan
  // jabatan terkini) — dipakai utk tampilan & filter, TIDAK pernah ditulis balik ke `rows`.
  const enriched = React.useMemo(() => rows.map(r => {
    const k = karyawanRows.find(x => x.noInduk === r.noInduk);
    const mutasi = prMutasiAktif(r.noInduk, mutasiRows, r.tanggal);
    return { ...r, nama: k?.nama || r.noInduk, kodeDivisi: mutasi?.kodeDivisi || '', kodeBagian: mutasi?.kodeBagian || '' };
  }), [rows, karyawanRows, mutasiRows]);

  const filtered = enriched.filter(r =>
    (!q || r.nama.toLowerCase().includes(q.toLowerCase()) || r.noInduk.includes(q)) &&
    (!tglAwal || r.tanggal >= tglAwal) &&
    (!tglAkhir || r.tanggal <= tglAkhir) &&
    (!kodeDivisi || r.kodeDivisi === kodeDivisi) &&
    (!kodeBagian || r.kodeBagian === kodeBagian) &&
    (!statusFilter || r.status === statusFilter)
  );

  const groups = React.useMemo(() => {
    const byTanggal = {};
    filtered.forEach(r => { (byTanggal[r.tanggal] = byTanggal[r.tanggal] || []).push(r); });
    return Object.keys(byTanggal).sort((a,b)=>b.localeCompare(a)).map(tanggal => {
      const list = byTanggal[tanggal].slice().sort((a,b)=>a.nama.localeCompare(b.nama));
      const counts = {};
      PR_ABSENSI_STATUS.forEach(s => counts[s] = list.filter(r=>r.status===s).length);
      return { tanggal, rows: list, counts };
    });
  }, [filtered]);

  const expandAll = () => setExpandedDates(new Set(groups.map(g=>g.tanggal)));
  const collapseAll = () => setExpandedDates(new Set());

  const fields = [
    { key:'noInduk', label:'Karyawan', type:'select', required:true, span:2, options:()=>PR_KARYAWAN.map(k=>({value:k.noInduk, label:`${k.noInduk} - ${k.nama}`})) },
    { key:'tanggal', label:'Tanggal', type:'date', required:true },
    { key:'status', label:'Status', type:'select', required:true, options:()=>PR_ABSENSI_STATUS.map(s=>({value:s, label:s})) },
    { key:'jamMasuk', label:'Jam Masuk', mono:true },
    { key:'jamKeluar', label:'Jam Keluar', mono:true },
    { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
  ];

  const openAdd = () => { setModal(null); setShowModal(true); };
  // Ambil baris MENTAH dari `rows` (bukan `enriched`) — data hasil join (nama/kodeDivisi/kodeBagian)
  // cuma utk tampilan & tidak boleh ikut kesimpan balik ke PR_ABSENSI lewat modal Edit.
  const openEdit = (r) => { setModal(rows.find(x => x.id === r.id) || r); setShowModal(true); };
  const save = (form) => {
    setRows(prev => modal ? prev.map(r => r.id === modal.id ? { ...form, id: modal.id } : r) : [...prev, { ...form, id: `${form.noInduk}-${form.tanggal}-${Date.now()}` }]);
    window.__erpToast && window.__erpToast('Absensi berhasil disimpan.');
    setShowModal(false); setModal(null);
    setExpandedDates(prev => new Set(prev).add(form.tanggal));
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Absensi Karyawan</h1><div className="sub">Rekap kehadiran harian karyawan (fingerprint), dikelompokkan per tanggal — dasar Proses Penggajian Absensi.</div></div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-primary" onClick={openAdd}>{I.plus()} Tambah Absensi</button>
        </div>
      </div>
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Tgl Awal</label><input className="input" type="date" value={tglAwal} onChange={e=>setTglAwal(e.target.value)} /></div>
        <div className="field"><label>Tgl Akhir</label><input className="input" type="date" value={tglAkhir} onChange={e=>setTglAkhir(e.target.value)} /></div>
        <div className="field">
          <label>Divisi</label>
          <select className="select" value={kodeDivisi} onChange={e=>setKodeDivisi(e.target.value)}>
            <option value="">Semua Divisi</option>
            {PR_DIVISI.map(d => <option key={d.kode} value={d.kode}>{d.kode} - {d.nama}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Bagian</label>
          <select className="select" value={kodeBagian} onChange={e=>setKodeBagian(e.target.value)}>
            <option value="">Semua Bagian</option>
            {PR_BAGIAN.map(b => <option key={b.kode} value={b.kode}>{b.kode} - {b.nama}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select className="select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            {PR_ABSENSI_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Nama atau No Induk…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left"><b>{groups.length} tanggal</b> <span className="muted">· {filtered.length} entri</span></div>
          <div style={{display:'flex', gap:8}}>
            <button className="btn btn-sm" onClick={expandAll}>Buka Semua</button>
            <button className="btn btn-sm" onClick={collapseAll}>Tutup Semua</button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th style={{width:36}}></th><th>Tanggal</th><th>Jumlah Entri</th><th>Rekap Status</th></tr></thead>
            <tbody>
              {groups.length===0 && <tr><td colSpan={4} className="empty">Tidak ada data.</td></tr>}
              {groups.map(g => {
                const isOpen = expandedDates.has(g.tanggal);
                return (
                  <React.Fragment key={g.tanggal}>
                    <tr style={{cursor:'pointer', background:'var(--bg-sub)'}} onClick={()=>toggleDate(g.tanggal)}>
                      <td style={{textAlign:'center'}}>
                        <button className="btn btn-icon btn-sm" title={isOpen ? 'Tutup' : 'Buka'} onClick={e=>{e.stopPropagation(); toggleDate(g.tanggal);}}>{isOpen ? '▾' : '▸'}</button>
                      </td>
                      <td><b>{prFmtTglGroup(g.tanggal)}</b></td>
                      <td>{g.rows.length} karyawan</td>
                      <td>
                        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                          {PR_ABSENSI_STATUS.filter(s=>g.counts[s]>0).map(s => (
                            <span key={s} className={`pill ${s==='Hadir'?'approved':s==='Alpha'?'cancelled':'pending'}`} style={{fontSize:11.5}}>{g.counts[s]} {s}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={4} style={{padding:0, background:'var(--bg-elev)', borderBottom:'1px solid var(--border)'}}>
                          <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
                            <thead>
                              <tr style={{background:'var(--bg-sub)'}}>
                                <th style={{padding:'8px 12px 8px 44px', fontSize:11.5, textAlign:'left'}}>No. Induk</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Nama</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Divisi</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Bagian</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Jam Masuk</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Jam Keluar</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Status</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, textAlign:'left'}}>Keterangan</th>
                                <th style={{padding:'8px 12px', fontSize:11.5, width:90}}>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.rows.map(r => (
                                <tr key={r.id} style={{borderTop:'1px solid var(--border)'}}>
                                  <td className="mono" style={{padding:'8px 12px 8px 44px'}}>{r.noInduk}</td>
                                  <td style={{padding:'8px 12px'}}>{r.nama}</td>
                                  <td style={{padding:'8px 12px'}}>{r.kodeDivisi ? prKodeDivisiLabel(r.kodeDivisi) : <span className="muted">—</span>}</td>
                                  <td style={{padding:'8px 12px'}}>{r.kodeBagian ? prKodeBagianLabel(r.kodeBagian) : <span className="muted">—</span>}</td>
                                  <td className="mono" style={{padding:'8px 12px'}}>{r.jamMasuk || '—'}</td>
                                  <td className="mono" style={{padding:'8px 12px'}}>{r.jamKeluar || '—'}</td>
                                  <td style={{padding:'8px 12px'}}>{prAbsensiStatusPill(r.status)}</td>
                                  <td style={{padding:'8px 12px'}}>{r.keterangan || <span className="muted">—</span>}</td>
                                  <td style={{padding:'8px 12px'}} onClick={e=>e.stopPropagation()}>
                                    <div className="row-actions">
                                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>openEdit(r)}>{I.edit()}</button>
                                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>setPendingDelete(r)}>{I.trash()}</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <PrGenericModal moduleTitle="Absensi" data={modal} fields={fields} formCols={2} onClose={()=>{setShowModal(false); setModal(null);}} onSave={save} />}
      {pendingDelete && (
        <ConfirmationModal
          title="Hapus Absensi?" message={`Data absensi tanggal "${pendingDelete.tanggal}" akan dihapus permanen.`}
          confirmLabel="Hapus" confirmKind="danger" requireReason={false}
          onCancel={()=>setPendingDelete(null)}
          onConfirm={()=>{
            setRows(prev => prev.filter(x=>x.id!==pendingDelete.id));
            window.__erpToast && window.__erpToast('Absensi berhasil dihapus.');
            setPendingDelete(null);
          }} />
      )}
    </>
  );
}
