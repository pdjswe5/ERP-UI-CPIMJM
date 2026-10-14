// Penjualan — master data pelanggan (customer master), field mengikuti struktur data lokal pelanggan.jsx asli.

const PJ_PELANGGAN = [
  {
      name:"Budi Susanto Cahyono Siner",
      code:"b7364",
      alamat:"Jl. Melati No. 12",
      kota:"SURABAYA",
      tel:"081234567890",
      pemilik:"Budi Susanto",
      nik:"3175012345678",
      email:"budi.susanto@example.com",
      kontak:"081234567890",
      flag:null,
      kodeSales:"SL001", namaSales:"Sales Baru 2",
      noKtp:"3175012345678",
      namaKtp:"Budi Susanto",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Budi Susanto",
      namaPemesan:"Budi Susanto",
      area:"Jabodetabek",
      kodeGabungan:"Gab-b7364",
      golongan:"Blokir",
      kodePos:"10000",
      fax:"0211000000",
      klasifikasi:"Retail",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Budi Susanto Cahyono Siner",
      alamatKirim:"Jl. Melati No. 12",
      noNpwp:"09.001.002.3-100.004",
      jenisHarga:"Standar",
      namaPajak:"Budi Susanto Cahyono Siner",
      kotaPajak:"SURABAYA",
      plafon:5000000,
      plafonTemp:0,
      alamatPajak:"Jl. Melati No. 12",
      tempo:0,
      tempoLama:7,
      tempoKom:3,
      virtualAc:"BCA 1000000000",
      alamatTagih:"Jl. Melati No. 12",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 1", telepon:"081255556666", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 2", telepon:"02170100", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Budi Susanto", alamatKirim:"Jl. Melati No. 12", kota:"SURABAYA", telepon:"081234567890", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 1", alamatKirim:"Jl. Kirim No. 10", kota:"SURABAYA", telepon:"081234567890", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.001.002.3-100.004", namaNpwp:"Budi Susanto Cahyono Siner", alamat:"Jl. Melati No. 12" },
          { noNpwp:"09.005.006.000-200.000", namaNpwp:"Cabang SURABAYA", alamat:"Jl. Melati No. 12" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:100000, awalPpn:10 },
          { periode:"202606", awalTitipan:0, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:2500000 },
          { periode:"202606", nilaiAwal:0 }
        ]
  },
  {
      name:"Brandon Fononta 3",
      code:"C001",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Eddy",
      nik:"12345",
      email:"brandon@pdj.com",
      kontak:"Brandon",
      flag:null,
      kodeSales:"SL002", namaSales:"Sales Senior",
      noKtp:"12345",
      namaKtp:"Eddy",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Eddy",
      namaPemesan:"Eddy",
      area:"Jawa Barat",
      kodeGabungan:"Gab-C001",
      golongan:"Baik",
      kodePos:"10001",
      fax:"0211000001",
      klasifikasi:"Distributor",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Brandon Fononta 3",
      alamatKirim:"Blok M",
      noNpwp:"09.002.003.4-101.005",
      jenisHarga:"Standar",
      namaPajak:"Brandon Fononta 3",
      kotaPajak:"JKT",
      plafon:10000000,
      plafonTemp:1000000,
      alamatPajak:"Blok M",
      tempo:7,
      tempoLama:14,
      tempoKom:10,
      virtualAc:"BCA 1000000001",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 2", telepon:"081255556667", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 3", telepon:"02170101", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Eddy", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 2", alamatKirim:"Jl. Kirim No. 11", kota:"JKT", telepon:"Brandon", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.002.003.4-101.005", namaNpwp:"Brandon Fononta 3", alamat:"Blok M" },
          { noNpwp:"09.006.007.000-201.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:200000, awalPpn:9.5 },
          { periode:"202606", awalTitipan:75000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:5000000 },
          { periode:"202606", nilaiAwal:1200000 }
        ]
  },
  {
      name:"Charlie Reynold 2",
      code:"C012",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"charlie@pdj.com",
      kontak:"Charlie",
      flag:null,
      kodeSales:"SL003", namaSales:"Sales Junior 1",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Jawa Timur",
      kodeGabungan:"Gab-C012",
      golongan:"Baik",
      kodePos:"10002",
      fax:"0211000002",
      klasifikasi:"Korporat",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Charlie Reynold 2",
      alamatKirim:"Blok M",
      noNpwp:"09.003.004.5-102.006",
      jenisHarga:"Standar",
      namaPajak:"Charlie Reynold 2",
      kotaPajak:"JKT",
      plafon:15000000,
      plafonTemp:2000000,
      alamatPajak:"Blok M",
      tempo:14,
      tempoLama:21,
      tempoKom:17,
      virtualAc:"BCA 1000000002",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 3", telepon:"081255556668", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 4", telepon:"02170102", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 3", alamatKirim:"Jl. Kirim No. 12", kota:"JKT", telepon:"Charlie", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.003.004.5-102.006", namaNpwp:"Charlie Reynold 2", alamat:"Blok M" },
          { noNpwp:"09.007.008.000-202.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:300000, awalPpn:11 },
          { periode:"202606", awalTitipan:150000, awalPpn:9.5 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:7500000 },
          { periode:"202606", nilaiAwal:2400000 }
        ]
  },
  {
      name:"gagagaga",
      code:"g123",
      alamat:"Jl. Mawar 45",
      kota:"BANDUNG",
      tel:"081298765432",
      pemilik:"didi",
      nik:"12345682832",
      email:"wildann@example.com",
      kontak:"09089876655",
      flag:null,
      kodeSales:"SL004", namaSales:"Sales Junior 2",
      noKtp:"12345682832",
      namaKtp:"didi",
      tglLahir:"1990-01-01T00:00:00",
      owner:"didi",
      namaPemesan:"didi",
      area:"Jawa Tengah",
      kodeGabungan:"Gab-g123",
      golongan:"Baik",
      kodePos:"10003",
      fax:"0211000003",
      klasifikasi:"Project",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan gagagaga",
      alamatKirim:"Jl. Mawar 45",
      noNpwp:"09.004.005.6-103.007",
      jenisHarga:"Standar",
      namaPajak:"gagagaga",
      kotaPajak:"BANDUNG",
      plafon:20000000,
      plafonTemp:3000000,
      alamatPajak:"Jl. Mawar 45",
      tempo:21,
      tempoLama:28,
      tempoKom:24,
      virtualAc:"BCA 1000000003",
      alamatTagih:"Jl. Mawar 45",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 4", telepon:"081255556669", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 5", telepon:"02170103", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"didi", alamatKirim:"Jl. Mawar 45", kota:"BANDUNG", telepon:"081298765432", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 4", alamatKirim:"Jl. Kirim No. 13", kota:"BANDUNG", telepon:"09089876655", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.004.005.6-103.007", namaNpwp:"gagagaga", alamat:"Jl. Mawar 45" },
          { noNpwp:"09.008.009.000-203.000", namaNpwp:"Cabang BANDUNG", alamat:"Jl. Mawar 45" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:400000, awalPpn:11 },
          { periode:"202606", awalTitipan:225000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:10000000 },
          { periode:"202606", nilaiAwal:3600000 }
        ]
  },
  {
      name:"Pelanggan 1",
      code:"H01",
      alamat:"Jl. Anggrek 7",
      kota:"SURABAYA",
      tel:"081300001111",
      pemilik:"Hadi",
      nik:"3175098765432",
      email:"pelanggan1@example.com",
      kontak:"081300001111",
      flag:null,
      kodeSales:"SL001", namaSales:"Sales Baru 2",
      noKtp:"3175098765432",
      namaKtp:"Hadi",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Hadi",
      namaPemesan:"Hadi",
      area:"Sumatera",
      kodeGabungan:"Gab-H01",
      golongan:"Baik",
      kodePos:"10004",
      fax:"0211000004",
      klasifikasi:"Retail",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Pelanggan 1",
      alamatKirim:"Jl. Anggrek 7",
      noNpwp:"09.005.006.7-104.008",
      jenisHarga:"Standar",
      namaPajak:"Pelanggan 1",
      kotaPajak:"SURABAYA",
      plafon:25000000,
      plafonTemp:4000000,
      alamatPajak:"Jl. Anggrek 7",
      tempo:0,
      tempoLama:7,
      tempoKom:3,
      virtualAc:"BCA 1000000004",
      alamatTagih:"Jl. Anggrek 7",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 5", telepon:"081255556670", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 6", telepon:"02170104", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Hadi", alamatKirim:"Jl. Anggrek 7", kota:"SURABAYA", telepon:"081300001111", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 5", alamatKirim:"Jl. Kirim No. 14", kota:"SURABAYA", telepon:"081300001111", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.005.006.7-104.008", namaNpwp:"Pelanggan 1", alamat:"Jl. Anggrek 7" },
          { noNpwp:"09.009.010.000-204.000", namaNpwp:"Cabang SURABAYA", alamat:"Jl. Anggrek 7" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:500000, awalPpn:10 },
          { periode:"202606", awalTitipan:300000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:12500000 },
          { periode:"202606", nilaiAwal:4800000 }
        ]
  },
  {
      name:"KAVI",
      code:"KV001",
      alamat:"Jl. Kenari 88",
      kota:"JAKARTA",
      tel:"02199887766",
      pemilik:"asdfas",
      nik:"3174012345001",
      email:"kavi@example.com",
      kontak:"02199887766",
      flag:null,
      kodeSales:"SL002", namaSales:"Sales Senior",
      noKtp:"3174012345001",
      namaKtp:"asdfas",
      tglLahir:"1990-01-01T00:00:00",
      owner:"asdfas",
      namaPemesan:"asdfas",
      area:"Jabodetabek",
      kodeGabungan:"Gab-KV001",
      golongan:"Baik",
      kodePos:"10005",
      fax:"0211000005",
      klasifikasi:"Distributor",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan KAVI",
      alamatKirim:"Jl. Kenari 88",
      noNpwp:"09.006.007.8-105.009",
      jenisHarga:"Standar",
      namaPajak:"KAVI",
      kotaPajak:"JAKARTA",
      plafon:30000000,
      plafonTemp:5000000,
      alamatPajak:"Jl. Kenari 88",
      tempo:7,
      tempoLama:14,
      tempoKom:10,
      virtualAc:"BCA 1000000005",
      alamatTagih:"Jl. Kenari 88",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 6", telepon:"081255556671", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 7", telepon:"02170105", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"asdfas", alamatKirim:"Jl. Kenari 88", kota:"JAKARTA", telepon:"02199887766", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 6", alamatKirim:"Jl. Kirim No. 15", kota:"JAKARTA", telepon:"02199887766", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.006.007.8-105.009", namaNpwp:"KAVI", alamat:"Jl. Kenari 88" },
          { noNpwp:"09.010.011.000-205.000", namaNpwp:"Cabang JAKARTA", alamat:"Jl. Kenari 88" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:600000, awalPpn:10 },
          { periode:"202606", awalTitipan:375000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:15000000 },
          { periode:"202606", nilaiAwal:6000000 }
        ]
  },
  {
      name:"Lia Malik",
      code:"L001",
      alamat:"Blok M",
      kota:"JKT",
      tel:"9725",
      pemilik:"Alex",
      nik:"12345",
      email:"lia@pdj.com",
      kontak:"Lia",
      flag:null,
      kodeSales:"SL003", namaSales:"Sales Junior 1",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Jawa Barat",
      kodeGabungan:"Gab-L001",
      golongan:"Baik",
      kodePos:"10006",
      fax:"0211000006",
      klasifikasi:"Korporat",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Lia Malik",
      alamatKirim:"Blok M",
      noNpwp:"09.007.008.9-106.010",
      jenisHarga:"Standar",
      namaPajak:"Lia Malik",
      kotaPajak:"JKT",
      plafon:35000000,
      plafonTemp:6000000,
      alamatPajak:"Blok M",
      tempo:14,
      tempoLama:21,
      tempoKom:17,
      virtualAc:"BCA 1000000006",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 7", telepon:"081255556672", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 8", telepon:"02170106", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"9725", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 7", alamatKirim:"Jl. Kirim No. 16", kota:"JKT", telepon:"Lia", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.007.008.9-106.010", namaNpwp:"Lia Malik", alamat:"Blok M" },
          { noNpwp:"09.011.012.000-206.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:700000, awalPpn:9.5 },
          { periode:"202606", awalTitipan:450000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:17500000 },
          { periode:"202606", nilaiAwal:7200000 }
        ]
  },
  {
      name:"Lanny Wijaya",
      code:"L002",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"lanny@pdj.com",
      kontak:"Lanny",
      flag:null,
      kodeSales:"SL004", namaSales:"Sales Junior 2",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Jawa Timur",
      kodeGabungan:"Gab-L002",
      golongan:"Blokir",
      kodePos:"10007",
      fax:"0211000007",
      klasifikasi:"Project",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Lanny Wijaya",
      alamatKirim:"Blok M",
      noNpwp:"09.008.009.10-107.011",
      jenisHarga:"Standar",
      namaPajak:"Lanny Wijaya",
      kotaPajak:"JKT",
      plafon:40000000,
      plafonTemp:7000000,
      alamatPajak:"Blok M",
      tempo:21,
      tempoLama:28,
      tempoKom:24,
      virtualAc:"BCA 1000000007",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 8", telepon:"081255556673", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 9", telepon:"02170107", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 8", alamatKirim:"Jl. Kirim No. 17", kota:"JKT", telepon:"Lanny", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.008.009.10-107.011", namaNpwp:"Lanny Wijaya", alamat:"Blok M" },
          { noNpwp:"09.012.013.000-207.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:800000, awalPpn:11 },
          { periode:"202606", awalTitipan:525000, awalPpn:9.5 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:20000000 },
          { periode:"202606", nilaiAwal:8400000 }
        ]
  },
  {
      name:"Lusista Wijaya 2",
      code:"L015",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"lusista@pdj.com",
      kontak:"Lusista",
      flag:null,
      kodeSales:"SL001", namaSales:"Sales Baru 2",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Jawa Tengah",
      kodeGabungan:"Gab-L015",
      golongan:"Baik",
      kodePos:"10008",
      fax:"0211000008",
      klasifikasi:"Retail",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Lusista Wijaya 2",
      alamatKirim:"Blok M",
      noNpwp:"09.009.010.11-108.012",
      jenisHarga:"Standar",
      namaPajak:"Lusista Wijaya 2",
      kotaPajak:"JKT",
      plafon:45000000,
      plafonTemp:8000000,
      alamatPajak:"Blok M",
      tempo:0,
      tempoLama:7,
      tempoKom:3,
      virtualAc:"BCA 1000000008",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 9", telepon:"081255556674", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 10", telepon:"02170108", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 9", alamatKirim:"Jl. Kirim No. 18", kota:"JKT", telepon:"Lusista", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.009.010.11-108.012", namaNpwp:"Lusista Wijaya 2", alamat:"Blok M" },
          { noNpwp:"09.013.014.000-208.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:900000, awalPpn:11 },
          { periode:"202606", awalTitipan:600000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:22500000 },
          { periode:"202606", nilaiAwal:9600000 }
        ]
  },
  {
      name:"Lusiska",
      code:"L0151",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"lusiska@pdj.com",
      kontak:"Lusiska",
      flag:null,
      kodeSales:"SL002", namaSales:"Sales Senior",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Sumatera",
      kodeGabungan:"Gab-L0151",
      golongan:"Baik",
      kodePos:"10009",
      fax:"0211000009",
      klasifikasi:"Distributor",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Lusiska",
      alamatKirim:"Blok M",
      noNpwp:"09.010.011.12-109.013",
      jenisHarga:"Standar",
      namaPajak:"Lusiska",
      kotaPajak:"JKT",
      plafon:50000000,
      plafonTemp:9000000,
      alamatPajak:"Blok M",
      tempo:7,
      tempoLama:14,
      tempoKom:10,
      virtualAc:"BCA 1000000009",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 10", telepon:"081255556675", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 11", telepon:"02170109", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 10", alamatKirim:"Jl. Kirim No. 19", kota:"JKT", telepon:"Lusiska", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.010.011.12-109.013", namaNpwp:"Lusiska", alamat:"Blok M" },
          { noNpwp:"09.014.015.000-209.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1000000, awalPpn:10 },
          { periode:"202606", awalTitipan:675000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:25000000 },
          { periode:"202606", nilaiAwal:10800000 }
        ]
  },
  {
      name:"Pelanggan 40000000",
      code:"p12345",
      alamat:"Jl. Sudirman Kav. 10",
      kota:"JAKARTA",
      tel:"09089876655",
      pemilik:"Khalid",
      nik:"2135678910",
      email:"jayasadiq@gmail.com",
      kontak:"09089876655",
      flag:null,
      kodeSales:"SL003", namaSales:"Sales Junior 1",
      noKtp:"2135678910",
      namaKtp:"Khalid",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Khalid",
      namaPemesan:"Khalid",
      area:"Jabodetabek",
      kodeGabungan:"Gab-p12345",
      golongan:"Baik",
      kodePos:"10010",
      fax:"0211000010",
      klasifikasi:"Korporat",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Pelanggan 40000000",
      alamatKirim:"Jl. Sudirman Kav. 10",
      noNpwp:"09.011.012.13-110.014",
      jenisHarga:"Standar",
      namaPajak:"Pelanggan 40000000",
      kotaPajak:"JAKARTA",
      plafon:55000000,
      plafonTemp:10000000,
      alamatPajak:"Jl. Sudirman Kav. 10",
      tempo:14,
      tempoLama:21,
      tempoKom:17,
      virtualAc:"BCA 1000000010",
      alamatTagih:"Jl. Sudirman Kav. 10",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 11", telepon:"081255556676", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 12", telepon:"02170110", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Khalid", alamatKirim:"Jl. Sudirman Kav. 10", kota:"JAKARTA", telepon:"09089876655", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 11", alamatKirim:"Jl. Kirim No. 20", kota:"JAKARTA", telepon:"09089876655", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.011.012.13-110.014", namaNpwp:"Pelanggan 40000000", alamat:"Jl. Sudirman Kav. 10" },
          { noNpwp:"09.015.016.000-210.000", namaNpwp:"Cabang JAKARTA", alamat:"Jl. Sudirman Kav. 10" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1100000, awalPpn:10 },
          { periode:"202606", awalTitipan:750000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:27500000 },
          { periode:"202606", nilaiAwal:12000000 }
        ]
  },
  {
      name:"INDOMILK 2",
      code:"P105",
      alamat:"Jl.Mutiara",
      kota:"Sampang",
      tel:"00872",
      pemilik:"Affan Maulana Zulkamain",
      nik:"",
      email:"indomilk@example.com",
      kontak:"Kosong Bro",
      flag:null,
      kodeSales:"SL004", namaSales:"Sales Junior 2",
      noKtp:"3175000000011",
      namaKtp:"Affan Maulana Zulkamain",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Affan Maulana Zulkamain",
      namaPemesan:"Affan Maulana Zulkamain",
      area:"Jawa Barat",
      kodeGabungan:"Gab-P105",
      golongan:"Baik",
      kodePos:"10011",
      fax:"0211000011",
      klasifikasi:"Project",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan INDOMILK 2",
      alamatKirim:"Jl.Mutiara",
      noNpwp:"09.012.013.14-111.015",
      jenisHarga:"Standar",
      namaPajak:"INDOMILK 2",
      kotaPajak:"Sampang",
      plafon:60000000,
      plafonTemp:11000000,
      alamatPajak:"Jl.Mutiara",
      tempo:21,
      tempoLama:28,
      tempoKom:24,
      virtualAc:"BCA 1000000011",
      alamatTagih:"Jl.Mutiara",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 12", telepon:"081255556677", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 13", telepon:"02170111", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Affan Maulana Zulkamain", alamatKirim:"Jl.Mutiara", kota:"Sampang", telepon:"00872", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 12", alamatKirim:"Jl. Kirim No. 21", kota:"Sampang", telepon:"Kosong Bro", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.012.013.14-111.015", namaNpwp:"INDOMILK 2", alamat:"Jl.Mutiara" },
          { noNpwp:"09.016.017.000-211.000", namaNpwp:"Cabang Sampang", alamat:"Jl.Mutiara" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1200000, awalPpn:9.5 },
          { periode:"202606", awalTitipan:825000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:30000000 },
          { periode:"202606", nilaiAwal:13200000 }
        ]
  },
  {
      name:"PELANGGAN H",
      code:"P34567",
      alamat:"JL KEDUNG BARUK NO 588S",
      kota:"SURABAYA",
      tel:"08145678967",
      pemilik:"David",
      nik:"",
      email:"davidcompany@gmail.com",
      kontak:"08145678967",
      flag:null,
      kodeSales:"SL001", namaSales:"Sales Baru 2",
      noKtp:"3175000000012",
      namaKtp:"David",
      tglLahir:"1990-01-01T00:00:00",
      owner:"David",
      namaPemesan:"David",
      area:"Jawa Timur",
      kodeGabungan:"Gab-P34567",
      golongan:"Baik",
      kodePos:"10012",
      fax:"0211000012",
      klasifikasi:"Retail",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan PELANGGAN H",
      alamatKirim:"JL KEDUNG BARUK NO 588S",
      noNpwp:"09.013.014.15-112.016",
      jenisHarga:"Standar",
      namaPajak:"PELANGGAN H",
      kotaPajak:"SURABAYA",
      plafon:65000000,
      plafonTemp:12000000,
      alamatPajak:"JL KEDUNG BARUK NO 588S",
      tempo:0,
      tempoLama:7,
      tempoKom:3,
      virtualAc:"BCA 1000000012",
      alamatTagih:"JL KEDUNG BARUK NO 588S",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 13", telepon:"081255556678", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 14", telepon:"02170112", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"David", alamatKirim:"JL KEDUNG BARUK NO 588S", kota:"SURABAYA", telepon:"08145678967", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 13", alamatKirim:"Jl. Kirim No. 22", kota:"SURABAYA", telepon:"08145678967", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.013.014.15-112.016", namaNpwp:"PELANGGAN H", alamat:"JL KEDUNG BARUK NO 588S" },
          { noNpwp:"09.017.018.000-212.000", namaNpwp:"Cabang SURABAYA", alamat:"JL KEDUNG BARUK NO 588S" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1300000, awalPpn:11 },
          { periode:"202606", awalTitipan:900000, awalPpn:9.5 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:32500000 },
          { periode:"202606", nilaiAwal:14400000 }
        ]
  },
  {
      name:"PELANGGAN I",
      code:"P86432",
      alamat:"JL GRESIKAN NO 20000",
      kota:"SURABAYA",
      tel:"08506789009",
      pemilik:"Siti",
      nik:"",
      email:"siticompany@gmail.com",
      kontak:"08145678967",
      flag:null,
      kodeSales:"SL002", namaSales:"Sales Senior",
      noKtp:"3175000000013",
      namaKtp:"Siti",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Siti",
      namaPemesan:"Siti",
      area:"Jawa Tengah",
      kodeGabungan:"Gab-P86432",
      golongan:"Baik",
      kodePos:"10013",
      fax:"0211000013",
      klasifikasi:"Distributor",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan PELANGGAN I",
      alamatKirim:"JL GRESIKAN NO 20000",
      noNpwp:"09.014.015.16-113.017",
      jenisHarga:"Standar",
      namaPajak:"PELANGGAN I",
      kotaPajak:"SURABAYA",
      plafon:70000000,
      plafonTemp:13000000,
      alamatPajak:"JL GRESIKAN NO 20000",
      tempo:7,
      tempoLama:14,
      tempoKom:10,
      virtualAc:"BCA 1000000013",
      alamatTagih:"JL GRESIKAN NO 20000",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 14", telepon:"081255556679", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 15", telepon:"02170113", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Siti", alamatKirim:"JL GRESIKAN NO 20000", kota:"SURABAYA", telepon:"08506789009", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 14", alamatKirim:"Jl. Kirim No. 23", kota:"SURABAYA", telepon:"08145678967", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.014.015.16-113.017", namaNpwp:"PELANGGAN I", alamat:"JL GRESIKAN NO 20000" },
          { noNpwp:"09.018.019.000-213.000", namaNpwp:"Cabang SURABAYA", alamat:"JL GRESIKAN NO 20000" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1400000, awalPpn:11 },
          { periode:"202606", awalTitipan:975000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:35000000 },
          { periode:"202606", nilaiAwal:15600000 }
        ]
  },
  {
      name:"PELANGGAN BARU",
      code:"PRB01",
      alamat:"JAI AN JAI AN NO 1234",
      kota:"SURABAYA",
      tel:"08312345678",
      pemilik:"NISA",
      nik:"1234567890",
      email:"nisa@gmail.com",
      kontak:"08765654321",
      flag:null,
      kodeSales:"SL003", namaSales:"Sales Junior 1",
      noKtp:"1234567890",
      namaKtp:"NISA",
      tglLahir:"1990-01-01T00:00:00",
      owner:"NISA",
      namaPemesan:"NISA",
      area:"Sumatera",
      kodeGabungan:"Gab-PRB01",
      golongan:"Blokir",
      kodePos:"10014",
      fax:"0211000014",
      klasifikasi:"Korporat",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan PELANGGAN BARU",
      alamatKirim:"JAI AN JAI AN NO 1234",
      noNpwp:"09.015.016.17-114.018",
      jenisHarga:"Standar",
      namaPajak:"PELANGGAN BARU",
      kotaPajak:"SURABAYA",
      plafon:75000000,
      plafonTemp:14000000,
      alamatPajak:"JAI AN JAI AN NO 1234",
      tempo:14,
      tempoLama:21,
      tempoKom:17,
      virtualAc:"BCA 1000000014",
      alamatTagih:"JAI AN JAI AN NO 1234",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 15", telepon:"081255556680", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 16", telepon:"02170114", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"NISA", alamatKirim:"JAI AN JAI AN NO 1234", kota:"SURABAYA", telepon:"08312345678", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 15", alamatKirim:"Jl. Kirim No. 24", kota:"SURABAYA", telepon:"08765654321", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.015.016.17-114.018", namaNpwp:"PELANGGAN BARU", alamat:"JAI AN JAI AN NO 1234" },
          { noNpwp:"09.019.020.000-214.000", namaNpwp:"Cabang SURABAYA", alamat:"JAI AN JAI AN NO 1234" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1500000, awalPpn:10 },
          { periode:"202606", awalTitipan:1050000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:37500000 },
          { periode:"202606", nilaiAwal:16800000 }
        ]
  },
  {
      name:"Pelanggan 3",
      code:"PLG03",
      alamat:"Jl.Pattimura no 123",
      kota:"malang",
      tel:"089623653463/8123…",
      pemilik:"Mans",
      nik:"12345678910",
      email:"pelanggan3@pdj.com",
      kontak:"08912345657",
      flag:"pink",
      kodeSales:"SL004", namaSales:"Sales Junior 2",
      noKtp:"12345678910",
      namaKtp:"Mans",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Mans",
      namaPemesan:"Mans",
      area:"Jabodetabek",
      kodeGabungan:"Gab-PLG03",
      golongan:"Baik",
      kodePos:"10015",
      fax:"0211000015",
      klasifikasi:"Project",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Pelanggan 3",
      alamatKirim:"Jl.Pattimura no 123",
      noNpwp:"09.016.017.18-115.019",
      jenisHarga:"Standar",
      namaPajak:"Pelanggan 3",
      kotaPajak:"malang",
      plafon:80000000,
      plafonTemp:15000000,
      alamatPajak:"Jl.Pattimura no 123",
      tempo:21,
      tempoLama:28,
      tempoKom:24,
      virtualAc:"BCA 1000000015",
      alamatTagih:"Jl.Pattimura no 123",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 16", telepon:"081255556681", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 17", telepon:"02170115", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Mans", alamatKirim:"Jl.Pattimura no 123", kota:"malang", telepon:"089623653463/8123…", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 16", alamatKirim:"Jl. Kirim No. 25", kota:"malang", telepon:"08912345657", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.016.017.18-115.019", namaNpwp:"Pelanggan 3", alamat:"Jl.Pattimura no 123" },
          { noNpwp:"09.020.021.000-215.000", namaNpwp:"Cabang malang", alamat:"Jl.Pattimura no 123" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1600000, awalPpn:10 },
          { periode:"202606", awalTitipan:1125000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:40000000 },
          { periode:"202606", nilaiAwal:18000000 }
        ]
  },
  {
      name:"Perusahaan 7",
      code:"PT07",
      alamat:"jl mawar no 12345",
      kota:"Jakarta",
      tel:"08123456578",
      pemilik:"Kiki",
      nik:"12345789",
      email:"perusahaan7@gmail.com",
      kontak:"08712345672",
      flag:"pink",
      kodeSales:"SL001", namaSales:"Sales Baru 2",
      noKtp:"12345789",
      namaKtp:"Kiki",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Kiki",
      namaPemesan:"Kiki",
      area:"Jawa Barat",
      kodeGabungan:"Gab-PT07",
      golongan:"Baik",
      kodePos:"10016",
      fax:"0211000016",
      klasifikasi:"Retail",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Perusahaan 7",
      alamatKirim:"jl mawar no 12345",
      noNpwp:"09.017.018.19-116.020",
      jenisHarga:"Standar",
      namaPajak:"Perusahaan 7",
      kotaPajak:"Jakarta",
      plafon:85000000,
      plafonTemp:16000000,
      alamatPajak:"jl mawar no 12345",
      tempo:0,
      tempoLama:7,
      tempoKom:3,
      virtualAc:"BCA 1000000016",
      alamatTagih:"jl mawar no 12345",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 17", telepon:"081255556682", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 18", telepon:"02170116", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Kiki", alamatKirim:"jl mawar no 12345", kota:"Jakarta", telepon:"08123456578", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 17", alamatKirim:"Jl. Kirim No. 26", kota:"Jakarta", telepon:"08712345672", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.017.018.19-116.020", namaNpwp:"Perusahaan 7", alamat:"jl mawar no 12345" },
          { noNpwp:"09.021.022.000-216.000", namaNpwp:"Cabang Jakarta", alamat:"jl mawar no 12345" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1700000, awalPpn:9.5 },
          { periode:"202606", awalTitipan:1200000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:42500000 },
          { periode:"202606", nilaiAwal:19200000 }
        ]
  },
  {
      name:"Reynold",
      code:"R003",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"reynold1@pdj.com",
      kontak:"Reynold",
      flag:null,
      kodeSales:"SL002", namaSales:"Sales Senior",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Jawa Timur",
      kodeGabungan:"Gab-R003",
      golongan:"Baik",
      kodePos:"10017",
      fax:"0211000017",
      klasifikasi:"Distributor",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Reynold",
      alamatKirim:"Blok M",
      noNpwp:"09.018.019.20-117.021",
      jenisHarga:"Standar",
      namaPajak:"Reynold",
      kotaPajak:"JKT",
      plafon:90000000,
      plafonTemp:17000000,
      alamatPajak:"Blok M",
      tempo:7,
      tempoLama:14,
      tempoKom:10,
      virtualAc:"BCA 1000000017",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 18", telepon:"081255556683", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 19", telepon:"02170117", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 18", alamatKirim:"Jl. Kirim No. 27", kota:"JKT", telepon:"Reynold", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.018.019.20-117.021", namaNpwp:"Reynold", alamat:"Blok M" },
          { noNpwp:"09.022.023.000-217.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1800000, awalPpn:11 },
          { periode:"202606", awalTitipan:1275000, awalPpn:9.5 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:45000000 },
          { periode:"202606", nilaiAwal:20400000 }
        ]
  },
  {
      name:"Reynold 2",
      code:"R006",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"reynold2@pdj.com",
      kontak:"Reynold",
      flag:null,
      kodeSales:"SL003", namaSales:"Sales Junior 1",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Jawa Tengah",
      kodeGabungan:"Gab-R006",
      golongan:"Baik",
      kodePos:"10018",
      fax:"0211000018",
      klasifikasi:"Korporat",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Reynold 2",
      alamatKirim:"Blok M",
      noNpwp:"09.019.020.21-118.022",
      jenisHarga:"Standar",
      namaPajak:"Reynold 2",
      kotaPajak:"JKT",
      plafon:95000000,
      plafonTemp:18000000,
      alamatPajak:"Blok M",
      tempo:14,
      tempoLama:21,
      tempoKom:17,
      virtualAc:"BCA 1000000018",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 19", telepon:"081255556684", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 20", telepon:"02170118", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 19", alamatKirim:"Jl. Kirim No. 28", kota:"JKT", telepon:"Reynold", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.019.020.21-118.022", namaNpwp:"Reynold", alamat:"Blok M" },
          { noNpwp:"09.023.024.000-218.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:1900000, awalPpn:11 },
          { periode:"202606", awalTitipan:1350000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:47500000 },
          { periode:"202606", nilaiAwal:21600000 }
        ]
  },
  {
      name:"Reynold Pratama",
      code:"R009",
      alamat:"Blok M",
      kota:"JKT",
      tel:"5555",
      pemilik:"Alex",
      nik:"12345",
      email:"reynold.p@pdj.com",
      kontak:"Reynold",
      flag:null,
      kodeSales:"SL004", namaSales:"Sales Junior 2",
      noKtp:"12345",
      namaKtp:"Alex",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Alex",
      namaPemesan:"Alex",
      area:"Sumatera",
      kodeGabungan:"Gab-R009",
      golongan:"Baik",
      kodePos:"10019",
      fax:"0211000019",
      klasifikasi:"Project",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Reynold Pratama",
      alamatKirim:"Blok M",
      noNpwp:"09.020.021.22-119.023",
      jenisHarga:"Standar",
      namaPajak:"Reynold Pratama",
      kotaPajak:"JKT",
      plafon:100000000,
      plafonTemp:19000000,
      alamatPajak:"Blok M",
      tempo:21,
      tempoLama:28,
      tempoKom:24,
      virtualAc:"BCA 1000000019",
      alamatTagih:"Blok M",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 20", telepon:"081255556685", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 21", telepon:"02170119", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Alex", alamatKirim:"Blok M", kota:"JKT", telepon:"5555", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 20", alamatKirim:"Jl. Kirim No. 29", kota:"JKT", telepon:"Reynold", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.020.021.22-119.023", namaNpwp:"Reynold Pratama", alamat:"Blok M" },
          { noNpwp:"09.024.025.000-219.000", namaNpwp:"Cabang JKT", alamat:"Blok M" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:2000000, awalPpn:10 },
          { periode:"202606", awalTitipan:1425000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:50000000 },
          { periode:"202606", nilaiAwal:22800000 }
        ]
  },
  {
      name:"Sari Mart",
      code:"S101",
      alamat:"Jl. Kenanga 22",
      kota:"Jakarta",
      tel:"02199887766",
      pemilik:"Sari Dewi",
      nik:"3174012345",
      email:"sarimart@gmail.com",
      kontak:"08123456789",
      flag:null,
      kodeSales:"SL001", namaSales:"Sales Baru 2",
      noKtp:"3174012345",
      namaKtp:"Sari Dewi",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Sari Dewi",
      namaPemesan:"Sari Dewi",
      area:"Jabodetabek",
      kodeGabungan:"Gab-S101",
      golongan:"Baik",
      kodePos:"10020",
      fax:"0211000020",
      klasifikasi:"Retail",
      fk:"F",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Sari Mart",
      alamatKirim:"Jl. Kenanga 22",
      noNpwp:"09.021.022.23-120.024",
      jenisHarga:"Standar",
      namaPajak:"Sari Mart",
      kotaPajak:"Jakarta",
      plafon:105000000,
      plafonTemp:20000000,
      alamatPajak:"Jl. Kenanga 22",
      tempo:0,
      tempoLama:7,
      tempoKom:3,
      virtualAc:"BCA 1000000020",
      alamatTagih:"Jl. Kenanga 22",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 21", telepon:"081255556686", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 22", telepon:"02170120", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Sari Dewi", alamatKirim:"Jl. Kenanga 22", kota:"Jakarta", telepon:"02199887766", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 21", alamatKirim:"Jl. Kirim No. 30", kota:"Jakarta", telepon:"08123456789", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.021.022.23-120.024", namaNpwp:"Sari Mart", alamat:"Jl. Kenanga 22" },
          { noNpwp:"09.025.026.000-220.000", namaNpwp:"Cabang Jakarta", alamat:"Jl. Kenanga 22" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:2100000, awalPpn:10 },
          { periode:"202606", awalTitipan:1500000, awalPpn:10 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:52500000 },
          { periode:"202606", nilaiAwal:24000000 }
        ]
  },
  {
      name:"Toko Jaya Abadi",
      code:"T201",
      alamat:"Jl. Sudirman 45",
      kota:"Bandung",
      tel:"02288776655",
      pemilik:"Joko Susilo",
      nik:"3273098765",
      email:"jayaabadi@gmail.com",
      kontak:"08198765432",
      flag:null,
      kodeSales:"SL002", namaSales:"Sales Senior",
      noKtp:"3273098765",
      namaKtp:"Joko Susilo",
      tglLahir:"1990-01-01T00:00:00",
      owner:"Joko Susilo",
      namaPemesan:"Joko Susilo",
      area:"Jawa Barat",
      kodeGabungan:"Gab-T201",
      golongan:"Blokir",
      kodePos:"10021",
      fax:"0211000021",
      klasifikasi:"Distributor",
      fk:"K",
      status:"Aktif",
      keterangan:"Data lengkap pelanggan Toko Jaya Abadi",
      alamatKirim:"Jl. Sudirman 45",
      noNpwp:"09.022.023.24-121.025",
      jenisHarga:"Standar",
      namaPajak:"Toko Jaya Abadi",
      kotaPajak:"Bandung",
      plafon:110000000,
      plafonTemp:21000000,
      alamatPajak:"Jl. Sudirman 45",
      tempo:7,
      tempoLama:14,
      tempoKom:10,
      virtualAc:"BCA 1000000021",
      alamatTagih:"Jl. Sudirman 45",
      creator:"PDJ Administrator", jamCreate:"2026-07-01T09:00:00", editor:"", jamEdit:null,
      expedisi:[
          { expedisi:"Gojek", alamatExpedisi:"Jl. Expedisi No. 22", telepon:"081255556687", keterangan:"Ekspedisi utama" },
          { expedisi:"JNE", alamatExpedisi:"Jl. Cargo 23", telepon:"02170121", keterangan:"Reguler" }
        ],
      alamatKirimList:[
          { namaPenerima:"Joko Susilo", alamatKirim:"Jl. Sudirman 45", kota:"Bandung", telepon:"02288776655", keterangan:"Alamat utama" },
          { namaPenerima:"Penerima 22", alamatKirim:"Jl. Kirim No. 31", kota:"Bandung", telepon:"08198765432", keterangan:"Cabang" }
        ],
      npwpList:[
          { noNpwp:"09.022.023.24-121.025", namaNpwp:"Toko Jaya Abadi", alamat:"Jl. Sudirman 45" },
          { noNpwp:"09.026.027.000-221.000", namaNpwp:"Cabang Bandung", alamat:"Jl. Sudirman 45" }
        ],
      saldoTitipan:[
          { periode:"202607", awalTitipan:2200000, awalPpn:9.5 },
          { periode:"202606", awalTitipan:1575000, awalPpn:11 }
        ],
      saldoPiutang:[
          { periode:"202607", nilaiAwal:55000000 },
          { periode:"202606", nilaiAwal:25200000 }
        ]
  }
];
