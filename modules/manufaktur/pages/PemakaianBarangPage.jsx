// Manufaktur — Bukti Pemakaian Barang Lain (BPBL) & Retur Pakai Barang Lain (RPBL): list dan
// dialog bersama, dibedakan lewat prop `type` seperti pada manufaktur.jsx asli.
// Dipindah dari manufaktur.jsx, identifier diprefix Mf/MF_.
//
// State-lifting fix: MfPemakaianBarangDialog merakit objek form (termasuk lookup namaGudang dari
// MF_GUDANG_DATA) pada tombol Simpan dan mengirimnya ke onSave, bukan memanggil onSave tanpa data.

// ─── Pemakaian / Retur Barang Dialog ─────────────────────────────────────────

function MfPemakaianBarangDialog({ type, data, spkRows, onClose, onSave }) {
  const prefix = type === 'bpbl' ? 'BPBL' : 'RPBL';
  const title  = type === 'bpbl' ? 'Bukti Pemakaian Barang Lain' : 'Retur Pakai Barang Lain';
  const isCreate = !data;

  // No. Bukti: gerbang F/K sama pola dengan KO/SO/DO/SPK/HP — user ketik F atau K, field lain
  // baru bisa diisi setelah itu, nomor lengkap dibuat saat Simpan.
  const [noBuktiRaw, setNoBuktiRaw] = React.useState('');
  const [noBuktiError, setNoBuktiError] = React.useState('');
  const noBuktiRef = React.useRef(null);
  const handleNoBuktiChange = (val) => {
    const v = val.toUpperCase();
    setNoBuktiRaw(v);
    if (!v) setNoBuktiError('No. Bukti harus di isi');
    else if (!['F','K'].includes(v[0])) setNoBuktiError('Format No. Bukti salah');
    else setNoBuktiError('');
  };
  const noBuktiLocked = isCreate && (!noBuktiRaw || !['F','K'].includes(noBuktiRaw[0]));
  React.useEffect(() => { if (isCreate && noBuktiRef.current) noBuktiRef.current.focus(); }, [isCreate]);

  const [tgl,         setTgl]         = React.useState(data?.tgl         || '2026-06-24');
  const [gudang,      setGudang]      = React.useState(data?.gudang      || '');
  const [bagian,      setBagian]      = React.useState(data?.bagian      || '');
  const [noOpb,       setNoOpb]       = React.useState(data?.noOpb       || '');
  const [catatan,     setCatatan]     = React.useState(data?.catatan     || '');
  const [barangLines, setBarangLines] = React.useState(data?.barangLines || []);
  const [barangModal, setBarangModal] = React.useState(null);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !barangModal) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [barangModal, onClose]);

  // Soft-delete/restore — sama pola dengan tabel item Pembelian/Penjualan/SPK/Hasil Produksi:
  // baris ditandai _deleted (bisa di-Restore sebelum Simpan), bukan langsung hilang.
  const softDeleteBarang = (idx) => setBarangLines(ls => ls.map((r,i) => i===idx ? {...r, _deleted:true}  : r));
  const restoreBarang    = (idx) => setBarangLines(ls => ls.map((r,i) => i===idx ? {...r, _deleted:false} : r));

  const handleSave = () => {
    const namaGudang = (GUDANG_DATA.find(g => g.kode === gudang) || {}).nama || '';
    const cleanBarang = barangLines.filter(r => !r._deleted).map(({_deleted, _added, ...r}) => r);
    const finalNo = isCreate
      ? (noBuktiRaw[0] || '') + prefix + new Date().toISOString().slice(2,4) + new Date().toISOString().slice(5,7) + String(Math.floor(Math.random()*9000)+1000)
      : data.no;
    onSave({
      no: finalNo,
      tgl, gudang, namaGudang, bagian, noOpb, catatan,
      barangLines: cleanBarang,
      totalBarang: cleanBarang.length,
    });
  };

  const tdS = { padding:'5px 6px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };
  const thS = (w, center) => ({
    padding:'10px 10px', fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
    textAlign: center ? 'center' : 'left', width: w || undefined,
  });

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal" style={{maxWidth:1100}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? `Edit ${title}` : `Buat ${title}`}</h2>
              <div className="sub">Pastikan semua kolom bertanda (*) terisi.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="modal-body" style={{paddingTop:0}}>
            {/* Header info bar */}
            <div style={{background:'var(--bg-sub)', padding:'14px 24px', borderBottom:'1px solid var(--border)', marginBottom:24}}>
              <div className="form-grid-px4b" style={{gap:12, marginBottom:12}}>
                <div className="field">
                  <label>No. Bukti *</label>
                  {isCreate ? (
                    <>
                      <input ref={noBuktiRef} className="input mono" type="text" value={noBuktiRaw}
                        onChange={e => handleNoBuktiChange(e.target.value)} placeholder="Ketik F atau K" maxLength={1} />
                      {noBuktiError && <div className="no-bukti-alert">{noBuktiError}</div>}
                    </>
                  ) : (
                    <input className="input" value={data?.no} readOnly />
                  )}
                </div>
                <div className="field">
                  <label>Tanggal *</label>
                  <input className="input" type="date" value={tgl} disabled={noBuktiLocked} onChange={e => setTgl(e.target.value)} />
                </div>
                <div className="field">
                  <label>Gudang *</label>
                  <select className="select" value={gudang} disabled={noBuktiLocked} onChange={e => setGudang(e.target.value)}>
                    <option value="">— Pilih Gudang —</option>
                    {GUDANG_DATA.map(g => (
                      <option key={g.kode} value={g.kode}>{g.kode} — {g.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Bagian</label>
                  <input className="input" placeholder="e.g. Produksi" value={bagian} disabled={noBuktiLocked}
                    onChange={e => setBagian(e.target.value)} />
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns: type === 'bpbl' ? '1fr 3fr' : '1fr', gap:12}}>
                {type === 'bpbl' && (
                  <div className="field">
                    <label>No. OPB</label>
                    <input className="input" placeholder="No. OPB" value={noOpb} disabled={noBuktiLocked}
                      onChange={e => setNoOpb(e.target.value)} />
                  </div>
                )}
                <div className="field">
                  <label>Catatan</label>
                  <input className="input" placeholder="Catatan (opsional)" value={catatan} disabled={noBuktiLocked}
                    onChange={e => setCatatan(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Detail Barang */}
            <div style={{padding:'0 24px 24px'}} className="inline-table">
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                <h3 style={{margin:0, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--text-3)'}}>Detail Barang</h3>
                {!noBuktiLocked && (
                  <button className="btn btn-primary btn-sm" onClick={() => setBarangModal('add')}>{I.plus()} Tambah Barang</button>
                )}
              </div>
              <div className="line-items" style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:800}}>
                  <thead>
                    <tr>
                      <th style={thS('36px', true)}>No</th>
                      <th style={thS('18%')}>Kode Barang</th>
                      <th style={thS()}>Nama Barang</th>
                      <th style={thS('90px', true)}>Jumlah</th>
                      <th style={thS('70px', true)}>Satuan</th>
                      <th style={thS('120px', true)}>Sisa Sebelumnya</th>
                      <th style={thS('18%')}>No. SPK</th>
                      <th style={thS('52px', true)}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangLines.length === 0 && (
                      <tr><td colSpan={8} style={{padding:'32px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                        Belum ada barang. Klik "+ Tambah Barang" untuk menambahkan.
                      </td></tr>
                    )}
                    {barangLines.map((line, idx) => (
                      <tr key={line.id} className={`${line._deleted ? 'row-deleted' : ''} ${line._added ? 'row-added' : ''}`} title={line._deleted ? 'Baris ini akan dihapus' : ''}>
                        <td style={{...tdS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                        <td style={tdS}><span style={{color:'var(--primary)', fontWeight:500}}>{line.kodeBarang || '—'}</span></td>
                        <td style={tdS}>{line.namaBarang || '—'}</td>
                        <td style={{...tdS, textAlign:'right'}} className="mono">{line.jumlah || '—'}</td>
                        <td style={{...tdS, textAlign:'center'}}>{line.satuan}</td>
                        <td style={{...tdS, textAlign:'right'}} className="mono">{line.sisaSebelumnya || '—'}</td>
                        <td style={{...tdS, color:'var(--primary)', fontWeight:500}}>{line.noSpk || '—'}</td>
                        <td style={{...tdS, textAlign:'center'}}>
                          <div className="row-actions" style={{justifyContent:'center'}}>
                            {line._deleted ? (
                              <button className="btn btn-icon btn-sm" style={{color:'var(--realisasi)'}} title="Restore"
                                onClick={() => restoreBarang(idx)}>{I.refresh(14)}</button>
                            ) : (
                              <>
                                <button className="btn btn-icon btn-sm" title="Edit"
                                  onClick={() => setBarangModal({idx, data:line})}>{I.edit()}</button>
                                <button className="btn btn-icon btn-sm del" title="Hapus"
                                  onClick={() => softDeleteBarang(idx)}>{I.trash()}</button>
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
          </div>

          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary" onClick={handleSave}>{I.check()} Simpan</button>
            </div>
          </div>
        </div>
      </div>

      {barangModal && (
        <MfBarangPakaiEntryModal
          data={barangModal === 'add' ? null : barangModal.data}
          spkRows={spkRows}
          onClose={() => setBarangModal(null)}
          onSave={(entry) => {
            if (barangModal === 'add') {
              setBarangLines(ls => [...ls, {...entry, id:Date.now(), _added:true}]);
            } else {
              setBarangLines(ls => ls.map((l, i) => i === barangModal.idx ? {...entry, id:l.id, _added:l._added} : l));
            }
            setBarangModal(null);
          }}
        />
      )}
    </>
  );
}

// ─── Pemakaian / Retur Barang List ────────────────────────────────────────────

function MfPemakaianBarangList({ type, rows, onAdd, onEdit }) {
  const title = type === 'bpbl' ? 'Bukti Pemakaian Barang Lain' : 'Retur Pakai Barang Lain';

  const [tglDari,  setTglDari]  = React.useState('');
  const [tglSmpai, setTglSmpai] = React.useState('');
  const [qBagian,  setQBagian]  = React.useState('');
  const [page,     setPage]     = React.useState(1);
  const perPage = 10;

  // r.tgl seed pakai "DD-MM-YYYY" (lihat mfToIso di SpkPage.jsx), sedangkan input type="date"
  // ngasih "YYYY-MM-DD" — tanpa konversi, filter Tgl Dari/Sampai (yang sudah ada input-nya tapi
  // sebelumnya tidak pernah dipakai di sini) salah bandingnya kalau langsung string-compare.
  const filtered = rows.filter(r => {
    if (qBagian && !(r.bagian || '').toLowerCase().includes(qBagian.toLowerCase())) return false;
    const iso = mfToIso(r.tgl);
    if (tglDari && iso && iso < tglDari) return false;
    if (tglSmpai && iso && iso > tglSmpai) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <div className="sub">Daftar dokumen {title.toLowerCase()}</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-grid filter-grid-4">
          <div className="field">
            <label>Tgl. Dari</label>
            <input className="input" type="date" value={tglDari}
              onChange={e => { setTglDari(e.target.value); setPage(1); }} />
          </div>
          <div className="field">
            <label>Tgl. Sampai</label>
            <input className="input" type="date" value={tglSmpai}
              onChange={e => { setTglSmpai(e.target.value); setPage(1); }} />
          </div>
          <div className="field">
            <label>Bagian</label>
            <input className="input" placeholder="Cari bagian…" value={qBagian}
              onChange={e => { setQBagian(e.target.value); setPage(1); }} />
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={() => setPage(1)}>{I.search(13)} Cari</button>
            <button className="btn" onClick={() => { setTglDari(''); setTglSmpai(''); setQBagian(''); setPage(1); }}>Reset</button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            Total Item <b>({filtered.length})</b>
          </div>
          <div className="table-toolbar-right">
            <button className="btn btn-primary btn-sm" onClick={onAdd}>{I.plus()} Tambah Data</button>
            <button className="btn btn-sm btn-icon" title="Refresh">{I.refresh()}</button>
            <button className="btn btn-sm btn-icon" title="Print">{I.print()}</button>
            <button className="btn btn-sm btn-icon btn-danger" title="Hapus">{I.trash()}</button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th style={{width:32}}><input type="checkbox" className="cb" /></th>
                <th>No. Bukti</th>
                <th>Tanggal</th>
                <th>Gudang</th>
                <th>Bagian</th>
                {type === 'bpbl' && <th>No. OPB</th>}
                <th className="num">Total Barang</th>
                <th className="center" style={{width:60}}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 && (
                <tr><td colSpan={type === 'bpbl' ? 8 : 7}
                  style={{textAlign:'center', padding:32, color:'var(--text-3)'}}>
                  Tidak ada data</td></tr>
              )}
              {pageRows.map(r => (
                <tr key={r.no}>
                  <td><input type="checkbox" className="cb" /></td>
                  <td><span className="cell-link">{r.no}</span></td>
                  <td>{r.tgl}</td>
                  <td>{r.namaGudang}</td>
                  <td>{r.bagian}</td>
                  {type === 'bpbl' && <td className="muted">{r.noOpb || '—'}</td>}
                  <td className="num mono">{r.totalBarang}</td>
                  <td className="center">
                    <div className="row-actions">
                      <button className="btn btn-icon btn-sm" title="Edit" onClick={() => onEdit(r)}>{I.edit()}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <span>Menampilkan {pageRows.length} dari {filtered.length} data</span>
          <div className="pager-pages">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>{I.chev(12,'left')}</button>
            {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{I.chev(12,'right')}</button>
          </div>
        </div>
      </div>
    </>
  );
}
