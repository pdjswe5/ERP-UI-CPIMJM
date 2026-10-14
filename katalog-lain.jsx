// Katalog Lain module

// ---------- Mock data ----------
const KL_SALESMAN = [
  { kodeSales:'SL001', namaSales:'Affan Maulana', alamatSales:'Surabaya', telpon:'081234500001', email:'affan@pdj.co.id', targetSales:50000000, keterangan:'', aktif:true },
  { kodeSales:'SL002', namaSales:'Bobby Santoso', alamatSales:'Surabaya', telpon:'081234500002', email:'bobby@pdj.co.id', targetSales:35000000, keterangan:'', aktif:true },
  { kodeSales:'SL003', namaSales:'Charlie Reynold', alamatSales:'Sidoarjo', telpon:'081234500003', email:'charlie@pdj.co.id', targetSales:40000000, keterangan:'', aktif:true },
  { kodeSales:'SL004', namaSales:'Dewi Kartika', alamatSales:'Gresik', telpon:'081234500004', email:'dewi@pdj.co.id', targetSales:25000000, keterangan:'', aktif:false },
  { kodeSales:'SL005', namaSales:'Kevin Sales Baru', alamatSales:'', telpon:'', email:'', targetSales:0, keterangan:'', aktif:false },
];

const KL_GUDANG = [
  { kodeGudang:'GDG001', namaGudang:'Gudang Utama', jenis:'BAKU', keterangan:'Berisi stok bahan baku', aktif:true },
  { kodeGudang:'GDG002', namaGudang:'Gudang Konjoran', jenis:'JADI', keterangan:'Berisi stok barang jadi', aktif:true },
  { kodeGudang:'GDG003', namaGudang:'Gudang Pusat', jenis:'CAMPURAN', keterangan:'', aktif:true },
  { kodeGudang:'GDG004', namaGudang:'Gudang Cabang Surabaya', jenis:'CAMPURAN', keterangan:'', aktif:true },
  { kodeGudang:'KAF123', namaGudang:'Affan Aktif', jenis:'LAIN', keterangan:'berisi stok Aktif', aktif:false },
];

const KL_KATEGORI = [
  { kodeKategori:'BAKU', namaKategori:'Bahan Baku', keterangan:'', aktif:true },
  { kodeKategori:'JADI', namaKategori:'Barang Jadi', keterangan:'', aktif:true },
  { kodeKategori:'KAT001', namaKategori:'Aksesoris', keterangan:'', aktif:true },
  { kodeKategori:'KAT002', namaKategori:'K3', keterangan:'', aktif:true },
  { kodeKategori:'KAT003', namaKategori:'Kemasan', keterangan:'', aktif:true },
  { kodeKategori:'M002', namaKategori:'Affan', keterangan:'', aktif:false },
];

const KL_SATUAN = [
  { kodeSatuan:'45', namaSatuan:'PCS', keterangan:'Satuan default', aktif:true },
  { kodeSatuan:'50', namaSatuan:'PDJ', keterangan:'', aktif:true },
  { kodeSatuan:'53', namaSatuan:'PACK', keterangan:'', aktif:true },
  { kodeSatuan:'56', namaSatuan:'LBR', keterangan:'', aktif:true },
  { kodeSatuan:'60', namaSatuan:'KG', keterangan:'', aktif:true },
  { kodeSatuan:'70', namaSatuan:'ROLL', keterangan:'', aktif:false },
];

// KL_PELENGKAP: katalog datar lama, dibiarkan ada (tidak dipakai KLPelengkapPage lagi — halaman itu
// sekarang dirombak jadi 13 kategori data master di bawah, lihat KLPelengkapPage).
const KL_PELENGKAP = [
  { kodeProduk:'AS1023ATBBKW2075000150', kodeSatuan:'56', isi:1, hrgJual:50000, keterangan:'Baik', aktif:true },
  { kodeProduk:'AA0450914100550', kodeSatuan:'56', isi:1, hrgJual:275000, keterangan:'', aktif:true },
  { kodeProduk:'BB040091470550', kodeSatuan:'60', isi:1, hrgJual:260000, keterangan:'', aktif:true },
  { kodeProduk:'PRD001', kodeSatuan:'45', isi:1, hrgJual:15000, keterangan:'', aktif:true },
  { kodeProduk:'LN-005', kodeSatuan:'53', isi:12, hrgJual:2500, keterangan:'', aktif:false },
];

// ─── 13 kategori "Pelengkap Bahan Baku & Barang Umum" (KLPelengkapPage) ─────
// Kolom "Kelompok" di Warna/Yield/AZ/Jenis/Tipe/Merk semuanya FK ke KL_KELOMPOK_WARNA (1 daftar
// kelompok dipakai bersama lintas kategori) — kolom "Kelompok" DI DALAM KL_KELOMPOK_WARNA sendiri
// tetap teks bebas (bukan menunjuk ke dirinya sendiri). KL_BERAT py 3 FK sekaligus (Tebal/Kelompok
// Warna/AZ) — kode-kodenya sengaja match ke array FK-nya supaya dropdown & lookup render di list
// langsung benar (bukan kode karangan lepas).

