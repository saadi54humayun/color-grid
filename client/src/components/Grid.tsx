import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';

interface GridProps {
  readonly?: boolean;
}

const Grid = ({ readonly = false }: GridProps) => {
  const { gameState, makeMove } = useContext(GameContext);
  const { user } = useContext(AuthContext);

  const { grid, turn, lastMove } = gameState;

  const handleCellClick = (row: number, col: number) => {
    if (readonly) return;
    if (grid[row][col] !== null) return;

    const isSelfPlay = gameState.players && gameState.players.length === 2 &&
                       gameState.players[0]?.id === gameState.players[1]?.id;

    if (isSelfPlay || turn === user?.id) {
      makeMove(row, col);
    }
  };

  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          const isLastMove = lastMove && lastMove.row === rowIndex && lastMove.col === colIndex;

          const isSelfPlay = gameState.players && gameState.players.length === 2 &&
                            gameState.players[0]?.id === gameState.players[1]?.id;

         
          const isClickable = !readonly && cell === null && (isSelfPlay || turn === user?.id);

          const lastMoveStyle = isLastMove ? { boxShadow: '0 0 0 3px gold' } : {};

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              onClick={() => handleCellClick(rowIndex, colIndex)}
              style={{
                backgroundColor: cell || undefined,
                cursor: isClickable ? 'pointer' : 'default',
                ...lastMoveStyle
              }}
            />
          );
        })
      ))}
    </div>
  );
};

export default Grid;
