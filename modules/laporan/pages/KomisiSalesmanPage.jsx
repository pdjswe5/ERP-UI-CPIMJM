// Laporan — Komisi Salesman: 2 dialog terpisah persis referensi user —
// (1) "Laporan Periode" dgn 3 mode dokumen (Komisi / Rekap Fee / Voucher Fee), filter Tgl.Bayar,
//     Sales/SPV-Mgr, Customer (Pilih/Kecuali), status Dibayar/Hangus, Komisi=0. Filter Referal
//     (ada di referensi awal) sengaja dihapus atas permintaan user.
// (2) "Laporan Tahunan" — pivot Nama x Bulan(Jan-Des)+Total+Rata-Rata per tahun.
// Cetak pakai LapCetakPage/LapReportShell generik (components/LapShared.jsx). Formatnya SENGAJA
// beda dari fmtRp bawaan app (koma-ribuan + 2 desimal, tanpa prefix "Rp") — persis gaya cetakan
// referensi (mis. "6,035,000.00"), makanya pakai lapFmtNum lokal, bukan fmtRp.

function lapSalesLabel(kode) {
  const s = LAP_SALESMAN.find(x => x.kode === kode);
  return s ? `${s.kode} - ${s.nama}` : '';
}

function lapKomisiFiltered(f) {
  return LAP_KOMISI_TRX.filter(r => {
    if (f.tglAwal && r.tglBayarAkhir < f.tglAwal) return false;
    if (f.tglAkhir && r.tglBayarAkhir > f.tglAkhir) return false;
    const sales = LAP_SALESMAN.find(s => s.kode === r.kodeSales);
    if (!sales || sales.jenis !== f.jenisSales) return false;
    if (f.kodeSales && r.kodeSales !== f.kodeSales) return false;
    if (f.customerFilter) {
      const match = r.customer.toLowerCase().includes(f.customerFilter.toLowerCase());
      if (f.customerMode === 'KECUALI' ? match : !match) return false;
    }
    if (r.status !== f.statusFilter) return false;
    if (f.komisiZero === 'TIDAK' && r.komisiRp === 0) return false;
    return true;
  });
}

// `width` (%) dikasih eksplisit spy table-layout:fixed (styles.css) bagi lebar kertas A4 proporsional
// drpd rata sama besar utk 15 kolom ini.
const LAP_KOMISI_COLS = [
  { key:'tglNota', label:'Tgl.Nota', align:'center', width:'6%' },
  { key:'noNota', label:'No. Nota', width:'7%' },
  { key:'tglOrder', label:'Tgl.Order', align:'center', width:'6%' },
  { key:'customer', label:'Customer', width:'10%' },
  { key:'topKomisi', label:'TOP Komisi', align:'right', width:'6%' },
  { key:'tglBayarAkhir', label:'Tgl.Bayar akhir', align:'center', width:'6%' },
  { key:'noBayarAkhir', label:'No.Bayar akhir', width:'7%' },
  { key:'dasarBruto', label:'Dasar Bruto Rp.', align:'right', width:'7%' },
  { key:'fee1', label:'Fee1 (DT) Rp.', align:'right', width:'6%' },
  { key:'fee2', label:'Fee2 (Org) Rp.', align:'right', width:'6%' },
  { key:'fee3', label:'Fee3 (Org) Rp.', align:'right', width:'6%' },
  { key:'potBayar', label:'Pot.Bayar Rp.', align:'right', width:'6%' },
  { key:'dasarNetto', label:'Dasar Netto Rp.', align:'right', width:'7%' },
  { key:'komisiPct', label:'Komisi %', align:'right', width:'5%' },
  { key:'komisiRp', label:'KOMISI Salesman Rp.', align:'right', width:'8%' },
];

function lapKomisiRowsToPrint(rows) {
  return rows.map(r => ({
    tglNota: lapFmtTgl(r.tglNota), noNota: r.noNota, tglOrder: lapFmtTgl(r.tglOrder), customer: r.customer,
    topKomisi: r.topKomisi, tglBayarAkhir: lapFmtTgl(r.tglBayarAkhir), noBayarAkhir: r.noBayarAkhir,
    dasarBruto: lapFmtNum(r.dasarBruto), fee1: lapFmtNum(r.fee1), fee2: lapFmtNum(r.fee2), fee3: lapFmtNum(r.fee3),
    potBayar: lapFmtNum(r.potBayar), dasarNetto: lapFmtNum(r.dasarNetto), komisiPct: r.komisiPct.toFixed(2),
    komisiRp: lapFmtNum(r.komisiRp),
  }));
}

