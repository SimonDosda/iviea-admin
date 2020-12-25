const app = new Vue({
  el: '#app',
  data: {
    title: 'Syncful',
    token: null,
    entries: null,
    products: null
  },
  methods: {
    getEntries: function () {
      fetch("/contentful-api/entries", {
        method: "GET",
       headers: { 
         "Content-Type": "application/json", 
         "Authorization": this.token
       }
      })
      .then(res => res.json())
      .then(response => {
        this.entries = response;
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
    },
    getProducts: function () {
      fetch("/printful-api/products", {
       method: "GET",
       headers: { 
         "Content-Type": "application/json", 
         "Authorization": this.token
       }
      })
      .then(res => res.json())
      .then(response => {
        this.products = response;
      });
    },
  }
})
