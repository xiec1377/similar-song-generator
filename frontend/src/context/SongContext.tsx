import { createContext, useState, useContext, ReactNode } from "react";

const SongContext = createContext(null);

type SongProviderProps = {
  children: ReactNode;
};

type Song = {
  id: string;
  title: string;
  fileData: string;
};

export const SongProvider = ({ children }: SongProviderProps) => {
  const [selectedSong, setSelectedSong] = useState<any>(null);
  return (
    <SongContext.Provider value={{ selectedSong, setSelectedSong }}>
      {children}
    </SongContext.Provider>
  );
};

export const useSong = () => useContext(SongContext);
