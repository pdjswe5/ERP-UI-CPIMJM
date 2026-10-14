// Laporan — komponen cetak generik dipakai lintas sub-halaman (Komisi Salesman, Kartu/Rekap/Rincian
// Piutang-Hutang, Kartu/Posisi/Rekap Stok). Semua dokumen referensi user berbentuk sama: kop 3-kolom
// (nama PT kiri, judul dokumen tengah, timestamp+halaman kanan) + baris info tambahan opsional
// (mis. "Salesman : AH - AHWAN" / "Tanggal : ... sd ...") + 1 tabel lebar + baris total opsional,
// dicetak LANDSCAPE margin kecil (.cetak-page-landscape, styles.css) — beda dari dokumen transaksi
// modul lain (Invoice/PO/dll) yg portrait. Daripada bikin komponen cetak terpisah per sub-halaman
// (~7x kerja berulang), satu `LapCetakPage` ini menangani semuanya lewat prop `columns`/`rows`.

function lapFmtTglNow() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()} / ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}
// Semua tanggal di modul Laporan disimpan ISO (yyyy-mm-dd) spt kebanyakan seed lain sesi ini —
// ditampilkan dd-mm-yyyy di cetakan supaya sama gaya dgn referensi user.
function lapFmtTgl(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}
// Klon lokal KLPillTabs/PrPillTabs (bukan cross-import lintas modul — pola konsisten sesi ini, tiap
// modul punya salinan sendiri drpd saling bergantung ke komponen privat modul lain).
function LapPillTabs({ tabs, active, onSelect }) {
  return (
    <div style={{display:'flex', gap:8, flexWrap:'wrap', padding:'12px 0 20px'}}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onSelect(t.id)} style={{
          padding:'6px 16px', borderRadius:999, border:'1px solid var(--border)', fontSize:13, fontWeight:500,
          background: active===t.id ? 'var(--primary)' : 'var(--bg-sub)',
          color: active===t.id ? '#fff' : 'var(--text)', cursor:'pointer',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// Field rentang tanggal/kode dipakai hampir semua filter panel Laporan — DITUMPUK vertikal (bukan
// 2 input+label "sd" sejajar horizontal) krn panel filter cuma lebar 320px (dikurangi padding jadi
// ~288px); 2 <input type="date"> native sejajar horizontal di lebar segitu kepotong/overflow keluar
// panel (bug yg dilaporkan). Ditumpuk vertikal selalu muat berapa pun lebar panelnya.
function LapDateRangeField({ label='Tanggal', awal, akhir, onAwal, onAkhir, note }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" type="date" value={awal} onChange={e=>onAwal(e.target.value)} />
      <div className="muted" style={{fontSize:11, margin:'3px 0'}}>sd</div>
      <input className="input" type="date" value={akhir} onChange={e=>onAkhir(e.target.value)} />
      {note && <div className="muted" style={{fontSize:11, marginTop:2}}>{note}</div>}
    </div>
  );
}
function LapCodeRangeField({ label, dari, sampai, onDari, onSampai, note }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" placeholder="dari" value={dari} onChange={e=>onDari(e.target.value)} />
      <div className="muted" style={{fontSize:11, margin:'3px 0'}}>sd</div>
      <input className="input" placeholder="sampai" value={sampai} onChange={e=>onSampai(e.target.value)} />
      {note && <div className="muted" style={{fontSize:11, marginTop:2}}>{note}</div>}
    </div>
  );
}
// Varian dropdown LapCodeRangeField — dipakai kalau user belum tentu hafal kode partner (mis. Kartu
// Piutang/Hutang), jadi "dari"/"sampai" dipilih dari daftar KODE - Nama drpd ketik kode buta. `options`
// = [{kode, nama}], diurutkan naik berdasar kode supaya urutan dropdown sinkron dgn arti range-nya.
// Mekanisme filter di belakangnya TETAP sama (lapCodeInRange) — cuma cara isinya yg berubah.
function LapCodeRangeSelectField({ label, options, dari, sampai, onDari, onSampai, note }) {
  const sorted = [...options].sort((a, b) => a.kode.localeCompare(b.kode));
  return (
    <div className="field">
      <label>{label}</label>
      <select className="select" value={dari} onChange={e=>onDari(e.target.value)}>
        <option value="">— Awal —</option>
        {sorted.map(o => <option key={o.kode} value={o.kode}>{o.kode} - {o.nama}</option>)}
      </select>
      <div className="muted" style={{fontSize:11, margin:'3px 0'}}>sd</div>
      <select className="select" value={sampai} onChange={e=>onSampai(e.target.value)}>
        <option value="">— Akhir —</option>
        {sorted.map(o => <option key={o.kode} value={o.kode}>{o.kode} - {o.nama}</option>)}
      </select>
      {note && <div className="muted" style={{fontSize:11, marginTop:2}}>{note}</div>}
    </div>
  );
}

function lapOrgInfo() {
  return (typeof PG_ORGANISASI !== 'undefined' && PG_ORGANISASI) || { nama:'PT. Pacific Data Jaya' };
}
// Gaya cetakan referensi user pakai koma-ribuan + 2 desimal TANPA prefix "Rp" (mis. "6,035,000.00")
// — beda dari fmtRp bawaan app ("Rp 6.035.000"), makanya modul Laporan py formatter angka sendiri,
// dipakai semua sub-halaman (Komisi Salesman, Kartu/Rekap/Rincian Piutang-Hutang, dll).
function lapFmtNum(n) {
  return (n || 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
// Qty stok (bukan uang) — bilangan bulat, koma-ribuan, tanpa desimal.
function lapFmtQty(n) {
  return (n || 0).toLocaleString('en-US');
}
// Data Keuangan (SALDO_PIUTANG_ITEMS/HUTANG, PELUNASAN_PIUTANG/HUTANG) pakai tgl format "DD-MM-YYYY".
function lapDmyToIso(dmy) {
  if (!dmy) return '';
  const [d, m, y] = dmy.split('-');
  return `${y}-${m}-${d}`;
}

// Satu fungsi tunggal jadi sumber kebenaran ledger Piutang/Hutang per-partner — dipakai Kartu, Rekap,
// & Rincian Nota SEKALIGUS supaya angka Saldo Awal/Penjualan/Pelunasan/Retur/Saldo Akhir antar 3
// laporan itu SELALU konsisten (bukan masing² hitung ulang dgn logika sendiri-sendiri). `items` =
// SALDO_PIUTANG_ITEMS atau SALDO_HUTANG_ITEMS, `pelunasanList` = PELUNASAN_PIUTANG atau
// PELUNASAN_HUTANG, `kodeKey` = 'kodeCust' atau 'kodeSupp'. Uang Muka diperlakukan sbg kredit (masuk
// bucket "pelunasan") krn sifatnya sama² mengurangi saldo piutang/hutang.
function lapBuildArApLedger(items, pelunasanList, kodeKey, kodePartner, tglAwalIso, tglAkhirIso) {
  const events = [];
  items.filter(it => it[kodeKey] === kodePartner).forEach(it => {
    const tglIso = lapDmyToIso(it.tgl);
    if (it.jenis === 'Nota') events.push({ tglIso, tgl: it.tgl, tipe:'1.JUAL', nomor: it.noBukti, keterangan:'', debet: it.nilai, kredit: 0 });
    else if (it.jenis === 'Retur') events.push({ tglIso, tgl: it.tgl, tipe:'2.RETUR', nomor: it.noBukti, keterangan:'', debet: 0, kredit: it.nilai });
    else if (it.jenis === 'Uang Muka') events.push({ tglIso, tgl: it.tgl, tipe:'4.UANG MUKA', nomor: it.noBukti, keterangan:'', debet: 0, kredit: it.nilai });
  });
  pelunasanList.filter(p => p[kodeKey] === kodePartner).forEach(p => {
    const tglIso = lapDmyToIso(p.tgl);
    (p.items || []).forEach(it => {
      events.push({ tglIso, tgl: p.tgl, tipe:'3.PELUNASAN', nomor: p.no, keterangan: it.noBukti, debet: it.debet || 0, kredit: it.kredit || 0 });
    });
  });
  events.sort((a, b) => a.tglIso.localeCompare(b.tglIso));

  const before = events.filter(e => e.tglIso < tglAwalIso);
  const saldoAwal = before.reduce((s, e) => s + e.debet - e.kredit, 0);

  const dalamPeriode = events.filter(e => e.tglIso >= tglAwalIso && e.tglIso <= tglAkhirIso);
  let running = saldoAwal;
  const lines = dalamPeriode.map(e => { running += e.debet - e.kredit; return { ...e, saldo: running }; });

  const penjualan = dalamPeriode.filter(e => e.tipe === '1.JUAL').reduce((s, e) => s + e.debet, 0);
  const pelunasan = dalamPeriode.filter(e => e.tipe === '3.PELUNASAN' || e.tipe === '4.UANG MUKA').reduce((s, e) => s + e.kredit, 0);
  const retur = dalamPeriode.filter(e => e.tipe === '2.RETUR').reduce((s, e) => s + e.kredit, 0);
  const saldoAkhir = saldoAwal + penjualan - pelunasan - retur;
  const totalDebet = dalamPeriode.reduce((s, e) => s + e.debet, 0);
  const totalKredit = dalamPeriode.reduce((s, e) => s + e.kredit, 0);

  return { saldoAwal, lines, penjualan, pelunasan, retur, saldoAkhir, totalDebet, totalKredit };
}

// Rentang kode partner (mis. filter "Kode Customer: dari-sd" Kartu/Rincian Piutang-Hutang) —
// dinormalisasi ke uppercase supaya konsisten meski kode aslinya campur huruf besar/kecil
// (mis. "b7364" vs "C001" di PJ_PELANGGAN).
function lapCodeInRange(kode, dari, sampai) {
  const c = (kode || '').toUpperCase();
  if (dari && c < dari.toUpperCase()) return false;
  if (sampai && c > sampai.toUpperCase()) return false;
  return true;
}

// ── Kartu/Posisi/Rekap Stok ──────────────────────────────────────────────────
// Dari dataset dummy mandiri LAP_STOK_* (data/stok.data.jsx) — BUKAN data riil Barang/Manufaktur/
// Penjualan. Instruksi user: tampilkan terintegrasi penuh spt referensi asli (transaksi PRODUK dari
// Manufaktur, JUAL dari Penjualan, KOREKSI, PAKAI) tapi datanya dummy, supaya tidak perlu
// merekonsiliasi kode barang & kode gudang yg saat ini beda² antar Barang/Pembelian/Penjualan/
// Manufaktur. OPNAME tetap diperlakukan sbg CHECKPOINT (reset saldo), event lain jadi delta Debet/
// Kredit — pola sama dgn lapBuildArApLedger, cuma sumbernya beda.
function lapBuildStokEvents(kodeItem, kodeLokasi) {
  return LAP_STOK_TRX
    .filter(t => t.kodeItem === kodeItem && (!kodeLokasi || t.lokasi === kodeLokasi))
    .map(t => ({
      tglIso: t.tanggal, noBukti: t.nomorBukti || '', lokasi: t.lokasi, tipe: t.tipe,
      keterangan: t.keterangan, debet: t.debet || 0, kredit: t.kredit || 0, resetTo: t.resetTo,
    }))
    .sort((a, b) => a.tglIso.localeCompare(b.tglIso));
}

// Opname = reset saldo ke `resetTo` (bukan ditambah/dikurang spt Produk/Jual/Koreksi/Pakai).
function lapStokRunningBalance(events, tglAwalIso, tglAkhirIso) {
  let saldo = 0;
  events.filter(e => e.tglIso < tglAwalIso).forEach(e => { saldo = e.tipe === 'OPNAME' ? e.resetTo : saldo + e.debet - e.kredit; });
  const saldoAwal = saldo;
  const lines = events.filter(e => e.tglIso >= tglAwalIso && e.tglIso <= tglAkhirIso).map(e => {
    saldo = e.tipe === 'OPNAME' ? e.resetTo : saldo + e.debet - e.kredit;
    return { ...e, saldo };
  });
  return { saldoAwal, lines, saldoAkhir: saldo };
}

// Posisi (Stock Real & Available = Stock Real - Reserved) semua item pada tanggal `asOfIso` —
// dasar Posisi Stok, difilter opsional per Lokasi & Tebal.
function lapStokPosisiSemua(asOfIso, kodeLokasiFilter, tebalFilter) {
  return LAP_STOK_ITEMS
    .filter(it => !kodeLokasiFilter || it.lokasi === kodeLokasiFilter)
    .filter(it => tebalFilter == null || it.tebal === tebalFilter)
    .map(it => {
      const { saldoAkhir } = lapStokRunningBalance(lapBuildStokEvents(it.kode, it.lokasi), '0000-01-01', asOfIso);
      const reserved = lapStokReserved(it.kode);
      return {
        ...it, lokasiNama: LAP_STOK_LOKASI.find(l => l.kode === it.lokasi)?.nama || it.lokasi,
        stockReal: saldoAkhir, available: saldoAkhir - reserved,
      };
    });
}

// Umur piutang/hutang (hari terlambat dari jatuh tempo, atau dari tgl kalau jthTempo kosong spt
// Retur/Uang Muka) relatif ke tanggal akhir periode laporan — dipakai kolom 0-30/31-60/61-90/>90 hari
// di Rekap Piutang/Hutang. Nilai negatif (belum jatuh tempo) dianggap 0 (masuk bucket 0-30).
function lapAgingBucket(dmyDate, asOfIso) {
  const days = Math.max(0, Math.floor((new Date(asOfIso) - new Date(lapDmyToIso(dmyDate))) / 86400000));
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '>90';
}

// Dipakai bersama Rekap Piutang/Hutang & Rincian Nota — blok info "Plafon / Sisa Titipan / Outs.GIRO
// / Outs.SO" persis referensi cetakan user. Sisa Titipan resolve periode saldoTitipan terbaru yg <=
// tglAkhir (PJ_PELANGGAN only — PB_SUPPLIER tidak py field ini, kembalikan 0). Outs.GIRO = giro yg
// pernah diterima via Pelunasan tapi jth tempo giro-nya masih setelah tglAkhir (blm cair). Outs.SO
// (sales order yg belum ditagih) tidak py sumber data di app ini — selalu 0 (disederhanakan).
function lapResolveTitipan(saldoTitipan, tglAkhirIso) {
  if (!saldoTitipan || saldoTitipan.length === 0) return 0;
  const target = tglAkhirIso.slice(0,4) + tglAkhirIso.slice(5,7);
  const eligible = saldoTitipan.filter(s => s.periode <= target).sort((a,b) => b.periode.localeCompare(a.periode));
  return (eligible[0] || saldoTitipan[saldoTitipan.length-1]).awalTitipan || 0;
}
function lapGiroOutstanding(pelunasanList, kodeKey, kodePartner, tglAkhirIso) {
  return pelunasanList
    .filter(p => p[kodeKey] === kodePartner)
    .flatMap(p => p.penerimaan || [])
    .filter(pen => pen.metode === 'Giro' && pen.jthTempoGiro && lapDmyToIso(pen.jthTempoGiro) > tglAkhirIso)
    .reduce((s, pen) => s + (pen.masuk || 0), 0);
}

// Tanggal nota LUNAS (dibayar penuh) = tanggal Pelunasan TERAKHIR yg py baris mereferensikan
// noBukti nota ini. '' kalau sisa masih > 0 (belum lunas) atau tidak ketemu riwayat pelunasannya.
function lapFindTglLunas(noBukti, sisa, pelunasanList) {
  if (sisa > 0) return '';
  let latest = '';
  pelunasanList.forEach(p => {
    (p.items || []).forEach(it => {
      if (it.noBukti === noBukti) {
        const iso = lapDmyToIso(p.tgl);
        if (!latest || iso > latest) latest = iso;
      }
    });
  });
  return latest;
}

// Berapa baris (row/group-header/subtotal/info, masing² dihitung 1 "unit") ditumpuk dalam 1 halaman
// A4 landscape sebelum lanjut ke halaman berikutnya — perkiraan sederhana ala PB_REGISTER_ROWS_PER_PAGE
// (PbCetakModal.jsx), bukan pengukuran piksel presisi (app ini tdk py backend cetak sungguhan).
const LAP_ROWS_PER_PAGE = 24;

// Ratakan rows/footerRow/groupBy jadi 1 daftar "unit" baris supaya bisa dipotong rata per halaman
// tanpa peduli itu row biasa, header grup, subtotal grup, baris info (mis. blok Plafon Rincian Nota),
// atau grand total di paling akhir (dari `footerRow` top-level, dicetak SETELAH semua grup kalau ada).
function lapBuildCetakLines({ rows, footerRow, groupBy }) {
  const lines = [];
  if (groupBy) {
    groupBy.forEach(g => {
      if (g.label) lines.push({ type:'group', label: g.label });
      g.rows.forEach(r => lines.push({ type:'row', data:r }));
      if (g.footerRow) lines.push({ type:'foot', data: g.footerRow });
      if (g.infoRow) lines.push({ type:'inforow', data: g.infoRow });
    });
    if (footerRow) lines.push({ type:'foot', data: footerRow });
  } else {
    (rows || []).forEach(r => lines.push({ type:'row', data:r }));
    if (footerRow) lines.push({ type:'foot', data: footerRow });
  }
  return lines;
}

// Sama persis pbChunk (PbCetakModal.jsx): potong per `size` unit; kalau halaman baru mulai di TENGAH
// grup (bukan pas baris header grupnya), header grup itu diulang di awal halaman dgn tanda "(lanjutan)"
// supaya user tidak pernah lihat baris nyasar tanpa tahu itu kelanjutan grup yang mana.
function lapChunkCetakLines(lines, size) {
  const out = [];
  let currentGroup = null;
  for (let i = 0; i < lines.length; i += size) {
    const slice = lines.slice(i, i + size);
    const page = (slice[0] && slice[0].type !== 'group' && currentGroup)
      ? [{ type:'group', label: currentGroup.label, continuation:true }, ...slice]
      : slice;
    slice.forEach(ln => { if (ln.type === 'group') currentGroup = ln; });
    out.push(page);
  }
  return out.length ? out : [[]];
}

// `columns`: [{ key, label, align:'left'|'right'|'center', width }]
// `rows`: array of plain objects, tiap value SUDAH diformat jadi string tampilan (biar komponen ini
// tidak perlu tahu format Rupiah/tanggal/dll punya tiap laporan).
// `footerRow`: object sama shape spt rows (opsional) dicetak bold — Total (mode flat) atau Grand
// Total di akhir SEMUA grup (mode groupBy, opsional, mis. Rincian Nota/Posisi Stok).
// `groupBy` opsional: [{ label, rows, footerRow, infoRow }] — infoRow (opsional) = 1 React node
// dicetak sbg baris lebar (colSpan penuh) setelah footerRow grup itu, mis. blok Plafon/Sisa Titipan.
// `plainTitle` opsional: sebagian dokumen referensi (mis. Rekap Stock) TIDAK py kop 3-kolom (nama PT
// kiri/judul tengah) — cuma 1 baris judul tebal rata-kiri + tanggal/hal di kanan. Set true utk pakai
// layout itu (docTitle jadi teks judul penuh, org.nama tidak ditampilkan).
// Render otomatis DIPAGINASI ke beberapa "kertas" A4 (.cetak-page-landscape) kalau isinya melebihi
// kapasitas 1 halaman (LAP_ROWS_PER_PAGE) — kop+judul+"Hal. X dari Y" diulang tiap halaman, footer
// timestamp cuma di halaman terakhir (persis pola PbCetakRegisterBody, PbCetakModal.jsx).
// `roomy` opsional: laporan berkolom sedikit (Kartu/Posisi Stok, Kartu Piutang-Hutang, Rincian Nota
// — 5-10 kolom) pasang ini utk tabel font 13px drpd 9px generik (styles.css .cetak-lap-roomy).
// TIDAK dipasang di laporan berkolom banyak (Komisi Salesman, Rekap Piutang-Hutang, 13-16 kolom) —
// bakal overflow di lebar 1123px kalau ikut dibesarkan.
function LapCetakPage({ docTitle, plainTitle, metaRight, infoLines, columns, rows, footerRow, groupBy, emptyMsg, roomy }) {
  const org = lapOrgInfo();

  const renderRow = (r, key, bold) => (
    <tr key={key} style={bold ? {fontWeight:700} : null}>
      {columns.map(c => (
        <td key={c.key} className={c.align === 'right' ? 'num' : ''} style={{textAlign: c.align || 'left'}}>
          {r[c.key] ?? ''}
        </td>
      ))}
    </tr>
  );

  const lines = lapBuildCetakLines({ rows, footerRow, groupBy });
  const pages = lapChunkCetakLines(lines, LAP_ROWS_PER_PAGE);
  const totalPages = pages.length;
  const isEmpty = lines.length === 0;

  return (
    <>
      {pages.map((pageLines, pi) => (
        <div className={`cetak-page cetak-page-landscape${roomy ? ' cetak-lap-roomy' : ''}`} key={pi}>
          <div className="cetak-doc">
            <div className="cetak-kop">
              {plainTitle ? (
                <div className="cetak-kop-left" style={{flex:3}}><b>{docTitle}</b></div>
              ) : (
                <>
                  <div className="cetak-kop-left"><b>{org.nama}</b></div>
                  <div className="cetak-kop-center">{docTitle}</div>
                </>
              )}
              <div className="cetak-kop-right">{metaRight}<br/>Hal. {pi + 1} dari {totalPages}</div>
            </div>
            {infoLines && infoLines.length > 0 && (
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12.5, marginBottom:10}}>
                {infoLines.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
            <table className="cetak-table">
              <thead>
                <tr>{columns.map(c => <th key={c.key} style={{textAlign: c.align === 'right' ? 'right' : 'center', width: c.width}}>{c.label}</th>)}</tr>
              </thead>
              <tbody>
                {isEmpty && pi === 0 && (
                  <tr><td colSpan={columns.length} className="empty">{emptyMsg || 'Tidak ada data.'}</td></tr>
                )}
                {pageLines.map((ln, li) => {
                  if (ln.type === 'group') return (
                    <tr className="cetak-register-group" key={li}>
                      <td colSpan={columns.length}>{ln.label}{ln.continuation && <span className="cetak-lanjutan"> (lanjutan)</span>}</td>
                    </tr>
                  );
                  if (ln.type === 'inforow') return (
                    <tr key={li}><td colSpan={columns.length} style={{padding:'4px 6px'}}>{ln.data}</td></tr>
                  );
                  return renderRow(ln.data, li, ln.type === 'foot');
                })}
              </tbody>
            </table>
            {pi === totalPages - 1 && <div className="cetak-timestamp">Dicetak pada {lapFmtTglNow()} oleh PDJ Administrator</div>}
          </div>
        </div>
      ))}
    </>
  );
}

// Shell TERTANAM DI HALAMAN (bukan modal): panel filter (kiri, konten bebas via children) + preview
// cetak (kanan) — dipakai semua sub-halaman Laporan. Beda dari pola cetak modul lain (list dokumen
// dulu, baru popup Cetak terpisah) — di sini filter+pratinjau MEMANG satu-satunya konten halaman,
// persis dialog+jendela cetak aplikasi referensi yg cuma diringkas jadi 1 split-view.
// `previewChildren` diisi <LapCetakPage .../> — komponen itu SENDIRI yg membungkus tiap halaman jadi
// .cetak-page-landscape (bisa lebih dari 1 kalau isinya dipaginasi), jadi shell ini tidak lagi
// membungkus previewChildren dgn div halaman sendiri spt sebelumnya (dulu cuma bisa 1 halaman).
// Zoom diterapkan lewat CSS var --lap-zoom di kontainer scroll (lihat styles.css) supaya berlaku ke
// SEMUA halaman sekaligus tanpa shell ini perlu tahu ada berapa halaman.
function LapReportShell({ filterPanel, previewChildren, onCetak, disabled, footNote }) {
  const [zoom, setZoom] = React.useState(100);
  return (
    <div className="table-card lap-report-shell" style={{display:'flex', height:'calc(100vh - 220px)', minHeight:520, overflow:'hidden'}}>
      <div className="cetak-filter panel" style={{borderRight:'1px solid var(--border)', padding:16, borderRadius:0}}>{filterPanel}</div>
      <div className="cetak-preview-pane" style={{borderRadius:0}}>
        <div className="cetak-toolbar">
          <span className="cetak-pageof">{footNote || 'Pratinjau'}</span>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <div style={{display:'flex', gap:4, alignItems:'center'}}>
              <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.max(40,z-10))}>−</button>
              <span className="cetak-pageof">{zoom}%</span>
              <button className="btn btn-icon btn-sm" onClick={()=>setZoom(z=>Math.min(120,z+10))}>+</button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onCetak} disabled={disabled}>{I.print()} Cetak</button>
          </div>
        </div>
        <div className="cetak-canvas cetak-canvas-scroll" style={{'--lap-zoom': zoom/100}}>
          {previewChildren}
        </div>
      </div>
    </div>
  );
}
