// Payroll — router top-level modul: mengangkat 6 array (Karyawan, Mutasi, Absensi, Produksi Harian,
// Penggajian Absensi, Penggajian Borongan) jadi state (pola sama ManufakturPage.jsx), merender
// dashboard atau halaman sub-modul sesuai activeSub. Mutasi Karyawan dibuka sbg drill-down modal
// dari tombol "Mutasi" di baris Master Karyawan (bukan sub-halaman navigasi sendiri), makanya
// state modalnya (`mutasiFor`) dikelola di sini, bukan di dalam KaryawanPage.jsx. Breadcrumb HANYA
// di level router ini (pola sama ManufakturPage/PenjualanPage) — sub-halaman tidak py crumbs sendiri.

const PR_PERIODE_SEED = '2026-07'; // periode data seed Absensi & Produksi Harian, dipakai KPI dashboard

function PayrollDashboard({ onOpenSub, karyawanRows, absensiRows, produksiHarianRows }) {
  const aktifCount = karyawanRows.filter(k => k.aktif).length;
  const absensiHadir = absensiRows.filter(a => a.status === 'Hadir');
  const pctHadir = absensiRows.length ? Math.round(absensiHadir.length / absensiRows.length * 100) : 0;
  const totalUpahBorongan = produksiHarianRows.reduce((s,p)=>s+(p.upah||0),0);

  // Grafik tren tiap KPI (Spark kumulatif, hover lihat tanggal+nilai per titik) — pola sama
  // Home/dashboard modul lain (WAJIB konsisten, tidak bikin pola KPI baru).
  const kpis = [
    { label:'Total Karyawan Aktif', value: aktifCount, sub:`dari ${karyawanRows.length} total karyawan`,
      trend: cumulativeTrend(karyawanRows, 'tglMasuk', () => 1, { displayFn: v => `${v} karyawan` }), trendColor:'var(--realisasi)' },
    { label:'Kehadiran Absensi', value: `${pctHadir}%`, sub:`${absensiHadir.length} dari ${absensiRows.length} entri · Periode ${PR_PERIODE_SEED}`,
      trend: cumulativeTrend(absensiHadir, 'tanggal', () => 1, { displayFn: v => `${v} hadir` }), trendColor:'var(--primary)' },
    { label:'Entri Produksi Harian', value: produksiHarianRows.length, sub:`Borongan, periode ${PR_PERIODE_SEED}`,
      trend: cumulativeTrend(produksiHarianRows, 'tanggal', () => 1, { displayFn: v => `${v} entri` }), trendColor:'#7c3aed' },
    { label:'Total Upah Borongan', value: fmtRp(totalUpahBorongan), sub:`Periode ${PR_PERIODE_SEED}`,
      trend: cumulativeTrend(produksiHarianRows, 'tanggal', r => r.upah || 0, { displayFn: v => fmtRp(v) }), trendColor:'var(--warn)' },
  ];

  const sections = [
    { title:'Master Data', count:'2', tiles:[
        { id:'karyawan', title:'Master Karyawan', badge:null, icon:I.wallet(20) },
        { id:'masterdata', title:'Master Data Payroll', badge:null, icon:I.list(20) },
      ]
    },
    { title:'Absensi', count:'2', tiles:[
        { id:'absensi', title:'Absensi Karyawan', badge:null, icon:I.cal(20) },
        { id:'penggajianabsensi', title:'Proses Penggajian Absensi', badge:null, icon:I.invoice(20) },
      ]
    },
    { title:'Borongan', count:'2', tiles:[
        { id:'produksiharian', title:'Transaksi Produksi Harian', badge:null, icon:I.box(20) },
        { id:'penggajianborongan', title:'Proses Penggajian Borongan', badge:null, icon:I.invoice(20) },
      ]
    },
  ];

  return (
    <ModuleDashboard
      title="Payroll"
      subtitle="Kelola data karyawan dan proses penggajian"
      kpis={kpis}
      sections={sections}
      activityLog={ACTIVITY_LOG_PAYROLL}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}

function PayrollPage({ activeSub, onSubChange, onNavigate }) {
  const [karyawanRows, setKaryawanRows] = React.useState(PR_KARYAWAN);
  const [mutasiRows, setMutasiRows] = React.useState(PR_MUTASI);
  const [absensiRows, setAbsensiRows] = React.useState(PR_ABSENSI);
  const [produksiHarianRows, setProduksiHarianRows] = React.useState(PR_PRODUKSI_HARIAN);
  const [penggajianAbsensiRows, setPenggajianAbsensiRows] = React.useState(PR_PENGGAJIAN_ABSENSI);
  const [penggajianBoronganRows, setPenggajianBoronganRows] = React.useState(PR_PENGGAJIAN_BORONGAN);

  const [mutasiFor, setMutasiFor] = React.useState(null);

  const onBack = () => onSubChange(null);
  const subLabel = {
    karyawan:'Master Karyawan', masterdata:'Master Data Payroll', absensi:'Absensi Karyawan',
    produksiharian:'Transaksi Produksi Harian', penggajianabsensi:'Proses Penggajian Absensi',
    penggajianborongan:'Proses Penggajian Borongan',
  };

  // if (!activeSub) {
  //   return <PayrollDashboard onOpenSub={onSubChange} karyawanRows={karyawanRows} absensiRows={absensiRows} produksiHarianRows={produksiHarianRows} />;
  // }

  return (
    <div className="page">
      <div className="crumbs">
        <a style={{cursor:'pointer'}} onClick={() => onNavigate('home')}>Home</a>
        <span className="sep">/</span>
        <a style={{cursor:'pointer'}} onClick={onBack}>Payroll</a>
        <span className="sep">/</span>
        <span className="current">{subLabel[activeSub] || activeSub}</span>
      </div>

      {activeSub === 'karyawan' && (
        <PayrollKaryawanPage rows={karyawanRows} setRows={setKaryawanRows} mutasiRows={mutasiRows} onMutasi={r => setMutasiFor(r)} />
      )}
      {activeSub === 'masterdata' && <PayrollMasterDataPage />}
      {activeSub === 'absensi' && <PayrollAbsensiPage rows={absensiRows} setRows={setAbsensiRows} karyawanRows={karyawanRows} mutasiRows={mutasiRows} />}
      {activeSub === 'produksiharian' && <PayrollProduksiHarianPage rows={produksiHarianRows} setRows={setProduksiHarianRows} />}
      {activeSub === 'penggajianabsensi' && (
        <PayrollPenggajianAbsensiPage rows={penggajianAbsensiRows} setRows={setPenggajianAbsensiRows}
          karyawanRows={karyawanRows} mutasiRows={mutasiRows} absensiRows={absensiRows} />
      )}
      {activeSub === 'penggajianborongan' && (
        <PayrollPenggajianBoronganPage rows={penggajianBoronganRows} setRows={setPenggajianBoronganRows}
          karyawanRows={karyawanRows} mutasiRows={mutasiRows} produksiHarianRows={produksiHarianRows} />
      )}

      {mutasiFor && (
        <MutasiKaryawanModal
          karyawan={mutasiFor}
          mutasiRows={mutasiRows}
          onClose={()=>setMutasiFor(null)}
          onSave={(record) => {
            setMutasiRows(prev => [...prev, record]);
            window.__erpToast && window.__erpToast('Mutasi karyawan berhasil disimpan.');
            setMutasiFor(null);
          }}
        />
      )}
    </div>
  );
}
