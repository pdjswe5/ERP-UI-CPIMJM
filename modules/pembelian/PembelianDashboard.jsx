// Pembelian — dashboard modul (tile per sub-halaman)

function PembelianDashboard({ onOpenSub }) {
  const poAktif = PB_PO.filter(p => !p.Batal && p.Status !== 'SELESAI');
  const nilaiPoAktif = poAktif.reduce((s, p) => s + (p.Details||[]).reduce((t,d) => t + pbLineTotal(d), 0), 0);
  const poMenungguProses = PB_PO.filter(p => !p.Batal && !p.Status).length;
  const nilaiNotaBeli = PB_BELI.filter(b => !b.Batal).reduce((s, b) => s + (b.Details||[]).reduce((t,d) => t + pbLineTotal(d), 0), 0);
  const returAktif = PB_RETUR_BELI.filter(r => !r.Batal).length;

  // Grafik tren tiap KPI (Spark kumulatif, hover lihat tanggal+nilai per titik) — pola sama Home,
  // gantikan chart ranking/status yang tadi dihapus.
  const poDetailVal = p => (p.Details||[]).reduce((t,d) => t + pbLineTotal(d), 0);
  const kpis = [
    { label:'Nilai PO Aktif', value: fmtRp(nilaiPoAktif), sub:`${poAktif.length} dari ${PB_PO.length} PO`,
      trend: cumulativeTrend(poAktif, 'Tgl_Bukti', poDetailVal, { displayFn: fmtRp }), trendColor:'var(--primary)' },
    { label:'PO Menunggu Diproses', value: poMenungguProses, sub: poMenungguProses > 0 ? 'Perlu ditindaklanjuti' : 'Semua PO sudah diproses', color: poMenungguProses > 0 ? 'var(--warn)' : null,
      trend: cumulativeTrend(PB_PO.filter(p=>!p.Batal && !p.Status), 'Tgl_Bukti', () => 1, { displayFn: v => `${v} PO` }), trendColor:'var(--warn)' },
    { label:'Nilai Nota Pembelian', value: fmtRp(nilaiNotaBeli), sub:`${PB_BELI.filter(b=>!b.Batal).length} nota aktif`,
      trend: cumulativeTrend(PB_BELI.filter(b=>!b.Batal), 'Tgl_Bukti', poDetailVal, { displayFn: fmtRp }), trendColor:'var(--realisasi)' },
    { label:'Retur Beli Aktif', value: returAktif, sub:`dari ${PB_RETUR_BELI.length} total retur`,
      trend: cumulativeTrend(PB_RETUR_BELI.filter(r=>!r.Batal), 'Tgl_Bukti', () => 1, { displayFn: v => `${v} retur` }), trendColor:'#7c3aed' },
  ];

  const sections = [
    {
      title:'Master & Permintaan',
      count:'3',
      tiles:[
        { id:'pemasok', title:'Katalog Pemasok', badge:`${PB_SUPPLIER.length} pemasok`, icon:I.users(20) },
        { id:'pr', title:'Purchase Request', badge:`${PB_PR.length} PR`, icon:I.invoice(20) },
        { id:'rfq', title:'Request for Quotation', badge:`${PB_RFQ.length} RFQ`, icon:I.invoice(20) },
      ]
    },
    {
      title:'Penawaran & Penerimaan',
      count:'2',
      tiles:[
        { id:'quotation', title:'Quotation', badge:`${PB_QUOTATION.length} quotation`, icon:I.invoice(20) },
        { id:'gr', title:'Goods Receive', badge:`${PB_GR.length} GR`, icon:I.truck(20) },
      ]
    },
    {
      title:'Order & Pembayaran',
      count:'3',
      tiles:[
        { id:'po', title:'Purchase Order', badge:`${PB_PO.length} PO`, icon:I.cart(20) },
        { id:'beli', title:'Nota Pembelian', badge:`${PB_BELI.length} nota`, icon:I.invoice(20) },
        { id:'retur', title:'Retur Beli', badge:`${PB_RETUR_BELI.length} retur`, icon:I.list(20) },
      ]
    },
  ];
  return (
    <ModuleDashboard
      title="Dashboard Pembelian"
      subtitle="Alur pengadaan barang: Purchase Request → RFQ → Quotation → Goods Receive → Purchase Order → Nota Pembelian → Retur Beli."
      kpis={kpis}
      sections={sections}
      activityLog={ACTIVITY_LOG_PEMBELIAN}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}
