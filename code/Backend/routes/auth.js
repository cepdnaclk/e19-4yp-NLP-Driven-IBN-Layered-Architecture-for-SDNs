import express from 'express';
import jwt from 'jsonwebtoken';
import { secret, expiresIn } from '../config/jwt.js';
const router = express.Router();

// Mock user database (replace with real DB)
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username: user.username, role: user.role }, secret, { expiresIn });
  res.json({ token });
});

export default router;