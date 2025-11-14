import React, { useEffect, useState, useRef } from "react";
import RecordSpinner from "./RecordSpinner";
import { useSong } from "../context/SongContext";
import SongStatsChart from "./SongStatsChart";

export default function SongView() {
  const { selectedSong } = useSong();
  console.log("SELECTED SONG:", selectedSong);
  const [songFeatures, setSongFeatures] = useState(null);
  const [song, setSong] = useState(null);

  useEffect(() => {
    const fetchSong = async () => {
      if (!selectedSong) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/song/${selectedSong}`,
          {
            method: "GET",
          }
        );
        const result = await response.json();
        console.log("got song:", result);
        setSong(result);
      } catch (error) {
        console.error("Fetch song failed:", error);
      }
    };
    fetchSong();
  }, [selectedSong]);

  useEffect(() => {
    const fetchFeatures = async () => {
      console.log("fetching audio features...");
      if (!song?.file_data) return;
      try {
        // vonvert base64 to blob
        const byteCharacters = atob(song.file_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const mp3Blob = new Blob([byteArray], { type: "audio/mpeg" });

        // if have file, skip blobbing
        const formData = new FormData();
        formData.append("audioFile", mp3Blob, `${song.title}.mp3`);
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
  }, [song]);
  return (
    <div className="flex flex-col">
      <RecordSpinner song={song} />
      {song && <div>{song.title}</div>}
      {song && <SongStatsChart features={songFeatures} />}
    </div>
  );
}
