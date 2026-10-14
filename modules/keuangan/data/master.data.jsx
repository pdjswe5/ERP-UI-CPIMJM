// Keuangan — daftar sub-menu Kas/Bank/Giro dipakai breadcrumb (KeuanganPage). Sub-menu accounting
// (akun/aktiva/jurnal/labarugi/aruskas/neraca) TIDAK di sini — labelnya di-fallback ke
// MODULE_SUBS.keuangan (components.jsx) langsung oleh KeuanganPage, karena components.jsx
// dieksekusi lebih dulu (sebelum data file modul manapun dimuat) jadi tidak bisa saling
// mereferensikan balik. Pola sama seperti PJ_SUBS di modules/penjualan/data/master.data.jsx.
const KU_SUBS = [
  { id:'kbg',   label:'Kas, Bank & Giro',         icon:'wallet' },
  { id:'km',    label:'Kas Masuk',                 icon:'in' },
  { id:'kk',    label:'Kas Keluar',                icon:'out' },
  { id:'bm',    label:'Bank Masuk',                icon:'in' },
  { id:'bk',    label:'Bank Keluar',               icon:'out' },
  { id:'tm',    label:'Transfer Masuk',            icon:'in' },
  { id:'tk',    label:'Transfer Keluar',           icon:'out' },
  { id:'gm',    label:'Giro Masuk',                icon:'doc' },
  { id:'gk',    label:'Giro Keluar',               icon:'doc' },
  { id:'pp',    label:'Pelunasan Piutang',         icon:'check' },
  { id:'ph',    label:'Pelunasan Hutang',          icon:'check' },
];
