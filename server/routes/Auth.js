import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

const router = express.Router(); 

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username }); 
    if (existingUser) return res.status(400).json({ message: 'Username taken' });
    const hashedPassword = await bcrypt.hash(password, 10); 
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // 
    res.json({ token, user: { id: user._id, username: user.username, coins: user.coins } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;