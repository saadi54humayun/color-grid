import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface Player {
  id: string;
  username: string;
  profile_picture_url?: string;
  color: string;
}

interface GameState {
  gameId: string | null;
  players: Player[];
  grid: (string | null)[][];
  turn: string | null;
  status: 'waiting' | 'playing' | 'ended';
  winner: string | null;
  message: string;
  lastMove: { row: number; col: number; color: string } | null;
}

interface GameContextType {
  socket: Socket | null;
  gameState: GameState;
  opponent: any | null;
  findMatch: () => void;
  cancelMatchmaking: () => void;
  makeMove: (row: number, col: number) => void;
  forfeitGame: () => void;
  resetGame: () => void;
  isConnected: boolean;
}

const initialGameState: GameState = {
  gameId: null,
  players: [],
  grid: Array(5).fill(null).map(() => Array(5).fill(null)),
  turn: null,
  status: 'waiting',
  winner: null,
  message: '',
  lastMove: null,
};

export const GameContext = createContext<GameContextType>({
  socket: null,
  gameState: initialGameState,
  opponent: null,
  findMatch: () => {},
  cancelMatchmaking: () => {},
  makeMove: () => {},
  forfeitGame: () => {},
  resetGame: () => {},
  isConnected: false,
});

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [opponent, setOpponent] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useContext(AuthContext);

  
  useEffect(() => {
    if (user) {
      console.log('Initializing socket connection for user:', user.id);


      const newSocket = io('http://localhost:8000', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected with ID:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected, reason:', reason);
        setIsConnected(false);
      });


      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    } else {
      console.log('No user, not initializing socket');
      setIsConnected(false);
    }
  }, [user]);

  
  useEffect(() => {
    if (!socket) return;

   
    socket.on('match_found', (data) => {
      console.log('Match found:', data);
      setOpponent(data.opponent);
      setGameState(prev => ({
        ...prev,
        gameId: data.gameId,
        message: `Match found! Playing against ${data.opponent.username}`,
      }));
    });

   
    socket.on('start_game', (data) => {
      console.log('Game start event received:', data);
      console.log('Current user:', user?.id);
      console.log('Current gameState:', gameState);

      if (!data || !data.gameId || !data.players) {
        console.error('Invalid start_game data received:', data);
        return;
      }

      const isSelfPlay = data.players.length === 2 &&
                         data.players[0].id === data.players[1].id;

      console.log('Is self-play:', isSelfPlay);
      console.log('Players:', data.players.map((p: any) => `${p.username} (${p.id})`).join(', '));

      let turnMessage;
      if (isSelfPlay) {
        
        turnMessage = data.turn === user?.id ? 'Your turn (Player 1)' : 'Your turn (Player 2)';
      } else {
        turnMessage = data.turn === user?.id ? 'Your turn' : 'Opponent\'s turn';
      }

      console.log('Setting turn message:', turnMessage);
      console.log('Setting game state with status: playing');

      setGameState(prev => ({
        ...prev,
        gameId: data.gameId,
        players: data.players,
        grid: data.grid,
        turn: data.turn,
        status: 'playing' as const,
        message: turnMessage,
      }));
      console.log('Game state updated after start_game event');
    });

    socket.on('move_made', (data) => {
      console.log('Move made:', data);

      const isSelfPlay = gameState.players && gameState.players.length === 2 &&
                         gameState.players[0]?.id === gameState.players[1]?.id;

      let turnMessage;
      if (isSelfPlay) {
        turnMessage = data.turn === user?.id ? 'Your turn (Player 1)' : 'Your turn (Player 2)';
      } else {
        turnMessage = data.turn === user?.id ? 'Your turn' : 'Opponent\'s turn';
      }

      setGameState(prev => ({
        ...prev,
        grid: data.grid,
        turn: data.turn,
        lastMove: data.lastMove,
        message: turnMessage,
      }));
    });

    socket.on('game_end', (data) => {
      console.log('Game ended:', data);
      let message = '';

      if (data.reason === 'disconnect') {
        message = 'Opponent disconnected. You win!';
      } else if (data.reason === 'forfeit') {
        message = data.message;
      } else {
        if (data.winner === user?.id) {
          message = 'You won! (+200 coins)';
        } else if (data.winner === null) {
          message = 'Game ended in a draw';
        } else {
          message = user?.coins && user.coins >= 200
            ? 'You lost (-200 coins)'
            : 'You lost';
        }
      }

      setGameState(prev => ({
        ...prev,
        status: 'ended',
        winner: data.winner,
        message,
      }));
    });

    socket.on('matchmaking_error', (data) => {
      console.error('Matchmaking error:', data);
      setGameState(prev => ({
        ...prev,
        message: data.message,
      }));
    });

    return () => {
      socket.off('match_found');
      socket.off('start_game');
      socket.off('move_made');
      socket.off('game_end');
      socket.off('matchmaking_error');
    };
  }, [socket, user]);

  const [lastFindMatchTime, setLastFindMatchTime] = useState(0);

  const findMatch = () => {
    console.log('findMatch called, socket:', !!socket, 'user:', !!user, 'isConnected:', isConnected);

    if (!socket) {
      console.error('Cannot find match: Socket is not initialized');
      return;
    }

    if (!user) {
      console.error('Cannot find match: User is not logged in');
      return;
    }

    if (!isConnected) {
      console.error('Cannot find match: Socket is not connected');
      return;
    }

    const now = Date.now();
    const debounceTime = 2000; 

    if (now - lastFindMatchTime < debounceTime) {
      console.log('Debouncing findMatch, last call was', now - lastFindMatchTime, 'ms ago');
      return;
    }

    setLastFindMatchTime(now);

    console.log('Emitting find_match event with user ID:', user.id);

    setGameState({
      ...initialGameState,
      status: 'waiting',
      message: 'Waiting for an opponent...',
    });

    socket.emit('find_match', user.id);
  };

  const cancelMatchmaking = () => {
    if (socket) {
      socket.emit('cancel_matchmaking');
      setGameState({
        ...initialGameState,
        message: 'Matchmaking canceled',
      });
    }
  };

  const makeMove = (row: number, col: number) => {
    if (!socket || !gameState.gameId) return;

    const isSelfPlay = gameState.players && gameState.players.length === 2 &&
                       gameState.players[0]?.id === gameState.players[1]?.id;

    if (isSelfPlay || gameState.turn === user?.id) {
      socket.emit('make_move', {
        gameId: gameState.gameId,
        row,
        col,
      });
    }
  };

  const forfeitGame = () => {
    if (socket && gameState.gameId) {
      socket.emit('forfeit_game', {
        gameId: gameState.gameId,
      });
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setOpponent(null);
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        gameState,
        opponent,
        findMatch,
        cancelMatchmaking,
        makeMove,
        forfeitGame,
        resetGame,
        isConnected,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
