// Penjualan — panel "Ringkasan <Dokumen>" (gaya ERP asli: header biru, Barang (n), Subtotal DPP,
// Tipe Pajak, Total Netto). Perhitungan tidak berubah dari versi sebelumnya.

function PjTotalsCard({ title, itemCount = 0, subtotal, discPct, setDiscPct, discRp, setDiscRp, ppn, setPpn, ppnMode, setPpnMode }) {
  const discAmt = subtotal * ((discPct||0)/100) + (+discRp || 0);
  const dpp = Math.max(0, subtotal - discAmt);
  const ppnAmt = ppnMode === 'Exclude' ? dpp * ((ppn||0)/100) : 0;
  const total = ppnMode === 'Exclude' ? dpp + ppnAmt : dpp;
  return (
    <div className="erp-sum">
      <div className="erp-sum-head">RINGKASAN {String(title || '').toUpperCase()}</div>
      <div className="erp-sum-row"><span>Barang ({itemCount})</span><b className="mono">{fmtRp(subtotal)}</b></div>
      <div className="erp-sum-row">
        <span>Disc (%)</span>
        <input className="input mono" type="number" value={discPct} onChange={e=>setDiscPct(+e.target.value)} />
      </div>
      <div className="erp-sum-row">
        <span>Disc (Rp)</span>
        <input className="input mono" type="number" value={discRp} onChange={e=>setDiscRp(+e.target.value)} />
      </div>
      <div className="erp-sum-row strong"><span>Subtotal DPP</span><b className="mono">{fmtRp(dpp)}</b></div>
      <div className="erp-sum-row">
        <span>PPN (%)</span>
        <input className="input mono" type="number" value={ppn} onChange={e=>setPpn(+e.target.value)} />
      </div>
      <div className="erp-sum-row">
        <span>Tipe Pajak</span>
        <select className="select" value={ppnMode} onChange={e=>setPpnMode(e.target.value)}>
          <option>Exclude</option><option>Include</option>
        </select>
      </div>
      <div className="erp-sum-row"><span>PPN</span><b className="mono">{fmtRp(ppnAmt)}</b></div>
      <div className="erp-sum-total"><span>Total Netto</span><b className="mono">{fmtRp(total)}</b></div>
    </div>
  );
}
