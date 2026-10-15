// Penjualan — data Konfirmasi Order (konfirmasi pesanan pelanggan + approval)

// Master atribut produk untuk popup "Tambah Detail Barang" (khusus Konfirmasi — barang custom
// atap/steel, bukan dari master BARANG generik). Tiap atribut punya pasangan kode+nama, sama pola
// dengan PJ_SALES (dropdown pilih kode, field "Nama X" di sebelahnya otomatis terisi).
const PJ_JENIS_BARANG = [
  { kode:'ATS', nama:'Atap Spandek' },
  { kode:'ATG', nama:'Atap Genteng Metal' },
  { kode:'BRG', nama:'Bata Ringan' },
  { kode:'RNG', nama:'Reng Baja Ringan' },
];
const PJ_TIPE_PRODUK = [
  { kode:'STD', nama:'Standar' },
  { kode:'CST', nama:'Custom' },
  { kode:'PRM', nama:'Premium' },
];
const PJ_WARNA_BARANG = [
  { kode:'BAL', nama:'Burnt Almond' },
  { kode:'SLM', nama:'Silver Metalic' },
  { kode:'MRM', nama:'Merah Marun' },
  { kode:'BLU', nama:'Biru Langit' },
  { kode:'HTM', nama:'Hitam Doff' },
];
const PJ_BRAND_BARANG = [
  { kode:'AUS', nama:'Austeel' },
  { kode:'BSC', nama:'BlueScope' },
  { kode:'NSB', nama:'NS BlueScope' },
];
const PJ_MERK_BARANG = [
  { kode:'TRD', nama:'Trimdek' },
  { kode:'SPD', nama:'Spandek' },
  { kode:'MTL', nama:'Multiroof' },
];
const PJ_AZ_BARANG = [
  { kode:'AZ50', nama:'AZ 50' },
  { kode:'AZ70', nama:'AZ 70' },
  { kode:'AZ100', nama:'AZ 100' },
];

// Helper pembentuk 1 baris barang lengkap (semua atribut popup "Tambah Detail Barang" terisi),
// supaya saat data dummy dibuka untuk edit/view, field-nya sudah terisi bukan kosong.
function koBarangItem(opts) {
  const {
    jenisBarang='BIASA', kode, nama, deskripsi='', catatanSalesman='',
    jumlah, satuan='PCS', hrgSat, realisasi=0,
    jenis=PJ_JENIS_BARANG[0], tipe=PJ_TIPE_PRODUK[0],
    lebar=914, panjang=6, panjangSatuan='M', namaCetak='',
    brand=PJ_BRAND_BARANG[0], az=PJ_AZ_BARANG[0],
    warna=PJ_WARNA_BARANG[0], tebalTCT=0.45, merk=PJ_MERK_BARANG[0],
    warnaTop=PJ_WARNA_BARANG[0], warnaBottom=PJ_WARNA_BARANG[1], tebalTop=0.4, tebalBottom=0.35,
  } = opts;
  const base = {
    JenisBarang: jenisBarang, Kode_Item: kode, Nama_Item: nama, Deskripsi: deskripsi, CatatanSalesman: catatanSalesman,
    Jumlah: jumlah, Satuan: satuan, Hrg_Sat: hrgSat, Realisasi: realisasi,
    Jenis: jenis.kode, NamaJenis: jenis.nama, Tipe: tipe.kode, NamaTipe: tipe.nama,
    Lebar: lebar, Panjang: panjang, PanjangSatuan: panjangSatuan, NamaCetak: namaCetak,
    Brand: brand.kode, NamaBrand: brand.nama, AZ: az.kode, NamaAZ: az.nama,
  };
  return jenisBarang === 'PU'
    ? { ...base, WarnaTop: warnaTop.kode, NamaWarnaTop: warnaTop.nama, WarnaBottom: warnaBottom.kode, NamaWarnaBottom: warnaBottom.nama, TebalTop: tebalTop, TebalBottom: tebalBottom }
    : { ...base, Warna: warna.kode, NamaWarna: warna.nama, TebalTCT: tebalTCT, Merk: merk.kode, NamaMerek: merk.nama };
}

