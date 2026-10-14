// Keuangan — Buku Besar (Rekap Total): 1 baris per akun (Saldo Awal/Mutasi/Saldo Akhir, masing²
// dipecah kolom Debet-Kredit terpisah — gaya neraca saldo/trial balance) — persis dokumen referensi
// "Laporan Buku Besar (Total)" (uploads/laporan/Laporan Buku Besar (Rekap Total).pdf). Sumber angka
// SAMA persis dgn Buku Besar (Detil) (akBbLedger, components/AkBukuBesarShared.jsx) — cuma detail
// baris transaksinya tidak ditampilkan, jadi 2 laporan itu selalu konsisten satu sama lain.

// Kode+nama akun digabung 1 kolom "Perkiraan" (persis referensi — bukan 2 kolom terpisah); 3 pasang
// Debet-Kredit dikelompokkan di bawah header SALDO AWAL/MUTASI/SALDO AKHIR (2-baris, header 2-row
// lihat akBbHeaderGroupRow).
const AK_BBR_COLS = [
  { key:'perkiraan', label:'Perkiraan', width:'30%' },
  { key:'saldoAwalD', label:'Debet', align:'right', width:'11.7%', group:'SALDO AWAL' }, { key:'saldoAwalK', label:'Kredit', align:'right', width:'11.7%', group:'SALDO AWAL' },
  { key:'mutasiD', label:'Debet', align:'right', width:'11.7%', group:'MUTASI' }, { key:'mutasiK', label:'Kredit', align:'right', width:'11.7%', group:'MUTASI' },
  { key:'saldoAkhirD', label:'Debet', align:'right', width:'11.6%', group:'SALDO AKHIR' }, { key:'saldoAkhirK', label:'Kredit', align:'right', width:'11.6%', group:'SALDO AKHIR' },
];

// Neraca saldo: nilai bersih positif (debet-normal) tampil di kolom Debet, negatif (kredit-normal)
// tampil di kolom Kredit (nilai absolut) — sisi yg tdk terpakai dikosongkan, kecuali persis 0 (tampil
// "0.00" di kolom Debet, sama konvensi dokumen referensi).
function akBbSplitDK(n) {
  if (n > 0) return { d: akBbFmtNum(n), k: '' };
  if (n < 0) return { d: '', k: akBbFmtNum(-n) };
  return { d: akBbFmtNum(0), k: '' };
}

function akBbRekapRows(akunRows, kbgRows, allEvents, kodeDari, kodeSampai, tglAwalIso, tglAkhirIso) {
  return akunRows
    .filter(a => (!kodeDari || a.kode >= kodeDari) && (!kodeSampai || a.kode <= kodeSampai))
    .map(a => {
      const ledger = akBbLedger(a.kode, tglAwalIso, tglAkhirIso, allEvents, akBbSaldoAwalBase(a.kode, kbgRows));
      const awal = akBbSplitDK(ledger.saldoAwal);
      const akhir = akBbSplitDK(ledger.saldoAkhir);
      return {
        perkiraan: (
          <div style={{display:'flex', gap:10}}>
            <span style={{minWidth:56, flexShrink:0}}>{a.kode}</span>
            <span>{a.name}</span>
          </div>
        ),
        saldoAwalD: awal.d, saldoAwalK: awal.k,
        mutasiD: akBbFmtNum(ledger.totalDebet), mutasiK: akBbFmtNum(ledger.totalKredit),
        saldoAkhirD: akhir.d, saldoAkhirK: akhir.k,
        _num: { saldoAwalD: ledger.saldoAwal>0?ledger.saldoAwal:0, saldoAwalK: ledger.saldoAwal<0?-ledger.saldoAwal:0,
          mutasiD: ledger.totalDebet, mutasiK: ledger.totalKredit,
          saldoAkhirD: ledger.saldoAkhir>0?ledger.saldoAkhir:0, saldoAkhirK: ledger.saldoAkhir<0?-ledger.saldoAkhir:0 },
      };
    });
}

function LaporanBukuBesarRekapPage({ akunRows, kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows }) {
  const [tglAwal, setTglAwal] = React.useState('2026-04-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-07-31');
  const [kodeDari, setKodeDari] = React.useState('');
  const [kodeSampai, setKodeSampai] = React.useState('');

  const allEvents = React.useMemo(() => akBbAllEvents({
    kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows,
    transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows,
  }), [kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows, transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows]);

  const rows = React.useMemo(() => akBbRekapRows(akunRows, kbgRows, allEvents, kodeDari, kodeSampai, tglAwal, tglAkhir),
    [akunRows, kbgRows, allEvents, kodeDari, kodeSampai, tglAwal, tglAkhir]);

  const sorted = React.useMemo(() => [...akunRows].sort((a,b) => a.kode.localeCompare(b.kode)), [akunRows]);

  const sum = (key) => rows.reduce((s,r) => s + r._num[key], 0);
  const footerRow = {
    perkiraan: 'Grand Total',
    saldoAwalD: akBbFmtNum(sum('saldoAwalD')), saldoAwalK: akBbFmtNum(sum('saldoAwalK')),
    mutasiD: akBbFmtNum(sum('mutasiD')), mutasiK: akBbFmtNum(sum('mutasiK')),
    saldoAkhirD: akBbFmtNum(sum('saldoAkhirD')), saldoAkhirK: akBbFmtNum(sum('saldoAkhirK')),
  };

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Buku Besar (Rekap Total)</h1><div className="sub">Neraca saldo — Saldo Awal, Mutasi, dan Saldo Akhir per akun.</div></div>
      </div>
      <AkBbReportShell
        onCetak={doCetak}
        footNote={`${rows.length} akun`}
        filterPanel={
          <>
            <h3>Buku Besar (Rekap Total)</h3>
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
            docTitle="Laporan Buku Besar (Total)"
            metaRight={<>Tgl. {akFromIso(tglAwal)} sd {akFromIso(tglAkhir)}<br/>{akBbFmtTglNow()}</>}
            columns={AK_BBR_COLS} rows={rows} footerRow={rows.length > 0 ? footerRow : null}
            emptyMsg="Tidak ada akun pada rentang kode ini."
          />
        }
      />
    </>
  );
}
