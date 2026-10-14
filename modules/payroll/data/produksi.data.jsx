// Payroll — Transaksi Produksi Harian (input borongan). Generalisasi dari sheet "Data Produksi"
// file Excel referensi (20-ribuan baris log harian per karyawan+kode kerja+qty) TANPA lapisan
// TONG/KW/lokasi DD-C6 (dikonfirmasi user tidak direplikasi) — di sini 1 baris = 1 entri kerja
// borongan 1 karyawan 1 hari. Seed periode Juli 2026 utk 6 karyawan Bagian B022-Packing 5 (konsisten
// dgn periode seed Absensi Karyawan), kode kerja & harga/satuan dari PR_JENIS_KERJA_BORONGAN
// (master.data.jsx, sudah dimuat lebih dulu di index.html).

function prHargaSatuanKerja(kodeKerja) {
  return PR_JENIS_KERJA_BORONGAN.find(j => j.kode === kodeKerja)?.hargaSatuan || 0;
}

const PR_QTY_RANGE_BY_KERJA = { '27':[300,600], '46':[250,500], '47':[8,15], '48':[10,20], '50':[100,200] };

function prBuildProduksiBulan(noInduk, year, month, kodeKerjaCycle) {
  const rows = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  let i = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // lewati Sabtu/Minggu
    const iso = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const kodeKerja = kodeKerjaCycle[i % kodeKerjaCycle.length];
    const [qMin, qMax] = PR_QTY_RANGE_BY_KERJA[kodeKerja] || [10, 20];
    const qty = qMin + ((d * 7 + i * 11) % (qMax - qMin + 1));
    const hargaSatuan = prHargaSatuanKerja(kodeKerja);
    rows.push({
      id: `${noInduk}-${iso}-${i}`,
      noInduk, tanggal: iso, kodeKerja, qty,
      hargaSatuan, upah: qty * hargaSatuan,
    });
    i++;
  }
  return rows;
}

const PR_PRODUKSI_HARIAN = [
  ...prBuildProduksiBulan('000011970319', 2026, 7, ['27','46']),
  ...prBuildProduksiBulan('000012990919', 2026, 7, ['46','27']),
  ...prBuildProduksiBulan('000013010113', 2026, 7, ['50','27']),
  ...prBuildProduksiBulan('000014990217', 2026, 7, ['47','48']),
  ...prBuildProduksiBulan('000015941018', 2026, 7, ['48','47']),
  ...prBuildProduksiBulan('000016000803', 2026, 7, ['50','46']),
];
