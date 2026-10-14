# Memory Dokumen — Implementasi Modul Pembelian ERP-UI

> **STATUS: SELESAI (2026-07-15).** Modul Pembelian sudah diimplementasikan di `pembelian.jsx` (8 sub-modul, identifier di-prefix `Pb`/`PB_`), di-wiring ke `components.jsx`/`app.jsx`/`erp.html` menggantikan modul Purchase lama. File lama (`purchase.jsx`, `po-list.jsx`, `po-detail.jsx`, `po-dialog.jsx`) dibiarkan di disk tapi sudah dilepas dari `erp.html`. Modul Penjualan (`pelanggan.jsx`) juga sekalian dirombak di sesi yang sama: bug root-cause (data tidak pernah ter-persist) diperbaiki, dan Sales Order/Invoice/Sales Return/Delivery Order dibangun ulang mengikuti field API asli. Dokumen di bawah ini disimpan sebagai riwayat rencana awal — detail struktur data/prefix nomor bukti masih akurat, tapi bagian "Status Pekerjaan" dan "Langkah Selanjutnya" di bawah sudah usang.

---

## 1. Konteks & Tujuan

Menyelaraskan modul **Purchase** yang lama dengan struktur data dan workflow backend dari Postman collection `ERP Transaksi` dan `ERP Master`.

### Tujuan Akhir
Mengganti module `Purchase` lama dengan module **Pembelian** baru yang berisi 8 sub-modul:
1. Katalog Pemasok (Master Supplier)
2. Purchase Request (PR)
3. Request for Quotation (RFQ)
4. Quotation
5. Goods Receive (GR)
6. Purchase Order (PO)
7. Nota Pembelian (Beli)
8. Retur Beli

Frontend tetap menggunakan **dummy data lokal** dan field mengikuti **snake_case backend**.

---

## 2. Keputusan Desain yang Sudah Disepakati

| # | Keputusan | Detail |
|---|---|---|
| 1 | Modul Purchase lama | Dihapus dari navigasi & routing; file lama (`purchase.jsx`, `order-pembelian.jsx`, `nota-pembelian.jsx`, `retur-pembelian.jsx`) hanya dihapus dari `erp.html`, dibiarkan menganggur. |
| 2 | Data | Dummy data lokal di frontend, tidak dihubungkan ke API. |
| 3 | Format field | Ikuti snake_case backend (contoh: `No_Bukti`, `Kode_Supp`, `Tgl_Bukti`, `DetailRows`, `Details1`, `Details2`). |
| 4 | Master data tambahan | Ditunda setelah transaksi pembelian selesai. |
| 5 | Katalog Pemasok | Mengikuti pola form bertab seperti Katalog Pelanggan, dengan **4 section/tab**: Informasi Umum, Alamat, Pajak, Tempo & Plafon. |
| 6 | Tabel detail barang | Mengikuti pola tabel data barang di menu **KO (Konfirmasi Penjualan)** — inline editable, header putih, border antar kolom, scrollable. |
| 7 | Detail2 (PO/Beli/Retur) | Sama seperti detail barang, tapi digunakan untuk **Mas Akun / biaya**. |
| 8 | Nomor bukti | Format `{prefix}{YYMM}{sequence}`. Prefix per modul sudah ditentukan (lihat tabel di bawah). |
| 9 | File utama | Satu file `pembelian.jsx` berisi semua sub-modul & dummy data, mengikuti pola `pelanggan.jsx`. |

---

## 3. Pemetaan Prefix Nomor Bukti

| Modul | Prefix | Contoh dari Sample |
|---|---|---|
| Purchase Request | `PB` | `PB26060016` |
| RFQ | `KPP` | `KPP26070001` |
| Quotation | `KPN` | `KPN26070001` |
| Goods Receive | `FTB` | `FTB26070001` |
| Purchase Order | `KPO` | `KPO26070001` |
| Nota Pembelian | `BL` | `BL25040001` |
| Retur Beli | `RB` | `RB25040001` |

Generator: `prefix + YYMM + urutan 4 digit`.

---

## 4. Struktur Data dari Sample GET