const LAP_FEE_COLS = [
  { key:'noNota', label:'No. Nota', width:'7%' }, { key:'tglOrder', label:'Tgl.Order', align:'center', width:'6%' },
  { key:'customer', label:'Customer', width:'10%' }, { key:'sales', label:'Sales', width:'6%' },
  { key:'tglBayarAkhir', label:'Tgl. Bayar akhir', align:'center', width:'7%' }, { key:'noBayarAkhir', label:'No.Bayar akhir', width:'7%' },
  { key:'penerimaFee', label:'Penerima FEE', width:'11%' }, { key:'alamat', label:'Alamat', width:'14%' },
  { key:'noKtp', label:'No. KTP', width:'9%' }, { key:'noHp', label:'No. HP', width:'8%' },
  { key:'bank', label:'Bank', width:'6%' }, { key:'rekening', label:'Rekening', width:'9%' },
  { key:'totalKf', label:'Total KF Rp.', align:'right', width:'8%' },
];

function lapFeeRowsToPrint(rows, tier) {
  const feeKey = 'fee' + tier, penerimaKey = 'penerimaFee' + tier;
  return rows.map(r => {
    const p = r[penerimaKey];
    return {
      noNota: r.noNota, tglOrder: lapFmtTgl(r.tglOrder), customer: r.customer, sales: r.kodeSales,
      tglBayarAkhir: lapFmtTgl(r.tglBayarAkhir), noBayarAkhir: r.noBayarAkhir,
      penerimaFee: p?.nama || '—', alamat: p?.alamat || '-', noKtp: p?.noKtp || '-', noHp: p?.noHp || '-',
      bank: p?.bank || '-', rekening: p?.rekening || '-', totalKf: lapFmtNum(r[feeKey] || 0),
    };
  });
}

const LAP_BULAN = ['Januari','Pebruari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','Nopember','Desember'];
const LAP_BULAN_KEYS = LAP_BULAN.map((_,i) => `b${i}`);

function lapKomisiTahunanPivot(tahun, jenisSales) {
  const salesmen = LAP_SALESMAN.filter(s => s.jenis === jenisSales);
  const rows = salesmen.map(s => {
    const perBulan = LAP_BULAN.map((_, bi) => {
      const bulanStr = String(bi + 1).padStart(2, '0');
      const sum = LAP_KOMISI_TRX
        .filter(r => r.kodeSales === s.kode && r.status === 'Dibayar' && r.tglBayarAkhir.startsWith(`${tahun}-${bulanStr}`))
        .reduce((acc, r) => acc + r.komisiRp, 0);
      return sum / 1000; // Dalam Ribuan Rupiah
    });
    const total = perBulan.reduce((a, b) => a + b, 0);
    return { nama: s.nama, perBulan, total, rataRata: total / 12 };
  });
  const totalsPerBulan = LAP_BULAN.map((_, bi) => rows.reduce((a, r) => a + r.perBulan[bi], 0));
  const grandTotal = rows.reduce((a, r) => a + r.total, 0);
  return { rows, totalsPerBulan, grandTotal, grandRata: grandTotal / 12 };
}

const LAP_TAHUNAN_COLS = [
  { key:'nama', label:'Nama', width:'12%' },
  ...LAP_BULAN.map((b, i) => ({ key:`b${i}`, label:b, align:'right', width:'6%' })),
  { key:'total', label:'T O T A L', align:'right', width:'8%' },
  { key:'rataRata', label:'Rata-Rata', align:'right', width:'8%' },
];

