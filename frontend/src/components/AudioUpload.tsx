import React, { useState, useRef } from "react";

export default function AudioUpload({ songs, onChange }) {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // if (uploadedFile && uploadedFile.type === "audio/mpeg") {
    //   setFile(uploadedFile);
    //   setAudioUrl(URL.createObjectURL(uploadedFile));
    // } else {
    //   alert("Please upload a valid MP3 file.");
    // }
    const formData = new FormData();
    formData.append("audioFile", file);
    try {
      const response = await fetch("http://127.0.0.1:8000/song/", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Uploaded:", result);
      onChange((prev) => [
        ...prev,
        {
          id: result.id,
          title: result.title,
          file_data: audioUrl,
        },
      ]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".mp3,audio/mpeg"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
      >
        +
      </button>
    </>
  );
}
