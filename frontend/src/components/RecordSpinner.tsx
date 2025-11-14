import React, { useState, useRef } from "react";
import { useSong } from "../context/SongContext";
import "../App.css";
import { AudioPlayer } from "react-wave-audio-player";

export default function RecordSpinner({ song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  console.log("song in record spinner", song);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center mt-8">
      {song && <AudioPlayer src={`data:audio/mp3;base64,${song.file_data}`} />}
      <div
        className={`w-40 h-40 rounded-full border-8 border-gray-700 bg-center bg-cover 
          ${isPlaying ? "animate-slow-spin" : ""}`}
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/3/35/Vinyl_record_LP_10inch_transparent.png')",
        }}
      />

      {/* <button type="button" className="bg-indigo-500" disabled>
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </button> */}

      <button
        onClick={handlePlayPause}
        className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      {song && (
        <audio
          ref={audioRef}
          src={`data:audio/mp3;base64,${song.file_data}`} // improve later, large files can take a while
          type="audio/mpeg"
        />
      )}
    </div>
  );
}
