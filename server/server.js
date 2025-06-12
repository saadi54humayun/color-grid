import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/Auth.js';
import userRoutes from './routes/userRoutes.js';
import { join } from 'path';
import { createGameRecord } from './controllers/gameController.js';
import User from './models/Users.js';
import { maxAreaOfIsland } from './utils/maxAreaOfIsland.js';

dotenv.config({ path: join('config.env') })

const PORT = process.env.PORT;

const app = express();
const server = createServer(app); 


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e6,
  pingTimeout: 60000,
});

app.use(cors()); 
app.use(express.json()); 

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/auth', authRoutes); 
app.use('/user', userRoutes); 


let waitingPlayers = [];
let games = {};
const lastMatchmakingAttempt = {}; 

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    waitingPlayers = waitingPlayers.filter((s) => s.id !== socket.id);
    
    for (const gameId in games) {
      const game = games[gameId];
      if (game.players.some((p) => p.id === socket.id)) {
        const opponent = game.players.find((p) => p.id !== socket.id);
        const winner = opponent?.userId;

        if (winner) 
        {
    
          const player1Id = game.players[0].userId;
          const player2Id = game.players[1].userId;
          const player1Color = game.colors[player1Id];
          const player2Color = game.colors[player2Id];
          const disconnectedPlayerId = socket.userId;
          const winnerId = winner;

          try 
          {
  
            const finalGrid = game.grid.map(row => [...row]);
            const result = disconnectedPlayerId === player1Id ? 'player2' : 'player1';

            createGameRecord({
              player1_id: player1Id,
              player2_id: player2Id,
              player1_color: player1Color,
              player2_color: player2Color,
              final_grid: finalGrid,
              result,
              winner_id: winnerId
            });

            io.to(gameId).emit('game_end', {
              winner,
              reason: 'disconnect',
              message: 'Opponent disconnected'
            });
          } catch (error) {
            console.error('Error saving game after disconnect:', error);
          }
        }

        delete games[gameId];
      }
    }
  });

  socket.on('find_match', async (userId) => {
    if (!socket.connected) {
      console.log('Socket disconnected, ignoring find_match:', userId);
      return;
    }

    const now = Date.now();
    const lastAttempt = lastMatchmakingAttempt[userId] || 0;
    const debounceTime = 2000;

    if (now - lastAttempt < debounceTime) {
      console.log('Debouncing find_match for user:', userId, 'Last attempt was', now - lastAttempt, 'ms ago');
      return;
    }

    lastMatchmakingAttempt[userId] = now;

    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found:', userId);
        socket.emit('matchmaking_error', { message: 'User not found' });
        return;
      }

      socket.userId = userId;
      socket.userData = {
        id: user._id,
        username: user.username,
        profile_picture_url: user.profile_picture_url || '',
        coins: user.coins
      };

      const isAlreadyWaiting = waitingPlayers.some(s => s.id === socket.id || s.userId === userId);

      if (isAlreadyWaiting) {
        console.log('User already in waiting list:', user.username, 'Socket ID:', socket.id);
        return;
      }

      const isInGame = Object.values(games).some(game =>
        game.players.some(p => p.id === socket.id || p.userId === userId)
      );

      if (isInGame) {
        console.log('User already in a game:', user.username, 'Socket ID:', socket.id);
        socket.emit('matchmaking_error', { message: 'You are already in a game' });
        return;
      }

      socket.join('waiting');

      waitingPlayers = waitingPlayers.filter(s => s.connected);

      waitingPlayers.push(socket);
      console.log('User added to waiting list:', user.username, 'Socket ID:', socket.id);
      console.log('Waiting players:', waitingPlayers.length);

      if (waitingPlayers.length >= 2) {
        const [player1, player2] = waitingPlayers.splice(0, 2);

        player1.leave('waiting');
        player2.leave('waiting');

        const gameId = `game_${Date.now()}`;

        const colors = Math.random() > 0.5
          ? { [player1.userId]: 'red', [player2.userId]: 'blue' }
          : { [player1.userId]: 'blue', [player2.userId]: 'red' };

        games[gameId] = {
          players: [player1, player2],
          grid: Array(5).fill().map(() => Array(5).fill(null)),
          turn: player1.userId,
          colors,
          startTime: Date.now()
        };

        player1.join(gameId);
        player2.join(gameId);

        console.log('Match created:', gameId);
        console.log('Player 1:', player1.userData.username);
        console.log('Player 2:', player2.userData.username);

        player1.emit('match_found', {
          opponent: player2.userData,
          gameId
        });

        player2.emit('match_found', {
          opponent: player1.userData,
          gameId
        });

        setTimeout(() => {
          console.log('Starting game after delay:', gameId);

          if (games[gameId]) {
            console.log('Game exists, sending start_game event to room:', gameId);
            console.log('Players in game:',
              games[gameId].players.map(p => `${p.userData.username} (${p.id})`).join(', ')
            );

            const startGameData = {
              gameId,
              players: [
                {
                  id: player1.userId,
                  username: player1.userData.username,
                  profile_picture_url: player1.userData.profile_picture_url,
                  color: colors[player1.userId]
                },
                {
                  id: player2.userId,
                  username: player2.userData.username,
                  profile_picture_url: player2.userData.profile_picture_url,
                  color: colors[player2.userId]
                }
              ],
              grid: games[gameId].grid,
              turn: player1.userId
            };

            console.log('Emitting start_game with data:', JSON.stringify(startGameData, null, 2));

            io.to(gameId).emit('start_game', startGameData);

            player1.emit('start_game', startGameData);
            player2.emit('start_game', startGameData);

            console.log('start_game event emitted');
          } else {
            console.log('Game no longer exists, not starting:', gameId);
          }
        }, 3000); 
      }
    } catch (error) {
      console.error('Error in find_match:', error);
      socket.emit('matchmaking_error', { message: 'Server error' });
    }
  });

  socket.on('cancel_matchmaking', () => {
    
    waitingPlayers = waitingPlayers.filter(p => p.id !== socket.id);
    socket.leave('waiting');
    
    console.log('Player canceled matchmaking:', socket.id); 
  }); 

  socket.on('make_move', ({ gameId, row, col }) => 
  {
    console.log('Move received:', gameId, row, col, 'by', socket.userData?.username); 
    const game = games[gameId]; 

    if (!game) 
    {
      console.log('Game not found:', gameId); 
      return; 
    }

    if (game.turn !== socket.userId) 
    {
      console.log('Not player\'s turn');
      return;
    }

    if (game.grid[row][col] !== null) 
    {
      console.log('Cell already occupied');
      return;
    }

    game.grid[row][col] = game.colors[socket.userId];
    const nextPlayer = game.players.find(p => p.userId !== socket.userId);

    if (!nextPlayer) 
    {
      const otherPlayerId = game.players.find(p => p.id !== socket.id)?.userId ||
                           (game.players[0].userId === socket.userId ? game.players[1].userId : game.players[0].userId);
      game.turn = otherPlayerId;
      console.log('Switching turn to other player ID:', otherPlayerId);
    } else {
      game.turn = nextPlayer.userId;
    }

    io.to(gameId).emit('move_made', {
      grid: game.grid,
      turn: game.turn,
      lastMove: { row, col, color: game.colors[socket.userId] }
    });

    const isGridFull = game.grid.every(row => row.every(cell => cell !== null));

    if (isGridFull) {
      endGame(gameId);
    }
  });

  socket.on('forfeit_game', ({ gameId }) => {
    const game = games[gameId];
    if (!game) {
      console.log('Game not found for forfeit:', gameId);
      return;
    }

    const opponent = game.players.find(p => p.id !== socket.id);

    if (!opponent) {
      console.log('Same user playing both sides, handling forfeit specially');
      const otherPlayerId = game.players[0].userId === socket.userId ? game.players[1].userId : game.players[0].userId;

      try {
        const player1Id = game.players[0].userId;
        const player2Id = game.players[1].userId;
        const player1Color = game.colors[player1Id];
        const player2Color = game.colors[player2Id];
        const forfeitedPlayerId = socket.userId;
        const winnerId = otherPlayerId;
        const result = forfeitedPlayerId === player1Id ? 'player2' : 'player1';

        createGameRecord({
          player1_id: player1Id,
          player2_id: player2Id,
          player1_color: player1Color,
          player2_color: player2Color,
          final_grid: game.grid,
          result,
          winner_id: winnerId
        });


        io.to(gameId).emit('game_end', {
          winner: winnerId,
          reason: 'forfeit',
          message: `Player forfeited the game`
        });

        delete games[gameId];

        return;
      } catch (error) {
        console.error('Error handling forfeit for same user:', error);
        return;
      }
    }

    try {
      const player1Id = game.players[0].userId;
      const player2Id = game.players[1].userId;
      const player1Color = game.colors[player1Id];
      const player2Color = game.colors[player2Id];
      const forfeitedPlayerId = socket.userId;
      const winnerId = opponent.userId;
      const result = forfeitedPlayerId === player1Id ? 'player2' : 'player1';

      createGameRecord({
        player1_id: player1Id,
        player2_id: player2Id,
        player1_color: player1Color,
        player2_color: player2Color,
        final_grid: game.grid,
        result,
        winner_id: winnerId
      });

      io.to(gameId).emit('game_end', {
        winner: winnerId,
        reason: 'forfeit',
        message: `${socket.userData.username} forfeited the game`
      });

      delete games[gameId];

    } catch (error) {
      console.error('Error handling forfeit:', error);
    }
  });
});

