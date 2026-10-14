// Payroll — Mutasi Karyawan: drill-down per-karyawan (dibuka dari tombol "Mutasi" di baris
// KaryawanPage). Kiri = histori tanggal mutasi (klik pilih, baca-saja krn histori tidak diedit),
// tengah = Detil (FK dropdown ke 9 master Master Data Payroll), kanan = Komponen Gaji Baru/Lama +
// kolom kanan-jauh — field & nilai persis screenshot referensi (lihat mutasi.data.jsx). "Tambah
// Mutasi Baru" BUKAN aksi destruktif (nambah histori, bukan replace) makanya tidak lewat
// ConfirmationModal spt pola "Ganti No.SO"/"Ganti Barang Jadi" — nilai "Baru" terakhir otomatis
// disalin jadi "Lama" pada record baru (pola sama auto-fill BOM di MfBarangJadiEntryModal), dgn
// "Berlaku S/d" = 1 hari sebelum tanggal mutasi baru.

function prDayBefore(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function prFmtTgl(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

const PR_KOMPONEN_FIELDS = [
  { key:'gajiPokok', label:'Gaji Pokok' },
  { key:'premiHadir', label:'Premi Hadir' },
  { key:'premiBulanan', label:'Premi Bulanan' },
  { key:'premiKhlerPerHari', label:'Premi Khler Per Hari' },
  { key:'tunjanganTetap', label:'Tunjangan Tetap' },
  { key:'upahPerhari', label:'Upah Perhari' },
  { key:'tarifLembur', label:'Tarif Lembur' },
  { key:'gajiPokokPlus', label:'Gaji Pokok (+)' },
];

const PR_FARRIGHT_FIELDS = [
  { key:'gajiAstek', label:'Gaji ASTEK' },
  { key:'gajiBpjsK', label:'Gaji BPJS-K' },
  { key:'tunjJabatan', label:'Tunj. Jabatan' },
  { key:'fixedCost', label:'Fixed Cost' },
  { key:'tunjInsentif', label:'Tunj. Insentif' },
  { key:'terimaLain', label:'Terima Lain' },
  { key:'variableCost', label:'Variable Cost' },
  { key:'potUpah', label:'Pot. Upah' },
  { key:'potSpsi', label:'Pot. SPSI' },
  { key:'potBpjsTk', label:'Pot. BPJS-TK' },
  { key:'potBpjsKes', label:'Pot. BPJS-Kes' },
  { key:'potLainLain', label:'Pot. Lain-lain' },
  { key:'potPensiun', label:'Pot. Pensiun' },
  { key:'pph', label:'PPh %' },
];

function prFkSelect(label, value, onChange, options, disabled, opts = {}) {
  return (
    <div className="field" key={label}>
      <label>{label}{opts.required && <span style={{color:'var(--danger)'}}> *</span>}</label>
      <select className="select" value={value || ''} disabled={disabled} onChange={e=>onChange(e.target.value)}>
        <option value="">— Pilih —</option>
        {options.map(o => <option key={o.kode} value={o.kode}>{o.kode} - {o.nama || o.keterangan}</option>)}
      </select>
    </div>
  );
}

function MutasiKaryawanModal({ karyawan, mutasiRows, onClose, onSave }) {
  const history = mutasiRows.filter(m => m.noInduk === karyawan.noInduk).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
  const latest = history[0] || null;

  const blankDraft = () => ({
    tanggal: new Date().toISOString().slice(0,10),
    unit: latest?.unit || '01', kodeDivisi: latest?.kodeDivisi || '', kodeStatus: latest?.kodeStatus || '',
    kodeDepartemen: latest?.kodeDepartemen || '', kodeBagian: latest?.kodeBagian || '',
    kodeJabatan: latest?.kodeJabatan || '', kodeKelompok: latest?.kodeKelompok || '',
    kodeWaktuKerja: latest?.kodeWaktuKerja || '', grade: latest?.grade || '', kodeGolongan: latest?.kodeGolongan || '',
    potBpjsTkPct: latest?.potBpjsTkPct || 0, potBpjsKesPct: latest?.potBpjsKesPct || 0,
    tidakLembur: latest?.tidakLembur || false, hitungJabatan: latest?.hitungJabatan || false, keterangan:'',
    komponenBaru: prKomponen(),
    komponenLama: latest ? { ...latest.komponenBaru, berlakuSd:'' } : prKomponen(),
    gajiAstek: latest?.gajiAstek || 0, gajiBpjsK: latest?.gajiBpjsK || 0, tunjJabatan: latest?.tunjJabatan || 0,
    fixedCost: latest?.fixedCost || 0, tunjInsentif: latest?.tunjInsentif || 0, terimaLain: latest?.terimaLain || 0,
    variableCost: latest?.variableCost || 0, potUpah: latest?.potUpah || 0, potSpsi: latest?.potSpsi || 0,
    potBpjsTk: latest?.potBpjsTk || 0, potBpjsKes: latest?.potBpjsKes || 0, potLainLain: latest?.potLainLain || 0,
    potPensiun: latest?.potPensiun || 0, pph: latest?.pph || 0,
  });

  const [isNew, setIsNew] = React.useState(history.length === 0);
  const [selectedId, setSelectedId] = React.useState(latest?.id || null);
  const [draft, setDraft] = React.useState(blankDraft());

  const selectHistory = (id) => { setIsNew(false); setSelectedId(id); };
  const startNew = () => { setDraft(blankDraft()); setIsNew(true); setSelectedId(null); };

  const view = isNew ? draft : (history.find(h => h.id === selectedId) || draft);
  const disabled = !isNew;

  const setField = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const setKomponenBaru = (key, v) => setDraft(d => ({ ...d, komponenBaru: { ...d.komponenBaru, [key]: v } }));

  const save = () => {
    if (!draft.tanggal || !draft.kodeBagian) { window.__erpToast && window.__erpToast('Tanggal & Bagian wajib diisi.'); return; }
    const record = {
      ...draft,
      id: Date.now(),
      noInduk: karyawan.noInduk,
      komponenLama: latest ? { ...draft.komponenLama, berlakuSd: prDayBefore(draft.tanggal) } : draft.komponenLama,
    };
    onSave(record);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:1280, width:'96vw'}}>
        <div className="modal-head">
          <div>
            <h2>Mutasi Karyawan</h2>
            <div className="sub">Karyawan : <span className="mono">{karyawan.noInduk}</span> - {karyawan.nama}</div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body" style={{maxHeight:'74vh', overflow:'auto'}}>
          <div className="pr-mutasi-layout">
            <div className="pr-mutasi-col-hist">
              <button className="btn btn-primary btn-sm" onClick={startNew}>{I.plus(14)} Mutasi Baru</button>
              <div className="muted" style={{fontSize:12, marginTop:8, fontWeight:600}}>Histori Mutasi</div>
              {history.length === 0 && <div className="muted" style={{fontSize:12.5}}>Belum ada histori mutasi.</div>}
              {history.map((h, i) => (
                <button key={h.id} onClick={()=>selectHistory(h.id)} style={{
                  textAlign:'left', padding:'8px 10px', borderRadius:8, border:'1px solid var(--border)', cursor:'pointer', fontSize:13,
                  background: (!isNew && selectedId===h.id) ? 'var(--primary)' : 'var(--bg-sub)',
                  color: (!isNew && selectedId===h.id) ? '#fff' : 'var(--text)',
                }}>
                  <div style={{fontWeight:600}}>{prFmtTgl(h.tanggal)}</div>
                  {i === 0 && <div style={{fontSize:11, opacity:.8}}>Aktif saat ini</div>}
                </button>
              ))}
            </div>

            <div className="pr-mutasi-divider" />

            <div className="pr-mutasi-col-detail">
              <div className="muted" style={{fontSize:12, fontWeight:600, marginBottom:8}}>Detil {isNew ? '(Mutasi Baru)' : ''}</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div className="field">
                  <label>Tanggal<span style={{color:'var(--danger)'}}> *</span></label>
                  <input className="input" type="date" disabled={disabled} value={view.tanggal || ''} onChange={e=>setField('tanggal', e.target.value)} />
                </div>
                {prFkSelect('Unit', view.unit, v=>setField('unit', v), PR_UNIT, disabled)}
                {prFkSelect('Divisi', view.kodeDivisi, v=>setField('kodeDivisi', v), PR_DIVISI, disabled)}
                {prFkSelect('Status', view.kodeStatus, v=>setField('kodeStatus', v), PR_STATUS, disabled)}
                {prFkSelect('Departemen', view.kodeDepartemen, v=>setField('kodeDepartemen', v), PR_DEPARTEMEN, disabled)}
                {prFkSelect('Bagian', view.kodeBagian, v=>setField('kodeBagian', v), PR_BAGIAN, disabled, {required:true})}
                {prFkSelect('Jabatan', view.kodeJabatan, v=>setField('kodeJabatan', v), PR_JABATAN, disabled)}
                {prFkSelect('Kelompok', view.kodeKelompok, v=>setField('kodeKelompok', v), PR_KELOMPOK, disabled)}
                {prFkSelect('Waktu Kerja', view.kodeWaktuKerja, v=>setField('kodeWaktuKerja', v), PR_WAKTU_KERJA, disabled)}
                <div className="field"><label>Grade</label><input className="input" disabled={disabled} value={view.grade || ''} onChange={e=>setField('grade', e.target.value)} /></div>
                {prFkSelect('Golongan', view.kodeGolongan, v=>setField('kodeGolongan', v), PR_GOLONGAN, disabled)}
                <div className="field"><label>Pot. BPJS-TK %</label><input className="input" type="number" disabled={disabled} value={view.potBpjsTkPct || 0} onChange={e=>setField('potBpjsTkPct', +e.target.value)} /></div>
                <div className="field"><label>Pot. BPJS-Kes %</label><input className="input" type="number" disabled={disabled} value={view.potBpjsKesPct || 0} onChange={e=>setField('potBpjsKesPct', +e.target.value)} /></div>
              </div>
              <div style={{display:'flex', gap:16, margin:'10px 0'}}>
                <label style={{display:'flex', alignItems:'center', gap:6, fontSize:13}}>
                  <input type="checkbox" disabled={disabled} checked={!!view.tidakLembur} onChange={e=>setField('tidakLembur', e.target.checked)} /> Tidak Lembur
                </label>
                <label style={{display:'flex', alignItems:'center', gap:6, fontSize:13}}>
                  <input type="checkbox" disabled={disabled} checked={!!view.hitungJabatan} onChange={e=>setField('hitungJabatan', e.target.checked)} /> Hitung Jabatan
                </label>
              </div>
              <div className="field"><label>Keterangan</label><textarea className="textarea" disabled={disabled} value={view.keterangan || ''} onChange={e=>setField('keterangan', e.target.value)} /></div>
            </div>

            <div className="pr-mutasi-divider" />

            <div className="pr-mutasi-col-komponen">
              <div className="muted" style={{fontSize:12, fontWeight:600, marginBottom:8}}>Komponen Gaji</div>
              <div style={{display:'flex', gap:16}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5, fontWeight:700, color:'var(--primary)', marginBottom:6}}>Baru</div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {PR_KOMPONEN_FIELDS.map(f => (
                      <div className="field" key={f.key}>
                        <label style={{fontSize:12}}>{f.label}</label>
                        <input className="input" type="number" disabled={disabled} value={view.komponenBaru?.[f.key] || 0} onChange={e=>setKomponenBaru(f.key, +e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5, fontWeight:700, color:'var(--text-3)', marginBottom:6}}>Lama</div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {PR_KOMPONEN_FIELDS.map(f => (
                      <div className="field" key={f.key}>
                        <label style={{fontSize:12}}>{f.label}</label>
                        <input className="input" type="number" disabled value={view.komponenLama?.[f.key] || 0} />
                      </div>
                    ))}
                    <div className="field">
                      <label style={{fontSize:12}}>Berlaku S/d</label>
                      <input className="input" disabled value={view.komponenLama?.berlakuSd ? prFmtTgl(view.komponenLama.berlakuSd) : '—'} />
                    </div>
                  </div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12.5, fontWeight:700, marginBottom:6}}>Tunjangan &amp; Potongan Lain</div>
                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {PR_FARRIGHT_FIELDS.map(f => (
                      <div className="field" key={f.key}>
                        <label style={{fontSize:12}}>{f.label}</label>
                        <input className="input" type="number" disabled={disabled} value={view[f.key] || 0} onChange={e=>setField(f.key, +e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}>
            {isNew ? 'Komponen "Lama" otomatis diisi dari mutasi terakhir.' : 'Histori mutasi bersifat baca-saja.'}
          </div>
          <div className="right" style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Tutup</button>
            {isNew && <button className="btn btn-primary" onClick={save}>{I.check()} Simpan Mutasi</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
