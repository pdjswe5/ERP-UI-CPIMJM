// Keuangan (Finance) module — dashboard + 11 sub-screens

const KAS_BANK_GIRO = [
  { kode:'1000.005', nama:'KAS BESAR',     tipe:'KAS',  cabang:'Pusat',     saldo: 285450000, currency:'IDR' },
  { kode:'1000.011', nama:'KAS KECIL 1',   tipe:'KAS',  cabang:'Pusat',     saldo:  12750000, currency:'IDR' },
  { kode:'1000.033', nama:'KAS KECIL 2',   tipe:'KAS',  cabang:'Surabaya',  saldo:   8200000, currency:'IDR' },
  { kode:'1005.000', nama:'BANK BCA',      tipe:'BANK', cabang:'Pusat',     saldo:1842300000, currency:'IDR', noRek:'088-1234567' },
  { kode:'1005.001', nama:'BRI',           tipe:'BANK', cabang:'Pusat',     saldo: 425800000, currency:'IDR', noRek:'0124-01-002345-30-1' },
  { kode:'1005.002', nama:'MANDIRI',       tipe:'BANK', cabang:'Surabaya',  saldo: 318650000, currency:'IDR', noRek:'140-00-1234567-8' },
  { kode:'1010.000', nama:'DEPOSITO BCA',  tipe:'BANK', cabang:'Pusat',     saldo:2500000000, currency:'IDR', noRek:'088-DEP-9988' },
  { kode:'1020.000', nama:'PIUTANG GIRO 1', tipe:'GIRO', cabang:'Pusat',    saldo: 184250000, currency:'IDR' },
  { kode:'1020.001', nama:'PIUTANG GIRO 2', tipe:'GIRO', cabang:'Pusat',    saldo:  92800000, currency:'IDR' },
];

const KAS_MASUK = [
  { tgl:'30-04-2026', no:'KM-2026-0118', dari:'CV Mitra Sejahtera', deskripsi:'Pelunasan invoice INV-2026-0411',  akun:'KAS BESAR',   nominal:  45200000, status:'Posted' },
  { tgl:'29-04-2026', no:'KM-2026-0117', dari:'PT Anugerah Jaya',   deskripsi:'DP order parts April',              akun:'KAS BESAR',   nominal:  18500000, status:'Posted' },
  { tgl:'28-04-2026', no:'KM-2026-0116', dari:'Pelanggan Tunai',    deskripsi:'Penjualan service',                 akun:'KAS KECIL 1', nominal:   3850000, status:'Posted' },
  { tgl:'26-04-2026', no:'KM-2026-0115', dari:'PT Surya Permata',   deskripsi:'Pelunasan piutang sebagian',         akun:'KAS BESAR',   nominal:  12000000, status:'Posted' },
  { tgl:'24-04-2026', no:'KM-2026-0114', dari:'CV Bintang Timur',   deskripsi:'Pembayaran retur',                  akun:'KAS KECIL 2', nominal:   2150000, status:'Pending' },
  { tgl:'22-04-2026', no:'KM-2026-0113', dari:'Petty cash refund',  deskripsi:'Refund kelebihan setoran',           akun:'KAS BESAR',   nominal:    750000, status:'Posted' },
];

const KAS_KELUAR = [
  { tgl:'30-04-2026', no:'KK-2026-0089', untuk:'PT Pemasok Inti',     deskripsi:'Pembayaran PO-2026-0418',           akun:'KAS BESAR',   nominal: 28400000, status:'Posted' },
  { tgl:'29-04-2026', no:'KK-2026-0088', untuk:'Karyawan',            deskripsi:'Reimburse perjalanan dinas',         akun:'KAS KECIL 1', nominal:  4200000, status:'Posted' },
  { tgl:'28-04-2026', no:'KK-2026-0087', untuk:'Vendor ATK',          deskripsi:'Pembelian alat tulis kantor',        akun:'KAS KECIL 1', nominal:  1850000, status:'Posted' },
  { tgl:'26-04-2026', no:'KK-2026-0086', untuk:'PLN',                 deskripsi:'Pembayaran listrik April',           akun:'KAS BESAR',   nominal:  6750000, status:'Posted' },
  { tgl:'24-04-2026', no:'KK-2026-0085', untuk:'PT Logistik Cepat',   deskripsi:'Biaya pengiriman April',             akun:'KAS BESAR',   nominal:  3200000, status:'Pending' },
];

const BANK_MASUK = [
  { tgl:'30-04-2026', no:'BM-2026-0204', dari:'PT Anugerah Jaya',     deskripsi:'Transfer pelunasan INV-0382',        akun:'BANK BCA',  nominal: 142500000, status:'Posted' },
  { tgl:'29-04-2026', no:'BM-2026-0203', dari:'CV Mitra Sejahtera',   deskripsi:'Pembayaran sebagian invoice',         akun:'BANK BCA',  nominal:  85000000, status:'Posted' },
  { tgl:'29-04-2026', no:'BM-2026-0202', dari:'PT Surya Permata',     deskripsi:'Transfer SO-2026-0412',               akun:'MANDIRI',   nominal: 220000000, status:'Posted' },
  { tgl:'27-04-2026', no:'BM-2026-0201', dari:'PT Indra Karya',       deskripsi:'Pelunasan INV-0378',                  akun:'BRI',       nominal:  68250000, status:'Posted' },
  { tgl:'25-04-2026', no:'BM-2026-0200', dari:'Bunga deposito April',  deskripsi:'Bunga deposito BCA',                 akun:'DEPOSITO BCA', nominal: 18750000, status:'Posted' },
];

