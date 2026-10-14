// Manufaktur — Surat Perintah Kerja: list, dialog (create/edit), dan entry modal SPK referensi.
// Dipindah dari manufaktur.jsx, identifier diprefix Mf/MF_.
//
// State-lifting fix: MfSpkDialog sekarang merakit objek form pada tombol Simpan dan mengirimnya
// ke onSave (sebelumnya tombol Simpan hanya memanggil onSave tanpa data apa pun, sehingga
// Tambah/Edit tidak pernah benar-benar tersimpan). rows/setRows diangkat ke MfManufakturPage.

// Seed MF_SPK_SEED.tgl pakai format "DD-MM-YYYY" (dipakai langsung di tabel list), sedangkan
// <input type="date"> HANYA menerima/mengembalikan "YYYY-MM-DD" — tanpa konversi ini date picker
// tampil kosong tiap kali buka View/Edit SPK lama (bug: value mentah "01-06-2026" bukan ISO valid,
// jadi browser diam-diam menganggapnya kosong). Pola sama seperti akToIso/akFromIso di Keuangan.
function mfToIso(dmy) {
  if (!dmy) return "";
  const [d, m, y] = dmy.split("-");
  if (!d || !m || !y) return "";
  return `${y}-${m}-${d}`;
}
function mfFromIso(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!d || !m || !y) return "";
  return `${d}-${m}-${y}`;
}

// MF_MESIN_LIST (master.data.jsx) cuma daftar nama mesin, tidak ada field kode master — kode di sini
// murni disintesis dari posisinya di daftar itu, buat tampilan ringkas tabel Mesin (expand row SPK).
function mfKodeMesin(nama) {
  const idx = MF_MESIN_LIST.indexOf(nama);
  return idx >= 0 ? `MSN-${String(idx + 1).padStart(2, "0")}` : "—";
}

// Mode Lihat (View) MfSpkDialog: dulu field header tetap dirender sebagai <input>/<select> yang
// cuma di-disable (kotak abu-abu, placeholder "dd/mm/yyyy" kalau kosong, dropdown kepencet) —
// tampak seperti form kosong yang rusak, bukan tampilan data. ViewValue gantikan itu jadi teks
// polos rapi (tinggi disamakan dengan .input, 32px, supaya switch ke mode Edit tidak lompat).
function ViewValue({ children, mono }) {
  return (
    <div
      className={mono ? "mono" : ""}
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        fontSize: 13.5,
        fontWeight: 500,
        color: "var(--text)",
      }}
    >
      {children || (
        <span style={{ color: "var(--text-3)", fontWeight: 400 }}>—</span>
      )}
    </div>
  );
}

// ─── SPK List ────────────────────────────────────────────────────────────────

