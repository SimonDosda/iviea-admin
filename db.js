// init sqlite db
const fs = require("fs");
const dbFile = "./.data/sqlite.db";
const dbExists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);
