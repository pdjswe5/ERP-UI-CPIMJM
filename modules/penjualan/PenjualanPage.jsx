// Penjualan — router top-level modul: mengangkat 6 array dokumen jadi state, merender
// dashboard atau halaman sub-modul sesuai activeSub.

function PenjualanPage({ activeSub, onSubChange, onNavigate }) {
  // Root-cause fix: setiap data pelanggan/transaksi diangkat jadi state nyata di sini,
  // bukan const global — supaya Tambah/Edit/Simpan benar-benar tersimpan dan terlihat di list.
  const [pelanggan, setPelanggan] = React.useState(PJ_PELANGGAN);
  const [konfirmasi, setKonfirmasi] = React.useState(PJ_KONFIRMASI);
  const [salesOrders, setSalesOrders] = React.useState(SALES_ORDER_SEED);
  const [invoices, setInvoices] = React.useState(INVOICE_SEED);
  const [salesReturns, setSalesReturns] = React.useState(SALES_RETURN_SEED);
  const [deliveryOrders, setDeliveryOrders] = React.useState(DELIVERY_ORDER_SEED);

  if (!activeSub) return (
    <PenjualanDashboard
      onOpenSub={onSubChange} onNavigate={onNavigate}
      pelanggan={pelanggan} konfirmasi={konfirmasi} salesOrders={salesOrders}
      invoices={invoices} salesReturns={salesReturns} deliveryOrders={deliveryOrders}
    />
  );

  return (
    <div className="page" data-screen-label={`04 Penjualan — ${activeSub}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span>
        <a onClick={()=>onSubChange(null)} style={{cursor:'pointer'}}>Penjualan</a><span className="sep">/</span>
        <span className="current">{PJ_SUBS.find(s=>s.id===activeSub)?.label}</span>
      </div>
      {activeSub === 'katalog'    && <KatalogPelangganPage rows={pelanggan} setRows={setPelanggan} />}
      {activeSub === 'konfirmasi' && <KonfirmasiPage rows={konfirmasi} setRows={setKonfirmasi} />}
      {activeSub === 'salesorder' && <SalesOrderPage rows={salesOrders} setRows={setSalesOrders} konfirmasiList={konfirmasi} />}
      {activeSub === 'delivery'   && <DeliveryOrderPage rows={deliveryOrders} setRows={setDeliveryOrders} salesOrderList={salesOrders} />}
      {activeSub === 'invoice'    && <InvoicePage rows={invoices} setRows={setInvoices} salesOrderList={salesOrders} />}
      {activeSub === 'retur'      && <SalesReturnPage rows={salesReturns} setRows={setSalesReturns} salesOrderList={salesOrders} invoiceList={invoices} />}
    </div>
  );
}

window.PenjualanPage = PenjualanPage;
