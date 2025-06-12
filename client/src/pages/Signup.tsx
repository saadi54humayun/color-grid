import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../../../design/css/signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signup, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup(username, password, profilePictureUrl || undefined);
      navigate('/home');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign Up</h2>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="profilePictureUrl">Profile Picture URL (Optional)</label>
          <input
            type="text"
            id="profilePictureUrl"
            value={profilePictureUrl}
            onChange={(e) => setProfilePictureUrl(e.target.value)}
            placeholder="Enter a URL for your profile picture"
            disabled={loading}
          />
        </div>

        {profilePictureUrl && (
          <div className="profile-preview">
            <img
              src={profilePictureUrl}
              alt="Profile Preview"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
              }}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-footer">
        <p>Already have an account?</p>
        <Link to="/login" className="btn btn-secondary">Login</Link>
      </div>
    </div>
  );
};

export default Signup;
