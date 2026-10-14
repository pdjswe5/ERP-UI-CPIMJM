// Laporan — router top-level modul. BEDA dari modul transaksi lain (Payroll/Manufaktur/dll): semua
// 7 sub-halaman di sini murni READ-ONLY (laporan/report generator, tidak ada data yg dibuat/diedit
// user), jadi TIDAK ADA state row yg perlu diangkat lewat React.useState spt pola *Page.jsx lainnya
// — tiap sub-halaman computed langsung dari data modul lain (Keuangan/Barang) + dataset lokal Komisi
// Salesman, on-the-fly saat render.

function LaporanDashboard({ onOpenSub }) {
  const piutangNota = SALDO_PIUTANG_ITEMS.filter((it) => it.jenis === "Nota");
  const hutangNota = SALDO_HUTANG_ITEMS.filter((it) => it.jenis === "Nota");
  const totalPiutang = piutangNota.reduce((s, it) => s + it.sisa, 0);
  const totalHutang = hutangNota.reduce((s, it) => s + it.sisa, 0);
  const komisiDibayar = LAP_KOMISI_TRX.filter((r) => r.status === "Dibayar");
  const totalKomisi = komisiDibayar.reduce((s, r) => s + r.komisiRp, 0);
  const posisiStok = lapStokPosisiSemua("2026-07-30", "", null);
  const produkTrx = LAP_STOK_TRX.filter((t) => t.tipe === "PRODUK");


  const sections = [
    {
      title: "Stok",
      count: "3",
      tiles: [
        { id: "kartustok", title: "Kartu Stok", badge: null, icon: I.list(20) },
        {
          id: "posisistok",
          title: "Posisi Stok",
          badge: null,
          icon: I.box(20),
        },
        {
          id: "rekapstok",
          title: "Rekap Stok",
          badge: null,
          icon: I.layers(20),
        },
      ],
    },
    {
      title: "Piutang & Hutang",
      count: "3",
      tiles: [
        {
          id: "rekappiutanghutang",
          title: "Rekap Piutang dan Hutang",
          badge: null,
          icon: I.chart(20),
        },
        {
          id: "kartupiutanghutang",
          title: "Kartu Piutang dan Hutang",
          badge: null,
          icon: I.invoice(20),
        },
        {
          id: "rinciannota",
          title: "Rincian Nota Piutang dan Hutang",
          badge: null,
          icon: I.list(20),
        },
      ],
    },
    {
      title: "Salesman",
      count: "1",
      tiles: [
        {
          id: "komisisalesman",
          title: "Laporan Komisi Salesman",
          badge: null,
          icon: I.users(20),
        },
      ],
    },
  ];

  return (
    <ModuleDashboard
      title="Laporan"
      subtitle="Kartu & rekap stok, piutang/hutang, dan komisi salesman"
      sections={sections}
      activityLog={[]}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}

function LaporanPage({ activeSub, onSubChange, onNavigate }) {
  const onBack = () => onSubChange(null);
  const subLabel = {
    kartustok: "Kartu Stok",
    posisistok: "Posisi Stok",
    rekapstok: "Rekap Stok",
    rekappiutanghutang: "Rekap Piutang dan Hutang",
    kartupiutanghutang: "Kartu Piutang dan Hutang",
    rinciannota: "Rincian Nota Piutang dan Hutang",
    komisisalesman: "Laporan Komisi Salesman",
  };

  if (!activeSub) {
    return <LaporanDashboard onOpenSub={onSubChange} />;
  }

  return (
    <div className="page">
      <div className="crumbs">
        <a style={{ cursor: "pointer" }} onClick={() => onNavigate("home")}>
          Home
        </a>
        <span className="sep">/</span>
        <a style={{ cursor: "pointer" }} onClick={onBack}>
          Laporan
        </a>
        <span className="sep">/</span>
        <span className="current">{subLabel[activeSub] || activeSub}</span>
      </div>

      {activeSub === "kartustok" && <LaporanKartuStokPage />}
      {activeSub === "posisistok" && <LaporanPosisiStokPage />}
      {activeSub === "rekapstok" && <LaporanRekapStokPage />}
      {activeSub === "rekappiutanghutang" && <LaporanRekapPiutangHutangPage />}
      {activeSub === "kartupiutanghutang" && <LaporanKartuPiutangHutangPage />}
      {activeSub === "rinciannota" && <LaporanRincianNotaPage />}
      {activeSub === "komisisalesman" && <LaporanKomisiSalesmanPage />}
    </div>
  );
}