const KL_TEBAL = [
  { kodeTebal:'T020', tebal:0.20, aktif:true },
  { kodeTebal:'T025', tebal:0.25, aktif:true },
  { kodeTebal:'T030', tebal:0.30, aktif:true },
  { kodeTebal:'T035', tebal:0.35, aktif:true },
  { kodeTebal:'T040', tebal:0.40, aktif:false },
];

const KL_AREA = [
  { kodeArea:'AR01', area:'Surabaya', aktif:true },
  { kodeArea:'AR02', area:'Sidoarjo', aktif:true },
  { kodeArea:'AR03', area:'Gresik', aktif:true },
  { kodeArea:'AR04', area:'Malang', aktif:true },
  { kodeArea:'AR05', area:'Jakarta', aktif:false },
];

const KL_BRAND = [
  { kodeBrand:'BR01', brand:'Solite', aktif:true },
  { kodeBrand:'BR02', brand:'Alderon', aktif:true },
  { kodeBrand:'BR03', brand:'Superroof', aktif:true },
  { kodeBrand:'BR04', brand:'Onduline', aktif:true },
  { kodeBrand:'BR05', brand:'Multiroof', aktif:false },
];

// Sengaja tanpa kolom Kode terpisah (sesuai spesifikasi user) — `id` internal dipakai sbg keyField
// KLSimpleCatalog tapi TIDAK dimasukkan ke listColumns, jadi tidak tampil di tabel.
const KL_CHECKER = [
  { id:'chk01', checklistPoint:'Ketebalan sesuai spesifikasi', aktif:true },
  { id:'chk02', checklistPoint:'Warna merata, tidak belang', aktif:true },
  { id:'chk03', checklistPoint:'Tidak ada goresan/cacat permukaan', aktif:true },
  { id:'chk04', checklistPoint:'Ukuran panjang & lebar sesuai order', aktif:true },
  { id:'chk05', checklistPoint:'Kemasan rapi & label terpasang', aktif:false },
];

const KL_KELOMPOK_WARNA = [
  { kodeKelompokWarna:'KW01', keterangan:'Warna Terang', kelompok:'Standard', indexWarna:1, aktif:true },
  { kodeKelompokWarna:'KW02', keterangan:'Warna Gelap', kelompok:'Standard', indexWarna:2, aktif:true },
  { kodeKelompokWarna:'KW03', keterangan:'Warna Metalik', kelompok:'Premium', indexWarna:3, aktif:true },
  { kodeKelompokWarna:'KW04', keterangan:'Warna Custom', kelompok:'Special Order', indexWarna:4, aktif:true },
  { kodeKelompokWarna:'KW05', keterangan:'Warna Netral', kelompok:'Standard', indexWarna:5, aktif:false },
];

const KL_WARNA = [
  { kodeWarna:'AG', keterangan:'Abu Gelap', kelompok:'KW02', kelompokPu:'KW02', aktif:true },
  { kodeWarna:'AA', keterangan:'Abu Angkola', kelompok:'KW01', kelompokPu:'KW01', aktif:true },
  { kodeWarna:'BB', keterangan:'Biru Bromo', kelompok:'KW03', kelompokPu:'KW01', aktif:true },
  { kodeWarna:'AS', keterangan:'Abu Salju', kelompok:'KW01', kelompokPu:'KW05', aktif:true },
  { kodeWarna:'BR', keterangan:'Bata Merah', kelompok:'KW04', kelompokPu:'KW04', aktif:false },
];

const KL_YIELD = [
  { kodeYield:'400', keterangan:'Yield G-400', kelompok:'KW01', aktif:true },
  { kodeYield:'550', keterangan:'Yield G-550', kelompok:'KW02', aktif:true },
  { kodeYield:'600', keterangan:'Yield G-600', kelompok:'KW03', aktif:true },
  { kodeYield:'700', keterangan:'Yield G-700', kelompok:'KW01', aktif:false },
];

const KL_AZ = [
  { kodeAz:'70', keterangan:'AZ 70', kelompok:'KW01', aktif:true },
  { kodeAz:'100', keterangan:'AZ 100', kelompok:'KW01', aktif:true },
  { kodeAz:'150', keterangan:'AZ 150', kelompok:'KW02', aktif:true },
  { kodeAz:'200', keterangan:'AZ 200', kelompok:'KW03', aktif:false },
];

const KL_JENIS = [
  { kodeJenis:'FBR', keterangan:'Fiber', kelompok:'KW01', aktif:true },
  { kodeJenis:'MTL', keterangan:'Metal', kelompok:'KW02', aktif:true },
  { kodeJenis:'GEN', keterangan:'Genteng', kelompok:'KW03', aktif:true },
  { kodeJenis:'PVC', keterangan:'PVC', kelompok:'KW01', aktif:false },
];

const KL_TIPE = [
  { kodeTipe:'STD', keterangan:'Standard', kelompok:'KW01', aktif:true },
  { kodeTipe:'CST', keterangan:'Custom', kelompok:'KW04', aktif:true },
  { kodeTipe:'PRM', keterangan:'Premium', kelompok:'KW03', aktif:true },
  { kodeTipe:'ECO', keterangan:'Ekonomis', kelompok:'KW01', aktif:false },
];

