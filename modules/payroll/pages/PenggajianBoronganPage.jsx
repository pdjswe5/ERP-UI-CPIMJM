// Payroll — Proses Penggajian Borongan: agregasi Transaksi Produksi Harian per karyawan dalam 1
// periode = Upah Borongan, ditambah base dari Komponen Gaji aktif (Gaji/Tunj Jabatan/Premi Bulanan)
// + field penyesuaian manual (Bonus/Kompensasi, Dedikasi, Loyalitas, Cuti Thn, Kebijakan, Pot Upah —
// diisi user SETELAH diproses, spt kolom² di "RepGajiB Halim.pdf") dikurangi BPJS TK/Kes, Pot PPh,
// SPSI/Sosial -> Total Terima. Tabel hasil dikelompokkan per Bagian dgn baris Sub Total (struktur
// persis PDF referensi). Cetak Slip individual REUSE PrCetakSlipGaji yang sama dgn Penggajian
// Absensi (field slip sudah digeneralisasi jadi pendapatan/potongan) — laporan grouped-per-Bagian
// cukup ditampilkan on-screen (tabel di bawah), tidak dibuat form cetak register terpisah supaya
// scope tetap "mesin borongan umum" sesuai konfirmasi user, bukan replikasi penuh Excel referensi.

function prComputeBoronganBase(karyawan, mutasiRows, produksiHarianRows, periode) {
  const [y, m] = periode.split('-');
  const periodeAkhir = `${y}-${m}-31`;
  const mutasi = prMutasiAktif(karyawan.noInduk, mutasiRows, periodeAkhir);
  const kb = mutasi?.komponenBaru || {};
  const produksiPeriode = produksiHarianRows.filter(p => p.noInduk === karyawan.noInduk && p.tanggal.startsWith(periode));
  const upahBorongan = produksiPeriode.reduce((s,p)=>s+(p.upah||0),0);
  const gaji = kb.gajiPokok || 0;
  return {
    noInduk: karyawan.noInduk, nama: karyawan.nama, kodeBagian: mutasi?.kodeBagian || '',
    jumlahEntriProduksi: produksiPeriode.length, upahBorongan,
    gaji, tunjJabatan: mutasi?.tunjJabatan || 0, premiBln: kb.premiBulanan || 0,
    bpjsTk: gaji * ((mutasi?.potBpjsTkPct || 0) / 100), bpjsKes: gaji * ((mutasi?.potBpjsKesPct || 0) / 100),
    potPph: gaji * ((mutasi?.pph || 0) / 100), potSpsi: mutasi?.potSpsi || 0,
    bonus:0, dedikasi:0, loyalitas:0, cutiThn:0, kebijakan:0, potUpah:0,
  };
}

function prBoronganSlip(row, periode) {
  const total = row.gaji + row.tunjJabatan + row.premiBln + row.upahBorongan + row.bonus + row.dedikasi + row.loyalitas + row.cutiThn + row.kebijakan;
  const totalPotongan = row.bpjsTk + row.bpjsKes + row.potPph + row.potSpsi + row.potUpah;
  return {
    noInduk: row.noInduk, nama: row.nama, kodeBagian: row.kodeBagian, periode,
    total, totalPotongan, totalTerima: total - totalPotongan,
    pendapatan: [
      { label:'Gaji', value: row.gaji }, { label:'Tunj. Jabatan', value: row.tunjJabatan },
      { label:'Premi Bulanan', value: row.premiBln }, { label:'Upah Borongan', value: row.upahBorongan },
      { label:'Bonus/Kompensasi', value: row.bonus }, { label:'Dedikasi', value: row.dedikasi },
      { label:'Loyalitas', value: row.loyalitas }, { label:'Cuti Tahunan', value: row.cutiThn },
      { label:'Kebijakan', value: row.kebijakan },
    ],
    potongan: [
      { label:'BPJS TK', value: row.bpjsTk }, { label:'BPJS Kesehatan', value: row.bpjsKes },
      { label:'Pot. PPh', value: row.potPph }, { label:'SPSI/Sosial', value: row.potSpsi },
      { label:'Potongan Upah', value: row.potUpah },
    ],
  };
}

