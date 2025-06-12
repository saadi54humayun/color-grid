import { useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import '../../../design/css/waiting.css';
import '../../../design/css/matchfound.css';

const Waiting = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    findMatch,
    cancelMatchmaking,
    gameState,
    opponent,
    isConnected
  } = useContext(GameContext);

  useEffect(() => {
    console.log('Waiting page mounted, user:', !!user, 'isConnected:', isConnected);

    if (user && isConnected) {
      console.log('Starting matchmaking for user:', user.username);
      findMatch();
    } else {
      console.log('Not starting matchmaking yet. Waiting for user and connection.');
      if (!user) console.log('User not logged in');
      if (!isConnected) console.log('Socket not connected');
    }

    return () => {
      console.log('Waiting page unmounting');
    };
  }, [user, isConnected, findMatch]);

  useEffect(() => {
    console.log('Waiting page - gameState changed:', gameState);

    if (gameState.gameId) {
      console.log('Game ID found, navigating to game page:', gameState.gameId);
      navigate(`/newgame/${gameState.gameId}`);
    } else {
      console.log('No game ID yet, staying on waiting page');
    }
  }, [gameState, navigate]);

  const handleCancel = () => {
    cancelMatchmaking();
    navigate('/home');
  };

  if (!isConnected) {
    console.log('Waiting page: Not connected to server');
    return (
      <div className="waiting-container">
        <h1 className="waiting-title">Connecting to server...</h1>
        <p className="waiting-subtitle">Please wait while we establish a connection.</p>
        <p className="connection-status">
          Connection Status: {isConnected ? 'Connected' : 'Disconnected'}<br />
          User: {user ? user.username : 'Not logged in'}
        </p>
        <div className="loading-spinner"></div>
        <Link to="/home" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }

  if (opponent || gameState.gameId) {
    return (
      <div className="match-found-container">
        <h1 className="match-found-title">Match Found!</h1>

        <div className="opponent-info">
          <img
            src={opponent?.profile_picture_url || 'https://via.placeholder.com/100'}
            alt={opponent?.username || 'Opponent'}
            className="opponent-avatar"
          />
          <h2 className="opponent-name">{opponent?.username || 'Opponent'}</h2>
          {opponent?.coins && <p className="opponent-coins">🪙 {opponent.coins}</p>}
        </div>

        <p className="match-found-message">
          Game starting in a moment...
        </p>

        {gameState.gameId && (
          <div className="game-link">
            <p>If you're not redirected automatically, click below:</p>
            <Link to={`/newgame/${gameState.gameId}`} className="btn btn-primary">
              Go to Game
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="waiting-container">
      <h1 className="waiting-title">Waiting for Opponent...</h1>
      <div className="loading-spinner"></div>
      <p className="waiting-subtitle">
        Hang tight! We're finding someone for you to challenge.
      </p>
      <button
        onClick={handleCancel}
        className="btn btn-secondary cancel-button"
      >
        Cancel
      </button>
    </div>
  );
};

export default Waiting;
