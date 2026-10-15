// Penjualan — halaman Konfirmasi Order (konfirmasi pesanan pelanggan + approval)

// Field generik: kalau locked, tampil sebagai teks readonly (view-field/view-value) persis
// pola Katalog Pelanggan, bukan <input disabled> yang masih terlihat seperti kontrol form.
// Didefinisikan di top-level (bukan di dalam komponen modal) supaya identitasnya stabil antar render —
// kalau didefinisikan di dalam body komponen, tiap keystroke bikin instance baru dan React remount
// elemen <input>-nya sehingga focus hilang setelah 1 huruf.
function Fld({ label, value, onChange, required, span, mono, type='text', options, locked }) {
  const spanStyle = span ? {gridColumn:`span ${span}`} : {};
  if (locked) {
    return (
      <div className="view-field" style={spanStyle}>
        <label>{label}</label>
        <div className={`view-value ${mono ? 'mono' : ''}`}>{value || <span className="muted">—</span>}</div>
      </div>
    );
  }
  return (
    <div className="field" style={spanStyle}>
      <label>{label}{required && <span style={{color:'var(--danger)'}}> *</span>}</label>
      {type === 'select' ? (
        <select className="select" value={value} onChange={e=>onChange(e.target.value)}>
          <option value="">— Pilih —</option>
          {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea className="textarea" value={value} onChange={e=>onChange(e.target.value)} />
      ) : (
        <input className={`input ${mono ? 'mono' : ''}`} type={type} value={value} onChange={e=>onChange(type==='number' ? +e.target.value : e.target.value)} />
      )}
    </div>
  );
}

function KonfirmasiPenjualan({ rows, onAdd, onView, onEdit, onCancel, onCetak, onCetakRow }) {
  const isLocked = (k) => k.status === 'BATAL' || k.status === 'SELESAI MANUAL';
  const columns = [
    { key:'noBukti', label:'No. Bukti', mono:true },
    { key:'tglBukti', label:'Tgl. Bukti', render:(v,k) => k.tglDari || (v ? String(v).split('-').reverse().join('/') : '') },
    { key:'noReferensi', label:'No. Referensi' },
    { key:'customer', label:'Customer', render:(v,k) => <PjCodeChip name={k.customer} code={k.kodeCustomer} /> },
    { key:'sales', label:'Sales', render:(v,k) => <PjCodeChip name={k.sales} code={k.kodeSales} /> },
    { key:'caraBayar', label:'Cara Bayar' },
    { key:'status', label:'Status', sortValue:(k)=>koComputeStatus(k), render:(v,k) => koStatusPill(k) },
    { key:'progressApproval', label:'Approval', render:(v,k) => <span className={`pill ${progressApprovalClass(k.progressApproval)}`}>{k.progressApproval}</span> },
    { key:'jmlItem', label:'Jml. Item', num:true },
    { key:'totalNilai', label:'Total Nilai', num:true, render:(v) => fmtRp(v) },
  ];
  const statusFilter = {
    options: [
      { value:'BELUM_REALISASI', label:'Belum Realisasi' }, { value:'SELESAI_SEBAGIAN', label:'Selesai Sebagian' },
      { value:'SELESAI', label:'Selesai' }, { value:'SELESAI_MANUAL', label:'Selesai Manual' }, { value:'BATAL', label:'Batal' },
    ],
    match: (k, val) => koComputeStatus(k) === val,
  };
  return (
    <PjErpList
      title="Konfirmasi Order"
      rows={rows}
      columns={columns}
      rowKey="noBukti"
      onAdd={onAdd}
      addLabel="Konfirmasi Order Baru"
      onCetak={onCetak}
      onRowClick={onView}
      statusFilter={statusFilter}
      renderActions={(k) => {
        const locked = isLocked(k);
        return (
          <>
            <button className="erp-btn-icon sm" title={locked?'Lihat':'Edit'} onClick={()=>locked ? onView(k) : onEdit(k)}>{locked ? I.zoom(14) : I.edit()}</button>
            <button className="erp-btn-icon sm" title="Cetak" onClick={()=>onCetakRow ? onCetakRow(k) : (window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.'))}>{I.print()}</button>
            <button className="erp-btn-icon sm del" title="Batalkan Pesanan" disabled={locked} onClick={()=>onCancel(k)}>{I.fileX(14)}</button>
          </>
        );
      }}
    />
  );
}

// Popup "Tambah/Edit Detail Barang" — khusus barang custom atap/steel Konfirmasi Order.
// jenisBarang: 'BIASA' (1 warna, 1 tebal, punya Merk) | 'PU' (Warna Top/Bottom, Tebal Top/Bottom, tanpa Merk).
function genKodeBarangKO(jenisBarang) {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const seq = String(Math.floor(Math.random()*900000)+100000);
  return `S08-${jenisBarang==='PU'?'PU':'UM'}-${yy}${mm}${dd}${seq}`;
}

function KonfirmasiBarangDetailModal({ jenisBarang, data, onClose, onSave }) {
  const isPU = jenisBarang === 'PU';
  const empty = {
    JenisBarang: jenisBarang,
    Kode_Item: genKodeBarangKO(jenisBarang),
    Nama_Item: '',
    Jenis: '', NamaJenis: '',
    Tipe: '', NamaTipe: '',
    Lebar: 0, Panjang: 0, PanjangSatuan: 'MM',
    NamaCetak: '',
    Warna: '', NamaWarna: '', TebalTCT: 0,
    WarnaTop: '', WarnaBottom: '', TebalTop: 0, TebalBottom: 0,
    Brand: '', NamaBrand: '',
    Merk: '', NamaMerek: '',
    AZ: '', NamaAZ: '',
    Keterangan: '',
    Deskripsi: '', CatatanSalesman: '',
    Jumlah: 0, Satuan: 'PCS',
    HrgMeter: 0, Hrg_Sat: 0,
  };
  const [form, setForm] = React.useState(() => ({ ...empty, ...data, JenisBarang: jenisBarang }));
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));
  const setPair = (codeKey, nameKey, list) => (val) => setForm(f => ({ ...f, [codeKey]: val, [nameKey]: list.find(x=>x.kode===val)?.nama || '' }));
  const total = (+form.Jumlah || 0) * (+form.Hrg_Sat || 0);
  const isEdit = !!data;

  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal modal-wide" onClick={e=>e.stopPropagation()} style={{maxHeight:'92vh'}}>
        <div className="modal-head">
          <div><h2>{isEdit ? 'Edit Detail Barang' : 'Tambah Detail Barang'}</h2><div className="sub">Pastikan semua kolom bertanda (*) terisi.</div></div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={{overflowY:'auto', maxHeight:'calc(92vh - 140px)'}}>
          <div className="panel" style={{marginBottom:16}}>
            <h3>Informasi Barang Jadi {isPU ? 'PU' : 'Umum'}</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
              {/* Kiri: semua dropdown atribut (Jenis, Tipe, Warna, Brand, Merk, AZ) */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, alignContent:'start'}}>
                <div className="field"><label>Jenis <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.Jenis} onChange={e=>setPair('Jenis','NamaJenis',PJ_JENIS_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_JENIS_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                <div className="field"><label>Nama Jenis</label><input className="input" readOnly value={form.NamaJenis}/></div>

                <div className="field"><label>Tipe <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.Tipe} onChange={e=>setPair('Tipe','NamaTipe',PJ_TIPE_PRODUK)(e.target.value)}><option value="">— Pilih —</option>{PJ_TIPE_PRODUK.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                <div className="field"><label>Nama Tipe</label><input className="input" readOnly value={form.NamaTipe}/></div>

                {isPU ? (
                  <>
                    <div className="field"><label>Warna Top <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.WarnaTop} onChange={e=>setPair('WarnaTop','NamaWarnaTop',PJ_WARNA_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_WARNA_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Warna Bottom <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.WarnaBottom} onChange={e=>setPair('WarnaBottom','NamaWarnaBottom',PJ_WARNA_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_WARNA_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>

                    <div className="field"><label>Brand <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.Brand} onChange={e=>setPair('Brand','NamaBrand',PJ_BRAND_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_BRAND_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Nama Brand</label><input className="input" readOnly value={form.NamaBrand}/></div>

                    <div className="field"><label>AZ <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.AZ} onChange={e=>setPair('AZ','NamaAZ',PJ_AZ_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_AZ_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Nama AZ</label><input className="input" readOnly value={form.NamaAZ}/></div>
                  </>
                ) : (
                  <>
                    <div className="field"><label>Warna <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.Warna} onChange={e=>setPair('Warna','NamaWarna',PJ_WARNA_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_WARNA_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Nama Warna</label><input className="input" readOnly value={form.NamaWarna}/></div>

                    <div className="field"><label>Brand <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.Brand} onChange={e=>setPair('Brand','NamaBrand',PJ_BRAND_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_BRAND_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Nama Brand</label><input className="input" readOnly value={form.NamaBrand}/></div>

                    <div className="field"><label>Merk <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.Merk} onChange={e=>setPair('Merk','NamaMerek',PJ_MERK_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_MERK_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Nama Merek</label><input className="input" readOnly value={form.NamaMerek}/></div>

                    <div className="field"><label>AZ <span style={{color:'var(--danger)'}}>*</span></label><select className="select" value={form.AZ} onChange={e=>setPair('AZ','NamaAZ',PJ_AZ_BARANG)(e.target.value)}><option value="">— Pilih —</option>{PJ_AZ_BARANG.map(o=><option key={o.kode} value={o.kode}>{o.nama}</option>)}</select></div>
                    <div className="field"><label>Nama AZ</label><input className="input" readOnly value={form.NamaAZ}/></div>
                  </>
                )}
              </div>

              {/* Kanan: field lain-lain, Nama Cetak diletakkan tepat di bawah Keterangan */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, alignContent:'start'}}>
                <div className="field"><label>Kode Produk <span style={{color:'var(--danger)'}}>*</span></label><input className="input mono" readOnly value={form.Kode_Item}/></div>
                <div className="field"><label>Tipe Barang</label><input className="input mono" disabled placeholder="Otomatis" value={form.TipeData || ''}/></div>

                <div className="field" style={{gridColumn:'span 2'}}><label>Nama Produk <span style={{color:'var(--danger)'}}>*</span></label><input className="input" value={form.Nama_Item} onChange={e=>set('Nama_Item',e.target.value)}/></div>

                <div className="field"><label>Lebar <span style={{color:'var(--danger)'}}>*</span></label><div style={{display:'flex', alignItems:'center', gap:6}}><input className="input mono" type="number" value={form.Lebar} onChange={e=>set('Lebar',+e.target.value)}/><span className="muted">mm</span></div></div>
                <div className="field"><label>Panjang <span style={{color:'var(--danger)'}}>*</span></label><div style={{display:'flex', alignItems:'center', gap:6}}><input className="input mono" type="number" value={form.Panjang} onChange={e=>set('Panjang',+e.target.value)}/><select className="select" style={{width:70}} value={form.PanjangSatuan} onChange={e=>set('PanjangSatuan',e.target.value)}><option>MM</option><option>CM</option><option>M</option></select></div></div>

                {isPU ? (
                  <>
                    <div className="field"><label>Tebal Top <span style={{color:'var(--danger)'}}>*</span></label><div style={{display:'flex', alignItems:'center', gap:6}}><input className="input mono" type="number" value={form.TebalTop} onChange={e=>set('TebalTop',+e.target.value)}/><span className="muted">mm</span></div></div>
                    <div className="field"><label>Tebal Bottom <span style={{color:'var(--danger)'}}>*</span></label><div style={{display:'flex', alignItems:'center', gap:6}}><input className="input mono" type="number" value={form.TebalBottom} onChange={e=>set('TebalBottom',+e.target.value)}/><span className="muted">mm</span></div></div>
                  </>
                ) : (
                  <div className="field"><label>Tebal TCT <span style={{color:'var(--danger)'}}>*</span></label><div style={{display:'flex', alignItems:'center', gap:6}}><input className="input mono" type="number" value={form.TebalTCT} onChange={e=>set('TebalTCT',+e.target.value)}/><span className="muted">mm</span></div></div>
                )}

                <div className="field" style={{gridColumn:'span 2'}}><label>Keterangan</label><textarea className="textarea" value={form.Keterangan} onChange={e=>set('Keterangan',e.target.value)}/></div>
                <div className="field" style={{gridColumn:'span 2'}}><label>Nama Cetak</label><input className="input" value={form.NamaCetak} onChange={e=>set('NamaCetak',e.target.value)}/></div>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Catatan & Harga</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
              <div className="field" style={{gridColumn:'span 2'}}><label>Catatan Pelanggan</label><textarea className="textarea" value={form.Deskripsi} onChange={e=>set('Deskripsi',e.target.value)}/></div>
              <div className="field" style={{gridColumn:'span 2'}}><label>Catatan Salesman</label><textarea className="textarea" value={form.CatatanSalesman} onChange={e=>set('CatatanSalesman',e.target.value)}/></div>

              <div className="field"><label>Jumlah Barang <span style={{color:'var(--danger)'}}>*</span></label><div style={{display:'flex', gap:6}}><input className="input mono" type="number" value={form.Jumlah} onChange={e=>set('Jumlah',+e.target.value)}/><select className="select" style={{width:80}} value={form.Satuan} onChange={e=>set('Satuan',e.target.value)}><option>PCS</option><option>LEMBAR</option><option>MTR</option><option>ROLL</option></select></div></div>
              <div className="field"><label>Hrg/Meter Rp.</label><input className="input mono" type="number" value={form.HrgMeter} onChange={e=>set('HrgMeter',+e.target.value)}/></div>
              <div className="field"><label>Hrg. Satuan Rp. <span style={{color:'var(--danger)'}}>*</span></label><input className="input mono" type="number" value={form.Hrg_Sat} onChange={e=>set('Hrg_Sat',+e.target.value)}/></div>
              <div className="field"><label>Hrg. Total Rp. <span style={{color:'var(--danger)'}}>*</span></label><input className="input mono" readOnly value={fmtRp(total)}/></div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <div className="right" style={{display:'flex', gap:8, marginLeft:'auto'}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={()=>onSave({...form, Total: total})}>{I.plus()} {isEdit ? 'Simpan Item' : 'Tambah Item'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KonfirmasiPenjualanModal({ data, initialMode, onClose, onSave }) {
  // initialMode="EDIT" membuka langsung dalam mode edit (dipakai tombol Edit di list), tanpa itu default VIEW.
  const [mode, setMode] = React.useState(data ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isCreate = mode === 'CREATE';
  const isView = mode === 'VIEW';
  const isEdit = mode === 'EDIT';

  const buildEmpty = () => ({
    noBukti: '',
    tglBukti: '2026-07-11',
    noReferensi: '',
    customer: '',
    kodeCustomer: '',
    sales: '',
    kodeSales: '',
    caraBayar: 'TUNAI',
    status: 'AKTIF',
    progressApproval: 'PENGAJUAN SPV',
    jmlItem: 0,
    totalNilai: 0,
    createdBy: 'PDJ Administrator',
    createdAt: '',
    editedBy: 'PDJ Administrator',
    editedAt: '',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '', incoterm: 'Franco', klasifikasi: 'Retail', attn: '', namaHpPenerima: '', telepon: '', email: '', alamatCustomer: '', keterangan: '', alamatPengiriman: '', jenisKendaraan: '' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    barang: [], biaya: []
  });

  const [form, setForm] = React.useState(() => ({ ...buildEmpty(), ...data }));
  // Kalau modal dibuka langsung dalam mode EDIT (initialMode="EDIT"), snapshot-nya adalah
  // data awal itu sendiri, supaya "Batal" tetap bisa mengembalikan.
  const [snapshotForm, setSnapshotForm] = React.useState(() => (data && initialMode === 'EDIT') ? { ...buildEmpty(), ...data } : null);

  const [confirmModal, setConfirmModal] = React.useState(null);

  const [activeTab, setActiveTab] = React.useState('informasi');
  const infoRef = React.useRef(null);
  const bayarRef = React.useRef(null);
  const barangRef = React.useRef(null);
  const modalBodyRef = React.useRef(null);

  const scrollTo = (ref) => {
    if (ref.current && modalBodyRef.current) {
      const bodyRect = modalBodyRef.current.getBoundingClientRect();
      const refRect = ref.current.getBoundingClientRect();
      modalBodyRef.current.scrollBy({ top: refRect.top - bodyRect.top - 80, behavior: 'smooth' });
    }
  };

  const setApproval = (patch) => setForm(f => ({ ...f, approval: { ...f.approval, ...patch } }));
  const setInfo = (patch) => setForm(f => ({ ...f, informasiUmum: { ...f.informasiUmum, ...patch } }));
  const setBayar = (patch) => setForm(f => ({ ...f, pembayaran: { ...f.pembayaran, ...patch } }));
  const setBarang = (barang) => setForm(f => ({ ...f, barang }));
  const set = (k,v) => setForm(f => ({ ...f, [k]: v }));

  const subtotal = form.barang.reduce((s, r) => s + pjLineTotal(r), 0);
  const discAmt = subtotal * ((form.discPct||0)/100) + (+form.discRp || 0);
  const dpp = Math.max(0, subtotal - discAmt);
  const ppnAmt = form.ppnMode === 'Exclude' ? dpp * ((form.ppn||0)/100) : 0;
  const grandTotal = form.ppnMode === 'Exclude' ? dpp + ppnAmt : dpp;

  const isLocked = form.status === 'BATAL' || form.status === 'SELESAI MANUAL';
  const disabled = isView || isLocked;
  const [barangDetail, setBarangDetail] = React.useState(null); // { jenisBarang, editIndex } | null
  const gated = disabled;

  const handleApprove = (reason) => {
    setApproval({ status: 'DISETUJUI', approvedBy: 'Admin', approvedAt: new Date().toLocaleString('id-ID'), catatan: reason });
    setForm(f => ({ ...f, progressApproval: 'DISETUJUI' }));
  };
  const handleReject = (reason) => {
    setApproval({ status: 'DITOLAK', catatan: reason });
    setForm(f => ({ ...f, progressApproval: 'DITOLAK SPV' }));
  };

  const resetToCreate = () => {
    setForm(buildEmpty());
    setSnapshotForm(null);
    setMode('CREATE');
  };

  const enterEditMode = () => {
    setSnapshotForm({...form});
    setMode('EDIT');
  };

  const handleCancelEdit = () => {
    if (snapshotForm) {
      setForm(snapshotForm);
    }
    setSnapshotForm(null);
    setMode('VIEW');
  };

  const handleSave = (andClose=false) => {
    let saved = form;
    if (isCreate) {
      const fullNo = 'KO' + new Date().toISOString().slice(2,4) + new Date().toISOString().slice(5,7) + String(Math.floor(Math.random()*9000)+1000);
      saved = { ...form, noBukti: fullNo };
      setForm(saved);
    }
    // Filter out soft-deleted items dari tabel Barang
    ['barang'].forEach(key => {
      if (Array.isArray(saved[key])) {
        saved = { ...saved, [key]: saved[key].filter(r => !r._deleted).map(r => { const { _deleted, _added, ...rest } = r; return rest; }) };
      }
    });
    saved = { ...saved, jmlItem: saved.barang.length, totalNilai: Math.round(grandTotal) };
    onSave && onSave(saved);
    window.__erpToast && window.__erpToast('Konfirmasi order berhasil disimpan.');
    if (andClose) { onClose(); return; }
    if (isEdit) { setMode('VIEW'); }
    else { resetToCreate(); }
  };

  const titleText = isCreate ? 'Buat Konfirmasi Order' : isEdit ? `Edit Konfirmasi Order - ${form.noBukti}` : `Konfirmasi Order - ${form.noBukti}`;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal modal-wide" onClick={e=>e.stopPropagation()} style={{maxHeight: '92vh'}}>
          <div className="modal-head">
            <div>
              <h2 style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap'}}>
                {titleText}
                {isLocked && <span className={`status-badge ${form.status==='BATAL'?'batal':'selesai'}`}>{form.status==='BATAL'?'BATAL':'SELESAI MANUAL'}</span>}
              </h2>
              <div className="sub">Dibuat: {form.createdBy} {form.createdAt}{form.editedAt ? ` | Diedit: ${form.editedBy} ${form.editedAt}` : ''}</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="scroll-nav-bar">
            <button className={activeTab==='informasi'?'active':''} onClick={()=>{setActiveTab('informasi'); scrollTo(infoRef);}}>Informasi Umum</button>
            <button className={activeTab==='pembayaran'?'active':''} onClick={()=>{setActiveTab('pembayaran'); scrollTo(bayarRef);}}>Pembayaran</button>
            <button className={activeTab==='barang'?'active':''} onClick={()=>{setActiveTab('barang'); scrollTo(barangRef);}}>Barang</button>
          </div>

          <div className="modal-body modal-body-scroll" ref={modalBodyRef}>
            <div className="scroll-modal-layout with-side">
              <div className="scroll-modal-main">
                {isLocked && (
                  <div className="alasan-section" style={{marginBottom:16}}>
                    <h3>{form.status==='BATAL'?'Alasan Batal':'Alasan Selesai'}</h3>
                    <div className={`alasan-box ${form.status==='BATAL'?'batal':'selesai'}`}>
                      <span className="icon">{form.status==='BATAL'?I.x(16):I.check(16)}</span>
                      <span>{form.Alasan_Status || (form.status==='BATAL'?'Transaksi dibatalkan':'Transaksi diselesaikan manual')}</span>
                    </div>
                  </div>
                )}
                {!isCreate && (
                  <div className="panel" style={{marginBottom:16}}>
                    <h3>Status Persetujuan</h3>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap'}}>
                      <div>
                        <div style={{fontSize:13, fontWeight:500}}>{form.approval.level}</div>
                        <div style={{fontSize:12, color:'var(--text-3)', marginTop:2}}>
                          {form.approval.approvedBy ? `Oleh ${form.approval.approvedBy} ${form.approval.approvedAt}` : 'Menunggu persetujuan'}
                        </div>
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <span className={`pill ${progressApprovalClass(form.progressApproval)}`}>{form.progressApproval}</span>
                        {!disabled && (
                          <div style={{display:'flex', gap:6}}>
                            <button className="btn btn-primary btn-sm" onClick={()=>setConfirmModal({kind:'approve'})}>{I.check()} Approve</button>
                            <button className="btn btn-sm" style={{color:'var(--danger)', borderColor:'var(--danger)'}} onClick={()=>setConfirmModal({kind:'reject'})}>{I.x(14)} Tolak</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={infoRef} className="panel scroll-section" style={{marginBottom:16}}>
                  <h3>Informasi Umum</h3>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:12}}>
                    <div className="view-field"><label>No. Bukti</label><div className="view-value mono">{form.noBukti || <span className="muted">Otomatis saat disimpan</span>}</div></div>
                    <Fld label="Tgl. Bukti" required type="date" value={form.tglBukti} onChange={v=>setForm(f=>({...f,tglBukti:v}))} locked={gated} />
                    <Fld label="No. Ref" value={form.informasiUmum.noRef} onChange={v=>setInfo({noRef:v})} locked={gated} />
                    <Fld label="Estimasi Tgl. kirim" required type="date" value={form.informasiUmum.estimasiKirim} onChange={v=>setInfo({estimasiKirim:v})} locked={gated} />

                    <Fld label="Customer" required type="select" options={PJ_PELANGGAN.map(p=>p.name)} value={form.customer} onChange={v=>{ const p=PJ_PELANGGAN.find(x=>x.name===v); setForm(f=>({...f,customer:v,kodeCustomer:p?p.code:''})); }} locked={gated} />
                    <Fld label="Kode Customer" locked mono value={form.kodeCustomer} />
                    <Fld label="Klasifikasi" required type="select" options={PJ_KLASIFIKASI_LIST} value={form.informasiUmum.klasifikasi} onChange={v=>setInfo({klasifikasi:v})} locked={gated} />
                    <Fld label="Attn - PIC" required value={form.informasiUmum.attn} onChange={v=>setInfo({attn:v})} locked={gated} />

                    <Fld label="Sales" required type="select" options={PJ_SALES.map(s=>s.nama)} value={form.sales} onChange={v=>{ const s=PJ_SALES.find(x=>x.nama===v); setForm(f=>({...f,sales:v,kodeSales:s?s.kode:''})); }} locked={gated} />
                    <Fld label="Kode Sales" locked mono value={form.kodeSales} />
                    <Fld label="Telepon / HP" value={form.informasiUmum.telepon} onChange={v=>setInfo({telepon:v})} locked={gated} />
                    <Fld label="Email" type="email" value={form.informasiUmum.email} onChange={v=>setInfo({email:v})} locked={gated} />


                    <Fld label="Keterangan" type="textarea" span={2} value={form.informasiUmum.keterangan} onChange={v=>setInfo({keterangan:v})} locked={gated} />

                  </div>
                </div>

                <div ref={bayarRef} className="panel scroll-section" style={{marginBottom:16}}>
                  <h3>Pembayaran</h3>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
                    <Fld label="Cara Bayar" required type="select" options={PJ_CARA_BAYAR} value={form.caraBayar} onChange={v=>setForm(f=>({...f,caraBayar:v}))} locked={gated} />
                    <Fld label="TOP Real (hari)" type="number" mono value={form.pembayaran.tempo} onChange={v=>setBayar({tempo:v})} locked={gated} />
                    <Fld label="TOP Cetak (hari)" type="number" mono value={form.pembayaran.tempoKom || 0} onChange={v=>setBayar({tempoKom:v})} locked={gated} />

                    <Fld label="Akun Pembayaran" required type="select" options={PJ_AKUN_TUNAI} value={form.pembayaran.akun} onChange={v=>setBayar({akun:v})} locked={gated} />
                    <Fld label="Jth. Tempo" mono locked value={pjJthTempo(form.tglBukti, form.pembayaran.tempo)} />
                    <Fld label="Payment 1 / DP" type="number" mono value={form.pembayaran.dp} onChange={v=>setBayar({dp:v})} locked={gated} />

                    <Fld label="Payment 2" type="number" mono value={form.pembayaran.payment2} onChange={v=>setBayar({payment2:v})} locked={gated} />
                    <Fld label="Payment 3" type="number" mono value={form.pembayaran.payment3} onChange={v=>setBayar({payment3:v})} locked={gated} />
                  </div>
                </div>

                <div ref={barangRef} className="panel scroll-section" style={{marginBottom:16}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                    <h3 style={{margin:0}}>Barang</h3>
                    {!gated && (
                      <div style={{display:'flex', gap:8}}>
                        <button className="btn btn-primary btn-sm" onClick={()=>setBarangDetail({jenisBarang:'BIASA', editIndex:null})}>{I.plus()} Tambah Barang Biasa</button>
                        <button className="btn btn-primary btn-sm" onClick={()=>setBarangDetail({jenisBarang:'PU', editIndex:null})}>{I.plus()} Tambah Barang PU</button>
                      </div>
                    )}
                  </div>
                  <div className="inline-table">
                    <div className={`line-items ${gated ? 'view-only' : ''}`} style={{maxHeight:280, overflowY:'auto', overflowX:'auto'}}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{width:170}}>Kode</th><th style={{width:320}}>Nama Barang</th><th style={{width:200}}>Catatan Pelanggan</th>
                            <th className="num" style={{width:90}}>Jumlah</th><th style={{width:90}}>Satuan</th>
                            <th className="num" style={{width:130}}>Hrg. Satuan</th><th className="num" style={{width:150}}>Total Rp</th>
                            {!isCreate && <th className="num" style={{width:100}}>Realisasi</th>}
                            {!gated && <th style={{width:70}}></th>}
                          </tr>
                        </thead>
                        <tbody>
                          {form.barang.length === 0 && (
                            <tr><td colSpan={gated?7:8} className="empty" style={{padding:'32px 16px', textAlign:'center', color:'var(--text-3)'}}>Belum ada item. Klik "+ Tambah Barang Biasa" untuk mulai.</td></tr>
                          )}
                          {form.barang.map((b, idx) => (
                            <tr key={idx} className={`${b._deleted ? 'row-deleted' : ''} ${b._added ? 'row-added' : ''}`} title={b._deleted ? 'Barang ini akan dihapus' : ''}>
                              <td className="mono">{b.Kode_Item}</td>
                              <td>{gated || b._deleted ? b.Nama_Item : <span className="cell-link" onClick={()=>setBarangDetail({jenisBarang:b.JenisBarang||'BIASA', editIndex:idx})}>{b.Nama_Item}</span>}</td>
                              <td>{b.Deskripsi}</td>
                              <td className="num mono">{b.Jumlah}</td>
                              <td>{b.Satuan}</td>
                              <td className="num mono">{fmtRp(b.Hrg_Sat)}</td>
                              <td className="num mono">{fmtRp(pjLineTotal(b))}</td>
                              {!isCreate && <td className="num mono muted">{b.Realisasi||0}</td>}
                              {!gated && (
                                <td>
                                  <div className="row-actions">
                                    {b._deleted ? (
                                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} title="Restore" onClick={()=>{ const next=[...form.barang]; next[idx]={...b,_deleted:false}; setBarang(next); }}>{I.refresh(14)}</button>
                                    ) : (
                                      <>
                                        <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>setBarangDetail({jenisBarang:b.JenisBarang||'BIASA', editIndex:idx})}>{I.edit()}</button>
                                        <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>{ const next=[...form.barang]; next[idx]={...b,_deleted:true}; setBarang(next); }}>{I.trash()}</button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scroll-modal-side">
                <PjTotalsCard
                  title="Konfirmasi Order"
                  itemCount={form.barang.filter(r => !r._deleted).length}
                  subtotal={subtotal}
                  discPct={form.discPct} setDiscPct={v=>set('discPct',v)}
                  discRp={form.discRp} setDiscRp={v=>set('discRp',v)}
                  ppn={form.ppn} setPpn={v=>set('ppn',v)}
                  ppnMode={form.ppnMode} setPpnMode={v=>set('ppnMode',v)}
                />
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
            <div className="right" style={{display:'flex', gap:8}}>
              {isView && !isLocked && (
                <>
                  <button className="btn btn-primary" onClick={enterEditMode}>{I.edit()} Edit</button>
                  <button className="btn btn-danger-solid" onClick={()=>setConfirmModal({kind:'batal'})}>{I.fileX(14)} Batalkan Transaksi</button>
                  <button className="btn btn-success" onClick={()=>setConfirmModal({kind:'selesai'})}>{I.check()} Selesaikan Manual</button>
                </>
              )}
              {isView && <button className="btn" onClick={()=>window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.')}>{I.print()} Cetak</button>}
              {isCreate && (
                <>
                  <button className="btn" onClick={onClose}>Tutup</button>
                  <button className="btn btn-primary" onClick={()=>handleSave(true)}>{I.check()} Simpan</button>
                </>
              )}
              {isEdit && (
                <>
                  <button className="btn" onClick={onClose}>Tutup</button>
                  <button className="btn btn-danger-outline" onClick={handleCancelEdit}>Batalkan Perubahan</button>
                  <button className="btn btn-primary" onClick={()=>handleSave(true)}>{I.check()} Simpan</button>
                </>
              )}
              {isView && <button className="btn" onClick={onClose}>Tutup</button>}
            </div>
          </div>
        </div>
      </div>

      {barangDetail && (
        <KonfirmasiBarangDetailModal
          jenisBarang={barangDetail.jenisBarang}
          data={barangDetail.editIndex != null ? form.barang[barangDetail.editIndex] : null}
          onClose={()=>setBarangDetail(null)}
          onSave={(item)=>{
            if (barangDetail.editIndex != null) {
              const next = [...form.barang]; next[barangDetail.editIndex] = { ...item, _added: next[barangDetail.editIndex]._added }; setBarang(next);
            } else {
              setBarang([...form.barang, { ...item, _added:true }]);
            }
            setBarangDetail(null);
          }}
        />
      )}
      {confirmModal && (
        <ConfirmationModal
          title={confirmModal.kind==='batal'?'Batalkan Transaksi':confirmModal.kind==='selesai'?'Selesaikan Manual':confirmModal.kind==='approve'?'Approve Konfirmasi':'Tolak Konfirmasi'}
          message={confirmModal.kind==='batal'?'Masukkan alasan pembatalan transaksi ini.':confirmModal.kind==='selesai'?'Masukkan alasan penyelesaian manual transaksi ini.':confirmModal.kind==='approve'?'Masukkan catatan persetujuan konfirmasi ini.':'Masukkan alasan penolakan konfirmasi ini.'}
          confirmLabel={confirmModal.kind==='batal'?'Batalkan':confirmModal.kind==='selesai'?'Selesaikan':confirmModal.kind==='approve'?'Approve':'Tolak'}
          confirmKind={confirmModal.kind==='batal'||confirmModal.kind==='reject'?'danger':'success'}
          onCancel={()=>setConfirmModal(null)}
          onConfirm={(reason)=>{
            if (confirmModal.kind==='batal') {
              const updated = { ...form, status:'BATAL' };
              setForm(updated);
              onSave && onSave(updated);
              window.__erpToast && window.__erpToast('Transaksi dibatalkan.');
            } else if (confirmModal.kind==='selesai') {
              const updated = { ...form, status:'SELESAI MANUAL' };
              setForm(updated);
              onSave && onSave(updated);
              window.__erpToast && window.__erpToast('Transaksi diselesaikan manual.');
            } else if (confirmModal.kind==='approve') {
              handleApprove(reason);
              window.__erpToast && window.__erpToast('Konfirmasi disetujui.');
            } else {
              handleReject(reason);
              window.__erpToast && window.__erpToast('Konfirmasi ditolak.');
            }
            setConfirmModal(null);
          }}
        />
      )}
    </>
  );
}

function KonfirmasiPage({ rows, setRows }) {
  const [modal, setModal] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null); // null (CREATE) | 'VIEW' | 'EDIT'
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  const [showCetak, setShowCetak] = React.useState(false);
  const [cetakRow, setCetakRow] = React.useState(null);

  const openAdd = () => { setModal(null); setModalMode(null); setShow(true); };
  const openView = (d) => { setModal(d); setModalMode('VIEW'); setShow(true); };
  const openEdit = (d) => { setModal(d); setModalMode('EDIT'); setShow(true); };
  const closeModal = () => { setShow(false); setModal(null); setModalMode(null); };

  const save = (form) => {
    setRows(prev => prev.some(k => k.noBukti === form.noBukti) ? prev.map(k => k.noBukti===form.noBukti ? form : k) : [form, ...prev]);
    closeModal();
  };
  const cancelRow = (reason) => {
    setRows(prev => prev.map(k => k.noBukti===confirmCancel.noBukti ? {...k, status:'BATAL', alasanBatal: reason} : k));
    window.__erpToast && window.__erpToast('Konfirmasi penjualan dibatalkan.');
    setConfirmCancel(null);
  };

  return (
    <>
      <KonfirmasiPenjualan rows={rows} onAdd={openAdd} onView={openView} onEdit={openEdit} onCancel={(k)=>setConfirmCancel(k)}
        onCetak={()=>{setCetakRow(null); setShowCetak(true);}}
        onCetakRow={(k)=>{setCetakRow(k); setShowCetak(true);}} />
      {showCetak && (
        <PjCetakModal docLabel="Konfirmasi Order" rows={rows}
          noBuktiKey="noBukti" tglBuktiKey="tglBukti" statusKey="status" itemsKey="barang"
          getGroupLabel={r=>r.customer}
          initialSelected={cetakRow ? [cetakRow.noBukti] : null}
          onClose={()=>{setShowCetak(false); setCetakRow(null);}} />
      )}
      {show && <KonfirmasiPenjualanModal data={modal} initialMode={modalMode} onClose={closeModal} onSave={save} />}
      {confirmCancel && (
        <ConfirmationModal
          title="Batalkan Transaksi"
          message={`Konfirmasi Order "${confirmCancel.noBukti}" akan dibatalkan. Transaksi yang sudah dibatalkan tidak bisa diaktifkan kembali.`}
          confirmLabel="Batalkan"
          confirmKind="danger"
          onCancel={()=>setConfirmCancel(null)}
          onConfirm={cancelRow}
        />
      )}
    </>
  );
}
