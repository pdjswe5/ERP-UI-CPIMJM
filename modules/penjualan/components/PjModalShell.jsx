// Penjualan — modal shells.
//
// PjModalShell: wrapper modal generik sederhana (title/sub + children + Simpan/Batal). Dipertahankan
// verbatim dari pelanggan.jsx meski saat ini tidak dipanggil oleh halaman manapun (dead code di modul
// asli juga) — diporting apa adanya sesuai keputusan "pure structural port, preserve behavior exactly".
//
// PjDocModal: modal tab generik (CREATE/VIEW/EDIT) yang benar-benar dipakai oleh semua halaman dokumen
// Penjualan (Sales Order/Invoice/Sales Return/Delivery Order), dibangun di atas ScrollNavModal/
// ItemPickerModal/ConfirmationModal (primitif bersama dari components.jsx).

function PjModalShell({ title, sub, onClose, onSave, children, saveLabel = 'Simpan', wide = false }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={wide ? {maxWidth: 1100} : {maxWidth: 700}}>
        <div className="modal-head">
          <div><h2>{title}</h2>{sub && <div className="sub">{sub}</div>}</div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={onSave}>{I.check()} {saveLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal tab generik refactored to ScrollNavModal + 3-mode
function PjDocModal({ title, data, tabs, showTotals, showRealisasi, prefix, xwide, initialMode, onClose, onSave, onCancelDoc, onCompleteDoc }) {
  // initialMode="EDIT" membuka langsung dalam mode edit (dipakai tombol Edit di list), tanpa itu default VIEW.
  const [mode, setMode] = React.useState(data ? (initialMode === 'EDIT' ? 'EDIT' : 'VIEW') : 'CREATE');
  const isCreate = mode === 'CREATE';
  const isView = mode === 'VIEW';
  const isEdit = mode === 'EDIT';

  const emptyShape = () => {
    const base = {};
    tabs.forEach(t => {
      if (t.type === 'fields') t.fields.forEach(f => { base[f.key] = f.default ?? (f.type === 'number' ? 0 : ''); });
      if (t.type === 'items') base[t.itemsKey] = [];
    });
    if (showTotals) { base.discPct = 0; base.discRp = 0; base.ppnMode = 'Exclude'; }
    return base;
  };

  const buildEmpty = () => {
    const base = emptyShape();
    tabs.forEach(t => { if (t.type === 'items' && !Array.isArray(base[t.itemsKey])) base[t.itemsKey] = []; });
    return base;
  };

  const [form, setForm] = React.useState(() => {
    const base = data ? {...buildEmpty(), ...data} : buildEmpty();
    tabs.forEach(t => { if (t.type === 'items' && !Array.isArray(base[t.itemsKey])) base[t.itemsKey] = []; });
    return base;
  });

  // Kalau modal dibuka langsung dalam mode EDIT (initialMode="EDIT"), snapshot-nya adalah
  // data awal itu sendiri, supaya "Batalkan Perubahan" tetap bisa mengembalikan.
  const [snapshotForm, setSnapshotForm] = React.useState(() => {
    if (data && initialMode === 'EDIT') {
      const base = {...buildEmpty(), ...data};
      tabs.forEach(t => { if (t.type === 'items' && !Array.isArray(base[t.itemsKey])) base[t.itemsKey] = []; });
      return base;
    }
    return null;
  });

  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const isBatal = form.Status === 'BATAL';
  const isSelesai = form.Status === 'SELESAI';
  const isLocked = isBatal || isSelesai;
  const itemTabs = tabs.filter(t => t.type === 'items');
  const subtotal = itemTabs.reduce((s,t) => s + (form[t.itemsKey]||[]).reduce((x,r)=>x+pjLineTotal(r),0), 0);

  const [picker, setPicker] = React.useState(null);
  const [confirmModal, setConfirmModal] = React.useState(null);

  const resetToCreate = () => {
    const empty = buildEmpty();
    setForm(empty);
    setSnapshotForm(null);
    setMode('CREATE');
  };

  const handleSave = (andClose=false) => {
    let withNo = form;
    if (isCreate && prefix) {
      const fullNo = prefix + new Date().toISOString().slice(2,4) + new Date().toISOString().slice(5,7) + String(Math.floor(Math.random()*9000)+1000);
      withNo = { ...form, No_Bukti: fullNo };
    }
    // Filter out soft-deleted items from all item arrays
    tabs.filter(t => t.type === 'items').forEach(t => {
      const arr = withNo[t.itemsKey];
      if (Array.isArray(arr)) {
        withNo = { ...withNo, [t.itemsKey]: arr.filter(r => !r._deleted).map(r => { const { _deleted, _added, ...rest } = r; return rest; }) };
      }
    });
    onSave(withNo, mode);
    if (andClose) onClose();
    else if (isEdit) setMode('VIEW');
    else { resetToCreate(); }
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

  const fieldLocked = (f) => {
    if (f.disabledIf && f.disabledIf(form)) return true;
    if (isView) return true;
    if (isEdit) {
      // Field identitas dasar selalu terkunci di edit; field referensi/pembayaran spesifik
      // per dokumen pakai flag f.lockOnEdit (mis. No_Ko, Kredit_Tunai) — bukan hardcode di sini.
      const lockedKeys = ['No_Bukti','Tgl_Bukti','Kode_Cust','Nama_Cust','Kode_Gudang'];
      return lockedKeys.includes(f.key) || f.readOnly || f.lockOnEdit;
    }
    return f.key === 'No_Bukti' || f.readOnly;
  };

  // Field yang harus otomatis ter-reset (mis. Tempo -> 0 saat Kredit_Tunai = TUNAI)
  React.useEffect(() => {
    const allFields = tabs.filter(t => t.type === 'fields').flatMap(t => t.fields);
    allFields.forEach(f => {
      if (f.disabledIf && f.disabledIf(form) && form[f.key] !== (f.clearValue ?? '')) {
        setForm(prev => ({ ...prev, [f.key]: f.clearValue ?? '' }));
      }
    });
  }, [form]);

  const renderField = (f) => {
    const locked = fieldLocked(f);
    const spanStyle = f.span ? {gridColumn:`span ${f.span}`} : {};

    if (locked) {
      return (
        <div className="view-field" style={spanStyle} key={f.key}>
          <label>{f.label}</label>
          <div className={`view-value ${f.mono ? 'mono' : ''}`}>{form[f.key] || <span className="muted">{f.key === 'No_Bukti' && isCreate ? 'Otomatis saat disimpan' : '—'}</span>}</div>
        </div>
      );
    }

    if (f.type === 'select') {
      const opts = typeof f.options === 'function' ? f.options() : f.options;
      return (
        <div className="field" style={spanStyle} key={f.key}>
          <label>{f.label}{f.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
          <select className="select" value={form[f.key]} onChange={e=>{ set(f.key, e.target.value); f.onChange && f.onChange(e.target.value, set); }}>
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
          <textarea className="textarea" value={form[f.key]} onChange={e=>set(f.key, e.target.value)} />
        </div>
      );
    }
    return (
      <div className="field" style={spanStyle} key={f.key}>
        <label>{f.label}{f.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
        <input className={`input ${f.mono ? 'mono' : ''}`} type={f.type==='number'?'number':f.type==='date'?'date':'text'} placeholder={f.readOnly?'Otomatis':''} value={form[f.key]} onChange={e=>set(f.key, f.type==='number'?+e.target.value:e.target.value)} />
      </div>
    );
  };

  const alasanPreContent = isLocked ? (
    <div className="alasan-section">
      <h3>{isBatal ? 'Alasan Batal' : 'Alasan Selesai'}</h3>
      <div className={`alasan-box ${isBatal ? 'batal' : 'selesai'}`}>
        <span className="icon">{isBatal ? I.x(16) : I.check(16)}</span>
        <span>{form.Alasan_Status || (isBatal ? 'Transaksi dibatalkan' : 'Transaksi diselesaikan manual')}</span>
      </div>
    </div>
  ) : null;

  const sections = tabs.map(t => {
    if (t.type === 'fields') {
      return { id:t.id, label:t.label, content: (
        <div className="panel">
          {t.TopComponent && <t.TopComponent form={form} set={set} disabled={isView} isCreate={isCreate} />}
          <div className="form-grid-3" style={{gap:12}}>
            {t.fields.map(renderField)}
          </div>
        </div>
      )};
    }
    return { id:t.id, label:t.label, content: (
      <div className="panel">
        {t.produk
          ? <PjItemTable title={t.label} rows={form[t.itemsKey]} setRows={v=>set(t.itemsKey,v)} showRealisasi={showRealisasi && !isCreate} lockItems={t.lockItems} disabled={isView} onPickItems={!isView ? ()=>setPicker(t) : null} />
          : <InlineTable
              title={t.label}
              columns={isCreate ? (t.columns||[]).filter(c => !c.hideOnCreate) : (t.columns||[])}
              rows={form[t.itemsKey]} setRows={v=>set(t.itemsKey,v)} addLabel={`Tambah ${t.label}`}
              disabled={isView} itemSource={t.itemSource} lockItems={t.lockItems} showTotal={t.showTotal}
              onPickItems={!isView && (t.itemSource || t.PickerComponent) ? ()=>setPicker(t) : null}
            />}
      </div>
    )};
  });

  const summaryPanel = showTotals ? (
    <PjTotalsCard subtotal={subtotal} discPct={form.discPct} setDiscPct={v=>set('discPct',v)} discRp={form.discRp} setDiscRp={v=>set('discRp',v)} ppn={form.PPN??form.Ppn??11} setPpn={v=>set(form.PPN!==undefined?'PPN':'Ppn',v)} ppnMode={form.ppnMode} setPpnMode={v=>set('ppnMode',v)} />
  ) : null;

  const modalTitle = isCreate ? `${title} Baru` : isEdit ? `Edit ${title} — ${form.No_Bukti||''}` : `${title} — ${form.No_Bukti||''}`;

  const fmtTglAudit = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };
  const auditSubtitle = !isCreate && (form.Creator || form.Editor) ? (
    <span style={{fontStyle:'italic'}}>
      {form.Creator && `Dibuat : ${form.Creator}, ${fmtTglAudit(form.Jam_Create)}`}
      {form.Editor && form.Jam_Edit && ` | Diedit : ${form.Editor}, ${fmtTglAudit(form.Jam_Edit)}`}
    </span>
  ) : null;

  return (
    <>
      <ScrollNavModal
        title={modalTitle}
        subtitle={auditSubtitle}
        xwide={xwide}
        mode={mode}
        sections={sections}
        summaryPanel={summaryPanel}
        preContent={alasanPreContent}
        statusBadge={isLocked ? <span className={`status-badge ${isBatal ? 'batal' : 'selesai'}`}>{isBatal ? 'BATAL' : 'SELESAI'}</span> : null}
        locked={isLocked}
        onClose={onClose}
        onSave={()=>handleSave(false)}
        onSaveAndClose={()=>handleSave(true)}
        onCancelDoc={isView && onCancelDoc && !isLocked ? ()=>setConfirmModal({kind:'batal'}) : null}
        onCompleteDoc={isView && onCompleteDoc && !isLocked ? ()=>setConfirmModal({kind:'selesai'}) : null}
        onEditMode={isView && !isLocked ? enterEditMode : null}
        onCancelEdit={isEdit ? handleCancelEdit : null}
        showSelesai={isView && onCompleteDoc && !isLocked && (form.Status==='OPEN'||form.Status===''||!form.Status)}
      />
      {picker && picker.PickerComponent && (
        <picker.PickerComponent
          form={form}
          rows={form[picker.itemsKey]}
          onCancel={()=>setPicker(null)}
          onConfirm={(items)=>{ set(picker.itemsKey, [...form[picker.itemsKey], ...items]); setPicker(null); }}
        />
      )}
      {picker && !picker.PickerComponent && (
        <ItemPickerModal
          title={`Pilih ${picker.label}`}
          items={picker.itemSource?.data || BARANG || []}
          onCancel={()=>setPicker(null)}
          onConfirm={(picked)=>{
            const mapped = picked.map(p => {
              if (picker.itemSource) {
                const row = Object.fromEntries((picker.columns||[]).map(c => [c.key, c.type === 'number' ? 0 : '']));
                row[picker.itemSource.codeKey] = p.kode || p.code || p.Kode_Item || '';
                row[picker.itemSource.nameKey] = p.nama || p.name || p.Nama_Item || '';
                if (picker.itemSource.satuanKey) row[picker.itemSource.satuanKey] = p.satuan || p.Satuan || 'PCS';
                if (picker.itemSource.hargaKey) row[picker.itemSource.hargaKey] = p.harga || p.Harga || p.price || 0;
                const qtyKey = (picker.columns||[]).find(c => c.key === 'Jumlah' || c.key === 'Qty')?.key || 'Jumlah';
                row[qtyKey] = p._qty || 1;
                row._added = true;
                return row;
              }
              return { Kode_Item:p.code||p.kode||'', Nama_Item:p.name||p.nama||'', Deskripsi:'', Jumlah:p._qty||1, Satuan:p.unit||p.satuan||'PCS', Hrg_Sat:p.price||p.hpp||p.harga||0, DiscPros_Det:0, DiscNilai_Det:0, Realisasi:0, Konversi:1, _added:true };
            });
            set(picker.itemsKey, [...form[picker.itemsKey], ...mapped]);
            setPicker(null);
          }}
        />
      )}
      {confirmModal && (
        <ConfirmationModal
          title={confirmModal.kind==='batal'?'Batalkan Transaksi':'Selesaikan Manual'}
          message={confirmModal.kind==='batal'?'Masukkan alasan pembatalan transaksi ini.':'Masukkan alasan penyelesaian manual transaksi ini.'}
          confirmLabel={confirmModal.kind==='batal'?'Batalkan':'Selesaikan'}
          confirmKind={confirmModal.kind==='batal'?'danger':'success'}
          onCancel={()=>setConfirmModal(null)}
          onConfirm={(reason)=>{
            if (confirmModal.kind==='batal') {
              const updated = { ...form, Status:'BATAL', Alasan_Status: reason };
              setForm(updated);
              if (onCancelDoc) onCancelDoc(updated);
            } else {
              const updated = { ...form, Status:'SELESAI', Alasan_Status: reason };
              setForm(updated);
              if (onCompleteDoc) onCompleteDoc(updated);
            }
            setConfirmModal(null);
          }}
        />
      )}
    </>
  );
}
