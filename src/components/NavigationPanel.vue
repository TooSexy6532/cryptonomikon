<template>
  <section>
    <BaseLineGray />
    <BaseButton v-if="page > 1" @buttonClick="page = page - 1">
      Назад
    </BaseButton>
    <BaseButton v-if="hasNextPage" @buttonClick="page = page + 1">
      Вперед
    </BaseButton>
    <input
      v-model="filter"
      class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
      placeholder="Введите смвол по которому хотите отфильтровать список"
      type="text"
    />
  </section>
</template>

<script>
import BaseLineGray from "./UiComponents/BaseLineGray.vue";
import BaseButton from "./UiComponents/BaseButton.vue";
export default {
  components: {
    BaseButton,
    BaseLineGray,
  },

  props: {
    tickers: {
      type: Array,
    },
  },

  data() {
    return {
      filter: "",
      page: 1,
    };
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter(ticker =>
        ticker.name.includes(this.filter.toUpperCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  mounted() {
    this.$emit("filter-change", this.paginatedTickers);
  },

  watch: {
    tickersList() {
      console.log("tickers", this.tickersList);
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
      this.$emit("filter-change", this.paginatedTickers);
    },

    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&=page${value.page}`
      );
    },
  },
};
</script>
