// Pembelian — dashboard modul (tile per sub-halaman)

function PembelianDashboard({ onOpenSub }) {
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
      sections={sections}
      activityLog={ACTIVITY_LOG_PEMBELIAN}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}
