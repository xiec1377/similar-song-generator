import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

function makeDistortionCurve(amount: number) {
  const k = amount * 150;
  const n = 44100;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] =
      ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
export default function AudioPlayback({ song }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const sourceNode = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilter = useRef<BiquadFilterNode | null>(null);
  const trebleFilter = useRef<BiquadFilterNode | null>(null);
  const reverb = useRef<ConvolverNode | null>(null);
  const reverbGain = useRef<GainNode | null>(null);
  const distortion = useRef<WaveShaperNode | null>(null);
  const stereo = useRef<StereoPannerNode | null>(null);
  const volumeGain = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!song) return;
    setAudioUrl(`data:audio/mp3;base64,${song.file_data}`);
  }, [song]);

  useEffect(() => {
    if (!audioUrl || !waveRef.current) return;
    if (wavesurfer.current) wavesurfer.current.destroy();
    wavesurfer.current = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#a3aed0",
      progressColor: "#4f46e5",
      cursorColor: "#6366f1",
      barWidth: 2,
      barGap: 2,
      height: 50,
      responsive: true,
      normalize: true,
      mediaControls: false,
    });
    wavesurfer.current.load(audioUrl);
    return () => {
      wavesurfer.current?.destroy();
    };
  }, [audioUrl]);

  const setupAudioGraph = () => {
    if (!wavesurfer.current) return;

    const mediaEl = wavesurfer.current.getMediaElement();
    if (!mediaEl) return;

    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
      sourceNode.current = audioCtx.current.createMediaElementSource(mediaEl);

      // volume
      volumeGain.current = audioCtx.current.createGain();
      volumeGain.current.gain.value = 1;

      // bass
      bassFilter.current = audioCtx.current.createBiquadFilter();
      bassFilter.current.type = "lowshelf";
      bassFilter.current.frequency.value = 200;
      bassFilter.current.gain.value = 0;

      // treble
      trebleFilter.current = audioCtx.current.createBiquadFilter();
      trebleFilter.current.type = "highshelf";
      trebleFilter.current.frequency.value = 3000;
      trebleFilter.current.gain.value = 0;

      // reverb
      reverb.current = audioCtx.current.createConvolver();
      reverbGain.current = audioCtx.current.createGain();
      reverbGain.current.gain.value = 0;

      const sampleRate = audioCtx.current.sampleRate;
      const impulse = audioCtx.current.createBuffer(
        2,
        0.2 * sampleRate,
        sampleRate
      );
      for (let c = 0; c < impulse.numberOfChannels; c++) {
        const ch = impulse.getChannelData(c);
        for (let i = 0; i < ch.length; i++)
          ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 2);
      }
      reverb.current.buffer = impulse;

      // distortion
      distortion.current = audioCtx.current.createWaveShaper();
      distortion.current.curve = makeDistortionCurve(0);
      distortion.current.oversample = "4x";

      // stereo
      stereo.current = audioCtx.current.createStereoPanner();
      stereo.current.pan.value = 0;

      sourceNode.current
        .connect(bassFilter.current)
        .connect(trebleFilter.current)
        .connect(distortion.current)
        .connect(stereo.current)
        .connect(volumeGain.current)
        .connect(audioCtx.current.destination);

      sourceNode.current.connect(reverb.current);
      reverb.current
        .connect(reverbGain.current)
        .connect(audioCtx.current.destination);
    }

    audioCtx.current.resume();
  };

  const togglePlay = () => {
    if (!wavesurfer.current) return;
    setupAudioGraph();
    if (wavesurfer.current.isPlaying()) {
      wavesurfer.current.pause();
    } else {
      wavesurfer.current.play();
    }
  };

  const pitchUp = () => {
    const mediaEl = wavesurfer.current?.getMediaElement();
    if (mediaEl) mediaEl.playbackRate += 0.05;
  };

  const pitchDown = () => {
    const mediaEl = wavesurfer.current?.getMediaElement();
    if (mediaEl) mediaEl.playbackRate -= 0.05;
  };

  const handleSpeed = (e) => {
    const mediaEl = wavesurfer.current?.getMediaElement();
    if (mediaEl) mediaEl.playbackRate = parseFloat(e.target.value);
  };
  const handleBass = (e) => {
    if (!bassFilter.current) return;
    bassFilter.current!.gain.value = parseFloat(e.target.value);
  };

  const handleTreble = (e) => {
    console.log("handle treble");
    if (!trebleFilter.current) return;
    trebleFilter.current!.gain.value = parseFloat(e.target.value);
  };

  const handleReverb = (e) => {
    console.log("handle reverb...");
    reverbGain.current!.gain.value = parseFloat(e.target.value);
  };

  const handleDistortion = (e) => {
    distortion.current!.curve = makeDistortionCurve(parseFloat(e.target.value));
  };

  const handleStereo = (e) => {
    stereo.current!.pan.value = parseFloat(e.target.value);
  };

  const handleVolume = (e) => {
    volumeGain.current!.gain.value = parseFloat(e.target.value);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {audioUrl && <div ref={waveRef} className="w-full" />}

      <div className="flex flex-wrap gap-3 justify-center mt-4">
        <button
          onClick={togglePlay}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          ▶ / ⏸ Play
        </button>
        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              defaultValue={0}
              onChange={handleTreble}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Treble Gain</span>
        </div>
        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              defaultValue={0}
              onChange={handleBass}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Bass Gain</span>
        </div>

        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue={0}
              onChange={handleReverb}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Reverb</span>
        </div>

        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue={0}
              onChange={handleDistortion}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Distortion</span>
        </div>

        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              defaultValue={0}
              onChange={handleStereo}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Stereo</span>
        </div>

        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              defaultValue={1}
              onChange={handleSpeed}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Speed</span>
        </div>

        {/* <button
          onClick={pitchUp}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Pitch ↑
        </button>
        <button
          onClick={pitchDown}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Pitch ↓
        </button> */}

        <div className="flex flex-col items-center gap-2 h-40">
          <div className="relative flex items-center justify-center h-full">
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              defaultValue={0}
              onChange={handleVolume}
              className="rotate-[-90deg] accent-green-600"
            />
          </div>
          <span className="text-sm font-medium mt-2">Speed</span>
        </div>
      </div>
    </div>
  );
}
