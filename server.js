import express from "express";
import bodyParser from "body-parser";
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", protectedRoute);

app.use(express.static("public"));

// db
import { db } from "./db.js";

// helpers
import { getContentfulEntries, updateEntries } from "./utils/contentful.js";
import { getPrinfulEntries } from "./utils/printful.js";
import { mergeEntries } from "./utils/sync.js";

app.get("/", (request, response) => {
  response.sendFile(`${process.env.PWD}/views/index.html`);
});

// Fetch data
app.get("/api/entries", async (request, response) => {
  const contentfulEntries = await getContentfulEntries();
  const printfulEntries = await getPrinfulEntries();
  response.send({ entries: mergeEntries(contentfulEntries, printfulEntries) });
});

app.get("/api/db-entries", async (request, response) => {
  const entries = db.get("entries").value();
  response.send({ entries });
});

app.put("/api/db-entries", async (request, response) => {
  db.set("entries", request.body.entries).write();
  response.send({ response: "ok" });
});

app.post("/api/entries", async (request, response) => {
  await updateEntries(request.body.entries);
  response.send({ response: "ok" });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

function protectedRoute(request, response, next) {
  if (request.headers.authorization === process.env.APP_TOKEN) {
    next();
  } else {
    response.status(400).send({ error: "Unauthorized" });
  }
}
