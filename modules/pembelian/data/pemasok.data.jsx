// Pembelian — config form Katalog Pemasok (master data, bukan dokumen transaksi)

function pemasokModalTabs() {
  return [
    { id:'umum', label:'Informasi Umum', type:'fields', fields:[
      { key:'Kode_Supp', label:'Kode Pemasok', required:true, mono:true },
      { key:'Nama_Supp', label:'Nama Perusahaan', required:true, span:2 },
      { key:'Owner', label:'Owner' },
      { key:'Kontak', label:'Kontak' },
      { key:'Telpon', label:'Telepon', mono:true },
      { key:'Email', label:'Email' },
      { key:'Aktif', label:'Status', type:'select', options:[{value:'true',label:'Aktif'},{value:'false',label:'Non-aktif'}] },
    ]},
    { id:'alamat', label:'Alamat', type:'fields', fields:[
      { key:'Alamat', label:'Alamat', type:'textarea', span:3 },
      { key:'Kelurahan', label:'Kelurahan' },
      { key:'Kecamatan', label:'Kecamatan' },
      { key:'Kota', label:'Kota' },
      { key:'KodePos', label:'Kode Pos', mono:true },
    ]},
    { id:'pajak', label:'Pajak', type:'fields', fields:[
      { key:'No_NPWP', label:'No. NPWP', mono:true },
      { key:'No_NIK', label:'No. NIK', mono:true },
      { key:'Nama_Pajak', label:'Nama Pajak' },
      { key:'Alamat_Pajak', label:'Alamat Pajak', type:'textarea', span:2 },
      { key:'Kota_Pajak', label:'Kota Pajak' },
    ]},
    { id:'tempo', label:'Tempo & Plafon', type:'fields', fields:[
      { key:'Tempo', label:'Tempo (hari)', type:'number' },
      { key:'Plafon', label:'Plafon', type:'number' },
      { key:'Keterangan', label:'Keterangan', type:'textarea', span:3 },
    ]},
  ];
}