function MfSpkList({ rows, onAdd, onView, onEdit, onCancelDoc, onNavigate }) {
  const [tglDari, setTglDari] = React.useState("");
  const [tglSmp, setTglSmp] = React.useState("");
  const [statusF, setStatusF] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const perPage = 10;
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);

  const filtered = rows.filter((r) => {
    if (statusF && r.status !== statusF) return false;
    if (
      q &&
      !r.no.toLowerCase().includes(q.toLowerCase()) &&
      !r.produk.toLowerCase().includes(q.toLowerCase()) &&
      !(r.stempel || "").toLowerCase().includes(q.toLowerCase())
    )
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Surat Perintah Kerja</h1>
          <div className="sub">Daftar work order produksi</div>
        </div>
      </div>

      <div className="filter-bar">
        <div
          className="filter-grid filter-grid-5"
        >
          <div className="field">
            <label>Tgl. Dari</label>
            <input
              className="input"
              type="date"
              value={tglDari}
              onChange={(e) => setTglDari(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Tgl. Sampai</label>
            <input
              className="input"
              type="date"
              value={tglSmp}
              onChange={(e) => setTglSmp(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              className="select"
              value={statusF}
              onChange={(e) => setStatusF(e.target.value)}
            >
              <option value="">Semua</option>
              {MF_STATUS_SPK.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={() => setPage(1)}>
              {I.search(13)} Cari
            </button>
            <button
              className="btn"
              onClick={() => {
                setTglDari("");
                setTglSmp("");
                setStatusF("");
                setQ("");
                setPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            Total Item <b>({filtered.length})</b>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              {I.plus()} Tambah Data
            </button>
            <button className="btn btn-sm btn-icon" title="Refresh">
              {I.refresh()}
            </button>
            <button
              className="btn btn-sm btn-icon"
              title="Cetak"
              onClick={() => {
                setCetakRow(null);
                setShowCetak(true);
              }}
            >
              {I.print()}
            </button>
            <button className="btn btn-sm btn-icon btn-danger" title="Hapus">
              {I.trash()}
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input type="checkbox" className="cb" />
                </th>
                <th>No SPK</th>
                <th>Tanggal</th>
                <th>Produk</th>
                <th>Gudang</th>
                <th>Stempel</th>
                <th>Status</th>
                <th className="center" style={{ width: 60 }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: 32,
                      color: "var(--text-3)",
                    }}
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
              {pageRows.map((r) => (
                <tr key={r.no}>
                  <td>
                    <input
                      type="checkbox"
                      className="cb"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>
                    <span
                      className="cell-link"
                      style={{ cursor: "pointer" }}
                      onClick={() => onView(r)}
                    >
                      {r.no}
                    </span>
                  </td>
                  <td>{r.tgl}</td>
                  <td>{r.produk}</td>
                  <td>{r.gudang}</td>
                  <td>
                    {r.stempel ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11.5,
                          fontWeight: 600,
                          background: "var(--primary)",
                          color: "#fff",
                        }}
                      >
                        {r.stempel}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`pill ${STATUS_CLASS[r.status] || "draft"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="center">
                    <div className="row-actions">
                      <button
                        className="btn btn-icon btn-sm"
                        title="Edit"
                        onClick={() => onEdit(r)}
                      >
                        {I.edit()}
                      </button>
                      <button
                        className="btn btn-icon btn-sm"
                        title="Cetak"
                        onClick={() => {
                          setCetakRow(r);
                          setShowCetak(true);
                        }}
                      >
                        {I.print()}
                      </button>
                      {onCancelDoc && (
                        <button
                          className="btn btn-icon btn-sm del"
                          title={
                            r.status === "Batal"
                              ? "Sudah dibatalkan"
                              : "Batalkan SPK"
                          }
                          disabled={r.status === "Batal"}
                          onClick={() => onCancelDoc(r)}
                        >
                          {I.fileX(14)}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager">
          <span>
            Menampilkan {pageRows.length} dari {filtered.length} data
          </span>
          <div className="pager-pages">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              {I.chev(12, "left")}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === page ? "active" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {I.chev(12, "right")}
            </button>
          </div>
        </div>
      </div>

      {showCetak && (
        <MfSpkCetakModal
          docLabel="Surat Perintah Kerja"
          rows={rows}
          initialSelected={cetakRow ? [cetakRow.no] : null}
          onClose={() => {
            setShowCetak(false);
            setCetakRow(null);
          }}
        />
      )}
    </>
  );
}

// ─── SPK Dialog ──────────────────────────────────────────────────────────────

function MfSpkDialog({ data, initialMode, onClose, onSave, onCancelDoc }) {
  // CREATE (data kosong) | VIEW (buka dari klik nama) | EDIT (buka dari ikon Edit)
  const [mode, setMode] = React.useState(
    data ? (initialMode === "EDIT" ? "EDIT" : "VIEW") : "CREATE",
  );
  const isCreate = mode === "CREATE";
  const isView = mode === "VIEW";
  const isBatal = data?.status === "Batal";

  // No. SPK: gerbang F/K sebelum field lain terbuka, sama pola dengan No. Bukti di KO/SO/DO
  // (lihat noBuktiLocked di PjDocModal) — user ketik F atau K, nomor lengkap dibuat saat Simpan.
  const [noBuktiRaw, setNoBuktiRaw] = React.useState("");
  const [noBuktiError, setNoBuktiError] = React.useState("");
  const noBuktiRef = React.useRef(null);
  const handleNoBuktiChange = (val) => {
    const v = val.toUpperCase();
    setNoBuktiRaw(v);
    if (!v) setNoBuktiError("No. SPK harus di isi");
    else if (!["F", "K"].includes(v[0]))
      setNoBuktiError("Format No. SPK salah");
    else setNoBuktiError("");
  };
  const noBuktiLocked =
    isCreate && (!noBuktiRaw || !["F", "K"].includes(noBuktiRaw[0]));
  React.useEffect(() => {
    if (isCreate && noBuktiRef.current) noBuktiRef.current.focus();
  }, [isCreate]);

  // Header fields
  // tgl: seed pakai "DD-MM-YYYY" (lihat mfToIso/mfFromIso di atas), dikonversi ke ISO di sini
  // supaya <input type="date"> benar-benar menampilkan tanggalnya, bukan kosong.
  const [tgl, setTgl] = React.useState(
    data?.tgl ? mfToIso(data.tgl) : "2026-06-24",
  );
  const [noSo, setNoSo] = React.useState(data?.noSo || "");
  const [stempel, setStempel] = React.useState(data?.stempel || "");
  const [status, setStatus] = React.useState(data?.status || "Proses");
  const [tglKirim, setTglKirim] = React.useState(data?.tglKirim || "");
  const [soPicker, setSoPicker] = React.useState(false);
  // SO yang baru dipilih tapi nunggu konfirmasi user — cuma dipakai kalau tabel Barang Jadi SAAT
  // INI sudah ada isinya (baik dari SO sebelumnya maupun ditambah manual), supaya user tidak
  // kehilangan data tanpa sadar cuma karena salah klik No. SO. Kalau tabel masih kosong, SO baru
  // langsung diterapkan tanpa dialog (tidak ada apa-apa yang bisa hilang).
  const [pendingSo, setPendingSo] = React.useState(null);

  // Line items — diisi dari data yang sudah ada supaya mode View/Edit menampilkan barisnya
  // (sebelumnya selalu mulai kosong meski data.bjLines/bahanLines terisi).
  const [bjLines, setBjLines] = React.useState(data?.bjLines || []);
  // bahanLines skrg terhubung ke 1 baris Barang Jadi lewat field bjLineId (1 barang jadi bisa
  // punya 2-3 bahan atau lebih). Data lama (sebelum field ini ada) tidak punya bjLineId sama
  // sekali — supaya bahan itu tetap kelihatan (bukan hilang begitu saja), di-normalisasi ke
  // barang jadi PERTAMA saat modal dibuka; untuk SPK 1-barang (kasus paling umum) ini memang
  // benar apa adanya karena semua bahan itu pasti milik satu-satunya barang jadi yang ada.
  const [bahanLines, setBahanLines] = React.useState(() =>
    (data?.bahanLines || []).map((r) =>
      r.bjLineId ? r : { ...r, bjLineId: data?.bjLines?.[0]?.id ?? null },
    ),
  );
  const [bjModal, setBjModal] = React.useState(null); // null | 'add' | {idx, data}
  // Baris Barang Jadi yang tabel bahannya sedang di-expand (klik ▸ per baris) — bahan sekarang
  // cuma bisa DIUBAH lewat popup Tambah/Edit Barang (lihat MfBarangJadiEntryModal), expand di sini
  // murni tampilan ringkas supaya jelas tiap barang butuh bahan apa saja tanpa pindah section.
  const [expandedBjIds, setExpandedBjIds] = React.useState(new Set());
  const toggleExpand = (id) =>
    setExpandedBjIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  // Approval
  const fmtNow = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const [dibuatOleh, setDibuatOleh] = React.useState(
    data?.dibuatOleh || "Admin",
  );
  const [dibuatTgl, setDibuatTgl] = React.useState(data?.dibuatTgl || fmtNow());
  const [isApproved, setIsApproved] = React.useState(data?.isApproved || false);
  const [disetujuiOleh, setDisetujuiOleh] = React.useState(
    data?.disetujuiOleh || "",
  );
  const [disetujuiTgl, setDisetujuiTgl] = React.useState(
    data?.disetujuiTgl || "",
  );

  const handleApprove = () => {
    setIsApproved(true);
    setDisetujuiOleh("Admin");
    setDisetujuiTgl(fmtNow());
  };

  const modalBodyRef = React.useRef(null);

  React.useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && !bjModal && !soPicker && !pendingSo) onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [bjModal, soPicker, pendingSo, onClose]);

  // Barang Jadi: pola sama seperti tabel item Pembelian/Penjualan — tambah SATU baris sekaligus
  // lewat popup (Kode/Nama terkunci begitu dipilih), hapus bersifat soft-delete (baris ditandai
  // _deleted, masih bisa di-Restore sebelum Simpan) bukan langsung hilang. Bahan tidak lagi punya
  // tabel/soft-delete sendiri di sini — sepenuhnya dikelola di dalam popup Tambah/Edit Barang
  // (MfBarangJadiEntryModal) dan di-replace wholesale untuk bjLineId terkait tiap kali popup itu
  // disimpan (lihat onSave bjModal di bawah).
  const softDeleteBj = (idx) =>
    setBjLines((ls) =>
      ls.map((r, i) => (i === idx ? { ...r, _deleted: true } : r)),
    );
  const restoreBj = (idx) =>
    setBjLines((ls) =>
      ls.map((r, i) => (i === idx ? { ...r, _deleted: false } : r)),
    );

  // Terapkan SO terpilih: REPLACE (bukan tambah) seluruh Barang Jadi & Bahan dengan item SO itu —
  // dipanggil langsung kalau tabel masih kosong, atau setelah user konfirmasi "Ganti No. SO?"
  // kalau sudah ada isinya (lihat dialog confirmChangeSo di bawah). Kode_Item SO berasal dari
  // katalog Penjualan (BARANG di inventory.jsx, sparepart) yang BEDA SAMA SEKALI dari BARANG_JADI
  // (produk atap/steel manufaktur, modul Barang) — jadi bahan cuma otomatis kebentuk kalau
  // Kode_Item itu KEBETULAN match resep BOM (BRG_BOM_SEED, modul Barang); kalau tidak, baris
  // Barang Jadi tetap masuk (kode/nama/qty/satuan apa adanya dari SO) tapi bahannya kosong — user
  // lengkapi manual lewat "Edit". Mesin SELALU kosong dari import (BOM modul Barang tidak mengurus
  // mesin) — wajib dipilih manual per barang sebelum SPK bisa disimpan (lihat hasEmptyMesin).
  const applySoImport = (so) => {
    setNoSo(so.No_Bukti);
    const soItems = [...(so.Details || []), ...(so.Details2 || [])];
    const newBj = [];
    const newBahan = [];
    soItems.forEach((item, i) => {
      const newId = Date.now() + i;
      const bom = brgBomFor(item.Kode_Item);
      newBj.push({
        id: newId,
        kodeBarang: item.Kode_Item,
        namaBarang: item.Nama_Item,
        qtySPK: item.Jumlah,
        satuan: item.Satuan || "",
        namaKelompokWarna: "",
        namaAz: "",
        namaBrand: "",
        namaMerkBarang: "",
        stempel: "",
        mesinDipilih: [],
        _added: true,
      });
      if (bom) {
        newBahan.push(
          ...brgBomBuildBahanLines(item.Kode_Item, item.Jumlah).map(
            (b, bi) => ({
              ...b,
              id: Date.now() + i * 100 + bi,
              bjLineId: newId,
              _added: true,
            }),
          ),
        );
      }
    });
    setBjLines(newBj);
    setBahanLines(newBahan);
    setExpandedBjIds(new Set());
    window.__erpToast &&
      window.__erpToast(
        `${newBj.length} barang jadi diimpor dari SO ${so.No_Bukti}.`,
      );
  };

  // Barang Jadi tanpa Mesin tidak boleh disimpan — mesin dulunya opsional di sini, tapi jadi wajib
  // karena impor dari SO/BOM selalu ninggalin mesinDipilih kosong (BOM cuma urus Bahan). Baris yang
  // sudah ditandai _deleted dikecualikan (mau dihapus, jadi tidak relevan).
  const hasEmptyMesin = bjLines.some(
    (r) => !r._deleted && (r.mesinDipilih || []).length === 0,
  );

  const handleSave = () => {
    if (hasEmptyMesin) return; // jaga-jaga — tombol Simpan sudah disabled, ini cuma defensif
    // Buang baris soft-delete + strip flag _deleted/_added sebelum disimpan (sama seperti
    // handleSave PjDocModal/PbModalShell di Penjualan/Pembelian).
    const cleanBj = bjLines
      .filter((r) => !r._deleted)
      .map(({ _deleted, _added, ...r }) => r);
    const cleanBahan = bahanLines
      .filter((r) => !r._deleted)
      .map(({ _deleted, _added, ...r }) => r);
    // No. SPK baru dibentuk dari huruf F/K yang diketik + "SPK" + YYMM + acak, sama pola
    // dengan No. Bukti KO/SO/DO (lihat handleSave di PjDocModal).
    const finalNo = isCreate
      ? (noBuktiRaw[0] || "") +
        "SPK" +
        new Date().toISOString().slice(2, 4) +
        new Date().toISOString().slice(5, 7) +
        String(Math.floor(Math.random() * 9000) + 1000)
      : data.no;
    onSave({
      no: finalNo,
      tgl: mfFromIso(tgl) || tgl,
      noSo,
      stempel,
      status,
      tglKirim,
      Batal: status === "Batal",
      Alasan_Batal: data?.Alasan_Batal || "",
      bjLines: cleanBj,
      bahanLines: cleanBahan,
      dibuatOleh,
      dibuatTgl,
      isApproved,
      disetujuiOleh,
      disetujuiTgl,
      produk: cleanBj[0]?.namaBarang || data?.produk || "",
      gudang: cleanBahan[0]?.gudang || data?.gudang || "",
      qty: cleanBj[0]?.qtySPK || data?.qty || "",
      kodeBahan: cleanBahan[0]?.kodeBahan || data?.kodeBahan || "",
    });
  };

  const tdS = {
    padding: "5px 6px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "middle",
  };
  // Sel tabel bertipe teks-terpotong (ellipsis): title={value} bikin browser nampilin native tooltip
  // pas di-hover, jadi isi lengkapnya tetap kebaca meski teks aslinya panjang & tampilannya "...".
  const tdEllipsis = (value) => ({
    style: {
      ...tdS,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    title: value || undefined,
  });
  // Header putih (bg-elev) — konsisten dengan tabel item Pembelian/Penjualan (lihat wrapper
  // className="inline-table" di bawah, yang men-trigger aturan CSS .inline-table .line-items thead th).
  const thS = (w, center) => ({
    padding: "10px 10px",
    fontWeight: 500,
    fontSize: "11.5px",
    letterSpacing: ".04em",
    textTransform: "uppercase",
    textAlign: center ? "center" : "left",
    width: w || undefined,
  });

  return (
    <>
      <div className="modal-backdrop">
        <div
          className="modal"
          style={{ maxWidth: 1440 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-head">
            <div>
              <h2>
                {isCreate
                  ? "Buat Surat Perintah Kerja"
                  : isView
                    ? `Surat Perintah Kerja — ${data.no}`
                    : `Edit Surat Perintah Kerja — ${data.no}`}
              </h2>
              <div className="sub">
                {isView
                  ? "Mode lihat — klik Edit untuk mengubah."
                  : "Pastikan semua kolom bertanda (*) terisi."}
              </div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>
              {I.x(16)}
            </button>
          </div>

          <div
            className="modal-body"
            ref={modalBodyRef}
            style={{ paddingTop: 0, position: "relative" }}
          >
            {/* ── Header info bar ────────────────────────────── */}
            <div
              style={{
                background: "var(--bg-sub)",
                padding: "14px 0 14px",
                marginLeft: -24,
                marginRight: -24,
                paddingLeft: 24,
                paddingRight: 24,
                borderBottom: "1px solid var(--border)",
                marginBottom: 0,
              }}
            >
              {/* Grid 3 zona (4/4/4) — tiap zona nge-stack 2 field col-12 (full-width zona itu
                  sendiri), bukan side-by-side lagi. Grid 1: No. SPK/Status, Grid 2: Tanggal/Tgl.
                  Kirim, Grid 3: No. SO/Stempel. */}
              <div
                className="form-grid-3"
                style={{ gap: 16 }}
              >
                {/* Grid 1: No. SPK, Status */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>No. SPK</label>
                    {isView ? (
                      <ViewValue mono>{data?.no}</ViewValue>
                    ) : isCreate ? (
                      <>
                        <input
                          ref={noBuktiRef}
                          className="input mono"
                          type="text"
                          value={noBuktiRaw}
                          onChange={(e) => handleNoBuktiChange(e.target.value)}
                          placeholder="Ketik F atau K"
                          maxLength={1}
                        />
                        {noBuktiError && (
                          <div className="no-bukti-alert">{noBuktiError}</div>
                        )}
                      </>
                    ) : (
                      <input className="input" value={data?.no} readOnly />
                    )}
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Status</label>
                    {isView ? (
                      <ViewValue>
                        <span
                          className={`pill ${STATUS_CLASS[status] || "draft"}`}
                        >
                          {status}
                        </span>
                      </ViewValue>
                    ) : (
                      <select
                        className="select"
                        value={status}
                        disabled={isBatal || noBuktiLocked}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        {MF_STATUS_SPK.filter((s) => s !== "Batal").map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                        {isBatal && <option>Batal</option>}
                      </select>
                    )}
                  </div>
                </div>

                {/* Grid 2: Tanggal, Tgl. Kirim */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Tanggal *</label>
                    {isView ? (
                      <ViewValue>{mfFromIso(tgl)}</ViewValue>
                    ) : (
                      <input
                        className="input"
                        type="date"
                        value={tgl}
                        disabled={noBuktiLocked}
                        onChange={(e) => setTgl(e.target.value)}
                      />
                    )}
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Tgl. Kirim</label>
                    {isView ? (
                      <ViewValue>{mfFromIso(tglKirim)}</ViewValue>
                    ) : (
                      <input
                        className="input"
                        type="date"
                        value={tglKirim}
                        disabled={noBuktiLocked}
                        onChange={(e) => setTglKirim(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                {/* Grid 3: No. SO, Stempel */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>No. SO</label>
                    {isView ? (
                      <ViewValue>{noSo}</ViewValue>
                    ) : (
                      <input
                        className="input"
                        style={{
                          cursor: noBuktiLocked ? "default" : "pointer",
                          background: "var(--bg-elev)",
                        }}
                        readOnly
                        placeholder="— Pilih Sales Order —"
                        value={noSo}
                        onClick={() => {
                          if (!noBuktiLocked) setSoPicker(true);
                        }}
                      />
                    )}
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Stempel</label>
                    {isView ? (
                      <ViewValue>
                        {stempel && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 999,
                              fontSize: 11.5,
                              fontWeight: 600,
                              background: "var(--primary)",
                              color: "#fff",
                            }}
                          >
                            {stempel}
                          </span>
                        )}
                      </ViewValue>
                    ) : (
                      <select
                        className="select"
                        value={stempel}
                        disabled={noBuktiLocked}
                        onChange={(e) => setStempel(e.target.value)}
                      >
                        <option value="">— Pilih —</option>
                        {MF_STEMPEL_LIST.map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Approval bar (edit mode only) ──────────────── */}
            {data && (
              <div
                style={{
                  background: "var(--bg-sub)",
                  marginLeft: -24,
                  marginRight: -24,
                  padding: "10px 24px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: "var(--text-3)",
                        lineHeight: 1,
                      }}
                    >
                      Dibuat Oleh
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {dibuatOleh}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                      {dibuatTgl}
                    </div>
                  </div>
                </div>

                {isApproved ? (
                  <>
                    <div
                      style={{
                        width: 40,
                        height: 2,
                        background: "var(--primary)",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: "#22c55e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            color: "var(--text-3)",
                            lineHeight: 1,
                          }}
                        >
                          Disetujui Oleh
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {disetujuiOleh}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                          {disetujuiTgl}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: 40,
                        height: 2,
                        background: "var(--border)",
                        flexShrink: 0,
                      }}
                    />
                    {isView ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: "var(--bg-elev)",
                            border: "2px dashed var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "var(--text-3)",
                            fontWeight: 700,
                          }}
                        >
                          ?
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                              color: "var(--text-3)",
                              lineHeight: 1,
                            }}
                          >
                            Status Persetujuan
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--text-3)",
                            }}
                          >
                            Menunggu Persetujuan
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleApprove}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {I.check()} Setujui Surat Perintah Kerja
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Content ────────────────────────────────────── */}
            <div
              style={{
                paddingTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              {/* Section: Barang Jadi — tiap baris bisa di-expand (▸) buat lihat bahan yang
                  dibutuhkan barang itu; nambah/ubah/hapus bahan dilakukan lewat popup Tambah/Edit
                  Barang, bukan di tabel ini lagi. */}
              <div className="inline-table">
                {!isView && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div className="sub">
                      {bjLines.some((r) => !r._deleted)
                        ? "Klik ▸ pada tiap baris untuk melihat bahan yang dibutuhkan barang itu."
                        : ""}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={noBuktiLocked}
                      title={
                        noBuktiLocked
                          ? "Pilih No. SPK (Tunai/Kredit) terlebih dahulu."
                          : undefined
                      }
                      onClick={() => {
                        if (noBuktiLocked) {
                          window.__erpToast &&
                            window.__erpToast(
                              "Pilih No. SPK (Tunai/Kredit) terlebih dahulu.",
                            );
                          return;
                        }
                        setBjModal("add");
                      }}
                    >
                      {I.plus()} Tambah Barang
                    </button>
                  </div>
                )}
                <div className="line-items" style={{ overflowX: "auto" }}>
                  {/* table-layout:fixed di sini PENTING: tanpa ini, baris expand (isExpanded) yang
                      berisi grid+tabel bersarang (Bahan/Mesin) bikin browser fallback ke perhitungan
                      lebar berbasis konten di setiap level (grid 12-kolom & tabel width:100% jadi
                      tidak punya referensi lebar pasti), sehingga teks nowrap di dalamnya "menarik"
                      tabel INI, lalu popup-nya, jadi jauh lebih lebar dari seharusnya (bug scroll
                      horizontal di popup). Dengan fixed, lebar tabel murni dari kolom thead & minWidth
                      di bawah — turun sebagai referensi pasti ke semua yang bersarang di dalamnya. */}
                  <table
                    style={{
                      width: "100%",
                      tableLayout: "fixed",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      minWidth: 940,
                    }}
                  >
                    <thead>
                      <tr>
                        {/* Kolom fixed-px (expand/aksi) + kolom % HARUS pas 100% total — kalau kurang,
                            table-layout:fixed men-stretch SEMUA kolom (termasuk yg px) buat nutup sisanya,
                            bikin kolom expand/aksi jadi lebar & kolom teks (Kode Brg. dll) jadi lebih
                            sempit dari yang di-declare. Nama Barang dijadiin sisa lewat calc() supaya
                            totalnya selalu tepat 100% berapa pun lebar tabelnya.
                            44px expand: btn-icon.btn-sm 28px + td padding 12px = 40px minimum.
                            76px aksi: 2x btn-icon.btn-sm (28px) + gap 2px + td padding 12px = 70px minimum. */}
                        <th style={thS("44px", true)}></th>
                        <th
                          style={{
                            ...thS("calc(100% - 120px - 57%)"),
                            fontWeight: 700,
                          }}
                        >
                          Nama Barang Jadi
                        </th>
                        <th style={thS("13%")}>Kode</th>
                        <th style={thS("6%", true)}>Qty SPK</th>
                        <th style={thS("4%", true)}>Sat.</th>
                        <th style={thS("11%")}>Kelompok Warna</th>
                        <th style={thS("5%")}>AZ</th>
                        <th style={thS("8%")}>Brand</th>
                        <th style={thS("10%")}>Merk Barang</th>
                        <th style={thS("76px", true)}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bjLines.length === 0 && (
                        <tr>
                          <td
                            colSpan={10}
                            style={{
                              padding: "32px 12px",
                              textAlign: "center",
                              color: "var(--text-3)",
                              fontSize: 13,
                            }}
                          >
                            Belum ada barang jadi. Klik "+ Tambah Barang" untuk
                            menambahkan.
                          </td>
                        </tr>
                      )}
                      {bjLines.map((row, idx) => {
                        const bahanForRow = bahanLines.filter(
                          (b) => b.bjLineId === row.id && !b._deleted,
                        );
                        const isExpanded = expandedBjIds.has(row.id);
                        return (
                          <React.Fragment key={row.id}>
                            <tr
                              className={`${row._deleted ? "row-deleted" : ""} ${row._added ? "row-added" : ""}`}
                              title={
                                row._deleted ? "Barang ini akan dihapus" : ""
                              }
                            >
                              <td style={{ ...tdS, textAlign: "center" }}>
                                {!row._deleted && (
                                  <button
                                    className="btn btn-icon btn-sm"
                                    title={
                                      isExpanded
                                        ? "Sembunyikan bahan"
                                        : "Lihat bahan"
                                    }
                                    onClick={() => toggleExpand(row.id)}
                                  >
                                    {isExpanded ? "▾" : "▸"}
                                  </button>
                                )}
                              </td>
                              <td {...tdEllipsis(row.namaBarang)}>
                                {row.namaBarang || (
                                  <span style={{ color: "var(--text-3)" }}>
                                    —
                                  </span>
                                )}
                                {!row._deleted &&
                                  (row.mesinDipilih || []).length === 0 && (
                                    <span
                                      title="Mesin belum diisi — klik Edit untuk menambahkan"
                                      style={{
                                        marginLeft: 6,
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        padding: "1px 6px",
                                        borderRadius: 999,
                                        background:
                                          "var(--danger-soft, #fee2e2)",
                                        color: "var(--danger)",
                                      }}
                                    >
                                      ⚠ Mesin kosong
                                    </span>
                                  )}
                              </td>
                              <td {...tdEllipsis(row.kodeBarang)}>
                                <span
                                  style={{
                                    color: "var(--primary)",
                                    fontWeight: 500,
                                  }}
                                >
                                  {row.kodeBarang}
                                </span>
                              </td>
                              <td
                                style={{ ...tdS, textAlign: "right" }}
                                className="mono"
                              >
                                {row.qtySPK}
                              </td>
                              <td style={{ ...tdS, textAlign: "center" }}>
                                {row.satuan}
                              </td>
                              <td {...tdEllipsis(row.namaKelompokWarna)}>
                                {row.namaKelompokWarna || "—"}
                              </td>
                              <td style={tdS}>{row.namaAz || "—"}</td>
                              <td {...tdEllipsis(row.namaBrand)}>
                                {row.namaBrand || "—"}
                              </td>
                              <td {...tdEllipsis(row.namaMerkBarang)}>
                                {row.namaMerkBarang || "—"}
                              </td>
                              <td style={{ ...tdS, textAlign: "center" }}>
                                {!isView && (
                                  <div
                                    className="row-actions"
                                    style={{ justifyContent: "center" }}
                                  >
                                    {row._deleted ? (
                                      <button
                                        className="btn btn-icon btn-sm"
                                        style={{ color: "var(--realisasi)" }}
                                        title="Restore"
                                        onClick={() => restoreBj(idx)}
                                      >
                                        {I.refresh(14)}
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          className="btn btn-icon btn-sm"
                                          title="Edit"
                                          onClick={() =>
                                            setBjModal({ idx, data: row })
                                          }
                                        >
                                          {I.edit()}
                                        </button>
                                        <button
                                          className="btn btn-icon btn-sm del"
                                          title="Hapus"
                                          onClick={() => softDeleteBj(idx)}
                                        >
                                          {I.trash()}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                            {isExpanded && !row._deleted && (
                              <tr>
                                <td
                                  colSpan={10}
                                  style={{
                                    padding: 0,
                                    background: "var(--bg-sub)",
                                    borderBottom: "1px solid var(--border)",
                                    overflow: "hidden",
                                  }}
                                >
                                  {/* 2 tabel berdampingan: Bahan (col-8) & Mesin (col-4), dari grid 12-kolom —
                                  Bahan sengaja dilebarkan dari col-6 ke col-8 (dulu col-6+col-4 cuma
                                  pakai 10/12 kolom, nyisain 2 kolom kosong di kanan) supaya kolom Nama
                                  bahan (nama produk lengkap, sering panjang) py ruang lebih; Mesin ikut
                                  bergeser ke kanan mengisi 2 kolom yang tadinya kosong, lebarnya sendiri
                                  tidak berubah. Kedua <table> di bawah WAJIB dikasih width:100%+minWidth:0
                                  inline — tanpa itu, selector global ".line-items table" (styles.css) ikut
                                  kena ke tabel bersarang ini juga (bukan cuma tabel Barang Jadi induknya)
                                  dan memaksa min-width:920px, yang bikin tabel Mesin tembus keluar dari
                                  kolom col-4-nya. */}
                                  <div
                                    style={{
                                      padding: "10px 16px 14px 44px",
                                      display: "grid",
                                      gridTemplateColumns: "repeat(12, 1fr)",
                                      gap: 16,
                                      maxWidth: "100%",
                                    }}
                                  >
                                    <div
                                      style={{
                                        gridColumn: "span 8",
                                        minWidth: 0,
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 10.5,
                                          fontWeight: 700,
                                          textTransform: "uppercase",
                                          letterSpacing: ".06em",
                                          color: "var(--text-3)",
                                          marginBottom: 6,
                                        }}
                                      >
                                        Bahan
                                      </div>
                                      {bahanForRow.length === 0 ? (
                                        <div
                                          style={{
                                            fontSize: 12.5,
                                            color: "var(--text-3)",
                                          }}
                                        >
                                          Belum ada bahan untuk barang ini. Klik
                                          ikon Edit untuk menambahkan.
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--radius)",
                                            overflow: "hidden",
                                            background: "var(--bg-elev)",
                                          }}
                                        >
                                          {/* table-layout:fixed + lebar kolom total 100% — tanpa ini browser
                                          mengabaikan hint lebar (%/px) di kolom NO dan melebarkannya sesuai
                                          algoritma auto-layout, bukan proporsi yang diminta. */}
                                          <table
                                            style={{
                                              width: "100%",
                                              minWidth: 0,
                                              tableLayout: "fixed",
                                              borderCollapse: "separate",
                                              borderSpacing: 0,
                                            }}
                                          >
                                            <thead>
                                              <tr
                                                style={{
                                                  background: "var(--bg-sub)",
                                                }}
                                              >
                                                <th
                                                  style={{
                                                    ...thS("34px", true),
                                                    padding: "8px 4px",
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  No
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("14%"),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Gudang
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("32%"),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Nama
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("16%"),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Kode
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("14%"),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Merk
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("12%", true),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Jumlah
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("12%", true),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Satuan
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {bahanForRow.map((b, i) => (
                                                <tr key={b.id}>
                                                  <td
                                                    style={{
                                                      ...tdS,
                                                      textAlign: "center",
                                                      color: "var(--text-3)",
                                                      fontSize: 12,
                                                    }}
                                                  >
                                                    {i + 1}
                                                  </td>
                                                  <td {...tdEllipsis(b.gudang)}>
                                                    {b.gudang || "—"}
                                                  </td>
                                                  <td
                                                    {...tdEllipsis(
                                                      brgBomResolveKomponen(
                                                        b.kodeBahan,
                                                      )?.namaKomponen,
                                                    )}
                                                  >
                                                    {brgBomResolveKomponen(
                                                      b.kodeBahan,
                                                    )?.namaKomponen || "—"}
                                                  </td>
                                                  <td
                                                    {...tdEllipsis(b.kodeBahan)}
                                                  >
                                                    <span
                                                      style={{
                                                        color: "var(--primary)",
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      {b.kodeBahan}
                                                    </span>
                                                  </td>
                                                  <td
                                                    {...tdEllipsis(b.merkBahan)}
                                                  >
                                                    {b.merkBahan || "—"}
                                                  </td>
                                                  <td
                                                    style={{
                                                      ...tdS,
                                                      textAlign: "center",
                                                    }}
                                                    className="mono"
                                                  >
                                                    {b.jumlah}
                                                  </td>
                                                  <td
                                                    style={{
                                                      ...tdS,
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {b.satuan}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        gridColumn: "span 4",
                                        minWidth: 0,
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: 10.5,
                                          fontWeight: 700,
                                          textTransform: "uppercase",
                                          letterSpacing: ".06em",
                                          color: "var(--text-3)",
                                          marginBottom: 6,
                                        }}
                                      >
                                        Mesin
                                      </div>
                                      {(row.mesinDipilih || []).length === 0 ? (
                                        <div
                                          style={{
                                            fontSize: 12.5,
                                            color: "var(--text-3)",
                                          }}
                                        >
                                          Belum ada mesin dipilih.
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--radius)",
                                            overflow: "hidden",
                                            background: "var(--bg-elev)",
                                          }}
                                        >
                                          <table
                                            style={{
                                              width: "100%",
                                              minWidth: 0,
                                              tableLayout: "fixed",
                                              borderCollapse: "separate",
                                              borderSpacing: 0,
                                            }}
                                          >
                                            <thead>
                                              <tr
                                                style={{
                                                  background: "var(--bg-sub)",
                                                }}
                                              >
                                                {/* No harus 34px sama kayak tabel Bahan — Nama dijadiin sisa
                                                via calc() supaya totalnya pas 100%, kalau nggak No ikut
                                                ke-stretch beda lebar dari punya tabel Bahan. */}
                                                <th
                                                  style={{
                                                    ...thS("34px", true),
                                                    padding: "8px 4px",
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  No
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS(
                                                      "calc(100% - 34px - 30%)",
                                                    ),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Nama
                                                </th>
                                                <th
                                                  style={{
                                                    ...thS("30%"),
                                                    borderBottom:
                                                      "1px solid var(--border)",
                                                  }}
                                                >
                                                  Kode
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {row.mesinDipilih.map((m, i) => (
                                                <tr key={m}>
                                                  <td
                                                    style={{
                                                      ...tdS,
                                                      textAlign: "center",
                                                      color: "var(--text-3)",
                                                      fontSize: 12,
                                                    }}
                                                  >
                                                    {i + 1}
                                                  </td>
                                                  <td {...tdEllipsis(m)}>
                                                    {m}
                                                  </td>
                                                  <td
                                                    {...tdEllipsis(
                                                      mfKodeMesin(m),
                                                    )}
                                                  >
                                                    <span
                                                      style={{
                                                        color: "var(--primary)",
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      {mfKodeMesin(m)}
                                                    </span>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-foot">
            {!isView && hasEmptyMesin ? (
              <div style={{ color: "var(--danger)", fontSize: 12.5 }}>
                Semua Barang Jadi harus punya Mesin sebelum SPK bisa disimpan.
              </div>
            ) : (
              <div className="muted">
                <kbd>Esc</kbd> Untuk Batal
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={onClose}>
                Tutup
              </button>
              {isView ? (
                <>
                  {!isBatal && onCancelDoc && (
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => onCancelDoc(data)}
                    >
                      {I.fileX(14)} Batalkan SPK
                    </button>
                  )}
                  {!isBatal && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setMode("EDIT")}
                    >
                      {I.edit()} Edit
                    </button>
                  )}
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={hasEmptyMesin}
                >
                  {I.check()} Simpan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {bjModal && (
        <MfBarangJadiEntryModal
          data={bjModal === "add" ? null : bjModal.data}
          bahanLines={
            bjModal === "add"
              ? []
              : bahanLines.filter(
                  (b) => b.bjLineId === bjModal.data.id && !b._deleted,
                )
          }
          onClose={() => setBjModal(null)}
          onSave={({ bahanLines: newBahan, ...entry }) => {
            if (bjModal === "add") {
              const newId = Date.now();
              setBjLines((ls) => [
                ...ls,
                { ...entry, id: newId, _added: true },
              ]);
              setBahanLines((ls) => [
                ...ls,
                ...newBahan.map((b) => ({
                  ...b,
                  bjLineId: newId,
                  _added: true,
                })),
              ]);
              setExpandedBjIds((prev) => new Set(prev).add(newId)); // langsung expand supaya bahan yg baru diisi kelihatan
            } else {
              const rowId = bjModal.data.id;
              setBjLines((ls) =>
                ls.map((l, i) =>
                  i === bjModal.idx
                    ? { ...entry, id: l.id, _added: l._added }
                    : l,
                ),
              );
              // Bahan punya barang ini di-replace wholesale dgn hasil popup (editing bahan sekarang
              // sepenuhnya terjadi di dalam MfBarangJadiEntryModal, bukan di tabel doc-level lagi).
              setBahanLines((ls) => [
                ...ls.filter((b) => b.bjLineId !== rowId),
                ...newBahan.map((b) => ({ ...b, bjLineId: rowId })),
              ]);
            }
            setBjModal(null);
          }}
        />
      )}
      {soPicker && (
        <MfSoPickerModal
          onCancel={() => setSoPicker(false)}
          onConfirm={(so) => {
            setSoPicker(false);
            const hasExisting = bjLines.some((r) => !r._deleted);
            if (hasExisting)
              setPendingSo(so); // tunda, nunggu konfirmasi (lihat dialog di bawah)
            else applySoImport(so); // tabel masih kosong, tidak ada yang bisa hilang
          }}
        />
      )}
      {pendingSo && (
        <ConfirmationModal
          title="Ganti No. SO?"
          message={`Data Barang Jadi & Bahan yang sudah ada akan diganti dengan data dari SO "${pendingSo.No_Bukti}". Tindakan ini tidak bisa dibatalkan setelah dilanjutkan.`}
          requireReason={false}
          confirmLabel="Ya, Ganti"
          confirmKind="danger-solid"
          cancelLabel="Batal"
          onConfirm={() => {
            applySoImport(pendingSo);
            setPendingSo(null);
          }}
          onCancel={() => setPendingSo(null)}
        />
      )}
    </>
  );
}
