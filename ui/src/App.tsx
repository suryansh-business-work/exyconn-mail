import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Compose from "./pages/Compose";
import Inbox from "./pages/Inbox";
import { VersionFooter } from "./components/VersionFooter";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/compose" element={<Compose />} />
        </Routes>
        <VersionFooter />
      </div>
    </BrowserRouter>
  );
}

export default App;
