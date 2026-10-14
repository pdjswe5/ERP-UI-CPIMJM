// Akuntan — dashboard modul (KPI + tile per sub-halaman + tile Laporan Keuangan baru).

function AkuntanDashboard({ onOpenSub, onNavigate, akunRows, aktivaRows, jurnalRows, labaRugiRows, arusKasRows, neracaRows }) {
  const totalAkun = akunRows.length;
  const aktivaAktif = aktivaRows.filter(a=>a.aktif).length;
  const totalAktiva = aktivaRows.reduce((s,a)=>s+a.nilai, 0);
  const jmDraft = jurnalRows.filter(j=>j.status==='Draft' || j.status==='Pending').length;
  const laporanRowsMap = { labarugi:labaRugiRows, aruskas:arusKasRows, neraca:neracaRows };

  const tiles = [
    { id:'akun',   icon:I.list(20),    title:'Katalog Akun Buku Besar', desc:'Master Chart of Accounts (CoA) — kelola akun K/B/D, grup, dan sub-grup buku besar.', badge:`${totalAkun} akun aktif`, accent:null },
    { id:'aktiva', icon:I.box(20),     title:'Katalog Aktiva',           desc:'Daftar aktiva tetap, harga perolehan, akumulasi penyusutan, dan nilai buku.', badge:`${aktivaAktif} aktiva aktif`, accent:'#7c3aed' },
    { id:'jurnal', icon:I.invoice(20), title:'Jurnal Memorial',          desc:'Jurnal manual untuk pencatatan adjusment, reklasifikasi, dan koreksi.', badge: jmDraft > 0 ? `${jmDraft} draft/pending` : null, badgeKind:'pulse', accent:'#0d9488' },
  ];

  return (
    <div className="page" data-screen-label="05 Akuntan — Dashboard">
      <div className="crumbs"><a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span><span className="current">Akuntan</span></div>
      <div className="page-head">
        <div><h1>Akuntan Workspace</h1><div className="sub">Kelola akun buku besar, aktiva tetap, jurnal memorial, dan laporan keuangan dalam satu workspace.</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
          <button className="btn btn-sm btn-primary" onClick={()=>onOpenSub('jurnal')}>{I.plus()} Jurnal Baru</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Total Akun BB</div><div className="val mono">{totalAkun}</div><div className="delta up">{akunRows.filter(a=>a.tipe==='KAS').length} kas · {akunRows.filter(a=>a.tipe==='BANK').length} bank</div></div>
        <div className="kpi"><div className="lbl">Nilai Buku Aktiva</div><div className="val mono">{fmtRp(totalAktiva)}</div><div className="delta up">{aktivaAktif} aktiva tetap aktif</div></div>
        <div className="kpi"><div className="lbl">Penyusutan (YTD)</div><div className="val mono">{fmtRp(aktivaRows.reduce((s,a)=>s+a.susut, 0))}</div><div className="delta down">akumulasi sd. April 2026</div></div>
        <div className="kpi"><div className="lbl">Jurnal Memorial (30d)</div><div className="val mono">{jurnalRows.length}</div><div className="delta">{jmDraft} perlu review</div></div>
      </div>

      <h3 className="section-title">Modul Akuntan <span className="count">{tiles.length}</span></h3>
      <div className="tile-grid">
        {tiles.map(t => (
          <button key={t.id} className="tile" onClick={()=>onOpenSub(t.id)}>
            <div className="tile-head">
              <div className="tile-icon-wrap" style={t.accent ? { background: t.accent + '14', color: t.accent } : null}>{t.icon}</div>
              {t.badge && <span className={`tile-badge ${t.badgeKind === 'pulse' ? 'pulse' : ''}`}>{t.badge}</span>}
            </div>
            <div><h3>{t.title}</h3><p>{t.desc}</p></div>
          </button>
        ))}
      </div>

      <h3 className="section-title">Laporan Keuangan <span className="count">{AK_LAPORAN_LIST.length}</span></h3>
      <div className="tile-grid">
        {AK_LAPORAN_LIST.map(r => (
          <button key={r.id} className="tile" onClick={()=>onOpenSub(r.id)}>
            <div className="tile-head">
              <div className="tile-icon-wrap" style={{background:'#0369a114', color:'#0369a1'}}>{I.invoice(20)}</div>
              <span className="tile-badge">{laporanRowsMap[r.id].length} periode</span>
            </div>
            <div><h3>{r.label}</h3><p>{r.desc}</p></div>
          </button>
        ))}
      </div>

      <div className="dash-two-col" style={{marginTop:32}}>
        <div className="panel">
          <h3>Komposisi Akun BB per Grup</h3>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {[
              ['10 — Aktiva',   akunRows.filter(a=>a.grup==='10').length, '#0369a1'],
              ['15 — Aktiva Tetap', akunRows.filter(a=>a.grup==='15').length, '#7c3aed'],
              ['20 — Hutang',   akunRows.filter(a=>a.grup==='20').length, '#b45309'],
              ['40 — Pendapatan', akunRows.filter(a=>a.grup==='40').length, '#0d9488'],
              ['50 — HPP',       akunRows.filter(a=>a.grup==='50').length, '#dc2626'],
              ['60 — Beban',     akunRows.filter(a=>a.grup==='60').length, '#9a3412'],
              ['01 — Kas',       akunRows.filter(a=>a.grup==='01').length, '#0d9488'],
            ].map(([nm, cnt, col]) => {
              const pct = (cnt / akunRows.length) * 100;
              return (
                <div key={nm}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:5}}>
                    <span>{nm}</span><span className="mono muted">{cnt} akun</span>
                  </div>
                  <div style={{height:6, background:'var(--bg-sub)', borderRadius:999, overflow:'hidden'}}>
                    <div style={{height:'100%', width:Math.max(8,pct*4)+'%', background:col, borderRadius:999}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel">
          <h3>Aktivitas Akuntansi Terkini</h3>
          <div className="timeline">
            <div className="timeline-item done">
              <div className="ti-when">Hari ini · 16:30</div>
              <div className="ti-what"><b className="ti-who">Accountant 1</b> posting <span className="cell-link mono">JM-2026-0042</span> · Penyusutan April</div>
            </div>
            <div className="timeline-item done">
              <div className="ti-when">Hari ini · 11:08</div>
              <div className="ti-what"><b className="ti-who">Sistem</b> generate jadwal penyusutan untuk 10 aktiva</div>
            </div>
            <div className="timeline-item">
              <div className="ti-when">Kemarin · 14:22</div>
              <div className="ti-what"><b className="ti-who">Accountant 2</b> input adjusment piutang ragu-ragu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
