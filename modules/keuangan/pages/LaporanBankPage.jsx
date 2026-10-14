// Keuangan — Laporan Bank: ledger per akun Kas/Bank/Giro (KAS_BANK_GIRO), persis dokumen referensi
// "Laporan KAS BANK" (uploads/laporan/Laporan Bank.pdf) — grup per akun, baris Tanggal/Nomor Bukti/
// Debet/Kredit/Saldo berjalan (TANPA kolom Transaksi/Uraian — beda dari Buku Besar Detil, dokumen
// referensi ini memang cuma 5 kolom sempit). Kertas POTRAIT (bukan landscape spt Buku Besar), sesuai
// referensi. Datanya dari transaksi Kas/Bank/Transfer/Pelunasan yg SUDAH ADA di modul ini (lihat
// akBbAllEvents, components/AkBukuBesarShared.jsx) — bukan dataset baru, supaya tetap sinkron kalau
// user tambah/ubah transaksi di menu Kas Masuk/Keluar dkk.

const AK_BANK_COLS = [
  { key:'tanggal', label:'Tanggal', width:'20%' }, { key:'noBukti', label:'Nomor Bukti', width:'30%' },
  { key:'debet', label:'Debet', align:'right', width:'17%' }, { key:'kredit', label:'Kredit', align:'right', width:'17%' },
  { key:'saldo', label:'Saldo', align:'right', width:'16%' },
];

function akBankGroups(kbgRows, allEvents, tglAwalIso, tglAkhirIso) {
  return kbgRows.map(acc => {
    const ledger = akBbLedger(acc.kode, tglAwalIso, tglAkhirIso, allEvents, acc.saldo || 0);
    const rows = [
      { tanggal: akFromIso(tglAwalIso), noBukti:'', debet:'', kredit:'', saldo: akBbFmtNum(ledger.saldoAwal) },
      ...ledger.lines.map(l => ({
        tanggal: l.tgl, noBukti: l.noBukti,
        debet: l.debet ? akBbFmtNum(l.debet) : '', kredit: l.kredit ? akBbFmtNum(l.kredit) : '', saldo: akBbFmtNum(l.saldo),
      })),
    ];
    return {
      label: `${acc.kode} - ${acc.nama}`,
      rows,
      footerRow: { tanggal:'', noBukti:'', debet: akBbFmtNum(ledger.totalDebet), kredit: akBbFmtNum(ledger.totalKredit), saldo:'' },
    };
  });
}
function LaporanBankPage({ kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows }) {
  const [tglAwal, setTglAwal] = React.useState('2026-04-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-07-31');

  const allEvents = React.useMemo(() => akBbAllEvents({
    kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows,
    transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows,
  }), [kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows]);

  const groups = React.useMemo(() => akBankGroups(kbgRows, allEvents, tglAwal, tglAkhir), [kbgRows, allEvents, tglAwal, tglAkhir]);

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Laporan Bank</h1><div className="sub">Ledger berjalan per akun Kas, Bank & Giro — saldo awal + mutasi periode.</div></div>
      </div>
      <AkBbReportShell
        onCetak={doCetak}
        footNote={`${groups.length} akun`}
        filterPanel={
          <>
            <h3>Laporan Bank</h3>
            <AkBbDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
          </>
        }
        previewChildren={
          <AkBbCetakPage
            landscape={false}
            docTitle={`Laporan KAS BANK Tgl. ${akFromIso(tglAwal)} sd ${akFromIso(tglAkhir)}`}
            metaRight={akBbFmtTglNow()}
            columns={AK_BANK_COLS} rows={[]} groupBy={groups}
            emptyMsg="Tidak ada akun Kas/Bank/Giro."
          />
        }
      />
    </>
  );
}
