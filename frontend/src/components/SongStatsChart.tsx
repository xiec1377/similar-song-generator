import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function SongStatsChart({ features }) {
  if (!features) return null;

  const featureBounds = {
    danceability: { min: 0, max: 1 },
    energy: { min: 0, max: 1 },
    acousticness: { min: 0, max: 1 },
    valence: { min: 0, max: 1 }, // emotional tone or mood
    // tempo: { min: 60, max: 200 },
    instrumentalness: { min: 0, max: 1 },
    liveness: { min: 0, max: 1 },
    speechiness: { min: 0, max: 1 },
    loudness: { min: -60, max: 0 },
  };

  const data = Object.entries(featureBounds).map(([key, bounds]) => ({
    feature: key.charAt(0).toUpperCase() + key.slice(1),
    value: (features[key] - bounds.min) / (bounds.max - bounds.min),
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="feature" />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 1]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Song Features"
            dataKey="value"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.5}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
