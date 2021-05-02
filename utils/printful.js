import fetch from "node-fetch";

const locale = process.env.CONTENTFUL_LOCALE;

async function getProducts() {
  const res = await fetch("https://api.printful.com/sync/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
    },
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
        Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
      },
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
        Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
      },
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
      Authorization: `Basic ${process.env.PRINTFUL_API_KEY}`,
    },
    body: JSON.stringify({
      recipient,
      items: [{ quantity: 1, variant_id: variantId }],
      currency,
    }),
  });
  const { result } = await res.json();
  return result;
}

async function getAllProductInfo() {
  const products = await getProducts();
  const productsInfo = [];
  for (let i = 0; i < products.length; i++) {
    const productInfo = await getProductWithVariants(products[i].id);
    for (let j = 0; j < productInfo.sync_variants.length; j++) {
      const { variant_id } = productInfo.sync_variants[j];
      productInfo.sync_variants[j].info = await getVariantInfo(variant_id);
    }
    productsInfo.push(productInfo);
  }
  return productsInfo;
}

export async function getPrinfulEntries() {
  const products = await getAllProductInfo();
  return products.map(productToEntry);
}

export function productToEntry(product) {
  const entry = {
    product: parseProduct(product.sync_product),
    variants: product.sync_variants.map(parseVariant),
  };
  const images = entry.variants[0].images[locale];
  if (
    entry.variants.every(
      (variant) =>
        JSON.stringify(variant.images[locale][0]) === JSON.stringify(images[0])
    )
  ) {
    entry.product.images[locale] = images;
    entry.variants.forEach((variant) => (variant.images[locale] = []));
  }
  return entry;
}

export function parseProduct(product) {
  return {
    id: { [locale]: product.id },
    name: { [locale]: product.name },
    images: { [locale]: [] },
  };
}

export function parseVariant(variant) {
  return {
    id: { [locale]: variant.id },
    name: { [locale]: variant.name },
    description: { [locale]: variant.info.name },
    size: { [locale]: variant.info.size },
    sku: { [locale]: variant.sku },
    price: { [locale]: parseFloat(variant.retail_price) },
    images: {
      [locale]: variant.files.map((file) => ({
        upload: file.preview_url,
        contentType: file.mime_type,
        fileName: file.filename,
      })),
    },
  };
}

const recipients = [
  {
    address1: "1 Avenue Marceau",
    city: "Courbevoie",
    country_code: "FR",
  },
  {
    address1: "10 Downing Street",
    city: "London",
    country_code: "GB",
  },
  {
    address1: "19749 Dearborn St",
    city: "Chatsworth",
    country_code: "US",
    state_code: "CA",
  },
  {
    adress1: "453 West 12th Avenue",
    city: "Vancouver",
    country_code: "CA",
    state_code: "BC",
  },
];
