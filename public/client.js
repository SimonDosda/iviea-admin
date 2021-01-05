const app = new Vue({
  el: "#app",
  data: {
    title: "Syncful",
    token: null,
    entries: []
  },
  methods: {
    fetchApi: function (route, params) {
      return fetch("/api/" + route, {
        ...params,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token
        }
      })
        .then(res => res.json())
        .catch(err => console.log(err))
    },
    getProducts: function() {
      this.fetchApi("products", {
        method: "GET"
      })
        .then(res => res.json())
        .then(({ entries }) => {
          this.entries = entries;
        });
    },
    getEntries: function() {
      fetch("/api/entries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token
        }
      })
        .then(res => res.json())
        .then(({ entries }) => {
          this.entries = entries;
        });
    },
    updateEntries: function() {
      fetch("/api/entries", {
        method: "PUT",
        body: JSON.stringify({entries: this.entries}),
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        }
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
          name: 'shipping rate ' + shipping.country,
          value: shipping.rate
        })),
        {
          name: "total price w/ tax",
          value: 
            variant.productPrice +
            Math.max(...variant.shippingRates.map(({ rate }) => rate))
        },
        { name: "retail price all inc.", value: variant.price.en }
      ];
    }
  }
});