function LapKomisiPeriodeSection() {
  const [mode, setMode] = React.useState('KOMISI'); // KOMISI | REKAPFEE | VOUCHERFEE
  const [tglAwal, setTglAwal] = React.useState('2026-01-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-01-31');
  const [kodeSales, setKodeSales] = React.useState('');
  const [jenisSales, setJenisSales] = React.useState('Salesman');
  const [customerFilter, setCustomerFilter] = React.useState('');
  const [customerMode, setCustomerMode] = React.useState('PILIH');
  const [statusFilter, setStatusFilter] = React.useState('Dibayar');
  const [komisiZero, setKomisiZero] = React.useState('TIDAK');
  const [kfTier, setKfTier] = React.useState(1);

  const filtered = React.useMemo(() => lapKomisiFiltered({
    tglAwal, tglAkhir, kodeSales, jenisSales, customerFilter, customerMode, statusFilter, komisiZero,
  }), [tglAwal, tglAkhir, kodeSales, jenisSales, customerFilter, customerMode, statusFilter, komisiZero]);

  const infoLines = [
    `${jenisSales} : ${kodeSales ? lapSalesLabel(kodeSales) : 'Semua'}`,
    `Tanggal : ${lapFmtTgl(tglAwal)} sd ${lapFmtTgl(tglAkhir)}`,
  ];

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  const radioRow = (label, value, opts, onChange) => (
    <div className="field">
      <label>{label}</label>
      <div style={{display:'flex', gap:14}}>
        {opts.map(o => (
          <label key={o.value} style={{display:'flex', alignItems:'center', gap:5, fontSize:13}}>
            <input type="radio" checked={value===o.value} onChange={()=>onChange(o.value)} /> {o.label}
          </label>
        ))}
      </div>
    </div>
  );

  let body;
  if (mode === 'KOMISI') {
    const rows = lapKomisiRowsToPrint(filtered);
    const footerRow = { customer:'', tglNota:'', noNota:'', tglOrder:'', topKomisi:'', tglBayarAkhir:'', noBayarAkhir:'',
      dasarBruto:'', fee1:'', fee2:'', fee3:'', potBayar:'', dasarNetto:'TOTAL', komisiPct:'',
      komisiRp: lapFmtNum(filtered.reduce((a,r)=>a+r.komisiRp,0)) };
    body = <LapCetakPage docTitle="Komisi Salesman" metaRight={lapFmtTglNow()} infoLines={infoLines}
      columns={LAP_KOMISI_COLS} rows={rows} footerRow={footerRow} emptyMsg="Tidak ada nota pada periode & filter ini." />;
  } else {
    const title = mode === 'REKAPFEE' ? `REKAP FEE KF${kfTier}` : `VOUCHER FEE KF${kfTier}`;
    // Tidak difilter fee>0 — persis referensi (Rekap Fee tetap menampilkan baris dgn Total KF 0).
    const rows = lapFeeRowsToPrint(filtered, kfTier);
    const footerRow = { noNota:'', tglOrder:'', customer:'', sales:'', tglBayarAkhir:'', noBayarAkhir:'',
      penerimaFee:'', alamat:'', noKtp:'', noHp:'', bank:'', rekening:'TOTAL',
      totalKf: lapFmtNum(filtered.reduce((a,r)=>a+(r['fee'+kfTier]||0),0)) };
    body = <LapCetakPage docTitle={title} metaRight={lapFmtTglNow()} infoLines={infoLines}
      columns={LAP_FEE_COLS} rows={rows} footerRow={footerRow} emptyMsg="Tidak ada data fee pada tier ini." />;
  }

  return (
    <LapReportShell
      onCetak={doCetak}
      footNote={`${filtered.length} baris`}
      filterPanel={
        <>
          <h3>Komisi Salesman</h3>
          <LapDateRangeField label="Tanggal Bayar" awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir}
            note="(Tdk Termasuk *UM & *P)" />
          <div className="field"><label>Sales / SPV / Mgr</label>
            <select className="select" value={kodeSales} onChange={e=>setKodeSales(e.target.value)}>
              <option value="">— Semua —</option>
              {LAP_SALESMAN.filter(s=>s.jenis===jenisSales).map(s => <option key={s.kode} value={s.kode}>{s.kode} - {s.nama}</option>)}
            </select>
          </div>
          {radioRow('', jenisSales, [{value:'Salesman',label:'Salesman'},{value:'SPV/Mgr',label:'SPV/Mgr'}], v=>{setJenisSales(v); setKodeSales('');})}
          <div className="field"><label>Customer</label><input className="input" placeholder="Kosongkan = semua" value={customerFilter} onChange={e=>setCustomerFilter(e.target.value)} /></div>
          {radioRow('', customerMode, [{value:'PILIH',label:'Pilih'},{value:'KECUALI',label:'Kecuali'}], setCustomerMode)}
          {radioRow('Status', statusFilter, [{value:'Dibayar',label:'Dibayar'},{value:'Hangus',label:'Hangus'}], setStatusFilter)}
          {radioRow('Komisi = 0?', komisiZero, [{value:'TIDAK',label:'Tidak'},{value:'CAMPUR',label:'Campur'}], setKomisiZero)}
          <hr style={{border:'none', borderTop:'1px solid var(--border)', margin:'4px 0'}} />
          {radioRow('Dokumen', mode, [{value:'KOMISI',label:'Komisi'},{value:'REKAPFEE',label:'Rekap Fee'},{value:'VOUCHERFEE',label:'Voucher Fee'}], setMode)}
          {mode !== 'KOMISI' && (
            <div className="field"><label>Tier Fee</label>
              <div style={{display:'flex', gap:10}}>
                {[1,2,3,4,5].map(n => (
                  <label key={n} style={{display:'flex', alignItems:'center', gap:4, fontSize:13}}>
                    <input type="radio" checked={kfTier===n} onChange={()=>setKfTier(n)} /> KF{n}
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      }
      previewChildren={body}
    />
  );
}

function LapKomisiTahunanSection() {
  const [tahun, setTahun] = React.useState(2026);
  const [jenisSales, setJenisSales] = React.useState('Salesman');

  const pivot = React.useMemo(() => lapKomisiTahunanPivot(tahun, jenisSales), [tahun, jenisSales]);

  const rows = pivot.rows.map(r => {
    const o = { nama: r.nama, total: lapFmtNum(r.total * 1000), rataRata: lapFmtNum(r.rataRata * 1000) };
    LAP_BULAN.forEach((_, i) => { o[`b${i}`] = lapFmtNum(r.perBulan[i] * 1000); });
    return o;
  });
  const footerRow = { nama:'' };
  LAP_BULAN.forEach((_, i) => { footerRow[`b${i}`] = lapFmtNum(pivot.totalsPerBulan[i] * 1000); });
  footerRow.total = lapFmtNum(pivot.grandTotal * 1000);
  footerRow.rataRata = lapFmtNum(pivot.grandRata * 1000);

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <LapReportShell
      onCetak={doCetak}
      footNote={`Tahun ${tahun}`}
      filterPanel={
        <>
          <h3>Komisi Salesman Tahunan</h3>
          <div style={{display:'flex', gap:14, marginBottom:4}}>
            <label style={{display:'flex', alignItems:'center', gap:5, fontSize:13}}>
              <input type="radio" checked={jenisSales==='Salesman'} onChange={()=>setJenisSales('Salesman')} /> Salesman
            </label>
            <label style={{display:'flex', alignItems:'center', gap:5, fontSize:13}}>
              <input type="radio" checked={jenisSales==='SPV/Mgr'} onChange={()=>setJenisSales('SPV/Mgr')} /> SPV / Mgr
            </label>
          </div>
          <div className="field"><label>Tahun</label>
            <input className="input" type="number" value={tahun} onChange={e=>setTahun(+e.target.value || 2026)} />
          </div>
          <div className="muted" style={{fontSize:11}}>(Tdk Termasuk *UM & *P)</div>
        </>
      }
      previewChildren={
        <LapCetakPage docTitle={`KOMISI SALESMAN Tahun ${tahun}  (Dalam Ribuan Rupiah)`}
          metaRight={lapFmtTglNow()}
          columns={LAP_TAHUNAN_COLS} rows={rows} footerRow={footerRow}
          emptyMsg="Tidak ada salesman pada jenis ini." />
      }
    />
  );
}

function LaporanKomisiSalesmanPage() {
  const [tab, setTab] = React.useState('periode');
  return (
    <>
      <div className="page-head">
        <div><h1>Laporan Komisi Salesman</h1><div className="sub">Komisi per periode (Komisi/Rekap Fee/Voucher Fee) & rekap tahunan.</div></div>
      </div>
      <LapPillTabs tabs={[{id:'periode',label:'Laporan Periode'},{id:'tahunan',label:'Laporan Tahunan'}]} active={tab} onSelect={setTab} />
      {tab === 'periode' ? <LapKomisiPeriodeSection /> : <LapKomisiTahunanSection />}
    </>
  );
}
