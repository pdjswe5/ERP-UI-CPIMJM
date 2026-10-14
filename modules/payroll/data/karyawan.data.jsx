// Payroll — Master Karyawan. Field & 6 record pertama diambil PERSIS dari screenshot referensi user
// (uploads/payroll/WhatsApp Image ...16.33.14.jpeg — grid bawah "Master Karyawan"): No.Finger,
// Tgl Masuk, No.Induk, Nama, No.KTP semua cocok. Pola No.Induk-nya sendiri autentik: 6-digit
// sequence + tanggal masuk format YYMMDD (contoh: Kharim, masuk 23-05-2001 -> noInduk berakhiran
// "010523"; diverifikasi juga cocok di semua baris PDF "RepGajiB Halim.pdf", mis. Samsiyah
// 000102970319 -> 970319 = 19-03-1997) — direplikasi lewat prNoInduk() di bawah supaya konsisten.
// 6 record tambahan (Samsiyah dst.) diambil dari nama+tanggal yang sama persis dgn PDF contoh Slip/
// Laporan Gaji Borongan Bagian B022-Packing 5, supaya data Payroll di app ini "nyambung" ke slip
// contoh yang diberikan user.

function prNoInduk(seq, tglMasukIso) {
  const [y, m, d] = tglMasukIso.split('-');
  return String(seq).padStart(6, '0') + y.slice(2) + m + d;
}

function prKaryawanRow(seq, opts) {
  const tglMasuk = opts.tglMasuk;
  return {
    noInduk: prNoInduk(seq, tglMasuk),
    noIndukLama: opts.noIndukLama || '',
    noFinger: String(opts.noFinger ?? seq),
    statusKyw: opts.statusKyw || '00',
    tglMasuk,
    nama: opts.nama,
    noNpwp: opts.noNpwp || '',
    noKtp: opts.noKtp || '',
    alamat: opts.alamat || '',
    kota: opts.kota || 'PASURUAN',
    kodePos: opts.kodePos || '',
    telpon: opts.telpon || '',
    tempatLahir: opts.tempatLahir || opts.kota || 'PASURUAN',
    tglLahir: opts.tglLahir || '',
    alamatKtp: opts.alamatKtp || opts.alamat || '',
    noJkn: opts.noJkn || '',
    alamatDomisili: opts.alamatDomisili || opts.alamatKtp || opts.alamat || '',
    noKpj: opts.noKpj || '',
    jenisKelamin: opts.jenisKelamin || 'L',
    statusKawin: opts.statusKawin ?? true,
    kTk: opts.kTk || 'TK0',
    agama: opts.agama || 'ISLAM',
    pendidikan: opts.pendidikan || 'SLTA',
    tglKeluar: opts.tglKeluar || '',
    statusKeluar: !!opts.statusKeluar,
    levelKaryawan: opts.levelKaryawan || 'B',
    noRekening: opts.noRekening || '',
    bank: opts.bank || '',
    atasNama: opts.atasNama || opts.nama,
    ket: opts.ket || '',
    keluarga: opts.keluarga || [],
    aktif: opts.aktif ?? !opts.statusKeluar,
  };
}

const PR_KARYAWAN = [
  // 6 record persis screenshot Master Karyawan
  prKaryawanRow(1, { nama:'Kharim Sugeng Arianto', tglMasuk:'2001-05-23', noKtp:'3514092812700000', noFinger:1,
    tglLahir:'1970-12-28', tempatLahir:'PASURUAN', telpon:'0812 2021 8504', jenisKelamin:'L', statusKawin:true, kTk:'K1',
    alamatKtp:'Dsn Gendol 001 004 Pakukerto Sukorejo Pasuruan', pendidikan:'SLTP', levelKaryawan:'B', noIndukLama:'111',
    noKpj:'99NB0152044', keluarga:[{ hubungan:'Suami/Istri', nama:'', tglLahir:'' }] }),
  prKaryawanRow(2, { nama:'Purnomo', tglMasuk:'2001-01-22', noKtp:'3514092706730000', noFinger:2,
    tglLahir:'1973-06-27', jenisKelamin:'L', levelKaryawan:'B', pendidikan:'SLTA' }),
  prKaryawanRow(3, { nama:'Puput Elisa Putri', tglMasuk:'2021-08-09', noKtp:'3515134111940000', noFinger:3,
    tglLahir:'1994-11-01', jenisKelamin:'P', levelKaryawan:'A', pendidikan:'SLTA' }),
  prKaryawanRow(5, { nama:'Tunggal', tglMasuk:'1994-10-18', noKtp:'3515161503610000', noFinger:5,
    tglLahir:'1961-03-15', jenisKelamin:'L', levelKaryawan:'A', pendidikan:'SD', statusKeluar:true, tglKeluar:'2026-05-31', aktif:false }),
  prKaryawanRow(9, { nama:'Budi Hariyono', tglMasuk:'1997-05-29', noKtp:'3515152009760000', noFinger:9,
    tglLahir:'1976-09-20', jenisKelamin:'L', levelKaryawan:'B', pendidikan:'SLTA' }),
  prKaryawanRow(10, { nama:'John Doe', tglMasuk:'2011-06-01', noKtp:'1234567890', noFinger:10,
    tglLahir:'1988-02-14', jenisKelamin:'L', levelKaryawan:'A', pendidikan:'S1' }),

  // 6 record tambahan — nama+tgl masuk persis contoh PDF Laporan Gaji Borongan Bagian B022-Packing 5,
  // supaya Transaksi Produksi Harian & Proses Penggajian Borongan (§8-9) punya data konsisten.
  prKaryawanRow(11, { nama:'Samsiyah', tglMasuk:'1997-03-19', noKtp:'3515190319970001', noFinger:11,
    tglLahir:'1997-03-19', jenisKelamin:'P', levelKaryawan:'B', pendidikan:'SLTP' }),
  prKaryawanRow(12, { nama:'Martoyo', tglMasuk:'1999-09-19', noKtp:'3515190919990002', noFinger:12,
    tglLahir:'1978-09-19', jenisKelamin:'L', levelKaryawan:'B', pendidikan:'SLTP' }),
  prKaryawanRow(13, { nama:'Mahmud Sayidin', tglMasuk:'2001-01-13', noKtp:'3515130101010003', noFinger:13,
    tglLahir:'1980-01-13', jenisKelamin:'L', levelKaryawan:'B', pendidikan:'SLTA' }),
  prKaryawanRow(14, { nama:'Waimin', tglMasuk:'1999-02-17', noKtp:'3515170299990004', noFinger:14,
    tglLahir:'1979-02-17', jenisKelamin:'L', levelKaryawan:'B', pendidikan:'SD' }),
  prKaryawanRow(15, { nama:'Dodot Kushariyanto', tglMasuk:'1994-10-18', noKtp:'3515181094940005', noFinger:15,
    tglLahir:'1974-10-18', jenisKelamin:'L', levelKaryawan:'B', pendidikan:'SLTP' }),
  prKaryawanRow(16, { nama:'Sutiah', tglMasuk:'2000-08-03', noKtp:'3515030800000006', noFinger:16,
    tglLahir:'1980-08-03', jenisKelamin:'P', levelKaryawan:'B', pendidikan:'SD' }),
];
