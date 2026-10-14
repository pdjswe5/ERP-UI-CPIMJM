// Laporan — Rincian Nota Piutang & Hutang (1 halaman, toggle). Dikoreksi dari analisa dokumen
// referensi asli "Perincian Nota Piutang (Belum+Sudah Lunas)" (uploads/laporan) — kolom & struktur
// SEBELUMNYA (No.Bukti/Jenis/Customer/Jth.Tempo/Nilai/Sisa/Status flat) TIDAK cocok dgn referensi;
// bentuk aslinya dikelompokkan per partner (spt Kartu Piutang/Hutang) dgn kolom Tanggal/Nomor/Sales/
// J.T Tercetak/J.T REAL/Tgl.Lunas/Nilai/Retur/Pembayaran/Sisa Nota, ditutup blok Plafon/Sisa Titipan/
// Outs.GIRO/Outs.SO per partner + Grand Total di akhir. Hanya nota (jenis='Nota') yg didaftar, persis
// referensi — Retur/Uang Muka tidak muncul sbg baris sendiri di sini (skema jenis='Retur' tidak
// dikaitkan ke nota tertentu di data ini, jadi kolom Retur per-baris disederhanakan jadi 0).
// J/T Tercetak & J/T REAL sengaja disamakan (keduanya = jthTempo) krn app ini cuma py 1 field jatuh
// tempo per nota, beda dari sistem asli yg py 2 konsep due-date terpisah.

const LAP_RINCIAN_COLS = [
  { key:'tanggal', label:'Tanggal' }, { key:'nomor', label:'Nomor' }, { key:'sales', label:'Sales' },
  { key:'jtTercetak', label:'J/T Tercetak' }, { key:'jtReal', label:'J/T REAL' }, { key:'tglLunas', label:'Tgl.Lunas' },
  { key:'nilai', label:'Nilai', align:'right' }, { key:'retur', label:'Retur', align:'right' },
  { key:'pembayaran', label:'Pembayaran', align:'right' }, { key:'sisaNota', label:'Sisa Nota', align:'right' },
];

function lapRincianGroups(partners, items, pelunasanList, kodeKey, kodeDari, kodeSampai, tglAwalIso, tglAkhirIso, statusFilter) {
  const groups = [];
  const grand = { nilai:0, retur:0, pembayaran:0, sisaNota:0 };

  partners.filter(p => lapCodeInRange(p.kode, kodeDari, kodeSampai)).forEach(p => {
    const notas = items.filter(it => {
      if (it[kodeKey] !== p.kode || it.jenis !== 'Nota') return false;
      const tglIso = lapDmyToIso(it.tgl);
      if (tglIso < tglAwalIso || tglIso > tglAkhirIso) return false;
      const lunas = it.sisa <= 0;
      if (statusFilter === 'LUNAS' && !lunas) return false;
      if (statusFilter === 'BELUM' && lunas) return false;
      return true;
    }).sort((a,b) => lapDmyToIso(a.tgl).localeCompare(lapDmyToIso(b.tgl)));
    if (notas.length === 0) return;

    const rows = notas.map(it => {
      const pembayaran = it.nilai - it.sisa;
      grand.nilai += it.nilai; grand.pembayaran += pembayaran; grand.sisaNota += it.sisa;
      return {
        tanggal: lapFmtTgl(lapDmyToIso(it.tgl)), nomor: it.noBukti, sales: p.sales || '-',
        jtTercetak: it.jthTempo ? lapFmtTgl(lapDmyToIso(it.jthTempo)) : '-',
        jtReal: it.jthTempo ? lapFmtTgl(lapDmyToIso(it.jthTempo)) : '-',
        tglLunas: (() => { const l = lapFindTglLunas(it.noBukti, it.sisa, pelunasanList); return l ? lapFmtTgl(l) : '-'; })(),
        nilai: lapFmtNum(it.nilai), retur: lapFmtNum(0), pembayaran: lapFmtNum(pembayaran), sisaNota: lapFmtNum(it.sisa),
      };
    });
    const subNilai = notas.reduce((s,it)=>s+it.nilai,0);
    const subSisa = notas.reduce((s,it)=>s+it.sisa,0);
    groups.push({
      label: `${p.nama} (${p.kode})   -   ${p.alamat || ''}`,
      rows,
      footerRow: { tanggal:'', nomor:'', sales:'', jtTercetak:'', jtReal:'', tglLunas:`Total ${p.nama}`,
        nilai: lapFmtNum(subNilai), retur: lapFmtNum(0), pembayaran: lapFmtNum(subNilai - subSisa), sisaNota: lapFmtNum(subSisa) },
      infoRow: (
        <div style={{display:'flex', gap:24, fontSize:13}}>
          <span>Plafon <b>{lapFmtNum(p.plafon || 0)}</b></span>
          <span>Sisa Titipan <b>{lapFmtNum(p.saldoTitipan ? lapResolveTitipan(p.saldoTitipan, tglAkhirIso) : 0)}</b></span>
          <span>Outs.GIRO <b>{lapFmtNum(lapGiroOutstanding(pelunasanList, kodeKey, p.kode, tglAkhirIso))}</b></span>
          <span>Outs.SO <b>0.00</b></span>
        </div>
      ),
    });
  });

  return { groups, grand };
}