const BANK_KELUAR = [
  { tgl:'30-04-2026', no:'BK-2026-0156', untuk:'PT Pemasok Inti',     deskripsi:'Pembayaran PO-2026-0410',             akun:'BANK BCA', nominal: 245000000, status:'Posted' },
  { tgl:'29-04-2026', no:'BK-2026-0155', untuk:'PT Mega Auto Parts',  deskripsi:'Pembayaran sparepart April',           akun:'BANK BCA', nominal: 128400000, status:'Posted' },
  { tgl:'28-04-2026', no:'BK-2026-0154', untuk:'Pajak',               deskripsi:'Setoran PPN April 2026',              akun:'MANDIRI',  nominal:  92750000, status:'Posted' },
  { tgl:'26-04-2026', no:'BK-2026-0153', untuk:'Karyawan',            deskripsi:'Payroll April 2026',                  akun:'BANK BCA', nominal: 385600000, status:'Posted' },
  { tgl:'24-04-2026', no:'BK-2026-0152', untuk:'PT Asuransi Sentral', deskripsi:'Premi asuransi Q2',                   akun:'BRI',      nominal:  18500000, status:'Pending' },
];

const TRANSFER_MASUK = [
  { tgl:'30-04-2026', no:'TM-2026-0042', dari:'KAS BESAR',  ke:'BANK BCA', deskripsi:'Setoran tunai harian',          nominal: 50000000, status:'Posted' },
  { tgl:'28-04-2026', no:'TM-2026-0041', dari:'KAS KECIL 1', ke:'KAS BESAR', deskripsi:'Konsolidasi kas kecil',        nominal:  8500000, status:'Posted' },
  { tgl:'25-04-2026', no:'TM-2026-0040', dari:'BANK BCA',   ke:'MANDIRI',  deskripsi:'Transfer antar bank',           nominal:150000000, status:'Posted' },
];

const TRANSFER_KELUAR = [
  { tgl:'30-04-2026', no:'TK-2026-0038', dari:'BANK BCA',   ke:'KAS BESAR', deskripsi:'Penarikan tunai untuk operasional', nominal: 25000000, status:'Posted' },
  { tgl:'27-04-2026', no:'TK-2026-0037', dari:'BANK BCA',   ke:'KAS KECIL 2', deskripsi:'Top up kas kecil cabang Surabaya', nominal: 10000000, status:'Posted' },
  { tgl:'24-04-2026', no:'TK-2026-0036', dari:'MANDIRI',    ke:'BRI',      deskripsi:'Reposisi saldo bank',           nominal: 75000000, status:'Posted' },
];

const GIRO_MASUK = [
  { tgl:'30-04-2026', no:'GM-2026-0028', dari:'PT Anugerah Jaya',  noGiro:'BG-CDE-7782341', bank:'BCA',     jthTempo:'15-05-2026', nominal:185000000, status:'Outstanding' },
  { tgl:'28-04-2026', no:'GM-2026-0027', dari:'CV Mitra Sejahtera',noGiro:'BG-MND-9912445', bank:'Mandiri', jthTempo:'12-05-2026', nominal: 95000000, status:'Outstanding' },
  { tgl:'25-04-2026', no:'GM-2026-0026', dari:'PT Surya Permata',  noGiro:'BG-BRI-1184502', bank:'BRI',     jthTempo:'08-05-2026', nominal:142000000, status:'Cair' },
  { tgl:'22-04-2026', no:'GM-2026-0025', dari:'PT Indra Karya',    noGiro:'BG-CDE-7765980', bank:'BCA',     jthTempo:'06-05-2026', nominal: 68500000, status:'Outstanding' },
  { tgl:'18-04-2026', no:'GM-2026-0024', dari:'CV Bintang Timur',  noGiro:'BG-MND-9905623', bank:'Mandiri', jthTempo:'02-05-2026', nominal: 34200000, status:'Tolak' },
];

const GIRO_KELUAR = [
  { tgl:'29-04-2026', no:'GK-2026-0019', untuk:'PT Pemasok Inti',    noGiro:'GR-PDJ-0058', bank:'BCA',  jthTempo:'14-05-2026', nominal:225000000, status:'Outstanding' },
  { tgl:'26-04-2026', no:'GK-2026-0018', untuk:'PT Mega Auto Parts', noGiro:'GR-PDJ-0057', bank:'BCA',  jthTempo:'10-05-2026', nominal:148000000, status:'Outstanding' },
  { tgl:'22-04-2026', no:'GK-2026-0017', untuk:'PT Sumber Karya',    noGiro:'GR-PDJ-0056', bank:'BRI',  jthTempo:'06-05-2026', nominal: 78500000, status:'Cair' },
];

const PELUNASAN_PIUTANG = [
  { tgl:'30-04-2026', no:'PP-2026-0072', pelanggan:'PT Anugerah Jaya',   noInvoice:'INV-2026-0382', nominalInv:142500000, terbayar:142500000, sisa:        0, metode:'Bank Transfer', status:'Lunas' },
  { tgl:'29-04-2026', no:'PP-2026-0071', pelanggan:'CV Mitra Sejahtera', noInvoice:'INV-2026-0411', nominalInv: 45200000, terbayar: 45200000, sisa:        0, metode:'Tunai',         status:'Lunas' },
  { tgl:'29-04-2026', no:'PP-2026-0070', pelanggan:'PT Surya Permata',   noInvoice:'INV-2026-0395', nominalInv:220000000, terbayar:220000000, sisa:        0, metode:'Bank Transfer', status:'Lunas' },
  { tgl:'27-04-2026', no:'PP-2026-0069', pelanggan:'PT Indra Karya',     noInvoice:'INV-2026-0378', nominalInv:120000000, terbayar: 68250000, sisa: 51750000, metode:'Bank Transfer', status:'Sebagian' },
  { tgl:'26-04-2026', no:'PP-2026-0068', pelanggan:'PT Surya Permata',   noInvoice:'INV-2026-0370', nominalInv: 12000000, terbayar: 12000000, sisa:        0, metode:'Tunai',         status:'Lunas' },
];

