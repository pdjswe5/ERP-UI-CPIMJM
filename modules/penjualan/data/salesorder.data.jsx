// Penjualan — data & config Sales Order (SO)
//
// Status SO dihitung otomatis dari realisasi barang (lihat soComputeStatus/soStatusPill di bawah),
// sama seperti pola Pembelian — kecuali "Selesai Manual" yang merupakan override manual (aksi
// "Selesaikan Manual"). 5 kemungkinan: Belum Realisasi / Selesai Sebagian / Selesai / Selesai Manual / Batal.
// Referensi ke Konfirmasi Order tetap di header (field No_Ko, relasi 1-ke-1 KO<->SO).

// Kode_Item sekarang dari BARANG_JADI (modul Barang — JD-xxx/PU-xxx, SEMUANYA sudah punya BOM,
// lihat modules/barang/data/bom.data.jsx) supaya saat SPK "Buat dari SO" (MfSoPickerModal di
// SpkPage.jsx), Bahan-nya bisa auto-fill langsung dari resep BOM. Sebelumnya kode di sini dari
// BARANG (inventory.jsx, katalog sparepart Penjualan) yang sama sekali tidak nyambung ke Barang
// Jadi manufaktur — fallback ke katalog itu tetap ada kalau ada pemanggil lama yang masih pakai
// kode P-xxx (Barang module dimuat lebih dulu dari Penjualan di index.html, jadi BARANG_JADI sudah
// tersedia saat file ini di-parse).
function soItem(kode, jumlah, disc1, discRp, realisasi=0, deskripsi='') {
  const bj = BARANG_JADI.find(b => b.kodeProduk === kode);
  const produk = bj ? null : BARANG.find(b => b.code === kode);
  return {
    Kode_Item:kode, Nama_Item: bj ? bj.namaProduk : (produk ? produk.name : ''), Deskripsi:deskripsi,
    Jumlah:jumlah, Realisasi:realisasi, Konversi:1, Satuan:'PCS',
    Hrg_Sat: bj ? (bj.hppStandar || 0) : (produk ? (produk.hpp || produk.hargaBeli || 0) : 0),
    DiscPros_Det:disc1, DiscNilai_Det:discRp,
  };
}

function soJasaItem(kode, nama, jumlah, harga, deskripsi='') {
  return { Kode_Item:kode, Nama_Item:nama, Deskripsi:deskripsi, Jumlah:jumlah, Satuan:'PCS', Hrg_Sat:harga, DiscPros_Det:0, DiscNilai_Det:0 };
}

function soHead(no, tgl, custCode, salesName, kreditTunai, tempo, ket, details, details2, opts={}) {
  const cust = PJ_PELANGGAN.find(p => p.code === custCode);
  const salesIdx = PJ_SALES_LIST.indexOf(salesName);
  const kasbank = opts.kasbank ? PJ_KASBANK.find(k => k.kode === opts.kasbank) : null;
  return {
    No_Bukti:no, Tgl_Bukti:tgl, No_Referensi: opts.noReferensi || '',
    Kode_Cust:custCode, Nama_Cust: cust ? cust.name : custCode,
    Kode_Sales: salesIdx >= 0 ? `SL00${salesIdx+1}` : (cust ? cust.kodeSales || '' : ''), Nama_Sales:salesName,
    Kredit_Tunai:kreditTunai, Tempo:tempo, TempoLama: opts.tempoLama ?? tempo, TempoCetak: opts.tempoCetak ?? tempo,
    Kode_Kasbank: kreditTunai === 'TUNAI' ? (kasbank ? kasbank.kode : '') : '',
    Nama_Kasbank: kreditTunai === 'TUNAI' ? (kasbank ? kasbank.nama : '') : '',
    JualCoil: opts.jualCoil || 'N', Tgl_Kirim: opts.tglKirim || tgl,
    Alamat_Kirim: opts.alamatKirim || (cust ? cust.alamat : ''),
    Keterangan:ket, PPN:11, PPN_Include:false, DiscPros_Head: opts.disc ?? 0, DiscNilai_Head: opts.discRp ?? 0,
    Nm_Kirim: opts.nmKirim || (cust ? cust.namaPemesan : ''), Kt_Kirim: opts.ktKirim || (cust ? cust.kota : ''), Tel_Kirim: opts.telKirim || (cust ? cust.tel : ''),
    Locofranco: opts.incoterm || 'Franco', Klasifikasi: opts.klasifikasi || (cust ? cust.klasifikasi : ''),
    Kode_Spv: opts.kodeSpv || '', Nama_Spv: opts.namaSpv || '',
    Proyek: opts.proyek || '', No_Po: opts.noPo || '', No_Ko: opts.noKo || '', Expedisi: opts.expedisi || '',
    Status: opts.status || '', Alasan_Status: opts.alasanStatus || '', Batal: !!opts.batal, Alasan_Batal: opts.alasanBatal || '',
    Creator: opts.creator || 'PDJ Administrator', Jam_Create:`${tgl}T09:30:00`, Editor: opts.editor ?? 'PDJ Administrator', Jam_Edit: opts.editor === '' ? null : `${tgl}T10:15:00`,
    Details:details, Details2: [],
  };
}

