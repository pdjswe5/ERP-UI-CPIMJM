// Laporan — Rekap Stok: ditampilkan lewat iframe dokumen referensi asli (uploads/laporan/Rekap
// Stock SABE.pdf) apa adanya — bukan tabel HTML digenerate dari data dummy — supaya datanya PERSIS
// sama dgn contoh yg diberikan user, sama pola dgn AkCetakModal variant="pdf" (modules/keuangan/
// components/AkCetakModal.jsx) yg dipakai Laba Rugi/Arus Kas/Neraca. Panel filter (Lokasi/Tanggal)
// dipertahankan di sisi kiri utk KONSISTENSI TAMPILAN dgn laporan lain di modul ini (Kartu Stok dkk
// semua py filter+pratinjau split-view) — SENGAJA tidak fungsional (dokumennya PDF statis, bukan
// tabel yg bisa difilter ulang), makanya dikasih catatan jelas di bawah field-nya.

const LAP_REKAP_STOK_PDF = 'uploads/laporan/Rekap Stock SABE.pdf';

function LaporanRekapStokPage() {
  const [kodeLokasi, setKodeLokasi] = React.useState('GJ');
  const [tglAwal, setTglAwal] = React.useState('2026-01-01');
  const [tglAkhir, setTglAkhir] = React.useState('2026-07-30');

  const doCetak = () => { window.__erpToast && window.__erpToast('Cetak dikirim ke printer.'); };

  return (
    <>
      <div className="page-head">
        <div><h1>Rekap Stok</h1><div className="sub">Dokumen referensi cetak — Rekap Stock Barang Jadi.</div></div>
      </div>
      <LapReportShell
        onCetak={doCetak}
        footNote="Dokumen referensi"
        filterPanel={
          <>
            <h3>Rekap Stok</h3>
            <LapDateRangeField awal={tglAwal} akhir={tglAkhir} onAwal={setTglAwal} onAkhir={setTglAkhir} />
            <div className="field"><label>Lokasi</label>
              <select className="select" value={kodeLokasi} onChange={e=>setKodeLokasi(e.target.value)}>
                <option value="">Semua Lokasi</option>
                {LAP_STOK_LOKASI.map(l => <option key={l.kode} value={l.kode}>{l.kode} - {l.nama}</option>)}
              </select>
            </div>
            <div className="muted" style={{fontSize:11, marginTop:6}}>
              Filter di atas hanya tampilan — pratinjau di kanan adalah dokumen PDF referensi asli, belum terhubung ke filter ini.
            </div>
          </>
        }
        previewChildren={
          // Dokumennya lebar (tabel banyak kolom, landscape) — beda dari kotak potrait
          // maxWidth:900/aspectRatio:0.75 ala AkCetakModal (dirancang utk Invoice/PO potrait), jadi
          // dipakai penuh mengikuti lebar & tinggi pane pratinjau supaya toolbar PDF viewer bawaan
          // browser (zoom/navigasi halaman-nya sendiri) py ruang cukup, bukan diperkecil paksa.
          <div style={{width:'100%', height:'calc(100vh - 300px)', minHeight:600, background:'#fff', boxShadow:'var(--shadow-lg)'}}>
            <iframe src={encodeURI(LAP_REKAP_STOK_PDF)} title="Rekap Stok" style={{width:'100%', height:'100%', border:'none', display:'block'}} />
          </div>
        }
      />
    </>
  );
}
