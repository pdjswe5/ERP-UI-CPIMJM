// Barang — sub-modul Barang Jadi Umum & PU.
//
// Header list punya 2 tombol tambah terpisah (Barang Umum / Barang PU) alih-alih 1 tombol
// generik — user pilih mau bikin barang jadi Umum (BarangUmumModal) atau PU (BarangJadiModal).
// Kedua form pakai pola dropdown kode + field nama readonly di sebelahnya (Jenis/Tipe/Warna/
// Merk), dan Keterangan readonly yang otomatis dirangkai dari pilihan-pilihan itu.

function BarangJadiList({ rows, onAddUmum, onAddPu, onEdit, onDelete }) {
  const [q, setQ] = React.useState('');
  const filtered = rows.filter(r => !q || r.namaProduk.toLowerCase().includes(q.toLowerCase()) || r.kodeProduk.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <BrgHeader title="Barang Jadi Umum & PU" sub={`Jumlah: ${filtered.length} barang jadi`}
        extra={<>
          <button className="btn btn-primary" onClick={onAddUmum}>{I.plus()} Barang Umum</button>
          <button className="btn btn-primary" onClick={onAddPu}>{I.plus()} Barang PU</button>
        </>} />
      <div className="filter-bar"><div className="filter-grid">
        <div className="field"><label>Pencarian</label><div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Kode atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
        <div className="filter-actions"><button className="btn">{I.filter()} Cari</button></div>
      </div></div>
      <div className="table-card">
        <div className="table-toolbar"><div className="table-toolbar-left"><b>Jumlah: {filtered.length}</b></div></div>
        <div className="table-scroll">
          <table className="data">
            <thead><tr><th>Kode Produk</th><th>Nama Produk</th><th>Merk</th><th>Status</th><th>HPP Standar</th><th>Jml Lapis PU</th><th style={{width:90}}>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.kodeProduk} onClick={()=>onEdit(r)}>
                  <td className="mono muted">{r.kodeProduk}</td>
                  <td><span className="cell-link">{r.namaProduk}</span></td>
                  <td className="mono">{brgMerkNama(r.merk) || r.merk}</td>
                  <td><span className={`pill ${r.status==='AKTIF' ? 'approved' : 'cancelled'}`}>{r.status}</span></td>
                  <td className="mono">{fmtRp(r.hppStandar)}</td>
                  <td className="mono">{(r.detailsPU || []).length}</td>
                  <td onClick={e=>e.stopPropagation()}><div className="row-actions"><button className="btn btn-icon btn-sm" title="Edit" onClick={()=>onEdit(r)}>{I.edit()}</button><button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>onDelete(r)}>{I.trash()}</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager"><div>Menampilkan <b>1</b>–<b>{filtered.length}</b> dari <b>{filtered.length}</b></div></div>
      </div>
    </>
  );
}

