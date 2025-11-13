import React, { useEffect, useState, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [currentSongId, setCurrentSongId] = useState(null);
  const audioRefs = useRef({});

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/songs/", {
          method: "GET",
        });
        const result = await response.json();
        console.log("got song:", result);
        setSongs(result);
      } catch (error) {
        console.error("Fetch song failed:", error);
      }
    };
    fetchSongs();
  }, []);

  const togglePlay = (id) => {
    const currentAudio = audioRefs.current[id];
    if (!currentAudio) return;
    if (currentSongId === id) {
      if (!currentAudio.paused) {
        currentAudio.pause();
        setCurrentSongId(null);
      } else {
        currentAudio.play();
        setCurrentSongId(id);
      }
      return;
    }
    Object.values(audioRefs.current).forEach((audio) => {
      if (!audio.paused) audio.pause();
    });
    currentAudio.play();
    setCurrentSongId(id);
    currentAudio.onended = () => setCurrentSongId(null);
  };
  return (
    <div className="flex flex-col">
      <h1 className="m-4">Songs</h1>
      {songs &&
        songs.map((song) => {
          // const audioSrc = `data:audio/mpeg;base64,${song.file_data}`;
          return (
            <div key={song.id} className="flex flex-row items-center pt-2 pb-2 gap-2">
              <button
                onClick={() => togglePlay(song.id)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                {currentSongId === song.id ? (
                  <FaPause className="text-gray-700" />
                ) : (
                  <FaPlay className="text-gray-700" />
                )}
              </button>

              <audio
                ref={(el) => (audioRefs.current[song.id] = el)}
                src={`data:audio/mp3;base64,${song.file_data}`}
                type="audio/mpeg"
              />

              <p className="text-sm font-medium">{song.title}</p>
            </div>
          );
        })}
    </div>
  );
}
