import "./App.css";
import AudioUpload from "./components/AudioUpload";
import SongList from "./components/SongList";
import SongView from "./components/SongView";
import { SongProvider } from "./context/SongContext";

function App() {
  return (
    <SongProvider>
      <div className="flex flex-col">
        <SongView />
        <SongList />
      </div>
    </SongProvider>
  );
}

export default App;