function LaporanRincianNotaPage() {
  const [jenisPartner, setJenisPartner] = React.useState('piutang');
  const [tglAwal, setTglAwal] = React.useState('2026-01-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-08-07');
  const [kodeDari, setKodeDari] = React.useState('');
  const [kodeSampai, setKodeSampai] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const isPiutang = jenisPartner === 'piutang';
  const partners = React.useMemo(() => isPiutang
    ? PJ_PELANGGAN.map(p => ({ kode:p.code, nama:p.name, alamat:p.alamat, sales:p.namaSales, plafon:p.plafon, saldoTitipan:p.saldoTitipan }))
    : PB_SUPPLIER.map(p => ({ kode:p.Kode_Supp, nama:p.Nama_Supp, alamat:p.Alamat, sales:null, plafon:p.Plafon, saldoTitipan:null })),
  [isPiutang]);

  const { groups, grand } = React.useMemo(() => lapRincianGroups(
    partners,
    isPiutang ? SALDO_PIUTANG_ITEMS : SALDO_HUTANG_ITEMS,
    isPiutang ? PELUNASAN_PIUTANG : PELUNASAN_HUTANG,
    isPiutang ? 'kodeCust' : 'kodeSupp',
    kodeDari, kodeSampai, tglAwal, tglAkhir, statusFilter,
  ), [partners, isPiutang, kodeDari, kodeSampai, tglAwal, tglAkhir, statusFilter]);

  const totalNota = groups.reduce((s,g)=>s+g.rows.length,0);
  const grandFooter = { tanggal:'', nomor:'', sales:'', jtTercetak:'', jtReal:'', tglLunas:'Grand Total',
    nilai: lapFmtNum(grand.nilai), retur: lapFmtNum(grand.retur), pembayaran: lapFmtNum(grand.pembayaran), sisaNota: lapFmtNum(grand.sisaNota) };

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Rincian Nota Piutang dan Hutang</h1><div className="sub">Perincian nota (belum + sudah lunas) per pelanggan/supplier.</div></div>
      </div>
      <LapPillTabs tabs={[{id:'piutang',label:'Nota Piutang'},{id:'hutang',label:'Nota Hutang'}]} active={jenisPartner} onSelect={setJenisPartner} />
      <LapReportShell
        onCetak={doCetak}
        footNote={`${totalNota} nota`}
        filterPanel={
          <>
            <h3>{isPiutang ? 'Perincian Nota Piutang' : 'Perincian Nota Hutang'}</h3>
            <div className="muted" style={{fontSize:11.5, marginBottom:4}}>(Belum+Sudah Lunas)</div>
            <LapDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
            <LapCodeRangeSelectField label={`Kode ${isPiutang ? 'Customer' : 'Supplier'}`} options={partners} dari={kodeDari} sampai={kodeSampai}
              onDari={setKodeDari} onSampai={setKodeSampai} note="Kosongkan = semua" />
            <div className="field"><label>Status</label>
              <select className="select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="">Semua</option>
                <option value="LUNAS">Sudah Lunas</option>
                <option value="BELUM">Belum Lunas</option>
              </select>
            </div>
          </>
        }
        previewChildren={
          <LapCetakPage
            docTitle={`Perincian Nota ${isPiutang ? 'Piutang' : 'Hutang'} (Belum+Sudah Lunas)`}
            metaRight={<>Tgl {lapFmtTgl(tglAwal)} sd {lapFmtTgl(tglAkhir)}<br/>{lapFmtTglNow()}</>}
            columns={LAP_RINCIAN_COLS} rows={[]} groupBy={groups} footerRow={groups.length > 0 ? grandFooter : null} roomy
            emptyMsg="Tidak ada nota pada filter ini."
          />
        }
      />
    </>
  );
}