// Status Konfirmasi memakai model yang sama seperti Order Penjualan/Pembelian: dihitung otomatis dari
// realisasi barang (lihat field Realisasi tiap baris), kecuali "Selesai Manual" (override manual
// via aksi "Selesaikan Manual"). 5 kemungkinan: Belum Realisasi / Selesai Sebagian / Selesai /
// Selesai Manual / Batal.
function koComputeStatus(row) {
  if (row.status === 'BATAL') return 'BATAL';
  if (row.status === 'SELESAI MANUAL') return 'SELESAI_MANUAL';
  const details = row.barang || [];
  if (details.length === 0) return 'BELUM_REALISASI';
  const realizedCount = details.filter(d => (+d.Realisasi || 0) > 0).length;
  const fullyRealizedCount = details.filter(d => (+d.Jumlah || 0) > 0 && (+d.Realisasi || 0) >= (+d.Jumlah || 0)).length;
  if (fullyRealizedCount === details.length) return 'SELESAI';
  if (realizedCount > 0) return 'SELESAI_SEBAGIAN';
  return 'BELUM_REALISASI';
}

function koStatusPill(row) {
  const s = koComputeStatus(row);
  if (s === 'BATAL') return <span className="pill cancelled">Batal</span>;
  if (s === 'SELESAI_MANUAL') return <span className="pill approved">Selesai Manual</span>;
  if (s === 'SELESAI') return <span className="pill approved">Selesai</span>;
  if (s === 'SELESAI_SEBAGIAN') return <span className="pill pending">Selesai Sebagian</span>;
  return <span className="pill draft">Belum Realisasi</span>;
}

