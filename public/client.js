const app = new Vue({
  el: "#app",
  data: {
    title: "Syncful",
    token: null,
    entries: [],
    error: null
  },
  methods: {
    fetchApi: function(route, params) {
      this.error = null;
      return fetch("/api/" + route, {
        ...params,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token
        }
      }).then(res => {
        if (res.status == 400) {
          this.error = "Unauthorized";
          return {};
        }
        return res.json();
      });
    },
    getProducts: function() {
      this.fetchApi("products", { method: "GET" }).then(({ entries }) => {
        this.entries = entries;
      });
    },
    getEntries: function() {
      this.fetchApi("entries", { method: "GET" }).then(({ entries }) => {
        this.entries = entries;
      });
    },
    updateEntries: function() {
      this.fetchApi("entries", {
        method: "PUT",
        body: JSON.stringify({ entries: this.entries })
      });
    },
    syncEntries: function() {
      this.fetchApi("entries", {
        method: "POST",
        body: JSON.stringify({ entries: this.entries })
      });
    },
    getFields: function(variant) {
      const shippingRates = variant.shippingRates.en.map(({ rate }) => rate);
      const minShippingRate = Math.min(...shippingRates);
      const maxShippingRate = Math.max(...shippingRates);
      const totalPrice = variant.productPrice.en + maxShippingRate;
      const retailPrice = variant.retailPrice.en;
      const netRate = 0.75;
      const margin = retailPrice * netRate - totalPrice;

      const round = value => Math.round(value * 100) / 100;
      const formatPrice = value => Math.round(value * 100) / 100 + " €";
      const formatPercent = value => Math.round(value * 1000) / 10 + " %";

      return [
        { name: "name", value: variant.name.en },
        { name: "product price", value: variant.productPrice.en },
        { name: "min shipping rate", value: formatPrice(minShippingRate) },
        { name: "max shipping rate", value: formatPrice(maxShippingRate) },
        { name: "total price w/ tax", value: formatPrice(totalPrice) },
        { name: "retail price all inc.", field: retailPrice, value: formatPrice(retailPrice), editable: true, setValue: (value) => variant.retailPrice.en = value},
        { name: "net retail price", value: formatPrice(retailPrice * netRate) },
        { name: "margin €", value: formatPrice(margin) },
        {
          name: "margin %",
          value: formatPercent(margin / retailPrice)
        },
        {
          name: "advise",
          value: Math.round(totalPrice / (netRate - 0.3)) + " €"
        }
      ];
    }
  }
});
