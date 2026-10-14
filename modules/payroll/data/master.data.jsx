// Payroll — 10 master data kecil (Unit/Divisi/Status/Departemen/Bagian/Jabatan/Kelompok/Waktu
// Kerja/Golongan/Jenis Pekerjaan Borongan), semua dipakai sebagai dropdown FK di Mutasi Karyawan
// (modules/payroll/components/MutasiKaryawanModal.jsx) dan (khusus Jenis Pekerjaan Borongan) di
// Transaksi Produksi Harian. Kode/nama Divisi persis contoh screenshot "Master Divisi"; kode² lain
// (Unit 01=CDG, Status P01=Produksi, Departemen T002, Bagian B022/B023, Jabatan J015, Kelompok
// K026, Waktu Kerja W02, Golongan IA) persis nilai yang muncul di screenshot "Mutasi Karyawan"
// supaya data seed & referensi UI konsisten. Jenis Pekerjaan Borongan (kode kerja+harga/satuan)
// diambil dari sheet "Sheet1"/"Data Produksi" file Excel referensi user (kode kerja 27/46/47/48/50,
// harga per satuan riil dari sheet itu) — TIDAK mereplikasi lapisan TONG/KW/lokasi DD-C6 di
// Excel-nya (dikonfirmasi user), cuma diambil struktur rate-master intinya.

const PR_UNIT = [
  { kode:'01', nama:'CDG', aktif:true },
  { kode:'02', nama:'Sabe', aktif:true },
  { kode:'03', nama:'Bus', aktif:true },
  { kode:'04', nama:'Kantor Pusat', aktif:true },
  { kode:'05', nama:'Gudang Cabang', aktif:false },
];

const PR_DIVISI = [
  { kode:'D001', nama:'HRD & GA', keterangan:'', aktif:true },
  { kode:'D002', nama:'Financial & Accounting', keterangan:'', aktif:true },
  { kode:'D003', nama:'Marketing', keterangan:'', aktif:true },
  { kode:'D004', nama:'Legal', keterangan:'', aktif:true },
  { kode:'D005', nama:'Pabrik', keterangan:'', aktif:true },
];

const PR_STATUS = [
  { kode:'P01', nama:'Produksi', aktif:true },
  { kode:'P02', nama:'Non Produksi', aktif:true },
  { kode:'P03', nama:'Staff', aktif:true },
  { kode:'P04', nama:'Kontrak', aktif:true },
  { kode:'P05', nama:'Harian Lepas', aktif:false },
];

const PR_DEPARTEMEN = [
  { kode:'T001', nama:'Produksi Roll Forming', aktif:true },
  { kode:'T002', nama:'QC, Packing & Kebersihan', aktif:true },
  { kode:'T003', nama:'Gudang & Pengiriman', aktif:true },
  { kode:'T004', nama:'Maintenance', aktif:true },
  { kode:'T005', nama:'Administrasi Pabrik', aktif:false },
];

const PR_BAGIAN = [
  { kode:'B021', nama:'Packing 1', aktif:true },
  { kode:'B022', nama:'Packing 5', aktif:true },
  { kode:'B023', nama:'Packing 2', aktif:true },
  { kode:'B024', nama:'Packing 3', aktif:true },
  { kode:'B025', nama:'Gudang Coil', aktif:false },
];

const PR_JABATAN = [
  { kode:'J010', nama:'Operator Produksi', aktif:true },
  { kode:'J015', nama:'Operator Packing', aktif:true },
  { kode:'J020', nama:'Checker QC', aktif:true },
  { kode:'J025', nama:'Kepala Regu', aktif:true },
  { kode:'J030', nama:'Supervisor Produksi', aktif:false },
];

const PR_KELOMPOK = [
  { kode:'K020', nama:'Trim/Span', aktif:true },
  { kode:'K026', nama:'Packing', aktif:true },
  { kode:'K030', nama:'Gudang', aktif:true },
  { kode:'K035', nama:'QC', aktif:true },
  { kode:'K040', nama:'Maintenance', aktif:false },
];

const PR_WAKTU_KERJA = [
  { kode:'W01', nama:'Normal (08:00-16:00)', aktif:true },
  { kode:'W02', nama:'Shift 1/2/3 (Produksi)', aktif:true },
  { kode:'W03', nama:'Shift Pagi (06:00-14:00)', aktif:true },
  { kode:'W04', nama:'Shift Malam (22:00-06:00)', aktif:true },
  { kode:'W05', nama:'Fleksibel', aktif:false },
];

const PR_GOLONGAN = [
  { kode:'IA',   keterangan:'Golongan I-A', aktif:true },
  { kode:'IB',   keterangan:'Golongan I-B', aktif:true },
  { kode:'IIA',  keterangan:'Golongan II-A', aktif:true },
  { kode:'IIB',  keterangan:'Golongan II-B', aktif:true },
  { kode:'IIIA', keterangan:'Golongan III-A', aktif:false },
];

const PR_JENIS_KERJA_BORONGAN = [
  { kode:'27', keterangan:'Trim 1 Vietnam 75cm',        kodeDivisi:'D005', satuan:'Meter', hargaSatuan:64,    aktif:true },
  { kode:'46', keterangan:'Trim Oval (Slit & Nok)',      kodeDivisi:'D005', satuan:'Meter', hargaSatuan:72,    aktif:true },
  { kode:'47', keterangan:'Pasang/Bongkar Coil DD11',    kodeDivisi:'D005', satuan:'Rol',   hargaSatuan:9744,  aktif:true },
  { kode:'48', keterangan:'Timbang Coil',                kodeDivisi:'D005', satuan:'Rol',   hargaSatuan:2436,  aktif:true },
  { kode:'50', keterangan:'Bungkus Plastik',             kodeDivisi:'D005', satuan:'Pack',  hargaSatuan:1250,  aktif:true },
  { kode:'71', keterangan:'Tong DD',                     kodeDivisi:'D005', satuan:'Unit',  hargaSatuan:1800,  aktif:false },
];

const ACTIVITY_LOG_PAYROLL = [
  { user:'pdjsw', action:'Melakukan Login:', detail:'Sistem Utama', time:'5 menit yang lalu', color:'var(--realisasi)' },
  { user:'admin', action:'Menambah Karyawan Baru:', detail:'000010110601 - John Doe', time:'40 menit yang lalu', color:'var(--realisasi)' },
  { user:'admin', action:'Memproses Mutasi Karyawan:', detail:'000001010523 - Kharim Sugeng Arianto', time:'2 jam yang lalu', color:'var(--accent)' },
  { user:'operator_1', action:'Menyimpan Absensi:', detail:'Periode Juli 2026', time:'4 jam yang lalu', color:'var(--primary)' },
  { user:'admin', action:'Memproses Penggajian Borongan:', detail:'Bagian B022 - Packing 5', time:'1 hari yang lalu', color:'var(--warn)' },
];
