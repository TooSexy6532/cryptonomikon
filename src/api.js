const API_KEY =
  "7c42c280085e60a9906f19cb54cfaa74e24a01cd0522d6ebe84280d0675a9409";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

export const invalidTickers = new Set();
let BTC_PRICE;
socket.addEventListener("message", e => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    TOSYMBOL: priceCurrency,
    PRICE: newPrice,
    PARAMETER: parameter,
    MESSAGE: mmessage,
  } = JSON.parse(e.data);

  if (currency === "BTC") {
    BTC_PRICE = newPrice;
  }

  if (type === AGGREGATE_INDEX && newPrice) {
    invalidTickers.delete(currency);
    const handlers = tickersHandlers.get(currency) ?? [];
    switch (priceCurrency) {
      case "USD":
        handlers.forEach(fn => fn(newPrice));
        break;
      case "BTC":
        handlers.forEach(fn => fn(newPrice * BTC_PRICE));
        break;
    }
  }

  if (mmessage === "INVALID_SUB") {
    let symbol = parameter.split("~")[2];
    let pair = parameter.split("~")[3];
    pair === "USD"
      ? subscribeToTickerOnWs(symbol, "BTC")
      : invalidTickers.add(symbol);
  }
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker, symbol = "USD") {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${symbol}`],
  });
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`, `5~CCCAGG~${ticker}~BTC`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = ticker => {
  invalidTickers.delete(ticker);
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

let url = `https://min-api.cryptocompare.com/data/all/coinlist?summary=true&api_key=7c42c280085e60a9906f19cb54cfaa74e24a01cd0522d6ebe84280d0675a9409`;

export let getCoinsList = fetch(url)
  .then(cl => (cl = cl.json()))
  .then(cl => (cl = Object.keys(cl.Data)))
  .then(cl => (cl = cl.map(i => i.toUpperCase())));
