const app = new Vue({
  el: "#app",
  data: {
    title: "Syncful",
    token: null,
    entries: []
  },
  methods: {
    getProducts: function() {
      fetch("/api/products", {
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
    addEntry: function() {
      fetch("/contentful-api/entries", {
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
