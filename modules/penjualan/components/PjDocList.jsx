// Penjualan — daftar dokumen generik (dipakai Order Penjualan / Pengiriman Penjualan / Nota
// Penjualan / Retur Penjualan). Tampilan memakai PjErpList (gaya ERP asli).
//
// statusFilter (opsional): { options:[{value,label}], match:(row, selectedValue)=>boolean }
// onCancelDoc (opsional): kalau diisi, tampil icon "Batalkan Transaksi" di kolom Aksi —
//   disabled (bukan disembunyikan) kalau dokumen sudah batal.
// onView (opsional): klik baris/No.Bukti buka mode VIEW. Kalau tidak diisi, klik baris
//   memanggil onEdit juga.
// onCetak (opsional): tombol Cetak di toolbar, buka PjCetakModal dengan semua baris tercentang.
//   onCetakRow (opsional): icon Cetak per baris di kolom Aksi (hanya baris itu yang tercentang).

function PjDocList({ title, rows, columns, onAdd, onView, onEdit, onCancelDoc, onCetak, onCetakRow, addLabel = 'Buat Baru', statusFilter }) {
  const isCancelled = (r) => !!(r.Batal || r.Status === 'BATAL');
  return (
    <PjErpList
      title={title}
      rows={rows}
      columns={columns}
      rowKey="No_Bukti"
      onAdd={onAdd}
      addLabel={addLabel}
      onCetak={onCetak}
      onRowClick={onView || onEdit}
      statusFilter={statusFilter}
      renderActions={(r) => (
        <>
          <button className="erp-btn-icon sm" title="Edit" onClick={() => onEdit(r)}>{I.edit()}</button>
          {onCancelDoc && (
            <button className="erp-btn-icon sm del" title={isCancelled(r) ? 'Sudah dibatalkan' : 'Batalkan Transaksi'}
              disabled={isCancelled(r)} onClick={() => onCancelDoc(r)}>{I.fileX(14)}</button>
          )}
          <button className="erp-btn-icon sm" title="Cetak"
            onClick={() => onCetakRow ? onCetakRow(r) : (window.__erpToast && window.__erpToast('Fitur cetak belum tersedia pada prototipe ini.'))}>{I.print()}</button>
        </>
      )}
    />
  );
}
