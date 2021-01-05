const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const dbFile = "./.data/sqlite.db";
const db = new sqlite3.Database(dbFile);

if (!fs.existsSync(dbFile)) {
  initDatabase();
}

function initDatabase() {
  db.serialize(async () => {
    await db.run(
      "CREATE TABLE Product (id INTEGER PRIMARY KEY AUTOINCREMENT, locale TEXT, name TEXT, sku TEXT);",
      err => console.log(err)
    );
    await db.run(
      "CREATE TABLE ProductImage (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, src TEXT);",
      err => console.log(err)
    );
    await db.run(
      "CREATE TABLE Variant (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER, name TEXT, sku TEXT, product_price FLOAT, retail_price FLOAT);",
      err => console.log(err)
    );
    await db.run(
      "CREATE TABLE VariantImage (id INTEGER PRIMARY KEY AUTOINCREMENT, variant_id INTEGER, src TEXT);",
      err => console.log(err)
    );
    await db.run(
      "CREATE TABLE ShippingRates (id INTEGER PRIMARY KEY AUTOINCREMENT, variant_id INTEGER, country TEXT, rate FLOAT);",
      err => console.log(err)
    );
  });
}

function updateProducts(entries, locale="en") {
  entries.forEach(entry => {
    db.run(
      "INSERT INTO Product (locale, name, sku) VALUES (?, ?, ?)",
      [locale, entry.product.name[locale], entry.product.sku[locale]],
      err => {
        if (err) {
          console.log(err);
        }
      }
    );
  })
}

module.exports = {db}