const KL_MERK = [
  { kodeMerk:'MK01', keterangan:'Solite', kelompok:'KW03', aktif:true },
  { kodeMerk:'MK02', keterangan:'Alderon', kelompok:'KW02', aktif:true },
  { kodeMerk:'MK03', keterangan:'Superroof', kelompok:'KW01', aktif:true },
  { kodeMerk:'MK04', keterangan:'Onduline', kelompok:'KW03', aktif:false },
];

const KL_BERAT = [
  { kodeBerat:'BRT01', kodeTebal:'T020', kodeKelompokWarna:'KW01', kodeAz:'70', berat:2.15, hpp:35000, aktif:true },
  { kodeBerat:'BRT02', kodeTebal:'T025', kodeKelompokWarna:'KW02', kodeAz:'100', berat:2.68, hpp:42000, aktif:true },
  { kodeBerat:'BRT03', kodeTebal:'T030', kodeKelompokWarna:'KW03', kodeAz:'150', berat:3.20, hpp:50000, aktif:true },
  { kodeBerat:'BRT04', kodeTebal:'T035', kodeKelompokWarna:'KW01', kodeAz:'70', berat:3.75, hpp:58000, aktif:false },
];

const KL_MESIN = [
  { noMesin:'001', namaMesin:'TRIM 1', noGlobal:'', operator:'Andi P.', qty:1, satuan:'MTR', detik:3, aktif:true },
  { noMesin:'002', namaMesin:'TRIM 2 VIETNAM', noGlobal:'', operator:'Budi S.', qty:1, satuan:'MTR', detik:2, aktif:true },
  { noMesin:'003', namaMesin:'SPAN 68', noGlobal:'SPAN', operator:'Charlie R.', qty:1, satuan:'MTR', detik:9, aktif:true },
  { noMesin:'004', namaMesin:'SPAN 93', noGlobal:'SPAN', operator:'Dewi K.', qty:1, satuan:'MTR', detik:5, aktif:true },
  { noMesin:'005', namaMesin:'SLITTING 1 LEBAR 450', noGlobal:'SLITTING', operator:'', qty:1, satuan:'MTR', detik:4, aktif:false },
];

const KL_AKUN = [
  { kodeAkun:'100.001', namaAkun:'Kas Besar', tipe:'A', grup:'01', subGrup:'01', keterangan:'', aktif:true },
  { kodeAkun:'100.002', namaAkun:'Kas Kecil', tipe:'A', grup:'01', subGrup:'02', keterangan:'Baik', aktif:true },
  { kodeAkun:'200.000', namaAkun:'Aktiva', tipe:'A', grup:'01', subGrup:'01', keterangan:'', aktif:true },
  { kodeAkun:'300.001', namaAkun:'Hutang Dagang', tipe:'H', grup:'02', subGrup:'01', keterangan:'', aktif:true },
  { kodeAkun:'400.001', namaAkun:'Penjualan', tipe:'P', grup:'03', subGrup:'01', keterangan:'', aktif:true },
  { kodeAkun:'MD.015', namaAkun:'Akun Nonaktif', tipe:'A', grup:'01', subGrup:'03', keterangan:'', aktif:false },
];

const KL_AKTIVA = [
  { noAktiva:'AKT001', namaAktiva:'Mesin Cetak Roll Forming', jenis:'Mesin Produksi', jumlah:2, nilai:450000000, tglSusut:'2024-01-01', rateSusut:10, keterangan:'', aktif:true },
  { noAktiva:'AKT002', namaAktiva:'Truk Engkel Pengiriman', jenis:'Kendaraan', jumlah:3, nilai:280000000, tglSusut:'2023-06-01', rateSusut:12.5, keterangan:'', aktif:true },
  { noAktiva:'AKT003', namaAktiva:'Forklift Gudang Utama', jenis:'Alat Berat', jumlah:1, nilai:175000000, tglSusut:'2022-03-01', rateSusut:12.5, keterangan:'', aktif:true },
  { noAktiva:'AKT004', namaAktiva:'AC Kantor Lantai 2', jenis:'Elektronik', jumlah:6, nilai:36000000, tglSusut:'2021-01-01', rateSusut:25, keterangan:'Sudah disusutkan penuh', aktif:false },
  { noAktiva:'AKT005', namaAktiva:'Komputer & Server', jenis:'Elektronik', jumlah:10, nilai:95000000, tglSusut:'2024-08-01', rateSusut:25, keterangan:'', aktif:true },
];

const KL_GRUPUSER = [
  { kodeGrup:'GR01', namaGrup:'Super Admin', keterangan:'Akses penuh seluruh modul', aktif:true },
  { kodeGrup:'GR02', namaGrup:'Akuntan', keterangan:'Akses modul keuangan & akuntansi', aktif:true },
  { kodeGrup:'GR03', namaGrup:'Staff Gudang', keterangan:'Akses modul barang & inventory', aktif:true },
  { kodeGrup:'GR04', namaGrup:'Sales Manager', keterangan:'Akses modul pelanggan & penjualan', aktif:true },
];

