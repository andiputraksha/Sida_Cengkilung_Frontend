import { useState } from "react";
import Modal from "./Modal";

export default function PermohonanModal({ isOpen, onClose, permohonan, onConfirm }) {
  const [status, setStatus] = useState("diterima");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  const namaPemohon =
    permohonan?.pengguna?.nama_lengkap ||
    permohonan?.nama_lengkap ||
    permohonan?.nama_pemohon ||
    "-";

  const judulDokumen =
    permohonan?.dokumen?.judul_dokumen ||
    permohonan?.judul_dokumen ||
    "-";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(permohonan.id_permohonan, status, catatan);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Permohonan Dokumen"
      size="md"
    >
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Detail Permohonan:</h3>
        <p><span className="text-gray-600">Pemohon:</span> {namaPemohon}</p>
        <p><span className="text-gray-600">Dokumen:</span> {judulDokumen}</p>
        <p><span className="text-gray-600">Alasan:</span> {permohonan.alasan_permohonan}</p>
        <p><span className="text-gray-600">Tanggal:</span> {new Date(permohonan.tanggal_permohonan).toLocaleDateString('id-ID')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="diterima">Terima</option>
            <option value="ditolak">Tolak</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan untuk Pemohon
          </label>
          <textarea
            rows="3"
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-amber-500"
            placeholder="Masukkan catatan jika diperlukan..."
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg w-full transition duration-200 disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Simpan Keputusan"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg w-full transition duration-200"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>
  );
}

