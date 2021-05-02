const locale = process.env.CONTENTFUL_LOCALE;

export function mergeEntries(contentfulEntries, printfulEntries) {
  const entries = contentfulEntries.reduce((res, entry) => {
    return {
      ...res,
      [entry.product.id[locale]]: {
        product: {
          ...entry.product,
          contentful: true,
          printful: false,
        },
        variants: entry.variants.map((variant) => ({
          ...variant,
          contentful: true,
          printful: false,
        })),
      },
    };
  }, {});
  printfulEntries.forEach((entry) => {
    if (entry.product.id[locale] in entries) {
      const syncedEntry = entries[entry.product.id[locale]];
      syncedEntry.product.printful = true;
      entry.variants.forEach((variant) => {
        const syncedVariant = syncedEntry.variants.find(
          (v) => v.id[locale] === variant.id[locale]
        );
        if (syncedVariant) {
          syncedVariant.printful = true;
        } else {
          entry.variants.push({
            ...variant,
            contentful: false,
            printful: true,
          });
        }
      });
    } else {
      entries[entry.product.id[locale]] = {
        product: {
          ...entry.product,
          contentful: false,
          printful: true,
        },
        variants: entry.variants.map((variant) => ({
          ...variant,
          contentful: false,
          printful: true,
        })),
      };
    }
  });

  return Object.values(entries).map((entry) => ({
    ...entry,
    variants: entry.variants.sort(
      (v1, v2) => v1.price[locale] - v2.price[locale]
    ),
  }));
}
