// Pembelian — modal tab generik (CREATE/VIEW/EDIT), dibangun di atas ScrollNavModal/ItemPickerModal/
// ConfirmationModal (primitif bersama dari components.jsx). Dipakai oleh semua halaman dokumen Pembelian.

function PbModalShell({ title, data, tabs, docKind, showTotals, prefix, initialFields, initialMode, xwide, onClose, onSave, onCancelDoc, onCompleteDoc }) {
  // mode: CREATE (data=null), VIEW (data exists, initial), EDIT (data exists, editing).
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

  // Snapshot untuk Batal Edit — kalau modal dibuka langsung dalam mode EDIT (initialMode="EDIT"),
  // snapshot-nya adalah data awal itu sendiri, supaya "Batalkan Perubahan" tetap bisa mengembalikan.
  const [snapshotForm, setSnapshotForm] = React.useState(() => {
    if (data && initialMode === 'EDIT') {
      const base = {...buildEmpty(), ...data};
      tabs.forEach(t => { if (t.type === 'items' && !Array.isArray(base[t.itemsKey])) base[t.itemsKey] = []; });
      return base;
    }
    return null;
  });

  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const isBatal = !!(form.Batal || form.Status === 'BATAL');
  const isSelesai = form.Status === 'SELESAI';
  const isLocked = isBatal || isSelesai;

  const allItemRows = tabs.filter(t => t.type === 'items').flatMap(t => form[t.itemsKey] || []);
  const subtotal = allItemRows.reduce((s,r) => s + pbLineTotal(r), 0);

  // Item picker
  const [picker, setPicker] = React.useState(null);
  const [confirmModal, setConfirmModal] = React.useState(null);

  // Untuk dokumen tanpa No_Bukti (mis. Katalog Pemasok): field lain terkunci sampai
  // seluruh field di initialFields (mis. Kode_Supp + Nama_Supp) sudah diisi.
  const initialFieldsReady = !initialFields || initialFields.length === 0
    || initialFields.every(k => (form[k] ?? '').toString().trim() !== '');

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
    if (andClose) { onClose(); }
    else if (isEdit) { setMode('VIEW'); }
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
      // Fields that stay locked in edit mode
      const lockedKeys = ['No_Bukti','Tgl_Bukti','Kode_Supp','Nama_Supp','Kode_Cust','Kode_Gudang','No_Beli','No_Ref','No_Ko','No_Jual','Kode_PurchasingORG'];
      return lockedKeys.includes(f.key) || f.readOnly || f.lockOnEdit;
    }
    // CREATE
    if (initialFields && initialFields.length > 0) {
      if (initialFields.includes(f.key)) return f.readOnly;
      return !initialFieldsReady || f.readOnly;
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
        <input
          className={`input ${f.mono ? 'mono' : ''}`}
          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
          placeholder={f.readOnly ? 'Otomatis' : ''}
          value={form[f.key]}
          onChange={e=>set(f.key, f.type === 'number' ? +e.target.value : e.target.value)}
        />
      </div>
    );
  };

  const alasanPreContent = isLocked ? (
    <div className="alasan-section">
      <h3>{isBatal ? 'Alasan Batal' : 'Alasan Selesai'}</h3>
      <div className={`alasan-box ${isBatal ? 'batal' : 'selesai'}`}>
        <span className="icon">{isBatal ? I.x(16) : I.check(16)}</span>
        <span>{form.Alasan_Batal || form.Alasan_Status || (isBatal ? 'Transaksi dibatalkan' : 'Transaksi diselesaikan manual')}</span>
      </div>
    </div>
  ) : null;

  const sections = tabs.map(t => {
    if (t.type === 'fields') {
      return {
        id: t.id,
        label: t.label,
        content: (
          <div className="panel">
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:12}}>
              {t.fields.map(renderField)}
            </div>
          </div>
        ),
      };
    }
    return {
      id: t.id,
      label: t.label,
      content: (
        <div className="panel">
          <PbInlineItemTable
            title={t.label}
            columns={isCreate ? t.columns.filter(c => !c.hideOnCreate) : t.columns}
            rows={form[t.itemsKey]}
            setRows={v => set(t.itemsKey, v)}
            addLabel={`Tambah ${t.label}`}
            itemSource={t.itemSource}
            showTotal={t.showTotal}
            disabled={isView}
            onPickItems={!isView && t.itemSource ? () => setPicker(t) : null}
            lockItems={t.lockItems}
          />
        </div>
      ),
    };
  });

  const summaryPanel = showTotals ? (
    <PbTotalsCard
      subtotal={subtotal}
      discPct={form.discPct} setDiscPct={v=>set('discPct', v)}
      discRp={form.discRp} setDiscRp={v=>set('discRp', v)}
      ppn={form.PPN ?? form.Ppn ?? 11} setPpn={v=>set(form.PPN !== undefined ? 'PPN' : 'Ppn', v)}
      ppnMode={form.ppnMode} setPpnMode={v=>set('ppnMode', v)}
    />
  ) : null;

  const modalTitle = isCreate ? `${title} Baru` : isEdit ? `Edit ${title} — ${form.No_Bukti || ''}` : `${title} — ${form.No_Bukti || ''}`;

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
        onSave={() => handleSave(false)}
        onSaveAndClose={() => handleSave(true)}
        onCancelDoc={isView && onCancelDoc && !isLocked ? ()=>setConfirmModal({kind:'batal'}) : null}
        onCompleteDoc={isView && onCompleteDoc && !isLocked ? ()=>setConfirmModal({kind:'selesai'}) : null}
        onEditMode={isView && !isLocked ? enterEditMode : null}
        onCancelEdit={isEdit ? handleCancelEdit : null}
        showSelesai={isView && onCompleteDoc && !isLocked && (form.Status === 'OPEN' || form.Status === '' || !form.Status)}
      />
      {picker && (
        <ItemPickerModal
          title={`Pilih ${picker.label}`}
          items={picker.itemSource?.data || []}
          onCancel={() => setPicker(null)}
          onConfirm={(picked) => {
            const mapped = picked.map(p => {
              const row = Object.fromEntries(picker.columns.map(c => [c.key, c.type === 'number' ? 0 : '']));
              row[picker.itemSource.codeKey] = p.kode || p.code || p.Kode_Item;
              row[picker.itemSource.nameKey] = p.nama || p.name || p.Nama_Item;
              if (picker.itemSource.satuanKey) row[picker.itemSource.satuanKey] = p.satuan || p.Satuan || 'PCS';
              if (picker.itemSource.hargaKey) row[picker.itemSource.hargaKey] = p.harga || p.Harga || p.price || 0;
              row[picker.columns.find(c => c.key === 'Qty' || c.key === 'Jumlah')?.key || 'Qty'] = p._qty || 1;
              row._added = true;
              return row;
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
              const updated = { ...form, Status:'BATAL', Batal:true, Alasan_Batal: reason };
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
