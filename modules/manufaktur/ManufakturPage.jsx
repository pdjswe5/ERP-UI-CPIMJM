// Manufaktur — router top-level modul: mengangkat 5 array dokumen (SPK, Hasil Produksi, BPBL,
// RPBL, Planning) jadi state, merender dashboard atau halaman sub-modul sesuai activeSub.
//
// Root-cause fix (state-lifting): sebelumnya SPK_LIST/HP_LIST/BPBL_LIST/RPBL_LIST/PLANNING_LIST
// adalah const array module-level, dan tombol Simpan di dialog cuma menutup modal + toast tanpa
// pernah menulis ke array itu — Tambah/Edit tidak pernah benar-benar tersimpan. Sama seperti fix
// yang sudah diterapkan di PenjualanPage.jsx, di sini setiap seed data diangkat jadi state nyata
// lewat React.useState, rows/setRows diteruskan ke tiap sub-halaman, dan onSave benar-benar
// menulis (append untuk CREATE, replace-by-no untuk EDIT) ke state tersebut.

// ─── Dashboard ───────────────────────────────────────────────────────────────

function MfManufakturDashboard({ onOpenSub, spkRows, produksiRows, bpblRows, rpblRows, planningRows }) {
  const spkAktif = spkRows.filter(s => !['Batal','Cancelled','Selesai'].includes(s.status));
  const spkPendingApproval = spkRows.filter(s => s.status === 'Pending Approval').length;
  const planningOutstanding = planningRows.filter(r => r.status === 'outstanding').length;
  const menitTerjadwal = planningRows.filter(r => r.status !== 'Batal').reduce((s,r) => s + (+r.menit || 0), 0);

  // Grafik tren tiap KPI (Spark kumulatif, hover lihat tanggal+nilai per titik) — pola sama Home,
  // gantikan chart ranking/status yang tadi dihapus. `tgl` SPK format DD-MM-YYYY jadi butuh mfToIso
  // sebelum diurutkan kronologis. Hasil Produksi tidak punya tanggal sendiri, di-resolve dari SPK
  // rujukannya (noSpk). Planning Schedule semuanya di 1 tanggal yg sama (seed), jadi trennya pakai
  // jam mulai (dalam hari itu) sebagai sumbu-X, bukan tanggal.
  const produksiWithTgl = produksiRows.map(r => ({ ...r, _tgl: MF_SPK_SEED.find(s=>s.no===r.noSpk)?.tgl || '' })).filter(r => r._tgl);

  const kpis = [
    { label:'SPK Aktif', value: spkAktif.length, sub:`dari ${spkRows.length} total SPK`,
      trend: cumulativeTrend(spkAktif, 'tgl', () => 1, { isoFn: mfToIso, displayFn: v => `${v} SPK` }), trendColor:'var(--realisasi)' },
    { label:'SPK Menunggu Approval', value: spkPendingApproval, sub: spkPendingApproval > 0 ? 'Perlu ditinjau' : 'Tidak ada yang menunggu', color: spkPendingApproval > 0 ? 'var(--warn)' : null,
      trend: cumulativeTrend(spkRows.filter(s=>s.status==='Pending Approval'), 'tgl', () => 1, { isoFn: mfToIso, displayFn: v => `${v} SPK` }), trendColor:'var(--warn)' },
    { label:'Hasil Produksi Tercatat', value: produksiRows.length, sub:`${bpblRows.length} BPBL, ${rpblRows.length} RPBL`,
      trend: cumulativeTrend(produksiWithTgl, '_tgl', () => 1, { isoFn: mfToIso, displayFn: v => `${v} dokumen` }), trendColor:'var(--primary)' },
    { label:'Antrian Produksi Outstanding', value: planningOutstanding, sub:`${menitTerjadwal} menit terjadwal`,
      trend: cumulativeTrend(planningRows.filter(r=>r.status!=='Batal'), 'jamMulai', r => +r.menit||0, { displayFn: v => `${v} menit` }), trendColor:'#7c3aed' },
  ];

  // Root-cause fix (konsistensi dashboard): sebelumnya markup bespoke sendiri (tile flat tanpa
  // grouping, tanpa breadcrumb, tanpa activity log, tanpa chart) — sekarang pindah ke ModuleDashboard
  // (components.jsx) yang sudah dipakai Pembelian/Barang, supaya struktur & visualnya konsisten.
  const sections = [
    { title:'Produksi', count:'2', tiles:[
        { id:'spk', title:'Surat Perintah Kerja', badge: spkPendingApproval > 0 ? `${spkPendingApproval} Menunggu` : null, icon:I.list(20) },
        { id:'produksi', title:'Hasil Produksi & Pemakaian Bahan', badge:null, icon:I.box(20) },
      ]
    },
    { title:'Pemakaian & Antrian', count:'3', tiles:[
        { id:'bpbl', title:'Bukti Pemakaian Barang Lain', badge:null, icon:I.invoice(20) },
        { id:'rpbl', title:'Retur Pakai Barang Lain', badge:null, icon:I.truck(20) },
        { id:'planning', title:'Planning Schedule Produksi', badge: planningRows.filter(r=>r.status==='planning').length + ' Antrian', icon:I.cal(20) },
      ]
    },
  ];

  return (
    <ModuleDashboard
      title="Manufaktur"
      subtitle="Kelola proses produksi dan pemakaian bahan"
      kpis={kpis}
      sections={sections}
      activityLog={ACTIVITY_LOG_MANUFAKTUR}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}

// ─── Main Page Router ─────────────────────────────────────────────────────────

function ManufakturPage({ activeSub, onSubChange, onNavigate }) {
  const [spkRows,      setSpkRows]      = React.useState(MF_SPK_SEED);
  const [produksiRows, setProduksiRows] = React.useState(MF_PRODUKSI_SEED);
  const [bpblRows,     setBpblRows]     = React.useState(MF_BPBL_SEED);
  const [rpblRows,     setRpblRows]     = React.useState(MF_RPBL_SEED);
  const [planningRows, setPlanningRows] = React.useState(MF_PLANNING_SEED);

  const [modal, setModal] = React.useState(null);
  const [spkModalMode, setSpkModalMode] = React.useState(null); // null (CREATE) | 'VIEW' | 'EDIT' — khusus SPK
  const [confirmCancelSpk, setConfirmCancelSpk] = React.useState(null);

  const showToast = (msg) => { window.__erpToast && window.__erpToast(msg); };

  // Menulis form yang dirakit dialog ke state rows yang sesuai: CREATE menambah baris baru,
  // EDIT mengganti baris lama yang cocok berdasarkan field "no".
  const saveToRows = (setRows) => (form) => {
    setRows(prev => {
      const exists = prev.some(r => r.no === form.no);
      return exists ? prev.map(r => r.no === form.no ? form : r) : [...prev, form];
    });
    setModal(null);
    showToast('Data berhasil disimpan.');
  };

  // SPK: Batalkan via ConfirmationModal (dipicu dari ikon list atau tombol "Batalkan SPK" di dalam dialog VIEW)
  const cancelSpkFromModal = (row) => { setModal(null); setConfirmCancelSpk(row); };
  const confirmCancelSpkNow = (reason) => {
    setSpkRows(prev => prev.map(r => r.no === confirmCancelSpk.no
      ? { ...r, status:'Batal', Batal:true, Alasan_Batal: reason || 'Dibatalkan oleh operator' }
      : r));
    showToast('SPK dibatalkan.');
    setConfirmCancelSpk(null);
  };

  const onBack = () => onSubChange(null);

  const subLabel = {
    spk:      'Surat Perintah Kerja',
    produksi: 'Hasil Produksi & Pemakaian Bahan',
    bpbl:     'Bukti Pemakaian Barang Lain',
    rpbl:     'Retur Pakai Barang Lain',
    planning: 'Planning Schedule Produksi Harian',
  };

  if (!activeSub) {
    return (
      <MfManufakturDashboard
        onOpenSub={onSubChange}
        spkRows={spkRows} produksiRows={produksiRows}
        bpblRows={bpblRows} rpblRows={rpblRows} planningRows={planningRows}
      />
    );
  }

  return (
    <div className="page">
      <div className="crumbs">
        <a style={{cursor:'pointer'}} onClick={() => onNavigate('home')}>Home</a>
        <span className="sep">/</span>
        <a style={{cursor:'pointer'}} onClick={onBack}>Manufaktur</a>
        <span className="sep">/</span>
        <span className="current">{subLabel[activeSub] || activeSub}</span>
      </div>

      {activeSub === 'spk'      && <MfSpkList rows={spkRows}
        onAdd={()  => { setSpkModalMode(null);   setModal({type:'spk', data:null}); }}
        onView={r  => { setSpkModalMode('VIEW'); setModal({type:'spk', data:r}); }}
        onEdit={r  => { setSpkModalMode('EDIT'); setModal({type:'spk', data:r}); }}
        onCancelDoc={r => setConfirmCancelSpk(r)}
        onNavigate={onNavigate} />}
      {activeSub === 'produksi' && <MfHasilProduksiList rows={produksiRows}
        onAdd={() => setModal({type:'produksi', data:null})}
        onEdit={r  => setModal({type:'produksi', data:r})} />}
      {activeSub === 'bpbl' && <MfPemakaianBarangList type="bpbl" rows={bpblRows}
        onAdd={() => setModal({type:'bpbl', data:null})}
        onEdit={r  => setModal({type:'bpbl', data:r})} />}
      {activeSub === 'rpbl' && <MfPemakaianBarangList type="rpbl" rows={rpblRows}
        onAdd={() => setModal({type:'rpbl', data:null})}
        onEdit={r  => setModal({type:'rpbl', data:r})} />}
      {activeSub === 'planning' && <MfPlanningScheduleList rows={planningRows} setRows={setPlanningRows} spkRows={spkRows}
        onSelesai={(completed) => setProduksiRows(prev => [...prev, ...mfBuildHpRecordsFromPlanning(completed, spkRows)])} />}

      {modal?.type === 'spk'      && <MfSpkDialog           data={modal.data} initialMode={spkModalMode} onClose={() => setModal(null)} onSave={saveToRows(setSpkRows)} onCancelDoc={cancelSpkFromModal} />}
      {modal?.type === 'produksi' && <MfHasilProduksiDialog data={modal.data} spkRows={spkRows} onClose={() => setModal(null)} onSave={saveToRows(setProduksiRows)} />}
      {modal?.type === 'bpbl' && <MfPemakaianBarangDialog type="bpbl" data={modal.data} spkRows={spkRows} onClose={() => setModal(null)} onSave={saveToRows(setBpblRows)} />}
      {modal?.type === 'rpbl' && <MfPemakaianBarangDialog type="rpbl" data={modal.data} spkRows={spkRows} onClose={() => setModal(null)} onSave={saveToRows(setRpblRows)} />}

      {confirmCancelSpk && (
        <ConfirmationModal
          title="Batalkan SPK"
          message={`Surat Perintah Kerja "${confirmCancelSpk.no}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={() => setConfirmCancelSpk(null)}
          onConfirm={confirmCancelSpkNow}
        />
      )}
    </div>
  );
}
