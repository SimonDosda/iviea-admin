const app = new Vue({
  el: '#app',
  data: {
    title: 'Syncful',
    entries: null
  },
  methods: {
    getEntries: function () {
      fetch("/entries", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.json())
      .then(response => {
        this.entries = response;
        console.log(JSON.stringify(response));
      });
    }  
  }
})
