const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const connectingDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

connectingDB();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET API
app.get("/players/", async (request, response) => {
  const getAllQuery = `SELECT * FROM cricket_team
  ORDER BY player_id`;
  const result = await db.all(getAllQuery);
  response.send(result.map((a) => convertDbObjectToResponseObject(a)));
});

//post API 2
app.post("/players/", async (req, res) => {
  const addPlayer = req.body;
  const { playerName, jerseyNumber, role } = addPlayer;
  const addingToDb = `
        INSERT INTO cricket_team (player_name,jersey_number,role)
        VALUES (
            "${playerName}",
            ${jerseyNumber},
            "${role}");`;
  const dbRes = await db.run(addingToDb);
  res.send("Player Added to Team");
  console.log(dbRes);
});

//GET API 3
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const sqlQuery = `SELECT * FROM cricket_team
  WHERE 
  player_id=${playerId}`;
  const result = await db.get(sqlQuery);
  res.send(convertDbObjectToResponseObject(result));
});

//put API 4
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const sqlBody = req.body;
  const { playerName, jerseyNumber, role } = sqlBody;
  const sqlQuery = `UPDATE cricket_team
  SET
  player_name="${playerName}",
  jersey_number=${jerseyNumber},
  role="${role}"
  WHERE player_id=${playerId};

  `;
  const result = await db.run(sqlQuery);
  res.send("Player Details Updated");
});

//Delete API 5
app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const sqlQuery = `DELETE FROM cricket_team
    WHERE 
    player_id=${playerId};`;
  await db.run(sqlQuery);
  res.send("Player Removed");
});

module.exports = app;
