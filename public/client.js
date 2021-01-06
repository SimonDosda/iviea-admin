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
      return [
        { name: "name", value: variant.name.en },
        { name: "product price", value: variant.productPrice },
        ...variant.shippingRates.map(shipping => ({
          name: "shipping rate " + shipping.country,
          value: shipping.rate
        })),
        {
          name: "total price w/ tax",
          value:
            Math.round(
              (variant.productPrice +
                Math.max(...variant.shippingRates.map(({ rate }) => rate))) *
                100
            ) / 100
        },
        { name: "retail price all inc.", value: variant.price.en }
      ];
    }
  }
});
