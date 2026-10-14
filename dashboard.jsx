// Dashboard / module selector

// Root-cause redesign: `data` sekarang array `{x, y, display?}` (bukan angka polos) supaya hover
// bisa nunjukin label sumbu-X (tanggal/no. bukti) + nilai sumbu-Y sungguhan, bukan cuma garis
// statis. Dipakai di kpi-strip SEMUA dashboard (Home + 5 modul) — satu-satunya komponen chart
// interaktif di app ini (tidak ada chart library, murni SVG + mouse tracking).
function Spark({ data, color = 'var(--accent)' }) {
  const w = 100, h = 28;
  const svgRef = React.useRef(null);
  const [hoverIdx, setHoverIdx] = React.useState(null);
  if (!data || data.length === 0) return <svg className="spark" width="100%" height={h} viewBox={`0 0 ${w} ${h}`} />;

  const ys = data.map(d => d.y);
  const max = Math.max(...ys), min = Math.min(...ys);
  const pts = data.map((d, i) => ({
    x: (i / Math.max(1, data.length - 1)) * w,
    y: h - ((d.y - min) / Math.max(1, max - min)) * (h - 4) - 2,
  }));
  const ptsStr = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `0,${h} ${ptsStr} ${w},${h}`;

  const handleMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    setHoverIdx(Math.max(0, Math.min(data.length - 1, Math.round(relX * (data.length - 1)))));
  };

  const hp = hoverIdx != null ? pts[hoverIdx] : null;
  const hd = hoverIdx != null ? data[hoverIdx] : null;

  return (
    <div style={{position:'relative'}}>
      <svg ref={svgRef} className="spark" width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"
        style={{cursor:'crosshair', overflow:'visible'}}
        onMouseMove={handleMove} onMouseLeave={()=>setHoverIdx(null)}>
        <polygon points={area} fill={color} opacity=".12" />
        <polyline points={ptsStr} fill="none" stroke={color} strokeWidth="1.5" />
        {hp && <line x1={hp.x} y1="0" x2={hp.x} y2={h} stroke="var(--border-strong)" strokeWidth="0.6" strokeDasharray="1.5,1.5" />}
        {hp && <circle cx={hp.x} cy={hp.y} r="2" fill={color} stroke="#fff" strokeWidth="0.8" />}
      </svg>
      {hd && (
        <div className="spark-tooltip" style={{left:`${(hoverIdx/Math.max(1,data.length-1))*100}%`}}>
          <div className="spark-tooltip-y">{hd.display ?? hd.y}</div>
          <div className="spark-tooltip-x">{hd.x}</div>
        </div>
      )}
    </div>
  );
}

// Helper trend bersama (dipakai kpi-strip Home + 5 dashboard modul): urutkan `list` berdasarkan
// tanggal (dikonversi ke ISO dulu via `isoFn` kalau formatnya bukan ISO, mis. DD-MM-YYYY di
// Manufaktur/Keuangan), lalu kumulatifkan `valueFn(row)` per baris — pola identik cara Home
// menghitung omset kumulatif sebelumnya, cuma diekstrak jadi reusable. `labelFn` opsional utk
// label sumbu-X tooltip (default pakai tanggalnya sendiri).
function cumulativeTrend(list, dateKey, valueFn, opts = {}) {
  const isoFn = opts.isoFn || (d => d);
  const labelFn = opts.labelFn || (r => r[dateKey]);
  const displayFn = opts.displayFn || null;
  const sorted = list.slice().sort((a,b) => isoFn(a[dateKey]||'').localeCompare(isoFn(b[dateKey]||'')));
  let run = 0;
  return sorted.map(r => { run += valueFn(r); return { x: labelFn(r), y: run, display: displayFn ? displayFn(run) : undefined }; });
}

function Tile({ icon, title, desc, badge, badgeKind = 'info', count, accentColor, onClick }) {
  return (
    <button className="tile" onClick={onClick}>
      <div className="tile-head">
        <div className="tile-icon-wrap" style={accentColor ? { background: accentColor + '14', color: accentColor } : null}>
          {icon}
        </div>
        {badge && <span className={`tile-badge ${badgeKind === 'pulse' ? 'pulse' : ''}`}>{badge}</span>}
      </div>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      {count != null && (
        <div className="tile-foot"><b style={{color:'var(--text-2)', fontWeight:600}}>{count}</b> action items {I.arrowR(11)}</div>
      )}
    </button>
  );
}

