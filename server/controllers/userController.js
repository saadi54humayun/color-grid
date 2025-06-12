import User from '../models/Users.js';
import Game from '../models/Game.js';
import bcrypt from 'bcryptjs';


export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) 
    {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user._id,
      username: user.username,
      profile_picture_url: user.profile_picture_url,
      coins: user.coins
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  const { username, password, profile_picture_url } = req.body;
  try 
  {
    const user = await User.findById(req.userId);
    if (!user) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    if (password) 
    {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (profile_picture_url) {
      user.profile_picture_url = profile_picture_url;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserGameHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const games = await Game.find({
      $or: [{ player1_id: userId }, { player2_id: userId }]
    })
    .sort({ created_at: -1 })
    .populate('player1_id', 'username')
    .populate('player2_id', 'username')
    .populate('winner_id', 'username');

    const gameHistory = games.map(game => {
      const isPlayer1 = game.player1_id._id.toString() === userId;
      const opponent = isPlayer1 ? game.player2_id.username : game.player1_id.username;
      let result;

      if (game.result === 'draw') 
      {
        result = 'Draw';
      } 
      else if (
        (isPlayer1 && game.result === 'player1') ||
        (!isPlayer1 && game.result === 'player2')
      ) {
        result = 'Won';
      } 
      else 
      {
        result = 'Lost';
      }

      return {
        gameId: game._id,
        opponent,
        result,
        date: game.created_at
      };
    });

    res.status(200).json(gameHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGameDetails = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = await Game.findById(gameId)
      .populate('player1_id', 'username profile_picture_url')
      .populate('player2_id', 'username profile_picture_url')
      .populate('winner_id', 'username');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const gameDetails = {
      gameId: game._id,
      player1: {
        id: game.player1_id._id,
        username: game.player1_id.username,
        profile_picture_url: game.player1_id.profile_picture_url,
        color: game.player1_color
      },
      player2: {
        id: game.player2_id._id,
        username: game.player2_id.username,
        profile_picture_url: game.player2_id.profile_picture_url,
        color: game.player2_color
      },
      final_grid: game.final_grid,
      result: game.result,
      winner: game.winner_id ? game.winner_id.username : null,
      date: game.created_at
    };

    res.status(200).json(gameDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, 'username coins profile_picture_url');

    const leaderboard = await Promise.all(users.map(async (user) => {
      const games = await Game.find({
        $or: [{ player1_id: user._id }, { player2_id: user._id }]
      });

      let wins = 0, losses = 0, draws = 0;

      games.forEach(game => {
        const isPlayer1 = game.player1_id.toString() === user._id.toString();

        if (game.result === 'draw') {
          draws++;
        } else if (
          (isPlayer1 && game.result === 'player1') ||
          (!isPlayer1 && game.result === 'player2')
        ) {
          wins++;
        } else {
          losses++;
        }
      });

      return {
        id: user._id,
        username: user.username,
        profile_picture_url: user.profile_picture_url,
        coins: user.coins,
        wins,
        losses,
        draws,
        total_games: wins + losses + draws
      };
    }));

    leaderboard.sort((a, b) => b.coins - a.coins);

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: 'Username parameter is required' });
    }

    const users = await User.find(
      { username: { $regex: username, $options: 'i' } },
      'username coins profile_picture_url'
    );

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
