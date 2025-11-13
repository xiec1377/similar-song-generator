import React, { useState } from "react";

export default function AudioUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "audio/mpeg") {
      setFile(uploadedFile);
      setAudioUrl(URL.createObjectURL(uploadedFile));
    } else {
      alert("Please upload a valid MP3 file.");
    }
  };

  const handleUpload = async () => {
    console.log("handling saving...");
    if (!file) return alert("No file selected");

    const formData = new FormData();
    formData.append("audioFile", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/song/",
        // "https://api.reccobeats.com/v1/analysis/audio-features",
        {
          method: "POST",
          body: formData,
        }
      );
      const result = await response.json();
      console.log("✅ Uploaded:", result);
    } catch (error) {
      console.error("❌ Upload failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl shadow-sm">
      <input type="file" accept=".mp3,audio/mpeg" onChange={handleFileChange} />
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-2 w-full max-w-sm" />
      )}
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Add song
      </button>
    </div>
  );
}
