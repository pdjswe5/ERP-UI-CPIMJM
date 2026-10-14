// Pembelian — router top-level modul: mengangkat 8 array dokumen jadi state, merender
// dashboard atau halaman sub-modul sesuai activeSub.

function PembelianPage({ activeSub, onSubChange, onNavigate }) {
  const [pemasok, setPemasok] = React.useState(PB_SUPPLIER);
  const [pr, setPr] = React.useState(PB_PR);
  const [rfq, setRfq] = React.useState(PB_RFQ);
  const [quotation, setQuotation] = React.useState(PB_QUOTATION);
  const [gr, setGr] = React.useState(PB_GR);
  const [po, setPo] = React.useState(PB_PO);
  const [beli, setBeli] = React.useState(PB_BELI);
  const [retur, setRetur] = React.useState(PB_RETUR_BELI);

  if (!activeSub) return <PembelianDashboard onOpenSub={onSubChange} />;
  const subLabel = MODULE_SUBS.pembelian.find(s => s.id === activeSub)?.label ?? activeSub;
  return (
    <div className="page" data-screen-label={`Pembelian — ${activeSub}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span>
        <a onClick={()=>onSubChange(null)} style={{cursor:'pointer'}}>Pembelian</a><span className="sep">/</span>
        <span className="current">{subLabel}</span>
      </div>
      {activeSub === 'pemasok'   && <PemasokPage rows={pemasok} setRows={setPemasok} />}
      {activeSub === 'pr'        && <PrPage rows={pr} setRows={setPr} />}
      {activeSub === 'rfq'       && <RfqPage rows={rfq} setRows={setRfq} />}
      {activeSub === 'quotation' && <QuotationPage rows={quotation} setRows={setQuotation} />}
      {activeSub === 'gr'        && <GrPage rows={gr} setRows={setGr} />}
      {activeSub === 'po'        && <PoPage rows={po} setRows={setPo} />}
      {activeSub === 'beli'      && <BeliPage rows={beli} setRows={setBeli} />}
      {activeSub === 'retur'     && <ReturBeliPage rows={retur} setRows={setRetur} />}
    </div>
  );
}

window.PembelianPage = PembelianPage;
