// Laporan — dataset dummy mandiri utk Kartu/Posisi/Rekap Stok (spt LAP_KOMISI_TRX utk Komisi
// Salesman) — TIDAK menarik data riil dari Barang/Manufaktur/Penjualan. Instruksi user: "tampilan
// terintegrasi penuh (spt referensi asli — transaksi PRODUK dari Manufaktur, JUAL dari Penjualan)
// namun tetap gunakan data dummy", supaya tidak perlu rekonsiliasi kode barang/gudang lintas 3 modul
// yang saat ini memang tidak sinkron. Tipe transaksi & vocab kolom (PRODUK/JUAL/KOREKSI/PAKAI,
// Stock Real vs Available, grouping per Tebal) persis dokumen referensi user (uploads/laporan).

const LAP_STOK_LOKASI = [
  { kode:'GJ', nama:'Gudang Barang Jadi' },
  { kode:'GB', nama:'Gudang Bahan Baku' },
];

const LAP_STOK_ITEMS = [
  { kode:'RL020SHSLKW2091401800', nama:'KW2 0.20MM X 914MM X 18.00M SILVER',                 satuan:'ROL', tebal:0.20, lokasi:'GJ' },
  { kode:'GB020ATBRNON080000180', nama:'BJLA 0.20MM X 800MM X 1.80M BLUE RESINE',             satuan:'LBR', tebal:0.20, lokasi:'GJ' },
  { kode:'AS1025ATSLKW2075000600', nama:'KW2 ATAP SALJU PU4CM 0.25MM X 750MM X 6.00M SILVER', satuan:'LBR', tebal:0.25, lokasi:'GJ' },
  { kode:'RL025SHBOKW2091405500', nama:'KW2 0.25MM X 914MM X 55.00M BIRU BOGOWONTO',          satuan:'ROL', tebal:0.25, lokasi:'GJ' },
  { kode:'TR025ATHMNON075000600', nama:'DIAMOND TR5-75 0.25MM X 750MM X 6.00M HITAM BATUBARA', satuan:'LBR', tebal:0.25, lokasi:'GJ' },
  { kode:'GB030ATSGKW2080000180', nama:'KW2 0.30MM X 800MM X 1.80M SILVER GREY',              satuan:'LBR', tebal:0.30, lokasi:'GJ' },
  { kode:'WA1030NKSLNON004000300', nama:'WALL ANGLE 2 X 2 X 3.00 M LIPAT',                     satuan:'BTG', tebal:0.30, lokasi:'GJ' },
  { kode:'TR030ATSGKW2075000180', nama:'KW2 0.30MM X 750MM X 1.80M SILVER GREY',              satuan:'LBR', tebal:0.30, lokasi:'GJ' },
  { kode:'RL035SHHBKW2091403000', nama:'KW2 0.35MM X 914MM X 30.00M HIJAU BORNEO',            satuan:'ROL', tebal:0.35, lokasi:'GJ' },
  { kode:'SP035ATRONON068000071', nama:'DIAMOND SP9-68 0.35MM X 680MM X 0.71M ROKANSTONE',    satuan:'LBR', tebal:0.35, lokasi:'GJ' },
  { kode:'RG040TRSGNON00600', nama:'RENG 32 DIAMOND 0.40MM X 6.00M SILVER GREY',              satuan:'BTG', tebal:0.40, lokasi:'GJ' },
  { kode:'FL040NKHBNON030400240', nama:'FLASHING 0.40MM X 304MM X 2.40M H. BORNEO',           satuan:'LBR', tebal:0.40, lokasi:'GJ' },
  { kode:'BB040091470550', nama:'BAHAGIA BIRU BROMO TEBAL 0.40 LEBAR 914 MM AZ 70 G-550',     satuan:'LBR', tebal:0.40, lokasi:'GB' },
  { kode:'AA0450914100550', nama:'BAHAN ABU ANGKOLA TEBAL 0.45 LEBAR 914 MM AZ 100 G-550',    satuan:'LBR', tebal:0.45, lokasi:'GB' },
  { kode:'TR045ATSGKW2075000180', nama:'KW2 0.45MM X 750MM X 1.80M SILVER GREY',              satuan:'LBR', tebal:0.45, lokasi:'GJ' },
  { kode:'CC0350914080550', nama:'COKELAT CERAH TEBAL 0.35 LEBAR 914 MM AZ 80 G-550',         satuan:'LBR', tebal:0.35, lokasi:'GB' },
];