const PELUNASAN_HUTANG = [
  { tgl:'30-04-2026', no:'PH-2026-0045', supplier:'PT Pemasok Inti',     noBill:'BILL-S-0228', nominalBill:245000000, terbayar:245000000, sisa:       0, metode:'Bank Transfer', status:'Lunas' },
  { tgl:'29-04-2026', no:'PH-2026-0044', supplier:'PT Mega Auto Parts',  noBill:'BILL-S-0226', nominalBill:128400000, terbayar:128400000, sisa:       0, metode:'Bank Transfer', status:'Lunas' },
  { tgl:'28-04-2026', no:'PH-2026-0043', supplier:'PT Sumber Karya',     noBill:'BILL-S-0224', nominalBill:185000000, terbayar: 78500000, sisa:106500000, metode:'Giro',          status:'Sebagian' },
  { tgl:'24-04-2026', no:'PH-2026-0042', supplier:'PT Logistik Cepat',   noBill:'BILL-S-0220', nominalBill:  3200000, terbayar:  3200000, sisa:       0, metode:'Tunai',         status:'Lunas' },
];

Object.assign(window, { KAS_BANK_GIRO, KAS_MASUK, KAS_KELUAR, BANK_MASUK, BANK_KELUAR, TRANSFER_MASUK, TRANSFER_KELUAR, GIRO_MASUK, GIRO_KELUAR, PELUNASAN_PIUTANG, PELUNASAN_HUTANG });

const KU_SUBS = [
  { id:'kbg',   label:'Kas, Bank & Giro',         icon:'wallet' },
  { id:'km',    label:'Kas Masuk',                 icon:'in' },
  { id:'kk',    label:'Kas Keluar',                icon:'out' },
  { id:'bm',    label:'Bank Masuk',                icon:'in' },
  { id:'bk',    label:'Bank Keluar',               icon:'out' },
  { id:'tm',    label:'Transfer Masuk',            icon:'in' },
  { id:'tk',    label:'Transfer Keluar',           icon:'out' },
  { id:'gm',    label:'Giro Masuk',                icon:'doc' },
  { id:'gk',    label:'Giro Keluar',               icon:'doc' },
  { id:'pp',    label:'Pelunasan Piutang',         icon:'check' },
  { id:'ph',    label:'Pelunasan Hutang',          icon:'check' },
];

