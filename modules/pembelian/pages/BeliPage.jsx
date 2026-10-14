// Pembelian — halaman Nota Pembelian (Beli)

function BeliPage({ rows, setRows }) {
  const columns = [
    { key:'No_Bukti', label:'No. Bukti', mono:true },
    { key:'Tgl_Bukti', label:'Tgl. Bukti' },
    { key:'Kode_Supp', label:'Supplier', render:v => pbSuppNama(v) },
    { key:'JmlItem', label:'Jml Item', render:(v,r) => (r.Details||[]).length },
    { key:'Details', label:'Total', render:(v,r) => fmtRp([...(v||[]), ...(r.Details2||[])].reduce((s,x)=>s+pbLineTotal(x),0)) },
    { key:'Status', label:'Status', render:(v,r) => beliStatusPill(r) },
  ];

  const [modal, setModal] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null);
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);

  const openAdd = () => { setModal(null); setModalMode(null); setShow(true); };
  const openView = (r) => { setModal(r); setModalMode('VIEW'); setShow(true); };
  const openEdit = (r) => { setModal(r); setModalMode('EDIT'); setShow(true); };
  const closeModal = () => { setShow(false); setModal(null); setModalMode(null); };

  const save = (form, mode) => {
    if (mode === 'CREATE') setRows(prev => [...prev, form]);
    else setRows(prev => prev.map(r => r.No_Bukti===form.No_Bukti ? form : r));
    window.__erpToast && window.__erpToast('Nota Pembelian berhasil disimpan.');
    if (mode === 'CREATE') setModal(form);
  };

  const cancelDoc = (form) => {
    const updated = { ...form, Status:'BATAL', Batal:true, Alasan_Batal: form.Alasan_Batal || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    setModal(updated);
    window.__erpToast && window.__erpToast('Nota Pembelian dibatalkan.');
  };

  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, Status:'BATAL', Batal:true, Alasan_Batal: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    window.__erpToast && window.__erpToast('Nota Pembelian dibatalkan.');
    setConfirmCancel(null);
  };

  const completeDoc = (form) => {
    const updated = { ...form, Status:'SELESAI', Alasan_Status: form.Alasan_Status || 'Diselesaikan manual oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    setModal(updated);
    window.__erpToast && window.__erpToast('Nota Pembelian diselesaikan manual.');
  };

  const statusFilter = {
    options: [
      { value:'belum', label:'Belum Realisasi' },
      { value:'sebagian', label:'Selesai Sebagian' },
      { value:'selesai', label:'Selesai' },
      { value:'selesai_manual', label:'Selesai Manual' },
      { value:'batal', label:'Batal' },
    ],
    match: (row, val) => {
      const s = beliComputeStatus(row);
      if (val === 'belum') return s === 'BELUM_REALISASI';
      if (val === 'sebagian') return s === 'SELESAI_SEBAGIAN';
      if (val === 'selesai') return s === 'SELESAI';
      if (val === 'selesai_manual') return s === 'SELESAI_MANUAL';
      if (val === 'batal') return s === 'BATAL';
      return true;
    },
  };

  return (
    <>
      <PbDocList
        title="Nota Pembelian"
        rows={rows}
        columns={columns}
        onAdd={openAdd}
        onView={openView}
        onEdit={openEdit}
        onCancelDoc={(r)=>setConfirmCancel(r)}
        onCetak={()=>setShowCetak(true)}
        addLabel="Nota Baru"
        statusFilter={statusFilter}
      />
      {showCetak && <PbCetakModal docLabel="Nota Pembelian" rows={rows} statusFilter={statusFilter} onClose={()=>setShowCetak(false)} />}
      {show && (
        <PbModalShell
          title="Nota Pembelian"
          data={modal}
          tabs={beliModalTabs()}
          prefix="BL"
          showTotals
          initialMode={modalMode}
          xwide
          onClose={closeModal}
          onSave={save}
          onCancelDoc={cancelDoc}
          onCompleteDoc={completeDoc}
        />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Nota Pembelian "${confirmCancel.No_Bukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}