async function endGame(gameId) {
  const game = games[gameId];
  if (!game) return;

  try {
    const player1Id = game.players[0].userId;
    const player2Id = game.players[1].userId;
    const player1Color = game.colors[player1Id];
    const player2Color = game.colors[player2Id];

    const player1Grid = game.grid.map(row =>
      row.map(cell => cell === player1Color ? 1 : 0)
    );

    const player2Grid = game.grid.map(row =>
      row.map(cell => cell === player2Color ? 1 : 0)
    );

    const player1MaxArea = maxAreaOfIsland(JSON.parse(JSON.stringify(player1Grid)));
    const player2MaxArea = maxAreaOfIsland(JSON.parse(JSON.stringify(player2Grid)));

    console.log('Player 1 max area:', player1MaxArea);
    console.log('Player 2 max area:', player2MaxArea);

    let result, winnerId;

    if (player1MaxArea > player2MaxArea) {
      result = 'player1';
      winnerId = player1Id;
    } else if (player2MaxArea > player1MaxArea) {
      result = 'player2';
      winnerId = player2Id;
    } else {
      result = 'draw';
      winnerId = null;
    }

    await createGameRecord({
      player1_id: player1Id,
      player2_id: player2Id,
      player1_color: player1Color,
      player2_color: player2Color,
      final_grid: game.grid,
      result,
      winner_id: winnerId
    });

    let winnerMessage;
    if (result === 'draw') {
      winnerMessage = 'Game ended in a draw';
    } else {
      const winnerIndex = result === 'player1' ? 0 : 1;
      const winnerUsername = game.players[winnerIndex]?.userData?.username || 'Player ' + (winnerIndex + 1);
      winnerMessage = `${winnerUsername} won the game`;
    }

    io.to(gameId).emit('game_end', {
      winner: winnerId,
      player1Area: player1MaxArea,
      player2Area: player2MaxArea,
      reason: 'complete',
      message: winnerMessage
    });

    delete games[gameId];

  } catch (error) {
    console.error('Error ending game:', error);
  }
}



server.listen(PORT, () => console.log(`Server running on port ${PORT}`));