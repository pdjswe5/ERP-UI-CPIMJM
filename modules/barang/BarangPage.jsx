// Barang — router top-level modul: dashboard atau halaman sub-modul sesuai activeSub.
// Dipindah dari root barang.jsx, tidak diubah.

function BarangDashboard({ onOpenSub }) {
  const lainAktif = BARANG_LAIN.filter((b) => b.aktif).length;
  const bakuAktif = BAHAN_BAKU.filter((b) => b.aktif).length;
  const jadiAktif = BARANG_JADI.filter((b) => b.aktif).length;
  const totalAktif = lainAktif + bakuAktif + jadiAktif;
  const totalItem = BARANG_LAIN.length + BAHAN_BAKU.length + BARANG_JADI.length;

  const mutasiAktif = MUTASI_BARANG.filter((r) => !r.batal).length;
  const penyesuaianAktif = PENYESUAIAN_BARANG.filter((r) => !r.batal).length;
  const opnameAktif = STOCK_OPNAME.filter((r) => !r.batal).length;

  // Grafik tren tiap KPI (Spark kumulatif, hover lihat tanggal+nilai per titik) — pola sama Home,
  // gantikan chart ranking/status yang tadi dihapus. Mutasi/Penyesuaian/Opname punya tglBukti
  // (tersebar sebulan penuh); "Total Item Aktif" (katalog master, tidak punya tanggal) pakai
  // proxy gabungan aktivitas gudang (mutasi+penyesuaian+opname per tanggal).
  const mutasiAktifRows = MUTASI_BARANG.filter((r) => !r.batal);
  const penyesuaianAktifRows = PENYESUAIAN_BARANG.filter((r) => !r.batal);
  const opnameAktifRows = STOCK_OPNAME.filter((r) => !r.batal);
  const semuaAktivitasGudang = [
    ...mutasiAktifRows,
    ...penyesuaianAktifRows,
    ...opnameAktifRows,
  ];


  const sections = [
    {
      title: "Barang & Kelengkapan",
      count: "4",
      tiles: [
        {
          id: "baranglain",
          title: "Barang Lain",
          badge: `${lainAktif} dari ${BARANG_LAIN.length} aktif`,
          icon: I.box(20),
        },
        {
          id: "bahankaku",
          title: "Bahan Baku",
          badge: `${bakuAktif} dari ${BAHAN_BAKU.length} aktif`,
          icon: I.box(20),
        },
        {
          id: "barangjadi",
          title: "Barang Jadi Umum & PU",
          badge: `${jadiAktif} dari ${BARANG_JADI.length} aktif`,
          icon: I.box(20),
        },
        {
          id: "bom",
          title: "BOM / Resep Produksi",
          badge: `${BRG_BOM_SEED.length} resep`,
          icon: I.list(20),
        },
      ],
    },
    {
      title: "Stock & Persediaan",
      count: "3",
      tiles: [
        {
          id: "mutasi",
          title: "Mutasi Barang & Konsinyasi",
          badge: `${mutasiAktif} mutasi aktif`,
          icon: I.truck(20),
        },
        {
          id: "penyesuaian",
          title: "Penyesuaian Barang",
          badge: `${penyesuaianAktif} adj aktif`,
          icon: I.list(20),
        },
        {
          id: "opname",
          title: "Stock Opname",
          badge: `${opnameAktif} opname aktif`,
          icon: I.list(20),
        },
      ],
    },
  ];
  return (
    <ModuleDashboard
      title="Dashboard Barang"
      subtitle="Halaman ini digunakan untuk mengelola data barang, tersedia 7 menu pendukung."
      sections={sections}
      activityLog={ACTIVITY_LOG_BARANG}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}

function BarangPage({ activeSub, onSubChange, onNavigate }) {
  if (!activeSub) return <BarangDashboard onOpenSub={onSubChange} />;
  const subLabel =
    MODULE_SUBS.barang.find((s) => s.id === activeSub)?.label ?? activeSub;
  return (
    <div className="page" data-screen-label={`Barang — ${activeSub}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.("home")} style={{ cursor: "pointer" }}>
          Home
        </a>
        <span className="sep">/</span>
        <a onClick={() => onSubChange(null)} style={{ cursor: "pointer" }}>
          Barang
        </a>
        <span className="sep">/</span>
        <span className="current">{subLabel}</span>
      </div>
      {activeSub === "baranglain" && <BarangLainPage />}
      {activeSub === "bahankaku" && <BahanBakuPage />}
      {activeSub === "barangjadi" && <BarangJadiPage />}
      {activeSub === "bom" && <BomPage />}
      {activeSub === "mutasi" && <MutasiBarangPage />}
      {activeSub === "penyesuaian" && <PenyesuaianBarangPage />}
      {activeSub === "opname" && <StockOpnamePage />}
    </div>
  );
}

window.BarangPage = BarangPage;
