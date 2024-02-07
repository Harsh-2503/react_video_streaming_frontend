import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Player from "./components/Player";
import User from "./components/User";
import { useState } from "react";

interface OverlayItem {
  type: "image" | "text";
  content: string | null;
  dragX: number;
  dragY: number;
  resizeW: number;
  resizeH: number;
}

function App() {
  const [overlay, setOverlay] = useState<[OverlayItem]>();

  return (
    <Router>
      <Routes>
        <Route
          path="/view"
          element={<Player overlay={overlay} setOverlay={setOverlay} />}
        ></Route>
        <Route
          path="/"
          element={<User overlay={overlay} setOverlay={setOverlay} />}
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
