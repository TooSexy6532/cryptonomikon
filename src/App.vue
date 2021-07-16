<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <BaseSpiner v-if="toggleSpiner" />
    <div class="container">
      <TickerAdd
        @add-ticker="add"
        @input="alreadyAdd = false"
        :coins-list="allCoinsList"
        :already-add="alreadyAdd"
      />

      <NavigationPanel :tickers="tickers" @filter-change="getTickerList" />

      <template v-if="tickers.length">
        <TickersList
          :ticker-list="paginatedTickers"
          :selected-ticker="selectedTicker"
          @select="setSelectedTicker"
          @remove="remove"
        />
      </template>

      <TickerSelectedGraph
        @removeSelection="selectedTicker = null"
        :graph="graph"
        :selected-ticker="selectedTicker"
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
import TickerAdd from "./components/TickerAdd";
import TickerSelectedGraph from "./components/TickerSelectedGraph";
import NavigationPanel from "./components/NavigationPanel";
import TickersList from "./components/TickersList.vue";
import BaseSpiner from "./components/UiComponents/BaseSpiner.vue";

export default {
  name: "App",

  components: {
    TickerAdd,
    TickerSelectedGraph,
    NavigationPanel,
    TickersList,
    BaseSpiner,
  },

  data() {
    return {
      toggleSpiner: false,
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
        this.alreadyAdd = false;
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

    setSelectedTicker(ticker) {
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