function Dashboard({ onOpenList }) {
  return (
    <div className="page" data-screen-label="01 Dashboard">
      <div className="crumbs">
        <a>Home</a><span className="sep">/</span>
        <span className="current">Purchase</span>
      </div>

      <div className="page-head">
        <div>
          <h1>Purchasing Workspace</h1>
          <div className="sub">Selamat datang kembali, Administrator. Berikut ringkasan pembelian Anda hari ini.</div>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi">
          <div className="lbl">Open POs</div>
          <div className="val mono">63</div>
          <div className="delta up">▲ 8.4% <span className="muted" style={{marginLeft:4}}>vs last week</span></div>
          <Spark data={[12,14,11,18,16,22,19,24,21,28]} />
        </div>
        <div className="kpi">
          <div className="lbl">Goods Receipts pending</div>
          <div className="val mono">17</div>
          <div className="delta down">▼ 3.1%</div>
          <Spark data={[22,20,19,21,18,17,15,18,16,17]} color="var(--realisasi)" />
        </div>
        <div className="kpi">
          <div className="lbl">Outstanding to Suppliers</div>
          <div className="val mono">{fmtRp(1284500000)}</div>
          <div className="delta up">▲ 2.1%</div>
          <Spark data={[8,9,11,10,12,11,13,12,14,13]} color="#a16207" />
        </div>
        <div className="kpi">
          <div className="lbl">On-time Realisasi (30d)</div>
          <div className="val mono">94.2<span style={{fontSize:14, color:'var(--text-3)', fontWeight:500}}>%</span></div>
          <div className="delta up">▲ 1.8 pp</div>
          <Spark data={[88,90,89,91,92,90,93,94,93,94]} color="var(--realisasi)" />
        </div>
      </div>

      <h3 className="section-title">Modul Purchase <span className="count">4</span></h3>
      <div className="tile-grid">
        <Tile
          icon={I.list(20)}
          title="Purchase Orders"
          desc="Buat, kelola, dan setujui order pembelian ke supplier."
          badge="63 POs to review"
          badgeKind="pulse"
          count="63"
          onClick={onOpenList}
        />
        <Tile
          icon={I.truck(20)}
          title="Goods Receipt"
          desc="Catat penerimaan barang dari supplier dan reconcile dengan PO."
          badge="17 pending"
          badgeKind="pulse"
          count="17"
        />
        <Tile
          icon={I.invoice(20)}
          title="Supplier Invoices"
          desc="Match invoice ke GR & PO, kelola pembayaran dan jatuh tempo."
          badge="9 to match"
          accentColor="#0d9488"
        />
        <Tile
          icon={I.zoom(20)}
          title="Monitor PO Items"
          desc="Lacak status realisasi tiap item, identifikasi keterlambatan."
          accentColor="#7c3aed"
        />
        <Tile
          icon={I.users(20)}
          title="Supplier Catalog"
          desc="Master data pemasok, kontrak, syarat pembayaran."
          accentColor="#0369a1"
        />
        <Tile
          icon={I.refresh(20)}
          title="Returns / Retur"
          desc="Catat retur pembelian dan klaim ke supplier."
          accentColor="#b45309"
        />
        <Tile
          icon={I.chart(20)}
          title="Purchase Analytics"
          desc="Spend analysis, supplier performance, kategori."
          accentColor="#1d4ed8"
        />
        <Tile
          icon={I.settings(20)}
          title="Pengaturan Modul"
          desc="Workflow approval, kategori, penomoran dokumen."
          accentColor="#6b7280"
        />
      </div>

      <div className="dash-two-col" style={{marginTop:32}}>
        <div className="panel">
          <h3>Aktivitas Terkini</h3>
          <div className="timeline">
            <div className="timeline-item done">
              <div className="ti-when">Hari ini · 14:22</div>
              <div className="ti-what"><b className="ti-who">Andi P.</b> menyetujui <a className="cell-link" onClick={onOpenList}>PO-2026-0631</a> · {fmtRp(18450000)}</div>
            </div>
            <div className="timeline-item done">
              <div className="ti-when">Hari ini · 13:08</div>
              <div className="ti-what"><b className="ti-who">Sistem</b> menerima realisasi penuh untuk <a className="cell-link" onClick={onOpenList}>PO-2026-0625</a> dari PT Indo Ban Prima</div>
            </div>
            <div className="timeline-item">
              <div className="ti-when">Hari ini · 11:45</div>
              <div className="ti-what"><b className="ti-who">Rini K.</b> membuat draft order untuk CV Bengkel Sentosa</div>
            </div>
            <div className="timeline-item">
              <div className="ti-when">Kemarin · 17:30</div>
              <div className="ti-what"><b className="ti-who">Sistem</b> mengirim 3 reminder jatuh tempo ke supplier</div>
            </div>
            <div className="timeline-item">
              <div className="ti-when">Kemarin · 09:12</div>
              <div className="ti-what"><b className="ti-who">Budi S.</b> mengupdate harga 14 item katalog</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3>Top Suppliers (30 Hari)</h3>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {[
              ['PT Indo Ban Prima',       182400000, 92],
              ['CV Sumber Mesin Jaya',    154200000, 78],
              ['PT Auto Parts Nusantara', 128900000, 65],
              ['PT Karya Otomotif',        91250000, 46],
              ['PT Mandiri Lighting',      54100000, 27],
            ].map(([name, val, pct]) => (
              <div key={name}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:5}}>
                  <span>{name}</span>
                  <span className="mono muted">{fmtRp(val)}</span>
                </div>
                <div style={{height:6, background:'var(--bg-sub)', borderRadius:999, overflow:'hidden'}}>
                  <div style={{height:'100%', width:pct+'%', background:'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius:999}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home Dashboard — menu modul (tanpa KPI/grafik, versi demo CPI/MJM) ─────
function HomeDashboard({ onNavigate, session }) {
  const modules = [
    { id:'pembelian',   label:'Pembelian',    icon:I.truck(22),    color:'#0ea5e9', kpi:`${PB_PO.filter(p=>!p.Batal).length} PO aktif`, desc:'Purchase request, RFQ, PO, nota & retur beli' },
    { id:'sales',       label:'Penjualan',    icon:I.users(22),    color:'#10b981', kpi:`${PJ_PELANGGAN.filter(p=>p.status!=='Non-aktif').length} pelanggan aktif`, desc:'Konfirmasi order, SO, DO, invoice & retur' },
    { id:'barang',      label:'Barang',       icon:I.box(22),      color:'#f59e0b', kpi:`${BARANG_LAIN.filter(b=>b.aktif).length + BAHAN_BAKU.filter(b=>b.aktif).length + BARANG_JADI.filter(b=>b.aktif).length} item aktif`, desc:'Barang, bahan baku, mutasi & stock opname' },
    { id:'keuangan',    label:'Keuangan',     icon:I.bank(22),     color:'#8b5cf6', kpi:'Akuntansi & kas/bank', desc:'Akun, jurnal, laporan keuangan, kas, bank & giro' },
    { id:'laporan',     label:'Laporan',      icon:I.chart(22),    color:'#0891b2', kpi:'Stok, piutang/hutang & komisi', desc:'Kartu & rekap stok, piutang/hutang, komisi salesman' },
    { id:'kataloglain', label:'Katalog Lain', icon:I.layers(22),   color:'#0369a1', kpi:'Data pendukung',      desc:'Katalog & master data pendukung lainnya' },
    { id:'pengaturan',  label:'Pengaturan',   icon:I.settings(22), color:'#6b7280', kpi:'Konfigurasi sistem',  desc:'Preferensi & konfigurasi aplikasi' },
  ];

  return (
    <div className="page" data-screen-label="Home — Dashboard">
      <div className="page-head">
        <div>
          <h1>Selamat Datang, Administrator</h1>
          <div className="sub">{session?.perusahaan || 'PT. Pacific Data Jaya'} — ringkasan operasional hari ini, {new Date().toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</div>
        </div>
        <button className="btn btn-sm">{I.refresh()} Refresh</button>
      </div>

      <h3 className="section-title">Modul Utama <span className="count">{modules.length}</span></h3>
      <div className="tile-grid">
        {modules.map(m => (
          <button key={m.id} className="tile" onClick={()=>onNavigate(m.id)}>
            <div className="tile-head">
              <div className="tile-icon-wrap" style={{background:m.color+'14', color:m.color}}>{m.icon}</div>
            </div>
            <div>
              <h3>{m.label}</h3>
              <p>{m.desc}</p>
            </div>
            <div className="tile-foot">
              <b style={{color:'var(--text-2)', fontWeight:600}}>{m.kpi}</b> {I.arrowR(11)}
            </div>
          </button>
        ))}
      </div>

      <div className="panel" style={{marginTop:32}}>
        <h3>Aktivitas Terkini (Semua Modul)</h3>
        <div className="timeline">
          <div className="timeline-item done">
            <div className="ti-when">Hari ini · 14:22</div>
            <div className="ti-what"><b className="ti-who">Andi P.</b> menyetujui PO-2026-0631 · Purchase</div>
          </div>
          <div className="timeline-item done">
            <div className="ti-when">Hari ini · 13:08</div>
            <div className="ti-what"><b className="ti-who">Rini K.</b> memulai stock opname SO26040002 · Inventory</div>
          </div>
          <div className="timeline-item done">
            <div className="ti-when">Hari ini · 11:45</div>
            <div className="ti-what"><b className="ti-who">Kevin H.</b> input kas masuk KM-2026-0412 · Cash &amp; Bank</div>
          </div>
          <div className="timeline-item">
            <div className="ti-when">Kemarin · 17:30</div>
            <div className="ti-what"><b className="ti-who">Brandon</b> membuat nota penjualan NJ-2026-0388 · Pelanggan</div>
          </div>
          <div className="timeline-item">
            <div className="ti-when">Kemarin · 09:12</div>
            <div className="ti-what"><b className="ti-who">Sistem</b> mendeteksi 4 item barang di bawah min stock · Inventory</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
window.HomeDashboard = HomeDashboard;
