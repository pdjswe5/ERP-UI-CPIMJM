// Keuangan — Buku Besar (Detil): ledger per akun utk SELURUH Chart of Accounts (AKUN_BB), persis
// dokumen referensi "Laporan Buku Besar (Detil)" (uploads/laporan/Laporan Buku Besar (Detil).pdf) —
// sama struktur dgn Laporan Bank (LaporanBankPage.jsx), cuma cakupan akunnya semua, bukan cuma
// Kas/Bank/Giro, plus filter Kode Akun (dari-sd, dropdown — user blm tentu hafal kodenya).

// Debet/Kredit dikelompokkan di bawah header "MUTASI" (2-baris, lihat akBbHeaderGroupRow) — persis
// dokumen referensi.
const AK_BBD_COLS = [
  { key:'tanggal', label:'Tanggal', width:'10%' }, { key:'noBukti', label:'No.Bukti', width:'11%' },
  { key:'transaksi', label:'Transaksi', width:'9%' }, { key:'uraian', label:'Uraian', width:'40%' },
  { key:'debet', label:'Debet', align:'right', width:'10%', group:'MUTASI' }, { key:'kredit', label:'Kredit', align:'right', width:'10%', group:'MUTASI' },
  { key:'saldo', label:'Saldo', align:'right', width:'10%' },
];

function akBbDetilGroups(akunRows, kbgRows, allEvents, kodeDari, kodeSampai, tglAwalIso, tglAkhirIso) {
  return akunRows
    .filter(a => (!kodeDari || a.kode >= kodeDari) && (!kodeSampai || a.kode <= kodeSampai))
    .map(a => {
      const ledger = akBbLedger(a.kode, tglAwalIso, tglAkhirIso, allEvents, akBbSaldoAwalBase(a.kode, kbgRows));
      const rows = [
        { tanggal: akFromIso(tglAwalIso), noBukti:'', transaksi:'', uraian:'Saldo Awal', debet:'', kredit:'', saldo: akBbFmtNum(ledger.saldoAwal) },
        ...ledger.lines.map(l => ({
          tanggal: l.tgl, noBukti: l.noBukti, transaksi: l.transaksi, uraian: l.uraian,
          debet: l.debet ? akBbFmtNum(l.debet) : '', kredit: l.kredit ? akBbFmtNum(l.kredit) : '', saldo: akBbFmtNum(l.saldo),
        })),
      ];
      return {
        label: `${a.kode} - ${a.name}`,
        rows,
        footerRow: { tanggal:'', noBukti:'', transaksi:'', uraian:'', debet: akBbFmtNum(ledger.totalDebet), kredit: akBbFmtNum(ledger.totalKredit), saldo:'' },
      };
    });
}

function LaporanBukuBesarDetailPage({ akunRows, kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows }) {
  const [tglAwal, setTglAwal] = React.useState('2026-04-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-07-31');
  const [kodeDari, setKodeDari] = React.useState('');
  const [kodeSampai, setKodeSampai] = React.useState('');

  const allEvents = React.useMemo(() => akBbAllEvents({
    kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows,
    transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows,
  }), [kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows]);

  const groups = React.useMemo(() => akBbDetilGroups(akunRows, kbgRows, allEvents, kodeDari, kodeSampai, tglAwal, tglAkhir),
    [akunRows, kbgRows, allEvents, kodeDari, kodeSampai, tglAwal, tglAkhir]);

  const sorted = React.useMemo(() => [...akunRows].sort((a,b) => a.kode.localeCompare(b.kode)), [akunRows]);
  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Buku Besar (Detil)</h1><div className="sub">Ledger berjalan per akun — seluruh Chart of Accounts.</div></div>
      </div>
      <AkBbReportShell
        onCetak={doCetak}
        footNote={`${groups.length} akun`}
        filterPanel={
          <>
            <h3>Buku Besar (Detil)</h3>
            <AkBbDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
            <div className="field"><label>Kode Akun</label>
              <select className="select" value={kodeDari} onChange={e=>setKodeDari(e.target.value)}>
                <option value="">— Awal —</option>
                {sorted.map(a => <option key={a.kode} value={a.kode}>{a.kode} - {a.name}</option>)}
              </select>
              <div className="muted" style={{fontSize:11, margin:'3px 0'}}>sd</div>
              <select className="select" value={kodeSampai} onChange={e=>setKodeSampai(e.target.value)}>
                <option value="">— Akhir —</option>
                {sorted.map(a => <option key={a.kode} value={a.kode}>{a.kode} - {a.name}</option>)}
              </select>
              <div className="muted" style={{fontSize:11, marginTop:2}}>Kosongkan = semua akun</div>
            </div>
          </>
        }
        previewChildren={
          <AkBbCetakPage
            docTitle="Laporan Buku Besar (Detil)"
            metaRight={<>Tgl. {akFromIso(tglAwal)} sd {akFromIso(tglAkhir)}<br/>{akBbFmtTglNow()}</>}
            columns={AK_BBD_COLS} rows={[]} groupBy={groups}
            emptyMsg="Tidak ada akun pada rentang kode ini."
          />
        }
      />
    </>
  );
}