### 4.1 Katalog Pemasok (Supplier)
```json
{
  "Kode_Supp": "AG001",
  "Nama_Supp": "PT. Antigravity Test",
  "Owner": "Bob",
  "Alamat": "Jl. Teknik Kimia",
  "Kelurahan": "Keputih",
  "Kecamatan": "Sukolilo",
  "Kota": "Surabaya",
  "KodePos": "60111",
  "Telpon": "0812345678",
  "Email": "antigravity@test.com",
  "Kontak": "Alice",
  "No_NPWP": "123456789012345",
  "No_NIK": "1234567890123456",
  "Nama_Pajak": "PT. Antigravity Test",
  "Alamat_Pajak": "Jl. Teknik Kimia",
  "Kota_Pajak": "Surabaya",
  "Tempo": 0,
  "Plafon": 0,
  "Aktif": true,
  "Keterangan": "Testing supplier creation",
  "No_Id": 121
}
```

### 4.2 PR (Purchase Request)
Header tanpa supplier. Field utama:
- `No_Bukti`, `Tgl_Bukti`, `Kode_PurchasingORG`, `Ket_PurchasingORG`, `Keterangan`
- `Creator`, `Jam_Create`, `Editor`, `Jam_Edit`
- `Batal`, `Alasan_Batal`, `Status`, `Alasan_Status`, `Cetak`, `DetailRows`
- `Details`: `No_Bukti`, `Tgl_Bukti`, `Kode_Item`, `Nama_Item`, `Deskripsi`, `Qty`, `Satuan`, `Kode_Konversi`, `Konversi`, `Jam_Entry`, `Qty_Realisasi`, `No_Id_Det`

### 4.3 RFQ
Sama seperti PR tapi header ada supplier (`Kode_Supp`, `Nama_Supp`). Detail bisa mereferensi dokumen sebelumnya (`No_Bukti_From`, `No_Id_From`, `Jenis_Dok_From`).

### 4.4 Quotation
Header ada perhitungan:
- `Total_Detail`, `Ppn`, `Ppn_Include`, `Disc`, `Disc_Rp`, `Total_Dpp`, `Total_Ppn`, `Total`
- Detail ada: `Harga`, `Disc1`, `Disc2`, `DiscRp`, `JmlBruto`, `JmlDiskon`, `Jumlah`, `Jumlah_Dpp`, `Jumlah_Ppn`

### 4.5 GR (Goods Receive)
Sama seperti Quotation, ditambah:
- `Kode_Gudang`, `Nama_Gudang`, `Panjang`, `No_Coil`, `Jenis_Ref`, `No_Ref`, `No_Id_Ref`

### 4.6 PO (Purchase Order)
Struktur berbeda, punya **dua detail array**:
- `Details1` = barang
- `Details2` = biaya/lainnya

Field finansial:
- `PPN`, `PPN_Include`, `DiscPros_Head`, `NilaiDiscPros_Head`, `DiscNilai_Head`
- `SubTotal_DPP`, `Total_DPP`, `Total_PPN`, `Total_Netto`
- `Kredit_Tunai`, `Tempo`, `Jth_Tempo`, `Kondisi`, `Selesai_Manual`, `Alasan_Selesai_Manual`

### 4.7 Beli (Nota Pembelian)
Punya `Details1` (barang) dan `Details2` (biaya). Tambahan:
- `No_Sj_Inv`, `Tgl_Sj_Inv`, `No_Pajak`, `Tgl_Pajak`
- `Akun_Tunai`, `Nama_Akun_Tunai`, `Nilai_Bayar`, `Sisa_Nota`, `Jum_Cetak`

### 4.8 Retur Beli
Mirip Beli, punya `Details1` (retur barang) dan `Details2` (retur biaya). Ada `No_PajakBeli`.

---

## 5. Dummy Master Data yang Harus Dibuat

| Master | Contoh Data |
|---|---|
| Supplier | AG001, MRR001, P003, S006, S001 |
| Purchasing ORG | PCO_0001 — Divisi Pengadaan Pusat |
| Gudang | GDG001 — Gudang Utama, G01 |
| Satuan | LEMBAR, LBR, PCS, Haluan |
| Akun | 100.001 Kas Besar, 100.003 Kas Kecil |
| Produk | AA0450914100550, BB040091470550 |

---

## 6. File yang Harus Diubah

| File | Perubahan |
|---|---|
| `pembelian.jsx` | **File baru** — berisi semua dummy data, routing internal, 8 sub-halaman. |
| `components.jsx` | Hapus module `Purchase`, tambah module `Pembelian` dengan 8 sub-menu. |
| `app.jsx` | Ganti route `purchase` dengan `pembelian`. Update `activeGroup` default jika perlu. |
| `erp.html` | Ganti load `purchase.jsx` menjadi `pembelian.jsx`; hapus script file pembelian lama. |

