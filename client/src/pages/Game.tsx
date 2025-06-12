import { useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import Grid from '../components/Grid';
import GameStatus from '../components/GameStatus';
import '../../design/css/gameplay.css';

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { gameState, isConnected } = useContext(GameContext);


  useEffect(() => {
    console.log('Game page - gameState:', gameState);
    console.log('Game page - URL gameId:', gameId);

    if (gameId && !gameState.gameId && gameState.status === 'waiting') 
    {
      console.log('Using URL gameId as context gameId is missing');
      return;
    }

    if (!gameState.gameId) 
    {
      console.log('No game ID in context, redirecting to waiting page');
      navigate('/newgame/waiting');
    } 

    else if (gameId !== gameState.gameId) 
    {
      console.log('Game ID mismatch, redirecting to correct game');
      console.log('Context gameId:', gameState.gameId, 'URL gameId:', gameId);
      navigate(`/newgame/${gameState.gameId}`);
    } 
    else
    {
      console.log('Game ID matches, staying on game page');
    }

  }, [gameState, gameId, navigate]);


  if (!isConnected) {
    return (
      <div className="game-container">
        <h1>Connecting to server...</h1>
        <p>Please wait while we establish a connection.</p>
        <Link to="/home" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }
  

  if (gameState.status === 'waiting') {
    return (
      <div className="game-container">
        <h1>Loading game...</h1>
        <p>Please wait while the game initializes.</p>
        <Link to="/home" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }


  const currentPlayer = gameState.players.find(p => p.id === user?.id);
  const opponent = gameState.players.find(p => p.id !== user?.id);

  return (
    <div className="game-container">
      <div className="players-header">
        <div className="player">
          <img
            src={currentPlayer?.profile_picture_url || 'https://via.placeholder.com/40'}
            alt={currentPlayer?.username || 'You'}
            className="profile-pic"
          />
          <div className="username">{currentPlayer?.username || 'You'}</div>
          <div className="player-color" style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: currentPlayer?.color
          }}></div>
        </div>

        <div className="vs">VS</div>

        <div className="player">
          <img
            src={opponent?.profile_picture_url || 'https://via.placeholder.com/40'}
            alt={opponent?.username || 'Opponent'}
            className="profile-pic"
          />
          <div className="username">{opponent?.username || 'Opponent'}</div>
          <div className="player-color" style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: opponent?.color
          }}></div>
        </div>
      </div>

      <Grid />

      <div className="status-area">
        <GameStatus />
      </div>
    </div>
  );
};

export default Game;
