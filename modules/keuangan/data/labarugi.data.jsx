// Akuntan — data Laba Rugi (ringkasan per periode, bukan baris detail per akun — 1 record = 1
// bulan pelaporan). labaRugiBersih dihitung via AK_LAPORAN_LIST.compute, disimpan langsung di
// field supaya list/cetak tidak perlu menghitung ulang tiap render.
const LABA_RUGI = [
  { no:'LR-2026-0001', tglAwal:'01-01-2026', tglAkhir:'31-01-2026', keterangan:'Laba rugi bulan Januari 2026', status:'Final',
    totalPendapatan:385000000, totalBebanPokok:210000000, totalBebanOperasional:48000000, labaRugiBersih:127000000 },
  { no:'LR-2026-0002', tglAwal:'01-02-2026', tglAkhir:'28-02-2026', keterangan:'Laba rugi bulan Februari 2026', status:'Final',
    totalPendapatan:401000000, totalBebanPokok:218000000, totalBebanOperasional:51000000, labaRugiBersih:132000000 },
  { no:'LR-2026-0003', tglAwal:'01-03-2026', tglAkhir:'31-03-2026', keterangan:'Laba rugi bulan Maret 2026', status:'Final',
    totalPendapatan:372000000, totalBebanPokok:205000000, totalBebanOperasional:46000000, labaRugiBersih:121000000 },
  { no:'LR-2026-0004', tglAwal:'01-04-2026', tglAkhir:'30-04-2026', keterangan:'Laba rugi bulan April 2026', status:'Final',
    totalPendapatan:418000000, totalBebanPokok:226000000, totalBebanOperasional:53000000, labaRugiBersih:139000000 },
  { no:'LR-2026-0005', tglAwal:'01-05-2026', tglAkhir:'31-05-2026', keterangan:'Laba rugi bulan Mei 2026', status:'Final',
    totalPendapatan:395000000, totalBebanPokok:214000000, totalBebanOperasional:49000000, labaRugiBersih:132000000 },
  { no:'LR-2026-0006', tglAwal:'01-06-2026', tglAkhir:'30-06-2026', keterangan:'Laba rugi bulan Juni 2026 (belum final)', status:'Draft',
    totalPendapatan:430000000, totalBebanPokok:232000000, totalBebanOperasional:55000000, labaRugiBersih:143000000 },
];
