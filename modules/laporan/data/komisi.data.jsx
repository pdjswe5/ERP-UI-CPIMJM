// Laporan — Komisi Salesman: dataset dummy mandiri (tidak dipetakan ke PJ_SALES/Invoice — datanya
// jauh lebih detail dari yg tersedia di Penjualan saat ini: No.Bayar, Tgl.Bayar, TOP Komisi, 3 tingkat
// Fee, Pot.Bayar, % Komisi — sesuai instruksi user "isi datanya dummy saja buat sendiri"). Nama
// salesman/customer sengaja BEDA dari contoh referensi (instruksi "ganti nama-namanya random").
//
// Formula (diturunkan dari contoh cetakan referensi user):
//   Dasar Netto = Dasar Bruto - Fee1 - Fee2 - Fee3 - Pot.Bayar
//   Komisi Rp   = Dasar Netto x Komisi% / 100
// Fee1 selalu "DANA TAKTIS" (tanpa penerima riil, field lain '-') persis label kolom asli "Fee1(DT)";
// Fee2/Fee3 "(Org)" kadang py penerima riil (dipakai laporan Rekap Fee/Voucher Fee).

const LAP_SALESMAN = [
  { kode:'S01', nama:'Rendra Wibowo',        jenis:'Salesman', aktif:true },
  { kode:'S02', nama:'Melati Anggraini',     jenis:'Salesman', aktif:true },
  { kode:'S03', nama:'Fajar Nugroho',        jenis:'Salesman', aktif:true },
  { kode:'S04', nama:'Intan Permatasari',    jenis:'Salesman', aktif:true },
  { kode:'S05', nama:'Yusuf Hakim',          jenis:'Salesman', aktif:true },
  { kode:'S06', nama:'Citra Ayu Lestari',    jenis:'Salesman', aktif:true },
  { kode:'S07', nama:'Bagas Prakoso',        jenis:'Salesman', aktif:false },
  { kode:'M01', nama:'Halim Kusuma',         jenis:'SPV/Mgr',  aktif:true },
  { kode:'M02', nama:'Diah Puspitasari',     jenis:'SPV/Mgr',  aktif:true },
];

const LAP_KOMISI_CUSTOMERS = [
  'Toko Makmur Jaya', 'Sumber Rejeki', 'Cahaya Abadi', 'Berkah Sentosa',
  'Mitra Utama', 'Sinar Harapan', 'Karya Mandiri', 'Anugerah Sejahtera',
];
const LAP_REFERAL_LIST = ['-', 'Agen Timur', 'Agen Barat', 'Mitra Lepas 1'];

const LAP_PENERIMA_DANA_TAKTIS = { nama:'DANA TAKTIS', alamat:'-', noKtp:'-', noHp:'-', bank:'-', rekening:'-' };
const LAP_PENERIMA_REFERAL = [
  { nama:'Wahyu Setiawan',   alamat:'Jl. Kenanga No. 8, Surabaya',  noKtp:'3578011203880002', noHp:'081311220033', bank:'BCA',    rekening:'0981234501' },
  { nama:'Ratna Dewi Sari',  alamat:'Jl. Anggrek No. 21, Sidoarjo', noKtp:'3515025604910003', noHp:'082298871122', bank:'Mandiri', rekening:'1420098877' },
];

function lapAddMonths(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
function lapAddDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function lapNoDoc(prefix, iso, seq) {
  const [y, m] = iso.split('-');
  return `${prefix}${y.slice(2)}${m}${String(seq).padStart(4, '0')}`;
}

function lapKomisiRow(id, opts) {
  const fee1 = opts.fee1 || 0, fee2 = opts.fee2 || 0, fee3 = opts.fee3 || 0, potBayar = opts.potBayar || 0;
  const dasarNetto = opts.dasarBruto - fee1 - fee2 - fee3 - potBayar;
  const komisiRp = Math.round(dasarNetto * opts.komisiPct) / 100;
  return {
    id, tglNota: opts.tglNota, noNota: opts.noNota, tglOrder: opts.tglOrder, customer: opts.customer,
    kodeSales: opts.kodeSales, topKomisi: opts.topKomisi,
    tglBayarAkhir: opts.tglBayarAkhir, noBayarAkhir: opts.noBayarAkhir,
    dasarBruto: opts.dasarBruto, fee1, fee2, fee3, potBayar, dasarNetto,
    komisiPct: opts.komisiPct, komisiRp,
    status: opts.status || 'Dibayar', referal: opts.referal || '-',
    penerimaFee1: fee1 > 0 ? LAP_PENERIMA_DANA_TAKTIS : null,
    penerimaFee2: fee2 > 0 ? (opts.penerimaFee2 || LAP_PENERIMA_DANA_TAKTIS) : null,
    penerimaFee3: fee3 > 0 ? (opts.penerimaFee3 || LAP_PENERIMA_DANA_TAKTIS) : null,
  };
}

// Bangun ~2-4 nota/bulan/salesman utk Jan-Jul 2026 (periode "hari ini" 2026-08-07, jadi Ags dst blm
// ada histori — sama pola dgn contoh cetakan Tahunan referensi yg bulan belakangan nol).
function lapBuildKomisiSetahun() {
  const rows = [];
  let seq = 1;
  LAP_SALESMAN.filter(s => s.aktif).forEach((sales, si) => {
    for (let bulan = 0; bulan < 7; bulan++) {
      const nEntri = 2 + ((si + bulan) % 3); // 2-4 entri
      for (let i = 0; i < nEntri; i++) {
        const tglOrder = lapAddDays(lapAddMonths('2026-01-05', bulan), (si * 3 + i * 7) % 24);
        const tglNota = lapAddDays(tglOrder, 2);
        const topKomisi = [0, 40, 60, 68][(si + i) % 4];
        const tglBayarAkhir = lapAddDays(tglNota, topKomisi || 15);
        const dasarBruto = 3000000 + ((si * 4 + bulan * 7 + i * 3) % 20) * 1850000;
        const hasFee = (si + bulan + i) % 3 === 0;
        const fee1 = hasFee ? Math.round(dasarBruto * 0.02) : 0;
        const fee2 = (hasFee && i === 0) ? Math.round(dasarBruto * 0.015) : 0;
        const komisiPct = [0.75, 1, 1.25, 2][(si + bulan) % 4];
        rows.push(lapKomisiRow(`LK-${String(seq).padStart(4, '0')}`, {
          tglNota, noNota: lapNoDoc('1FPJ', tglNota, seq),
          tglOrder, customer: LAP_KOMISI_CUSTOMERS[(si + bulan + i) % LAP_KOMISI_CUSTOMERS.length],
          kodeSales: sales.kode, topKomisi,
          tglBayarAkhir, noBayarAkhir: lapNoDoc('1FPP', tglBayarAkhir, seq),
          dasarBruto, fee1, fee2, potBayar: 0, komisiPct,
          status: (si + bulan + i) % 9 === 8 ? 'Hangus' : 'Dibayar',
          referal: LAP_REFERAL_LIST[(si + i) % LAP_REFERAL_LIST.length],
          penerimaFee2: fee2 > 0 ? LAP_PENERIMA_REFERAL[si % LAP_PENERIMA_REFERAL.length] : null,
        }));
        seq++;
      }
    }
  });
  return rows;
}

const LAP_KOMISI_TRX = lapBuildKomisiSetahun();
