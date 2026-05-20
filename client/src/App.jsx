import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import ActivityDetailPage from "./pages/ActivityDetailPage";
import AgendaPage from "./pages/AgendaPage";

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
      <Route
        path="/dashboard/participant"
        element={
          <ProtectedRoute role="participant">
            <ParticipantDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute role="participant">
            <PublicLayout><ProfilePage /></PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/favorites"
        element={
          <ProtectedRoute role="participant">
            <PublicLayout><FavoritesPage /></PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/history"
        element={
          <ProtectedRoute role="participant">
            <PublicLayout><HistoryPage /></PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/activity/:id"
        element={
          <ProtectedRoute role="participant">
            <PublicLayout><ActivityDetailPage /></PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/agenda"
        element={
          <ProtectedRoute role="participant">
            <AgendaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
