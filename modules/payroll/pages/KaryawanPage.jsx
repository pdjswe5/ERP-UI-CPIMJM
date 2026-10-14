// Payroll — Master Karyawan. Pola sectioned scroll-spy modal PERSIS `PelangganModal`
// (modules/penjualan/pages/KatalogPelangganPage.jsx:157-406, Penjualan) — mode VIEW/EDIT/CREATE,
// gate "No Induk & Nama harus diisi dulu", tiap section py ref sendiri + tombol scrollTo. Field
// persis daftar di screenshot referensi "Master Karyawan". Tabel Keluarga cukup mini-table lokal
// (bukan clone penuh InlineTable Penjualan — field-nya jauh lebih sederhana, cuma 3 kolom, tanpa
// soft-delete/restore, konsisten dgn keputusan "tidak cross-import lintas modul").

function PrKeluargaTable({ rows, setRows, disabled }) {
  const add = () => setRows([...rows, { hubungan:'Keluarga 1', nama:'', tglLahir:'' }]);
  const update = (idx, key, val) => { const next=[...rows]; next[idx]={...next[idx],[key]:val}; setRows(next); };
  const remove = (idx) => setRows(rows.filter((_,i)=>i!==idx));
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>Keluarga</h3>
        {!disabled && <button className="btn btn-primary btn-sm" onClick={add}>{I.plus()} Tambah Keluarga</button>}
      </div>
      <div className="line-items" style={{maxHeight:220, overflowY:'auto'}}>
        <table>
          <thead><tr><th style={{width:160}}>Hubungan</th><th>Nama</th><th style={{width:150}}>Tgl Lahir</th>{!disabled && <th style={{width:40}}></th>}</tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={disabled?3:4} className="empty">Belum ada data keluarga.</td></tr>}
            {rows.map((r,idx) => (
              <tr key={idx}>
                <td>{disabled ? r.hubungan : (
                  <select className="cell" value={r.hubungan} onChange={e=>update(idx,'hubungan',e.target.value)}>
                    {['Suami/Istri','Keluarga 1','Keluarga 2','Keluarga 3','Keluarga 4','Keluarga 5'].map(h => <option key={h}>{h}</option>)}
                  </select>
                )}</td>
                <td>{disabled ? (r.nama||'—') : <input className="cell" value={r.nama} onChange={e=>update(idx,'nama',e.target.value)}/>}</td>
                <td>{disabled ? (r.tglLahir||'—') : <input className="cell" type="date" value={r.tglLahir} onChange={e=>update(idx,'tglLahir',e.target.value)}/>}</td>
                {!disabled && <td><button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>remove(idx)}>{I.trash()}</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KaryawanModal({ data, initialMode, onClose, onSave }) {
  const isEdit = !!data;
  const [mode, setMode] = React.useState(data ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isView = mode === 'VIEW';
  const empty = {
    noInduk:'', noIndukLama:'', noFinger:'', statusKyw:'00', tglMasuk:'', nama:'', noNpwp:'', noKtp:'',
    alamat:'', kota:'', kodePos:'', telpon:'', tempatLahir:'', tglLahir:'', alamatKtp:'', noJkn:'',
    alamatDomisili:'', noKpj:'', jenisKelamin:'L', statusKawin:false, kTk:'TK0', agama:'ISLAM', pendidikan:'SLTA',
    tglKeluar:'', statusKeluar:false, levelKaryawan:'B', noRekening:'', bank:'', atasNama:'', ket:'',
    keluarga:[], aktif:true,
  };
  const [form, setForm] = React.useState(() => {
    const base = data ? {...empty, ...data} : {...empty};
    if (!Array.isArray(base.keluarga)) base.keluarga = [];
    return base;
  });
  const initialFieldsReady = !!(form.noInduk && form.nama);
  const fieldsDisabled = isView || (mode === 'CREATE' && !initialFieldsReady);
  const enterEditMode = () => setMode('EDIT');
  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  const [activeSection, setActiveSection] = React.useState('dasar');
  const modalBodyRef = React.useRef(null);
  const dasarRef = React.useRef(null);
  const alamatRef = React.useRef(null);
  const dokumenRef = React.useRef(null);
  const keluarRef = React.useRef(null);
  const keluargaRef = React.useRef(null);

  const sections = [
    { id:'dasar',    label:'Informasi Dasar',    ref:dasarRef },
    { id:'alamat',   label:'Alamat & Kontak',    ref:alamatRef },
    { id:'dokumen',  label:'Dokumen & Rekening', ref:dokumenRef },
    { id:'keluar',   label:'Data Keluar',        ref:keluarRef },
    { id:'keluarga', label:'Keluarga',           ref:keluargaRef },
  ];
  const scrollTo = (ref) => {
    setActiveSection(sections.find(s=>s.ref===ref)?.id);
    if (ref.current && modalBodyRef.current) {
      const bodyRect = modalBodyRef.current.getBoundingClientRect();
      const refRect = ref.current.getBoundingClientRect();
      modalBodyRef.current.scrollBy({ top: refRect.top - bodyRect.top - 16, behavior:'smooth' });
    }
  };

  const handleSave = () => onSave(form);

  const fld = (label, key, opts={}) => (
    <div className="field" key={key} style={opts.span ? {gridColumn:`span ${opts.span}`} : null}>
      <label>{label}{opts.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
      {opts.type === 'select' ? (
        <select className="select" disabled={fieldsDisabled} value={form[key]} onChange={e=>set(key,e.target.value)}>
          <option value="">— Pilih —</option>
          {opts.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : opts.type === 'textarea' ? (
        <textarea className="textarea" disabled={fieldsDisabled} value={form[key]} onChange={e=>set(key,e.target.value)}/>
      ) : (
        <input className={`input ${opts.mono ? 'mono' : ''}`} type={opts.type||'text'} disabled={fieldsDisabled || opts.disabled}
          value={form[key]} onChange={e=>set(key,e.target.value)} />
      )}
    </div>
  );

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{maxWidth:1160, maxHeight:'92vh'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{isEdit ? (isView ? `Karyawan — ${form.noInduk}` : `Edit Karyawan — ${form.noInduk}`) : 'Tambah Karyawan'}</h2>
            <div className="sub">{isView ? form.nama : 'Isi No. Induk & Nama terlebih dahulu untuk mengaktifkan field lain.'}</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>

        <div style={{display:'flex', gap:0, borderBottom:'1px solid var(--border)', padding:'0 24px'}}>
          {sections.map(s => (
            <button key={s.id} onClick={()=>scrollTo(s.ref)} style={{
              padding:'10px 14px', border:'none', background:'none', cursor:'pointer', fontSize:12.5, fontWeight:500,
              color: activeSection===s.id ? 'var(--primary)' : 'var(--text-3)',
              borderBottom: activeSection===s.id ? '2px solid var(--primary)' : '2px solid transparent',
            }}>{s.label}</button>
          ))}
        </div>

        <div className="modal-body" ref={modalBodyRef} style={{overflowY:'auto', maxHeight:'calc(92vh - 210px)'}}>
          <div ref={dasarRef} className="panel" style={{marginBottom:16}}>
            <h3>Informasi Dasar</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12, marginTop:12}}>
              {fld('No. Induk','noInduk',{required:true, mono:true, disabled:isEdit})}
              {fld('Nama','nama',{required:true, span:2})}
              {fld('No. Finger','noFinger',{mono:true})}
              {fld('Status Kyw','statusKyw',{})}
              {fld('Tgl. Masuk','tglMasuk',{type:'date'})}
              {fld('No. NPWP','noNpwp',{mono:true})}
              {fld('No. KTP','noKtp',{mono:true})}
              {fld('Jenis Kelamin','jenisKelamin',{type:'select', options:[{value:'L',label:'Laki-laki'},{value:'P',label:'Perempuan'}]})}
              <div className="field">
                <label>Status Kawin</label>
                <label style={{display:'flex', alignItems:'center', gap:8, height:36}}>
                  <input type="checkbox" className="cb" disabled={fieldsDisabled} checked={form.statusKawin} onChange={e=>set('statusKawin', e.target.checked)}/> Kawin
                </label>
              </div>
              {fld('K/TK','kTk',{})}
              {fld('Agama','agama',{})}
              {fld('Pendidikan','pendidikan',{})}
            </div>
          </div>

          <div ref={alamatRef} className="panel" style={{marginBottom:16}}>
            <h3>Alamat & Kontak</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12, marginTop:12}}>
              {fld('Alamat','alamat',{span:2})}
              {fld('Kota','kota',{})}
              {fld('Kode Pos','kodePos',{})}
              {fld('Telpon','telpon',{})}
              {fld('Tempat Lahir','tempatLahir',{})}
              {fld('Tgl. Lahir','tglLahir',{type:'date'})}
              {fld('Alamat KTP','alamatKtp',{span:3})}
              {fld('Alamat Domisili','alamatDomisili',{span:3})}
            </div>
          </div>

          <div ref={dokumenRef} className="panel" style={{marginBottom:16}}>
            <h3>Dokumen & Rekening</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12, marginTop:12}}>
              {fld('No. JKN','noJkn',{mono:true})}
              {fld('No. KPJ','noKpj',{mono:true})}
              {fld('Level Karyawan','levelKaryawan',{type:'select', options:[{value:'A',label:'A'},{value:'B',label:'B'}]})}
              {fld('No. Rekening','noRekening',{mono:true})}
              {fld('Bank','bank',{})}
              {fld('Atas Nama','atasNama',{})}
              {fld('No. Induk Lama','noIndukLama',{mono:true})}
              {fld('Keterangan','ket',{span:2})}
            </div>
          </div>

          <div ref={keluarRef} className="panel" style={{marginBottom:16}}>
            <h3>Data Keluar</h3>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12, marginTop:12}}>
              {fld('Tgl. Keluar','tglKeluar',{type:'date'})}
              <div className="field">
                <label>Status Keluar</label>
                <label style={{display:'flex', alignItems:'center', gap:8, height:36}}>
                  <input type="checkbox" className="cb" disabled={fieldsDisabled} checked={form.statusKeluar}
                    onChange={e=>set('statusKeluar', e.target.checked)}/> Karyawan sudah keluar
                </label>
              </div>
            </div>
          </div>

          <div ref={keluargaRef} className="panel" style={{marginBottom:16}}>
            <PrKeluargaTable rows={form.keluarga} setRows={v=>set('keluarga', v)} disabled={fieldsDisabled} />
          </div>
        </div>

        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>{isView ? 'Tutup' : 'Batal'}</button>
            {isView
              ? <button className="btn btn-primary" onClick={enterEditMode}>{I.edit()} Edit</button>
              : <button className="btn btn-primary" onClick={handleSave} disabled={!initialFieldsReady}>{I.check()} Simpan</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PayrollKaryawanPage({ rows, setRows, mutasiRows, onMutasi }) {
  const [q, setQ] = React.useState('');
  const [modal, setModal] = React.useState(null);
  const [modalMode, setModalMode] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState(null);

  const filtered = rows.filter(r => !q || r.nama.toLowerCase().includes(q.toLowerCase()) || r.noInduk.includes(q));

  const bagianAktif = (noInduk) => {
    const mine = mutasiRows.filter(m => m.noInduk === noInduk).slice().sort((a,b)=>b.tanggal.localeCompare(a.tanggal));
    if (mine.length === 0) return null;
    return PR_BAGIAN.find(b=>b.kode===mine[0].kodeBagian)?.nama || mine[0].kodeBagian;
  };

  const save = (form) => {
    setRows(prev => prev.some(r=>r.noInduk===form.noInduk) ? prev.map(r=>r.noInduk===form.noInduk?form:r) : [...prev, form]);
    window.__erpToast && window.__erpToast('Karyawan berhasil disimpan.');
    setModal(null); setShowCreate(false);
  };
  const closeModal = () => { setModal(null); setShowCreate(false); };

  return (
    <>
      <div className="page-head">
        <div><h1>Master Karyawan</h1><div className="sub">Data induk karyawan, dipakai Mutasi Karyawan, Absensi, dan Penggajian.</div></div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-primary" onClick={()=>{setModal(null); setModalMode(null); setShowCreate(true);}}>{I.plus()} Tambah Karyawan</button>
        </div>
      </div>
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="No. Induk atau nama…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>No. Induk</th><th>Nama</th><th>No. Finger</th><th>Tgl Masuk</th><th>Bagian Saat Ini</th><th>Status</th><th style={{width:120}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={7} className="empty">Tidak ada data.</td></tr>}
              {filtered.map(r => (
                <tr key={r.noInduk} onClick={()=>{setModal(r); setModalMode('VIEW');}}>
                  <td className="mono">{r.noInduk}</td>
                  <td><span className="cell-link">{r.nama}</span></td>
                  <td className="mono">{r.noFinger}</td>
                  <td>{r.tglMasuk}</td>
                  <td>{bagianAktif(r.noInduk) || <span className="muted">Belum ada mutasi</span>}</td>
                  <td>{prAktifPill(r.aktif)}</td>
                  <td onClick={e=>e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={()=>{setModal(r); setModalMode('EDIT');}}>{I.edit()}</button>
                      <button className="btn btn-icon btn-sm" title="Mutasi" onClick={()=>onMutasi(r)}>{I.arrowR(14)}</button>
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
      {(showCreate || modal) && (
        <KaryawanModal data={modal} initialMode={modalMode} onClose={closeModal} onSave={save} />
      )}
      {pendingDelete && (
        <ConfirmationModal
          title="Hapus Karyawan?" message={`Data karyawan "${pendingDelete.nama}" akan dihapus permanen.`}
          confirmLabel="Hapus" confirmKind="danger" requireReason={false}
          onCancel={()=>setPendingDelete(null)}
          onConfirm={()=>{
            setRows(prev => prev.filter(x=>x.noInduk!==pendingDelete.noInduk));
            window.__erpToast && window.__erpToast('Karyawan berhasil dihapus.');
            setPendingDelete(null);
          }} />
      )}
    </>
  );
}
