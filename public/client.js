const app = new Vue({
  el: "#app",
  data: {
    title: "Syncful",
    token: null,
    entries: [],
    error: null,
    locale: "en-US",
  },
  methods: {
    fetchApi: function (route, params) {
      this.error = null;
      return fetch("/api/" + route, {
        ...params,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
      }).then((res) => {
        if (res.status == 400) {
          this.error = "Unauthorized";
          return {};
        }
        return res.json();
      });
    },
    getEntries: function () {
      this.fetchApi("entries", { method: "GET" }).then(({ entries }) => {
        this.entries = entries;
      });
    },
    getDbEntries: function () {
      this.fetchApi("db-entries", { method: "GET" }).then(({ entries }) => {
        this.entries = entries;
      });
    },
    saveDbEntries: function () {
      this.fetchApi("db-entries", {
        method: "PUT",
        body: JSON.stringify({ entries: this.entries }),
      });
    },
    syncEntries: function () {
      this.fetchApi("entries", {
        method: "POST",
        body: JSON.stringify({ entries: this.entries }),
      });
    },
    getFields: function (variant) {
      const shippingRates = variant.shippingRates[this.locale].map(
        ({ rate }) => rate
      );
      const minShippingRate = Math.min(...shippingRates);
      const maxShippingRate = Math.max(...shippingRates);
      const totalPrice = variant.productPrice[this.locale] + maxShippingRate;
      const retailPrice = variant.retailPrice[this.locale];
      const netRate = 0.75;
      const margin = retailPrice * netRate - totalPrice;

      const formatPrice = (value) => Math.round(value * 100) / 100 + " €";
      const formatPercent = (value) => Math.round(value * 1000) / 10 + " %";

      return [
        { name: "name", value: variant.name[this.locale] },
        { name: "status", value: this.getStatus(variant) },
        { name: "product price", value: variant.productPrice[this.locale] },
        { name: "min shipping rate", value: formatPrice(minShippingRate) },
        { name: "max shipping rate", value: formatPrice(maxShippingRate) },
        { name: "total price w/ tax", value: formatPrice(totalPrice) },
        {
          name: "retail price all inc.",
          field: retailPrice,
          editable: true,
          value: formatPrice(retailPrice),
          setValue: (value) =>
            (variant.retailPrice[this.locale] = parseInt(value)),
        },
        { name: "net retail price", value: formatPrice(retailPrice * netRate) },
        { name: "margin €", value: formatPrice(margin) },
        {
          name: "margin %",
          value: formatPercent(margin / retailPrice),
        },
        {
          name: "advise",
          value: Math.round(totalPrice / (netRate - 0.3)) + " €",
        },
      ];
    },
    getStatus: function (field) {
      return field.contentful ? (field.printful ? "" : "-") : "+";
    },
  },
});
