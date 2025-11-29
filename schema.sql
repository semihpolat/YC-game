-- Leaderboard tablosu
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  company_name TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  funding_raised TEXT,
  employees INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Örnek veri
INSERT INTO leaderboard (player_name, company_name, score, funding_raised, employees) VALUES
('Semih', 'Accretional', 1500000, '$1.5M', 12),
('Test Player', 'Demo Startup', 750000, '$750K', 5);

