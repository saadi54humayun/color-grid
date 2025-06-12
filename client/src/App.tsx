import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Waiting from './pages/Waiting';
import Game from './pages/Game';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Leaderboard from './pages/Leaderboard';
import UpdateProfile from './pages/UpdateProfile';
import Navbar from './components/Navbar';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {user && <Navbar />} 
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/home" /> : <Welcome />} />
          <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/home" /> : <Signup />} />

          {/* Protected routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/newgame/waiting" element={
            <ProtectedRoute>
              <Waiting />
            </ProtectedRoute>
          } />

          <Route path="/newgame/:gameId" element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />

          <Route path="/history/:gameId" element={
            <ProtectedRoute>
              <HistoryDetail />
            </ProtectedRoute>
          } />

          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          <Route path="/update-profile" element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;