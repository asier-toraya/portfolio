import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WriteupsPage from "./pages/WriteupsPage";
import { writeUps } from "./content/technicalContent";

function App() {
  const firstWriteupSlug = writeUps[0]?.slug;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/writeups"
          element={
            firstWriteupSlug ? <Navigate to={`/writeups/${firstWriteupSlug}`} replace /> : <WriteupsPage />
          }
        />
        <Route path="/writeups/:slug" element={<WriteupsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
