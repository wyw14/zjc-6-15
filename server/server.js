﻿const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 6044;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

const CARD_PAIRS = 8;
let leaderboard = [];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

app.get('/api/shuffle', (req, res) => {
  const cardIds = [];
  for (let i = 1; i <= CARD_PAIRS; i++) {
    cardIds.push(i, i);
  }
  const shuffled = shuffle(cardIds);
  res.json({ cards: shuffled });
});

app.post('/api/score', (req, res) => {
  const { time, playerName, steps, accuracy } = req.body;

  if (typeof time !== 'number' || time <= 0) {
    return res.status(400).json({ error: '无效的成绩数据' });
  }

  const entry = {
    id: Date.now(),
    time: time,
    steps: typeof steps === 'number' ? steps : 0,
    accuracy: typeof accuracy === 'number' ? accuracy : 0,
    playerName: playerName || '匿名玩家',
    date: new Date().toLocaleString('zh-CN'),
    timestamp: Date.now()
  };

  leaderboard.push(entry);
  if (leaderboard.length > 100) {
    leaderboard = leaderboard.slice(0, 100);
  }

  const sortedByTime = [...leaderboard].sort((a, b) => a.time - b.time);
  const rank = sortedByTime.findIndex(e => e.id === entry.id) + 1;

  res.json({
    success: true,
    rank: rank,
    leaderboard: sortedByTime.slice(0, 10)
  });
});

const SORT_CONFIG = {
  time: { key: 'time', dir: 'asc' },
  steps: { key: 'steps', dir: 'asc' },
  accuracy: { key: 'accuracy', dir: 'desc' },
  date: { key: 'timestamp', dir: 'desc' }
};

app.get('/api/leaderboard', (req, res) => {
  const sort = req.query.sort || 'time';
  const config = SORT_CONFIG[sort] || SORT_CONFIG.time;
  const sorted = [...leaderboard].sort((a, b) => {
    if (config.dir === 'asc') return a[config.key] - b[config.key];
    return b[config.key] - a[config.key];
  });
  res.json({ leaderboard: sorted.slice(0, 10), sort: sort });
});

app.listen(PORT, () => {
  console.log(`鏈嶅姟鍣ㄨ繍琛屽湪 http://localhost:${PORT}`);
});
