import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface LeaderboardUser {
  id: string;
  username: string;
  profile_picture_url: string;
  coins: number;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<LeaderboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/user/leaderboard');
        setUsers(response.data);
        setFilteredUsers(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="leaderboard-list">
        <div className="leaderboard-header">
          <div className="rank">Rank</div>
          <div className="player">Player</div>
          <div className="record">W/L/D</div>
          <div className="coins">Coins</div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-results">No players found</div>
        ) : (
          filteredUsers.map((user, index) => (
            <div key={user.id} className="leaderboard-item">
              <div className="rank">{index + 1}</div>
              <div className="player">
                <img
                  src={user.profile_picture_url || 'https://via.placeholder.com/30'}
                  alt={user.username}
                  className="player-avatar"
                />
                <span className="player-name">{user.username}</span>
              </div>
              <div className="record">
                {user.wins}/{user.losses}/{user.draws}
              </div>
              <div className="coins">{user.coins}</div>
            </div>
          ))
        )}
      </div>

      <div className="leaderboard-actions">
        <Link to="/home" className="back-button">Back to Home</Link>
      </div>
    </div>
  );
};

export default Leaderboard;