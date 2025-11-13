import "./App.css";
import AudioUpload from "./components/AudioUpload";
import SongList from "./components/SongList";

function App() {
  return (
    <div className="flex flex-col">
      <AudioUpload />
      <SongList />
    </div>
  );
}

export default App;
