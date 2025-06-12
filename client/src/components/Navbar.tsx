import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/home" className="nav-logo">
        🎮 ColorGrid
      </Link>
      <div className="nav-right">
        <div className="coins">
          🪙 {user.coins}
        </div>
        <div className="profile-dropdown">
          <img
            src={user.profile_picture_url || 'https://via.placeholder.com/40'}
            alt={user.username}
            className="profile-pic"
          />
          <span className="username">{user.username}</span>
          <div className="dropdown-menu">
            <Link to="/update-profile">
              Update Profile
            </Link>
            <Link to="#" onClick={handleLogout}>
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
