const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', protectedRoute);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

const { getEntries, createEntry } = require('./utils/contentful');
const { getProducts, getVariants } = require('./utils/printful');


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Fetch data
app.get("/api/products", async (request, response) => {
  const entries = await getEntries(['product', 'variant']);
  const products = await getProducts();
  const variants = await getVariants();
  response.send({entries, products, variants});
})

app.post("/api/entries", async (request, response) => {
  const entries = await createEntry('product', {name: {en: 'test'}, price: {en: '12'}});
  response.send(entries);
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