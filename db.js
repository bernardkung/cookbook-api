var sqlite3 = require('sqlite3').verbose()
const path = require('path');
require("dotenv").config({ path: "./.env" });

function createDb(){
    try {
      db.run(
        `CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT, 
          ingredients TEXT, 
          instructions TEXT, 
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
          CONSTRAINT name_unique UNIQUE (name)
        )`
      )
      console.log("Database created successfully")
    } catch(err) {
      console.error(err)
      throw err
    }
  }
  
  const db_name = path.join(__dirname, "data", "recipes.db");
  const db = new sqlite3.Database(db_name, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
      createDb();
    } else if (err) {
      console.error(err.message)
      throw err
    } else {
      console.log("Successful connection to database");
    }
  });

module.exports = db