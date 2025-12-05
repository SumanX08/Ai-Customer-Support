// DocumentsSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function DocumentsSection({ API }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
        setMessage("");
    };

    const fetchDocuments = async () => {
        try {
            const res = await axios.get(`${API}/api/documents`);
            setDocuments(res.data || []);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async () => {
        if (!selectedFiles.length) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", selectedFiles[0]);

            const res = await axios.post(`${API}/api/documents/upload`, formData);

            setDocuments(prev => [res.data.document, ...prev]);
            setUploading(false);
            setSelectedFiles([]);
            alert("Files uploaded successfully");

        } catch (error) {
            setUploading(false);
            console.error("Upload failed:", error);
            alert("Failed to upload files");

        }
    };

    console.log("Documents:", documents);

    const handleDeleteDocument = async (id) => {
        setDocuments((prev) => prev.filter((doc) => doc._id !== id));
        try {
            await axios.delete(`${API}/api/documents/${id}`);
        } catch (err) {
            console.error("Failed to delete document:", err);

        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-gray-100 p-7 shadow-lg">

                <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">Upload Documents</h2>
                    </div>
                </div>

                <div className="mt-4 rounded-xl bg-white p-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                        <span className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-black">
                            Click to choose files
                        </span>

                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                        />
                    </label>

                    {selectedFiles.length > 0 && (
                        <div className="mt-4 max-h-40 space-y-2 overflow-auto rounded-lg p-3 text-xs">
                            {selectedFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between gap-3 rounded-md bg-gray-100 px-3 py-2"
                                >
                                    <div className="flex flex-1 flex-col truncate">
                                        <span className="truncate font-medium">{file.name}</span>
                                        <span className="text-[10px] text-slate-400">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase text-slate-500">
                                        {file.type || "Unknown"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-emerald-950 disabled:cursor-not-allowed"
                        >
                            {uploading ? "Uploading..." : "Upload Files"}
                        </button>
                    </div>

                    {message && (
                        <p className="mt-2 text-xs text-gray-700">
                            {message}
                        </p>
                    )}
                </div>

                {/* Documents list */}

            </div>

            <div className="rounded-2xl bg-gray-100 p-6 shadow-lg  ">
                <h3 className="text-sm font-semibold text-black mb-2">
                    Uploaded Documents
                </h3>

                {documents.length === 0 ? (
                    <p className="text-xs text-gray-500">No documents uploaded yet.</p>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-auto pr-1 text-xs">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                            >
                                <div className="flex flex-col truncate">
                                    <span className="truncate font-medium text-black">
                                        {doc.title || doc.originalName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {doc.path && (
                                        <a
                                            href={`${API.replace("/api", "")}/uploads/${doc.path.split('uploads\\').pop()}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-md bg-blue-500 text-black p-2 rounded"
                                        >
                                            View
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDeleteDocument(doc._id)}
                                        className="text-md bg-red-500 text-white rounded p-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

    );
}
