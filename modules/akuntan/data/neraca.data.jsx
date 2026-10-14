// Akuntan — data Neraca (posisi keuangan per tanggal, bukan periode — tglAwal & tglAkhir dibuat
// sama-sama tanggal neraca itu sendiri supaya row shape tetap seragam dengan Laba Rugi/Arus Kas,
// lihat LaporanKeuanganPage). Total Aset selalu balance dengan Kewajiban + Ekuitas (selisih=0).
const NERACA = [
  { no:'NR-2026-0001', tglAwal:'31-01-2026', tglAkhir:'31-01-2026', keterangan:'Neraca per 31 Januari 2026', status:'Final',
    totalAset:4850000000, totalKewajiban:1200000000, totalEkuitas:3650000000, selisih:0 },
  { no:'NR-2026-0002', tglAwal:'28-02-2026', tglAkhir:'28-02-2026', keterangan:'Neraca per 28 Februari 2026', status:'Final',
    totalAset:4920000000, totalKewajiban:1180000000, totalEkuitas:3740000000, selisih:0 },
  { no:'NR-2026-0003', tglAwal:'31-03-2026', tglAkhir:'31-03-2026', keterangan:'Neraca per 31 Maret 2026', status:'Final',
    totalAset:4980000000, totalKewajiban:1210000000, totalEkuitas:3770000000, selisih:0 },
  { no:'NR-2026-0004', tglAwal:'30-04-2026', tglAkhir:'30-04-2026', keterangan:'Neraca per 30 April 2026', status:'Final',
    totalAset:5060000000, totalKewajiban:1190000000, totalEkuitas:3870000000, selisih:0 },
  { no:'NR-2026-0005', tglAwal:'31-05-2026', tglAkhir:'31-05-2026', keterangan:'Neraca per 31 Mei 2026', status:'Final',
    totalAset:5140000000, totalKewajiban:1220000000, totalEkuitas:3920000000, selisih:0 },
  { no:'NR-2026-0006', tglAwal:'30-06-2026', tglAkhir:'30-06-2026', keterangan:'Neraca per 30 Juni 2026 (belum final)', status:'Draft',
    totalAset:5210000000, totalKewajiban:1230000000, totalEkuitas:3980000000, selisih:0 },
];