---

## 7. Struktur Internal `pembelian.jsx`

### Bagian Atas
- Helper: `fmtRp`, `fmtNum`, `fmtDate`, `generateDocNo`, `nextSeq`
- Dummy master data
- Dummy transaksi: `DATA_SUPPLIER`, `DATA_PR`, `DATA_RFQ`, `DATA_QUOTATION`, `DATA_GR`, `DATA_PO`, `DATA_BELI`, `DATA_RETUR_BELI`

### Komponen Reusable
- `PbModalShell` — modal wrapper
- `PbHeader` — header halaman + tombol tambah
- `PbFilterBar` — filter pencarian
- `PbStatusPill` — badge status
- `InlineItemTable` — tabel detail barang/akun inline editable
- `TotalsCard` — ringkasan subtotal, diskon, PPN, total

### Sub-modul
1. `KatalogPemasokList` + `KatalogPemasokModal`
2. `PRList` + `PRModal`
3. `RFQList` + `RFQModal`
4. `QuotationList` + `QuotationModal`
5. `GRList` + `GRModal`
6. `POList` + `POModal`
7. `BeliList` + `BeliModal`
8. `ReturBeliList` + `ReturBeliModal`

### Shell
- `PembelianPage` — menerima `activeSub` dan `onSubChange`, render sub-halaman
- `PembelianModule` — wrapper yang diekspos ke `window`

---

## 8. Status Pekerjaan

### Sudah Selesai
- [x] Analisis Postman collection
- [x] Pembahasan arsitektur & keputusan desain
- [x] Pembacaan file pattern (`components.jsx`, `app.jsx`, `erp.html`, `pelanggan.jsx`)

### Belum Dikerjakan
- [ ] Update `components.jsx`
- [ ] Update `app.jsx`
- [ ] Update `erp.html`
- [ ] Buat `pembelian.jsx`
- [ ] Verifikasi sintaks JSX dengan Babel
- [ ] Test aplikasi load dengan benar

---

## 9. Langkah Selanjutnya (Next Steps)

1. Edit `components.jsx`:
   - Ganti entry `{ id: 'purchase', label: 'Purchase', icon: I.truck }` menjadi `{ id: 'pembelian', label: 'Pembelian', icon: I.truck }`.
   - Ganti `MODULE_SUBS.purchase` menjadi `MODULE_SUBS.pembelian` dengan 8 sub-menu.
   - Pastikan `GROUP_COLORS` memiliki key `pembelian` (bisa reuse warna biru `#0ea5e9`).

2. Edit `app.jsx`:
   - Ganti `if (g === 'purchase')` menjadi `if (g === 'pembelian')`.
   - Ganti `<PurchasePage ... />` menjadi `<PembelianModule activeSub={sub} onSubChange={id => onSubChange('pembelian', id)} onNavigate={navigateTo} />`.
   - Ubah `activeGroup` default dari `'purchase'` menjadi `'pembelian'`.
   - Hapus/ubah tombol tweaks "Go to Order Pembelian".

3. Edit `erp.html`:
   - Hapus baris `<script type="text/babel" src="purchase.jsx"></script>`.
   - Tambahkan `<script type="text/babel" src="pembelian.jsx"></script>` setelah `components.jsx`.

4. Buat `pembelian.jsx`:
   - Gunakan pola `pelanggan.jsx` untuk modal bertab dan tabel inline.
   - Pastikan setiap sub-modul memiliki list, filter, modal create/edit, dan detail barang sesuai struktur Postman.

5. Verifikasi:
   - Jalankan Babel compile check: `npx babel --presets @babel/preset-react pembelian.jsx` atau buka `erp.html` di browser.
   - Periksa tidak ada error di console.

---

## 10. Catatan Penting

- Jangan hapus file lama (`purchase.jsx`, `order-pembelian.jsx`, `nota-pembelian.jsx`, `retur-pembelian.jsx`) dari disk; cukup hapus dari `erp.html`.
- Semua field transaksi mengikuti sample data JSON yang diberikan user; jangan ubah nama field.
- PO, Beli, dan Retur Beli memiliki **dua array detail** (`Details1` dan `Details2`). UI-nya harus memakai dua tab/section.
- Sample data asli user disimpan di bagian 4 dokumen ini untuk referensi.
