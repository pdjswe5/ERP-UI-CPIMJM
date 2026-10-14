// Akuntan — router top-level modul: mengangkat AKUN_BB/AKTIVA/JURNAL_MEMO/LABA_RUGI/ARUS_KAS/NERACA
// jadi state, merender dashboard atau halaman sub-modul sesuai activeSub. Pola sama persis dengan
// PenjualanPage.jsx — router cuma pegang state+routing, tiap halaman pegang modal/filter/cetak
// state sendiri.
//
// Root-cause fix: sebelumnya AKUN_BB/AKTIVA/JURNAL_MEMO adalah const array module-level, dan
// tombol Simpan di tiap modal cuma menutup modal + toast tanpa pernah menulis ke array itu —
// Tambah/Edit tidak pernah benar-benar tersimpan. Sama seperti fix yang sudah diterapkan di
// PenjualanPage.jsx/ManufakturPage.jsx, di sini seed data diangkat jadi state nyata lewat
// React.useState, rows/setRows diteruskan ke tiap sub-halaman.

function AkuntanPage({ activeSub, onSubChange, onNavigate }) {
  const [akunRows,     setAkunRows]     = React.useState(AKUN_BB);
  const [aktivaRows,   setAktivaRows]   = React.useState(AKTIVA);
  const [jurnalRows,   setJurnalRows]   = React.useState(JURNAL_MEMO);
  const [labaRugiRows, setLabaRugiRows] = React.useState(LABA_RUGI);
  const [arusKasRows,  setArusKasRows]  = React.useState(ARUS_KAS);
  const [neracaRows,   setNeracaRows]   = React.useState(NERACA);

  if (!activeSub) return (
    <AkuntanDashboard onOpenSub={onSubChange} onNavigate={onNavigate}
      akunRows={akunRows} aktivaRows={aktivaRows} jurnalRows={jurnalRows}
      labaRugiRows={labaRugiRows} arusKasRows={arusKasRows} neracaRows={neracaRows} />
  );

  return (
    <div className="page" data-screen-label={`05 Akuntan — ${activeSub}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span>
        <a onClick={()=>onSubChange(null)} style={{cursor:'pointer'}}>Akuntan</a><span className="sep">/</span>
        <span className="current">{AK_SUBS.find(s=>s.id===activeSub)?.label}</span>
      </div>
      {activeSub==='akun'     && <KatalogAkunPage rows={akunRows} setRows={setAkunRows} />}
      {activeSub==='aktiva'   && <AktivaPage rows={aktivaRows} setRows={setAktivaRows} />}
      {activeSub==='jurnal'   && <JurnalMemorialPage rows={jurnalRows} setRows={setJurnalRows} akunRows={akunRows} />}
      {activeSub==='labarugi' && <LaporanKeuanganPage reportId="labarugi" rows={labaRugiRows} setRows={setLabaRugiRows} />}
      {activeSub==='aruskas'  && <LaporanKeuanganPage reportId="aruskas" rows={arusKasRows} setRows={setArusKasRows} />}
      {activeSub==='neraca'   && <LaporanKeuanganPage reportId="neraca" rows={neracaRows} setRows={setNeracaRows} />}
    </div>
  );
}

window.AkuntanPage = AkuntanPage;
