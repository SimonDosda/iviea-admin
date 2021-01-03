const fetch = require('node-fetch');

async function getProducts() {
  const res = await fetch("https://api.printful.com/sync/products", {
    method: "GET",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Basic ${process.env.PRINTFUL_API_KEY}`
    }
  });
  const {result} = await res.json();
  return result;
}

async function getProductWithVariants(productId) {
  const res = await fetch(`https://api.printful.com/sync/products/${productId}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Basic ${process.env.PRINTFUL_API_KEY}`
    }
  });
  const {result} = await res.json();
  return result;
}

async function getVariants() {
  const products = await getProducts();
  const variants = [];
  for (let i = 0; i < products.length; i++) {
    const productWithVariant = await getProductWithVariants(products[i].id);
    variants.push(productWithVariant);
  }
  return variants;
}

module.exports = { getProducts, getProductWithVariants, getVariants };