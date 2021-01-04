const fetch = require("node-fetch");

async function getProducts() {
  const res = await fetch("https://api.printful.com/sync/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`
    }
  });
  const { result } = await res.json();
  return result;
}

async function getProductWithVariants(productId) {
  const res = await fetch(
    `https://api.printful.com/sync/products/${productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`
      }
    }
  );
  const { result } = await res.json();
  return result;
}

async function getVariantInfo(variantId) {
  const res = await fetch(
    `https://api.printful.com/products/variant/${variantId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`
      }
    }
  );
  const { result } = await res.json();
  return result;
}

async function getProductInfo(productId) {
  const res = await fetch(
    `https://api.printful.com/products/${productId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`
      }
    }
  );
  const { result } = await res.json();
  return result;
}


async function getAllProductWithVariants() {
  const products = await getProducts();
  const variants = [];
  for (let i = 0; i < products.length; i++) {
    const productWithVariant = await getProductWithVariants(products[i].id);
    variants.push(productWithVariant);
  }
  return variants;
}

async function getProductEntries() {
  const products = await getAllProductWithVariants();
  return products.map(productToEntry);
}

function productToEntry(product) {
  return {
    product: parseProduct(product.sync_product),
    variants: product.sync_variants.map(parseVariant)
  };
}

function parseProduct(product) {
  return {
    name: { en: product.name },
    sku: { en: product.external_id }
  };
}

function parseVariant(variant) {
  return {
    name: { en: variant.name.split(" - ")[1] },
    sku: { en: variant.external_id },
    price: { en: variant.retail_price },
    images: { en: variant.files.map(file => file.preview_url) }
  };
}

module.exports = {
  getProducts,
  getProductWithVariants,
  getAllProductWithVariants,
  getProductEntries,
  productToEntry
};
