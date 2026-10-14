// Akuntan — konfigurasi 3 laporan keuangan (Laba Rugi, Laporan Arus Kas, Neraca). Tiap laporan
// punya data CRUD sendiri (ringkasan per periode — lihat labarugi/aruskas/neraca.data.jsx), tapi
// bentuknya cukup mirip (No/Periode/Keterangan/Status + 3 field angka + 1 hasil hitung) sehingga
// 1 LaporanKeuanganPage generik dipakai untuk ke-3nya, dibedakan lewat config di sini — pola sama
// seperti kolom `compute` di beli.data.jsx atau `columns`+`getItems` di BrgCetakModal.
//
// `periodMode`: 'range' (Laba Rugi/Arus Kas — field tglAwal & tglAkhir keduanya diisi user) atau
// 'point' (Neraca — snapshot per 1 tanggal; tglAwal & tglAkhir disamakan otomatis ke tanggal itu
// supaya row shape tetap seragam untuk AkCetakModal/list/filter).
// `file` masih dipertahankan (dipakai popup Cetak: preview iframe dari PDF referensi yang sama).
const AK_STATUS_LAPORAN_OPTS = ['Draft', 'Final'];

const AK_LAPORAN_LIST = [
  {
    id:'labarugi', label:'Laba Rugi', file:'Laba Rugi (Regular).pdf',
    desc:'Ringkasan pendapatan, beban pokok, dan beban operasional untuk mengukur laba/rugi periode berjalan.',
    noPrefix:'LR', periodMode:'range',
    fields:[
      { key:'totalPendapatan', label:'Total Pendapatan (Rp)' },
      { key:'totalBebanPokok', label:'Total Beban Pokok / HPP (Rp)' },
      { key:'totalBebanOperasional', label:'Total Beban Operasional (Rp)' },
    ],
    resultKey:'labaRugiBersih', resultLabel:'Laba/Rugi Bersih',
    compute: f => (+f.totalPendapatan||0) - (+f.totalBebanPokok||0) - (+f.totalBebanOperasional||0),
  },
  {
    id:'aruskas', label:'Laporan Arus Kas', file:'Laporan Arus Kas.pdf',
    desc:'Arus kas masuk dan keluar dari aktivitas operasi, investasi, dan pendanaan.',
    noPrefix:'AK', periodMode:'range',
    fields:[
      { key:'arusOperasi', label:'Arus Kas Aktivitas Operasi (Rp)' },
      { key:'arusInvestasi', label:'Arus Kas Aktivitas Investasi (Rp)' },
      { key:'arusPendanaan', label:'Arus Kas Aktivitas Pendanaan (Rp)' },
    ],
    resultKey:'kenaikanKasBersih', resultLabel:'Kenaikan (Penurunan) Kas Bersih',
    compute: f => (+f.arusOperasi||0) + (+f.arusInvestasi||0) + (+f.arusPendanaan||0),
  },
  {
    id:'neraca', label:'Neraca', file:'Neraca.pdf',
    desc:'Posisi aktiva, kewajiban, dan ekuitas perusahaan pada tanggal tertentu.',
    noPrefix:'NR', periodMode:'point',
    fields:[
      { key:'totalAset', label:'Total Aset (Rp)' },
      { key:'totalKewajiban', label:'Total Kewajiban (Rp)' },
      { key:'totalEkuitas', label:'Total Ekuitas (Rp)' },
    ],
    resultKey:'selisih', resultLabel:'Selisih (harus 0 kalau balance)',
    compute: f => (+f.totalAset||0) - (+f.totalKewajiban||0) - (+f.totalEkuitas||0),
  },
];

function akNextLaporanNo(rows, prefix) {
  const nums = rows.map(r => parseInt((r.no.match(/(\d+)$/) || [])[1] || '0', 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-2026-${String(next).padStart(4,'0')}`;
}