function PayrollPenggajianBoronganPage({ rows, setRows, karyawanRows, mutasiRows, produksiHarianRows }) {
  const [periode, setPeriode] = React.useState('2026-07');
  const [kodeBagian, setKodeBagian] = React.useState('');
  const [preview, setPreview] = React.useState(null);
  const [cetakBatch, setCetakBatch] = React.useState(null);

  const proses = () => {
    const eligible = karyawanRows.filter(k => produksiHarianRows.some(p => p.noInduk === k.noInduk && p.tanggal.startsWith(periode)));
    const draft = eligible
      .map(k => prComputeBoronganBase(k, mutasiRows, produksiHarianRows, periode))
      .filter(r => !kodeBagian || r.kodeBagian === kodeBagian);
    setPreview(draft);
  };

  const setAdj = (noInduk, key, val) => setPreview(prev => prev.map(r => r.noInduk === noInduk ? { ...r, [key]: val } : r));

  const simpan = () => {
    if (!preview || preview.length === 0) { window.__erpToast && window.__erpToast('Belum ada slip untuk disimpan.'); return; }
    const batch = { id: Date.now(), periode, kodeBagian, tglProses: new Date().toISOString().slice(0,10), slips: preview.map(r => prBoronganSlip(r, periode)) };
    setRows(prev => [batch, ...prev]);
    window.__erpToast && window.__erpToast(`Penggajian Borongan periode ${periode} berhasil disimpan.`);
    setPreview(null);
  };

  const groups = React.useMemo(() => {
    if (!preview) return [];
    const byBagian = {};
    preview.forEach(r => { (byBagian[r.kodeBagian] = byBagian[r.kodeBagian] || []).push(r); });
    return Object.keys(byBagian).sort().map(kode => ({ kode, rows: byBagian[kode] }));
  }, [preview]);

  const totalTerimaBatch = (batch) => batch.slips.reduce((s,x)=>s+x.totalTerima,0);
  const adjInput = (row, key, width=90) => (
    <input className="input mono" type="number" style={{width, textAlign:'right'}} value={row[key]} onChange={e=>setAdj(row.noInduk, key, +e.target.value)} onClick={e=>e.stopPropagation()} />
  );

  return (
    <>
      <div className="page-head">
        <div><h1>Proses Penggajian Borongan</h1><div className="sub">Rekap upah kerja borongan per Bagian dari Transaksi Produksi Harian.</div></div>
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
            <div className="table-toolbar-left"><b>Hasil Proses: {preview.length} karyawan</b> <span className="muted" style={{fontSize:12.5}}>— isi kolom penyesuaian bila perlu, lalu Simpan</span></div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={()=>setCetakBatch({periode, kodeBagian, slips:preview.map(r=>prBoronganSlip(r,periode))})} disabled={preview.length===0}>{I.print()} Pratinjau Cetak</button>
              <button className="btn btn-primary" onClick={simpan}>{I.check()} Simpan</button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data">
              <thead><tr>
                <th>No. Induk</th><th>Nama</th><th className="num">Gaji</th><th className="num">Upah Borongan</th>
                <th className="num">Bonus</th><th className="num">Dedikasi</th><th className="num">Loyalitas</th>
                <th className="num">Cuti Thn</th><th className="num">Kebijakan</th><th className="num">Pot. Upah</th>
                <th className="num">Total Terima</th>
              </tr></thead>
              <tbody>
                {groups.map(g => (
                  <React.Fragment key={g.kode}>
                    <tr className="cetak-register-group"><td colSpan={11}><b>{g.kode} - {PR_BAGIAN.find(b=>b.kode===g.kode)?.nama || g.kode}</b></td></tr>
                    {g.rows.map(r => {
                      const slip = prBoronganSlip(r, periode);
                      return (
                        <tr key={r.noInduk}>
                          <td className="mono">{r.noInduk}</td><td>{r.nama}</td>
                          <td className="num">{fmtRp(r.gaji)}</td><td className="num">{fmtRp(r.upahBorongan)}</td>
                          <td className="num">{adjInput(r,'bonus')}</td><td className="num">{adjInput(r,'dedikasi')}</td>
                          <td className="num">{adjInput(r,'loyalitas')}</td><td className="num">{adjInput(r,'cutiThn')}</td>
                          <td className="num">{adjInput(r,'kebijakan')}</td><td className="num">{adjInput(r,'potUpah')}</td>
                          <td className="num mono"><b>{fmtRp(slip.totalTerima)}</b></td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={10} style={{textAlign:'right'}}><b>Sub Total {g.kode}</b></td>
                      <td className="num mono"><b>{fmtRp(g.rows.reduce((s,r)=>s+prBoronganSlip(r,periode).totalTerima,0))}</b></td>
                    </tr>
                  </React.Fragment>
                ))}
                {groups.length === 0 && <tr><td colSpan={11} className="empty">Tidak ada karyawan dengan data produksi harian periode ini.</td></tr>}
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
