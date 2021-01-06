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
      const minShippingRate = Math.max(...variant.shippingRates.map(({ rate }) => rate));
      const maxShippingRate = Math.max(...variant.shippingRates.map(({ rate }) => rate));
      return [
        { name: "name", value: variant.name.en },
        { name: "product price", value: variant.productPrice },
        { name: "min shipping rate", value: minShippingRate },
        ,
        {
          name: "total price w/ tax",
          value:
            Math.round(
              (variant.productPrice + maxShippingRate
                 *
                100
            ) / 100
        },
        { name: "retail price all inc.", value: variant.price.en },
        { name: "net retail price", value: Math.round(variant.price.en * 75) / 100 },
        { name: "margin", value: Math.round((variant.price.en * 0.75 - variant.productPrice -
                maxShippingRate * 100) / 100  }
      ];
    }
  }
});
