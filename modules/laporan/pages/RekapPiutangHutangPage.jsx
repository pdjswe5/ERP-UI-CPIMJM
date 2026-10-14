// Laporan — Rekap Piutang & Rekap Hutang (1 halaman, toggle). Kolom persis instruksi user: Nama,
// Kota, Sales, Plafon, Saldo Awal, Penjualan, Pelunasan, Retur, Saldo Akhir, 0-30/31-60/61-90/>90
// hari, Giro Outs., Outs.Titipan. Saldo Awal/Penjualan/Pelunasan/Retur/Saldo Akhir dihitung lewat
// lapBuildArApLedger yg SAMA dipakai Kartu Piutang/Hutang (KartuPiutangHutangPage.jsx) supaya kedua
// laporan itu selalu sinkron. Kota/Plafon/Sales/Saldo Titipan diambil langsung dari PJ_PELANGGAN/
// PB_SUPPLIER (field ini sudah ada di data Penjualan/Pembelian, bukan ditambah baru).

// `width` (%) dikasih eksplisit di sini (laporan 16-kolom terlebar di modul ini, contoh yg dilaporkan
// user meluber keluar kertas) supaya table-layout:fixed (styles.css, .cetak-page-landscape) membagi
// lebar kertas A4 proporsional — "No." sempit, "Nama"/"Kota" lebih lega, sisanya kolom angka rata.
const LAP_REKAP_COLS = [
  { key:'no', label:'No.', align:'right', width:'2.5%' }, { key:'nama', label:'Nama', width:'11%' }, { key:'kota', label:'Kota', width:'7%' },
  { key:'sales', label:'Sales', width:'6%' }, { key:'plafon', label:'Plafon', align:'right', width:'7%' },
  { key:'saldoAwal', label:'Saldo Awal', align:'right', width:'7%' }, { key:'penjualan', label:'Penjualan', align:'right', width:'6.5%' },
  { key:'pelunasan', label:'Pelunasan', align:'right', width:'6.5%' }, { key:'retur', label:'Retur', align:'right', width:'5.5%' },
  { key:'saldoAkhir', label:'Saldo Akhir', align:'right', width:'7%' },
  { key:'b0', label:'0-30 hari', align:'right', width:'5.5%' }, { key:'b31', label:'31-60 hari', align:'right', width:'5.5%' },
  { key:'b61', label:'61-90 hari', align:'right', width:'5.5%' }, { key:'b90', label:'> 90 hari', align:'right', width:'5.5%' },
  { key:'giroOuts', label:'Giro Outs.', align:'right', width:'6%' }, { key:'outsTitipan', label:'Outs.Titipan', align:'right', width:'6%' },
];

function lapRekapRows(partners, items, pelunasanList, kodeKey, tglAwalIso, tglAkhirIso, mode) {
  return partners.map((p, i) => {
    const ledger = lapBuildArApLedger(items, pelunasanList, kodeKey, p.kode, tglAwalIso, tglAkhirIso);
    const outstanding = items.filter(it => it[kodeKey] === p.kode && it.jenis === 'Nota' && it.sisa > 0);
    const bucket = { '0-30':0, '31-60':0, '61-90':0, '>90':0 };
    outstanding.forEach(it => { bucket[lapAgingBucket(it.jthTempo || it.tgl, tglAkhirIso)] += it.sisa; });
    const sisaPlafon = (p.plafon || 0) - ledger.saldoAkhir;
    return {
      no: i + 1, nama: p.nama, kota: p.kota || '-', sales: p.sales || '-',
      plafon: lapFmtNum(p.plafon || 0),
      saldoAwal: lapFmtNum(ledger.saldoAwal), penjualan: lapFmtNum(ledger.penjualan),
      pelunasan: lapFmtNum(ledger.pelunasan), retur: lapFmtNum(ledger.retur), saldoAkhir: lapFmtNum(ledger.saldoAkhir),
      b0: lapFmtNum(bucket['0-30']), b31: lapFmtNum(bucket['31-60']), b61: lapFmtNum(bucket['61-90']), b90: lapFmtNum(bucket['>90']),
      giroOuts: lapFmtNum(lapGiroOutstanding(pelunasanList, kodeKey, p.kode, tglAkhirIso)),
      outsTitipan: lapFmtNum(p.saldoTitipan ? lapResolveTitipan(p.saldoTitipan, tglAkhirIso) : 0),
      sisaPlafon: lapFmtNum(sisaPlafon),
      _num: { saldoAwal: ledger.saldoAwal, penjualan: ledger.penjualan, pelunasan: ledger.pelunasan, retur: ledger.retur, saldoAkhir: ledger.saldoAkhir },
    };
  });
}

