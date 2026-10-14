// Pembelian — halaman Retur Beli

function ReturBeliPage({ rows, setRows }) {
  const columns = [
    { key:'No_Bukti', label:'No. Bukti', mono:true },
    { key:'Tgl_Bukti', label:'Tgl. Bukti' },
    { key:'No_Bukti_From', label:'Ref. Nota Beli', render:v => v || <span className="muted">—</span> },
    { key:'Kode_Supp', label:'Supplier', render:v => pbSuppNama(v) },
    { key:'JmlItem', label:'Jml Item', render:(v,r) => (r.Details||[]).length },
    { key:'Details', label:'Total', render:(v,r) => fmtRp([...(v||[]), ...(r.Details2||[])].reduce((s,x)=>s+pbLineTotal(x),0)) },
    { key:'Status', label:'Status', render:(v,r) => returStatusPill(r) },
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
    window.__erpToast && window.__erpToast('Retur Beli berhasil disimpan.');
    if (mode === 'CREATE') setModal(form);
  };

  const cancelDoc = (form) => {
    const updated = { ...form, Batal:true, Alasan_Batal: form.Alasan_Batal || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    setModal(updated);
    window.__erpToast && window.__erpToast('Retur Beli dibatalkan.');
  };

  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, Batal:true, Alasan_Batal: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    window.__erpToast && window.__erpToast('Retur Beli dibatalkan.');
    setConfirmCancel(null);
  };

  const statusFilter = {
    options: [
      { value:'selesai', label:'Selesai' },
      { value:'batal', label:'Batal' },
    ],
    match: (row, val) => {
      const s = returComputeStatus(row);
      if (val === 'selesai') return s === 'SELESAI';
      if (val === 'batal') return s === 'BATAL';
      return true;
    },
  };

  return (
    <>
      <PbDocList
        title="Retur Beli"
        rows={rows}
        columns={columns}
        onAdd={openAdd}
        onView={openView}
        onEdit={openEdit}
        onCancelDoc={(r)=>setConfirmCancel(r)}
        onCetak={()=>setShowCetak(true)}
        addLabel="Retur Baru"
        statusFilter={statusFilter}
      />
      {showCetak && <PbCetakModal docLabel="Retur Beli" rows={rows} statusFilter={statusFilter} onClose={()=>setShowCetak(false)} />}
      {show && (
        <PbModalShell
          title="Retur Beli"
          data={modal}
          tabs={returBeliModalTabs()}
          prefix="RB"
          showTotals
          initialMode={modalMode}
          xwide
          onClose={closeModal}
          onSave={save}
          onCancelDoc={cancelDoc}
        />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Retur Beli "${confirmCancel.No_Bukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}
