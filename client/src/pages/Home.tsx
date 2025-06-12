import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome, {user?.username}!</h1>

      <p>
        Ready to play ColorGrid? Match up with other players and compete in real-time!
      </p>

      <div className="home-buttons">
        <Link to="/newgame/waiting" className="btn btn-primary">
          Play Now
        </Link>
        <Link to="/leaderboard" className="btn btn-secondary">
          Leaderboard
        </Link>
        <Link to="/history" className="btn btn-secondary">
          Game History
        </Link>
      </div>

      <h2>How to Play</h2>
      <ul>
        <li>ColorGrid is a 2-player turn-based game on a 5x5 grid</li>
        <li>Each player is assigned a random color</li>
        <li>On your turn, select an empty cell to fill it with your color</li>
        <li>The game ends when all cells are filled</li>
        <li>The winner is the player with the largest connected block of their color</li>
        <li>Connected blocks are formed by adjacent cells (no diagonals)</li>
        <li>Win to earn 200 coins, lose to lose 200 coins</li>
      </ul>
    </div>
  );
};

export default Home;
