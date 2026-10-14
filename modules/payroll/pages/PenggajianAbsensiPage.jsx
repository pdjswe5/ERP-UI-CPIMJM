// Payroll — Proses Penggajian Absensi: hitung slip gaji per karyawan (non-borongan) dari Komponen
// Gaji aktif (Mutasi Karyawan terakhir yg berlaku <= akhir periode) + rekap Absensi periode
// terpilih. Field slip PERSIS contoh screenshot "Slip Gaji": GAJI/TUNJ JBT-AN/PREMI BLN-AN/PREMI HD/
// PREMI HARIAN/BONUS/LEMBUR BLN LALU/LEMBUR BLN INI/CUTI THN-AN -> TOTAL, dikurangi POT UPAH/BPJS TK/
// BPJS KES/SOSIAL/KOREKSI UPAH -> TOTAL TERIMA. Hasil proses disimpan sbg batch (histori) di `rows`,
// tiap batch bisa dicetak lewat PrCetakSlipGaji (reuse .cetak-* CSS, components/PrCetakSlipGaji.jsx).

function prComputeSlipAbsensi(karyawan, mutasiRows, absensiRows, periode) {
  const [y, m] = periode.split('-');
  const periodeAkhir = `${y}-${m}-31`;
  const mutasi = prMutasiAktif(karyawan.noInduk, mutasiRows, periodeAkhir);
  const kb = mutasi?.komponenBaru || {};
  const absensiPeriode = absensiRows.filter(a => a.noInduk === karyawan.noInduk && a.tanggal.startsWith(periode));
  const count = (status) => absensiPeriode.filter(a => a.status === status).length;
  const hadir = count('Hadir'), izin = count('Izin'), sakit = count('Sakit'), alpha = count('Alpha'), cuti = count('Cuti');

  const gaji = kb.gajiPokok || 0;
  const tunjJbt = mutasi?.tunjJabatan || 0;
  const premiBln = kb.premiBulanan || 0;
  const premiHd = (kb.premiHadir || 0) * hadir;
  const premiHarian = (kb.premiKhlerPerHari || 0) * hadir;
  const bonus = 0, lemburLalu = 0, lemburIni = 0;
  const cutiThn = cuti * (kb.upahPerhari || 0);
  const total = gaji + tunjJbt + premiBln + premiHd + premiHarian + bonus + lemburLalu + lemburIni + cutiThn;

  const potUpah = alpha * (kb.upahPerhari || 0);
  const potBpjsTk = gaji * ((mutasi?.potBpjsTkPct || 0) / 100);
  const potBpjsKes = gaji * ((mutasi?.potBpjsKesPct || 0) / 100);
  const potSosial = mutasi?.potSpsi || 0;
  const koreksiUpah = 0;
  const totalPotongan = potUpah + potBpjsTk + potBpjsKes + potSosial + koreksiUpah;
  const totalTerima = total - totalPotongan;

  return {
    noInduk: karyawan.noInduk, nama: karyawan.nama, kodeBagian: mutasi?.kodeBagian || '', periode,
    hadir, izin, sakit, alpha, cuti,
    gaji, tunjJbt, premiBln, premiHd, premiHarian, cutiThn, total, totalPotongan, totalTerima,
    pendapatan: [
      { label:'Gaji', value: gaji }, { label:'Tunj. Jabatan', value: tunjJbt },
      { label:'Premi Bulanan', value: premiBln }, { label:'Premi Hadir', value: premiHd },
      { label:'Premi Harian', value: premiHarian }, { label:'Bonus', value: bonus },
      { label:'Lembur Bulan Lalu', value: lemburLalu }, { label:'Lembur Bulan Ini', value: lemburIni },
      { label:'Cuti Tahunan', value: cutiThn },
    ],
    potongan: [
      { label:'Potongan Upah', value: potUpah }, { label:'BPJS TK', value: potBpjsTk },
      { label:'BPJS Kesehatan', value: potBpjsKes }, { label:'Sosial/SPSI', value: potSosial },
      { label:'Koreksi Upah', value: koreksiUpah },
    ],
  };
}

