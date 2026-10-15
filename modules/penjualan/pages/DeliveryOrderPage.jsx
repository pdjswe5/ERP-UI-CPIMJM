// Penjualan — halaman Pengiriman Penjualan

function DeliveryOrderPage({ rows, setRows, salesOrderList }) {
  const columns = [
    { key:'No_Bukti', label:'No. Bukti', mono:true },
    { key:'Tgl_Bukti', label:'Tgl. Bukti' },
    { key:'No_Referensi', label:'No. Referensi' },
    { key:'Nama_Cust', label:'Customer', render:(v,r) => <PjCodeChip name={r.Nama_Cust} code={r.Kode_Cust} /> },
    { key:'Status', label:'Status', render:(v,r) => doStatusPill(r) },
  ];

  const [modal, setModal] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null);
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);

  const openAdd = () => { setModal(null); setModalMode(null); setShow(true); };
  const openView = (r) => { setModal(r); setModalMode('VIEW'); setShow(true); };
  const openEdit = (r) => { setModal(r); setModalMode('EDIT'); setShow(true); };
  const closeModal = () => { setShow(false); setModal(null); setModalMode(null); };

  const save = (form, mode) => {
    if (mode === 'CREATE') setRows(prev => [form, ...prev]);
    else setRows(prev => prev.map(r => r.No_Bukti===form.No_Bukti ? form : r));
    window.__erpToast && window.__erpToast('Pengiriman Penjualan berhasil disimpan.');
  };

  const cancelDoc = (form) => {
    const updated = { ...form, Status:'BATAL', Batal:true, Alasan_Status: form.Alasan_Status || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    setModal(updated);
    window.__erpToast && window.__erpToast('Pengiriman Penjualan dibatalkan.');
  };

  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, Status:'BATAL', Batal:true, Alasan_Status: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    window.__erpToast && window.__erpToast('Pengiriman Penjualan dibatalkan.');
    setConfirmCancel(null);
  };

  const completeDoc = (form) => {
    const updated = { ...form, Status:'SELESAI', Alasan_Status: form.Alasan_Status || 'Diselesaikan manual oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    setModal(updated);
    window.__erpToast && window.__erpToast('Pengiriman Penjualan diselesaikan manual.');
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
      const s = doComputeStatus(row);
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
      <PjDocList
        title="Pengiriman Penjualan"
        sub="Surat jalan dan pengiriman barang ke pelanggan, diambil dari barang Order Penjualan."
        rows={rows}
        columns={columns}
        onAdd={openAdd}
        onView={openView}
        onEdit={openEdit}
        onCancelDoc={(r)=>setConfirmCancel(r)}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(r)=>{setCetakRow(r); setShowCetak(true);}}
        addLabel="Pengiriman Penjualan Baru"
        statusFilter={statusFilter}
      />
      {showCetak && (
        <PjCetakModal docLabel="Pengiriman Penjualan" rows={rows} statusFilter={statusFilter}
          getGroupLabel={r=>r.Nama_Cust}
          initialSelected={cetakRow ? [cetakRow.No_Bukti] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
      {show && (
        <PjDocModal
          title="Pengiriman Penjualan"
          data={modal}
          tabs={deliveryOrderTabs(salesOrderList)}
          prefix="DO"
          showTotals
          xwide
          initialMode={modalMode}
          onClose={closeModal}
          onSave={save}
          onCancelDoc={cancelDoc}
          onCompleteDoc={completeDoc}
        />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Pengiriman Penjualan "${confirmCancel.No_Bukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}