const SALES_ORDER_SEED = [
  soHead('KSO26070001', '2026-07-09', 'b7364', 'Sales Baru 2', 'KREDIT', 14, 'Order rutin bulanan', [
    soItem('JD-001', 20, 0, 0, 0),
    soItem('JD-002', 15, 0, 0, 0),
    soItem('JD-003', 30, 0, 0, 0),
    soItem('JD-004', 25, 0, 0, 0),
    soItem('JD-005', 10, 0, 0, 0),
  ], [], { noKo:'KKO20260001', creator:'Ucup', editor:'' }),
  soHead('FSO26070002', '2026-07-10', 'C001', 'Sales Senior', 'TUNAI', 0, '', [
    soItem('JD-006', 8, 5, 0, 8),
    soItem('JD-007', 4, 0, 0, 4),
    soItem('JD-008', 6, 0, 0, 2),
    soItem('JD-009', 12, 0, 0, 12),
    soItem('JD-010', 5, 0, 0, 0),
    soItem('PU-001', 3, 0, 0, 3),
  ], [
    soJasaItem('JASA-01', 'Biaya Pemasangan', 1, 250000),
  ], { noKo:'KKO20260003', noPo:'PO-SJS-9981', expedisi:'Indah Cargo', kasbank:'1005.001' }),
  soHead('KSO26070003', '2026-07-05', 'C012', 'Sales Junior 1', 'KREDIT', 30, 'Dibatalkan, customer batal order', [
    soItem('JD-011', 10, 0, 0, 0),
    soItem('JD-012', 6, 0, 0, 0),
    soItem('JD-013', 12, 0, 0, 0),
    soItem('JD-014', 8, 0, 0, 0),
    soItem('JD-015', 5, 0, 0, 0),
  ], [], { proyek:'Proyek Pergudangan Blok A', batal:true, alasanStatus:'Customer membatalkan pesanan' }),
  soHead('KSO26070004', '2026-07-11', 'g123', 'Sales Junior 2', 'KREDIT', 21, 'Order proyek renovasi armada', [
    soItem('JD-016', 20, 5, 0, 20),
    soItem('JD-017', 12, 0, 0, 12),
    soItem('JD-018', 16, 0, 0, 16),
    soItem('JD-019', 18, 0, 0, 18),
    soItem('JD-020', 6, 0, 0, 6),
    soItem('PU-002', 4, 0, 0, 4),
    soItem('PU-003', 40, 0, 0, 40),
  ], [
    soJasaItem('JASA-02', 'Biaya Jasa Service', 1, 500000),
  ], { noKo:'KKO20260004' }),
  soHead('FSO26070005', '2026-07-12', 'H01', 'Sales Baru 2', 'TUNAI', 0, 'Order stok toko cabang', [
    soItem('PU-004', 10, 0, 0, 0),
    soItem('PU-005', 4, 0, 0, 0),
    soItem('PU-006', 8, 0, 0, 0),
    soItem('PU-007', 10, 0, 0, 0),
    soItem('PU-008', 20, 0, 0, 0),
    soItem('PU-009', 12, 0, 0, 0),
    soItem('PU-010', 6, 0, 0, 0),
  ], [], { kasbank:'1005.000' }),
  soHead('KSO26070006', '2026-07-13', 'KV001', 'Sales Senior', 'KREDIT', 14, 'Order ditutup manual, sisa dibatalkan customer', [
    soItem('JD-001', 15, 0, 0, 0),
    soItem('JD-002', 10, 0, 0, 0),
    soItem('JD-003', 20, 0, 0, 0),
    soItem('JD-004', 8, 0, 0, 0),
    soItem('JD-005', 15, 0, 0, 0),
  ], [], { noKo:'KKO20260006', status:'SELESAI', alasanStatus:'Sisa order dibatalkan customer, ditutup manual oleh operator' }),
  soHead('KSO26070007', '2026-07-14', 'L001', 'Sales Junior 1', 'KREDIT', 30, 'Order bertahap, pengiriman dicicil', [
    soItem('JD-006', 14, 5, 0, 14),
    soItem('JD-007', 8, 0, 0, 4),
    soItem('JD-008', 12, 0, 0, 0),
    soItem('JD-009', 10, 0, 0, 10),
    soItem('JD-010', 5, 0, 0, 0),
    soItem('JD-011', 3, 0, 0, 3),
    soItem('JD-012', 25, 0, 0, 10),
    soItem('JD-013', 8, 0, 0, 0),
    soItem('JD-014', 2, 0, 0, 2),
  ], [
    soJasaItem('JASA-01', 'Biaya Pemasangan', 1, 250000),
    soJasaItem('JASA-03', 'Biaya Pengiriman Ekspres', 1, 175000),
  ], { noKo:'KKO20260007' }),
  soHead('FSO26070008', '2026-07-15', 'L002', 'Sales Junior 2', 'TUNAI', 0, 'Order aksesoris lengkap', [
    soItem('PU-011', 15, 0, 0, 15),
    soItem('PU-012', 30, 0, 0, 30),
    soItem('PU-013', 20, 0, 0, 20),
    soItem('PU-014', 10, 0, 0, 10),
    soItem('PU-015', 6, 0, 0, 6),
    soItem('PU-016', 16, 0, 0, 16),
  ], [], { kasbank:'1005.003' }),
  soHead('KSO26070009', '2026-07-16', 'L015', 'Sales Baru 2', 'KREDIT', 21, 'Dibatalkan, stok tidak tersedia', [
    soItem('PU-017', 6, 0, 0, 0),
    soItem('PU-018', 4, 0, 0, 0),
    soItem('PU-019', 3, 0, 0, 0),
    soItem('PU-020', 5, 0, 0, 0),
    soItem('JD-015', 8, 0, 0, 0),
  ], [], { batal:true, alasanBatal:'Stok tidak tersedia, order dibatalkan' }),
  soHead('KSO26070010', '2026-07-17', 'p12345', 'Sales Senior', 'KREDIT', 14, 'Order besar proyek gudang utama', [
    soItem('JD-016', 30, 0, 0, 30),
    soItem('JD-017', 20, 5, 0, 20),
    soItem('JD-018', 12, 0, 0, 12),
    soItem('JD-019', 18, 0, 0, 18),
    soItem('JD-020', 22, 0, 0, 22),
    soItem('PU-001', 8, 0, 0, 8),
    soItem('PU-002', 5, 0, 0, 5),
    soItem('PU-003', 45, 0, 0, 45),
    soItem('PU-004', 14, 0, 0, 14),
    soItem('PU-005', 5, 0, 0, 5),
    soItem('PU-006', 10, 0, 0, 10),
    soItem('PU-007', 12, 0, 0, 12),
  ], [
    soJasaItem('JASA-02', 'Biaya Jasa Service', 2, 500000),
  ], { noKo:'KKO20260010', expedisi:'Indah Cargo' }),

  // 6 SO tambahan (khusus BELUM_REALISASI/SELESAI_SEBAGIAN) — supaya MfSoPickerModal (SpkPage.jsx,
  // filter status: SO yang masih bisa jadi SPK cuma yang belum/baru sebagian direalisasi produksi)
  // punya pilihan lebih variatif; sebelumnya cuma 4 dari 10 SO seed yang lolos filter itu.
  soHead('FSO26070011', '2026-07-18', 'P105', 'Sales Junior 2', 'TUNAI', 0, 'Order pertama customer baru', [
    soItem('JD-001', 12, 0, 0, 0),
    soItem('JD-003', 8, 0, 0, 0),
    soItem('PU-002', 5, 0, 0, 0),
  ], [], { kasbank:'1005.002' }),
  soHead('KSO26070012', '2026-07-18', 'R003', 'Sales Baru 2', 'KREDIT', 14, 'Order restock reguler', [
    soItem('JD-006', 10, 0, 0, 10),
    soItem('JD-007', 6, 0, 0, 3),
    soItem('JD-008', 4, 0, 0, 0),
  ], [], { noKo:'KKO20260012' }),
  soHead('FSO26070013', '2026-07-19', 'T201', 'Sales Senior', 'TUNAI', 0, 'Order awal kerjasama', [
    soItem('PU-005', 6, 0, 0, 0),
    soItem('PU-006', 4, 0, 0, 0),
    soItem('JD-010', 10, 0, 0, 0),
  ], [], { kasbank:'1005.000' }),
  soHead('KSO26070014', '2026-07-20', 'PT07', 'Sales Junior 1', 'KREDIT', 30, 'Order proyek renovasi kantor', [
    soItem('JD-016', 15, 0, 0, 15),
    soItem('JD-017', 10, 0, 0, 5),
    soItem('JD-018', 8, 0, 0, 0),
    soItem('PU-003', 20, 0, 0, 20),
  ], [], { noKo:'KKO20260014', proyek:'Proyek Renovasi Kantor Pusat' }),
  soHead('KSO26070015', '2026-07-21', 'S101', 'Sales Senior', 'KREDIT', 14, 'Order rutin mingguan toko', [
    soItem('JD-002', 10, 0, 0, 0),
    soItem('JD-004', 15, 0, 0, 0),
    soItem('JD-005', 8, 0, 0, 0),
    soItem('PU-001', 6, 0, 0, 0),
  ], []),
  soHead('FSO26070016', '2026-07-22', 'L0151', 'Sales Junior 2', 'TUNAI', 0, 'Order lanjutan, sebagian sudah dikirim', [
    soItem('PU-011', 12, 0, 0, 12),
    soItem('PU-012', 20, 0, 0, 8),
    soItem('JD-019', 6, 0, 0, 0),
  ], [], { kasbank:'1005.001' }),
];

