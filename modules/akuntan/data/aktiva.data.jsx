// Akuntan — data Katalog Aktiva (fixed assets)

const AK_KATEGORI_AKTIVA_OPTS = [
  { kode:'KEND', nama:'Kendaraan' },
  { kode:'BANG', nama:'Bangunan' },
  { kode:'ALAT', nama:'Alat/Mesin' },
  { kode:'IT',   nama:'IT/Elektronik' },
  { kode:'FURN', nama:'Furniture' },
];

const AK_METODE_PENYUSUTAN_OPTS = ['Garis Lurus', 'Saldo Menurun'];

const AKTIVA = [
  { kode:'AT-001', nama:'Toyota Avanza B 1234 ABC',    aktif:true,  tglJual:'',           tglBeli:'15-03-2024', noBukti:'BB-2024-0312', noKelompok:'KEND-001', compro:'PT Pacific Data', kategori:'KEND', harga: 215000000, susut:  35833333, nilai:179166667 },
  { kode:'AT-002', nama:'Mitsubishi Pajero B 5678 DEF',aktif:true,  tglJual:'',           tglBeli:'22-06-2024', noBukti:'BB-2024-0612', noKelompok:'KEND-002', compro:'PT Pacific Data', kategori:'KEND', harga: 645000000, susut:  64500000, nilai:580500000 },
  { kode:'AT-003', nama:'Forklift Toyota 3 Ton',        aktif:true,  tglJual:'',           tglBeli:'10-01-2025', noBukti:'BB-2025-0101', noKelompok:'GUDA-001', compro:'PT Pacific Data', kategori:'ALAT', harga: 285000000, susut:  18750000, nilai:266250000 },
  { kode:'AT-004', nama:'Server Dell R740',             aktif:true,  tglJual:'',           tglBeli:'05-02-2025', noBukti:'BB-2025-0203', noKelompok:'IT-001',   compro:'PT Pacific Data', kategori:'IT',   harga:  92000000, susut:   6133333, nilai: 85866667 },
  { kode:'AT-005', nama:'AC Daikin 5PK Showroom',       aktif:true,  tglJual:'',           tglBeli:'20-09-2024', noBukti:'BB-2024-0921', noKelompok:'GD-001',   compro:'PT Pacific Data', kategori:'BANG', harga:  18500000, susut:   2316666, nilai: 16183334 },
  { kode:'AT-006', nama:'Bangunan Showroom Surabaya',   aktif:true,  tglJual:'',           tglBeli:'01-01-2020', noBukti:'BB-2020-0101', noKelompok:'BG-001',   compro:'PT Pacific Data', kategori:'BANG', harga:3800000000, susut:1058333333, nilai:2741666667 },
  { kode:'AT-007', nama:'Honda Brio Service B 2222 GHI',aktif:false, tglJual:'12-02-2026', tglBeli:'05-04-2022', noBukti:'BB-2022-0401', noKelompok:'KEND-003', compro:'PT Pacific Data', kategori:'KEND', harga: 165000000, susut: 110000000, nilai: 55000000 },
  { kode:'AT-008', nama:'Mesin Genset 200kVA',          aktif:true,  tglJual:'',           tglBeli:'18-11-2023', noBukti:'BB-2023-1118', noKelompok:'GEN-001', compro:'PT Pacific Data', kategori:'ALAT', harga: 425000000, susut: 100208333, nilai:324791667 },
  { kode:'AT-009', nama:'Laptop Dell Latitude (5 unit)',aktif:true,  tglJual:'',           tglBeli:'12-03-2025', noBukti:'BB-2025-0312', noKelompok:'IT-002',   compro:'PT Pacific Data', kategori:'IT',   harga:  78000000, susut:   3250000, nilai: 74750000 },
  { kode:'AT-010', nama:'Tools Set Bengkel',            aktif:true,  tglJual:'',           tglBeli:'25-07-2024', noBukti:'BB-2024-0725', noKelompok:'BKL-001', compro:'PT Pacific Data', kategori:'ALAT', harga:  42500000, susut:   7437500, nilai: 35062500 },
];
