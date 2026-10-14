// Payroll — histori batch hasil Proses Penggajian Absensi/Borongan. Sengaja mulai kosong (bukan
// dihitung manual di sini) krn nilai slip dihitung oleh prComputeSlipAbsensi/prComputeSlipBorongan
// (masing² di pages/PenggajianAbsensiPage.jsx & pages/PenggajianBoronganPage.jsx, dimuat SETELAH
// file data ini di index.html) dari Komponen Gaji Mutasi + Absensi/Produksi Harian — batch baru
// muncul di sini stlh user klik "Proses" -> "Simpan" pd salah satu halaman itu. KPI dashboard Payroll
// pakai agregat langsung dari absensiRows/produksiHarianRows bulan berjalan, bukan dari array ini,
// supaya tetap ada angka meski belum pernah diproses.

const PR_PENGGAJIAN_ABSENSI = [];
const PR_PENGGAJIAN_BORONGAN = [];
