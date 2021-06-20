<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
      v-if="false"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <add-ticker
        @add-ticker="add"
        @input="alreadyAdd = false"
        v-bind:coinsList="allCoinsList"
        v-bind:alreadyAdd="alreadyAdd"
      />

      <navigation-panel :tickers="tickers" @filter-change="getTickerList" />

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <ticker-render
          :tickerList="paginatedTickers"
          :selectedTicker="selectedTicker"
          @select="select"
          @remove="remove"
        />
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>

      <show-graph
        @removeSelection="selectedTicker = null"
        :graph="graph"
        :selectedTicker="selectedTicker"
      />
    </div>
  </div>
</template>

<script>
import {
  getCoinsList,
  invalidTickers,
  subscribeToTicker,
  unsubscribeFromTicker,
} from "./api";
import AddTicker from "./components/AddTicker";
import ShowGraph from "./components/ShowGraph";
import NavigationPanel from "./components/NavigationPanel";
import TickerRender from "./components/TickerRender.vue";
export default {
  name: "App",

  components: {
    AddTicker,
    ShowGraph,
    NavigationPanel,
    TickerRender,
  },

  data() {
    return {
      tickers: [],

      alreadyAdd: false,

      invalidTickersList: invalidTickers,
      allCoinsList: null,

      paginatedTickers: [],

      graph: [],
      selectedTicker: null,
    };
  },

  created() {
    getCoinsList.then(coinsList => (this.allCoinsList = coinsList));

    const tickersData = localStorage.getItem("crypto-list");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);

      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, newPrice =>
          this.updateTicker(ticker.name, newPrice)
        );
      });
    }
  },

  methods: {
    getTickerList(tickers) {
      this.paginatedTickers = tickers;
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },

    checkValid() {
      this.tickers.forEach(ticker =>
        this.invalidTickersList.has(ticker.name)
          ? (ticker.isValid = false)
          : null
      );
    },

    updateTicker(tickerName, price) {
      this.checkValid();
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
          }
          t.price = price;
        });
    },

    add(ticker) {
      const currentTicker = {
        name: ticker.toUpperCase() || "default",
        price: "-",
        isValid: true,
      };

      if (!this.tickers.find(item => item.name === currentTicker.name)) {
        this.tickers = [...this.tickers, currentTicker];
        this.filter = "";
        subscribeToTicker(currentTicker.name, newPrice =>
          this.updateTicker(currentTicker.name, newPrice)
        );
      } else {
        this.alreadyAdd = true;
      }
    },

    remove(removedTicker) {
      this.tickers = this.tickers.filter(t => t !== removedTicker);
      if (this.selectedTicker === removedTicker) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(removedTicker.name);
    },

    select(ticker) {
      this.graph = [];
      this.selectedTicker = ticker;
    },
  },

  watch: {
    tickers() {
      localStorage.setItem("crypto-list", JSON.stringify(this.tickers));
    },
  },
};
</script>
