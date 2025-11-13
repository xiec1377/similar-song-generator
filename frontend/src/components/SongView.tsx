import React, { useEffect, useState, useRef } from "react";
import RecordSpinner from "./RecordSpinner";
import { useSong } from "../context/SongContext";
import SongStatsChart from "./SongStatsChart";

export default function SongView() {
  const { selectedSong } = useSong();
  const [songFeatures, setSongFeatures] = useState(null);

  useEffect(() => {
    if (!selectedSong?.file_data) return;
    const fetchFeatures = async () => {
      console.log("fetching audio features...");
      try {
        // vonvert base64 to blob
        const byteCharacters = atob(selectedSong.file_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mp3Blob = new Blob([byteArray], { type: "audio/mpeg" });

        // if have file, skip blobbing
        const formData = new FormData();
        formData.append("audioFile", mp3Blob, `${selectedSong.title}.mp3`);
        const response = await fetch(
          "https://api.reccobeats.com/v1/analysis/audio-features",
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await response.json();
        console.log("got song features:", result);
        setSongFeatures(result);
        // setSongs(result) or update state
      } catch (error) {
        console.error("Fetch song features failed:", error);
      }
    };
    fetchFeatures();
  }, [selectedSong]);
  return (
    <div className="flex flex-col">
      <RecordSpinner />
      {selectedSong && <div>{selectedSong.title}</div>}
      {songFeatures && <SongStatsChart features={songFeatures} />}
    </div>
  );
}
