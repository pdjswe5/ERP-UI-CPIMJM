// Laporan — Kartu Stok: ledger per item, dikelompokkan per item (pola sama Kartu Piutang/Hutang) —
// filter Lokasi (bukan pilih 1 item spt versi awal) supaya SEMUA item di lokasi itu tampil sekaligus,
// persis dokumen referensi "KARTU STOCK BRG.JADI Lokasi: GJ". Sumber data: dataset dummy
// LAP_STOK_ITEMS/LAP_STOK_TRX (data/stok.data.jsx) — transaksi PRODUK/JUAL/KOREKSI/PAKAI meniru
// integrasi Manufaktur/Penjualan tapi datanya dummy (lihat catatan di file data).

const LAP_KARTU_STOK_COLS = [
  { key:'tanggal', label:'Tanggal' }, { key:'nomor', label:'Nomor Bukti' }, { key:'keterangan', label:'Keterangan' },
  { key:'transaksi', label:'Transaksi' }, { key:'debet', label:'Debet', align:'right' },
  { key:'kredit', label:'Kredit', align:'right' }, { key:'saldo', label:'Saldo', align:'right' },
];

function lapKartuStokGroups(items, tglAwalIso, tglAkhirIso) {
  return items.map(item => {
    const ledger = lapStokRunningBalance(lapBuildStokEvents(item.kode, item.lokasi), tglAwalIso, tglAkhirIso);
    const rows = [
      { tanggal: lapFmtTgl(tglAwalIso), nomor:'', keterangan:'Saldo Awal', transaksi:'', debet:'', kredit:'', saldo: lapFmtQty(ledger.saldoAwal) },
      ...ledger.lines.map(l => ({
        tanggal: lapFmtTgl(l.tglIso), nomor: l.noBukti, keterangan: l.keterangan, transaksi: l.tipe,
        debet: l.debet ? lapFmtQty(l.debet) : '', kredit: l.kredit ? lapFmtQty(l.kredit) : '', saldo: lapFmtQty(l.saldo),
      })),
    ];
    const totalDebet = ledger.lines.reduce((s,l)=>s+l.debet,0);
    const totalKredit = ledger.lines.reduce((s,l)=>s+l.kredit,0);
    return {
      label: `Kode : ${item.kode}   ${item.nama} - ${item.satuan}`,
      rows,
      footerRow: { tanggal:'', nomor:'', keterangan:'', transaksi:'', debet: lapFmtQty(totalDebet), kredit: lapFmtQty(totalKredit), saldo:'' },
      hasActivity: ledger.lines.length > 0,
    };
  }).filter(g => g.hasActivity);
}

function LaporanKartuStokPage() {
  const [kodeLokasi, setKodeLokasi] = React.useState('GJ');
  const [tglAwal, setTglAwal] = React.useState('2026-01-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-07-30');

  const items = React.useMemo(() => LAP_STOK_ITEMS.filter(it => !kodeLokasi || it.lokasi === kodeLokasi), [kodeLokasi]);
  const groups = React.useMemo(() => lapKartuStokGroups(items, tglAwal, tglAkhir), [items, tglAwal, tglAkhir]);

  const lokasiNama = LAP_STOK_LOKASI.find(l => l.kode === kodeLokasi)?.nama || 'Semua Lokasi';
  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Kartu Stok</h1><div className="sub">Ledger berjalan per item — saldo awal (checkpoint opname) + Produk/Jual/Koreksi/Pakai periode.</div></div>
      </div>
      <LapReportShell
        onCetak={doCetak}
        footNote={`${groups.length} item aktif`}
        filterPanel={
          <>
            <h3>Kartu Stok</h3>
            <div className="field"><label>Lokasi</label>
              <select className="select" value={kodeLokasi} onChange={e=>setKodeLokasi(e.target.value)}>
                <option value="">Semua Lokasi</option>
                {LAP_STOK_LOKASI.map(l => <option key={l.kode} value={l.kode}>{l.kode} - {l.nama}</option>)}
              </select>
            </div>
            <LapDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
          </>
        }
        previewChildren={
          <LapCetakPage
            docTitle={`KARTU STOCK BRG.JADI Lokasi: ${kodeLokasi || 'Semua'}`}
            metaRight={<>TGL: {lapFmtTgl(tglAwal)} sd. {lapFmtTgl(tglAkhir)}<br/>{lapFmtTglNow()}</>}
            columns={LAP_KARTU_STOK_COLS} rows={[]} groupBy={groups} roomy
            emptyMsg={`Tidak ada pergerakan stok di ${lokasiNama} pada periode ini.`}
          />
        }
      />
    </>
  );
}