// Form Barang Umum — field sesuai redesain: Jenis/Tipe/Warna/Merk pakai dropdown kode + field
// nama readonly di sebelahnya (auto-filled), Keterangan readonly & otomatis dirangkai dari
// nama Jenis/Tipe/Warna/Merk yang dipilih (list unordered), sama pola dengan BahanBakuModal.
function BarangUmumModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const empty = { kodeProduk:'', namaProduk:'', kodeKategori:'JADI', jenis:'', tipe:'', warna:'', merk:'', minimQty:0, tipeData:'F', aktif:true, lebar:0, panjang:0, lbrReal:0, pjgReal:0, bahan:0, tebalTct:0, tebalBmt:0, hppStandar:0, status:'AKTIF', ongkos:0, keterangan:'', detailsPU:[] };
  const [form, setForm] = React.useState(() => ({ ...empty, ...(data || {}) }));
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const ketItems = [
    form.jenis && `Jenis: ${brgJenisNama(form.jenis)} (${form.jenis})`,
    form.tipe && `Tipe: ${brgTipeNama(form.tipe)} (${form.tipe})`,
    form.warna && `Warna: ${brgWarnaNama(form.warna)} (${form.warna})`,
    form.merk && `Merk: ${brgMerkNama(form.merk)} (${form.merk})`,
  ].filter(Boolean);
  const req = <span style={{color:'var(--danger)'}}>*</span>;
  const handleSave = () => onSave({ ...form, keterangan: ketItems.join('; ') });
  return (
    <BrgModalShell title={isEdit ? `Edit Barang Jadi Umum — ${form.kodeProduk}` : 'Tambah Barang Jadi Umum'} sub="Pastikan semua kolom bertanda (*) terisi." onClose={onClose} onSave={handleSave} wide>
      <div className="panel">
        <h3>Informasi Barang Jadi Umum</h3>
        <div className="form-grid-3" style={{gap:24, alignItems:'start'}}>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field"><label>Nama Produk {req}</label><input className="input" value={form.namaProduk} onChange={e=>set('namaProduk',e.target.value)}/></div>
            <div className="field"><label>Kode Produk {req}</label><input className="input mono" value={form.kodeProduk} onChange={e=>set('kodeProduk',e.target.value)}/></div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Jenis {req}</label><select className="select" value={form.jenis} onChange={e=>set('jenis',e.target.value)}><option value="">Pilih Jenis</option>{BRG_JENIS_OPTS.map(j=><option key={j.kode} value={j.kode}>{j.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgJenisNama(form.jenis)} readOnly placeholder="Jenis" /></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Tipe {req}</label><select className="select" value={form.tipe} onChange={e=>set('tipe',e.target.value)}><option value="">Pilih Tipe</option>{BRG_TIPE_OPTS.map(t=><option key={t.kode} value={t.kode}>{t.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgTipeNama(form.tipe)} readOnly placeholder="Tipe" /></div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>Minimum Qty {req}</label><input className="input mono" type="number" value={form.minimQty} onChange={e=>set('minimQty',+e.target.value)}/></div>
              <div className="field"><label>Tipe Barang {req}</label><select className="select" value={form.tipeData} onChange={e=>set('tipeData',e.target.value)}><option value="F">F</option><option value="K">K</option></select></div>
              <div className="field"><label>Aktif {req}</label><select className="select" value={form.aktif ? '1':'0'} onChange={e=>set('aktif', e.target.value==='1')}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Lebar {req}</label><input className="input mono" type="number" value={form.lebar} onChange={e=>set('lebar',+e.target.value)}/></div>
              <div className="field"><label>Panjang {req}</label><input className="input mono" type="number" value={form.panjang} onChange={e=>set('panjang',+e.target.value)}/></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Lebar Real (Mm) {req}</label><input className="input mono" type="number" value={form.lbrReal} onChange={e=>set('lbrReal',+e.target.value)}/></div>
              <div className="field"><label>Panjang Real (Mm) {req}</label><input className="input mono" type="number" value={form.pjgReal} onChange={e=>set('pjgReal',+e.target.value)}/></div>
            </div>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>Bahan {req}</label><input className="input mono" type="number" value={form.bahan} onChange={e=>set('bahan',+e.target.value)}/></div>
              <div className="field"><label>Tebal TCT {req}</label><input className="input mono" type="number" value={form.tebalTct} onChange={e=>set('tebalTct',+e.target.value)}/></div>
              <div className="field"><label>Tebal BMT {req}</label><input className="input mono" type="number" value={form.tebalBmt} onChange={e=>set('tebalBmt',+e.target.value)}/></div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field">
              <label>Keterangan {req}</label>
              <div className="textarea" style={{background:'var(--bg-sub)', minHeight:88}}>
                {ketItems.length ? <ul style={{margin:0, paddingLeft:18}}>{ketItems.map((k,i)=><li key={i}>{k}</li>)}</ul> : <span className="muted">Otomatis dari Jenis, Tipe, Warna &amp; Merk</span>}
              </div>
            </div>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>HPP Standar {req}</label><input className="input mono" type="number" value={form.hppStandar} onChange={e=>set('hppStandar',+e.target.value)}/></div>
              <div className="field"><label>Status {req}</label><select className="select" value={form.status} onChange={e=>set('status',e.target.value)}><option>AKTIF</option><option>NONAKTIF</option></select></div>
              <div className="field"><label>Ongkos {req}</label><input className="input mono" type="number" value={form.ongkos} onChange={e=>set('ongkos',+e.target.value)}/></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Warna {req}</label><select className="select" value={form.warna} onChange={e=>set('warna',e.target.value)}><option value="">Pilih Warna</option>{BRG_WARNA_OPTS.map(w=><option key={w.kode} value={w.kode}>{w.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgWarnaNama(form.warna)} readOnly placeholder="Warna" /></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Merk {req}</label><select className="select" value={form.merk} onChange={e=>set('merk',e.target.value)}><option value="">Pilih Merk</option>{BRG_MERK_OPTS.map(m=><option key={m.kode} value={m.kode}>{m.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgMerkNama(form.merk)} readOnly placeholder="Merk" /></div>
            </div>
          </div>
        </div>
      </div>
    </BrgModalShell>
  );
}

// Tabel "Lapis PU" — tiap baris merujuk 1 produk (kode+nama, dipilih dari daftar Barang Jadi
// yang sudah ada) dengan urutan lapis = posisi baris di array (bukan field yang diinput manual),
// dilengkapi tombol naik/turun untuk mengubah urutan. Dibuat khusus di sini (bukan extend
// BrgInlineTable) karena kebutuhan reorder + kolom nama-otomatis tidak dipakai tabel lain.
//
// Hapus baris pakai soft-delete (sama pola tabel barang di Pembelian PR / BrgInlineTable
// softDelete): klik trash cuma menandai `_deleted:true` (baris pudar/dicoret + tombol Restore),
// baru benar-benar dibuang saat form disimpan — lihat handleSave di BarangJadiModal yang filter
// `_deleted` sebelum onSave.
function LapisPuTable({ rows, setRows, productOptions }) {
  const update = (idx, kodeBarang) => setRows(rows.map((r,i) => i===idx ? {...r, kodeBarang} : r));
  const remove = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:true} : r));
  const restore = (idx) => setRows(rows.map((r,i) => i===idx ? {...r, _deleted:false} : r));
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[idx], next[j]] = [next[j], next[idx]];
    setRows(next);
  };
  const add = () => setRows([...rows, { kodeBarang:'', _added:true }]);
  const namaOf = (kode) => productOptions.find(o => o.value === kode)?.label || '—';
  return (
    <div className="inline-table">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <h3 style={{margin:0}}>Lapis PU <span style={{color:'var(--danger)'}}>*</span></h3>
        <button className="btn btn-primary btn-sm" onClick={add}>{I.plus()} Lapisan</button>
      </div>
      <div className="line-items" style={{height:220, overflowY:'auto'}}>
        <table style={{width:'100%', minWidth:0, tableLayout:'fixed'}}>
          <thead><tr><th style={{width:56, textAlign:'center'}}>Lapis</th><th style={{width:180}}>Kode Barang</th><th>Nama Barang</th><th style={{width:104}}>Aksi</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="empty">Belum ada lapisan.</td></tr>}
            {rows.map((r, idx) => (
              <tr key={idx} className={`${r._deleted ? 'row-deleted' : ''} ${r._added ? 'row-added' : ''}`}
                title={r._deleted ? 'Lapisan ini akan dihapus' : ''}>
                <td className="mono" style={{textAlign:'center'}}>{idx+1}</td>
                <td>
                  {r._deleted ? (
                    <span className="cell mono" style={{display:'block', padding:'4px 0'}}>{r.kodeBarang}</span>
                  ) : (
                    <select className="cell" style={{width:'100%'}} value={r.kodeBarang} onChange={e=>update(idx, e.target.value)}>
                      <option value="">Pilih Barang</option>
                      {productOptions.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
                    </select>
                  )}
                </td>
                <td style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={namaOf(r.kodeBarang)}>{namaOf(r.kodeBarang)}</td>
                <td>
                  <div style={{display:'flex', gap:4}}>
                    {r._deleted ? (
                      <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} onClick={()=>restore(idx)} title="Restore">{I.refresh(14)}</button>
                    ) : (
                      <>
                        <button className="btn btn-icon btn-sm" disabled={idx===0} onClick={()=>move(idx,-1)} title="Naik">{I.chev(12,'up')}</button>
                        <button className="btn btn-icon btn-sm" disabled={idx===rows.length-1} onClick={()=>move(idx,1)} title="Turun">{I.chev(12,'down')}</button>
                        <button className="btn btn-icon btn-sm del" title="Hapus" onClick={()=>remove(idx)}>{I.trash()}</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Form Barang PU — field sesuai spesifikasi terbaru: Jenis/Tipe pakai master khusus PU
// (BRG_JENIS_PU_OPTS/BRG_TIPE_PU_OPTS), Warna Top/Bottom pakai BRG_WARNA_OPTS, HPP Standar &
// Ongkos berformat currency ribuan, Keterangan readonly-autofill dari Jenis/Tipe/Warna Top/Bot,
// dan tabel Lapis PU (lihat LapisPuTable) menggantikan Detail PU lama. kodeKategori 'JADIPU'.
function BarangJadiModal({ data, allRows, onClose, onSave }) {
  const isEdit = !!data;
  const empty = { kodeProduk:'', namaProduk:'', kodeKategori:'JADIPU', jenis:'', tipe:'', minimQty:1, tipeData:'F', aktif:true, lebar:0, panjang:0, hppStandar:0, status:'AKTIF', ongkos:0, warnaTop:'', warnaBot:'', tebalTop:0, tebalBot:0, keterangan:'', detailsPU:[] };
  const [form, setForm] = React.useState(() => { const base = data ? {...empty, ...data} : {...empty}; if (!Array.isArray(base.detailsPU)) base.detailsPU = []; return base; });
  const set = (k,v) => setForm(f => ({...f, [k]:v}));
  const productOptions = (allRows || []).filter(r => r.kodeProduk !== form.kodeProduk).map(r => ({ value:r.kodeProduk, label:r.namaProduk }));
  const ketItems = [
    form.jenis && `Jenis: ${brgJenisPuNama(form.jenis)} (${form.jenis})`,
    form.tipe && `Tipe: ${brgTipePuNama(form.tipe)} (${form.tipe})`,
    form.warnaTop && `Warna Top: ${brgWarnaNama(form.warnaTop)} (${form.warnaTop})`,
    form.warnaBot && `Warna Bottom: ${brgWarnaNama(form.warnaBot)} (${form.warnaBot})`,
  ].filter(Boolean);
  const req = <span style={{color:'var(--danger)'}}>*</span>;
  const currencyProps = (key) => ({
    className:'input mono', type:'text', inputMode:'numeric',
    value: form[key] ? Number(form[key]).toLocaleString('id-ID') : '',
    onChange: e => { const raw = e.target.value.replace(/[^\d]/g, ''); set(key, raw ? +raw : 0); },
  });
  const handleSave = () => {
    const cleanDetailsPU = form.detailsPU.filter(r => !r._deleted).map(({_deleted, _added, ...r}) => r);
    onSave({ ...form, minimQty: Math.max(1, form.minimQty || 1), keterangan: ketItems.join('; '), detailsPU: cleanDetailsPU });
  };
  return (
    <BrgModalShell title={isEdit ? `Edit Barang PU — ${form.kodeProduk}` : 'Tambah Barang PU Baru'} sub="Pastikan semua kolom bertanda (*) terisi." onClose={onClose} onSave={handleSave} wide maxWidth={1400}>
      <div className="panel">
        <h3>Informasi Barang Jadi PU</h3>
        <div className="form-grid-3" style={{gap:24, alignItems:'start'}}>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field"><label>Nama Produk {req}</label><input className="input" value={form.namaProduk} onChange={e=>set('namaProduk',e.target.value)}/></div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Jenis {req}</label><select className="select" value={form.jenis} onChange={e=>set('jenis',e.target.value)}><option value="">Pilih Jenis</option>{BRG_JENIS_PU_OPTS.map(j=><option key={j.kode} value={j.kode}>{j.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgJenisPuNama(form.jenis)} readOnly placeholder="Jenis" /></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Tipe {req}</label><select className="select" value={form.tipe} onChange={e=>set('tipe',e.target.value)}><option value="">Pilih Tipe</option>{BRG_TIPE_PU_OPTS.map(t=><option key={t.kode} value={t.kode}>{t.kode}</option>)}</select></div>
              <div className="field"><label>&nbsp;</label><input className="input" value={brgTipePuNama(form.tipe)} readOnly placeholder="Tipe" /></div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field"><label>Kode Produk {req}</label><input className="input mono" value={form.kodeProduk} onChange={e=>set('kodeProduk',e.target.value)}/></div>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>Minimum Qty {req}</label><input className="input mono" type="number" min={1} value={form.minimQty} onChange={e=>set('minimQty', Math.max(1, +e.target.value || 1))}/></div>
              <div className="field"><label>Tipe Barang {req}</label><select className="select" value={form.tipeData} onChange={e=>set('tipeData',e.target.value)}><option value="F">F</option><option value="K">K</option></select></div>
              <div className="field"><label>Aktif {req}</label><select className="select" value={form.aktif ? '1':'0'} onChange={e=>set('aktif', e.target.value==='1')}><option value="1">Ya</option><option value="0">Tidak</option></select></div>
            </div>
            <div className="form-grid-2" style={{gap:12}}>
              <div className="field"><label>Lebar {req}</label><input className="input mono" type="number" value={form.lebar} onChange={e=>set('lebar',+e.target.value)}/></div>
              <div className="field"><label>Panjang {req}</label><input className="input mono" type="number" value={form.panjang} onChange={e=>set('panjang',+e.target.value)}/></div>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div className="field">
              <label>Keterangan {req}</label>
              <div className="textarea" style={{background:'var(--bg-sub)', minHeight:88}}>
                {ketItems.length ? <ul style={{margin:0, paddingLeft:18}}>{ketItems.map((k,i)=><li key={i}>{k}</li>)}</ul> : <span className="muted">Otomatis dari Jenis, Tipe, Warna Top &amp; Warna Bottom</span>}
              </div>
            </div>
            <div className="form-grid-3" style={{gap:12}}>
              <div className="field"><label>HPP Standar {req}</label><input {...currencyProps('hppStandar')} /></div>
              <div className="field"><label>Status {req}</label><select className="select" value={form.status} onChange={e=>set('status',e.target.value)}>{BRG_STATUS_PU_OPTS.map(s=><option key={s}>{s}</option>)}</select></div>
              <div className="field"><label>Ongkos {req}</label><input {...currencyProps('ongkos')} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel form-grid-3" style={{marginTop:16, gap:24, alignItems:'start'}}>
        <div style={{gridColumn:'span 2'}}>
          <LapisPuTable rows={form.detailsPU} setRows={v=>set('detailsPU', v)} productOptions={productOptions} />
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div className="form-grid-2" style={{gap:12}}>
            <div className="field"><label>Warna Top {req}</label><select className="select" value={form.warnaTop} onChange={e=>set('warnaTop',e.target.value)}><option value="">Pilih Warna Top</option>{BRG_WARNA_OPTS.map(w=><option key={w.kode} value={w.kode}>{w.kode}</option>)}</select></div>
            <div className="field"><label>&nbsp;</label><input className="input" value={brgWarnaNama(form.warnaTop)} readOnly placeholder="Warna Top" /></div>
          </div>
          <div className="form-grid-2" style={{gap:12}}>
            <div className="field"><label>Warna Bottom {req}</label><select className="select" value={form.warnaBot} onChange={e=>set('warnaBot',e.target.value)}><option value="">Pilih Warna Bottom</option>{BRG_WARNA_OPTS.map(w=><option key={w.kode} value={w.kode}>{w.kode}</option>)}</select></div>
            <div className="field"><label>&nbsp;</label><input className="input" value={brgWarnaNama(form.warnaBot)} readOnly placeholder="Warna Bottom" /></div>
          </div>
          <div className="form-grid-2" style={{gap:12}}>
            <div className="field"><label>Tebal Top {req}</label><input className="input mono" type="number" value={form.tebalTop} onChange={e=>set('tebalTop',+e.target.value)}/></div>
            <div className="field"><label>Tebal Bottom {req}</label><input className="input mono" type="number" value={form.tebalBot} onChange={e=>set('tebalBot',+e.target.value)}/></div>
          </div>
        </div>
      </div>
    </BrgModalShell>
  );
}

function BarangJadiPage() {
  const [rows, setRows] = React.useState(BARANG_JADI);
  const [modal, setModal] = React.useState(null);
  const [modalMode, setModalMode] = React.useState(null); // null | 'umum' | 'pu'
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const save = (form) => {
    setRows(prev => modal ? prev.map(r => r.kodeProduk===modal.kodeProduk ? form : r) : [form, ...prev]);
    window.__erpToast && window.__erpToast('Barang jadi berhasil disimpan.');
    setModalMode(null); setModal(null);
  };
  const openEdit = (r) => { setModal(r); setModalMode(r.kodeKategori === 'JADIPU' ? 'pu' : 'umum'); };
  const deleteRow = () => {
    setRows(prev => prev.filter(r => r.kodeProduk !== confirmDelete.kodeProduk));
    window.__erpToast && window.__erpToast('Barang jadi berhasil dihapus.');
    setConfirmDelete(null);
  };
  return (
    <>
      <BarangJadiList rows={rows}
        onAddUmum={()=>{setModal(null); setModalMode('umum');}}
        onAddPu={()=>{setModal(null); setModalMode('pu');}}
        onEdit={openEdit}
        onDelete={setConfirmDelete} />
      {modalMode==='umum' && <BarangUmumModal data={modal} onClose={()=>setModalMode(null)} onSave={save} />}
      {modalMode==='pu' && <BarangJadiModal data={modal} allRows={rows} onClose={()=>setModalMode(null)} onSave={save} />}
      {confirmDelete && (
        <ConfirmationModal
          title="Hapus Barang Jadi"
          message={`Barang jadi "${confirmDelete.namaProduk}" (${confirmDelete.kodeProduk}) akan dihapus. Tindakan ini tidak bisa dibatalkan.`}
          confirmLabel="Hapus"
          confirmKind="danger"
          requireReason={false}
          onCancel={()=>setConfirmDelete(null)}
          onConfirm={deleteRow}
        />
      )}
    </>
  );
}
