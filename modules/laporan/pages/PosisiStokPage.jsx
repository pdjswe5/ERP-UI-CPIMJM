// Laporan — Posisi Stok: snapshot per item pada 1 tanggal, dikelompokkan per Tebal (persis dokumen
// referensi "POSISI STOCK BRG.JADI Per Tgl. ... Lokasi : GJ" — tabel dipecah per grup Tebal, tiap
// grup py subtotal), kolom Stock Real vs Available (Available = Stock Real - qty yg dialokasikan ke
// SO belum terkirim, lapStokReserved). Sumber data dummy LAP_STOK_ITEMS (data/stok.data.jsx).

const LAP_POSISI_COLS = [
  { key:'kode', label:'Kode' }, { key:'nama', label:'Nama Barang' },
  { key:'stockReal', label:'Stock Real', align:'right' }, { key:'available', label:'Available', align:'right' },
  { key:'satuan', label:'Satuan', align:'center' },
];

function lapPosisiStokGroups(asOfIso, kodeLokasi) {
  const rows = lapStokPosisiSemua(asOfIso, kodeLokasi, null).sort((a,b) => a.tebal - b.tebal || a.nama.localeCompare(b.nama));
  const byTebal = new Map();
  rows.forEach(r => { if (!byTebal.has(r.tebal)) byTebal.set(r.tebal, []); byTebal.get(r.tebal).push(r); });
  return Array.from(byTebal.entries()).sort((a,b) => a[0]-b[0]).map(([tebal, items]) => ({
    label: `Tebal ${tebal.toFixed(2)}`,
    rows: items.map(r => ({ kode: r.kode, nama: r.nama, stockReal: lapFmtQty(r.stockReal), available: lapFmtQty(r.available), satuan: r.satuan })),
    footerRow: { kode:'', nama:'', stockReal: lapFmtQty(items.reduce((s,r)=>s+r.stockReal,0)), available: lapFmtQty(items.reduce((s,r)=>s+r.available,0)), satuan:'' },
    _totals: { stockReal: items.reduce((s,r)=>s+r.stockReal,0), available: items.reduce((s,r)=>s+r.available,0) },
  }));
}

function LaporanPosisiStokPage() {
  const [asOf, setAsOf] = React.useState('2026-07-30');
  const [kodeLokasi, setKodeLokasi] = React.useState('GJ');

  const groups = React.useMemo(() => lapPosisiStokGroups(asOf, kodeLokasi), [asOf, kodeLokasi]);
  const grand = groups.reduce((acc, g) => ({ stockReal: acc.stockReal + g._totals.stockReal, available: acc.available + g._totals.available }), { stockReal:0, available:0 });
  const grandFooter = { kode:'', nama:'', stockReal: lapFmtQty(grand.stockReal), available: lapFmtQty(grand.available), satuan:'' };

  const lokasi = LAP_STOK_LOKASI.find(l => l.kode === kodeLokasi);
  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Posisi Stok</h1><div className="sub">Snapshot stok per item, dikelompokkan per Tebal — Stock Real vs Available (dikurangi reservasi SO).</div></div>
      </div>
      <LapReportShell
        onCetak={doCetak}
        footNote={`${groups.reduce((s,g)=>s+g.rows.length,0)} item`}
        filterPanel={
          <>
            <h3>Posisi Stok</h3>
            <div className="field"><label>Per Tanggal</label><input className="input" type="date" value={asOf} onChange={e=>setAsOf(e.target.value)} /></div>
            <div className="field"><label>Lokasi</label>
              <select className="select" value={kodeLokasi} onChange={e=>setKodeLokasi(e.target.value)}>
                <option value="">Semua Lokasi</option>
                {LAP_STOK_LOKASI.map(l => <option key={l.kode} value={l.kode}>{l.kode} - {l.nama}</option>)}
              </select>
            </div>
          </>
        }
        previewChildren={
          <LapCetakPage
            docTitle={`POSISI STOCK BRG.JADI Per Tgl. ${lapFmtTgl(asOf)}   Lokasi : ${kodeLokasi || 'Semua'}${lokasi ? ` - ${lokasi.nama}` : ''}`}
            metaRight={lapFmtTglNow()}
            columns={LAP_POSISI_COLS} rows={[]} groupBy={groups} footerRow={groups.length > 0 ? grandFooter : null} roomy
            emptyMsg="Tidak ada item pada filter ini."
          />
        }
      />
    </>
  );
}
