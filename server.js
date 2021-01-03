// server.js

// init project
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/contentful-api', protectedRoute);
app.use('/printful-api', protectedRoute)

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

const { getEntries, createEntry } = require('./utils/contentful');
const { getProducts } = require('./utils/printful');


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Contentful API
app.get("/contentful-api/entries", async (request, response) => {
  const entries = await getEntries();
  response.send(entries.items.filter(item => item.sys.contentType.sys.id === 'product'));
})

app.post("/contentful-api/entries", async (request, response) => {
  const entries = await createEntry('product', {name: {en: 'test'}, price: {en: '12'}});
  response.send(entries);
})

// Printful API
app.get("/printful-api/products", async (request, response) => {
  const result = await getProducts;
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