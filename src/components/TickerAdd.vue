<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">
          Тикер
        </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="emptyInput = false"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="ticker.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            @click="addTicker(`${coin}`)"
            v-for="(coin, idx) in filtredCoinsList"
            :key="idx"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ coin }}
          </span>
        </div>
        <BaseButton @buttonClick="add"> <SignPlus /> Add </BaseButton>
        <div v-if="alreadyAdd" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div>
        <div v-else-if="emptyInput" class="text-sm text-red-600">
          Пустое поле добавить нельзя
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import SignPlus from "./UiComponents/SignPlus";
import BaseButton from "./UiComponents/BaseButton.vue";

export default {
  components: { SignPlus, BaseButton },
  props: {
    coinsList: Array,
    alreadyAdd: Boolean,
  },

  data() {
    return {
      ticker: "",
      emptyInput: false,
    };
  },

  computed: {
    filtredCoinsList() {
      let res = this.coinsList
        .filter(i => i.includes(this.ticker.toUpperCase()))
        .slice(0, 4);
      return this.ticker.length > 0 ? res : this.coinsList.slice(0, 4);
    },
  },

  methods: {
    addTicker(coin) {
      this.ticker = coin;
      this.add();
    },

    add() {
      if (this.ticker.length === 0) {
        this.emptyInput = true;
        return;
      }
      this.$emit("add-ticker", this.ticker);
      this.ticker = "";
    },
  },
};
</script>
