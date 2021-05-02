const app = new Vue({
  el: "#app",
  data: {
    title: "Syncful",
    token: null,
    entries: [],
    error: null,
    locale: "en-US",
  },
  methods: {
    fetchApi: function (route, params) {
      this.error = null;
      return fetch("/api/" + route, {
        ...params,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.token,
        },
      }).then((res) => {
        if (res.status == 400) {
          this.error = "Unauthorized";
          return {};
        }
        return res.json();
      });
    },
    getEntries: function () {
      this.fetchApi("entries", { method: "GET" }).then(({ entries }) => {
        this.entries = entries;
      });
    },
    getDbEntries: function () {
      this.fetchApi("db-entries", { method: "GET" }).then(({ entries }) => {
        this.entries = entries;
      });
    },
    saveDbEntries: function () {
      this.fetchApi("db-entries", {
        method: "PUT",
        body: JSON.stringify({ entries: this.entries }),
      });
    },
    syncEntries: function () {
      this.fetchApi("entries", {
        method: "POST",
        body: JSON.stringify({ entries: this.entries }),
      });
    },
    getFields: function (variant) {
      const formatPrice = (value) => Math.round(value * 100) / 100 + " €";
      const formatPercent = (value) => Math.round(value * 1000) / 10 + " %";

      return [
        { name: "name", value: variant.name[this.locale] },
        { name: "status", value: this.getStatus(variant) },
        { name: "price.", value: formatPrice(variant.price[this.locale]) },
      ];
    },
    getStatus: function (field) {
      return field.contentful ? (field.printful ? "" : "-") : "+";
    },
  },
});
