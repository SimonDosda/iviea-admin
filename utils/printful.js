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
  return result.variant;
}

async function getVariantShippingRates(variantId, recipient, currency) {
  const res = await fetch(`https://api.printful.com/shipping/rates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`
    },
    body: JSON.stringify({
      recipient,
      items: [{ quantity: 1, variant_id: variantId }],
      currency
    })
  });
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

async function getAllProductInfo() {
  const products = await getProducts();
  const productsInfo = [];
  for (let i = 0; i < products.length; i++) {
    const productInfo = await getProductWithVariants(products[i].id);
    for (let j = 0; j < productInfo.sync_variants.length; j++) {
      const { variant_id } = productInfo.sync_variants[j];
      productInfo.sync_variants[j].info = await getVariantInfo(variant_id);
      productInfo.sync_variants[j].shippingRates = [];
      for (let k = 0; k < recipients.length; k++) {
        const shippingRates = await getVariantShippingRates(
          variant_id,
          recipients[k],
          "EUR"
        );
        productInfo.sync_variants[j].shippingRates.push({
          country: recipients[k].country_code,
          shippingRates
        });
      }
    }
    productsInfo.push(productInfo);
  }
  return productsInfo;
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
    productPrice: variant.info.price,
    price: { en: variant.retail_price },
    shippingRates: [variant.shippingRates.map((shippingRates) => ({
      country: shippingRates.country,
      rate: shippingRates.shippingRates[0].rate
    }))],
    images: { en: variant.files.map(file => file.preview_url) }
  };
}

module.exports = {
  getProducts,
  getProductWithVariants,
  getAllProductWithVariants,
  getProductEntries,
  productToEntry,
  getAllProductInfo
};

const recipients = [
  {
    address1: "1 Avenue Marceau",
    city: "Courbevoie",
    country_code: "FR"
  },
  {
    address1: "10 Downing Street",
    city: "London",
    country_code: "GB"
  },
  {
    address1: "19749 Dearborn St",
    city: "Chatsworth",
    country_code: "US",
    state_code: "CA"
  },
  {
    adress1: "453 West 12th Avenue",
    city: "Vancouver",
    country_code: "CA",
    state_code: "BC"
  }
];
