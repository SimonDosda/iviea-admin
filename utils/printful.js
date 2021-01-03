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

async function getProducWithVariants(productId) {
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

async 

module.exports = { getProducts };