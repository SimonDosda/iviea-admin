const app = new Vue({
  el: '#app',
  data: {
    title: 'Syncful',
    password: null,
    token: null,
    entries: null
  },
  methods: {
    authenticate: function () {
      fetch("/authenticate", {
        method: "POST", 
        body: {
          password: this.password
        },
        headers: { "Content-Type": "application/json" }
      })
        .then(res => res.json())
      .then(response => {
        this.token = response;
      })
    },
    getEntries: function () {
      fetch("/entries", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.json())
      .then(response => {
        this.entries = response;
      });
    }  
  }
})
