import { Link } from 'react-router-dom';
import '../../../design/css/welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Welcome to ColorGrid</h1>
      <p className="welcome-subtitle">Match up and compete in real-time!</p>
      <div className="welcome-buttons">
        <Link to="/login" className="btn btn-primary">Login</Link>
        <Link to="/signup" className="btn btn-secondary">Signup</Link>
      </div>
    </div>
  );
};

export default Welcome;
