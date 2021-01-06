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
    addEntry: function() {
      fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token
        }
      }).then(res => res.json());
    },
    getFields: function(variant) {
      const shippingRates = variant.shippingRates.map(({ rate }) => rate);
      const minShippingRate = Math.max(...shippingRates);
      const maxShippingRate = Math.max(...shippingRates);
      const totalPrice = variant.productPrice + maxShippingRate;
      const netRetailPrice = variant.price.en * 0.75;
      const margin = netRetailPrice - totalPrice;

      const round = value => Math.round(value * 100) / 100;
      const formatPrice = value => Math.round(value * 100) / 100 + " €";
      const formatPercent = value => Math.round(value * 1000) / 10 + " %";

      return [
        { name: "name", value: variant.name.en },
        { name: "product price", value: variant.productPrice },
        { name: "min shipping rate", value: formatPrice(minShippingRate) },
        { name: "maw shipping rate", value: formatPrice(maxShippingRate) },
        { name: "total price w/ tax", value: formatPrice(totalPrice) },
        { name: "retail price all inc.", value: formatPrice(variant.price.en) },
        { name: "net retail price", value: formatPrice(netRetailPrice) },
        { name: "margin €", value: formatPrice(margin) },
        {
          name: "margin %",
          value: formatPercent(margin / variant.price.en)
        },
        {
          name: "advise",
          value: formatPrice(totalPrice / (0.75 - 0.3))
        }
      ];
    }
  }
});
