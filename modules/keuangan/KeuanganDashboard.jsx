// Keuangan — dashboard modul gabungan: KPI + tile Kas/Bank/Giro asli, DITAMBAH tile "Modul
// Akuntan" & "Laporan Keuangan" yang diporting dari modules/akuntan/AkuntanDashboard.jsx (dead
// code sejak Akuntan bukan lagi tab navigasi berdiri sendiri) — supaya semua sub-menu hasil
// penggabungan Akuntan+Keuangan benar-benar kelihatan sebagai tile di 1 dashboard, bukan cuma
// bisa diakses lewat tab bar/breadcrumb.

function KeuanganDashboard({ onOpenSub, onNavigate, akunRows, aktivaRows, jurnalRows, labaRugiRows, arusKasRows, neracaRows, kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, giroMasukRows, giroKeluarRows, pelunasanPiutangRows, pelunasanHutangRows }) {
  const totalKas = kbgRows.filter(a=>a.tipe==='KAS').reduce((s,a)=>s+a.saldo,0);
  const totalBank = kbgRows.filter(a=>a.tipe==='BANK').reduce((s,a)=>s+a.saldo,0);
  const totalGiro = kbgRows.filter(a=>a.tipe==='GIRO').reduce((s,a)=>s+a.saldo,0);
  const giroOutMasuk = giroMasukRows.filter(g=>g.status==='Outstanding').length;
  const giroOutKeluar = giroKeluarRows.filter(g=>g.status==='Outstanding').length;

  const kasBankTiles = [
    { id:'kbg', icon:I.wallet ? I.wallet(20) : I.box(20), title:'Kas, Bank & Giro', desc:'Master akun kas, bank, dan giro beserta saldo realtime.', badge:`${kbgRows.length} akun`, accent:'#0369a1' },
    { id:'km',  icon:I.arrowL(20), title:'Kas Masuk',     desc:'Pencatatan penerimaan kas dari pelanggan, tunai, atau lain-lain.',    badge:`${kasMasukRows.length} bulan ini`, accent:'#16a34a' },
    { id:'kk',  icon:I.arrowR(20), title:'Kas Keluar',    desc:'Pengeluaran kas untuk supplier, beban operasional, dan reimburse.', badge:`${kasKeluarRows.length} bulan ini`, accent:'#dc2626' },
    { id:'bm',  icon:I.arrowL(20), title:'Bank Masuk',    desc:'Penerimaan via transfer bank dari pelanggan dan lain-lain.',           badge:`${bankMasukRows.length} bulan ini`, accent:'#16a34a' },
    { id:'bk',  icon:I.arrowR(20), title:'Bank Keluar',   desc:'Pembayaran ke supplier, payroll, pajak via transfer bank.',           badge:`${bankKeluarRows.length} bulan ini`, accent:'#dc2626' },
    { id:'tm',  icon:I.arrowL(20), title:'Transfer Masuk antar Kas/Bank', desc:'Transfer masuk antar akun kas/bank internal.',          accent:'#0d9488' },
    { id:'tk',  icon:I.arrowR(20), title:'Transfer Keluar antar Kas/Bank',desc:'Transfer keluar antar akun kas/bank internal.',         accent:'#0d9488' },
    { id:'gm',  icon:I.invoice(20),title:'Giro Masuk',    desc:'Penerimaan giro dari pelanggan, monitoring jatuh tempo.',              badge: giroOutMasuk>0?`${giroOutMasuk} outstanding`:null, badgeKind:'pulse', accent:'#7c3aed' },
    { id:'gk',  icon:I.invoice(20),title:'Giro Keluar',   desc:'Pengeluaran giro ke supplier dengan jadwal pencairan.',                badge: giroOutKeluar>0?`${giroOutKeluar} outstanding`:null, badgeKind:'pulse', accent:'#7c3aed' },
    { id:'pp',  icon:I.check(20),  title:'Pelunasan Piutang', desc:'Catat pelunasan invoice penjualan, full atau sebagian.',          badge:`${pelunasanPiutangRows.length} bulan ini`, accent:'#0d9488' },
    { id:'ph',  icon:I.check(20),  title:'Pelunasan Hutang',  desc:'Catat pelunasan bill supplier, full atau sebagian.',              badge:`${pelunasanHutangRows.length} bulan ini`, accent:'#0d9488' },
  ];

  const totalAkun = akunRows.length;
  const aktivaAktif = aktivaRows.filter(a=>a.aktif).length;
  const jmDraft = jurnalRows.filter(j=>j.status==='Draft' || j.status==='Pending').length;
  const akuntanTiles = [
    { id:'akun',   icon:I.list(20),    title:'Katalog Akun Buku Besar', desc:'Master Chart of Accounts (CoA) — kelola akun K/B/D, grup, dan sub-grup buku besar.', badge:`${totalAkun} akun aktif`, accent:null },
    { id:'aktiva', icon:I.box(20),     title:'Katalog Aktiva',           desc:'Daftar aktiva tetap, harga perolehan, akumulasi penyusutan, dan nilai buku.', badge:`${aktivaAktif} aktiva aktif`, accent:'#7c3aed' },
    { id:'jurnal', icon:I.invoice(20), title:'Jurnal Memorial',          desc:'Jurnal manual untuk pencatatan adjusment, reklasifikasi, dan koreksi.', badge: jmDraft > 0 ? `${jmDraft} draft/pending` : null, badgeKind:'pulse', accent:'#0d9488' },
  ];
  const laporanRowsMap = { labarugi:labaRugiRows, aruskas:arusKasRows, neraca:neracaRows };


  return (
    <div className="page" data-screen-label="06 Keuangan — Dashboard">
      <div className="crumbs"><a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span><span className="current">Keuangan</span></div>
      <div className="page-head">
        <div><h1>Keuangan Workspace</h1><div className="sub">Kelola akuntansi, kas, bank, giro, dan pelunasan piutang/hutang dalam satu workspace.</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
        </div>
      </div>

      <h3 className="section-title">Laporan Keuangan <span className="count">{AK_LAPORAN_LIST.length + 3}</span></h3>
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
        <button className="tile" onClick={()=>onOpenSub('lapbank')}>
          <div className="tile-head">
            <div className="tile-icon-wrap" style={{background:'#0369a114', color:'#0369a1'}}>{I.wallet ? I.wallet(20) : I.invoice(20)}</div>
            <span className="tile-badge">{kbgRows.length} akun</span>
          </div>
          <div><h3>Laporan Bank</h3><p>Ledger berjalan per akun Kas, Bank & Giro — saldo awal + mutasi periode.</p></div>
        </button>
        <button className="tile" onClick={()=>onOpenSub('bbdetil')}>
          <div className="tile-head">
            <div className="tile-icon-wrap" style={{background:'#0369a114', color:'#0369a1'}}>{I.list(20)}</div>
            <span className="tile-badge">{akunRows.length} akun</span>
          </div>
          <div><h3>Buku Besar (Detil)</h3><p>Ledger berjalan per akun untuk seluruh Chart of Accounts.</p></div>
        </button>
        <button className="tile" onClick={()=>onOpenSub('bbrekap')}>
          <div className="tile-head">
            <div className="tile-icon-wrap" style={{background:'#0369a114', color:'#0369a1'}}>{I.list(20)}</div>
            <span className="tile-badge">{akunRows.length} akun</span>
          </div>
          <div><h3>Buku Besar (Rekap Total)</h3><p>Neraca saldo — Saldo Awal, Mutasi, dan Saldo Akhir per akun.</p></div>
        </button>
      </div>

      <h3 className="section-title" style={{marginTop:28}}>Modul Keuangan <span className="count">{kasBankTiles.length}</span></h3>
      <div className="tile-grid">
        {kasBankTiles.map(t => (
          <button key={t.id} className="tile" onClick={()=>onOpenSub(t.id)}>
            <div className="tile-head">
              <div className="tile-icon-wrap" style={t.accent ? { background: t.accent + '14', color: t.accent } : null}>{t.icon}</div>
              {t.badge && <span className={`tile-badge ${t.badgeKind === 'pulse' ? 'pulse' : ''}`}>{t.badge}</span>}
            </div>
            <div><h3>{t.title}</h3><p>{t.desc}</p></div>
          </button>
        ))}
      </div>

      <h3 className="section-title" style={{marginTop:28}}>Modul Akuntan <span className="count">{akuntanTiles.length}</span></h3>
      <div className="tile-grid">
        {akuntanTiles.map(t => (
          <button key={t.id} className="tile" onClick={()=>onOpenSub(t.id)}>
            <div className="tile-head">
              <div className="tile-icon-wrap" style={t.accent ? { background: t.accent + '14', color: t.accent } : null}>{t.icon}</div>
              {t.badge && <span className={`tile-badge ${t.badgeKind === 'pulse' ? 'pulse' : ''}`}>{t.badge}</span>}
            </div>
            <div><h3>{t.title}</h3><p>{t.desc}</p></div>
          </button>
        ))}
      </div>

      <div style={{marginTop:32}}>
        <div className="panel">
          <h3>Giro Outstanding — Jatuh Tempo Terdekat</h3>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[...giroMasukRows, ...giroKeluarRows].filter(g=>g.status==='Outstanding').slice(0,6).map(g => (
              <div key={g.no} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'var(--bg-sub)', borderRadius:6, fontSize:13}}>
                <div>
                  <div style={{fontWeight:500}}>{g.dari || g.untuk}</div>
                  <div className="muted mono" style={{fontSize:11.5}}>{g.noGiro} · {g.bank} · jth.tempo {g.jthTempo}</div>
                </div>
                <div className="num mono" style={{fontWeight:600}}>{g.dari ? '+' : '−'}{fmtRp(g.nominal)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
