// Keuangan — komponen & helper bersama untuk sub-modul Kas/Bank/Giro/Transfer/Pelunasan (TxPage
// generik, kolom tabel, dan 5 modal transaksi).
//
// Root-cause fix (disatukan dengan modularisasi): 5 modal di bawah ini (CashModal/TransferModal/
// GiroModal/PelunasanModal/KbgModal) SEBELUMNYA cuma pakai <input defaultValue=...> (uncontrolled,
// tidak ada React state sama sekali) dan tombol Simpan di AkModalShell cuma `onClick={onSave}` —
// jadi walau "Simpan" ditekan, tidak ada data field yang benar-benar terbaca/tersimpan (beda dari
// AkunBBModal/AktivaModal/JurnalModal yang sudah py form state asli). Di sini semua field diubah
// jadi controlled (value+onChange lewat React.useState) dan tiap modal membangun objek `form` asli
// lalu memanggil onSave(form) — sama pola dengan modal2 lain di seluruh app ini.

// ─── Generic Transaction Page Builder ───────────────────────────────────────

function TxPage({ title, sub, rows, columns, onAdd, onEdit, onCancelDoc, onCetak, onCetakRow, totalKey, totalLabel='Total', extraTotals=[] }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const totalAmt = filtered.reduce((s,r)=>s+(+r[totalKey]||0),0);
  // Root-cause fix: sebelumnya row-action cuma Edit+Print, tidak ada delete/cancel sama sekali di
  // 9 halaman transaksi Keuangan — beda dari modul transaksi lain (Pembelian/Penjualan/Manufaktur)
  // yang semua sudah punya "Batalkan Transaksi" soft-cancel. Pola ditiru persis dari
  // PbDocList.jsx (isCancelled + tombol I.fileX disabled kalau sudah batal).
  const isCancelled = (r) => !!(r.Batal || r.status === 'Batal');
  return (
    <>
      <div className="page-head">
        <div><h1>{title}</h1><div className="sub">{sub}</div></div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-sm">{I.refresh()} Refresh</button>
          <button className="btn btn-sm">{I.download()} Export</button>
          {onCetak && <button className="btn btn-sm" onClick={onCetak}>{I.print()} Cetak</button>}
          {onAdd && <button className="btn btn-primary" onClick={onAdd}>{I.plus()} {title} Baru</button>}
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field"><label>Periode</label><input className="input" type="month" defaultValue="2026-04"/></div>
          <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No., nama, atau deskripsi…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
          <div className="field"><label>Status</label><select className="select"><option>Semua</option><option>Posted</option><option>Pending</option><option>Draft</option></select></div>
          <div className="filter-actions"><button className="btn">Reset</button><button className="btn">{I.filter()} Cari</button></div>
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
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit && onEdit(r)}>{I.edit()}</button>
                      {onCancelDoc && (
                        <button className="btn btn-icon btn-sm del" title={isCancelled(r) ? 'Sudah dibatalkan' : 'Batalkan Transaksi'} disabled={isCancelled(r)} onClick={()=>onCancelDoc(r)}>{I.fileX(14)}</button>
                      )}
                      <button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>onCetakRow ? onCetakRow(r) : (window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.'))}>{I.print()}</button>
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
// Root-cause fix: 'Tolak' dulu di-map ke class 'cancel', tapi styles.css cuma punya .pill.cancelled
// (bukan .pill.cancel) — jadi "Tolak" render tanpa styling sama sekali. 'Batal' ditambahkan di sini
// juga (dipakai tombol "Batalkan Transaksi" baru di TxPage) supaya baris yang dibatalkan langsung
// dapat pill merah yang benar, bukan fallback abu-abu 'draft'.
const stPill = (s) => {
  const map = { Posted:'realisasi', Lunas:'realisasi', Cair:'realisasi', Pending:'pending', Outstanding:'pending', Sebagian:'pending', Draft:'draft', Tolak:'cancelled', Batal:'cancelled' };
  return <span className={`pill ${map[s] || 'draft'}`}>{s}</span>;
};

// No. Bukti generator — pola sama akNextLaporanNo/akNextJurnalNo (cari nomor urut terbesar yang
// sudah ada, +1). Semua No. Bukti Kas/Bank/Giro/Pelunasan pakai format PREFIX-2026-NNNN.
function kuNextNo(rows, prefix) {
  const nums = rows.map(r => parseInt((r.no.match(/(\d+)$/) || [])[1] || '0', 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-2026-${String(next).padStart(4,'0')}`;
}

// No. Bukti khusus Uang Muka BARU (tombol "Tambah Uang Muka" di PelunasanModal) — beda sumber dari
// kuNextNo (bukan dari `rows` transaksi, tapi dari `saldoItems`, format 'UM-2026-NNNN' [Piutang] /
// 'UM-B-2026-NNNN' [Hutang] — lihat SALDO_PIUTANG_ITEMS/SALDO_HUTANG_ITEMS di data/saldo.data.jsx).
function kuNextUmNo(saldoItems, isPiutang) {
  const prefix = isPiutang ? 'UM' : 'UM-B';
  const nums = saldoItems.filter(it => it.jenis === 'Uang Muka')
    .map(it => parseInt((it.noBukti.match(/(\d+)$/) || [])[1] || '0', 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-2026-${String(next).padStart(4,'0')}`;
}

// Input angka dengan pemisah ribuan (format id-ID, titik) — dipakai semua field nominal/debet/
// kredit/masuk/keluar di modul Keuangan. `display` diturunkan langsung dari prop `value` tiap
// render (bukan state internal terpisah) supaya tidak ada resiko divergensi dgn parent; ketik
// menghapus non-digit dan mengirim angka mentah (atau '' saat kosong) balik ke onChange.
function NumInput({ value, onChange, className='input', style, placeholder, disabled }) {
  const display = (value === '' || value === null || value === undefined) ? '' : Number(value).toLocaleString('id-ID');
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    onChange(raw === '' ? '' : +raw);
  };
  return <input type="text" inputMode="numeric" className={className} style={style} placeholder={placeholder} disabled={disabled} value={display} onChange={handleChange}/>;
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
  { key:'partner', label: kind==='piutang'?'Pelanggan':'Supplier', render: r => kind==='piutang' ? r.namaCust : r.namaSupp },
  { key:'noReferensi', label:'No. Referensi', render: r => r.noReferensi || <span className="muted">—</span> },
  { key:'jmlItem', label:'Jml Item', cls:'num mono', render: r => r.items?.length || 0 },
  { key:'total', label:'Total Pelunasan', cls:'num mono', render: r => <span style={{fontWeight:600}}>{fmtRp(r.total)}</span> },
  { key:'status', label:'Status', render: r => stPill(r.status) },
];

// ─── Modal: Cash/Bank Transaction ───────────────────────────────────────────

function CashModal({ data, onClose, onSave, kind, rows }) {
  const labels = {
    km: { title:'Kas Masuk',     partner:'Diterima Dari',  partnerVal:'dari'  },
    kk: { title:'Kas Keluar',    partner:'Dibayar Kepada', partnerVal:'untuk' },
    bm: { title:'Bank Masuk',    partner:'Diterima Dari',  partnerVal:'dari'  },
    bk: { title:'Bank Keluar',   partner:'Dibayar Kepada', partnerVal:'untuk' },
  }[kind];
  const isEdit = !!data;
  const [tgl, setTgl] = React.useState(data?.tgl ? akToIso(data.tgl) : '2026-04-30');
  const [partner, setPartner] = React.useState(data ? data[labels.partnerVal] : '');
  const [akun, setAkun] = React.useState(data?.akun || '');
  const [nominal, setNominal] = React.useState(data?.nominal ?? '');
  const [deskripsi, setDeskripsi] = React.useState(data?.deskripsi || '');
  const [status, setStatus] = React.useState(data?.status || 'Draft');

  const handleSave = () => {
    onSave({
      tgl: akFromIso(tgl) || data?.tgl || '',
      no: isEdit ? data.no : kuNextNo(rows, kind.toUpperCase()),
      [labels.partnerVal]: partner,
      deskripsi, akun, nominal: +nominal || 0, status,
    });
  };

  return (
    <AkModalShell wide
      title={isEdit?`Edit ${labels.title} — ${data.no}`:`${labels.title} Baru`}
      sub={isEdit ? data.deskripsi : `Catat transaksi ${labels.title.toLowerCase()} baru`}
      onClose={onClose} onSave={handleSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        <div className="form-section">
          <h4>Header Transaksi</h4>
          <div className="form-row">
            <div className="field"><label>Tanggal *</label><input className="input" type="date" value={tgl} onChange={e=>setTgl(e.target.value)}/></div>
            <div className="field"><label>No. Bukti</label><input className="input mono" value={isEdit?data.no:'Otomatis saat disimpan'} readOnly/></div>
          </div>
          <div className="field"><label>{labels.partner} *</label><input className="input" value={partner} onChange={e=>setPartner(e.target.value)} placeholder="Nama partner / pihak ketiga"/></div>
          <div className="field"><label>Akun {kind.startsWith('k')?'Kas':'Bank'} *</label>
            <select className="select" value={akun} onChange={e=>setAkun(e.target.value)}>
              <option value="">— Pilih akun —</option>
              {KAS_BANK_GIRO.filter(a => kind.startsWith('k') ? a.tipe==='KAS' : a.tipe==='BANK').map(a => (
                <option key={a.kode} value={a.nama}>{a.kode} — {a.nama} (saldo {fmtRp(a.saldo)})</option>
              ))}
            </select>
          </div>
          <div className="field"><label>Nominal (Rp) *</label><NumInput className="input mono" value={nominal} onChange={setNominal}/></div>
          <div className="field"><label>Status</label>
            <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
              <option>Draft</option><option>Pending</option><option>Posted</option>
            </select>
          </div>
          <div className="field"><label>Deskripsi</label><textarea className="textarea" value={deskripsi} onChange={e=>setDeskripsi(e.target.value)}/></div>
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
                  <td className="num mono" style={{padding:'8px 4px'}}>{nominal?fmtRp(+nominal):'Rp 0'}</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>—</td>
                </tr>
                <tr>
                  <td style={{padding:'8px 4px'}}>{kind.endsWith('m') ? 'Akun Lawan' : `Akun ${kind.startsWith('k')?'Kas':'Bank'}`}</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>—</td>
                  <td className="num mono" style={{padding:'8px 4px'}}>{nominal?fmtRp(+nominal):'Rp 0'}</td>
                </tr>
              </tbody>
            </table>
            <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--border)', fontSize:11.5, color:'var(--text-3)', display:'flex', justifyContent:'space-between'}}>
              <span>Status</span><span className="pill draft">{status}</span>
            </div>
          </div>
        </div>
      </div>
    </AkModalShell>
  );
}

function TransferModal({ data, onClose, onSave, kind, rows }) {
  const isEdit = !!data;
  const [tgl, setTgl] = React.useState(data?.tgl ? akToIso(data.tgl) : '2026-04-30');
  const [dari, setDari] = React.useState(data?.dari || '');
  const [ke, setKe] = React.useState(data?.ke || '');
  const [nominal, setNominal] = React.useState(data?.nominal ?? '');
  const [deskripsi, setDeskripsi] = React.useState(data?.deskripsi || '');
  const [status, setStatus] = React.useState(data?.status || 'Draft');

  const handleSave = () => onSave({
    tgl: akFromIso(tgl) || data?.tgl || '',
    no: isEdit ? data.no : kuNextNo(rows, kind.toUpperCase()),
    dari, ke, deskripsi, nominal: +nominal || 0, status,
  });

  return (
    <AkModalShell title={isEdit?`Edit Transfer — ${data.no}`:`Transfer ${kind==='tm'?'Masuk':'Keluar'} antar Kas/Bank`}
      sub="Pemindahan saldo antar akun internal" onClose={onClose} onSave={handleSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div className="form-section">
        <div className="form-row">
          <div className="field"><label>Tanggal *</label><input className="input" type="date" value={tgl} onChange={e=>setTgl(e.target.value)}/></div>
          <div className="field"><label>No. Bukti</label><input className="input mono" value={isEdit?data.no:'Otomatis saat disimpan'} readOnly/></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Dari Akun *</label>
            <select className="select" value={dari} onChange={e=>setDari(e.target.value)}>
              <option value="">— Pilih —</option>
              {KAS_BANK_GIRO.filter(a=>a.tipe!=='GIRO').map(a => <option key={a.kode}>{a.nama}</option>)}
            </select>
          </div>
          <div className="field"><label>Ke Akun *</label>
            <select className="select" value={ke} onChange={e=>setKe(e.target.value)}>
              <option value="">— Pilih —</option>
              {KAS_BANK_GIRO.filter(a=>a.tipe!=='GIRO').map(a => <option key={a.kode}>{a.nama}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label>Nominal (Rp) *</label><NumInput className="input mono" value={nominal} onChange={setNominal}/></div>
        <div className="field"><label>Status</label>
          <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
            <option>Draft</option><option>Pending</option><option>Posted</option>
          </select>
        </div>
        <div className="field"><label>Deskripsi</label><textarea className="textarea" value={deskripsi} onChange={e=>setDeskripsi(e.target.value)}/></div>
      </div>
    </AkModalShell>
  );
}

function GiroModal({ data, onClose, onSave, kind, rows }) {
  const isEdit = !!data;
  const partnerKey = kind==='gm' ? 'dari' : 'untuk';
  const [tgl, setTgl] = React.useState(data?.tgl ? akToIso(data.tgl) : '2026-04-30');
  const [partner, setPartner] = React.useState(data ? (data.dari||data.untuk) : '');
  const [noGiro, setNoGiro] = React.useState(data?.noGiro || '');
  const [bank, setBank] = React.useState(data?.bank || '');
  const [jthTempo, setJthTempo] = React.useState(data?.jthTempo ? akToIso(data.jthTempo) : '');
  const [nominal, setNominal] = React.useState(data?.nominal ?? '');
  const [status, setStatus] = React.useState(data?.status || 'Outstanding');

  const handleSave = () => onSave({
    tgl: akFromIso(tgl) || data?.tgl || '',
    no: isEdit ? data.no : kuNextNo(rows, kind.toUpperCase()),
    [partnerKey]: partner, noGiro, bank, jthTempo: akFromIso(jthTempo), nominal: +nominal || 0, status,
  });

  return (
    <AkModalShell wide title={isEdit?`Edit Giro — ${data.no}`:`Giro ${kind==='gm'?'Masuk':'Keluar'} Baru`}
      sub={isEdit?`${data.dari||data.untuk} · ${data.noGiro}`:`Catat giro ${kind==='gm'?'masuk dari pelanggan':'keluar ke supplier'}`}
      onClose={onClose} onSave={handleSave}
      saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
        <div className="form-section">
          <h4>Detail Giro</h4>
          <div className="form-row">
            <div className="field"><label>Tanggal *</label><input className="input" type="date" value={tgl} onChange={e=>setTgl(e.target.value)}/></div>
            <div className="field"><label>No. Bukti</label><input className="input mono" value={isEdit?data.no:'Otomatis saat disimpan'} readOnly/></div>
          </div>
          <div className="field"><label>{kind==='gm'?'Dari Pelanggan':'Untuk Supplier'} *</label>
            <input className="input" value={partner} onChange={e=>setPartner(e.target.value)}/>
          </div>
          <div className="form-row">
            <div className="field"><label>No. Giro *</label><input className="input mono" value={noGiro} onChange={e=>setNoGiro(e.target.value)} placeholder="BG-XXX-NNNNNNN"/></div>
            <div className="field"><label>Bank Penerbit</label>
              <select className="select" value={bank} onChange={e=>setBank(e.target.value)}>
                <option value="">— Pilih —</option>
                <option>BCA</option><option>Mandiri</option><option>BRI</option><option>BNI</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field"><label>Tgl. Jatuh Tempo *</label><input className="input" type="date" value={jthTempo} onChange={e=>setJthTempo(e.target.value)}/></div>
            <div className="field"><label>Nominal (Rp) *</label><NumInput className="input mono" value={nominal} onChange={setNominal}/></div>
          </div>
          <div className="field"><label>Status Giro</label>
            <select className="select" value={status} onChange={e=>setStatus(e.target.value)}>
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

// ─── Popup: pilih Nota/Uang Muka/Retur (sisa saldo partner terpilih) ────────
// Pola sama dengan ItemPickerModal (components.jsx) / MfPilihBarangModal (manufaktur) — checkbox
// multi-select, search, footer "{N} dipilih" + Batal + "Pilih (N)".
function SaldoPickerModal({ items, onConfirm, onCancel }) {
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({});
  const filtered = items.filter(it => !q || it.noBukti.toLowerCase().includes(q.toLowerCase()) || it.jenis.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setSelected(prev => { const next = {...prev}; if (next[id]) delete next[id]; else next[id] = true; return next; });
  const selectedCount = Object.keys(selected).length;
  const handleConfirm = () => onConfirm(items.filter(it => selected[it.id]));

  return (
    <div className="modal-backdrop">
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Pilih Nota / Uang Muka</h2><div className="sub">Centang satu atau lebih untuk dimasukkan ke tabel Pelunasan.</div></div>
          <button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div className="input-w-icon" style={{marginBottom:12}}>{I.search(14)}<input className="input" placeholder="Cari No. Bukti atau Jenis…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <div className="line-items picker-table" style={{height:420, overflowY:'auto'}}>
            <table style={{minWidth:0}}>
              <thead>
                <tr>
                  <th style={{width:44, textAlign:'center'}}></th>
                  <th>Jenis</th><th>No. Bukti</th><th>Tanggal</th><th>Jth. Tempo</th>
                  <th className="num">Nilai</th><th className="num">Sisa</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={7} className="empty">Tidak ada sisa nota/uang muka untuk partner ini.</td></tr>}
                {filtered.map(it => (
                  <tr key={it.id} style={{cursor:'pointer'}} onClick={()=>toggle(it.id)}>
                    <td onClick={e=>e.stopPropagation()} style={{textAlign:'center'}}><input type="checkbox" className="cb" checked={!!selected[it.id]} onChange={()=>toggle(it.id)}/></td>
                    <td>{it.jenis}</td>
                    <td className="mono">{it.noBukti}</td>
                    <td className="mono">{it.tgl}</td>
                    <td className="mono">{it.jthTempo || '—'}</td>
                    <td className="num mono">{fmtRp(it.nilai)}</td>
                    <td className="num mono" style={{fontWeight:600}}>{fmtRp(it.sisa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>{selectedCount} dipilih</div>
          <div className="right" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn" onClick={onCancel}>Batal</button>
            <button className="btn btn-primary" disabled={selectedCount===0} onClick={handleConfirm}>Pilih ({selectedCount})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Tambah Uang Muka (dari dalam PelunasanModal) ────────────────────
// Beda dari SaldoPickerModal (pilih SISA Nota/Uang Muka/Retur yang SUDAH ADA): ini bikin Uang Muka
// BARU — mengisi 1 baris Kredit di Tabel Pelunasan (uang masuk yang belum dipakai bayar Nota mana
// pun) + 1 baris Tabel Penerimaan sekaligus (metode Tunai/Transfer/Giro yg dipakai partner utk
// nyetor uang muka itu), supaya kedua tabel tetap balance tanpa langkah manual "Tambah Metode"
// terpisah. Setelah Simpan (lihat savePelunasan di KeuanganPage.jsx), baris Uang Muka ini dipersist
// ke SALDO_PIUTANG_ITEMS/SALDO_HUTANG_ITEMS supaya bisa dipilih lewat SaldoPickerModal di pelunasan
// berikutnya.
function TambahUangMukaModal({ onConfirm, onCancel }) {
  const [nominal, setNominal] = React.useState('');
  const [metode, setMetode] = React.useState('Tunai');
  const [kodeAkun, setKodeAkun] = React.useState('');
  const [noGiro, setNoGiro] = React.useState('');
  const [jthTempoGiro, setJthTempoGiro] = React.useState('');
  const akun = KAS_BANK_GIRO.find(a => a.kode === kodeAkun);
  const valid = (+nominal || 0) > 0 && !!kodeAkun && (metode !== 'Giro' || (noGiro && jthTempoGiro));

  const handleConfirm = () => onConfirm({ nominal:+nominal||0, metode, kodeAkun, namaAkun: akun?akun.nama:'', noGiro, jthTempoGiro });

  return (
    <AkModalShell title="Tambah Uang Muka" sub="Ditambahkan sekaligus ke Tabel Pelunasan (Kredit) & Tabel Penerimaan."
      onClose={onCancel} onSave={handleConfirm} saveLabel="Tambahkan" saveDisabled={!valid} maxWidth={460}>
      <div className="field">
        <label>Nominal Uang Muka <span style={{color:'var(--danger)'}}>*</span></label>
        <NumInput className="input" value={nominal} onChange={setNominal} placeholder="0"/>
      </div>
      <div className="field" style={{marginTop:12}}>
        <label>Metode Pembayaran <span style={{color:'var(--danger)'}}>*</span></label>
        <select className="select" value={metode} onChange={e=>{ setMetode(e.target.value); setKodeAkun(''); }}>
          <option>Tunai</option><option>Transfer</option><option>Giro</option>
        </select>
      </div>
      <div className="field" style={{marginTop:12}}>
        <label>Akun {metode==='Tunai'?'Kas':metode==='Transfer'?'Bank':'Giro'} <span style={{color:'var(--danger)'}}>*</span></label>
        <select className="select" value={kodeAkun} onChange={e=>setKodeAkun(e.target.value)}>
          <option value="">— Pilih Akun —</option>
          {KAS_BANK_GIRO.filter(a => metode==='Tunai' ? a.tipe==='KAS' : metode==='Transfer' ? a.tipe==='BANK' : a.tipe==='GIRO').map(a => (
            <option key={a.kode} value={a.kode}>{a.nama}</option>
          ))}
        </select>
      </div>
      {metode === 'Giro' && (
        <div className="form-row" style={{marginTop:12}}>
          <div className="field"><label>No. Giro <span style={{color:'var(--danger)'}}>*</span></label><input className="input mono" value={noGiro} onChange={e=>setNoGiro(e.target.value)}/></div>
          <div className="field"><label>Jth. Tempo Giro <span style={{color:'var(--danger)'}}>*</span></label><input className="input" type="date" value={jthTempoGiro} onChange={e=>setJthTempoGiro(e.target.value)}/></div>
        </div>
      )}
    </AkModalShell>
  );
}

// ─── Modal: Pelunasan Piutang/Hutang ────────────────────────────────────────
// Root-cause fix + rombak total: sebelumnya 1 pelunasan = 1 invoice, field Pelanggan/No.Invoice
// teks bebas (tidak nyambung ke data nyata), beberapa field malah dibuang diam-diam saat Simpan.
// Sekarang: pilih partner nyata (PJ_PELANGGAN/PB_SUPPLIER) → pilih sisa Nota/Uang Muka/Retur lewat
// popup SaldoPickerModal (data-nya dari SALDO_PIUTANG_ITEMS/SALDO_HUTANG_ITEMS, lihat
// modules/keuangan/data/saldo.data.jsx) → isi tabel Penerimaan sampai balance (pola saveDisabled
// sama seperti balance-check debit/kredit di JurnalModal, modules/keuangan/pages/JurnalMemorialPage.jsx).
// Mode Edit sengaja dibatasi cuma No. Referensi & Catatan yang bisa diubah — tabel Pelunasan/
// Penerimaan sudah "mengunci" konsumsi sisa nota, ubah-total di tempat butuh alur batalkan+ulang
// (di luar cakupan redesign ini).
function PelunasanModal({ data, onClose, onSave, kind, rows, saldoItems, partnerList }) {
  const isEdit = !!data;
  const isPiutang = kind === 'pp';
  const [tgl, setTgl] = React.useState(data?.tgl ? akToIso(data.tgl) : '2026-07-25');
  const [noReferensi, setNoReferensi] = React.useState(data?.noReferensi || '');
  const [catatan, setCatatan] = React.useState(data?.catatan || '');
  const [kodePartner, setKodePartner] = React.useState(data ? (isPiutang ? data.kodeCust : data.kodeSupp) : '');
  const [items, setItems] = React.useState(data?.items || []);
  const [penerimaan, setPenerimaan] = React.useState(data?.penerimaan || []);
  const [showPicker, setShowPicker] = React.useState(false);
  const [showTambahUm, setShowTambahUm] = React.useState(false);
  // null = dialog tertutup; string (termasuk '' utk clear) = kode partner baru yang lagi nunggu
  // konfirmasi user, karena tabel Pelunasan/Penerimaan sudah keisi & akan direset kalau lanjut.
  const [confirmChangePartner, setConfirmChangePartner] = React.useState(null);

  const handlePartnerSelect = (val) => {
    if (!isEdit && (items.length > 0 || penerimaan.length > 0)) setConfirmChangePartner(val);
    else setKodePartner(val);
  };
  const applyPartnerChange = () => {
    setKodePartner(confirmChangePartner);
    setItems([]);
    setPenerimaan([]);
    setConfirmChangePartner(null);
  };

  const partnerObj = kodePartner ? partnerList.find(p => (isPiutang ? p.code : p.Kode_Supp) === kodePartner) : null;
  const namaPartner = partnerObj ? (isPiutang ? partnerObj.name : partnerObj.Nama_Supp) : '';

  const availableSaldoItems = saldoItems.filter(it =>
    (isPiutang ? it.kodeCust : it.kodeSupp) === kodePartner &&
    it.sisa > 0 &&
    !items.some(picked => picked.noBukti === it.noBukti));

  const updateItem = (id, field, val) => setItems(ls => ls.map(it => it.id===id ? {...it, [field]: +val || 0} : it));
  const removeItem = (id) => setItems(ls => ls.filter(it => it.id !== id));
  const handlePickerConfirm = (picked) => {
    setItems(ls => [...ls, ...picked.map(it => ({
      id: Date.now() + Math.random(), jenis: it.jenis, noBukti: it.noBukti, sisaSaatItu: it.sisa,
      debet: it.jenis === 'Nota' ? 0 : it.sisa,
      kredit: it.jenis === 'Nota' ? it.sisa : 0,
    }))]);
    setShowPicker(false);
  };
  // Uang Muka baru (bukan pilih sisa yang sudah ada) — isi 1 baris Kredit di Tabel Pelunasan +
  // 1 baris Tabel Penerimaan sekaligus. `isNewUangMuka:true` menandai savePelunasan (KeuanganPage.jsx)
  // supaya baris ini dipersist jadi record SALDO_*_ITEMS baru saat disimpan, bukan dianggap konsumsi
  // sisa yang sudah ada (beda dari item hasil SaldoPickerModal, yang noBukti-nya sudah ada di saldoItems).
  const handleTambahUangMuka = ({ nominal, metode, kodeAkun, namaAkun, noGiro, jthTempoGiro }) => {
    const noBukti = kuNextUmNo(saldoItems, isPiutang);
    setItems(ls => [...ls, { id: Date.now()+Math.random(), jenis:'Uang Muka', noBukti, sisaSaatItu: nominal, debet:0, kredit:nominal, isNewUangMuka:true }]);
    setPenerimaan(ls => [...ls, { id: Date.now()+Math.random(), metode, kodeAkun, namaAkun, masuk:nominal, keluar:0, noGiro: metode==='Giro'?noGiro:'', jthTempoGiro: metode==='Giro'?jthTempoGiro:'' }]);
    setShowTambahUm(false);
  };

  const addPenerimaanRow = () => setPenerimaan(ls => [...ls, { id:Date.now()+Math.random(), metode:'Tunai', kodeAkun:'', namaAkun:'', masuk:0, keluar:0, noGiro:'', jthTempoGiro:'' }]);
  const updatePenerimaan = (id, patch) => setPenerimaan(ls => ls.map(p => p.id===id ? {...p, ...patch} : p));
  const removePenerimaan = (id) => setPenerimaan(ls => ls.filter(p => p.id !== id));

  const totalPelunasan = items.reduce((s,it) => s + (+it.kredit||0) - (+it.debet||0), 0);
  const totalPenerimaan = penerimaan.reduce((s,p) => s + (+p.masuk||0) - (+p.keluar||0), 0);
  const selisih = totalPelunasan - totalPenerimaan;
  const balanced = totalPelunasan > 0 && selisih === 0;
  const selisihTooltip = selisih > 0 ? `Penerimaan masih kurang ${fmtRp(selisih)}` : selisih < 0 ? `Penerimaan kelebihan ${fmtRp(-selisih)}` : '';

  const handleSave = () => {
    if (isEdit) { onSave({ ...data, noReferensi, catatan }); return; }
    onSave({
      no: kuNextNo(rows, kind.toUpperCase()),
      tgl: akFromIso(tgl) || '',
      noReferensi, catatan,
      [isPiutang?'kodeCust':'kodeSupp']: kodePartner,
      [isPiutang?'namaCust':'namaSupp']: namaPartner,
      items, penerimaan, total: totalPelunasan, status:'Posted',
    });
  };

  const tdS = { padding:'6px 8px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };

  return (
    <>
      <AkModalShell maxWidth={1320}
        title={isEdit ? `Edit ${isPiutang?'Pelunasan Piutang':'Pelunasan Hutang'} — ${data.no}` : `${isPiutang?'Pelunasan Piutang':'Pelunasan Hutang'} Baru`}
        sub={isEdit ? `${isPiutang?data.namaCust:data.namaSupp}` : `Catat pelunasan ${isPiutang?'piutang pelanggan':'hutang supplier'}`}
        onClose={onClose} onSave={handleSave} saveDisabled={!isEdit && !balanced}
        saveLabel={isEdit?'Simpan Perubahan':'Simpan & Posting'}>

        <div className="form-row-3">
          <div className="field"><label>Tgl Bayar <span style={{color:'var(--danger)'}}>*</span></label><input className="input" type="date" value={tgl} onChange={e=>setTgl(e.target.value)} disabled={isEdit}/></div>
          <div className="field"><label>No. Referensi</label><input className="input" value={noReferensi} onChange={e=>setNoReferensi(e.target.value)}/></div>
          <div className="field"><label>No. Bukti</label><input className="input mono" value={isEdit?data.no:'Otomatis saat disimpan'} readOnly/></div>
        </div>
        <div className="field" style={{marginTop:12}}>
          <label>{isPiutang?'Pelanggan':'Supplier'} <span style={{color:'var(--danger)'}}>*</span></label>
          <select className="select" value={kodePartner} disabled={isEdit} onChange={e=>handlePartnerSelect(e.target.value)}>
            <option value="">— Pilih {isPiutang?'Pelanggan':'Supplier'} —</option>
            {isPiutang
              ? partnerList.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)
              : partnerList.map(p => <option key={p.Kode_Supp} value={p.Kode_Supp}>{p.Kode_Supp} — {p.Nama_Supp}</option>)}
          </select>
        </div>

        <div className="totals-card" style={{padding:16, marginTop:14, marginBottom:18}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:20}}>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:6}}><span className="muted">Total Pelunasan</span><span className="mono" style={{fontWeight:600}}>{fmtRp(totalPelunasan)}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:6}}><span className="muted">Total Penerimaan</span><span className="mono" style={{fontWeight:600}}>{fmtRp(totalPenerimaan)}</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12.5, paddingTop:8, borderTop:'1px solid var(--border)'}}>
                <span className="muted">Selisih</span>
                <span className="mono" title={!isEdit && !balanced ? selisihTooltip : undefined}
                  style={{fontWeight:700, color: balanced ? 'var(--realisasi)' : (totalPelunasan||totalPenerimaan) ? 'var(--danger)' : 'var(--text-3)'}}>
                  {isEdit ? 'Terkunci' : fmtRp(Math.abs(selisih))}
                </span>
              </div>
            </div>
            <div className="field" style={{marginBottom:0}}>
              <label>Catatan</label>
              <textarea className="textarea" style={{minHeight:64}} value={catatan} onChange={e=>setCatatan(e.target.value)}/>
            </div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <h4 style={{margin:0}}>Tabel Pelunasan</h4>
              {!isEdit && (
                <div style={{display:'flex', gap:6}}>
                  <button className="btn btn-sm btn-primary" disabled={!kodePartner} title={!kodePartner ? 'Pilih Pelanggan/Supplier terlebih dahulu.' : undefined}
                    onClick={()=>{ if (!kodePartner) { window.__erpToast && window.__erpToast('Pilih Pelanggan/Supplier terlebih dahulu.'); return; } setShowPicker(true); }}>{I.plus()} Pilih Nota/Uang Muka</button>
                  <button className="btn btn-sm" disabled={!kodePartner} title={!kodePartner ? 'Pilih Pelanggan/Supplier terlebih dahulu.' : undefined}
                    onClick={()=>{ if (!kodePartner) { window.__erpToast && window.__erpToast('Pilih Pelanggan/Supplier terlebih dahulu.'); return; } setShowTambahUm(true); }}>{I.plus()} Tambah Uang Muka</button>
                </div>
              )}
            </div>
            <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'auto', maxHeight:280}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
                <thead>
                  <tr style={{background:'var(--bg-sub)'}}>
                    <th style={{...tdS, textAlign:'left'}}>Jenis</th><th style={{...tdS, textAlign:'left'}}>No. Bukti</th>
                    <th style={{...tdS, textAlign:'right'}}>Sisa</th><th style={{...tdS, textAlign:'right'}}>Debet</th><th style={{...tdS, textAlign:'right'}}>Kredit</th>
                    {!isEdit && <th style={tdS}></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.length===0 && <tr><td colSpan={isEdit?5:6} style={{padding:'24px 8px', textAlign:'center', color:'var(--text-3)'}}>Belum ada nota/uang muka dipilih.</td></tr>}
                  {items.map(it => (
                    <tr key={it.id}>
                      <td style={tdS}>{it.jenis}</td>
                      <td style={{...tdS}} className="mono">{it.noBukti}</td>
                      <td style={{...tdS, textAlign:'right'}} className="mono">{fmtRp(it.sisaSaatItu)}</td>
                      <td style={{...tdS, textAlign:'right'}}>{isEdit ? <span className="mono">{fmtRp(it.debet)}</span> : (
                        <NumInput className="input" value={it.debet} onChange={val=>updateItem(it.id,'debet',val)} style={{width:100, textAlign:'right', padding:'3px 6px'}}/>
                      )}</td>
                      <td style={{...tdS, textAlign:'right'}}>{isEdit ? <span className="mono">{fmtRp(it.kredit)}</span> : (
                        <NumInput className="input" value={it.kredit} onChange={val=>updateItem(it.id,'kredit',val)} style={{width:100, textAlign:'right', padding:'3px 6px'}}/>
                      )}</td>
                      {!isEdit && <td style={{...tdS, textAlign:'center'}}><button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>removeItem(it.id)}>{I.trash()}</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <h4 style={{margin:0}}>Tabel Penerimaan</h4>
              {!isEdit && <button className="btn btn-sm btn-primary" onClick={addPenerimaanRow}>{I.plus()} Tambah Metode</button>}
            </div>
            <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'auto', maxHeight:280}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5}}>
                <thead>
                  <tr style={{background:'var(--bg-sub)'}}>
                    <th style={{...tdS, textAlign:'left'}}>Metode</th><th style={{...tdS, textAlign:'left'}}>Akun</th>
                    <th style={{...tdS, textAlign:'right'}}>Masuk</th><th style={{...tdS, textAlign:'right'}}>Keluar</th>
                    {!isEdit && <th style={tdS}></th>}
                  </tr>
                </thead>
                <tbody>
                  {penerimaan.length===0 && <tr><td colSpan={isEdit?4:5} style={{padding:'24px 8px', textAlign:'center', color:'var(--text-3)'}}>Belum ada metode penerimaan.</td></tr>}
                  {penerimaan.map(p => (
                    <tr key={p.id}>
                      <td style={tdS}>{isEdit ? p.metode : (
                        <select className="select" value={p.metode} style={{padding:'3px 6px'}} onChange={e=>updatePenerimaan(p.id, {metode:e.target.value, kodeAkun:'', namaAkun:''})}>
                          <option>Tunai</option><option>Transfer</option><option>Giro</option>
                        </select>
                      )}</td>
                      <td style={tdS}>{isEdit ? p.namaAkun : (
                        <select className="select" value={p.kodeAkun} style={{padding:'3px 6px'}} onChange={e=>{
                          const acc = KAS_BANK_GIRO.find(a=>a.kode===e.target.value);
                          updatePenerimaan(p.id, { kodeAkun:e.target.value, namaAkun: acc?acc.nama:'' });
                        }}>
                          <option value="">— Pilih —</option>
                          {KAS_BANK_GIRO.filter(a => p.metode==='Tunai' ? a.tipe==='KAS' : p.metode==='Transfer' ? a.tipe==='BANK' : a.tipe==='GIRO').map(a => (
                            <option key={a.kode} value={a.kode}>{a.nama}</option>
                          ))}
                        </select>
                      )}</td>
                      <td style={{...tdS, textAlign:'right'}}>{isEdit ? <span className="mono">{fmtRp(p.masuk)}</span> : (
                        <NumInput className="input" value={p.masuk} onChange={val=>updatePenerimaan(p.id, {masuk:+val||0})} style={{width:100, textAlign:'right', padding:'3px 6px'}}/>
                      )}</td>
                      <td style={{...tdS, textAlign:'right'}}>{isEdit ? <span className="mono">{fmtRp(p.keluar)}</span> : (
                        <NumInput className="input" value={p.keluar} onChange={val=>updatePenerimaan(p.id, {keluar:+val||0})} style={{width:100, textAlign:'right', padding:'3px 6px'}}/>
                      )}</td>
                      {!isEdit && <td style={{...tdS, textAlign:'center'}}><button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>removePenerimaan(p.id)}>{I.trash()}</button></td>}
                    </tr>
                  ))}
                  {!isEdit && penerimaan.some(p=>p.metode==='Giro') && penerimaan.filter(p=>p.metode==='Giro').map(p => (
                    <tr key={'giro-'+p.id} style={{background:'var(--bg-sub)'}}>
                      <td style={tdS} colSpan={2}><span className="muted" style={{fontSize:11.5}}>Detail Giro — {p.namaAkun || '—'}</span></td>
                      <td style={tdS} colSpan={3}>
                        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                          <input className="input mono" placeholder="No. Giro" value={p.noGiro} onChange={e=>updatePenerimaan(p.id, {noGiro:e.target.value})} style={{padding:'3px 6px'}}/>
                          <input className="input" type="date" value={p.jthTempoGiro} onChange={e=>updatePenerimaan(p.id, {jthTempoGiro:e.target.value})} style={{padding:'3px 6px'}}/>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AkModalShell>

      {showPicker && (
        <SaldoPickerModal items={availableSaldoItems} onConfirm={handlePickerConfirm} onCancel={()=>setShowPicker(false)} />
      )}

      {showTambahUm && (
        <TambahUangMukaModal onConfirm={handleTambahUangMuka} onCancel={()=>setShowTambahUm(false)} />
      )}

      {confirmChangePartner !== null && (
        <ConfirmationModal
          title={`Ganti ${isPiutang?'Pelanggan':'Supplier'}?`}
          message={`Tabel Pelunasan dan Penerimaan yang sudah diisi akan direset kalau ${isPiutang?'pelanggan':'supplier'} diganti. Lanjutkan?`}
          requireReason={false} confirmLabel="Ya, Ganti" confirmKind="danger"
          onConfirm={applyPartnerChange} onCancel={()=>setConfirmChangePartner(null)} />
      )}
    </>
  );
}

function KbgModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const [kode, setKode] = React.useState(data?.kode || '');
  const [tipe, setTipe] = React.useState(data?.tipe || '');
  const [nama, setNama] = React.useState(data?.nama || '');
  const [cabang, setCabang] = React.useState(data?.cabang || 'Pusat');
  const [currency, setCurrency] = React.useState(data?.currency || 'IDR');
  const [noRek, setNoRek] = React.useState(data?.noRek || '');
  const [saldo, setSaldo] = React.useState(data?.saldo ?? 0);

  const handleSave = () => onSave({ kode, tipe, nama, cabang, currency, noRek, saldo: +saldo || 0 });

  return (
    <AkModalShell title={isEdit?`Edit Akun — ${data.kode}`:'Tambah Akun Kas/Bank/Giro'} onClose={onClose} onSave={handleSave}>
      <div className="form-section">
        <div className="form-row">
          <div className="field"><label>Kode Akun *</label><input className="input mono" value={kode} onChange={e=>setKode(e.target.value)} disabled={isEdit}/></div>
          <div className="field"><label>Tipe *</label>
            <select className="select" value={tipe} onChange={e=>setTipe(e.target.value)}>
              <option value="">— Pilih —</option><option>KAS</option><option>BANK</option><option>GIRO</option>
            </select>
          </div>
        </div>
        <div className="field"><label>Nama Akun *</label><input className="input" value={nama} onChange={e=>setNama(e.target.value)}/></div>
        <div className="form-row">
          <div className="field"><label>Cabang</label><select className="select" value={cabang} onChange={e=>setCabang(e.target.value)}><option>Pusat</option><option>Surabaya</option><option>Bandung</option></select></div>
          <div className="field"><label>Currency</label><select className="select" value={currency} onChange={e=>setCurrency(e.target.value)}><option>IDR</option><option>USD</option></select></div>
        </div>
        <div className="field"><label>No. Rekening</label><input className="input mono" value={noRek} onChange={e=>setNoRek(e.target.value)}/></div>
        <div className="field"><label>Saldo Awal (Rp)</label><input className="input mono" type="number" value={saldo} onChange={e=>setSaldo(e.target.value)}/></div>
      </div>
    </AkModalShell>
  );
}
