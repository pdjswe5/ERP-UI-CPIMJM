// Penjualan — util kecil: badge status dokumen/konfirmasi & perhitungan total baris item

// Total satu baris item (Sales Order/Invoice/Sales Return/Delivery Order) dari field API asli
function pjLineTotal(r) {
  const jml = +r.Jumlah || 0;
  const hrg = +r.Hrg_Sat || 0;
  const d1 = +r.DiscPros_Det || 0;
  const dRp = +r.DiscNilai_Det || 0;
  return jml * hrg * (1 - d1/100) - dRp;
}

function pjDocStatusPill(v) {
  const s = v || 'DRAFT';
  const cls = ['OPEN','AKTIF','LUNAS'].includes((v||'').toUpperCase()) ? 'approved'
    : (v||'').toUpperCase() === 'BATAL' ? 'cancelled'
    : (v||'').toUpperCase() === 'OUTSTANDING' || (v||'').toUpperCase() === 'PENDING' ? 'pending'
    : !v ? 'draft' : 'pending';
  return <span className={`pill ${cls}`}>{s}</span>;
}

function statusKonfirmasiClass(s) {
  if (s === 'AKTIF') return 'realisasi';
  if (s === 'BATAL') return 'cancelled';
  if (s === 'SELESAI MANUAL') return 'realisasi';
  return 'draft';
}

function progressApprovalClass(p) {
  if (p === 'DISETUJUI') return 'realisasi';
  if (p && p.startsWith('DITOLAK')) return 'cancelled';
  return 'pending';
}