function PayrollPenggajianAbsensiPage({ rows, setRows, karyawanRows, mutasiRows, absensiRows }) {
  const [periode, setPeriode] = React.useState('2026-07');
  const [kodeBagian, setKodeBagian] = React.useState('');
  const [preview, setPreview] = React.useState(null);
  const [cetakBatch, setCetakBatch] = React.useState(null);

  const proses = () => {
    const eligible = karyawanRows.filter(k => absensiRows.some(a => a.noInduk === k.noInduk && a.tanggal.startsWith(periode)));
    const slips = eligible
      .map(k => prComputeSlipAbsensi(k, mutasiRows, absensiRows, periode))
      .filter(s => !kodeBagian || s.kodeBagian === kodeBagian);
    setPreview(slips);
  };

  const simpan = () => {
    if (!preview || preview.length === 0) { window.__erpToast && window.__erpToast('Belum ada slip untuk disimpan.'); return; }
    const batch = { id: Date.now(), periode, kodeBagian, tglProses: new Date().toISOString().slice(0,10), slips: preview };
    setRows(prev => [batch, ...prev]);
    window.__erpToast && window.__erpToast(`Penggajian Absensi periode ${periode} berhasil disimpan.`);
    setPreview(null);
  };

  const totalTerimaBatch = (batch) => batch.slips.reduce((s,x)=>s+x.totalTerima,0);

  return (
    <>
      <div className="page-head">
        <div><h1>Proses Penggajian Absensi</h1><div className="sub">Hitung slip gaji karyawan non-borongan dari Komponen Gaji & Absensi.</div></div>
      </div>

      <div className="panel" style={{marginBottom:20}}>
        <h3>Proses Periode</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 160px', gap:12, marginTop:12, alignItems:'end'}}>
          <div className="field"><label>Periode</label><input className="input" type="month" value={periode} onChange={e=>{setPeriode(e.target.value); setPreview(null);}} /></div>
          <div className="field">
            <label>Bagian (opsional)</label>
            <select className="select" value={kodeBagian} onChange={e=>{setKodeBagian(e.target.value); setPreview(null);}}>
              <option value="">Semua Bagian</option>
              {PR_BAGIAN.map(b => <option key={b.kode} value={b.kode}>{b.kode} - {b.nama}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={proses}>{I.filter()} Proses</button>
        </div>
      </div>

      {preview && (
        <div className="table-card" style={{marginBottom:20}}>
          <div className="table-toolbar">
            <div className="table-toolbar-left"><b>Hasil Proses: {preview.length} karyawan</b></div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={()=>setCetakBatch({periode, kodeBagian, slips:preview})} disabled={preview.length===0}>{I.print()} Pratinjau Cetak</button>
              <button className="btn btn-primary" onClick={simpan}>{I.check()} Simpan</button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data">
              <thead><tr><th>No. Induk</th><th>Nama</th><th className="num">Gaji</th><th className="num">Premi Hd</th><th className="num">Premi Harian</th><th className="num">Cuti Thn</th><th className="num">Total</th><th className="num">Potongan</th><th className="num">Total Terima</th></tr></thead>
              <tbody>
                {preview.length===0 && <tr><td colSpan={9} className="empty">Tidak ada karyawan dengan data absensi periode ini.</td></tr>}
                {preview.map(s => (
                  <tr key={s.noInduk}>
                    <td className="mono">{s.noInduk}</td><td>{s.nama}</td>
                    <td className="num">{fmtRp(s.gaji)}</td><td className="num">{fmtRp(s.premiHd)}</td><td className="num">{fmtRp(s.premiHarian)}</td>
                    <td className="num">{fmtRp(s.cutiThn)}</td><td className="num">{fmtRp(s.total)}</td>
                    <td className="num">{fmtRp(s.totalPotongan)}</td><td className="num mono"><b>{fmtRp(s.totalTerima)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Histori Proses: {rows.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Tgl Proses</th><th>Periode</th><th>Bagian</th><th>Jumlah Karyawan</th><th className="num">Total Terima</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {rows.length===0 && <tr><td colSpan={6} className="empty">Belum ada histori proses.</td></tr>}
              {rows.map(b => (
                <tr key={b.id}>
                  <td>{b.tglProses}</td><td className="mono">{b.periode}</td>
                  <td>{b.kodeBagian ? (PR_BAGIAN.find(x=>x.kode===b.kodeBagian)?.nama || b.kodeBagian) : 'Semua Bagian'}</td>
                  <td>{b.slips.length}</td>
                  <td className="num">{fmtRp(totalTerimaBatch(b))}</td>
                  <td><button className="btn btn-icon btn-sm" title="Cetak" onClick={()=>setCetakBatch(b)}>{I.print()}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cetakBatch && <PrCetakSlipGaji batch={cetakBatch} onClose={()=>setCetakBatch(null)} />}
    </>
  );
}
