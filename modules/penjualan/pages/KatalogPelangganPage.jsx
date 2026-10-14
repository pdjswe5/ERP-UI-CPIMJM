// Penjualan — halaman Katalog Pelanggan (master data pelanggan/customer)

// Pelanggan cuma punya status Aktif/Non-aktif — sama seperti pemasokStatusPill di Pembelian.
function pelangganStatusPill(status) {
  const aktif = status !== 'Non-aktif';
  return <span className={`pill ${aktif ? 'approved' : 'cancelled'}`}>{aktif ? 'Aktif' : 'Non-aktif'}</span>;
}

// Field generik: kalau locked, tampil sebagai teks readonly (view-field/view-value) persis
// pola Katalog Pemasok (PbModalShell), bukan <input disabled> yang masih terlihat seperti kontrol form.
// Didefinisikan di top-level (bukan di dalam komponen modal) supaya identitasnya stabil antar render —
// kalau didefinisikan di dalam body komponen, tiap keystroke bikin instance baru dan React remount
// elemen <input>-nya sehingga focus hilang setelah 1 huruf.
function Fld({ label, value, onChange, locked, required, span, mono, type='text', options }) {
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

function KatalogPelanggan({ rows, onAdd, onView, onEdit, onDeactivate, onActivate }) {
  const [q, setQ] = React.useState('');
  const [kota, setKota] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [page, setPage] = React.useState(1);
  // Data baru disisipkan di paling atas -> balik ke halaman 1 supaya langsung terlihat.
  React.useEffect(() => { setPage(1); }, [rows.length]);
  const perPage = 25;
  const filtered = rows.filter(p => {
    if (q) {
      const s = q.toLowerCase();
      if (!p.name.toLowerCase().includes(s) && !p.code.toLowerCase().includes(s) && !(p.pemilik||'').toLowerCase().includes(s)) return false;
    }
    if (kota && p.kota !== kota) return false;
    if (status === 'aktif' && p.status === 'Non-aktif') return false;
    if (status === 'nonaktif' && p.status !== 'Non-aktif') return false;
    return true;
  });
  const kotas = [...new Set(rows.map(p => p.kota).filter(Boolean))];
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage-1)*perPage, curPage*perPage);
  const reset = () => { setQ(''); setKota(''); setStatus(''); setPage(1); };
  const isNonaktif = (p) => p.status === 'Non-aktif';

  return (
    <>
      <PjHeader title="Katalog Pelanggan" sub={`Jumlah: ${filtered.length} pelanggan`} onAdd={onAdd} addLabel="Tambah Pelanggan" />
      <div className="filter-bar">
        <div className="filter-grid">
          <div className="field">
            <label>Pencarian</label>
            <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Nama, kode, atau pemilik…" value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/></div>
          </div>
          <div className="field">
            <label>Kota</label>
            <select className="select" value={kota} onChange={e=>{setKota(e.target.value); setPage(1);}}>
              <option value="">Semua kota</option>
              {kotas.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select className="select" value={status} onChange={e=>{setStatus(e.target.value); setPage(1);}}>
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-aktif</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn" onClick={reset}>Reset</button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Nama Perusahaan</th>
                <th>Kode</th>
                <th>Alamat</th>
                <th>Kota</th>
                <th>Telepon</th>
                <th>Nama Pemilik</th>
                <th>NIK</th>
                <th>Email</th>
                <th>Kontak</th>
                <th>Status</th>
                <th style={{width:90}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(p => (
                <tr key={p.code} onClick={()=>onView(p)}>
                  <td><span className="cell-link">{p.name}</span></td>
                  <td className="mono muted">{p.code}</td>
                  <td>{p.alamat || <span className="muted">—</span>}</td>
                  <td>{p.kota || <span className="muted">—</span>}</td>
                  <td className="mono">{p.tel || <span className="muted">—</span>}</td>
                  <td>{p.pemilik || <span className="muted">—</span>}</td>
                  <td className="mono">{p.nik || <span className="muted">—</span>}</td>
                  <td className={p.email ? 'cell-link' : ''}>{p.email || <span className="muted">—</span>}</td>
                  <td>{p.kontak || <span className="muted">—</span>}</td>
                  <td>{pelangganStatusPill(p.status)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit(p)}>{I.edit()}</button>
                      {isNonaktif(p) ? (
                        <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} title="Aktifkan Kembali" onClick={()=>onActivate(p)}>{I.refresh(14)}</button>
                      ) : (
                        <button className="btn btn-icon btn-sm del" title="Nonaktifkan" onClick={()=>onDeactivate(p)}>{I.trash()}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <div>Menampilkan <b style={{color:'var(--text)'}}>{filtered.length === 0 ? 0 : (curPage-1)*perPage+1}</b>–<b style={{color:'var(--text)'}}>{Math.min(curPage*perPage, filtered.length)}</b> dari <b style={{color:'var(--text)'}}>{filtered.length}</b></div>
          <div className="pager-pages">
            {Array.from({length: totalPages}, (_,i)=>i+1).slice(0, 7).map(n => (
              <button key={n} className={n===curPage?'active':''} onClick={()=>setPage(n)}>{n}</button>
            ))}
          </div>
          <div>Tampilkan <b style={{color:'var(--text)'}}>{perPage}</b> per halaman</div>
        </div>
      </div>
    </>
  );
}

function PelangganModal({ data, initialMode, onClose, onSave }) {
  const isEdit = !!data;
  const [mode, setMode] = React.useState(data ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isView = mode === 'VIEW';
  const empty = {
    name:'', code:'', alamat:'', kota:'', tel:'', pemilik:'', nik:'', email:'', kontak:'', flag:null,
    kodeSales:'', namaSales:'', noKtp:'', namaKtp:'', tglLahir:'', owner:'', namaPemesan:'',
    area:'', kodeGabungan:'', golongan:'Baik', kodePos:'', fax:'', klasifikasi:'Retail', fk:'F', status:'Aktif', keterangan:'', alamatKirim:'',
    noNpwp:'', jenisHarga:'Standar', namaPajak:'', kotaPajak:'', plafon:0, plafonTemp:0, alamatPajak:'',
    tempo:0, tempoLama:0, tempoKom:0, virtualAc:'', alamatTagih:'',
    creator:'PDJ Administrator', jamCreate:'', editor:'', jamEdit:null,
    expedisi:[], alamatKirimList:[], npwpList:[], saldoTitipan:[], saldoPiutang:[]
  };
  const [form, setForm] = React.useState(() => {
    const base = data ? {...empty, ...data} : {...empty};
    ['expedisi','alamatKirimList','npwpList','saldoTitipan','saldoPiutang'].forEach(k => { if (!Array.isArray(base[k])) base[k] = []; });
    return base;
  });
  // Kode & Nama Customer harus diisi dulu sebelum field lain bisa disentuh (persis pola Pemasok Pembelian)
  const initialFieldsReady = !!(form.code && form.name);
  // Mode VIEW: semua field readonly. Mode EDIT: semua field bisa diubah kecuali Kode Customer.
  const fieldsDisabled = isView || (mode === 'CREATE' && !initialFieldsReady);
  const enterEditMode = () => setMode('EDIT');

  const [activeSection, setActiveSection] = React.useState('dasar');
  const modalBodyRef = React.useRef(null);
  const dasarRef = React.useRef(null);
  const pajakRef = React.useRef(null);
  const expedisiRef = React.useRef(null);
  const alamatRef = React.useRef(null);
  const npwpRef = React.useRef(null);
  const titipanRef = React.useRef(null);
  const piutangRef = React.useRef(null);

  const set = (k,v) => setForm(f => ({...f, [k]: v}));
  const setArr = (k,v) => setForm(f => ({...f, [k]: v}));

  const scrollTo = (ref) => {
    if (ref.current && modalBodyRef.current) {
      const bodyRect = modalBodyRef.current.getBoundingClientRect();
      const refRect = ref.current.getBoundingClientRect();
      modalBodyRef.current.scrollBy({ top: refRect.top - bodyRect.top - 16, behavior: 'smooth' });
    }
  };

  const sections = [
    { id:'dasar',    label:'Informasi Dasar',    ref:dasarRef },
    { id:'pajak',    label:'Pajak & Kredit',     ref:pajakRef },
    { id:'expedisi', label:'Expedisi Customer',  ref:expedisiRef },
    { id:'alamat',   label:'Alamat Kirim',       ref:alamatRef },
    { id:'npwp',     label:'NPWP Customer',      ref:npwpRef },
    { id:'titipan',  label:'Saldo Titipan',      ref:titipanRef },
    { id:'piutang',  label:'Saldo Piutang',      ref:piutangRef },
  ];

  const fmtTglAudit = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };
  const auditSubtitle = isEdit && (form.creator || form.editor) ? (
    <span style={{fontStyle:'italic'}}>
      {form.creator && `Dibuat : ${form.creator}, ${fmtTglAudit(form.jamCreate)}`}
      {form.editor && form.jamEdit && ` | Diedit : ${form.editor}, ${fmtTglAudit(form.jamEdit)}`}
    </span>
  ) : null;

  return (
    <div className="modal-backdrop">
      <div className="modal modal-xwide" onClick={e=>e.stopPropagation()} style={{maxHeight: '92vh'}}>
        <div className="modal-head">
          <div>
            <h2>{mode==='CREATE' ? 'Tambah Pelanggan Baru' : mode==='EDIT' ? `Edit Pelanggan — ${form.code}` : `Pelanggan — ${form.code}`}</h2>
            <div className="sub">{auditSubtitle || (isEdit ? form.name : 'Isi Kode & Nama Customer dulu untuk membuka field lainnya.')}</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>

        <div style={{padding:'10px 24px', borderBottom:'1px solid var(--border)', background:'var(--bg-elev)'}}>
          <div className="tabs-pills" style={{marginBottom:0}}>
            {sections.map(s => (
              <button key={s.id} className={activeSection===s.id?'active':''} onClick={()=>{setActiveSection(s.id); scrollTo(s.ref);}}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="modal-body" ref={modalBodyRef} style={{overflowY:'auto', maxHeight:'calc(92vh - 180px)', background:'var(--bg)', padding:'16px 24px'}}>
          <div ref={dasarRef} className="panel" style={{marginBottom:16}}>
            <h3>Informasi Dasar</h3>
            <div className="form-grid-4" style={{gap:12}}>
              <Fld label="Kode Customer" required mono locked={mode!=='CREATE'} value={form.code} onChange={v=>set('code',v)} />
              <Fld label="Nama Customer" required locked={isView} value={form.name} onChange={v=>set('name',v)} />
              {fieldsDisabled ? (
                <Fld label="Nama Salesman" locked value={form.namaSales} />
              ) : (
                <div className="field"><label>Nama Salesman</label><select className="select" value={form.namaSales} onChange={e=>{ const v=e.target.value; set('namaSales', v); const s=PJ_SALES.find(x=>x.nama===v); set('kodeSales', s?s.kode:''); }}><option value="">— Pilih —</option>{PJ_SALES.map(s=><option key={s.kode} value={s.nama}>{s.nama}</option>)}</select></div>
              )}
              <Fld label="Kode Salesman" locked mono value={form.kodeSales} />

              <Fld label="No. KTP" mono locked={fieldsDisabled} value={form.noKtp} onChange={v=>set('noKtp',v)} />
              <Fld label="Nama KTP" locked={fieldsDisabled} value={form.namaKtp} onChange={v=>set('namaKtp',v)} />
              <Fld label="Tgl. Lahir" type="datetime-local" locked={fieldsDisabled} value={form.tglLahir} onChange={v=>set('tglLahir',v)} />
              <Fld label="Owner" locked={fieldsDisabled} value={form.owner} onChange={v=>set('owner',v)} />

              <Fld label="Nama Pemesan" locked={fieldsDisabled} value={form.namaPemesan} onChange={v=>set('namaPemesan',v)} />
              <Fld label="Kode Gabungan" mono locked={fieldsDisabled} value={form.kodeGabungan} onChange={v=>set('kodeGabungan',v)} />
              <Fld label="Area" required type="select" options={['Jabodetabek','Jawa Barat','Jawa Timur','Jawa Tengah','Sumatera']} locked={fieldsDisabled} value={form.area} onChange={v=>set('area',v)} />
              <Fld label="Golongan" required type="select" options={['Baik','Blokir','Blacklist']} locked={fieldsDisabled} value={form.golongan} onChange={v=>set('golongan',v)} />

              <Fld label="Klasifikasi" type="select" options={PJ_KLASIFIKASI_LIST} locked={fieldsDisabled} value={form.klasifikasi} onChange={v=>set('klasifikasi',v)} />
              <Fld label="Kota" locked={fieldsDisabled} value={form.kota} onChange={v=>set('kota',v)} />
              <Fld label="Kode Pos" mono locked={fieldsDisabled} value={form.kodePos} onChange={v=>set('kodePos',v)} />
              <Fld label="Fax" mono locked={fieldsDisabled} value={form.fax} onChange={v=>set('fax',v)} />

              <Fld label="Telepon" mono locked={fieldsDisabled} value={form.tel} onChange={v=>set('tel',v)} />
              <Fld label="Email" type="email" locked={fieldsDisabled} value={form.email} onChange={v=>set('email',v)} />
              <Fld label="Kontak" locked={fieldsDisabled} value={form.kontak} onChange={v=>set('kontak',v)} />
              <Fld label="FK" type="select" options={[{value:'F',label:'F'},{value:'K',label:'K'}]} locked={fieldsDisabled} value={form.fk} onChange={v=>set('fk',v)} />

              <Fld label="Status" type="select" options={['Aktif','Non-aktif']} locked={fieldsDisabled} value={form.status} onChange={v=>set('status',v)} />
              <Fld label="Alamat" type="textarea" span={3} locked={fieldsDisabled} value={form.alamat} onChange={v=>set('alamat',v)} />

              <Fld label="Keterangan" type="textarea" span={4} locked={fieldsDisabled} value={form.keterangan} onChange={v=>set('keterangan',v)} />
              <Fld label="Alamat Kirim" type="textarea" span={4} locked={fieldsDisabled} value={form.alamatKirim} onChange={v=>set('alamatKirim',v)} />
            </div>
          </div>

          <div ref={pajakRef} className="panel" style={{marginBottom:16}}>
            <h3>Pajak & Kredit</h3>
            <div className="form-grid-4" style={{gap:12}}>
              <Fld label="No. NPWP" mono span={2} locked={fieldsDisabled} value={form.noNpwp} onChange={v=>set('noNpwp',v)} />
              <Fld label="Jenis Harga" required type="select" options={['Standar','Khusus','Grosir']} locked={fieldsDisabled} value={form.jenisHarga} onChange={v=>set('jenisHarga',v)} />
              <Fld label="Nama Pajak" locked={fieldsDisabled} value={form.namaPajak} onChange={v=>set('namaPajak',v)} />

              <Fld label="Kota Pajak" locked={fieldsDisabled} value={form.kotaPajak} onChange={v=>set('kotaPajak',v)} />
              <Fld label="Plafon" type="number" mono locked={fieldsDisabled} value={form.plafon} onChange={v=>set('plafon',v)} />
              <Fld label="Plafon Temp" type="number" mono locked={fieldsDisabled} value={form.plafonTemp} onChange={v=>set('plafonTemp',v)} />
              <Fld label="TOP Real (hari)" type="number" mono locked={fieldsDisabled} value={form.tempo} onChange={v=>set('tempo',v)} />

              <Fld label="TOP Lama (Hari)" type="number" mono locked={fieldsDisabled} value={form.tempoLama} onChange={v=>set('tempoLama',v)} />
              <Fld label="TOP Cetak (Hari)" type="number" mono locked={fieldsDisabled} value={form.tempoKom} onChange={v=>set('tempoKom',v)} />
              <Fld label="Virtual AC" mono span={2} locked={fieldsDisabled} value={form.virtualAc} onChange={v=>set('virtualAc',v)} />

              <Fld label="Alamat Pajak" type="textarea" span={4} locked={fieldsDisabled} value={form.alamatPajak} onChange={v=>set('alamatPajak',v)} />
              <Fld label="Alamat Tagih" type="textarea" span={4} locked={fieldsDisabled} value={form.alamatTagih} onChange={v=>set('alamatTagih',v)} />
            </div>
          </div>

          <div ref={expedisiRef} className="panel" style={{marginBottom:16}}>
            <InlineTable
              title="Expedisi Customer"
              columns={[
                { key:'expedisi', label:'Expedisi', placeholder:'Expedisi…' },
                { key:'alamatExpedisi', label:'Alamat Expedisi', placeholder:'Alamat Expedisi…' },
                { key:'telepon', label:'Telepon', placeholder:'Telepon…' },
                { key:'keterangan', label:'Keterangan', placeholder:'Keterangan…' }
              ]}
              rows={form.expedisi}
              setRows={v => setArr('expedisi', v)}
              addLabel="Tambah Data Expedisi"
              disabled={fieldsDisabled}
            />
          </div>

          <div ref={alamatRef} className="panel" style={{marginBottom:16}}>
            <InlineTable
              title="Alamat Kirim"
              columns={[
                { key:'namaPenerima', label:'Nama Penerima', placeholder:'Nama Penerima…' },
                { key:'alamatKirim', label:'Alamat Kirim', placeholder:'Alamat Kirim…' },
                { key:'kota', label:'Kota', placeholder:'Kota…' },
                { key:'telepon', label:'Telepon', placeholder:'Telepon…' },
                { key:'keterangan', label:'Keterangan', placeholder:'Keterangan…' }
              ]}
              rows={form.alamatKirimList}
              setRows={v => setArr('alamatKirimList', v)}
              addLabel="Data Alamat Kirim"
              disabled={fieldsDisabled}
            />
          </div>

          <div ref={npwpRef} className="panel" style={{marginBottom:16}}>
            <InlineTable
              title="NPWP Customer"
              columns={[
                { key:'noNpwp', label:'No. NPWP', placeholder:'No. NPWP…', mono:true },
                { key:'namaNpwp', label:'Nama NPWP', placeholder:'Nama NPWP…' },
                { key:'alamat', label:'Alamat', placeholder:'Alamat…' }
              ]}
              rows={form.npwpList}
              setRows={v => setArr('npwpList', v)}
              addLabel="Tambah Data NPWP"
              disabled={fieldsDisabled}
            />
          </div>

          <div ref={titipanRef} className="panel" style={{marginBottom:16}}>
            <InlineTable
              title="Saldo Titipan"
              columns={[
                { key:'periode', label:'Periode', placeholder:'202607', mono:true },
                { key:'awalTitipan', label:'Awal Titipan', type:'number', num:true, placeholder:'0' },
                { key:'awalPpn', label:'Awal PPN (%)', type:'number', num:true, placeholder:'11' }
              ]}
              rows={form.saldoTitipan}
              setRows={v => setArr('saldoTitipan', v)}
              addLabel="Tambah Saldo Titipan"
              disabled={fieldsDisabled}
            />
          </div>

          <div ref={piutangRef} className="panel" style={{marginBottom:16}}>
            <InlineTable
              title="Saldo Piutang"
              columns={[
                { key:'periode', label:'Periode', placeholder:'202607', mono:true },
                { key:'nilaiAwal', label:'Nilai Awal', type:'number', num:true, placeholder:'0' }
              ]}
              rows={form.saldoPiutang}
              setRows={v => setArr('saldoPiutang', v)}
              addLabel="Tambah Saldo Piutang"
              disabled={fieldsDisabled}
            />
          </div>
        </div>

        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Tutup</button>
            {isView ? (
              <>
                <button className="btn" onClick={()=>window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.')}>{I.print()} Cetak</button>
                <button className="btn btn-primary" onClick={enterEditMode}>{I.edit()} Edit</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={()=>onSave && onSave(form, true)}>{I.check()} Simpan dan Tutup</button>
                <button className="btn btn-primary" onClick={()=>onSave && onSave(form, false)}>{I.check()} Simpan</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KatalogPelangganPage({ rows, setRows }) {
  const [modal, setModal] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [modalMode, setModalMode] = React.useState(null); // null (CREATE) | 'VIEW' | 'EDIT'
  const [confirmDeactivate, setConfirmDeactivate] = React.useState(null);
  const [confirmActivate, setConfirmActivate] = React.useState(null);

  const openAdd = () => { setModal(null); setModalMode(null); setShow(true); };
  const openView = (r) => { setModal(r); setModalMode('VIEW'); setShow(true); };
  const openEdit = (r) => { setModal(r); setModalMode('EDIT'); setShow(true); };
  const closeModal = () => { setShow(false); setModal(null); setModalMode(null); };

  const save = (form, andClose=true) => {
    setRows(prev => prev.some(p => p.code === form.code) ? prev.map(p => p.code===form.code ? form : p) : [form, ...prev]);
    window.__erpToast && window.__erpToast('Data berhasil disimpan.');
    if (andClose) closeModal();
    else setModal(form);
  };

  const deactivate = (reason) => {
    setRows(prev => prev.map(p => p.code===confirmDeactivate.code ? { ...p, status:'Non-aktif', alasanNonaktif: reason } : p));
    window.__erpToast && window.__erpToast(`Pelanggan ${confirmDeactivate.name} dinonaktifkan.`);
    setConfirmDeactivate(null);
  };

  const activate = () => {
    setRows(prev => prev.map(p => p.code===confirmActivate.code ? { ...p, status:'Aktif', alasanNonaktif:'' } : p));
    window.__erpToast && window.__erpToast(`Pelanggan ${confirmActivate.name} diaktifkan kembali.`);
    setConfirmActivate(null);
  };

  return (
    <>
      <KatalogPelanggan rows={rows} onAdd={openAdd} onView={openView} onEdit={openEdit} onDeactivate={(p)=>setConfirmDeactivate(p)} onActivate={(p)=>setConfirmActivate(p)} />
      {show && <PelangganModal data={modal} initialMode={modalMode} onClose={closeModal} onSave={save} />}
      {confirmDeactivate && (
        <ConfirmationModal
          title="Nonaktifkan Pelanggan"
          message={`Pelanggan "${confirmDeactivate.name}" akan dinonaktifkan dan tidak akan muncul sebagai pilihan pada dokumen baru. Data tetap tersimpan dan bisa diaktifkan kembali.`}
          confirmLabel="Nonaktifkan"
          confirmKind="danger"
          onCancel={()=>setConfirmDeactivate(null)}
          onConfirm={deactivate}
        />
      )}
      {confirmActivate && (
        <ConfirmationModal
          title="Aktifkan Kembali Pelanggan"
          message={`Pelanggan "${confirmActivate.name}" akan diaktifkan kembali dan muncul lagi sebagai pilihan pada dokumen baru.`}
          confirmLabel="Aktifkan"
          confirmKind="success"
          requireReason={false}
          onCancel={()=>setConfirmActivate(null)}
          onConfirm={activate}
        />
      )}
    </>
  );
}
