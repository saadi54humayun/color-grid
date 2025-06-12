import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface GameHistoryItem {
  gameId: string;
  opponent: string;
  result: string;
  date: string;
}

const History = () => {
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/user/history');
        setGames(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching game history:', error);
        setError('Failed to load game history');
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, []);

  if (loading) {
    return <div className="loading">Loading game history...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="history-container">
      <h1>Game History</h1>

      <div className="history-list">
        {games.length === 0 ? (
          <div className="no-games">No games played yet</div>
        ) : (
          games.map((game) => (
            <Link
              to={`/history/${game.gameId}`}
              key={game.gameId}
              className="history-item"
            >
              <div className="game-id">Game #{game.gameId.substring(0, 8)}</div>
              <div className="opponent">vs {game.opponent}</div>
              <div className={`result ${game.result.toLowerCase()}`}>
                {game.result}
              </div>

              <div className="date">
                {new Date(game.date).toLocaleDateString()}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="history-actions">
        <Link to="/home" className="back-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default History;
