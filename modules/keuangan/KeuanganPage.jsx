// Keuangan — router top-level modul gabungan Akuntan + Kas/Bank/Giro/Transfer/Pelunasan.
// Pola sama seperti PenjualanPage.jsx/AkuntanPage.jsx (versi lama): router cuma pegang state +
// routing, tiap halaman pegang modal/filter state sendiri.
//
// Root-cause fix: 6 array accounting (AKUN_BB dst.) sudah diangkat jadi state sejak modularisasi
// Akuntan sebelumnya (Simpan-nya sudah beneran nyimpen). 11 array Kas/Bank/Giro/Transfer/Pelunasan
// SEBELUM ini masih const module-level, onSave di router cuma setModal(null)+toast tanpa pernah
// nulis balik — sama pola bug yang sudah diperbaiki di Penjualan/Manufaktur/Akuntan. Di sini
// ke-11 array itu ikut diangkat, dan onSave diganti upsert-by-key beneran (saveToRows).

function KeuanganPage({ activeSub, onSubChange, onNavigate }) {
  // Accounting (dari modul Akuntan)
  const [akunRows, setAkunRows] = React.useState(AKUN_BB);
  const [aktivaRows, setAktivaRows] = React.useState(AKTIVA);
  const [jurnalRows, setJurnalRows] = React.useState(JURNAL_MEMO);
  const [labaRugiRows, setLabaRugiRows] = React.useState(LABA_RUGI);
  const [arusKasRows, setArusKasRows] = React.useState(ARUS_KAS);
  const [neracaRows, setNeracaRows] = React.useState(NERACA);

  // Kas/Bank/Giro/Transfer/Pelunasan (asli Keuangan)
  const [kbgRows, setKbgRows] = React.useState(KAS_BANK_GIRO);
  const [kasMasukRows, setKasMasukRows] = React.useState(KAS_MASUK);
  const [kasKeluarRows, setKasKeluarRows] = React.useState(KAS_KELUAR);
  const [bankMasukRows, setBankMasukRows] = React.useState(BANK_MASUK);
  const [bankKeluarRows, setBankKeluarRows] = React.useState(BANK_KELUAR);
  const [transferMasukRows, setTransferMasukRows] = React.useState(TRANSFER_MASUK);
  const [transferKeluarRows, setTransferKeluarRows] = React.useState(TRANSFER_KELUAR);
  const [giroMasukRows, setGiroMasukRows] = React.useState(GIRO_MASUK);
  const [giroKeluarRows, setGiroKeluarRows] = React.useState(GIRO_KELUAR);
  const [pelunasanPiutangRows, setPelunasanPiutangRows] = React.useState(PELUNASAN_PIUTANG);
  const [pelunasanHutangRows, setPelunasanHutangRows] = React.useState(PELUNASAN_HUTANG);
  // Sisa Nota & Uang Muka per pelanggan/supplier (dipakai popup SaldoPickerModal di PelunasanModal)
  // — diangkat ke state juga supaya konsumsinya (lihat savePelunasan di bawah) persisten selama sesi.
  const [saldoPiutangItems, setSaldoPiutangItems] = React.useState(SALDO_PIUTANG_ITEMS);
  const [saldoHutangItems, setSaldoHutangItems] = React.useState(SALDO_HUTANG_ITEMS);

  const [modal, setModal] = React.useState(null);
  const close = () => setModal(null);
  // Root-cause fix: 9 halaman transaksi Keuangan (Kas/Bank/Transfer/Giro Masuk-Keluar, Pelunasan
  // Piutang/Hutang) sebelumnya tidak punya aksi batal sama sekali di TxPage — beda dari Pembelian/
  // Penjualan/Manufaktur yang semua sudah punya "Batalkan Transaksi". Pola & field (Status:'Batal',
  // Batal:true, Alasan_Status) ditiru persis dari PoPage.jsx/InvoicePage.jsx.
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  // txMap (di bawah) cuma terisi saat activeSub truthy — aman, karena confirmCancel/tombol Batalkan
  // cuma bisa dipicu dari baris TxPage, yang hanya ter-render saat activeSub adalah salah satu kind
  // transaksi ini.
  const cancelFromList = (reason) => {
    txMap[activeSub].setRows(prev => prev.map(r => r.no === confirmCancel.no
      ? { ...r, status:'Batal', Batal:true, Alasan_Status: reason || 'Dibatalkan oleh operator' }
      : r));
    window.__erpToast && window.__erpToast('Transaksi dibatalkan.');
    setConfirmCancel(null);
  };

  // Upsert-by-key generik — pola sama saveToRows di ManufakturPage.jsx/AkuntanPage.jsx (lama).
  // keyField default 'no' (semua dokumen transaksi), KbgModal pakai 'kode' (master akun).
  const saveToRows = (setRows, keyField='no') => (form) => {
    setRows(prev => prev.some(r => r[keyField] === form[keyField])
      ? prev.map(r => r[keyField] === form[keyField] ? form : r)
      : [...prev, form]);
    setModal(null);
    window.__erpToast && window.__erpToast('Transaksi berhasil disimpan.');
  };

  // Pelunasan Piutang/Hutang butuh efek ganda saat Simpan: (a) upsert record pelunasan seperti
  // saveToRows biasa, (b) KHUSUS pelunasan BARU (bukan edit No.Referensi/Catatan doang), kurangi
  // `sisa` tiap Nota/Uang Muka/Retur yang dipakai di SALDO_PIUTANG_ITEMS/SALDO_HUTANG_ITEMS supaya
  // popup pilih nota berikutnya tidak menawarkan sisa yang sudah dipakai, DAN (c) baris Uang Muka
  // yang dibuat lewat tombol "Tambah Uang Muka" (ditandai `isNewUangMuka:true` di PelunasanModal,
  // lihat KuShared.jsx) di-persist jadi record SALDO_*_ITEMS baru dengan sisa penuh — supaya nanti
  // muncul di SaldoPickerModal saat partner yang sama bikin pelunasan berikutnya.
  const savePelunasan = (kind) => (form) => {
    const isPiutang = kind === 'pp';
    const rowsNow = isPiutang ? pelunasanPiutangRows : pelunasanHutangRows;
    const isNew = !rowsNow.some(r => r.no === form.no);
    const setRows = isPiutang ? setPelunasanPiutangRows : setPelunasanHutangRows;
    setRows(prev => prev.some(r => r.no === form.no) ? prev.map(r => r.no === form.no ? form : r) : [...prev, form]);
    if (isNew) {
      const setSaldo = isPiutang ? setSaldoPiutangItems : setSaldoHutangItems;
      setSaldo(prev => {
        const afterConsume = prev.map(it => {
          const used = (form.items || []).find(f => f.noBukti === it.noBukti);
          if (!used) return it;
          const consumed = (+used.debet || 0) + (+used.kredit || 0);
          return { ...it, sisa: Math.max(0, it.sisa - consumed) };
        });
        const newUm = (form.items || []).filter(it => it.isNewUangMuka).map(it => ({
          id: `saldo-${it.noBukti}`, jenis:'Uang Muka',
          [isPiutang?'kodeCust':'kodeSupp']: form[isPiutang?'kodeCust':'kodeSupp'],
          [isPiutang?'namaCust':'namaSupp']: form[isPiutang?'namaCust':'namaSupp'],
          noBukti: it.noBukti, tgl: form.tgl, jthTempo:'', nilai: it.kredit, sisa: it.kredit,
        }));
        return [...afterConsume, ...newUm];
      });
    }
    setModal(null);
    window.__erpToast && window.__erpToast('Pelunasan berhasil disimpan.');
  };

  // Cetak Pelunasan Piutang/Hutang — AkCetakModal variant="pelunasan" (lihat AkCetakModal.jsx),
  // dokumennya beda bentuk dari Jurnal (items[]/penerimaan[] terpisah, bukan 1 ledger debit/kredit).
  // cetakDoc null = modal tertutup; row null (dipicu tombol "Cetak" header) = semua dokumen
  // ke-select default; row terisi (dipicu icon Cetak per baris) = cuma baris itu yang ke-select.
  const [cetakDoc, setCetakDoc] = React.useState(null);

  if (!activeSub) return (
    <KeuanganDashboard onOpenSub={onSubChange} onNavigate={onNavigate}
      akunRows={akunRows} aktivaRows={aktivaRows} jurnalRows={jurnalRows}
      labaRugiRows={labaRugiRows} arusKasRows={arusKasRows} neracaRows={neracaRows}
      kbgRows={kbgRows} kasMasukRows={kasMasukRows} kasKeluarRows={kasKeluarRows}
      bankMasukRows={bankMasukRows} bankKeluarRows={bankKeluarRows}
      giroMasukRows={giroMasukRows} giroKeluarRows={giroKeluarRows}
      pelunasanPiutangRows={pelunasanPiutangRows} pelunasanHutangRows={pelunasanHutangRows} />
  );

  const subLabel = KU_SUBS.find(s=>s.id===activeSub)?.label
    || (typeof MODULE_SUBS !== 'undefined' ? MODULE_SUBS.keuangan?.find(s=>s.id===activeSub)?.label : null);
  const totalForKind = (kind) => {
    const sum = (arr) => arr.reduce((s,r)=>s+(r.nominal||r.total||0),0);
    return ({
      km: sum(kasMasukRows), kk: sum(kasKeluarRows), bm: sum(bankMasukRows), bk: sum(bankKeluarRows),
      tm: sum(transferMasukRows), tk: sum(transferKeluarRows), gm: sum(giroMasukRows), gk: sum(giroKeluarRows),
      pp: sum(pelunasanPiutangRows), ph: sum(pelunasanHutangRows),
    })[kind] || 0;
  };

  const txMap = {
    km: { rows: kasMasukRows,    setRows: setKasMasukRows,    cols: cashCols,     title:'Kas Masuk',     sub:`${kasMasukRows.length} transaksi · Total ${fmtRp(totalForKind('km'))}`,    modalKind:'km' },
    kk: { rows: kasKeluarRows,   setRows: setKasKeluarRows,   cols: cashCols,     title:'Kas Keluar',    sub:`${kasKeluarRows.length} transaksi · Total ${fmtRp(totalForKind('kk'))}`,   modalKind:'kk' },
    bm: { rows: bankMasukRows,   setRows: setBankMasukRows,   cols: cashCols,     title:'Bank Masuk',    sub:`${bankMasukRows.length} transaksi · Total ${fmtRp(totalForKind('bm'))}`,   modalKind:'bm' },
    bk: { rows: bankKeluarRows,  setRows: setBankKeluarRows,  cols: cashCols,     title:'Bank Keluar',   sub:`${bankKeluarRows.length} transaksi · Total ${fmtRp(totalForKind('bk'))}`,  modalKind:'bk' },
    tm: { rows: transferMasukRows,  setRows: setTransferMasukRows,  cols: transferCols, title:'Transfer Masuk antar Kas/Bank',  sub:`${transferMasukRows.length} transaksi`, modalKind:'tm' },
    tk: { rows: transferKeluarRows, setRows: setTransferKeluarRows, cols: transferCols, title:'Transfer Keluar antar Kas/Bank', sub:`${transferKeluarRows.length} transaksi`, modalKind:'tk' },
    gm: { rows: giroMasukRows,   setRows: setGiroMasukRows,   cols: giroCols,     title:'Giro Masuk',    sub:`${giroMasukRows.length} giro · ${giroMasukRows.filter(g=>g.status==='Outstanding').length} outstanding`, modalKind:'gm' },
    gk: { rows: giroKeluarRows,  setRows: setGiroKeluarRows,  cols: giroCols,     title:'Giro Keluar',   sub:`${giroKeluarRows.length} giro · ${giroKeluarRows.filter(g=>g.status==='Outstanding').length} outstanding`, modalKind:'gk' },
    pp: { rows: pelunasanPiutangRows, setRows: setPelunasanPiutangRows, cols: pelunasanCols('piutang'), title:'Pelunasan Piutang', sub:`${pelunasanPiutangRows.length} pelunasan`, modalKind:'pp' },
    ph: { rows: pelunasanHutangRows,  setRows: setPelunasanHutangRows,  cols: pelunasanCols('hutang'),  title:'Pelunasan Hutang',  sub:`${pelunasanHutangRows.length} pelunasan`,  modalKind:'ph' },
  };

  return (
    <div className="page" data-screen-label={`06 Keuangan — ${subLabel}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span>
        <a onClick={()=>onSubChange(null)} style={{cursor:'pointer'}}>Keuangan</a><span className="sep">/</span>
        <span className="current">{subLabel}</span>
      </div>

      {activeSub === 'kbg' && <KasBankGiro rows={kbgRows} onAdd={()=>setModal({kind:'kbg'})} onEdit={(d)=>setModal({kind:'kbg', data:d})} />}
      {/* Accounting subs (dari modul Akuntan) */}
      {activeSub === 'akun'    && <KatalogAkunPage rows={akunRows} setRows={setAkunRows} />}
      {activeSub === 'aktiva'  && <AktivaPage rows={aktivaRows} setRows={setAktivaRows} />}
      {activeSub === 'jurnal'  && <JurnalMemorialPage rows={jurnalRows} setRows={setJurnalRows} akunRows={akunRows} />}
      {activeSub === 'labarugi' && <LaporanKeuanganPage reportId="labarugi" rows={labaRugiRows} setRows={setLabaRugiRows} />}
      {activeSub === 'aruskas' && <LaporanKeuanganPage reportId="aruskas" rows={arusKasRows} setRows={setArusKasRows} />}
      {activeSub === 'neraca'  && <LaporanKeuanganPage reportId="neraca" rows={neracaRows} setRows={setNeracaRows} />}
      {['lapbank','bbdetil','bbrekap'].includes(activeSub) && (() => {
        const bbProps = {
          akunRows, kbgRows, kasMasukRows, kasKeluarRows, bankMasukRows, bankKeluarRows,
          transferMasukRows, transferKeluarRows, pelunasanPiutangRows, pelunasanHutangRows, jurnalRows,
        };
        if (activeSub === 'lapbank') return <LaporanBankPage {...bbProps} />;
        if (activeSub === 'bbdetil') return <LaporanBukuBesarDetailPage {...bbProps} />;
        return <LaporanBukuBesarRekapPage {...bbProps} />;
      })()}
      {txMap[activeSub] && (
        <TxPage
          title={txMap[activeSub].title}
          sub={txMap[activeSub].sub}
          rows={txMap[activeSub].rows}
          columns={txMap[activeSub].cols}
          totalKey={['pp','ph'].includes(activeSub)?'total':'nominal'}
          onAdd={()=>setModal({kind: txMap[activeSub].modalKind})}
          onEdit={(d)=>setModal({kind: txMap[activeSub].modalKind, data:d})}
          onCancelDoc={(r)=>setConfirmCancel(r)}
          onCetak={['pp','ph'].includes(activeSub) ? ()=>setCetakDoc({kind:activeSub, row:null}) : undefined}
          onCetakRow={['pp','ph'].includes(activeSub) ? (r)=>setCetakDoc({kind:activeSub, row:r}) : undefined}
        />
      )}

      {modal?.kind==='kbg' && <KbgModal data={modal.data} onClose={close} onSave={saveToRows(setKbgRows, 'kode')}/>}
      {['km','kk','bm','bk'].includes(modal?.kind) && (
        <CashModal kind={modal.kind} data={modal.data} rows={txMap[modal.kind].rows} onClose={close} onSave={saveToRows(txMap[modal.kind].setRows)}/>
      )}
      {['tm','tk'].includes(modal?.kind) && (
        <TransferModal kind={modal.kind} data={modal.data} rows={txMap[modal.kind].rows} onClose={close} onSave={saveToRows(txMap[modal.kind].setRows)}/>
      )}
      {['gm','gk'].includes(modal?.kind) && (
        <GiroModal kind={modal.kind} data={modal.data} rows={txMap[modal.kind].rows} onClose={close} onSave={saveToRows(txMap[modal.kind].setRows)}/>
      )}
      {['pp','ph'].includes(modal?.kind) && (
        <PelunasanModal kind={modal.kind} data={modal.data} rows={txMap[modal.kind].rows}
          saldoItems={modal.kind==='pp' ? saldoPiutangItems : saldoHutangItems}
          partnerList={modal.kind==='pp' ? PJ_PELANGGAN : PB_SUPPLIER}
          onClose={close} onSave={savePelunasan(modal.kind)}/>
      )}

      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Transaksi "${confirmCancel.no}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan" confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}

      {cetakDoc && (
        <AkCetakModal variant="pelunasan"
          docLabel={cetakDoc.kind==='pp' ? 'Pelunasan Piutang' : 'Pelunasan Hutang'}
          rows={cetakDoc.kind==='pp' ? pelunasanPiutangRows : pelunasanHutangRows}
          noKey="no" tglKey="tgl" isPiutang={cetakDoc.kind==='pp'}
          initialSelected={cetakDoc.row ? [cetakDoc.row.no] : null}
          onClose={()=>setCetakDoc(null)}
        />
      )}
    </div>
  );
}

window.KeuanganPage = KeuanganPage;
