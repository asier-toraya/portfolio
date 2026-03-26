import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ReportsPage from "./pages/ReportsPage";
import WriteupsPage from "./pages/WriteupsPage";
import { reports } from "./content/reportsContent";
import { writeUps } from "./content/technicalContent";

function App() {
  const firstWriteupSlug = writeUps[0]?.slug;
  const firstReportSlug = reports[0]?.slug;

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
        <Route
          path="/reports"
          element={
            firstReportSlug ? <Navigate to={`/reports/${firstReportSlug}`} replace /> : <ReportsPage />
          }
        />
        <Route path="/reports/:slug" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
