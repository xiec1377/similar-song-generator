import React, { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { AudioPlayer } from "react-wave-audio-player";


export default function RecordSpinner({ song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<Tone.Player | null>(null);
  const [pitchShift, setPitchShift] = useState(0);
  const [pitchNode, setPitchNode] = useState<Tone.PitchShift | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null); // to sync AudioPlayer UI

  // Initialize Tone.Player + PitchShift
  useEffect(() => {
    if (!song) return;

    const p = new Tone.Player({
      url: `data:audio/mp3;base64,${song.file_data}`,
      autostart: false,
      loop: false,
    });

    const pitch = new Tone.PitchShift(pitchShift).toDestination();
    p.connect(pitch);

    setPlayer(p);
    setPitchNode(pitch);

    return () => {
      p.dispose();
      pitch.dispose();
    };
  }, [song]);

  useEffect(() => {
    if (pitchNode) pitchNode.pitch = pitchShift;
  }, [pitchShift, pitchNode]);

  const handlePlayPause = async () => {
    if (!player) return;
    await Tone.start();

    if (isPlaying) {
      player.stop();
      setIsPlaying(false);
    } else {
      player.start();
      setIsPlaying(true);
    }
  };

  // Optional: keep AudioPlayer visual in sync
  const handleTimeUpdate = () => {
    if (!audioRef.current || !player) return;
    audioRef.current.currentTime = player.toSeconds();
  };

  return (
    <div className="flex flex-col items-center mt-8">
      {song && (
        <AudioPlayer
          src={`data:audio/mp3;base64,${song.file_data}`}
          ref={audioRef} // sync with Tone.Player if needed
          waveColor="#a3aed0"
          progressColor="#3311db"
          cursorColor="blue"
          // buttonsColor="#ff5722"
          barWidth={3}
          barRadius={2}
          barGap={1}
          height={80}
          playbackSpeeds={[0.5, 1, 1.5, 2]}
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
          onVolumeChange={(vol) => console.log("Volume: ", vol)}
        />
      )}

      <label className="mt-4">
        Pitch Shift (semitones):
        <input
          type="range"
          min={-12}
          max={12}
          value={pitchShift}
          onChange={(e) => setPitchShift(parseFloat(e.target.value))}
          className="ml-2"
        />
      </label>

      <button
        onClick={handlePlayPause}
        className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
