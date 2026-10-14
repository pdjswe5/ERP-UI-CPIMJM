// Keuangan (sub-area Akuntan) — komponen & helper bersama (header, modal shell, konversi tanggal,
// lookup akun). Dipindah dari modules/akuntan/ (sekarang bagian dari modul Keuangan yang digabung,
// Akuntan bukan lagi tab navigasi berdiri sendiri).
//
// PENTING: AkModalShell dipakai langsung oleh KeuanganPage.jsx (Kas/Bank/Giro/Transfer/Pelunasan)
// dari scope global tanpa import — nama & signature-nya HARUS tetap persis seperti ini.

function AkHeader({ title, sub, onAdd, addLabel='Tambah', extra }) {
  return (
    <div className="page-head">
      <div><h1>{title}</h1><div className="sub">{sub}</div></div>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="btn btn-sm" onClick={()=>window.__erpToast && window.__erpToast('Data diperbarui.')}>{I.refresh()} Refresh</button>
        <button className="btn btn-sm" onClick={()=>window.__erpToast && window.__erpToast('Fitur export akan tersedia pada integrasi backend.')}>{I.download()} Export</button>
        {extra}
        {onAdd && <button className="btn btn-primary" onClick={onAdd}>{I.plus()} {addLabel}</button>}
      </div>
    </div>
  );
}

function AkModalShell({ title, sub, onClose, onSave, children, saveLabel='Simpan', wide=false, saveDisabled=false, maxWidth }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth: maxWidth || (wide?1100:680)}}>
        <div className="modal-head">
          <div><h2>{title}</h2>{sub && <div className="sub">{sub}</div>}</div>
          <button className="btn btn-icon" onClick={onClose}>{I.x(16)}</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">
          <div className="muted" style={{fontSize:12.5}}><kbd>Esc</kbd> untuk batal</div>
          <div className="right" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={onSave} disabled={saveDisabled}>{I.check()} {saveLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Seed & <input type="date"> pakai format berbeda: data Akuntan (AKTIVA.tglBeli/tglJual,
// JURNAL_MEMO.tgl) disimpan "DD-MM-YYYY" (dipakai langsung di tabel list), sedangkan
// <input type="date"> HANYA menerima/mengembalikan "YYYY-MM-DD" — tanpa konversi ini date picker
// selalu tampil kosong saat mode Edit (bug yang sudah ada sebelum modularisasi ini).
function akToIso(dmy) {
  if (!dmy) return '';
  const [d, m, y] = dmy.split('-');
  if (!d || !m || !y) return '';
  return `${y}-${m}-${d}`;
}
function akFromIso(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!d || !m || !y) return '';
  return `${d}-${m}-${y}`;
}

// Lookup nama akun dari kode — dipakai Cetak Jurnal Memorial (baris debit/kredit cuma nyimpan
// kode akun, bukan nama) dan JurnalModal (menampilkan nama akun terpilih di dropdown).
function akAkunNama(kode, akunRows) {
  const a = (akunRows || AKUN_BB).find(x => x.kode === kode);
  return a ? a.name : kode;
}
