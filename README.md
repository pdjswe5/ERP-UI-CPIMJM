# PDJ ERP — Pacific Data Jaya

Prototype sistem ERP berbasis web untuk PT. Pacific Data Jaya. Dibangun dengan React 18 dan Babel Standalone — tidak memerlukan build tool atau instalasi npm.

## Modul

| Modul | Fitur |
|---|---|
| **Purchase** | Order Pembelian, Nota Pembelian, Retur Pembelian |
| **Inventory** | Katalog Barang, Mutasi, Penyesuaian, Stock Opname |
| **Pelanggan** | Katalog Pelanggan, Order & Nota Penjualan, Retur |
| **Akuntan** | Katalog Akun, Aktiva Tetap, Jurnal Memorial |
| **Keuangan** | Kas/Bank, Transfer, Giro, Pelunasan |
| **Reports** | Laporan Persediaan, SPK, Produksi |
| **Master Data** | Salesman, Gudang, Satuan, User, Menu |
| **System Admin** | Profil Perusahaan, Nilai Default, Fitur Administrator, Sesi Login |

## Cara Menjalankan

Project ini adalah aplikasi HTML statis — cukup serve file-nya dengan web server lokal.

### Github Pages
[ERP Pada Jaya](https://demo2.pacificdatajaya.com/) (custom domain — root langsung memuat `index.html`)

### Menggunakan VS Code Live Preview (Recommended)

1. Install ekstensi [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) di VS Code
2. Buka folder `ERP` di VS Code
3. Klik kanan file `index.html` → **Show Preview**
   - Atau tekan `Ctrl+Shift+P` → ketik `Live Preview: Show Preview (External Browser)`

> Konfigurasi default preview sudah diatur di `.vscode/settings.json`.

### Menggunakan Python (alternatif tanpa instalasi)

```bash
python -m http.server 8080
```

Lalu buka browser ke `http://localhost:8080/index.html`

### Menggunakan Node.js

```bash
npx serve .
```

Lalu buka URL yang muncul di terminal (root sudah memuat `index.html` otomatis).

> **Catatan:** Jangan buka `index.html` dengan double-click langsung (file://). Browser akan memblokir pemuatan file JSX karena kebijakan CORS.

## Struktur File

```
ERP/
├── index.html        # Entry point — load semua script
├── styles.css        # Global stylesheet
├── app.jsx           # App shell & routing
├── components.jsx    # TopBar, MultiTabNav, icon set, shared components
├── data.jsx          # Sample data (PO, items, suppliers)
├── dashboard.jsx     # Home dashboard
├── purchase.jsx      # Modul Purchase
├── inventory.jsx     # Modul Inventory
├── pelanggan.jsx     # Modul Pelanggan / Sales
├── akuntan.jsx       # Modul Akuntan
├── keuangan.jsx      # Modul Keuangan / Kas & Bank
├── master.jsx        # Modul Master Data
├── reports.jsx       # Modul Reports
├── admin.jsx         # Modul System Admin
├── po-list.jsx       # Komponen list Purchase Order
├── po-detail.jsx     # Komponen detail Purchase Order
├── po-dialog.jsx     # Dialog buat/edit Purchase Order
└── tweaks-panel.jsx  # Panel kustomisasi tema & layout
```

## Tech Stack

- **React 18** — via CDN (unpkg)
- **Babel Standalone** — transpile JSX langsung di browser
- **Vanilla CSS** — tanpa framework CSS eksternal
- **Font**: IBM Plex Sans & IBM Plex Mono (Google Fonts)
