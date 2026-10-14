// Payroll — Master Data Payroll: 10 kategori kecil dalam 1 halaman pill-tab scroll-spy, pola
// PERSIS KLPelengkapPage (katalog-lain.jsx) — klik pill scroll-jump ke section itu, semua 10 tabel
// tetap di DOM sekaligus (bukan tab switcher mount/unmount). Field² ini semua jadi dropdown FK di
// Mutasi Karyawan (MutasiKaryawanModal) dan (Jenis Pekerjaan Borongan) di Transaksi Produksi Harian.

function PayrollMasterDataPage() {
  const [activeTab, setActiveTab] = React.useState('unit');
  const tabs = [
    { id:'unit', label:'Unit' }, { id:'divisi', label:'Divisi' }, { id:'status', label:'Status' },
    { id:'departemen', label:'Departemen' }, { id:'bagian', label:'Bagian' }, { id:'jabatan', label:'Jabatan' },
    { id:'kelompok', label:'Kelompok' }, { id:'waktukerja', label:'Waktu Kerja' }, { id:'golongan', label:'Golongan' },
    { id:'jeniskerja', label:'Jenis Pekerjaan Borongan' },
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
          <h1>Master Data Payroll</h1>
          <div className="sub">Data pendukung untuk Mutasi Karyawan & Transaksi Produksi Harian.</div>
        </div>
      </div>
      <PrPillTabs tabs={tabs} active={activeTab} onSelect={scrollTo} />

      <div ref={refs.current.unit} style={{marginTop:24}}>
        <PrSimpleCatalog
          moduleTitle="Unit" addLabel="Tambah Unit" keyField="kode" initialRows={PR_UNIT}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.divisi} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Divisi" addLabel="Tambah Divisi" keyField="kode" initialRows={PR_DIVISI}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'keterangan', label:'Keterangan' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'keterangan', label:'Keterangan', span:2 },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.status} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Status" addLabel="Tambah Status" keyField="kode" initialRows={PR_STATUS}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.departemen} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Departemen" addLabel="Tambah Departemen" keyField="kode" initialRows={PR_DEPARTEMEN}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.bagian} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Bagian" addLabel="Tambah Bagian" keyField="kode" initialRows={PR_BAGIAN}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.jabatan} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Jabatan" addLabel="Tambah Jabatan" keyField="kode" initialRows={PR_JABATAN}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.kelompok} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Kelompok" addLabel="Tambah Kelompok" keyField="kode" initialRows={PR_KELOMPOK}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.waktukerja} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Waktu Kerja" addLabel="Tambah Waktu Kerja" keyField="kode" initialRows={PR_WAKTU_KERJA}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'nama', label:'Nama' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'nama', label:'Nama', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.golongan} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Golongan" addLabel="Tambah Golongan" keyField="kode" initialRows={PR_GOLONGAN}
          listColumns={[
            { key:'kode', label:'Kode', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>

      <hr style={{margin:'40px 0 0', border:'none', borderTop:'1px solid var(--border)'}} />
      <div ref={refs.current.jeniskerja} style={{marginTop:32}}>
        <PrSimpleCatalog
          moduleTitle="Jenis Pekerjaan Borongan" addLabel="Tambah Jenis Pekerjaan" keyField="kode" initialRows={PR_JENIS_KERJA_BORONGAN}
          note="rate master untuk Transaksi Produksi Harian"
          listColumns={[
            { key:'kode', label:'Kode Kerja', mono:true },
            { key:'keterangan', label:'Keterangan' },
            { key:'kodeDivisi', label:'Divisi', render:v => prKodeDivisiLabel(v) },
            { key:'satuan', label:'Satuan' },
            { key:'hargaSatuan', label:'Harga/Satuan', render:v => fmtRp(v) },
            { key:'aktif', label:'Status', render:v => prAktifPill(v) },
          ]}
          fields={[
            { key:'kode', label:'Kode Kerja', required:true, mono:true },
            { key:'keterangan', label:'Keterangan', required:true, span:2 },
            { key:'kodeDivisi', label:'Divisi', type:'select', required:true, options:()=>PR_DIVISI.map(d=>({value:d.kode, label:d.nama})) },
            { key:'satuan', label:'Satuan', required:true },
            { key:'hargaSatuan', label:'Harga/Satuan', type:'number', required:true },
            { key:'aktif', type:'aktif' },
          ]}
        />
      </div>
    </>
  );
}