function LaporanRekapPiutangHutangPage() {
  const [jenis, setJenis] = React.useState('piutang');
  const [tglAwal, setTglAwal] = React.useState('2026-04-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-08-07');
  const [mode, setMode] = React.useState('PIUTANG'); // PIUTANG | SISA_PLAFON

  const isPiutang = jenis === 'piutang';
  const partners = React.useMemo(() => isPiutang
    ? PJ_PELANGGAN.map(p => ({ kode:p.code, nama:p.name, kota:p.kota, sales:p.kodeSales, plafon:p.plafon, saldoTitipan:p.saldoTitipan }))
    : PB_SUPPLIER.map(p => ({ kode:p.Kode_Supp, nama:p.Nama_Supp, kota:p.Kota, sales:null, plafon:p.Plafon, saldoTitipan:null })),
  [isPiutang]);

  const rows = React.useMemo(() => lapRekapRows(
    partners,
    isPiutang ? SALDO_PIUTANG_ITEMS : SALDO_HUTANG_ITEMS,
    isPiutang ? PELUNASAN_PIUTANG : PELUNASAN_HUTANG,
    isPiutang ? 'kodeCust' : 'kodeSupp',
    tglAwal, tglAkhir, mode,
  ), [partners, isPiutang, tglAwal, tglAkhir, mode]);

  const cols = mode === 'SISA_PLAFON'
    ? [...LAP_REKAP_COLS.slice(0, 10), { key:'sisaPlafon', label:'Sisa Plafon', align:'right' }]
    : LAP_REKAP_COLS;

  const footerRow = {
    no:'', nama:'', kota:'', sales:'', plafon:'TOTAL',
    saldoAwal: lapFmtNum(rows.reduce((s,r)=> s + r._num.saldoAwal, 0)),
    penjualan: lapFmtNum(rows.reduce((s,r)=> s + r._num.penjualan, 0)),
    pelunasan: lapFmtNum(rows.reduce((s,r)=> s + r._num.pelunasan, 0)),
    retur: lapFmtNum(rows.reduce((s,r)=> s + r._num.retur, 0)),
    saldoAkhir: lapFmtNum(rows.reduce((s,r)=> s + r._num.saldoAkhir, 0)),
    b0:'', b31:'', b61:'', b90:'', giroOuts:'', outsTitipan:'', sisaPlafon:'',
  };

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Rekap Piutang dan Hutang</h1><div className="sub">Ringkasan saldo per pelanggan/supplier, umur piutang, & sisa plafon.</div></div>
      </div>
      <LapPillTabs tabs={[{id:'piutang',label:'Rekap Piutang'},{id:'hutang',label:'Rekap Hutang'}]} active={jenis} onSelect={setJenis} />
      <LapReportShell
        onCetak={doCetak}
        footNote={`${rows.length} ${isPiutang ? 'customer' : 'supplier'}`}
        filterPanel={
          <>
            <h3>{isPiutang ? 'Rekap Piutang' : 'Rekap Hutang'}</h3>
            <LapDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
            <div className="field"><label>Tampilkan</label>
              <div style={{display:'flex', gap:14}}>
                <label style={{display:'flex', alignItems:'center', gap:5, fontSize:13}}>
                  <input type="radio" checked={mode==='PIUTANG'} onChange={()=>setMode('PIUTANG')} /> {isPiutang ? 'Piutang' : 'Hutang'}
                </label>
                <label style={{display:'flex', alignItems:'center', gap:5, fontSize:13}}>
                  <input type="radio" checked={mode==='SISA_PLAFON'} onChange={()=>setMode('SISA_PLAFON')} /> Sisa Plafon
                </label>
              </div>
            </div>
          </>
        }
        previewChildren={
          <LapCetakPage
            docTitle={`REKAP ${isPiutang ? 'PIUTANG' : 'HUTANG'}`} metaRight={lapFmtTglNow()}
            infoLines={[`Tgl. ${lapFmtTgl(tglAwal)} sd ${lapFmtTgl(tglAkhir)}`]}
            columns={cols} rows={rows} footerRow={footerRow}
            emptyMsg={`Tidak ada ${isPiutang ? 'customer' : 'supplier'}.`}
          />
        }
      />
    </>
  );
}
