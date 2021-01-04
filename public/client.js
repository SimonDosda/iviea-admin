const app = new Vue({
  el: "#app",
  data: {
    title: "Syncful",
    token: null,
    entries: [],
    fields: [
      { name: "name", value: variant => variant.name.en },
      { name: "product price", value: variant => variant.productPrice },
      { name: "shipping", value: variant => variant.shippingRates[0].rate },
      {
        name: "all inc. price",
        value: variant =>
          Math.round(variant.productPrice + variant.shippingRates[0].rate * 12) / 10
      },
      { name: "retail price", value: variant => variant.price.en }
    ]
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
    }
  }
});