// Root-cause fix (Finding 8, e2e-report.html): field `sales`/`customer` di 13 record di bawah
// dulu isinya nama lama yang TIDAK cocok dengan satupun entri asli PJ_SALES_LIST/PJ_PELANGGAN —
// jadi setiap kali record ini dibuka utk Edit, <select> Customer/Sales selalu balik ke "— Pilih —"
// (bukan bug di logic spread {...buildEmpty(), ...data} di KonfirmasiPage.jsx, itu sudah benar).
// Sekarang tiap record pakai kodeCustomer+customer & sales yang benar-benar ada di master, dan
// 7 field kontak yang dulu kosong string di semua record (namaHpPenerima/telepon/email/
// alamatCustomer/keterangan/alamatPengiriman/jenisKendaraan) diisi nilai realistis.
const PJ_KONFIRMASI = [
  {
    noBukti: 'KKO20260001', tglDari: '08/07/2026', tglBukti: '2026-07-08', noReferensi: '',
    customer: 'Pelanggan 1', kodeCustomer: 'H01', sales: 'Sales Baru 2',
    caraBayar: 'TUNAI', status: 'AKTIF', progressApproval: 'DISETUJUI', jmlItem: 1, totalNilai: 1332000,
    createdBy: 'PDJ Administrator', createdAt: '08/07/2026, 14:30', editedBy: 'PDJ Administrator', editedAt: '08/07/2026, 15:47',
    approval: { level: 'Level 1 - Supervisor', status: 'DISETUJUI', approvedBy: 'Admin', approvedAt: '08/07/2026, 15:00' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-07-11', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Budi', namaHpPenerima: 'Hadi - 081300001111', telepon: '081300001111', email: 'pelanggan1@example.com', alamatCustomer: 'Jl. Anggrek 7, SURABAYA', keterangan: 'Order rutin, kirim pagi hari', alamatPengiriman: 'Jl. Anggrek 7, SURABAYA', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-11' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'Affan1-UM-260711141743', nama:'*C BAK AIR ABU ASAHAN AZ LEBAR 5 MM PANJANG 5 MTR', deskripsi:'Catatan', jumlah:1, hrgSat:10000, jenis:PJ_JENIS_BARANG[0], warna:PJ_WARNA_BARANG[0], brand:PJ_BRAND_BARANG[0], merk:PJ_MERK_BARANG[0], az:PJ_AZ_BARANG[0] })]
  },
  {
    noBukti: 'FKO20260002', tglDari: '07/07/2026', tglBukti: '2026-07-07', noReferensi: '',
    customer: 'Brandon Fononta 3', kodeCustomer: 'C001', sales: 'Sales Senior',
    caraBayar: 'TUNAI', status: 'AKTIF', progressApproval: 'DISETUJUI', jmlItem: 2, totalNilai: 91575000,
    createdBy: 'PDJ Administrator', createdAt: '07/07/2026, 10:15', editedBy: 'PDJ Administrator', editedAt: '07/07/2026, 11:20',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-07-10', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Brandon', namaHpPenerima: 'Eddy - 5555', telepon: '5555', email: 'brandon@pdj.com', alamatCustomer: 'Blok M, JKT', keterangan: 'Prioritas tinggi, konfirmasi sebelum kirim', alamatPengiriman: 'Blok M, JKT', jenisKendaraan: 'Truk Engkel' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-10' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [
      koBarangItem({ jenisBarang:'PU', kode:'ITEM-001', nama:'Produk A', jumlah:1, hrgSat:45000000, realisasi:1, jenis:PJ_JENIS_BARANG[1], warnaTop:PJ_WARNA_BARANG[1], warnaBottom:PJ_WARNA_BARANG[2], brand:PJ_BRAND_BARANG[1], az:PJ_AZ_BARANG[1] }),
      koBarangItem({ kode:'ITEM-002', nama:'Produk B', jumlah:1, hrgSat:46575000, realisasi:1, jenis:PJ_JENIS_BARANG[1], warna:PJ_WARNA_BARANG[2], brand:PJ_BRAND_BARANG[1], merk:PJ_MERK_BARANG[1], az:PJ_AZ_BARANG[1] })
    ]
  },
  {
    noBukti: 'KKO20260003', tglDari: '04/07/2026', tglBukti: '2026-07-04', noReferensi: 'Ref-678678',
    customer: 'KAVI', kodeCustomer: 'KV001', sales: 'Sales Junior 1',
    caraBayar: 'KREDIT', status: 'AKTIF', progressApproval: 'DISETUJUI', jmlItem: 2, totalNilai: 66600000,
    createdBy: 'PDJ Administrator', createdAt: '04/07/2026, 09:00', editedBy: 'PDJ Administrator', editedAt: '04/07/2026, 09:30',
    approval: { level: 'Level 1 - Supervisor', status: 'DISETUJUI', approvedBy: 'Admin', approvedAt: '04/07/2026, 09:30' },
    informasiUmum: { noRef: 'Ref-678678', estimasiKirim: '2026-07-07', incoterm: 'Franco', klasifikasi: 'Distributor', attn: 'Budi', namaHpPenerima: 'asdfas - 02199887766', telepon: '02199887766', email: 'kavi@example.com', alamatCustomer: 'Jl. Kenari 88, JAKARTA', keterangan: 'Proyek distributor, kirim bertahap', alamatPengiriman: 'Jl. Kenari 88, JAKARTA', jenisKendaraan: 'Truk Fuso' },
    pembayaran: { tempo: 14, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-18' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [
      koBarangItem({ jenisBarang:'PU', kode:'ITEM-003', nama:'Coil Galvalume', jumlah:2, satuan:'LBR', hrgSat:33300000, realisasi:1, jenis:PJ_JENIS_BARANG[0], warnaTop:PJ_WARNA_BARANG[3], warnaBottom:PJ_WARNA_BARANG[4], brand:PJ_BRAND_BARANG[2], az:PJ_AZ_BARANG[2] })
    ]
  },
  {
    noBukti: 'KKO20260004', tglDari: '04/07/2026', tglBukti: '2026-07-04', noReferensi: 'Ref-765765',
    customer: 'Lia Malik', kodeCustomer: 'L001', sales: 'Sales Junior 1',
    caraBayar: 'TUNAI', status: 'AKTIF', progressApproval: 'DISETUJUI', jmlItem: 2, totalNilai: 38850000,
    createdBy: 'PDJ Administrator', createdAt: '04/07/2026, 08:30', editedBy: 'PDJ Administrator', editedAt: '04/07/2026, 08:45',
    approval: { level: 'Level 1 - Supervisor', status: 'DISETUJUI', approvedBy: 'Admin', approvedAt: '04/07/2026, 08:45' },
    informasiUmum: { noRef: 'Ref-765765', estimasiKirim: '2026-07-07', incoterm: 'Franco', klasifikasi: 'Distributor', attn: 'Budi', namaHpPenerima: 'Alex - 9725', telepon: '9725', email: 'lia@pdj.com', alamatCustomer: 'Blok M, JKT', keterangan: 'Kirim ke gudang cabang', alamatPengiriman: 'Blok M, JKT', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-07' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-004', nama:'Atap Spandek', jumlah:2, satuan:'LBR', hrgSat:19425000, realisasi:2, jenis:PJ_JENIS_BARANG[0], warna:PJ_WARNA_BARANG[0], brand:PJ_BRAND_BARANG[0], merk:PJ_MERK_BARANG[0], az:PJ_AZ_BARANG[2] })]
  },
  {
    noBukti: 'KKO20260005', tglDari: '02/07/2026', tglBukti: '2026-07-02', noReferensi: 'REF-456456',
    customer: 'Charlie Reynold 2', kodeCustomer: 'C012', sales: 'Sales Senior',
    caraBayar: 'TUNAI', status: 'AKTIF', progressApproval: 'DITOLAK SPV', jmlItem: 1, totalNilai: 5550000,
    createdBy: 'PDJ Administrator', createdAt: '02/07/2026, 13:00', editedBy: 'PDJ Administrator', editedAt: '02/07/2026, 13:15',
    approval: { level: 'Level 1 - Supervisor', status: 'DITOLAK', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: 'REF-456456', estimasiKirim: '2026-07-05', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Charlie', namaHpPenerima: 'Alex - 5555', telepon: '5555', email: 'charlie@pdj.com', alamatCustomer: 'Blok M, JKT', keterangan: 'Order ditolak SPV, menunggu revisi harga', alamatPengiriman: 'Blok M, JKT', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-05' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-005', nama:'Reng Baja Ringan', jumlah:1, hrgSat:5550000, jenis:PJ_JENIS_BARANG[3], warna:PJ_WARNA_BARANG[4], brand:PJ_BRAND_BARANG[1], merk:PJ_MERK_BARANG[2], az:PJ_AZ_BARANG[0] })]
  },
  {
    noBukti: 'KKO20260006', tglDari: '02/07/2026', tglBukti: '2026-07-02', noReferensi: 'REF-123123',
    customer: 'Brandon Fononta 3', kodeCustomer: 'C001', sales: 'Sales Junior 2',
    caraBayar: 'TUNAI', status: 'AKTIF', progressApproval: 'PENGAJUAN MGR', jmlItem: 1, totalNilai: 1110000,
    createdBy: 'PDJ Administrator', createdAt: '02/07/2026, 11:00', editedBy: 'PDJ Administrator', editedAt: '02/07/2026, 11:30',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: 'REF-123123', estimasiKirim: '2026-07-05', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Brandon', namaHpPenerima: 'Eddy - 5555', telepon: '5555', email: 'brandon@pdj.com', alamatCustomer: 'Blok M, JKT', keterangan: 'Order kecil, menunggu pengajuan manager', alamatPengiriman: 'Blok M, JKT', jenisKendaraan: 'Motor Box' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-05' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-006', nama:'Baut Roofing', jumlah:10, hrgSat:111000, realisasi:4, jenis:PJ_JENIS_BARANG[2], warna:PJ_WARNA_BARANG[1], brand:PJ_BRAND_BARANG[2], merk:PJ_MERK_BARANG[1], az:PJ_AZ_BARANG[1] })]
  },
  {
    noBukti: 'KKO20260007', tglDari: '30/06/2026', tglBukti: '2026-06-30', noReferensi: '',
    customer: 'Pelanggan 1', kodeCustomer: 'H01', sales: 'Sales Baru 2',
    caraBayar: 'TUNAI', status: 'BATAL', progressApproval: 'PENGAJUAN SPV', jmlItem: 1, totalNilai: 0,
    createdBy: 'PDJ Administrator', createdAt: '30/06/2026, 10:00', editedBy: 'PDJ Administrator', editedAt: '30/06/2026, 10:15',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-07-03', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Pelanggan', namaHpPenerima: 'Hadi - 081300001111', telepon: '081300001111', email: 'pelanggan1@example.com', alamatCustomer: 'Jl. Anggrek 7, SURABAYA', keterangan: 'Dibatalkan, sisa order tidak dilanjutkan', alamatPengiriman: 'Jl. Anggrek 7, SURABAYA', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-03' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: []
  },
  {
    noBukti: 'KKO20260008', tglDari: '18/06/2026', tglBukti: '2026-06-18', noReferensi: '',
    customer: 'Pelanggan 1', kodeCustomer: 'H01', sales: 'Sales Junior 1',
    caraBayar: 'TUNAI', status: 'BATAL', progressApproval: 'PENGAJUAN SPV', jmlItem: 1, totalNilai: 5550000,
    createdBy: 'PDJ Administrator', createdAt: '18/06/2026, 09:00', editedBy: 'PDJ Administrator', editedAt: '18/06/2026, 09:10',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-06-21', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Pelanggan', namaHpPenerima: 'Hadi - 081300001111', telepon: '081300001111', email: 'pelanggan1@example.com', alamatCustomer: 'Jl. Anggrek 7, SURABAYA', keterangan: 'Dibatalkan, stok tidak tersedia', alamatPengiriman: 'Jl. Anggrek 7, SURABAYA', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-06-21' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ jenisBarang:'PU', kode:'ITEM-007', nama:'Plat Galvanis', jumlah:1, satuan:'LBR', hrgSat:5550000, jenis:PJ_JENIS_BARANG[0], warnaTop:PJ_WARNA_BARANG[0], warnaBottom:PJ_WARNA_BARANG[3], brand:PJ_BRAND_BARANG[0], az:PJ_AZ_BARANG[2] })]
  },
  {
    noBukti: 'KKO20260009', tglDari: '30/06/2026', tglBukti: '2026-06-30', noReferensi: '',
    customer: 'Pelanggan 1', kodeCustomer: 'H01', sales: 'Sales Senior',
    caraBayar: 'TUNAI', status: 'BATAL', progressApproval: 'PENGAJUAN SPV', jmlItem: 1, totalNilai: 11100000,
    createdBy: 'PDJ Administrator', createdAt: '30/06/2026, 08:00', editedBy: 'PDJ Administrator', editedAt: '30/06/2026, 08:05',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-07-03', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Pelanggan', namaHpPenerima: 'Hadi - 081300001111', telepon: '081300001111', email: 'pelanggan1@example.com', alamatCustomer: 'Jl. Anggrek 7, SURABAYA', keterangan: 'Dibatalkan, revisi jumlah order', alamatPengiriman: 'Jl. Anggrek 7, SURABAYA', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-03' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-008', nama:'Coil Aluminium', jumlah:1, satuan:'ROLL', hrgSat:11100000, jenis:PJ_JENIS_BARANG[1], warna:PJ_WARNA_BARANG[2], brand:PJ_BRAND_BARANG[1], merk:PJ_MERK_BARANG[0], az:PJ_AZ_BARANG[1] })]
  },
  {
    noBukti: 'KKO20260010', tglDari: '30/06/2026', tglBukti: '2026-06-30', noReferensi: '',
    customer: 'Budi Susanto Cahyono Siner', kodeCustomer: 'b7364', sales: 'Sales Junior 2',
    caraBayar: 'TUNAI', status: 'BATAL', progressApproval: 'PENGAJUAN SPV', jmlItem: 1, totalNilai: 444000,
    createdBy: 'PDJ Administrator', createdAt: '30/06/2026, 07:30', editedBy: 'PDJ Administrator', editedAt: '30/06/2026, 07:40',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-07-03', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Budi', namaHpPenerima: 'Budi Susanto - 081234567890', telepon: '081234567890', email: 'budi.susanto@example.com', alamatCustomer: 'Jl. Melati No. 12, SURABAYA', keterangan: 'Order kecil, dibatalkan operator', alamatPengiriman: 'Jl. Melati No. 12, SURABAYA', jenisKendaraan: 'Motor Box' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-03' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-009', nama:'Sekrup', jumlah:1, satuan:'KG', hrgSat:444000, jenis:PJ_JENIS_BARANG[3], warna:PJ_WARNA_BARANG[4], brand:PJ_BRAND_BARANG[2], merk:PJ_MERK_BARANG[2], az:PJ_AZ_BARANG[0] })]
  },
  {
    noBukti: 'KKO20260011', tglDari: '30/06/2026', tglBukti: '2026-06-30', noReferensi: '',
    customer: 'Toko Jaya Abadi', kodeCustomer: 'T201', sales: 'Sales Baru 2',
    caraBayar: 'TUNAI', status: 'BATAL', progressApproval: 'PENGAJUAN SPV', jmlItem: 1, totalNilai: 133200,
    createdBy: 'PDJ Administrator', createdAt: '30/06/2026, 07:00', editedBy: 'PDJ Administrator', editedAt: '30/06/2026, 07:10',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-07-03', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Joko', namaHpPenerima: 'Joko Susilo - 08198765432', telepon: '02288776655', email: 'jayaabadi@gmail.com', alamatCustomer: 'Jl. Sudirman 45, Bandung', keterangan: 'Order test, dibatalkan', alamatPengiriman: 'Jl. Sudirman 45, Bandung', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-03' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-010', nama:'Lem Sheet', jumlah:1, hrgSat:133200, jenis:PJ_JENIS_BARANG[2], warna:PJ_WARNA_BARANG[0], brand:PJ_BRAND_BARANG[0], merk:PJ_MERK_BARANG[1], az:PJ_AZ_BARANG[2] })]
  },
  {
    noBukti: 'KKO20260012', tglDari: '18/06/2026', tglBukti: '2026-06-18', noReferensi: 'Ref-321321321',
    customer: 'Pelanggan 1', kodeCustomer: 'H01', sales: 'Sales Junior 1',
    caraBayar: 'KREDIT', status: 'AKTIF', progressApproval: 'DITOLAK MGR', jmlItem: 1, totalNilai: 44400,
    createdBy: 'PDJ Administrator', createdAt: '18/06/2026, 06:00', editedBy: 'PDJ Administrator', editedAt: '18/06/2026, 06:15',
    approval: { level: 'Level 1 - Supervisor', status: 'DITOLAK', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: 'Ref-321321321', estimasiKirim: '2026-06-21', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Pelanggan', namaHpPenerima: 'Hadi - 081300001111', telepon: '081300001111', email: 'pelanggan1@example.com', alamatCustomer: 'Jl. Anggrek 7, SURABAYA', keterangan: 'Ditolak manager, nilai order terlalu kecil', alamatPengiriman: 'Jl. Anggrek 7, SURABAYA', jenisKendaraan: 'Pickup' },
    pembayaran: { tempo: 30, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-07-18' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ jenisBarang:'PU', kode:'ITEM-011', nama:'Tutup Nok', jumlah:1, hrgSat:44400, realisasi:1, jenis:PJ_JENIS_BARANG[1], warnaTop:PJ_WARNA_BARANG[2], warnaBottom:PJ_WARNA_BARANG[0], brand:PJ_BRAND_BARANG[1], az:PJ_AZ_BARANG[0] })]
  },
  {
    noBukti: 'FKO20260013', tglDari: '18/06/2026', tglBukti: '2026-06-18', noReferensi: '',
    customer: 'Pelanggan 1', kodeCustomer: 'H01', sales: 'Sales Junior 2',
    caraBayar: 'TUNAI', status: 'SELESAI MANUAL', progressApproval: 'PENGAJUAN SPV', jmlItem: 4, totalNilai: 5661000,
    createdBy: 'PDJ Administrator', createdAt: '18/06/2026, 05:00', editedBy: 'PDJ Administrator', editedAt: '18/06/2026, 05:30',
    approval: { level: 'Level 1 - Supervisor', status: 'PENGAJUAN', approvedBy: '', approvedAt: '' },
    informasiUmum: { noRef: '', estimasiKirim: '2026-06-21', incoterm: 'Franco', klasifikasi: 'Retail', attn: 'Pelanggan', namaHpPenerima: 'Hadi - 081300001111', telepon: '081300001111', email: 'pelanggan1@example.com', alamatCustomer: 'Jl. Anggrek 7, SURABAYA', keterangan: 'Paket atap lengkap, sudah diselesaikan manual', alamatPengiriman: 'Jl. Anggrek 7, SURABAYA', jenisKendaraan: 'Truk Engkel' },
    pembayaran: { tempo: 0, dp: 0, payment2: 0, payment3: 0, akun: 'BANK BCA', berlakuSampai: '2026-06-21' },
    discPct: 0, discRp: 0, ppn: 11, ppnMode: 'Exclude',
    biaya: [],
    barang: [koBarangItem({ kode:'ITEM-012', nama:'Paket Atap', jumlah:4, satuan:'SET', hrgSat:1415250, jenis:PJ_JENIS_BARANG[0], warna:PJ_WARNA_BARANG[3], brand:PJ_BRAND_BARANG[2], merk:PJ_MERK_BARANG[0], az:PJ_AZ_BARANG[1] })]
  }
];
