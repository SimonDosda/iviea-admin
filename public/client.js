const app = new Vue({
  el: '#app',
  data: {
    title: 'Syncful',
    token: null,
    entries: null
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
    }  
  }
})
