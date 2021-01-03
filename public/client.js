const app = new Vue({
  el: '#app',
  data: {
    title: 'Syncful',
    token: null,
    entries: null,
    products: null
  },
  methods: {
    getProducts: function () {
      fetch("/api/products", {
        method: "GET",
       headers: { 
         "Content-Type": "application/json", 
         "Authorization": this.token
       }
      })
      .then(res => res.json())
      .then(({entries, products}) => {
        this.entries = entries;
        this.products = products;
      });
    },
    addEntry: function () {
      fetch("/contentful-api/entries", {
        method: "POST",
        headers: { 
         "Content-Type": "application/json", 
         "Authorization": this.token
       }
      })
      .then(res => res.json());
    }
  }
})
