<template>
  <div>
    <BaseGrayLine />
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <TickersListItem
        v-for="ticker in tickerList"
        :key="ticker.name"
        :ticker="ticker"
        :selected-ticker="selectedTicker"
        @select="select"
        @confirm="confirm"
      />
    </dl>
    <BaseGrayLine />
  </div>
</template>

<script>
import TickersListItem from "./TickersListItem.vue";
import BaseGrayLine from "./UiComponents/BaseLineGray.vue";
export default {
  components: {
    TickersListItem,
    BaseGrayLine,
  },
  props: {
    tickerList: {
      type: Array,
    },
    selectedTicker: {
      type: Object,
    },
  },

  methods: {
    confirm(ticker) {
      this.$emit("remove", ticker);
      this.showModal = !this.showModal;
    },
    select(ticker) {
      this.$emit("select", ticker);
    },

    formatPrice(price) {
      if (price === "-") {
        return price;
      }
      return price > 1 ? price.toFixed(2) : price.toPrecision(2);
    },
  },
};
</script>
