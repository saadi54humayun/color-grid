import { useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { Link } from 'react-router-dom';

interface GameStatusProps {
  showForfeit?: boolean;
  showPlayAgain?: boolean;
}

const GameStatus = ({ showForfeit = true, showPlayAgain = true }: GameStatusProps) => {
  const { gameState, forfeitGame } = useContext(GameContext);
  const { status, message } = gameState;

  return (
    <>
      <p>{message}</p>

      {status === 'playing' && showForfeit && (
        <button className="btn btn-primary" onClick={forfeitGame}>
          Forfeit
        </button>
      )}

      {status === 'ended' && showPlayAgain && (
        <Link to="/newgame/waiting" className="btn btn-secondary">
          Play Again
        </Link>
      )}
    </>
  );
};

export default GameStatus;
