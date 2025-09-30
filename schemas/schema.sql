CREATE TABLE rum_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT,
  avg_rtt REAL,
  jitter REAL,
  asn TEXT,
  country TEXT,
  city TEXT,
  colo TEXT
);
