// server.js

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const contentful = require('contentful-management');
const fetch = require('node-fetch');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/contentful-api', protectedRoute);
app.use('/printful-api', protectedRoute)

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
const dbFile = "./.data/sqlite.db";
const dbExists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

// init contentful
const client = contentful.createClient(
  { accessToken: process.env.CONTENTFUL_TOKEN },
  { type: 'plain', defaults: {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENV_ID
  } }
)

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Contentful API
app.get("/contentful-api/entries", async (request, response) => {
  const entries = await client.entry.getMany({
    query: {
      skip: 0,
      limit: 100,
    },
  })
  response.send(entries.items);
})

// Printful API
app.get("/printful-api/products", async (request, response) => {
  const res = await fetch("https://api.printful.com/sync/products", {
        method: "GET",
       headers: { 
         "Content-Type": "application/json", 
         "Authorization": `Basic ${process.env.PRINTFUL_API_KEY}`
       }
      });
  const result = await res.json();
  response.send(result);
})

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

function protectedRoute(request, response, next) {
  if (request.headers.authorization === process.env.PASSWORD) {
    next();
  } else {
    response.status(400).send('Unauthorized');
  }
}