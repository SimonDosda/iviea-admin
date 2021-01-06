const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", protectedRoute);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// db
const db = require("./db");

// helpers
const contentful = require("./utils/contentful");
const printful = require("./utils/printful");

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Fetch data
app.get("/api/products", async (request, response) => {
  const rawEntries = await contentful.getEntries(['product', 'variant']);
  const contentfulEntries = await contentful.getProductEntries(rawEntries);
  
  const products = await printful.getAllProductInfo();
  const printfulEntries = products.map(printful.productToEntry);
  const entries = contentfulEntries.reduce((res, entry) => {
    return {
      ...res,
      [entry.product.sku.en]: {
        product: {
          ...entry.product
          // contentful: true,
          // printful: false
        },
        variants: entry.variants.map(variant => ({
          ...variant
          // contentful: true,
          // printful: false
        }))
      }
    };
  }, {});
  printfulEntries.forEach(entry => {
    if (entry.product.sku.en in entries) {
      // entries[entry.product.sku.en].printful = true;
    } else {
      entries[entry.product.sku.en] = {
        product: {
          ...entry.product,
          // contentful: false,
          // printful: true
        },
        variants: entry.variants.map(variant => ({
          ...variant
          // contentful: false,
          // printful: true
        }))
      };
    }
  });
  response.send({ entries: Object.values(entries), products, rawEntries });
});

app.get("/api/entries", async (request, response) => {
  const entries = db.get("entries").value();
  response.send({ entries });
});

app.put("/api/entries", async (request, response) => {
  db.set("entries", request.body.entries).write();
  response.send({response: "ok"});
});

app.post("/api/entries", async (request, response) => {
  const entries = await contentful.updateEntries(request.body.entries);
  response.send(entries);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

function protectedRoute(request, response, next) {
  if (request.headers.authorization === process.env.PASSWORD) {
    next();
  } else {
    response.status(400).send({ error: "Unauthorized" });
  }
}
