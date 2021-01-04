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

async function getAllProductWithVariants() {
  const products = await getProducts();
  const variants = [];
  for (let i = 0; i < products.length; i++) {
    const productWithVariant = await getProductWithVariants(products[i].id);
    variants.push(productWithVariant);
  }
  return variants;
}

function productToEntry(product) {
  return {
    product: parseProduct(product.sync_product),
    variants: product.sync_variants.map(parseVariant)
  };
}

function parseProduct(product) {
  return {
    name: product.name,
    sku: product.external_id
  };
}

function parseVariant(variant) {
  return {
    name: {en: variant.name},
    sku: {en: variant.external_id},
    price: {en: variant.retail_price},
    images: variant.files.map(file => file.preview_url)
  };
}

module.exports = {
  getProducts,
  getProductWithVariants,
  getAllProductWithVariants
};
