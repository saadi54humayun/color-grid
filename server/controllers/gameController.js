import Game from '../models/Game.js';
import User from '../models/Users.js';
import { maxAreaOfIsland } from '../utils/maxAreaOfIsland.js';

export const createGameRecord = async (gameData) => {
  try {
    const { player1_id, player2_id, player1_color, player2_color, final_grid, result, winner_id } = gameData;
    
    const game = new Game({
      player1_id,
      player2_id,
      player1_color,
      player2_color,
      final_grid,
      result,
      winner_id
    });
    
    await game.save();
    
    if (result !== 'draw') {
      const winner = await User.findById(winner_id);
      const loserId = winner_id.toString() === player1_id.toString() ? player2_id : player1_id;
      const loser = await User.findById(loserId);
      
      winner.coins += 200;
      await winner.save();
      
      if (loser.coins >= 200) {
        loser.coins -= 200;
      } else {
        loser.coins = 0;
      }
      await loser.save();
    }
    
    return game;
  } catch (error) {
    console.error('Error creating game record:', error);
    throw error;
  }
};


export const calculateWinner = (grid, player1Color, player2Color) => {

  const numericGrid = grid.map(row => 
    row.map(cell => {
      if (cell === player1Color) return 1;
      if (cell === player2Color) return 2;
      return 0; 
    })
  );
  
  const player1Grid = numericGrid.map(row => 
    row.map(cell => cell === 1 ? 1 : 0)
  );
  
  const player2Grid = numericGrid.map(row => 
    row.map(cell => cell === 2 ? 1 : 0)
  );
  
  const player1MaxArea = maxAreaOfIsland(player1Grid);
  const player2MaxArea = maxAreaOfIsland(player2Grid);
  
  if (player1MaxArea > player2MaxArea) 
  {
    return 'player1';
  }
  else if (player2MaxArea > player1MaxArea) 
  {
    return 'player2';
  } 
  else 
  {
    return 'draw';
  }
};