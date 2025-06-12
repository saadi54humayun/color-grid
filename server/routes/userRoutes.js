import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getUserGameHistory, 
  getGameDetails, 
  getLeaderboard,
  searchUsers
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/history', auth, getUserGameHistory);
router.get('/history/:gameId', auth, getGameDetails);
router.get('/leaderboard', auth, getLeaderboard);
router.get('/search', auth, searchUsers);

export default router;
