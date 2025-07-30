import { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function UploadImage() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Selecciona un archivo primero.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      // ✅ CORRECCIÓN AQUÍ: La URL debe ser /api/upload/upload para coincidir con tu backend
      const res = await axios.post(`${API_BASE_URL}/api/upload/upload`, formData);
      setImageUrl(res.data.imageUrl);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error al subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subir Imagen de Producto</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <br />

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Subiendo..." : "Subir Imagen"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

        {imageUrl && (
            <div className="mt-4">
                <p className="text-green-600">Imagen subida exitosamente:</p>
                <img
                    src={`${API_BASE_URL}${imageUrl}`}
                    alt="Preview"
                    className="mt-2 w-48 rounded shadow"
                />
                <p className="mt-2 text-sm text-gray-700 break-all">
                    URL: <code>${API_BASE_URL}${imageUrl}</code>
                </p>
            </div>
        )}

    </div>
  );
}

export default UploadImage;