const KL_USER = [
  { kodeUser:'pdjsw', namaUser:'PDJ Administrator', grupUser:'GR01', email:'admin@pdj.co.id', password:'••••••••', keterangan:'', aktif:true },
  { kodeUser:'admin', namaUser:'Admin Operasional', grupUser:'GR01', email:'ops@pdj.co.id', password:'••••••••', keterangan:'', aktif:true },
  { kodeUser:'operator_1', namaUser:'Siti Rahayu', grupUser:'GR02', email:'siti@pdj.co.id', password:'••••••••', keterangan:'', aktif:true },
  { kodeUser:'budi.gdg', namaUser:'Budi Santoso', grupUser:'GR03', email:'budi@pdj.co.id', password:'••••••••', keterangan:'', aktif:true },
  { kodeUser:'dewi.sls', namaUser:'Dewi Kartika', grupUser:'GR04', email:'dewi@pdj.co.id', password:'••••••••', keterangan:'', aktif:false },
];

const ACTIVITY_LOG_KATALOG_LAIN = [
  { user:'pdjsw', action:'Melakukan Login:', detail:'Sistem Utama', time:'1 menit yang lalu', color:'var(--realisasi)' },
  { user:'admin', action:'Mengubah Data Pemasok:', detail:'PT. Sinar Jaya', time:'22 menit yang lalu', color:'#f59e0b' },
  { user:'operator_1', action:'Membuat Nota Penjualan:', detail:'INV-2026-4718', time:'1 jam yang lalu', color:'var(--realisasi)' },
  { user:'system', action:'Sinkronisasi Database:', detail:'Server Cloud Utama', time:'3 jam yang lalu', color:'var(--accent)' },
  { user:'admin', action:'Menghapus Batch Produksi:', detail:'PRD-2026-B4', time:'5 jam yang lalu', color:'var(--danger)' },
];

// ---------- Shared UI helpers ----------
function KLHeader({ title, sub, onAdd, addLabel='Tambah' }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1><div className="sub">{sub}</div></div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="btn btn-sm">{I.refresh()} Refresh</button>
        <button className="btn btn-sm">{I.download()} Export</button>
        {onAdd && <button className="btn btn-primary" onClick={onAdd}>{I.plus()} {addLabel}</button>}
      </div>
    </div>
  );
}

function klAktifPill(aktif) { return <span className={`pill ${aktif ? 'approved' : 'cancelled'}`}>{aktif ? 'Aktif' : 'Non-aktif'}</span>; }

