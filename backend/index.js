const express = require("express");
const { Client } = require("pg");
const redis = require("redis");

const app = express();
const port = 5000;

// PostgreSQL client
const db = new Client({
  host: process.env.DB_HOST,
  user: "user",
  password: "password",
  database: "pocdb",
});

db.connect();

// Redis client
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`
});

redisClient.connect();

// Init DB table
(async () => {
  await db.query(
    "CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, count INT)"
  );
})();

// API route
app.get("/api", async (req, res) => {
  try {
    let cached = await redisClient.get("visits");

    if (cached) {
      return res.json({ source: "cache", visits: cached });
    }

    let result = await db.query("SELECT count FROM visits LIMIT 1");

    let count = result.rows.length ? result.rows[0].count + 1 : 1;

    if (result.rows.length === 0) {
      await db.query("INSERT INTO visits(count) VALUES($1)", [count]);
    } else {
      await db.query("UPDATE visits SET count=$1", [count]);
    }

    await redisClient.setEx("visits", 10, count.toString());

    res.json({ source: "db", visits: count });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});