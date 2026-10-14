// Pembelian — halaman Purchase Request (PR)

function PrPage({ rows, setRows }) {
  const columns = [
    { key:'No_Bukti', label:'No. Bukti', mono:true },
    { key:'Tgl_Bukti', label:'Tgl. Bukti' },
    { key:'Kode_PurchasingORG', label:'Purchasing Org', render:v => pbOrgNama(v) },
    { key:'Keterangan', label:'Keterangan' },
    { key:'Details', label:'Jml Item', render:v => (v||[]).length },
    { key:'Status', label:'Status', render:(v,r) => prStatusPill(r) },
  ];

  const [modal, setModal] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null); // null (CREATE) | 'VIEW' | 'EDIT'
  const [confirmCancel, setConfirmCancel] = React.useState(null); // row dibatalkan langsung dari list
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null); // baris tunggal saat cetak dipicu dari kolom Aksi

  const openAdd = () => { setModal(null); setModalMode(null); setShow(true); };
  const openView = (r) => { setModal(r); setModalMode('VIEW'); setShow(true); };
  const openEdit = (r) => { setModal(r); setModalMode('EDIT'); setShow(true); };
  const closeModal = () => { setShow(false); setModal(null); setModalMode(null); };

  const save = (form, mode) => {
    if (mode === 'CREATE') setRows(prev => [...prev, form]);
    else setRows(prev => prev.map(r => r.No_Bukti===form.No_Bukti ? form : r));
    window.__erpToast && window.__erpToast('Purchase Request berhasil disimpan.');
    if (mode === 'CREATE') setModal(form);
  };

  // Dipanggil dari dalam modal (PbModalShell sudah menampilkan ConfirmationModal-nya sendiri)
  const cancelDoc = (form) => {
    const updated = { ...form, Status:'BATAL', Batal:true, Alasan_Batal: form.Alasan_Batal || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    setModal(updated);
    window.__erpToast && window.__erpToast('Purchase Request dibatalkan.');
  };

  // Dipanggil dari icon "Batalkan Transaksi" di kolom Aksi list (tanpa buka modal dulu)
  const cancelFromList = (reason) => {
    const updated = { ...confirmCancel, Status:'BATAL', Batal:true, Alasan_Batal: reason || 'Dibatalkan oleh operator' };
    setRows(prev => prev.map(r => r.No_Bukti===updated.No_Bukti ? updated : r));
    window.__erpToast && window.__erpToast('Purchase Request dibatalkan.');
    setConfirmCancel(null);
  };

  // Status PR dihitung otomatis dari realisasi barang (lihat prComputeStatus di pr.data.jsx) —
  // tidak ada lagi aksi "Selesaikan Manual" untuk dokumen ini.
  const statusFilter = {
    options: [
      { value:'belum', label:'Belum Realisasi' },
      { value:'sebagian', label:'Selesai Sebagian' },
      { value:'selesai', label:'Selesai' },
      { value:'batal', label:'Batal' },
    ],
    match: (row, val) => {
      const s = prComputeStatus(row);
      if (val === 'belum') return s === 'BELUM_REALISASI';
      if (val === 'sebagian') return s === 'SELESAI_SEBAGIAN';
      if (val === 'selesai') return s === 'SELESAI';
      if (val === 'batal') return s === 'BATAL';
      return true;
    },
  };

  return (
    <>
      <PbDocList
        title="Purchase Request"
        rows={rows}
        columns={columns}
        onAdd={openAdd}
        onView={openView}
        onEdit={openEdit}
        onCancelDoc={(r)=>setConfirmCancel(r)}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(r)=>{setCetakRow(r); setShowCetak(true);}}
        addLabel="PR Baru"
        statusFilter={statusFilter}
      />
      {showCetak && (
        <PbCetakModal docLabel="Permintaan Pembelian" rows={rows} statusFilter={statusFilter}
          getGroupLabel={r=>pbOrgNama(r.Kode_PurchasingORG)}
          initialSelected={cetakRow ? [cetakRow.No_Bukti] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
      {show && (
        <PbModalShell
          title="Purchase Request"
          data={modal}
          tabs={prModalTabs()}
          prefix="PB"
          initialMode={modalMode}
          onClose={closeModal}
          onSave={save}
          onCancelDoc={cancelDoc}
        />
      )}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Purchase Request "${confirmCancel.No_Bukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelFromList}
        />
      )}
    </>
  );
}
