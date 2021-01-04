const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", protectedRoute);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

const contentful = require("./utils/contentful");
const printful = require("./utils/printful");

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(`${__dirname}/views/index.html`);
});

// Fetch data
app.get("/api/products", async (request, response) => {
  const contentfulEntries = await contentful.getProductEntries();
  const products = await printful.getAllProductInfo();
  const printfulEntries = products.map(printful.productToEntry);
  const entries = contentfulEntries.reduce((res, entry) => {
    return {
      ...res,
      [entry.product.sku.en]: {
        product: { ...entry.product, contentful: true, printful: false },
        variants: entry.variants.map(variant => ({
          ...variant,
          contentful: true,
          printful: false
        }))
      }
    };
  }, {});
  printfulEntries.forEach(entry => {
    if (entry.product.sku.en in entries) {
      entries[entry.product.sku.en].printful = true;
    } else {
      entries[entry.product.sku.en] = {
        product: { ...entry.product, contentful: false, printful: true },
        variants: entry.variants.map(variant => ({
          ...variant,
          contentful: false,
          printful: true
        }))
      };
    }
  });
  response.send({entries: Object.values(entries), products});
});

app.post("/api/entries", async (request, response) => {
  const entries = await contentful.createEntry("product", {
    name: { en: "test" },
    price: { en: "12" }
  });
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
    response.status(400).send("Unauthorized");
  }
}
