// Pembelian — util kecil: badge status dokumen & perhitungan total baris item

function pbStatusPill(status, batal) {
  if (batal) return <span className="pill cancelled">BATAL</span>;
  const s = (status || '').toUpperCase();
  if (s === 'DISETUJUI' || s === 'SELESAI' || s === 'OPEN' || s === 'AKTIF') return <span className="pill approved">{s || 'AKTIF'}</span>;
  if (s === 'DITOLAK') return <span className="pill cancelled">DITOLAK</span>;
  if (!s) return <span className="pill draft">DRAFT</span>;
  return <span className="pill pending">{s}</span>;
}

function pbLineTotal(r) {
  const jml = +r.Jumlah || +r.Qty || 0;
  const hrg = +r.Hrg_Sat || +r.Harga || 0;
  const d1 = +r.DiscPros_Det || +r.Disc1 || 0;
  const d2 = +r.Disc2 || 0;
  const dRp = +r.DiscNilai_Det || +r.DiscRp || 0;
  return jml * hrg * (1 - d1/100) * (1 - d2/100) - dRp;
}