function KuSubNav({ active, onChange }) {
  return (
    <div className="ku-subnav">
      {KU_SUBS.map(s => (
        <button key={s.id} className={active===s.id?'active':''} onClick={()=>onChange(s.id)}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

function KeuanganDashboard({ onOpenSub, onNavigate }) {
  const totalKas = KAS_BANK_GIRO.filter(a=>a.tipe==='KAS').reduce((s,a)=>s+a.saldo,0);
  const totalBank = KAS_BANK_GIRO.filter(a=>a.tipe==='BANK').reduce((s,a)=>s+a.saldo,0);
  const totalGiro = KAS_BANK_GIRO.filter(a=>a.tipe==='GIRO').reduce((s,a)=>s+a.saldo,0);
  const giroOutMasuk = GIRO_MASUK.filter(g=>g.status==='Outstanding').length;
  const giroOutKeluar = GIRO_KELUAR.filter(g=>g.status==='Outstanding').length;

  const tiles = [
    { id:'kbg', icon:I.wallet ? I.wallet(20) : I.box(20), title:'Kas, Bank & Giro', desc:'Master akun kas, bank, dan giro beserta saldo realtime.', badge:`${KAS_BANK_GIRO.length} akun`, accent:'#0369a1' },
    { id:'km',  icon:I.arrowL(20), title:'Kas Masuk',     desc:'Pencatatan penerimaan kas dari pelanggan, tunai, atau lain-lain.',    badge:`${KAS_MASUK.length} bulan ini`, accent:'#16a34a' },
    { id:'kk',  icon:I.arrowR(20), title:'Kas Keluar',    desc:'Pengeluaran kas untuk supplier, beban operasional, dan reimburse.', badge:`${KAS_KELUAR.length} bulan ini`, accent:'#dc2626' },
    { id:'bm',  icon:I.arrowL(20), title:'Bank Masuk',    desc:'Penerimaan via transfer bank dari pelanggan dan lain-lain.',           badge:`${BANK_MASUK.length} bulan ini`, accent:'#16a34a' },
    { id:'bk',  icon:I.arrowR(20), title:'Bank Keluar',   desc:'Pembayaran ke supplier, payroll, pajak via transfer bank.',           badge:`${BANK_KELUAR.length} bulan ini`, accent:'#dc2626' },
    { id:'tm',  icon:I.arrowL(20), title:'Transfer Masuk antar Kas/Bank', desc:'Transfer masuk antar akun kas/bank internal.',          badge:`${TRANSFER_MASUK.length} bulan ini`, accent:'#0d9488' },
    { id:'tk',  icon:I.arrowR(20), title:'Transfer Keluar antar Kas/Bank',desc:'Transfer keluar antar akun kas/bank internal.',         badge:`${TRANSFER_KELUAR.length} bulan ini`, accent:'#0d9488' },
    { id:'gm',  icon:I.invoice(20),title:'Giro Masuk',    desc:'Penerimaan giro dari pelanggan, monitoring jatuh tempo.',              badge: giroOutMasuk>0?`${giroOutMasuk} outstanding`:null, badgeKind:'pulse', accent:'#7c3aed' },
    { id:'gk',  icon:I.invoice(20),title:'Giro Keluar',   desc:'Pengeluaran giro ke supplier dengan jadwal pencairan.',                badge: giroOutKeluar>0?`${giroOutKeluar} outstanding`:null, badgeKind:'pulse', accent:'#7c3aed' },
    { id:'pp',  icon:I.check(20),  title:'Pelunasan Piutang', desc:'Catat pelunasan invoice penjualan, full atau sebagian.',          badge:`${PELUNASAN_PIUTANG.length} bulan ini`, accent:'#0d9488' },
    { id:'ph',  icon:I.check(20),  title:'Pelunasan Hutang',  desc:'Catat pelunasan bill supplier, full atau sebagian.',              badge:`${PELUNASAN_HUTANG.length} bulan ini`, accent:'#0d9488' },
  ];

  return (
    <div className="page" data-screen-label="06 Keuangan — Dashboard">
      <div className="crumbs"><a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span><span className="current">Keuangan</span></div>
      <div className="page-head">
        <div><h1>Keuangan Workspace</h1><div className="sub">Kelola arus kas, bank, giro, dan pelunasan piutang/hutang.</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
          <button className="btn btn-sm btn-primary" onClick={()=>onOpenSub('km')}>{I.plus()} Transaksi Baru</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Total Saldo Kas</div><div className="val mono">{fmtRp(totalKas)}</div><div className="delta up">{KAS_BANK_GIRO.filter(a=>a.tipe==='KAS').length} akun kas</div></div>
        <div className="kpi"><div className="lbl">Total Saldo Bank</div><div className="val mono">{fmtRp(totalBank)}</div><div className="delta up">{KAS_BANK_GIRO.filter(a=>a.tipe==='BANK').length} akun bank</div></div>
        <div className="kpi"><div className="lbl">Saldo Giro</div><div className="val mono">{fmtRp(totalGiro)}</div><div className="delta">{giroOutMasuk + giroOutKeluar} giro outstanding</div></div>
        <div className="kpi"><div className="lbl">Net Cashflow (April)</div><div className="val mono" style={{color:'var(--realisasi)'}}>+{fmtRp(125450000)}</div><div className="delta up">vs Maret +18%</div></div>
      </div>

      <h3 className="section-title">Modul Keuangan <span className="count">{tiles.length}</span></h3>
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

      <div className="form-grid-2" style={{gap:16, marginTop:32}}>
        <div className="panel">
          <h3>Saldo Akun</h3>
          <table className="data" style={{margin:'4px -4px'}}>
            <thead><tr><th>Akun</th><th>Tipe</th><th className="num">Saldo</th></tr></thead>
            <tbody>
              {KAS_BANK_GIRO.slice(0,7).map(a => (
                <tr key={a.kode}>
                  <td><span className="cell-link" style={{fontWeight:500}}>{a.nama}</span><div className="muted mono" style={{fontSize:11.5}}>{a.kode}</div></td>
                  <td><span className="pill" style={{background: a.tipe==='KAS'?'#eef2ff':a.tipe==='BANK'?'#f0fdfa':'#fdf4ff', color:a.tipe==='KAS'?'#4338ca':a.tipe==='BANK'?'#0f766e':'#7c3aed'}}>{a.tipe}</span></td>
                  <td className="num mono" style={{fontWeight:600}}>{fmtRp(a.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Giro Outstanding — Jatuh Tempo Terdekat</h3>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[...GIRO_MASUK, ...GIRO_KELUAR].filter(g=>g.status==='Outstanding').slice(0,6).map(g => (
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

// ─── Generic Transaction Page Builder ───────────────────────────────────────

function TxPage({ title, sub, rows, columns, onAdd, onEdit, totalKey, totalLabel='Total', extraTotals=[] }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const totalAmt = filtered.reduce((s,r)=>s+(+r[totalKey]||0),0);
  return (
    <>
      <div className="page-head">
        <div><h1>{title}</h1><div className="sub">{sub}</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
          <button className="btn btn-sm">{I.download()} Export</button>
          {onAdd && <button className="btn btn-primary" onClick={onAdd}>{I.plus()} Tambah</button>}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Periode</label><input className="input" type="month" defaultValue="2026-04"/></div>
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No., nama, atau deskripsi…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
          <div className="field"><label>Status</label><select className="select"><option>Semua</option><option>Posted</option><option>Pending</option><option>Draft</option></select></div>
          <div className="filter-actions"><button className="btn">Reset</button><button className="btn btn-primary">{I.filter()} Cari</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <b>{filtered.length}</b> transaksi · {totalLabel} <span className="mono" style={{fontWeight:600, color:'var(--text)'}}>{fmtRp(totalAmt)}</span>
            {extraTotals.map(t => <span key={t.label} style={{marginLeft:14, color:'var(--text-3)'}}>{t.label} <span className="mono" style={{color:'var(--text)', fontWeight:500}}>{t.value}</span></span>)}
          </div>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr>{columns.map(c => <th key={c.key} className={c.cls||''} style={c.style}>{c.label}</th>)}<th style={{width:80}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={columns.length + 1} className="empty">Tidak ada data.</td></tr>}
              {filtered.map((r,i) => (
                <tr key={i} onClick={()=>onEdit && onEdit(r)}>
                  {columns.map(c => (
                    <td key={c.key} className={c.cls||''}>{c.render ? c.render(r) : r[c.key]}</td>
                  ))}
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" onClick={()=>onEdit && onEdit(r)}>{I.edit()}</button>
                      <button className="btn btn-icon btn-sm">{I.print()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Status pill helper
const stPill = (s) => {
  const map = { Posted:'realisasi', Lunas:'realisasi', Cair:'realisasi', Pending:'pending', Outstanding:'pending', Sebagian:'pending', Draft:'draft', Tolak:'cancel' };
  return <span className={`pill ${map[s] || 'draft'}`}>{s}</span>;
};

// ─── Sub-screens ────────────────────────────────────────────────────────────

function KasBankGiro({ onAdd, onEdit }) {
  return (
    <>
      <div className="page-head">
        <div><h1>Kas, Bank & Giro</h1><div className="sub">{KAS_BANK_GIRO.length} akun · Total saldo {fmtRp(KAS_BANK_GIRO.reduce((s,a)=>s+a.saldo,0))}</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
          <button className="btn btn-primary" onClick={onAdd}>{I.plus()} Tambah Akun</button>
        </div>
      </div>
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Tipe</label><select className="select"><option>Semua</option><option>KAS</option><option>BANK</option><option>GIRO</option></select></div>
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama akun…"/></div></div>
          <div className="filter-actions"><button className="btn">Pilih Kolom</button></div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {KAS_BANK_GIRO.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Kode</th><th>Nama Akun</th><th>Tipe</th><th>Cabang</th><th>No. Rekening</th><th>Currency</th><th className="num">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {KAS_BANK_GIRO.map(a => (
                <tr key={a.kode} onClick={()=>onEdit(a)}>
                  <td className="mono cell-link">{a.kode}</td>
                  <td><span className="cell-link" style={{fontWeight:500}}>{a.nama}</span></td>
                  <td><span className="pill" style={{background: a.tipe==='KAS'?'#eef2ff':a.tipe==='BANK'?'#f0fdfa':'#fdf4ff', color:a.tipe==='KAS'?'#4338ca':a.tipe==='BANK'?'#0f766e':'#7c3aed'}}>{a.tipe}</span></td>
                  <td>{a.cabang}</td>
                  <td className="mono muted">{a.noRek || '—'}</td>
                  <td>{a.currency}</td>
                  <td className="num mono" style={{fontWeight:600}}>{fmtRp(a.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const cashCols = [
  { key:'tgl', label:'Tanggal', cls:'mono' },
  { key:'no',  label:'No. Bukti', render: r => <span className="cell-link mono">{r.no}</span> },
  { key:'partner', label:'Dari / Untuk', render: r => r.dari || r.untuk },
  { key:'desc', label:'Deskripsi', render: r => r.deskripsi },
  { key:'akun', label:'Akun' },
  { key:'nominal', label:'Nominal', cls:'num mono', render: r => fmtRp(r.nominal) },
  { key:'status', label:'Status', render: r => stPill(r.status) },
];

const transferCols = [
  { key:'tgl', label:'Tanggal', cls:'mono' },
  { key:'no', label:'No. Bukti', render: r => <span className="cell-link mono">{r.no}</span> },
  { key:'dari', label:'Dari Akun' },
  { key:'ke', label:'Ke Akun' },
  { key:'desc', label:'Deskripsi', render: r => r.deskripsi },
  { key:'nominal', label:'Nominal', cls:'num mono', render: r => fmtRp(r.nominal) },
  { key:'status', label:'Status', render: r => stPill(r.status) },
];

const giroCols = [
  { key:'tgl', label:'Tanggal', cls:'mono' },
  { key:'no', label:'No. Bukti', render: r => <span className="cell-link mono">{r.no}</span> },
  { key:'partner', label:'Dari / Untuk', render: r => r.dari || r.untuk },
  { key:'noGiro', label:'No. Giro', cls:'mono' },
  { key:'bank', label:'Bank' },
  { key:'jthTempo', label:'Jth. Tempo', cls:'mono' },
  { key:'nominal', label:'Nominal', cls:'num mono', render: r => fmtRp(r.nominal) },
  { key:'status', label:'Status', render: r => stPill(r.status) },
];

const pelunasanCols = (kind) => [
  { key:'tgl', label:'Tanggal', cls:'mono' },
  { key:'no', label:'No. Pelunasan', render: r => <span className="cell-link mono">{r.no}</span> },
  { key:'partner', label: kind==='piutang'?'Pelanggan':'Supplier', render: r => kind==='piutang' ? r.pelanggan : r.supplier },
  { key:'noRef', label: kind==='piutang'?'No. Invoice':'No. Bill', render: r => <span className="mono cell-link">{r.noInvoice || r.noBill}</span> },
  { key:'nominalRef', label:'Nominal Tagihan', cls:'num mono', render: r => fmtRp(r.nominalInv || r.nominalBill) },
  { key:'terbayar', label:'Terbayar', cls:'num mono', render: r => <span style={{fontWeight:500}}>{fmtRp(r.terbayar)}</span> },
  { key:'sisa', label:'Sisa', cls:'num mono', render: r => r.sisa>0 ? <span>{fmtRp(r.sisa)}</span> : <span className="muted">—</span> },
  { key:'metode', label:'Metode' },
  { key:'status', label:'Status', render: r => stPill(r.status) },
];

// ─── Modal: Cash/Bank Transaction ───────────────────────────────────────────

function CashModal({ data, onClose, onSave, kind }) {
  const labels = {
    km: { title:'Kas Masuk',     partner:'Diterima Dari',  partnerVal:'dari'  },
    kk: { title:'Kas Keluar',    partner:'Dibayar Kepada', partnerVal:'untuk' },
    bm: { title:'Bank Masuk',    partner:'Diterima Dari',  partnerVal:'dari'  },
    bk: { title:'Bank Keluar',   partner:'Dibayar Kepada', partnerVal:'untuk' },
  }[kind];
  const isEdit = !!data;
  return (
    <AkModalShell wide
      title={isEdit?`Edit ${labels.title} — ${data.no}`:`${labels.title} Baru`}
      sub={isEdit ? data.deskripsi : `Catat transaksi ${labels.title.toLowerCase()} baru`}
      onClose={onClose} onSave={onSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div className="form-grid-2" style={{gap:24}}>
        <div className="form-section">
          <h4>Header Transaksi</h4>
          <div className="form-row">
            <div className="field"><label>Tanggal *</label><input className="input" type="date" defaultValue="2026-04-30"/></div>
            <div className="field"><label>No. Bukti</label><input className="input mono" defaultValue={isEdit?data.no:`${kind.toUpperCase()}-2026-NEW`} readOnly/></div>
          </div>
          <div className="field"><label>{labels.partner} *</label><input className="input" defaultValue={isEdit?data[labels.partnerVal]:''} placeholder="Nama partner / pihak ketiga"/></div>
          <div className="field"><label>Akun {kind.startsWith('k')?'Kas':'Bank'} *</label>
            <select className="select" defaultValue={isEdit?data.akun:''}>
              <option value="">— Pilih akun —</option>
              {KAS_BANK_GIRO.filter(a => kind.startsWith('k') ? a.tipe==='KAS' : a.tipe==='BANK').map(a => (
                <option key={a.kode} value={a.nama}>{a.kode} — {a.nama} (saldo {fmtRp(a.saldo)})</option>
              ))}
            </select>
          </div>
          <div className="field"><label>Akun Lawan *</label>
            <select className="select"><option value="">— Pilih akun —</option>
              {AKUN_BB.map(a => <option key={a.kode}>{a.kode} — {a.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Nominal (Rp) *</label><input className="input mono" type="number" defaultValue={isEdit?data.nominal:''}/></div>
          <div className="field"><label>Deskripsi</label><textarea className="textarea" defaultValue={isEdit?data.deskripsi:''}/></div>
        </div>

        <div>
          <h4 style={{margin:'0 0 12px', fontSize:11.5, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text-3)', paddingBottom:8, borderBottom:'1px solid var(--border)'}}>Preview Jurnal</h4>
          <div className="totals-card" style={{padding:16}}>
            <div className="muted" style={{fontSize:12, marginBottom:10}}>Pratinjau jurnal otomatis yang akan dibukukan:</div>
            <table style={{width:'100%', fontSize:12.5, borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border)'}}>
                  <th style={{textAlign:'left', padding:'6px 4px', fontSize:11, color:'var(--text-3)', textTransform:'uppercase'}}>Akun</th>
                  <th style={{textAlign:'right', padding:'6px 4px', fontSize:11, color:'var(--text-3)', textTransform:'uppercase'}}>Debit</th>
                  <th style={{textAlign:'right', padding:'6px 4px', fontSize:11, color:'var(--text-3)', textTransform:'uppercase'}}>Kredit</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{borderBottom:'1px dashed var(--border)'}}>
                  <td style={{padding:'8px 4px'}}>{kind.endsWith('m') ? `Akun ${kind.startsWith('k')?'Kas':'Bank'}` : 'Akun Lawan'}</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>{isEdit?fmtRp(data.nominal):'Rp 0'}</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>—</td>
                </tr>
                <tr>
                  <td style={{padding:'8px 4px'}}>{kind.endsWith('m') ? 'Akun Lawan' : `Akun ${kind.startsWith('k')?'Kas':'Bank'}`}</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>—</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>{isEdit?fmtRp(data.nominal):'Rp 0'}</td>
                </tr>
              </tbody>
            </table>
            <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--border)', fontSize:11.5, color:'var(--text-3)', display:'flex', justifyContent:'space-between'}}>
              <span>Status</span><span className="pill draft">Draft</span>
            </div>
          </div>
        </div>
      </div>
    </AkModalShell>
  );
}

function TransferModal({ data, onClose, onSave, kind }) {
  const isEdit = !!data;
  return (
    <AkModalShell title={isEdit?`Edit Transfer — ${data.no}`:`Transfer ${kind==='tm'?'Masuk':'Keluar'} antar Kas/Bank`}
      sub="Pemindahan saldo antar akun internal" onClose={onClose} onSave={onSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div className="form-section">
        <div className="form-row">
          <div className="field"><label>Tanggal *</label><input className="input" type="date" defaultValue="2026-04-30"/></div>
          <div className="field"><label>No. Bukti</label><input className="input mono" defaultValue={isEdit?data.no:`${kind.toUpperCase()}-2026-NEW`} readOnly/></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Dari Akun *</label>
            <select className="select" defaultValue={isEdit?data.dari:''}>
              <option value="">— Pilih —</option>
              {KAS_BANK_GIRO.filter(a=>a.tipe!=='GIRO').map(a => <option key={a.kode}>{a.nama}</option>)}
            </select>
          </div>
          <div className="field"><label>Ke Akun *</label>
            <select className="select" defaultValue={isEdit?data.ke:''}>
              <option value="">— Pilih —</option>
              {KAS_BANK_GIRO.filter(a=>a.tipe!=='GIRO').map(a => <option key={a.kode}>{a.nama}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>Nominal (Rp) *</label><input className="input mono" type="number" defaultValue={isEdit?data.nominal:''}/></div>
        <div className="field"><label>Deskripsi</label><textarea className="textarea" defaultValue={isEdit?data.deskripsi:''}/></div>
      </div>
    </AkModalShell>
  );
}

function GiroModal({ data, onClose, onSave, kind }) {
  const isEdit = !!data;
  return (
    <AkModalShell wide title={isEdit?`Edit Giro — ${data.no}`:`Giro ${kind==='gm'?'Masuk':'Keluar'} Baru`}
      sub={isEdit?`${data.dari||data.untuk} · ${data.noGiro}`:`Catat giro ${kind==='gm'?'masuk dari pelanggan':'keluar ke supplier'}`}
      onClose={onClose} onSave={onSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div className="form-grid-2" style={{gap:24}}>
        <div className="form-section">
          <h4>Detail Giro</h4>
          <div className="form-row">
            <div className="field"><label>Tanggal *</label><input className="input" type="date" defaultValue="2026-04-30"/></div>
            <div className="field"><label>No. Bukti</label><input className="input mono" defaultValue={isEdit?data.no:`${kind.toUpperCase()}-2026-NEW`} readOnly/></div>
          </div>
          <div className="field"><label>{kind==='gm'?'Dari Pelanggan':'Untuk Supplier'} *</label>
            <input className="input" defaultValue={isEdit?(data.dari||data.untuk):''}/>
          </div>
          <div className="form-row">
            <div className="field"><label>No. Giro *</label><input className="input mono" defaultValue={isEdit?data.noGiro:''} placeholder="BG-XXX-NNNNNNN"/></div>
            <div className="field"><label>Bank Penerbit</label>
              <select className="select" defaultValue={isEdit?data.bank:''}>
                <option value="">— Pilih —</option>
                <option>BCA</option><option>Mandiri</option><option>BRI</option><option>BNI</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field"><label>Tgl. Jatuh Tempo *</label><input className="input" type="date"/></div>
            <div className="field"><label>Nominal (Rp) *</label><input className="input mono" type="number" defaultValue={isEdit?data.nominal:''}/></div>
          </div>
          <div className="field"><label>Status Giro</label>
            <select className="select" defaultValue={isEdit?data.status:'Outstanding'}>
              <option>Outstanding</option><option>Cair</option><option>Tolak</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h4>Akun Bukukan</h4>
          <div className="field"><label>Akun {kind==='gm'?'Piutang Giro':'Hutang Giro'} *</label>
            <select className="select"><option value="">— Pilih —</option>{AKUN_BB.filter(a=>a.kode.startsWith('1020')||a.kode.startsWith('2010')).map(a => <option key={a.kode}>{a.kode} — {a.name}</option>)}</select>
          </div>
          <div className="field"><label>Akun Lawan</label>
            <select className="select"><option value="">— Pilih —</option>{AKUN_BB.map(a => <option key={a.kode}>{a.kode} — {a.name}</option>)}</select>
          </div>
          <div className="field"><label>Bank Pencairan (jika cair)</label>
            <select className="select"><option value="">— Pilih —</option>{KAS_BANK_GIRO.filter(a=>a.tipe==='BANK').map(a => <option key={a.kode}>{a.nama}</option>)}</select>
          </div>
          <div className="field"><label>Catatan</label><textarea className="textarea" placeholder="Catatan tambahan…"/></div>
        </div>
      </div>
    </AkModalShell>
  );
}

function PelunasanModal({ data, onClose, onSave, kind }) {
  const isEdit = !!data;
  const isPiutang = kind === 'pp';
  return (
    <AkModalShell wide title={isEdit?`Edit ${isPiutang?'Pelunasan Piutang':'Pelunasan Hutang'} — ${data.no}`:`Pelunasan ${isPiutang?'Piutang':'Hutang'} Baru`}
      sub={isEdit?(isPiutang?data.pelanggan:data.supplier):`Catat pelunasan ${isPiutang?'invoice penjualan':'bill supplier'}`}
      onClose={onClose} onSave={onSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div className="form-grid-2" style={{gap:24}}>
        <div className="form-section">
          <h4>Detail Pelunasan</h4>
          <div className="form-row">
            <div className="field"><label>Tanggal *</label><input className="input" type="date" defaultValue="2026-04-30"/></div>
            <div className="field"><label>No. Pelunasan</label><input className="input mono" defaultValue={isEdit?data.no:`${kind.toUpperCase()}-2026-NEW`} readOnly/></div>
          </div>
          <div className="field"><label>{isPiutang?'Pelanggan':'Supplier'} *</label>
            <input className="input" defaultValue={isEdit?(isPiutang?data.pelanggan:data.supplier):''}/>
          </div>
          <div className="field"><label>{isPiutang?'No. Invoice':'No. Bill'} *</label>
            <input className="input mono" defaultValue={isEdit?(data.noInvoice||data.noBill):''}/>
          </div>
          <div className="form-row">
            <div className="field"><label>Nominal Tagihan</label><input className="input mono" type="number" defaultValue={isEdit?(data.nominalInv||data.nominalBill):''} readOnly/></div>
            <div className="field"><label>Sisa Sebelum</label><input className="input mono" type="number" defaultValue={isEdit?(data.sisa+data.terbayar):''} readOnly/></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Nominal Dibayar *</label><input className="input mono" type="number" defaultValue={isEdit?data.terbayar:''}/></div>
            <div className="field"><label>Metode</label>
              <select className="select" defaultValue={isEdit?data.metode:''}>
                <option>Tunai</option><option>Bank Transfer</option><option>Giro</option><option>Pemotongan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Akun & Bukti</h4>
          <div className="field"><label>Akun Pembayaran *</label>
            <select className="select"><option value="">— Pilih akun kas/bank —</option>{KAS_BANK_GIRO.filter(a=>a.tipe!=='GIRO').map(a => <option key={a.kode}>{a.kode} — {a.nama}</option>)}</select>
          </div>
          <div className="field"><label>{isPiutang?'Akun Piutang':'Akun Hutang'}</label>
            <select className="select" defaultValue={isPiutang?'1015.000':'2000.000'}>
              {AKUN_BB.filter(a=>a.kode.startsWith(isPiutang?'1015':'2000')).map(a => <option key={a.kode}>{a.kode} — {a.name}</option>)}
            </select>
          </div>
          <div className="field"><label>No. Referensi Bukti</label><input className="input mono" placeholder="No. transfer / nomor giro"/></div>
          <div className="field"><label>Catatan</label><textarea className="textarea"/></div>
        </div>
      </div>
    </AkModalShell>
  );
}

function KbgModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  return (
    <AkModalShell title={isEdit?`Edit Akun — ${data.kode}`:'Tambah Akun Kas/Bank/Giro'} onClose={onClose} onSave={onSave}>
      <div className="form-section">
        <div className="form-row">
          <div className="field"><label>Kode Akun *</label><input className="input mono" defaultValue={isEdit?data.kode:''}/></div>
          <div className="field"><label>Tipe *</label>
            <select className="select" defaultValue={isEdit?data.tipe:''}>
              <option value="">— Pilih —</option><option>KAS</option><option>BANK</option><option>GIRO</option>
            </select>
          </div>
        </div>
        <div className="field"><label>Nama Akun *</label><input className="input" defaultValue={isEdit?data.nama:''}/></div>
        <div className="form-row">
          <div className="field"><label>Cabang</label><select className="select" defaultValue={isEdit?data.cabang:''}><option>Pusat</option><option>Surabaya</option><option>Bandung</option></select></div>
          <div className="field"><label>Currency</label><select className="select"><option>IDR</option><option>USD</option></select></div>
        </div>
        <div className="field"><label>No. Rekening</label><input className="input mono" defaultValue={isEdit?data.noRek||'':''}/></div>
        <div className="field"><label>Saldo Awal (Rp)</label><input className="input mono" type="number" defaultValue={isEdit?data.saldo:0}/></div>
      </div>
    </AkModalShell>
  );
}

function KeuanganPage({ activeSub, onSubChange, onNavigate }) {
  // State untuk accounting subs (dari modul Akuntan)
  const [akunRows, setAkunRows] = React.useState(AKUN_BB);
  const [aktivaRows, setAktivaRows] = React.useState(AKTIVA);
  const [jurnalRows, setJurnalRows] = React.useState(JURNAL_MEMO);
  const [labaRugiRows, setLabaRugiRows] = React.useState(LABA_RUGI);
  const [arusKasRows, setArusKasRows] = React.useState(ARUS_KAS);
  const [neracaRows, setNeracaRows] = React.useState(NERACA);

  const [modal, setModal] = React.useState(null);
  const close = () => setModal(null);
  const onSave = () => { setModal(null); window.__erpToast && window.__erpToast('Transaksi berhasil disimpan.'); };
  if (!activeSub) return <KeuanganDashboard onOpenSub={onSubChange} onNavigate={onNavigate} />;

  const subLabel = KU_SUBS.find(s=>s.id===activeSub)?.label
    || (typeof MODULE_SUBS !== 'undefined' ? MODULE_SUBS.keuangan?.find(s=>s.id===activeSub)?.label : null);
  const totalForKind = (kind) => {
    const sum = (arr) => arr.reduce((s,r)=>s+(r.nominal||r.terbayar||0),0);
    return ({
      km: sum(KAS_MASUK), kk: sum(KAS_KELUAR), bm: sum(BANK_MASUK), bk: sum(BANK_KELUAR),
      tm: sum(TRANSFER_MASUK), tk: sum(TRANSFER_KELUAR), gm: sum(GIRO_MASUK), gk: sum(GIRO_KELUAR),
      pp: sum(PELUNASAN_PIUTANG), ph: sum(PELUNASAN_HUTANG),
    })[kind] || 0;
  };

  const txMap = {
    km: { rows: KAS_MASUK,    cols: cashCols,     title:'Kas Masuk',     sub:`${KAS_MASUK.length} transaksi · Total ${fmtRp(totalForKind('km'))}`,    modalKind:'km' },
    kk: { rows: KAS_KELUAR,   cols: cashCols,     title:'Kas Keluar',    sub:`${KAS_KELUAR.length} transaksi · Total ${fmtRp(totalForKind('kk'))}`,   modalKind:'kk' },
    bm: { rows: BANK_MASUK,   cols: cashCols,     title:'Bank Masuk',    sub:`${BANK_MASUK.length} transaksi · Total ${fmtRp(totalForKind('bm'))}`,   modalKind:'bm' },
    bk: { rows: BANK_KELUAR,  cols: cashCols,     title:'Bank Keluar',   sub:`${BANK_KELUAR.length} transaksi · Total ${fmtRp(totalForKind('bk'))}`,  modalKind:'bk' },
    tm: { rows: TRANSFER_MASUK,  cols: transferCols, title:'Transfer Masuk antar Kas/Bank',  sub:`${TRANSFER_MASUK.length} transaksi`, modalKind:'tm' },
    tk: { rows: TRANSFER_KELUAR, cols: transferCols, title:'Transfer Keluar antar Kas/Bank', sub:`${TRANSFER_KELUAR.length} transaksi`, modalKind:'tk' },
    gm: { rows: GIRO_MASUK,   cols: giroCols,     title:'Giro Masuk',    sub:`${GIRO_MASUK.length} giro · ${GIRO_MASUK.filter(g=>g.status==='Outstanding').length} outstanding`, modalKind:'gm' },
    gk: { rows: GIRO_KELUAR,  cols: giroCols,     title:'Giro Keluar',   sub:`${GIRO_KELUAR.length} giro · ${GIRO_KELUAR.filter(g=>g.status==='Outstanding').length} outstanding`, modalKind:'gk' },
    pp: { rows: PELUNASAN_PIUTANG, cols: pelunasanCols('piutang'), title:'Pelunasan Piutang', sub:`${PELUNASAN_PIUTANG.length} pelunasan`, modalKind:'pp' },
    ph: { rows: PELUNASAN_HUTANG,  cols: pelunasanCols('hutang'),  title:'Pelunasan Hutang',  sub:`${PELUNASAN_HUTANG.length} pelunasan`,  modalKind:'ph' },
  };

  return (
    <div className="page" data-screen-label={`06 Keuangan — ${subLabel}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span>
        <a onClick={()=>onSubChange(null)} style={{cursor:'pointer'}}>Keuangan</a><span className="sep">/</span>
        <span className="current">{subLabel}</span>
      </div>

      {activeSub === 'kbg' && <KasBankGiro onAdd={()=>setModal({kind:'kbg'})} onEdit={(d)=>setModal({kind:'kbg', data:d})} />}
      {/* Accounting subs (dari modul Akuntan) */}
      {activeSub === 'akun'    && <KatalogAkunPage rows={akunRows} setRows={setAkunRows} />}
      {activeSub === 'aktiva'  && <AktivaPage rows={aktivaRows} setRows={setAktivaRows} />}
      {activeSub === 'jurnal'  && <JurnalMemorialPage rows={jurnalRows} setRows={setJurnalRows} akunRows={akunRows} />}
      {activeSub === 'labarugi' && <LaporanKeuanganPage reportId="labarugi" rows={labaRugiRows} setRows={setLabaRugiRows} />}
      {activeSub === 'aruskas' && <LaporanKeuanganPage reportId="aruskas" rows={arusKasRows} setRows={setArusKasRows} />}
      {activeSub === 'neraca'  && <LaporanKeuanganPage reportId="neraca" rows={neracaRows} setRows={setNeracaRows} />}
      {txMap[activeSub] && (
        <TxPage
          title={txMap[activeSub].title}
          sub={txMap[activeSub].sub}
          rows={txMap[activeSub].rows}
          columns={txMap[activeSub].cols}
          totalKey={['pp','ph'].includes(activeSub)?'terbayar':'nominal'}
          onAdd={()=>setModal({kind: txMap[activeSub].modalKind})}
          onEdit={(d)=>setModal({kind: txMap[activeSub].modalKind, data:d})}
        />
      )}

      {modal?.kind==='kbg' && <KbgModal data={modal.data} onClose={close} onSave={onSave}/>}
      {['km','kk','bm','bk'].includes(modal?.kind) && <CashModal     kind={modal.kind} data={modal.data} onClose={close} onSave={onSave}/>}
      {['tm','tk'].includes(modal?.kind)            && <TransferModal kind={modal.kind} data={modal.data} onClose={close} onSave={onSave}/>}
      {['gm','gk'].includes(modal?.kind)            && <GiroModal     kind={modal.kind} data={modal.data} onClose={close} onSave={onSave}/>}
      {['pp','ph'].includes(modal?.kind)            && <PelunasanModal kind={modal.kind} data={modal.data} onClose={close} onSave={onSave}/>}
    </div>
  );
}

window.KeuanganPage = KeuanganPage;