function soComputeStatus(row) {
  if (row.Batal || row.Status === 'BATAL') return 'BATAL';
  if (row.Status === 'SELESAI') return 'SELESAI_MANUAL';
  const details = row.Details || [];
  if (details.length === 0) return 'BELUM_REALISASI';
  const realizedCount = details.filter(d => (+d.Realisasi || 0) > 0).length;
  const fullyRealizedCount = details.filter(d => (+d.Jumlah || 0) > 0 && (+d.Realisasi || 0) >= (+d.Jumlah || 0)).length;
  if (fullyRealizedCount === details.length) return 'SELESAI';
  if (realizedCount > 0) return 'SELESAI_SEBAGIAN';
  return 'BELUM_REALISASI';
}

function soStatusPill(row) {
  const s = soComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

// "Buat SO dari KO" — mengambil semua data relevan dari 1 dokumen Konfirmasi Penjualan (KO) dan
// menuangkannya ke form SO yang sedang dibuat (hanya berlaku saat CREATE, sebelum SO disimpan).
function soApplyKoData(set, ko) {
  const custByCode = PJ_PELANGGAN.find(p => p.code === ko.kodeCustomer) || PJ_PELANGGAN.find(p => p.name === ko.customer);
  const salesMatch = PJ_SALES.find(s => s.nama === ko.sales);
  const iu = ko.informasiUmum || {};
  const bayar = ko.pembayaran || {};
  set('No_Ko', ko.noBukti);
  set('Nama_Cust', ko.customer || '');
  set('Kode_Cust', ko.kodeCustomer || (custByCode ? custByCode.code : ''));
  set('Nama_Sales', ko.sales || '');
  set('Kode_Sales', salesMatch ? salesMatch.kode : (custByCode ? custByCode.kodeSales || '' : ''));
  set('Kredit_Tunai', ko.caraBayar || '');
  set('Tempo', bayar.tempo || 0);
  set('TempoLama', bayar.tempo || 0);
  set('TempoCetak', bayar.tempo || 0);
  set('No_Referensi', iu.noRef || '');
  set('Alamat_Kirim', iu.alamatPengiriman || '');
  set('Locofranco', iu.incoterm || '');
  set('Klasifikasi', iu.klasifikasi || '');
  set('Keterangan', iu.keterangan || '');
  set('Details', (ko.barang || []).map(b => ({
    Kode_Item:b.Kode_Item, Nama_Item:b.Nama_Item, Deskripsi:b.Deskripsi || '', Jumlah:b.Jumlah || 0, Realisasi:0,
    Konversi:1, Satuan:b.Satuan || 'PCS', Hrg_Sat:b.Hrg_Sat || 0, DiscPros_Det:0, DiscNilai_Det:0,
  })));
  set('Details2', (ko.biaya || []).map(b => ({
    Kode_Item:b.Kode_Item || '', Nama_Item:b.Nama_Item || '', Deskripsi:b.Deskripsi || '', Jumlah:b.Jumlah || 0,
    Satuan:b.Satuan || '', Hrg_Sat:b.Hrg_Sat || 0, DiscPros_Det:0, DiscNilai_Det:0,
  })));
}

function soClearKoData(set) {
  set('No_Ko', ''); set('Nama_Cust', ''); set('Kode_Cust', ''); set('Nama_Sales', ''); set('Kode_Sales', '');
  set('Kredit_Tunai', ''); set('Tempo', 0); set('TempoLama', 0); set('TempoCetak', 0);
  set('No_Referensi', ''); set('Alamat_Kirim', ''); set('Locofranco', ''); set('Klasifikasi', ''); set('Keterangan', '');
  set('Details', []); set('Details2', []);
}

// Picker dokumen Konfirmasi Penjualan (pilih satu) — dipakai tombol "Buat SO dari KO"/"Ganti Data KO".
function KoDocPickerModal({ list, onCancel, onConfirm }) {
  const [q, setQ] = React.useState('');
  const filtered = React.useMemo(() => {
    if (!q) return list;
    const ql = q.toLowerCase();
    return list.filter(k => k.noBukti.toLowerCase().includes(ql) || (k.customer || '').toLowerCase().includes(ql));
  }, [list, q]);
  return (
    <div className="modal-backdrop" style={{zIndex:110}}>
      <div className="modal item-picker-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h2>Pilih Konfirmasi Penjualan</h2><button className="btn btn-icon" onClick={onCancel}>{I.x(16)}</button></div>
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
                {filtered.map(k => (
                  <tr key={k.noBukti} style={{cursor:'pointer'}} onClick={()=>onConfirm(k)}>
                    <td className="mono">{k.noBukti}</td>
                    <td>{k.customer}</td>
                    <td>{k.tglBukti}</td>
                    <td>{koStatusPill(k)}</td>
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

function soKoBannerFactory(konfirmasiList) {
  return function SoKoBanner({ form, set, isCreate }) {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    if (!isCreate) return null;
    const hasKo = !!form.No_Ko;
    return (
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <div className="muted" style={{fontSize:12.5}}>
          {hasKo ? `Data diambil dari Konfirmasi Penjualan: ${form.No_Ko}` : 'Isi manual, atau ambil data dari Konfirmasi Penjualan yang sudah ada.'}
        </div>
        <div style={{display:'flex', gap:8}}>
          {hasKo && <button type="button" className="btn btn-sm" onClick={()=>soClearKoData(set)}>{I.x(14)} Clear Data KO</button>}
          <button type="button" className="btn btn-primary btn-sm" onClick={()=>setPickerOpen(true)}>{I.plus()} {hasKo ? 'Ganti Data KO' : 'Buat SO dari KO'}</button>
        </div>
        {pickerOpen && (
          <KoDocPickerModal
            list={konfirmasiList}
            onCancel={()=>setPickerOpen(false)}
            onConfirm={(ko)=>{ soApplyKoData(set, ko); setPickerOpen(false); }}
          />
        )}
      </div>
    );
  };
}

function salesOrderTabs(konfirmasiList) {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', TopComponent: soKoBannerFactory(konfirmasiList), fields:[
      { key:'No_Bukti', label:'No. Bukti', mono:true, readOnly:true },
      { key:'Tgl_Bukti', label:'Tgl. Bukti', type:'date', required:true },
      { key:'Nama_Cust', label:'Nama Customer', type:'select', required:true, span:2,
        options: () => PJ_PELANGGAN.map(p => ({ value:p.name, label:p.name })),
        onChange: (val, set) => {
          const p = PJ_PELANGGAN.find(x => x.name === val);
          set('Kode_Cust', p ? p.code : '');
          set('Kode_Sales', p ? p.kodeSales || '' : '');
          set('Nama_Sales', p ? p.namaSales || '' : '');
        } },
      { key:'Kode_Cust', label:'Kode Customer', mono:true, readOnly:true, span:1 },
      { key:'Nama_Sales', label:'Nama Sales', mono:true, readOnly:true, span:2 },
      { key:'Kode_Sales', label:'Kode Sales', mono:true, readOnly:true, span:1 },
      { key:'No_Referensi', label:'No. Referensi' },
      { key:'No_Ko', label:'Ref. Konfirmasi Order', mono:true, lockOnEdit:true,
        type:'select', options: () => konfirmasiList.map(k => ({ value:k.noBukti, label:k.noBukti })) },
      { key:'Kredit_Tunai', label:'Kredit/Tunai', type:'select', options:PJ_KREDIT_TUNAI_OPTS, lockOnEdit:true },
      { key:'Tempo', label:'TOP Real (Hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'TempoLama', label:'TOP Lama (Hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'TempoCetak', label:'TOP Cetak (Hari)', type:'number', disabledIf: (f) => f.Kredit_Tunai === 'TUNAI', clearValue:0 },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
    { id:'barang', label:'Barang', type:'items', itemsKey:'Details', produk:true, lockItems:true },
  ];
}
