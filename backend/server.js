const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

let highScores = [];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/highscores', (req, res) => {
  res.json({ scores: highScores.slice(0, 10) });
});

app.post('/api/highscores', (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score are required.' });
  }

  highScores.push({ name, score, createdAt: new Date().toISOString() });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10);

  res.status(201).json({ success: true, scores: highScores });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Snake game backend running on http://localhost:${PORT}`);
});
