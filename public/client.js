const app = new Vue({
  el: '#app',
  data: {
    title: 'Syncful'
  },
  methods: {
    getEntries: function () {
      fetch("/entries", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(response => {
      console.log(JSON.stringify(response));
    });
    }
  }
})
