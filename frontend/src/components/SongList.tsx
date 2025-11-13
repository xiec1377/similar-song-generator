import React, { useEffect, useState } from "react";

export default function SongList() {
  const [songs, setSongs] = useState([]);
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

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl shadow-sm">
      {songs &&
        songs.map((song) => {
          const audioSrc = `data:audio/mpeg;base64,${song.file_data}`; // base64 tells browser file data is mp3 file

          return (
            <div key={song.id} className="flex flex-row gap-2">
              <audio controls>
                <source src={audioSrc} type="audio/mpeg" />
              </audio>{" "}
              <p>{song.title}</p>
            </div>
          );
        })}
    </div>
  );
}
