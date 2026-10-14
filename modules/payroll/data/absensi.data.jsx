// Payroll — Absensi Karyawan (simulasi fingerprint; tidak ada integrasi device sungguhan di
// prototipe browser ini, jadi didesain sbg entri data biasa spt modul lain). Seed 1 periode penuh
// (Juli 2026, hari kerja Senin-Jumat) utk 4 karyawan non-borongan (Kharim/Purnomo/Puput/John Doe —
// karyawan Bagian B022-Packing 5 sengaja TIDAK diikutkan, krn mereka dibayar via Produksi Harian/
// Penggajian Borongan, bukan absensi), supaya Proses Penggajian Absensi (§7) punya data nyata.

function prBuildAbsensiBulan(noInduk, year, month, exceptions = {}) {
  const rows = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // lewati Sabtu/Minggu
    const iso = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const exc = exceptions[d];
    rows.push({
      id: `${noInduk}-${iso}`,
      noInduk, tanggal: iso,
      status: exc?.status || 'Hadir',
      jamMasuk: exc?.status && exc.status !== 'Hadir' ? '' : (exc?.jamMasuk || '07:30'),
      jamKeluar: exc?.status && exc.status !== 'Hadir' ? '' : (exc?.jamKeluar || '16:30'),
      keterangan: exc?.keterangan || '',
    });
  }
  return rows;
}

const PR_ABSENSI = [
  ...prBuildAbsensiBulan('000001010523', 2026, 7, {
    14: { status:'Sakit', keterangan:'Demam, ada surat dokter' },
    15: { status:'Sakit', keterangan:'Demam, ada surat dokter' },
    28: { status:'Cuti', keterangan:'Cuti tahunan' },
  }),
  ...prBuildAbsensiBulan('000002010122', 2026, 7, {
    6: { status:'Izin', keterangan:'Keperluan keluarga' },
    22: { jamMasuk:'08:10', jamKeluar:'16:30', keterangan:'Terlambat' },
  }),
  ...prBuildAbsensiBulan('000003210809', 2026, 7, {
    9: { status:'Alpha' },
    30: { status:'Cuti', keterangan:'Cuti tahunan' },
    31: { status:'Cuti', keterangan:'Cuti tahunan' },
  }),
  ...prBuildAbsensiBulan('000010110601', 2026, 7, {
    20: { status:'Izin', keterangan:'Urusan dinas luar' },
  }),
];
