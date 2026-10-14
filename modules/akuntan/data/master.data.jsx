// Akuntan — daftar sub-menu dipakai breadcrumb (AkuntanPage). Isinya harus tetap sinkron dengan
// MODULE_SUBS.finance di components.jsx (dipakai tab bar) — pola sama seperti PJ_SUBS di
// modules/penjualan/data/master.data.jsx, tidak bisa disatukan karena components.jsx dieksekusi
// lebih dulu (sebelum data file modul manapun dimuat), jadi tidak bisa saling mereferensikan.
const AK_SUBS = [
  { id:'akun',     label:'Katalog Akun' },
  { id:'aktiva',   label:'Aktiva Tetap' },
  { id:'jurnal',   label:'Jurnal Memorial' },
  { id:'labarugi', label:'Laba Rugi' },
  { id:'aruskas',  label:'Laporan Arus Kas' },
  { id:'neraca',   label:'Neraca' },
];