// Tab pill scroll-spy (dipakai KLPelengkapPage) — klik pill scroll-jump ke section itu, BUKAN
// mount/unmount switcher; semua section tetap ada di DOM (13 tabel sekaligus, panjang), pill cuma
// nge-highlight kategori mana yang lagi "aktif" secara visual.
function KLPillTabs({ tabs, active, onSelect }) {
  return (
    <div style={{display:'flex', gap:8, flexWrap:'wrap', padding:'12px 0 20px', position:'sticky', top:0, background:'var(--bg)', zIndex:5}}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onSelect(t.id)} style={{
          padding:'6px 16px', borderRadius:999, border:'1px solid var(--border)', fontSize:13, fontWeight:500,
          background: active===t.id ? 'var(--primary)' : 'var(--bg-sub)',
          color: active===t.id ? '#fff' : 'var(--text)', cursor:'pointer',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

function KLGenericModal({ moduleTitle, data, fields, formCols=2, onClose, onSave }) {
  const isEdit = !!data;
  const empty = Object.fromEntries(fields.map(f => [f.key, f.type === 'aktif' ? true : f.type === 'number' ? 0 : '']));
  const [form, setForm] = React.useState(data ? {...empty, ...data} : empty);
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:720}}>
        <div className="modal-head">
          <div><h2>{isEdit ? `Edit ${moduleTitle}` : `Tambah ${moduleTitle}`}</h2><div className="sub">Pastikan semua kolom bertanda (*) terisi.</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body">
          <div className={`form-grid-${formCols}`} style={{gap:12}}>
            {fields.map(f => {
              const spanStyle = f.span ? {gridColumn:`span ${f.span}`} : {};
              if (f.type === 'aktif') {
                return (
                  <div className="field" style={spanStyle} key={f.key}>
                    <label>Status</label>
                    <select className="select" value={form[f.key] ? '1' : '0'} onChange={e=>set(f.key, e.target.value === '1')}>
                      <option value="1">Aktif</option><option value="0">Non-aktif</option>
                    </select>
                  </div>
                );
              }
              if (f.type === 'select') {
                const opts = typeof f.options === 'function' ? f.options() : f.options;
                return (
                  <div className="field" style={spanStyle} key={f.key}>
                    <label>{f.label}{f.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
                    <select className="select" value={form[f.key]} onChange={e=>set(f.key, e.target.value)}>
                      <option value="">— Pilih —</option>
                      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                );
              }
              if (f.type === 'textarea') {
                return (
                  <div className="field" style={spanStyle} key={f.key}>
                    <label>{f.label}</label>
                    <textarea className="textarea" value={form[f.key]} onChange={e=>set(f.key, e.target.value)}/>
                  </div>
                );
              }
              return (
                <div className="field" style={spanStyle} key={f.key}>
                  <label>{f.label}{f.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
                  <input
                    className={`input ${f.mono ? 'mono' : ''}`}
                    type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : 'text'}
                    disabled={f.disabled}
                    value={form[f.key]}
                    onChange={e=>set(f.key, f.type === 'number' ? +e.target.value : e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={()=>onSave(form)}>{I.check()} Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KLSimpleCatalog({ moduleTitle, addLabel='Tambah Data', initialRows, keyField, listColumns, fields, formCols=2, note }) {
  const [rows, setRows] = React.useState(initialRows);
  const [modal, setModal] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [q, setQ] = React.useState('');
  // Root-cause fix: tombol Hapus di bawah dulu tidak punya onClick sama sekali (no-op). Data master
  // di sini bukan dokumen berstatus, jadi hard delete (hapus baris sungguhan) lewat konfirmasi.
  const [pendingDelete, setPendingDelete] = React.useState(null);
  const filtered = rows.filter(r => !q || listColumns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q.toLowerCase())));
  const openAdd = () => { setModal(null); setShowModal(1); };
  const openEdit = (r) => { setModal(r); setShowModal(2); };
  const save = (form) => {
    setRows(prev => showModal === 2 ? prev.map(r => r[keyField] === modal[keyField] ? form : r) : [...prev, form]);
    window.__erpToast && window.__erpToast(`${moduleTitle} berhasil disimpan.`);
    setShowModal(false); setModal(null);
  };
  return (
    <>
      <KLHeader title={moduleTitle} sub={`Jumlah: ${filtered.length} data${note ? ' · ' + note : ''}`} onAdd={openAdd} addLabel={addLabel} />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr>{listColumns.map(c => <th key={c.key}>{c.label}</th>)}<th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r[keyField]} onClick={()=>openEdit(r)}>
                  {listColumns.map((c,i) => (
                    <td key={c.key} className={c.mono ? 'mono' : ''}>
                      {c.render ? c.render(r[c.key], r) : i === 0 ? <span className="cell-link">{r[c.key]}</span> : (r[c.key] ?? <span className="muted">—</span>)}
                    </td>
                  ))}
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>openEdit(r)}>{I.edit()}</button>
                      <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>setPendingDelete(r)}>{I.trash()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager"><div>Menampilkan <b>1</b>–<b>{filtered.length}</b> dari <b>{filtered.length}</b></div></div>
      </div>
      {showModal && <KLGenericModal moduleTitle={moduleTitle} data={modal} fields={fields} formCols={formCols} onClose={()=>setShowModal(false)} onSave={save} />}
      {pendingDelete && (
        <ConfirmationModal
          title="Hapus Data?" message={`Data "${pendingDelete[keyField]}" akan dihapus permanen dari ${moduleTitle}.`}
          confirmLabel="Hapus" confirmKind="danger" requireReason={false}
          onCancel={()=>setPendingDelete(null)}
          onConfirm={()=>{
            setRows(prev => prev.filter(x => x[keyField] !== pendingDelete[keyField]));
            window.__erpToast && window.__erpToast(`${moduleTitle} berhasil dihapus.`);
            setPendingDelete(null);
          }} />
      )}
    </>
  );
}

// ─── 1-9. Halaman katalog (nama fungsi di-prefix KL* — lihat catatan rename di plan) ───

function KLSalesmanPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Salesman" addLabel="Tambah Salesman" keyField="kodeSales" initialRows={KL_SALESMAN}
      listColumns={[
        { key:'kodeSales', label:'Kode', mono:true },
        { key:'namaSales', label:'Nama' },
        { key:'telpon', label:'Telepon', mono:true },
        { key:'targetSales', label:'Target', render:v => fmtRp(v) },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'kodeSales', label:'Kode Sales', required:true, mono:true },
        { key:'namaSales', label:'Nama Sales', required:true },
        { key:'alamatSales', label:'Alamat Sales', type:'textarea', span:2 },
        { key:'telpon', label:'Telepon', mono:true },
        { key:'email', label:'Email', type:'email' },
        { key:'targetSales', label:'Target Sales', type:'number' },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

function KLGudangPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Gudang" addLabel="Tambah Gudang" keyField="kodeGudang" initialRows={KL_GUDANG}
      listColumns={[
        { key:'kodeGudang', label:'Kode', mono:true },
        { key:'namaGudang', label:'Nama' },
        { key:'jenis', label:'Jenis' },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'kodeGudang', label:'Kode Gudang', required:true, mono:true },
        { key:'namaGudang', label:'Nama Gudang', required:true },
        { key:'jenis', label:'Jenis' },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

function KLKategoriBarangPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Kategori Barang" addLabel="Tambah Kategori" keyField="kodeKategori" initialRows={KL_KATEGORI}
      listColumns={[
        { key:'kodeKategori', label:'Kode', mono:true },
        { key:'namaKategori', label:'Nama' },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'kodeKategori', label:'Kode Kategori', required:true, mono:true },
        { key:'namaKategori', label:'Nama Kategori', required:true },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

function KLSatuanBarangPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Satuan Barang" addLabel="Tambah Satuan" keyField="kodeSatuan" initialRows={KL_SATUAN}
      listColumns={[
        { key:'kodeSatuan', label:'Kode', mono:true },
        { key:'namaSatuan', label:'Nama' },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'namaSatuan', label:'Nama Satuan', required:true },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

// Helper dipakai berulang oleh Warna/Yield/AZ/Jenis/Tipe/Merk & Berat — "Kelompok" di kategori
// itu semuanya FK ke KL_KELOMPOK_WARNA (1 daftar kelompok dipakai bersama), lihat catatan di atas
// deklarasi KL_KELOMPOK_WARNA.
function klKelompokWarnaOptions() { return KL_KELOMPOK_WARNA.map(k => ({ value:k.kodeKelompokWarna, label:k.keterangan })); }
function klKelompokWarnaLabel(kode) { return KL_KELOMPOK_WARNA.find(k => k.kodeKelompokWarna === kode)?.keterangan || kode; }

// Pelengkap Bahan Baku & Barang Umum — 13 kategori data master, pola scroll-spy: klik pill
// (KLPillTabs) scroll-jump ke section-nya, semua 13 <KLSimpleCatalog> tetap ter-render sekaligus
// (bukan tab switcher mount/unmount satu-satu) — sama seperti tampilan referensi user.
function KLPelengkapPage() {
  const [activeTab, setActiveTab] = React.useState('berat');
  const tabs = [
    { id:'berat', label:'Berat' }, { id:'tebal', label:'Tebal' }, { id:'area', label:'Area' },
    { id:'brand', label:'Brand' }, { id:'checker', label:'Checker' }, { id:'kelompokwarna', label:'Kelompok Warna' },
    { id:'warna', label:'Warna' }, { id:'yield', label:'Yield' }, { id:'az', label:'AZ' },
    { id:'jenis', label:'Jenis' }, { id:'tipe', label:'Tipe' }, { id:'merk', label:'Merk' }, { id:'mesin', label:'Mesin' },
  ];
  const refs = React.useRef({});
  tabs.forEach(t => { if (!refs.current[t.id]) refs.current[t.id] = React.createRef(); });
  const scrollTo = (id) => {
    setActiveTab(id);
    refs.current[id]?.current?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pelengkap Bahan Baku & Barang Umum</h1>
          <div className="sub">Data master pelengkap: berat, dimensi, atribut warna, dan mesin.</div>
        </div>
      </div>
      <KLPillTabs tabs={tabs} active={activeTab} onSelect={scrollTo} />

      <div ref={refs.current.berat} style={{marginTop:24}}>
        <KLSimpleCatalog
          moduleTitle="Berat" addLabel="Tambah Berat" keyField="kodeBerat" initialRows={KL_BERAT}
          listColumns={[
            { key:'kodeBerat', label:'Kode', mono:true },
            { key:'kodeTebal', label:'Kode Tebal', mono:true },
            { key:'kodeKelompokWarna', label:'Kode Kelompok Warna', render:v => klKelompokWarnaLabel(v) },
            { key:'kodeAz', label:'Kode AZ', render:v => KL_AZ.find(a=>a.kodeAz===v)?.keterangan || v },
            { key:'berat', label:'Berat' },
            { key:'hpp', label:'Hpp', render:v => fmtRp(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeBerat', label:'Kode', required:true, mono:true },
            { key:'kodeTebal', label:'Kode Tebal', type:'select', required:true, options:()=>KL_TEBAL.map(t=>({value:t.kodeTebal, label:`${t.kodeTebal} — ${t.tebal}`})) },
            { key:'kodeKelompokWarna', label:'Kode Kelompok Warna', type:'select', required:true, options:klKelompokWarnaOptions },
            { key:'kodeAz', label:'Kode AZ', type:'select', required:true, options:()=>KL_AZ.map(a=>({value:a.kodeAz, label:a.keterangan})) },
            { key:'berat', label:'Berat', type:'number' },
            { key:'hpp', label:'Hpp', type:'number' },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.tebal} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Tebal" addLabel="Tambah Tebal" keyField="kodeTebal" initialRows={KL_TEBAL}
          listColumns={[
            { key:'kodeTebal', label:'Kode', mono:true },
            { key:'tebal', label:'Tebal' },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeTebal', label:'Kode', required:true, mono:true },
            { key:'tebal', label:'Tebal', type:'number', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.area} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Area" addLabel="Tambah Area" keyField="kodeArea" initialRows={KL_AREA}
          listColumns={[
            { key:'kodeArea', label:'Kode', mono:true },
            { key:'area', label:'Area' },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeArea', label:'Kode', required:true, mono:true },
            { key:'area', label:'Area', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.brand} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Brand" addLabel="Tambah Brand" keyField="kodeBrand" initialRows={KL_BRAND}
          listColumns={[
            { key:'kodeBrand', label:'Kode', mono:true },
            { key:'brand', label:'Brand' },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeBrand', label:'Kode', required:true, mono:true },
            { key:'brand', label:'Brand', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.checker} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Checker" addLabel="Tambah Checklist" keyField="id" initialRows={KL_CHECKER}
          listColumns={[
            { key:'checklistPoint', label:'Checklist Point' },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'id', label:'ID', required:true, mono:true },
            { key:'checklistPoint', label:'Checklist Point', required:true, span:2 },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.kelompokwarna} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Kelompok Warna" addLabel="Tambah Kelompok Warna" keyField="kodeKelompokWarna" initialRows={KL_KELOMPOK_WARNA}
          listColumns={[
            { key:'kodeKelompokWarna', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok' },
            { key:'indexWarna', label:'Index Warna' },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeKelompokWarna', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok' },
            { key:'indexWarna', label:'Index Warna', type:'number' },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.warna} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Warna" addLabel="Tambah Warna" keyField="kodeWarna" initialRows={KL_WARNA}
          listColumns={[
            { key:'kodeWarna', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok', render:v => klKelompokWarnaLabel(v) },
            { key:'kelompokPu', label:'Kelompok PU', render:v => klKelompokWarnaLabel(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeWarna', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok', type:'select', options:klKelompokWarnaOptions },
            { key:'kelompokPu', label:'Kelompok PU', type:'select', options:klKelompokWarnaOptions },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.yield} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Yield" addLabel="Tambah Yield" keyField="kodeYield" initialRows={KL_YIELD}
          listColumns={[
            { key:'kodeYield', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok', render:v => klKelompokWarnaLabel(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeYield', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok', type:'select', options:klKelompokWarnaOptions },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.az} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="AZ" addLabel="Tambah AZ" keyField="kodeAz" initialRows={KL_AZ}
          listColumns={[
            { key:'kodeAz', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok', render:v => klKelompokWarnaLabel(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeAz', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok', type:'select', options:klKelompokWarnaOptions },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.jenis} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Jenis" addLabel="Tambah Jenis" keyField="kodeJenis" initialRows={KL_JENIS}
          listColumns={[
            { key:'kodeJenis', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok', render:v => klKelompokWarnaLabel(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeJenis', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok', type:'select', options:klKelompokWarnaOptions },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.tipe} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Tipe" addLabel="Tambah Tipe" keyField="kodeTipe" initialRows={KL_TIPE}
          listColumns={[
            { key:'kodeTipe', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok', render:v => klKelompokWarnaLabel(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeTipe', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok', type:'select', options:klKelompokWarnaOptions },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.merk} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Merk" addLabel="Tambah Merk" keyField="kodeMerk" initialRows={KL_MERK}
          listColumns={[
            { key:'kodeMerk', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kelompok', label:'Kelompok', render:v => klKelompokWarnaLabel(v) },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'kodeMerk', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'kelompok', label:'Kelompok', type:'select', options:klKelompokWarnaOptions },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.mesin} style={{marginTop:32}}>
        <KLSimpleCatalog
          moduleTitle="Mesin" addLabel="Tambah Mesin" keyField="noMesin" initialRows={KL_MESIN}
          listColumns={[
            { key:'noMesin', label:'No Mesin', mono:true },
            { key:'namaMesin', label:'Nama Mesin' },
            { key:'noGlobal', label:'No Global' },
            { key:'operator', label:'Operator' },
            { key:'qty', label:'Qty' },
            { key:'satuan', label:'Satuan' },
            { key:'detik', label:'Detik' },
            { key:'aktif', label:'Status', render:v => klAktifPill(v) },
          ]}
          fields={[
            { key:'noMesin', label:'No Mesin', required:true, mono:true },
            { key:'namaMesin', label:'Nama Mesin', required:true },
            { key:'noGlobal', label:'No Global' },
            { key:'operator', label:'Operator' },
            { key:'qty', label:'Qty', type:'number' },
            { key:'satuan', label:'Satuan' },
            { key:'detik', label:'Detik', type:'number' },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>
    </>
  );
}

function KLAkunBukuBesarPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Akun Buku Besar" addLabel="Tambah Akun" keyField="kodeAkun" initialRows={KL_AKUN}
      listColumns={[
        { key:'kodeAkun', label:'Kode', mono:true },
        { key:'namaAkun', label:'Nama' },
        { key:'tipe', label:'Tipe' },
        { key:'grup', label:'Grup', mono:true },
        { key:'subGrup', label:'SubGrup', mono:true },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'kodeAkun', label:'Kode Akun', required:true, mono:true },
        { key:'namaAkun', label:'Nama Akun', required:true },
        { key:'tipe', label:'Tipe', type:'select', options:[{value:'A',label:'A — Aktiva'},{value:'H',label:'H — Hutang'},{value:'M',label:'M — Modal'},{value:'P',label:'P — Pendapatan'},{value:'B',label:'B — Beban'}] },
        { key:'grup', label:'Grup', mono:true },
        { key:'subGrup', label:'SubGrup', mono:true },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

function KLAktivaPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Aktiva" addLabel="Tambah Aktiva" keyField="noAktiva" initialRows={KL_AKTIVA}
      listColumns={[
        { key:'noAktiva', label:'No. Aktiva', mono:true },
        { key:'namaAktiva', label:'Nama' },
        { key:'jenis', label:'Jenis' },
        { key:'jumlah', label:'Jumlah' },
        { key:'nilai', label:'Nilai', render:v => fmtRp(v) },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'namaAktiva', label:'Nama Aktiva', required:true, span:2 },
        { key:'jenis', label:'Jenis' },
        { key:'jumlah', label:'Jumlah', type:'number' },
        { key:'nilai', label:'Nilai', type:'number' },
        { key:'tglSusut', label:'Tgl. Mulai Susut', type:'date' },
        { key:'rateSusut', label:'Rate Susut (%)', type:'number' },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

function KLUserPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog User" addLabel="Tambah User" keyField="kodeUser" initialRows={KL_USER}
      listColumns={[
        { key:'kodeUser', label:'Kode', mono:true },
        { key:'namaUser', label:'Nama' },
        { key:'grupUser', label:'Grup', render:v => KL_GRUPUSER.find(g=>g.kodeGrup===v)?.namaGrup || v },
        { key:'email', label:'Email' },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'kodeUser', label:'Kode User', required:true, mono:true },
        { key:'namaUser', label:'Nama User', required:true },
        { key:'grupUser', label:'Grup User', type:'select', required:true, options:()=>KL_GRUPUSER.map(g=>({value:g.kodeGrup, label:g.namaGrup})) },
        { key:'password', label:'Password', mono:true },
        { key:'email', label:'Email', type:'email' },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

function KLGrupUserPage() {
  return (
    <KLSimpleCatalog
      moduleTitle="Katalog Grup User" addLabel="Tambah Grup" keyField="kodeGrup" initialRows={KL_GRUPUSER}
      listColumns={[
        { key:'kodeGrup', label:'Kode', mono:true },
        { key:'namaGrup', label:'Nama' },
        { key:'aktif', label:'Status', render:v => klAktifPill(v) },
      ]}
      fields={[
        { key:'kodeGrup', label:'Kode Grup', required:true, mono:true },
        { key:'namaGrup', label:'Nama Grup', required:true },
        { key:'keterangan', label:'Keterangan', type:'textarea', span:2 },
        { key:'aktif', type:'aktif' },
      ]}
    />
  );
}

// ─── Dashboard & Router (unchanged) ────────────────────────────────────────

function KatalogLainDashboard({ onOpenSub }) {
  const sections = [
    {
      title:'Stock & Penjualan',
      count:'2',
      tiles:[
        { id:'salesman', title:'Katalog Salesman', badge:'8 sales', icon:I.users(20) },
        { id:'gudang',   title:'Katalog Gudang',   badge:'4 gudang', icon:I.box(20) },
      ]
    },
    {
      title:'Kelengkapan Barang',
      count:'3',
      tiles:[
        { id:'kategori',  title:'Katalog Kategori Barang', badge:'12 kategori', icon:I.list(20) },
        { id:'satuan',    title:'Katalog Satuan Barang',   badge:'15 satuan',   icon:I.list(20) },
        { id:'pelengkap', title:'Pelengkap Bahan Baku & Barang Umum', badge:'13 kategori', icon:I.list(20) },
      ]
    },
    {
      title:'Keuangan & Akuntan',
      count:'2',
      tiles:[
        { id:'akunbukubesar', title:'Katalog Akun Buku Besar', badge:'45 akun', icon:I.bank(20) },
        { id:'aktiva',        title:'Katalog Aktiva',          badge:'12 aktiva', icon:I.list(20) },
      ]
    },
    {
      title:'Konfigurasi Pengguna',
      count:'2',
      tiles:[
        { id:'user',     title:'Katalog User',     badge:'10 user', icon:I.users(20) },
        { id:'grupuser', title:'Katalog Grup User', badge:'4 grup',  icon:I.layers(20) },
      ]
    },
  ];
  return (
    <ModuleDashboard
      title="Dashboard Katalog Lain"
      subtitle="Halaman ini digunakan untuk mengelola data katalog lain, tersedia 9 menu pendukung."
      sections={sections}
      activityLog={ACTIVITY_LOG_KATALOG_LAIN}
      onOpenSub={onOpenSub}
      activityTitle="Log Aktivitas Terbaru"
      activitySub="Operasi sistem yang dideteksi secara real-time"
    />
  );
}

function KatalogLainPage({ activeSub, onSubChange, onNavigate }) {
  if (!activeSub) return <KatalogLainDashboard onOpenSub={onSubChange} />;
  const subLabel = MODULE_SUBS.kataloglain.find(s => s.id === activeSub)?.label ?? activeSub;
  return (
    <div className="page" data-screen-label={`Katalog Lain — ${activeSub}`}>
      <div className="crumbs">
        <a onClick={() => onNavigate?.('home')} style={{cursor:'pointer'}}>Home</a><span className="sep">/</span>
        <a onClick={()=>onSubChange(null)} style={{cursor:'pointer'}}>Katalog Lain</a><span className="sep">/</span>
        <span className="current">{subLabel}</span>
      </div>
      {activeSub === 'salesman'      && <KLSalesmanPage />}
      {activeSub === 'gudang'        && <KLGudangPage />}
      {activeSub === 'kategori'      && <KLKategoriBarangPage />}
      {activeSub === 'satuan'        && <KLSatuanBarangPage />}
      {activeSub === 'pelengkap'     && <KLPelengkapPage />}
      {activeSub === 'akunbukubesar' && <KLAkunBukuBesarPage />}
      {activeSub === 'aktiva'        && <KLAktivaPage />}
      {activeSub === 'user'          && <KLUserPage />}
      {activeSub === 'grupuser'      && <KLGrupUserPage />}
    </div>
  );
}

window.KatalogLainPage = KatalogLainPage;
