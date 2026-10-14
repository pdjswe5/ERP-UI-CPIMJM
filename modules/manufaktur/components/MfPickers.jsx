// Manufaktur — komponen picker/entry modal bersama, dipakai lintas sub-modul SPK, Hasil Produksi,
// dan Pemakaian/Retur Barang Lain. Dipindah dari manufaktur.jsx, identifier diprefix Mf.

// ─── Shared Picker Shell ─────────────────────────────────────────────────────

function MfPickerShell({ title, zIndex, width, onClose, children }) {
  return (
    <div className="modal-backdrop" style={{zIndex: zIndex || 200}}>
      <div className="modal" style={{maxWidth: width || 960, maxHeight:'72vh'}} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MfPickerTable({ columns, rows, onClose, emptyMsg }) {
  return (
    <div style={{overflowY:'auto', maxHeight:'calc(72vh - 180px)', padding:'0 32px'}}>
      <table className="data" style={{minWidth:'unset'}}>
        <thead>
          <tr>{columns.map(c => <th key={c.key} style={c.style}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{textAlign:'center', padding:24, color:'var(--text-3)'}}>
              {emptyMsg || 'Tidak ada hasil'}
            </td></tr>
          )}
          {rows}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pilih Barang Modal ───────────────────────────────────────────────────────

// Salinan ItemPickerModal (components.jsx, dipakai Penjualan/Pembelian) supaya UI-nya sama persis
// — checkbox multi-select + qty per baris. `items` WAJIB diisi pemanggil (BARANG_JADI/BAHAN_BAKU/
// BARANG_LAIN dari modul Barang, tergantung konteks) — tidak ada lagi katalog default ad-hoc.
// Prop `single` (dipakai field Kode Barang di Tambah Barang Jadi SPK — cuma boleh 1 barang per
// baris): sembunyikan checkbox + kolom Jumlah, klik baris langsung memilih & menutup picker.
function MfPilihBarangModal({ title, items, onConfirm, onCancel, zIndex, single }) {
  const data = items || [];
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState({});
  const [qtyMap, setQtyMap] = React.useState({});

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel]);

  const filtered = React.useMemo(() => {
    if (!q) return data;
    const ql = q.toLowerCase();
    return data.filter(it => (it.nama||it.name||'').toLowerCase().includes(ql) || (it.kode||it.code||'').toLowerCase().includes(ql));
  }, [data, q]);

  const pickSingle = (it) => onConfirm([{ ...it }]);

  const toggle = (code) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[code]) { delete next[code]; setQtyMap(qm => { const nqm={...qm}; delete nqm[code]; return nqm; }); }
      else next[code] = true;
      return next;
    });
  };
  const setQty = (code, val) => setQtyMap(prev => ({ ...prev, [code]: Math.max(1, +val || 1) }));
  const selectedCount = Object.keys(selected).length;

  const handleConfirm = () => {
    const picked = Object.keys(selected).map(code => {
      const it = data.find(x => (x.kode||x.code) === code);
      return { ...it, _qty: qtyMap[code] || 1 };
    });
    onConfirm(picked);
  };

  return (
    <div className="modal-backdrop" style={{zIndex: zIndex || 110}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>{title || 'Pilih Barang'}</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari kode atau nama barang…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:320, overflowY:'auto'}}>
            <table>
              <thead><tr>{!single && <th style={{width:40}}></th>}<th>Kode</th><th>Nama Barang</th>{!single && <th style={{width:90}}>Jumlah</th>}</tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={single ? 2 : 4} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(it => {
                  const code = it.kode || it.code;
                  const name = it.nama || it.name;
                  if (single) {
                    return (
                      <tr key={code} style={{cursor:'pointer'}} onClick={()=>pickSingle(it)}>
                        <td className="mono">{code}</td>
                        <td>{name}</td>
                      </tr>
                    );
                  }
                  const isSel = !!selected[code];
                  return (
                    <tr key={code} className={isSel ? 'selected' : ''} onClick={()=>toggle(code)}>
                      <td><input type="checkbox" checked={isSel} onChange={()=>toggle(code)} onClick={e=>e.stopPropagation()}/></td>
                      <td className="mono">{code}</td>
                      <td>{name}</td>
                      <td>
                        {isSel ? (
                          <input className="cell num" type="number" min={1} value={qtyMap[code]||1} onChange={e=>setQty(code, e.target.value)} onClick={e=>e.stopPropagation()}/>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {!single && (
          <div className="modal-foot">
            <div className="muted" style={{fontSize:12.5}}>{selectedCount} barang dipilih</div>
            <div className="right" style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onCancel}>Batal</button>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedCount===0}>{I.plus()} Tambah Item ({selectedCount})</button>
            </div>
          </div>
        )}
        {single && (
          <div className="modal-foot" style={{justifyContent:'flex-end'}}>
            <button className="btn" onClick={onCancel}>Batal</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SPK Picker Modal ─────────────────────────────────────────────────────────

// `rows` — live spkRows state dari ManufakturPage (fallback ke MF_SPK_SEED statis kalau tidak
// dikasih, buat caller lama yang belum di-update, mis. MfBarangPakaiEntryModal di BPBL/RPBL) —
// tanpa ini, SPK yang baru dibuat/diubah user dalam sesi berjalan nggak pernah muncul di sini.
function MfSpkPickerModal({ rows, onPick, onClose, filter }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const data = rows || MF_SPK_SEED;
  const filtered = data.filter(s => {
    if (filter && !filter(s)) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    return s.no.toLowerCase().includes(ql) || s.produk.toLowerCase().includes(ql);
  });
  return (
    <MfPickerShell title="Pilih SPK" zIndex={300} width={800} onClose={onClose}>
      <div style={{padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
        <div className="input-w-icon">{I.search(14)}
          <input ref={inputRef} className="input" placeholder="Cari No. SPK atau Produk…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <MfPickerTable
        columns={[
          {key:'no', label:'NO. SPK',  style:{width:'22%'}},
          {key:'pr', label:'PRODUK'},
          {key:'gd', label:'GUDANG',   style:{width:'20%'}},
          {key:'st', label:'STATUS',   style:{width:'14%',textAlign:'center'}},
        ]}
        rows={filtered.map(s => (
          <tr key={s.no} style={{cursor:'pointer'}} onClick={() => onPick(s)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{s.no}</td>
            <td>{s.produk}</td>
            <td>{s.gudang}</td>
            <td style={{textAlign:'center'}}>
              <span className={`pill ${STATUS_CLASS[s.status] || 'draft'}`}>{s.status}</span>
            </td>
          </tr>
        ))}
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </MfPickerShell>
  );
}

// ─── Barang Jadi (per-SPK) Picker Modal ───────────────────────────────────────

// Dipakai setelah 1 SPK sudah dipilih (Planning "Pilih SPK", Hasil Produksi "+ Tambah Data") —
// SPK bisa punya lebih dari 1 Barang Jadi, jadi user harus milih yang mana. Kalau `spk.bjLines`
// cuma 1 baris, caller nggak perlu buka modal ini sama sekali (auto-resolve).
function MfSpkBjPickerModal({ spk, onPick, onClose }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const bjLines = (spk?.bjLines || []).filter(b => !b._deleted);
  return (
    <MfPickerShell title={`Pilih Barang Jadi — ${spk?.no || ''}`} zIndex={310} width={800} onClose={onClose}>
      <MfPickerTable
        columns={[
          {key:'kd', label:'KODE BARANG', style:{width:'18%'}},
          {key:'nm', label:'NAMA BARANG'},
          {key:'qt', label:'QTY SPK',     style:{width:'12%', textAlign:'right'}},
          {key:'st', label:'SATUAN',      style:{width:'10%', textAlign:'center'}},
          {key:'mk', label:'MERK BARANG', style:{width:'16%'}},
        ]}
        rows={bjLines.map(bj => (
          <tr key={bj.id} style={{cursor:'pointer'}} onClick={() => onPick(bj)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{bj.kodeBarang}</td>
            <td>{bj.namaBarang}</td>
            <td style={{textAlign:'right'}} className="mono">{bj.qtySPK}</td>
            <td style={{textAlign:'center'}}>{bj.satuan}</td>
            <td>{bj.namaMerkBarang || '—'}</td>
          </tr>
        ))}
        emptyMsg="SPK ini belum punya Barang Jadi."
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </MfPickerShell>
  );
}

// ─── SO Picker Modal ──────────────────────────────────────────────────────────
// Salinan pola picker dokumen milik SO (lihat KoDocPickerModal di salesorder.data.jsx, dipakai
// "Buat SO dari KO") — di sini dipakai SPK untuk mengambil referensi Sales Order (bukan KO).
// Sumber SALES_ORDER_SEED (modul Penjualan, sudah dimuat lebih dulu di index.html).

function MfSoPickerModal({ onCancel, onConfirm }) {
  const [q, setQ] = React.useState('');
  // Cuma SO yang masih punya sisa qty belum diproduksi yang boleh jadi SPK — Belum Realisasi (semua
  // qty masih 0) atau Selesai Sebagian (sebagian sudah). SO yang Selesai/Selesai Manual/Batal sudah
  // tidak relevan lagi (baik karena tuntas maupun sudah tidak jadi diproses), jadi disaring di sini
  // sebelum sampai ke pencarian teks.
  const eligible = React.useMemo(() => SALES_ORDER_SEED.filter(s => {
    const st = soComputeStatus(s);
    return st === 'BELUM_REALISASI' || st === 'SELESAI_SEBAGIAN';
  }), []);
  const filtered = React.useMemo(() => {
    if (!q) return eligible;
    const ql = q.toLowerCase();
    return eligible.filter(s => s.No_Bukti.toLowerCase().includes(ql) || (s.Nama_Cust||'').toLowerCase().includes(ql));
  }, [q, eligible]);
  return (
    <div className="modal-backdrop" style={{zIndex:300}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Pilih Sales Order</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari no. bukti atau customer…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:320, overflowY:'auto'}}>
            <table>
              <thead><tr><th>No. Bukti</th><th>Customer</th><th>Tgl. Bukti</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={4} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(s => (
                  <tr key={s.No_Bukti} style={{cursor:'pointer'}} onClick={()=>onConfirm(s)}>
                    <td className="mono">{s.No_Bukti}</td>
                    <td>{s.Nama_Cust}</td>
                    <td>{s.Tgl_Bukti}</td>
                    <td>{soStatusPill(s)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>Klik salah satu baris untuk memilih.</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onCancel}>Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COIL Picker Modal ────────────────────────────────────────────────────────

function MfCoilPickerModal({ onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    inputRef.current?.focus();
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);
  const filtered = MF_COIL_LIST.filter(c => {
    if (!q) return true;
    const ql = q.toLowerCase();
    return c.no.toLowerCase().includes(ql) || c.barang.toLowerCase().includes(ql);
  });
  return (
    <MfPickerShell title="Pilih No. Coil" zIndex={300} width={800} onClose={onClose}>
      <div style={{padding:'12px 32px', borderBottom:'1px solid var(--border)'}}>
        <div className="input-w-icon">{I.search(14)}
          <input ref={inputRef} className="input" placeholder="Cari No. Coil atau nama barang…"
            value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      <MfPickerTable
        columns={[
          {key:'no', label:'NO. COIL',  style:{width:'20%'}},
          {key:'br', label:'BARANG'},
          {key:'gd', label:'GUDANG',    style:{width:'20%'}},
          {key:'si', label:'SISA (MTR)',style:{width:'14%', textAlign:'right'}},
        ]}
        rows={filtered.map(c => (
          <tr key={c.no} style={{cursor:'pointer'}} onClick={() => onPick(c)}>
            <td style={{color:'var(--primary)', fontWeight:500}}>{c.no}</td>
            <td>{c.barang}</td>
            <td>{c.gudang}</td>
            <td style={{textAlign:'right'}}>{fmtNum(c.sisa)}</td>
          </tr>
        ))}
      />
      <div className="modal-foot" style={{justifyContent:'flex-end', padding:'12px 32px'}}>
        <button className="btn" onClick={onClose}>Batal</button>
      </div>
    </MfPickerShell>
  );
}

// ─── Barang Jadi Picker Modal ─────────────────────────────────────────────────

// Salinan pola picker dokumen milik DO/KO/SO (lihat KoDocPickerModal di salesorder.data.jsx,
// DoSoItemPickerModal di deliveryorder.data.jsx, MfSoPickerModal di atas) — sebelumnya
// MfBarangJadiPickerModal pakai gaya MfPickerShell/MfPickerTable yang beda tampilannya sendiri.
function MfBarangJadiPickerModal({ onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    if (!q) return MF_BARANG_JADI_LIST;
    const ql = q.toLowerCase();
    return MF_BARANG_JADI_LIST.filter(b => b.kode.toLowerCase().includes(ql) || b.nama.toLowerCase().includes(ql));
  }, [q]);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="modal-backdrop" style={{zIndex:300}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Pilih Barang Jadi</h2><button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button></div>
        <div className="modal-body">
          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:12}}>
            <div className="field" style={{width:'40%', minWidth:200, marginBottom:0}}>
              <div className="input-w-icon">{I.search(14)}<input className="input" placeholder="Cari kode atau nama barang jadi…" value={q} onChange={e=>setQ(e.target.value)}/></div>
            </div>
          </div>
          <div className="line-items picker-table" style={{maxHeight:320, overflowY:'auto'}}>
            <table>
              <thead><tr><th>Kode</th><th>Nama Barang</th><th>Kode PU</th><th>No. Coil</th><th>Satuan</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} className="empty">Tidak ditemukan.</td></tr>}
                {filtered.map(b => (
                  <tr key={b.kode} style={{cursor:'pointer'}} onClick={()=>onPick(b)}>
                    <td className="mono">{b.kode}</td>
                    <td>{b.nama}</td>
                    <td>{b.kodePU}</td>
                    <td className="mono">{b.noCoil}</td>
                    <td>{b.satuan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>Klik salah satu baris untuk memilih.</div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Barang Jadi Entry Modal (for SPK) ───────────────────────────────────────

// `bahanLines` (opsional): bahan yang sudah dimiliki barang jadi ini (mode Edit) — dikelola LOKAL
// di dalam popup ini (tambah/hapus/ubah langsung, tanpa soft-delete — beda dari pola bjLines di
// MfSpkDialog karena di sini "Simpan" popup ini sekaligus jadi titik commit-nya) dan dikirim balik
// lewat onSave (field `bahanLines`); MfSpkDialog yang gabungkan ke bahanLines top-level miliknya
// (assign bjLineId, replace bahan lama punya barang ini dengan hasil popup).
function MfBarangJadiEntryModal({ data, bahanLines, onClose, onSave }) {
  const [kodeBarang,    setKodeBarang]    = React.useState(data?.kodeBarang    || '');
  const [namaBarang,    setNamaBarang]    = React.useState(data?.namaBarang    || '');
  const [qtySPK,        setQtySPK]        = React.useState(data?.qtySPK        || '');
  const [satuan,        setSatuan]        = React.useState(data?.satuan        || 'LBR');
  const [kelompokWarna,     setKelompokWarna]     = React.useState(data?.kelompokWarna     || '');
  const [namaKelompokWarna, setNamaKelompokWarna] = React.useState(data?.namaKelompokWarna || '');
  const [az,     setAz]     = React.useState(data?.az     || '');
  const [namaAz, setNamaAz] = React.useState(data?.namaAz || '');
  const [brand,     setBrand]     = React.useState(data?.brand     || '');
  const [namaBrand, setNamaBrand] = React.useState(data?.namaBrand || '');
  const [merkBarang,     setMerkBarang]     = React.useState(data?.merkBarang     || '');
  const [namaMerkBarang, setNamaMerkBarang] = React.useState(data?.namaMerkBarang || '');
  const [stempel,       setStempel]       = React.useState(data?.stempel       || '');
  const [mesinDipilih,  setMesinDipilih]  = React.useState(data?.mesinDipilih  || []);
  const [showBarangPicker, setShowBarangPicker] = React.useState(false);
  const [localBahan,    setLocalBahan]    = React.useState(() => (bahanLines || []).map(r => ({...r})));
  const [showBahanPicker, setShowBahanPicker] = React.useState(false);
  // Root-cause fix: ganti Barang Jadi (baik saat Tambah maupun Edit) dulu tidak pernah memperbarui
  // tabel Bahan begitu localBahan sudah terisi (lihat komentar lama di onBarangPick) — bahan dari
  // barang SEBELUMNYA tetap nyangkut walau barangnya sudah diganti. Sekarang: kalau ganti ke barang
  // lain DAN tabel Bahan sudah ada isinya, minta konfirmasi dulu (pola sama seperti "Ganti No. SO?"
  // di SpkPage.jsx) sebelum bahan di-replace wholesale mengikuti resep BOM barang yang baru.
  const [pendingBarangPick, setPendingBarangPick] = React.useState(null);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !showBarangPicker && !showBahanPicker && !pendingBarangPick) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [showBarangPicker, showBahanPicker, pendingBarangPick, onClose]);

  // Barang Jadi & Bahan sekarang dari katalog modul Barang (BARANG_JADI/BAHAN_BAKU/BARANG_LAIN),
  // BUKAN MF_BARANG lagi — SPK & modul Barang jadi 1 katalog yang sama, jadi BOM (BRG_BOM_SEED,
  // data/bom.data.jsx di modul Barang) otomatis nyambung ke sini. BOM di modul Barang cuma soal
  // Bahan Baku/Penolong/Lain (bukan mesin) — mesin tetap dipilih manual seperti sebelumnya.
  const bahanPickerItems = React.useMemo(() => [
    ...BAHAN_BAKU.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk })),
    ...BARANG_LAIN.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk })),
  ], []);

  // BOM auto-fill: kalau barang jadi yang dipilih punya resep di BRG_BOM_SEED DAN tabel Bahan masih
  // kosong, langsung terapkan bahan standarnya — user tinggal isi/koreksi Qty SPK. Kalau localBahan
  // sudah terisi (baik dari auto-fill sebelumnya, isian manual, atau data Edit yang sudah ada) DAN
  // barang yang dipilih benar-benar beda dari sebelumnya, jangan langsung ditimpa — tampilkan
  // konfirmasi "Ganti Barang Jadi?" dulu (pendingBarangPick), baru replace wholesale kalau user
  // setuju. Pilih ulang barang yang SAMA (kode tidak berubah) no-op total, tidak menyentuh bahan.
  const applyBarangPick = (b) => {
    setKodeBarang(b.kode); setNamaBarang(b.nama);
    const bom = brgBomFor(b.kode);
    setLocalBahan(bom ? brgBomBuildBahanLines(b.kode, qtySPK) : []);
  };
  const onBarangPick = (picked) => {
    const b = picked[0];
    setShowBarangPicker(false);
    if (!b || b.kode === kodeBarang) return;
    if (localBahan.length > 0) { setPendingBarangPick(b); return; }
    applyBarangPick(b);
  };

  // Qty SPK berubah: kalau bahan yang lagi ada di tabel PERSIS sama komposisinya (kode bahan) dgn
  // resep BOM barang ini, berarti masih bahan hasil auto-fill (belum diubah komposisinya secara
  // manual) — jumlahnya di-recompute mengikuti qty baru. Kalau user sudah tambah/hapus/ganti bahan
  // sendiri, komposisinya beda dari BOM sehingga tidak disentuh lagi di sini.
  const handleQtySpkChange = (val) => {
    setQtySPK(val);
    const bom = brgBomFor(kodeBarang);
    if (!bom) return;
    const bomCodes = bom.komponen.map(k => k.kodeKomponen).slice().sort().join(',');
    const curCodes = localBahan.map(b => b.kodeBahan).slice().sort().join(',');
    if (bomCodes === curCodes) setLocalBahan(brgBomBuildBahanLines(kodeBarang, val));
  };

  const toggleMesin = (nama) => {
    setMesinDipilih(ls => ls.includes(nama) ? ls.filter(m => m !== nama) : [...ls, nama]);
  };

  const onBahanPick = (picked) => {
    setLocalBahan(ls => [...ls, ...picked.map((b, i) => {
      const resolved = brgBomResolveKomponen(b.kode);
      return {
        id: Date.now() + i, gudang:'', kodeBahan: b.kode,
        merkBahan: resolved?.keterangan || '', jumlah: b._qty || '', satuan: resolved?.satuan || '',
      };
    })]);
    setShowBahanPicker(false);
  };
  const updateLocalBahan = (id, field, val) =>
    setLocalBahan(ls => ls.map(r => {
      if (r.id !== id) return r;
      if (field === 'kodeBahan') {
        const resolved = brgBomResolveKomponen(val);
        return {...r, kodeBahan: val, merkBahan: resolved?.keterangan || ''};
      }
      return {...r, [field]: val};
    }));
  const removeLocalBahan = (id) => setLocalBahan(ls => ls.filter(r => r.id !== id));

  const handleSave = () => {
    onSave({
      kodeBarang, namaBarang, qtySPK, satuan,
      kelompokWarna, namaKelompokWarna, az, namaAz, brand, namaBrand, merkBarang, namaMerkBarang,
      stempel, mesinDipilih,
      bahanLines: localBahan,
    });
  };

  const tdBahanS = { padding:'5px 6px', borderBottom:'1px solid var(--border)', verticalAlign:'middle' };
  const thBahanS = (w, center) => ({
    padding:'10px 10px', fontWeight:500, fontSize:'11.5px', letterSpacing:'.04em', textTransform:'uppercase',
    textAlign: center ? 'center' : 'left', width: w || undefined,
  });

  const panelStyle = {
    border:'1px solid var(--border)', borderRadius:'var(--radius)',
    overflowY:'auto', height:190, background:'var(--bg)',
  };
  const panelHeadStyle = {
    padding:'6px 10px', background:'var(--bg-elev)', color:'var(--text)',
    fontSize:11.5, fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase',
    borderBottom:'1px solid var(--border)',
  };

  // Nested grid dalam tiap zona 4-kolom: pairGrid buat pasangan Nama+Kode (field utama 2x lebih
  // lebar drpd Kode-nya yang cuma readonly "Otomatis"); shortGrid buat field pendek (dropdown/angka)
  // yang nggak punya pasangan Kode, dibagi rata 3 kolom.
  // alignItems:'end' — field Kode nggak punya <label> lagi, jadi tanpa ini inputnya nempel ke atas
  // sementara input Nama (yang masih punya label di atasnya) turun lebih rendah, bikin tinggi beda.
  const pairGrid  = { display:'grid', gridTemplateColumns:'2fr 1fr', gap:8, alignItems:'end' };

  return (
    <>
      <div className="modal-backdrop" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:1180}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit Data Item' : 'Tambah Data Item'}</h2>
              <div className="sub">Pilih barang, isi detail, tentukan mesin yang digunakan, dan bahan yang dibutuhkan.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>

          <div className="modal-body">
            {/* Grid 3 kolom (4/4/4) — tiap kolom 1 "zona" field yang berdiri sendiri, isinya
                di-stack lewat nested grid: pairGrid (2fr/1fr) buat pasangan Nama+Kode, shortGrid
                (3 kolom rata) buat field pendek (dropdown/angka) yg nggak punya pasangan Kode. */}
            <div className="form-grid-3" style={{gap:16}}>

              {/* Zona 1: Barang — Nama/Kode Barang, lalu Satuan/Qty SPK/Stempel */}
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div style={pairGrid}>
                  <div className="field">
                    <label>Nama Barang *</label>
                    <input className="input" style={{cursor:'pointer', background:'var(--bg-elev)'}} readOnly
                      placeholder="— Pilih Barang —" value={namaBarang}
                      onClick={() => setShowBarangPicker(true)} />
                  </div>
                  <div className="field">
                    <input className="input mono" value={kodeBarang} readOnly placeholder="Kode..." />
                  </div>
                </div>
                <div className="form-grid-3" style={{gap:8}}>
                  <div className="field">
                    <label>Satuan</label>
                    <select className="select" value={satuan} disabled={!kodeBarang} onChange={e => setSatuan(e.target.value)}>
                      {MF_SATUAN_SPK.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Qty SPK *</label>
                    <input className="input" type="number" min="0" step="0.01" placeholder="0.00" disabled={!kodeBarang}
                      value={qtySPK} onChange={e => handleQtySpkChange(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Stempel</label>
                    <select className="select" value={stempel} disabled={!kodeBarang} onChange={e => setStempel(e.target.value)}>
                      <option value="">— Pilih —</option>
                      {MF_STEMPEL_LIST.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Zona 2: Kelompok Warna/Kode Kelompok Warna, lalu AZ/Kode AZ */}
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div style={pairGrid}>
                  <div className="field">
                    <label>Kelompok Warna</label>
                    <select className="select" value={namaKelompokWarna} disabled={!kodeBarang}
                      onChange={e => { const w = MF_KELOMPOK_WARNA_LIST.find(x => x.nama === e.target.value); setNamaKelompokWarna(e.target.value); setKelompokWarna(w ? w.kode : ''); }}>
                      <option value="">— Pilih —</option>
                      {MF_KELOMPOK_WARNA_LIST.map(v => <option key={v.kode} value={v.nama}>{v.nama}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <input className="input mono" value={kelompokWarna} readOnly placeholder="Kode..." />
                  </div>
                </div>
                <div style={pairGrid}>
                  <div className="field">
                    <label>AZ</label>
                    <select className="select" value={namaAz} disabled={!kodeBarang}
                      onChange={e => { const w = MF_AZ_LIST.find(x => x.nama === e.target.value); setNamaAz(e.target.value); setAz(w ? w.kode : ''); }}>
                      <option value="">— Pilih —</option>
                      {MF_AZ_LIST.map(v => <option key={v.kode} value={v.nama}>{v.nama}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <input className="input mono" value={az} readOnly placeholder="Kode..." />
                  </div>
                </div>
              </div>

              {/* Zona 3: Brand/Kode Brand, lalu Merk Barang/Kode Merk Barang */}
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                <div style={pairGrid}>
                  <div className="field">
                    <label>Brand</label>
                    <select className="select" value={namaBrand} disabled={!kodeBarang}
                      onChange={e => { const w = MF_BRAND_LIST.find(x => x.nama === e.target.value); setNamaBrand(e.target.value); setBrand(w ? w.kode : ''); }}>
                      <option value="">— Pilih —</option>
                      {MF_BRAND_LIST.map(v => <option key={v.kode} value={v.nama}>{v.nama}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <input className="input mono" value={brand} readOnly placeholder="Kode..." />
                  </div>
                </div>
                <div style={pairGrid}>
                  <div className="field">
                    <label>Merk Barang</label>
                    <select className="select" value={namaMerkBarang} disabled={!kodeBarang}
                      onChange={e => { const w = MF_MERK_BARANG_LIST.find(x => x.nama === e.target.value); setNamaMerkBarang(e.target.value); setMerkBarang(w ? w.kode : ''); }}>
                      <option value="">— Pilih —</option>
                      {MF_MERK_BARANG_LIST.map(v => <option key={v.kode} value={v.nama}>{v.nama}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <input className="input mono" value={merkBarang} readOnly placeholder="Kode..." />
                  </div>
                </div>
              </div>

            </div>

            {/* Machine picker dual-panel */}
            <div style={{marginTop:20}}>
              <div style={{fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em',
                color:'var(--text)', marginBottom:8}}>Daftar Mesin</div>
              <div className="form-grid-2" style={{gap:12}}>
                {/* Left: all machines */}
                <div style={{opacity: kodeBarang ? 1 : .5}}>
                  <div style={panelHeadStyle}>Daftar Mesin — klik untuk pilih</div>
                  <div style={panelStyle}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr>
                          <th style={{position:'sticky', top:0, padding:'5px 8px', fontSize:11.5, fontWeight:600, textAlign:'center',
                            background:'var(--bg-elev)', borderBottom:'1px solid var(--border)', width:80}}>Selection</th>
                          <th style={{position:'sticky', top:0, padding:'5px 8px', fontSize:11.5, fontWeight:600,
                            background:'var(--bg-elev)', borderBottom:'1px solid var(--border)'}}>Nama Mesin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MF_MESIN_LIST.map(m => {
                          const selected = mesinDipilih.includes(m);
                          return (
                            <tr key={m} onClick={() => kodeBarang && toggleMesin(m)} style={{cursor: kodeBarang ? 'pointer' : 'not-allowed',
                              background: selected ? 'var(--primary-soft, #e8f0fe)' : 'transparent'}}>
                              <td style={{padding:'5px 8px', textAlign:'center', borderBottom:'1px solid var(--border)'}}>
                                <input type="checkbox" checked={selected} disabled={!kodeBarang} onChange={() => toggleMesin(m)} onClick={e => e.stopPropagation()} />
                              </td>
                              <td style={{padding:'5px 8px', borderBottom:'1px solid var(--border)', fontSize:13,
                                color: selected ? 'var(--primary)' : 'var(--text)', fontWeight: selected ? 600 : 400}}>{m}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Right: selected machines */}
                <div>
                  <div style={panelHeadStyle}>Mesin yang Dipakai — klik untuk hapus</div>
                  <div style={panelStyle}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                      <thead>
                        <tr>
                          <th style={{position:'sticky', top:0, padding:'5px 8px', fontSize:11.5, fontWeight:600, textAlign:'center',
                            background:'var(--bg-elev)', borderBottom:'1px solid var(--border)', width:80}}>Selection</th>
                          <th style={{position:'sticky', top:0, padding:'5px 8px', fontSize:11.5, fontWeight:600,
                            background:'var(--bg-elev)', borderBottom:'1px solid var(--border)'}}>Nama Mesin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mesinDipilih.length === 0 && (
                          <tr><td colSpan={2} style={{padding:'16px 8px', textAlign:'center',
                            color:'var(--text-3)', fontSize:12}}>Belum ada mesin dipilih</td></tr>
                        )}
                        {mesinDipilih.map((m) => (
                          <tr key={m} onClick={() => toggleMesin(m)} style={{cursor:'pointer'}}
                            onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background=''}>
                            <td style={{padding:'5px 8px', textAlign:'center', borderBottom:'1px solid var(--border)'}}>
                              <input type="checkbox" checked onChange={() => toggleMesin(m)} onClick={e => e.stopPropagation()} />
                            </td>
                            <td style={{padding:'5px 8px', borderBottom:'1px solid var(--border)', fontSize:13}}>{m}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Bahan — dikelola langsung di sini (bukan di tabel Barang Jadi lagi), supaya jelas
                bahan mana punya barang mana tanpa harus pindah section. */}
            <div style={{marginTop:20}} className="inline-table">
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{fontSize:14, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text)'}}>Bahan</div>
                  {brgBomFor(kodeBarang) && (
                    <span style={{fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:999, background:'var(--realisasi-soft, #dcfce7)', color:'var(--realisasi)'}}>
                      Otomatis dari BOM
                    </span>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowBahanPicker(true)}>{I.plus()} Tambah Bahan</button>
              </div>
              <div className="line-items" style={{overflowX:'auto'}}>
                <table style={{width:'100%', borderCollapse:'separate', borderSpacing:0, minWidth:640}}>
                  <thead>
                    <tr>
                      <th style={thBahanS('26px', true)}>No</th>
                      <th style={thBahanS('14%')}>Gudang</th>
                      <th style={thBahanS('20%')}>Nama</th>
                      <th style={thBahanS('16%')}>Kode</th>
                      <th style={thBahanS('14%')}>Merk</th>
                      <th style={thBahanS('12%', true)}>Jumlah SPK</th>
                      <th style={thBahanS('10%', true)}>Satuan</th>
                      <th style={thBahanS('50px', true)}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {localBahan.length === 0 && (
                      <tr><td colSpan={8} style={{padding:'20px 12px', textAlign:'center', color:'var(--text-3)', fontSize:13}}>
                        Belum ada bahan. Klik "+ Tambah Bahan" untuk menambahkan.
                      </td></tr>
                    )}
                    {localBahan.map((row, idx) => (
                      <tr key={row.id}>
                        <td style={{...tdBahanS, textAlign:'center', color:'var(--text-3)', fontSize:12}}>{idx + 1}</td>
                        <td style={tdBahanS}>
                          <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                            value={row.gudang} onChange={e => updateLocalBahan(row.id, 'gudang', e.target.value)}>
                            <option value="">— Pilih —</option>
                            {MF_GUDANG_LIST.map(g => <option key={g}>{g}</option>)}
                          </select>
                        </td>
                        <td style={tdBahanS}>{brgBomResolveKomponen(row.kodeBahan)?.namaKomponen || <span style={{color:'var(--text-3)'}}>—</span>}</td>
                        <td style={tdBahanS}><span style={{color:'var(--primary)', fontWeight:500}}>{row.kodeBahan}</span></td>
                        <td style={tdBahanS}>{row.merkBahan || <span style={{color:'var(--text-3)'}}>—</span>}</td>
                        <td style={tdBahanS}>
                          <input className="input" type="number" min="0" step="0.01"
                            style={{width:'100%', fontSize:12, padding:'3px 6px', textAlign:'right'}}
                            placeholder="0.00" value={row.jumlah}
                            onChange={e => updateLocalBahan(row.id, 'jumlah', e.target.value)} />
                        </td>
                        <td style={tdBahanS}>
                          <select className="select" style={{width:'100%', fontSize:12, padding:'3px 6px'}}
                            value={row.satuan} onChange={e => updateLocalBahan(row.id, 'satuan', e.target.value)}>
                            {MF_SATUAN_SPK.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{...tdBahanS, textAlign:'center'}}>
                          <button className="btn btn-icon btn-sm del" title="Hapus" onClick={() => removeLocalBahan(row.id)}>{I.trash()}</button>
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
      {showBarangPicker && (
        <MfPilihBarangModal single zIndex={300}
          items={BARANG_JADI.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk }))}
          onConfirm={onBarangPick} onCancel={() => setShowBarangPicker(false)} />
      )}
      {showBahanPicker && (
        <MfPilihBarangModal zIndex={300} items={bahanPickerItems} onConfirm={onBahanPick} onCancel={() => setShowBahanPicker(false)} />
      )}
      {pendingBarangPick && (
        <ConfirmationModal zIndex={300}
          title="Ganti Barang Jadi?"
          message={`Bahan yang sudah ada akan diganti mengikuti resep BOM "${pendingBarangPick.nama}". Tindakan ini tidak bisa dibatalkan setelah dilanjutkan.`}
          requireReason={false} confirmLabel="Ya, Ganti" confirmKind="danger-solid" cancelLabel="Batal"
          onConfirm={() => { applyBarangPick(pendingBarangPick); setPendingBarangPick(null); }}
          onCancel={() => setPendingBarangPick(null)}
        />
      )}
    </>
  );
}

// ─── Barang Pakai Entry Modal ─────────────────────────────────────────────────

function MfBarangPakaiEntryModal({ data, spkRows, onClose, onSave }) {
  const [kodeBarang,     setKodeBarang]     = React.useState(data?.kodeBarang     || '');
  const [namaBarang,     setNamaBarang]     = React.useState(data?.namaBarang     || '');
  const [jumlah,         setJumlah]         = React.useState(data?.jumlah         || '');
  const [satuan,         setSatuan]         = React.useState(data?.satuan         || 'MTR');
  const [sisaSebelumnya, setSisaSebelumnya] = React.useState(data?.sisaSebelumnya || '');
  const [noSpk,          setNoSpk]          = React.useState(data?.noSpk          || '');
  const [showBarangPicker, setShowBarangPicker] = React.useState(false);
  const [showSpkPicker,    setShowSpkPicker]    = React.useState(false);

  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape' && !showBarangPicker && !showSpkPicker) onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [showBarangPicker, showSpkPicker, onClose]);

  // Barang di sini = Barang Lain (BARANG_LAIN, modul Barang) — bahan penolong/lain yang dipakai
  // habis di produksi, bukan MF_BARANG lagi. Satuan ikut auto-fill dari satuanKonversi pertama
  // barang itu (brgBomResolveKomponen, sama resolver dipakai BOM) — user masih bisa mengubahnya.
  const onBarangPick = (picked) => {
    const b = picked[0];
    if (b) {
      setKodeBarang(b.kode); setNamaBarang(b.nama);
      const resolved = brgBomResolveKomponen(b.kode);
      if (resolved?.satuan) setSatuan(resolved.satuan);
    }
    setShowBarangPicker(false);
  };
  const onSpkPick    = (s) => { setNoSpk(s.no); setShowSpkPicker(false); };

  return (
    <>
      <div className="modal-backdrop" style={{zIndex:200}}>
        <div className="modal" style={{maxWidth:640}} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>{data ? 'Edit Barang' : 'Tambah Barang'}</h2>
              <div className="sub">Pilih barang dan isi detail pemakaian.</div>
            </div>
            <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
          </div>
          <div className="modal-body">
            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div style={{display:'flex', gap:8, alignItems:'flex-end', flexWrap:'wrap'}}>
                <div className="field" style={{flex:1}}>
                  <label>Nama Barang *</label>
                  <input className="input" style={{cursor:'pointer', background:'var(--bg-elev)'}} readOnly
                    placeholder="— Pilih Barang —" value={namaBarang}
                    onClick={() => setShowBarangPicker(true)} />
                </div>
                <div className="field" style={{width:220}}>
                  <label>Kode Barang</label>
                  <input className="input mono" value={kodeBarang} readOnly placeholder="Otomatis" />
                </div>
              </div>
              <div className="form-grid-px3b" style={{gap:10}}>
                <div className="field">
                  <label>Jumlah *</label>
                  <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                    value={jumlah} onChange={e => setJumlah(e.target.value)} />
                </div>
                <div className="field">
                  <label>Satuan</label>
                  <select className="select" value={satuan} onChange={e => setSatuan(e.target.value)}>
                    {['MTR','PCS','LBR','KG'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Sisa Sebelumnya</label>
                  <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                    value={sisaSebelumnya} onChange={e => setSisaSebelumnya(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>No. SPK (Referensi)</label>
                <div style={{display:'flex', gap:4}}>
                  <input className="input mono" style={{flex:1, cursor:'pointer', background:'var(--bg-elev)'}} readOnly
                    placeholder="— Pilih SPK —" value={noSpk}
                    onClick={() => setShowSpkPicker(true)} />
                  {noSpk && <button className="btn btn-icon" title="Hapus" onClick={() => setNoSpk('')}>{I.x(14)}</button>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <div className="muted"><kbd>Esc</kbd> Untuk Batal</div>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={onClose}>Tutup</button>
              <button className="btn btn-primary"
                onClick={() => onSave({ kodeBarang, namaBarang, jumlah, satuan, sisaSebelumnya, noSpk })}>
                {I.check()} Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
      {showBarangPicker && (
        <MfPilihBarangModal single zIndex={300}
          items={BARANG_LAIN.map(b => ({ kode:b.kodeProduk, nama:b.namaProduk }))}
          onConfirm={onBarangPick} onCancel={() => setShowBarangPicker(false)} />
      )}
      {showSpkPicker && (
        <MfSpkPickerModal rows={spkRows} onPick={onSpkPick} onClose={() => setShowSpkPicker(false)} />
      )}
    </>
  );
}
