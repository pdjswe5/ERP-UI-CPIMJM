// Penjualan — ringkasan subtotal/disc/PPN/total dokumen (layout disamakan dengan PbTotalsCard milik Pembelian)

function PjTotalsCard({ subtotal, discPct, setDiscPct, discRp, setDiscRp, ppn, setPpn, ppnMode, setPpnMode }) {
  const discAmt = subtotal * ((discPct||0)/100) + (+discRp || 0);
  const dpp = Math.max(0, subtotal - discAmt);
  const ppnAmt = ppnMode === 'Exclude' ? dpp * ((ppn||0)/100) : 0;
  const total = ppnMode === 'Exclude' ? dpp + ppnAmt : dpp;
  return (
    <div className="panel" style={{position:'sticky', top:16}}>
      <div style={{fontWeight:700, fontSize:12.5, letterSpacing:'.04em', color:'var(--primary)', background:'var(--primary-50)', padding:'8px 12px', borderRadius:6, marginBottom:12}}>RINGKASAN</div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span>Subtotal</span><b className="mono">{fmtRp(subtotal)}</b></div>
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
        <span style={{flex:1}}>Disc (%)</span>
        <input className="input mono" style={{width:70}} type="number" value={discPct} onChange={e=>setDiscPct(+e.target.value)} />
      </div>
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
        <span style={{flex:1}}>Disc (Rp)</span>
        <input className="input mono" style={{width:110}} type="number" value={discRp} onChange={e=>setDiscRp(+e.target.value)} />
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}><span>DPP</span><b className="mono">{fmtRp(dpp)}</b></div>
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
        <span style={{flex:1}}>PPN (%)</span>
        <input className="input mono" style={{width:70}} type="number" value={ppn} onChange={e=>setPpn(+e.target.value)} />
        <select className="select" style={{width:100}} value={ppnMode} onChange={e=>setPpnMode(e.target.value)}>
          <option>Exclude</option><option>Include</option>
        </select>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}><span>PPN</span><b className="mono">{fmtRp(ppnAmt)}</b></div>
      <div style={{display:'flex', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid var(--border)'}}><span style={{fontWeight:700}}>Total</span><b className="mono" style={{fontSize:16, color:'var(--primary)'}}>{fmtRp(total)}</b></div>
    </div>
  );
}
