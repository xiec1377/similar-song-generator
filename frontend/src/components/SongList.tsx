import React, { useEffect, useState, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useSong } from "../context/SongContext";
import AudioUpload from "./AudioUpload";

export default function SongList() {
  const [songs, setSongs] = useState([]);
  const [currentSongId, setCurrentSongId] = useState(null);
  const audioRefs = useRef({});
  const { setSelectedSong } = useSong();

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

  const handleDelete = async (songId: string) => {
    console.log("deleting song...", songId);
    try {
      const response = await fetch(`http://127.0.0.1:8000/song/${songId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      console.log("deleted song:", result);
      setSongs((prevSongs) => prevSongs.filter((s) => s.id !== songId));
      // setSongs(result);
    } catch (error) {
      console.error("Delete song failed:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-center">
        <AudioUpload songs={songs} onChange={setSongs} />
        <h2 className="m-4 text-3xl">Library</h2>
        <span></span>
      </div>
      {songs &&
        songs.map((song) => {
          // const audioSrc = `data:audio/mpeg;base64,${song.file_data}`;
          return (
            <div
              key={song.id}
              className="flex items-center justify-between pt-2 pb-2 px-2"
              onClick={() => {
                setSelectedSong(song.id); // seet to just song?
                console.log("selecting song...", song.title);
              }}
            >
              <div className="flex items-center gap-2">
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
              <p
                className="text-sm font-medium cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => handleDelete(song.id)}
              >
                delete
              </p>
            </div>
          );
        })}
    </div>
  );
}
