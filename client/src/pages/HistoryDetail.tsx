import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Grid from '../components/Grid';

interface Player {
  id: string;
  username: string;
  profile_picture_url: string;
  color: string;
}

interface GameDetails {
  gameId: string;
  player1: Player;
  player2: Player;
  final_grid: string[][];
  result: string;
  winner: string | null;
  date: string;
}

const HistoryDetail = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/user/history/${gameId}`);
        setGame(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching game details:', error);
        setError('Failed to load game details');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameDetails();
    }
  }, [gameId]);

  if (loading) {
    return <div className="loading">Loading game details...</div>;
  }

  if (error || !game) {
    return <div className="error">{error || 'Game not found'}</div>;
  }

  const { player1, player2, final_grid, result, winner, date } = game;

  let resultText;
  if (result === 'draw') {
    resultText = 'Draw';
  } else if (winner === player1.id) {
    resultText = `${player1.username} Won`;
  } else {
    resultText = `${player2.username} Won`;
  }

  return (
    <div className="history-detail-container">
      <h1>Game Replay</h1>

      <div className="game-info">
        <div className="game-date">
          Played on {new Date(date).toLocaleDateString()}
        </div>
        <div className="game-result">{resultText}</div>
      </div>

      <div className="players-container">
        <div className="player player1">
          <img
            src={player1.profile_picture_url || 'https://via.placeholder.com/40'}
            alt={player1.username}
            className="player-avatar"
          />
          <div className="player-name">{player1.username}</div>
          <div className="player-color" style={{ backgroundColor: player1.color }}></div>
        </div>

        <div className="vs">VS</div>

        <div className="player player2">
          <img
            src={player2.profile_picture_url || 'https://via.placeholder.com/40'}
            alt={player2.username}
            className="player-avatar"
          />
          <div className="player-name">{player2.username}</div>
          <div className="player-color" style={{ backgroundColor: player2.color }}></div>
        </div>
      </div>

      <div className="game-grid-container">
        <Grid readonly={true} />
      </div>

      <div className="history-actions">
        <Link to="/history" className="back-button">Back to History</Link>
        <Link to="/newgame/waiting" className="play-button">Play New Game</Link>
      </div>
    </div>
  );
};

export default HistoryDetail;