function lapAddDaysStok(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function lapNoBuktiStok(prefix, iso, seq) {
  const [y, m] = iso.split('-');
  return `1${prefix}${y.slice(2)}${m}${String(seq).padStart(4, '0')}`;
}

// Saldo Awal per item (checkpoint OPNAME 01-01-2026), lalu histori PRODUK(masuk, dari Manufaktur)/
// JUAL(keluar, dari Penjualan)/KOREKSI(+/-)/PAKAI(keluar, trial/internal) Jan-Jul 2026 — pola
// (bulan berjalan sd "hari ini" 2026-08-07) sama spt dataset Payroll/Komisi sesi ini.
function lapBuildStokTrxSetahun() {
  const trx = [];
  let seq = 1;
  LAP_STOK_ITEMS.forEach((item, ii) => {
    const saldoAwal = 40 + (ii * 17) % 90;
    trx.push({ id:`LS-${String(seq++).padStart(4,'0')}`, tanggal:'2026-01-01', kodeItem:item.kode, lokasi:item.lokasi,
      nomorBukti:'', keterangan:'Saldo Awal', tipe:'OPNAME', resetTo: saldoAwal });

    for (let bulan = 0; bulan < 7; bulan++) {
      const nEntri = 2 + ((ii + bulan) % 3);
      for (let i = 0; i < nEntri; i++) {
        const tanggal = lapAddDaysStok(`2026-${String(bulan+1).padStart(2,'0')}-03`, (ii * 2 + i * 6) % 24);
        const jenis = (ii + bulan + i) % 5;
        if (jenis <= 1) {
          const qty = 15 + ((ii + bulan * 3 + i) % 40);
          trx.push({ id:`LS-${String(seq).padStart(4,'0')}`, tanggal, kodeItem:item.kode, lokasi:item.lokasi,
            nomorBukti: lapNoBuktiStok('KHR', tanggal, seq), keterangan:`Hasil Produksi SPK-${2026}${String(bulan+1).padStart(2,'0')}${String(seq).padStart(3,'0')}`,
            tipe:'PRODUK', debet:qty, kredit:0 });
        } else if (jenis <= 3) {
          const qty = 5 + ((ii + bulan * 5 + i) % 25);
          trx.push({ id:`LS-${String(seq).padStart(4,'0')}`, tanggal, kodeItem:item.kode, lokasi:item.lokasi,
            nomorBukti: lapNoBuktiStok('KWJ', tanggal, seq), keterangan:`Penjualan Invoice ${lapNoBuktiStok('FPJ', tanggal, seq)}`,
            tipe:'JUAL', debet:0, kredit:qty });
        } else if (jenis === 4 && (ii + bulan) % 4 === 0) {
          const qty = 2 + ((ii + i) % 6);
          trx.push({ id:`LS-${String(seq).padStart(4,'0')}`, tanggal, kodeItem:item.kode, lokasi:item.lokasi,
            nomorBukti: lapNoBuktiStok('FHS', tanggal, seq), keterangan:'Pakai Trial Mesin',
            tipe:'PAKAI', debet:0, kredit:qty });
        } else {
          const qty = 1 + ((ii + bulan) % 5);
          trx.push({ id:`LS-${String(seq).padStart(4,'0')}`, tanggal, kodeItem:item.kode, lokasi:item.lokasi,
            nomorBukti: lapNoBuktiStok('KBJ', tanggal, seq), keterangan:'Koreksi Stok Opname',
            tipe:'KOREKSI', debet:qty, kredit:0 });
        }
        seq++;
      }
    }
  });
  return trx;
}

const LAP_STOK_TRX = lapBuildStokTrxSetahun();

// Qty tertahan (dialokasikan ke Sales Order yg belum dikirim) per item — dummy, dipakai kolom
// "Available" (= Stock Real - Reserved) di Posisi Stok, persis konsep referensi.
function lapStokReserved(kodeItem) {
  let h = 0;
  for (let i = 0; i < kodeItem.length; i++) h = (h * 31 + kodeItem.charCodeAt(i)) % 23;
  return h;
}
