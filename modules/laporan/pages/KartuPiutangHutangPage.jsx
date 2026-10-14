// Laporan — Kartu Piutang & Kartu Hutang (1 halaman, toggle Piutang/Hutang persis instruksi user
// "Kartu piutang dan hutang" 1 sub-menu). Ledger per-partner (Kode: XXX - NAMA, baris Saldo Awal +
// transaksi dlm periode + subtotal Debet/Kredit) dihitung lewat lapBuildArApLedger (LapShared.jsx) —
// SATU-SATUNYA sumber angka, dipakai sama persis oleh Rekap Piutang/Hutang & Rincian Nota supaya 3
// laporan itu selalu konsisten satu sama lain. Data dari Keuangan yg SUDAH ADA (SALDO_PIUTANG_ITEMS/
// HUTANG, PELUNASAN_PIUTANG/HUTANG, PJ_PELANGGAN/PB_SUPPLIER) — bukan dataset baru.

const LAP_KARTU_COLS = [
  { key:'tanggal', label:'Tanggal' }, { key:'nomor', label:'Nomor' }, { key:'keterangan', label:'Keterangan' },
  { key:'transaksi', label:'Transaksi' }, { key:'debet', label:'Debet', align:'right' },
  { key:'kredit', label:'Kredit', align:'right' }, { key:'saldo', label:'Saldo', align:'right' },
];

function lapKartuGroups(partners, items, pelunasanList, kodeKey, kodeDari, kodeSampai, tglAwalIso, tglAkhirIso) {
  return partners
    .filter(p => lapCodeInRange(p.kode, kodeDari, kodeSampai))
    .map(p => {
      const ledger = lapBuildArApLedger(items, pelunasanList, kodeKey, p.kode, tglAwalIso, tglAkhirIso);
      const rows = [
        { tanggal: lapFmtTgl(tglAwalIso), nomor:'', keterangan:'Saldo Awal', transaksi:'', debet:'', kredit:'', saldo: lapFmtNum(ledger.saldoAwal) },
        ...ledger.lines.map(l => ({
          tanggal: l.tgl, nomor: l.nomor, keterangan: l.keterangan, transaksi: l.tipe,
          debet: l.debet ? lapFmtNum(l.debet) : '', kredit: l.kredit ? lapFmtNum(l.kredit) : '', saldo: lapFmtNum(l.saldo),
        })),
      ];
      return {
        label: `Kode : ${p.kode}   ${p.nama}`,
        rows,
        footerRow: { tanggal:'', nomor:'', keterangan:'', transaksi:'', debet: lapFmtNum(ledger.totalDebet), kredit: lapFmtNum(ledger.totalKredit), saldo:'' },
      };
    });
}

function LaporanKartuPiutangHutangPage() {
  const [jenis, setJenis] = React.useState('piutang'); // piutang | hutang
  const [tglAwal, setTglAwal] = React.useState('2026-04-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-08-07');
  const [kodeDari, setKodeDari] = React.useState('');
  const [kodeSampai, setKodeSampai] = React.useState('');

  const isPiutang = jenis === 'piutang';
  const partners = React.useMemo(() => isPiutang
    ? PJ_PELANGGAN.map(p => ({ kode:p.code, nama:p.name }))
    : PB_SUPPLIER.map(p => ({ kode:p.Kode_Supp, nama:p.Nama_Supp })),
  [isPiutang]);

  const groups = React.useMemo(() => lapKartuGroups(
    partners,
    isPiutang ? SALDO_PIUTANG_ITEMS : SALDO_HUTANG_ITEMS,
    isPiutang ? PELUNASAN_PIUTANG : PELUNASAN_HUTANG,
    isPiutang ? 'kodeCust' : 'kodeSupp',
    kodeDari, kodeSampai, tglAwal, tglAkhir,
  ), [partners, isPiutang, kodeDari, kodeSampai, tglAwal, tglAkhir]);

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Kartu Piutang dan Hutang</h1><div className="sub">Ledger berjalan per pelanggan/supplier — saldo awal + mutasi periode.</div></div>
      </div>
      <LapPillTabs tabs={[{id:'piutang',label:'Kartu Piutang'},{id:'hutang',label:'Kartu Hutang'}]} active={jenis} onSelect={setJenis} />
      <LapReportShell
        onCetak={doCetak}
        footNote={`${groups.length} ${isPiutang ? 'customer' : 'supplier'}`}
        filterPanel={
          <>
            <h3>{isPiutang ? 'Kartu Piutang' : 'Kartu Hutang'}</h3>
            <LapDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
            <LapCodeRangeSelectField label={`Kode ${isPiutang ? 'Customer' : 'Supplier'}`} options={partners} dari={kodeDari} sampai={kodeSampai}
              onDari={setKodeDari} onSampai={setKodeSampai} note="Kosongkan = semua" />
          </>
        }
        previewChildren={
          <LapCetakPage
            docTitle={`KARTU ${isPiutang ? 'PIUTANG' : 'HUTANG'} TGL: ${lapFmtTgl(tglAwal)} sd. ${lapFmtTgl(tglAkhir)}`}
            metaRight={lapFmtTglNow()}
            columns={LAP_KARTU_COLS} rows={[]} groupBy={groups} roomy
            emptyMsg="Tidak ada partner pada rentang kode ini."
          />
        }
      />
    </>
  );
}
