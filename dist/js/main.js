"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }

function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-env browser */
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", clickHandler);
  document.addEventListener("scroll", scrollHandler); // ?????????? ???????????? ???? cookies, ???????? ????????

  updateCartCache();
  updateDataCache().then(function (r) {
    dataCache = r; // ???????????????? ?????????????? ?? ??????????????

    updateCheckoutTable();
  }); // ???????? ?????????????? ???? ????????????, ???????????????? ????????????

  showCartControls(checkCartCache()); // ?????????????????? ???????????????? ???????????????????? ???????????????????????? ??????????????

  fillInputs();
}); // ?????? ?????????????? ??????????????????????,
// ?????????? ???????????? ?????????? ?????????????????? ?????????????? ?? ???????????????? ???????? ??????????????????????

var timeout; // ???????????????????????? ???????? ?????? ?????????????? ?? ?????? ?????????????? ???????????? (?????????????????? ?????????????? ??????????????)

var cartCache = {};
var dataCache = {}; // ?????????????????? ????????????

var clickHandler = function clickHandler(event) {
  // ???????????? ??????????????????????, ???????? ???????????????????????? ???????????????????? ????????????????
  hideToastMessage(); // ???????????????????? ?? ?????????????? ?????? ???????????? ???? ??????????????????

  addToCart(event); // ?????? ???????????? ???????????? ????????????

  showCheckoutModal(event); // ?????????????? ??????????

  closeCheckoutModal(event); // ???????????? ?????? ???????????????? ????????????

  makeOrder(event);
}; // ?????????????????? ??????????????


var scrollHandler = function scrollHandler() {
  // ???????? ??????????????????
  blurHeader();
};

var blurHeader = function blurHeader() {
  // ???????????? ?????????????????? ???? ????????, ?????? ???????????? ???? ??????????????????
  var header = document.querySelector(".main-header");
  var blurClass = "main-header_blur";
  var isBlurred = header.classList.contains(blurClass);
  if (!isBlurred && window.scrollY > window.innerHeight / 4) header.classList.add(blurClass);

  if (isBlurred && window.scrollY < window.innerHeight / 4) {
    header.classList.remove(blurClass);
  }
};

var addToCart = function addToCart(event) {
  // ?????????? ?????????? ???????????????????? ?? ??????????????
  var button = event.target;
  if (!button.classList.contains("card__button-to-cart")) return; // ???????????????????????? ????????????????

  var card = button.closest("li.card"); // ?????????????? ???????????????? ?? ??????????????

  var qty = card.querySelector(".card__qty-input").value; // ?????????????? ?????? ?????????????????? ???????????????????? ?? ???????????????????????? ??????????????????

  var sku = card.dataset["sku"]; // ???????? ???????? ?????? ???????????????? - ??????????????????, ???????? ?????? - ?????????????? ???? ??????????????

  if (qty > 0) {
    // ?????????????? ?? cookies
    sessionStorage.setItem("cart", JSON.stringify(_objectSpread(_objectSpread({}, cartCache), {}, _defineProperty({}, sku, qty)))); // ?????????????? ?????? ??????????????

    cartCache = _objectSpread(_objectSpread({}, cartCache), {}, _defineProperty({}, sku, qty)); // ?????????????????? ???? ????????????????????

    showToastMessage("".concat(dataCache[sku].title, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 "));
  } else {
    /* eslint-disable-next-line no-unused-vars */
    var _cartCache = cartCache,
        remove = _cartCache[sku],
        remaining = _objectWithoutProperties(_cartCache, [sku].map(_toPropertyKey));

    sessionStorage.setItem("cart", JSON.stringify(remaining));
    showToastMessage("".concat(dataCache[sku].title, " \u0443\u0434\u0430\u043B\u0451\u043D \u0438\u0437 \u043A\u043E\u0440\u0437\u0438\u043D\u044B "));
    cartCache = remaining;
  } // ???????????????? ???????? ???? ???????????????????? ???????????? ?????????????????? ??????????????


  showCartControls(Object.keys(cartCache).length > 0); // ???????????????????? ?????????????? ?? ?????????????? ?? ????????????

  updateCheckoutTable();
}; // ???????????????? ???????????? ???? ??????
// ( ???????????????????????? ???????????? ?????? ???????????? ??????????????, ?????????? ???????????? )


var checkCartCache = function checkCartCache() {
  return cartCache ? Object.keys(cartCache).length > 0 : false;
}; // ???????????????? ?????? ??????????????, ?????? ?? cookies


var updateCartCache = function updateCartCache() {
  var cart = sessionStorage.getItem("cart");
  cartCache = JSON.parse(cart);
}; // ???????????????????? ?????? ???????????????? ???????????? ?????????????????? ??????????????
// ?????? ???????????? ??????????????????, ?????????????? ???? ??????????, ?????????? ?????????????? ????????????


var showCartControls = function showCartControls() {
  var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var buttonCheckout = document.querySelector(".button-checkout");
  if (show) buttonCheckout.classList.remove("button-checkout_hidden");else buttonCheckout.classList.add("button-checkout_hidden");
}; // ???????????????????? ???????????????? ????????????????????


var fillInputs = function fillInputs() {
  // ???????? ?????????????? ???????????? ???? ???????? ??????????????????
  var cart = cartCache ? Object.keys(cartCache) : [];
  if (!cart.length > 0) return; // ?????????????????? ????????, ???????????????? ?????????????????? ???? ????????????????

  cart.map(function (s) {
    var input = document.querySelector("li[data-sku='".concat(s, "'] .card__qty-input"));
    input.value = cartCache[s];
  });
}; // ???????????????? ???????? ??????????
// ???????????????????????? ?????????? ????????????


var clearInputs = function clearInputs() {
  document.querySelectorAll("li.card .card__qty-input").forEach(function (i) {
    return i.value = "";
  });
}; // ???????????????? ????????????


var closeCheckoutModal = function closeCheckoutModal(event) {
  var closeModal = event.target;
  if (!closeModal.classList.contains("checkout-modal__close")) return;
  var checkoutModal = document.querySelector(".checkout-modal");
  checkoutModal.classList.add("checkout-modal_hidden");
}; // ???????????????? ????????????


var showCheckoutModal = function showCheckoutModal(event) {
  var showCheckoutButton = event.target;
  if (!showCheckoutButton.classList.contains("button-checkout")) return;
  var checkoutModalHidden = document.querySelector(".checkout-modal_hidden");
  checkoutModalHidden.classList.remove("checkout-modal_hidden");
}; // ???????????????? ?????????????? ?? ?????????????? ?? ????????????


var updateCheckoutTable = function updateCheckoutTable() {
  var checkoutTable = document.querySelector(".checkout-modal__table__body");
  var cartIsNotEmpty = cartCache ? Object.keys(cartCache).length > 0 : false; // ???????? ?????????????? ???????????? - ???? ??????????????????

  if (!cartIsNotEmpty) return;
  var cart = cartIsNotEmpty ? Object.keys(cartCache) : [];
  checkoutTable.innerHTML = "";
  cart.map(function (c) {
    var tr = document.createElement("tr");
    var tdTitle = document.createElement("td");
    tdTitle.textContent = dataCache[c].title;
    var tdQty = document.createElement("td");
    tdQty.textContent = cartCache[c];
    var tdPrice = document.createElement("td");
    tdPrice.textContent = dataCache[c].price;
    tr.append(tdTitle, tdPrice, tdQty);
    checkoutTable.append(tr);
  });
}; // ?????????????????? ???????????? json ?? ????????????????????


var updateDataCache = function updateDataCache() {
  return new Promise(function (res) {
    var XHR = new XMLHttpRequest();

    XHR.onload = function () {
      var response = JSON.parse(this.responseText);
      var cards = response.cards;
      cards.map(function (c) {
        var sku = c.sku;
        dataCache[sku] = c;
      });
      res(dataCache);
    };

    XHR.open("GET", "data.json", true);
    XHR.send();
  });
}; // ???????????????????? ????????????
// ??????????????????, ???????????????? ?????????????? ???????????? ?? ????????????
// ?????????????????? ?? ????????????
// ???????????????? ???????????????????? ?? cookies ???????? ?????????? ??????????????????
// ???????????????? ???????????? ?????? ??????????????


var makeOrder = function makeOrder(event) {
  var orderButton = event.target;
  if (!orderButton.classList.contains("checkout-modal__button")) return;
  var validation = false;
  var phone = document.querySelector(".checkout-modal__form__phone").value;
  var validationPhone = validation || validatePhone(phone);
  var name = document.querySelector(".checkout-modal__form__name").value;
  var validationName = validation || validateName(name);
  if (!(validationName && validationPhone)) return;
  sendOrder({
    name: name,
    phone: phone,
    cart: cartCache
  });
  showToastMessage("?????????????? ???? ??????????");
  sessionStorage.clear();
  updateCartCache();
  clearInputs();
  document.querySelector(".checkout-modal").classList.add("checkout-modal_hidden");
  document.querySelector(".button-checkout").classList.add("button-checkout_hidden");
  ym(33645739, 'reachGoal', 'order');
  return true;
}; // ?????????????????? ??????????
// ???????????? ?????????? ?? ??????????????


var validateName = function validateName(name) {
  var regName = /[A-Za-z??-????-?? ]{2,}/;
  var test = regName.test(name) && name.length > 0;
  if (!test) showToastMessage("???????????????? ???????????? ??????????");
  return test;
}; // ?????????????????? ????????????????
// ???????????? ??????????, ??????????????, ????????????????
// ?????????? ???????????? ???????? 11 ????????


var validatePhone = function validatePhone(phone) {
  var regPhoneNoWords = /[+\d\-\s]/g;
  phone.replace(regPhoneNoWords, "");
  var regOnlyNumbers = /[^\d]+/g;
  phone = phone.replace(regOnlyNumbers, "");
  var test = phone.length == 11;
  if (!test) showToastMessage("???????????????? ???????????? ????????????????");
  return test;
}; // ???????????????? ??????????????????????


var showToastMessage = function showToastMessage(message) {
  var toastMessage = document.querySelector(".toast-message");
  toastMessage.textContent = message;
  toastMessage.classList.remove("hidden"); // ?????????? 10 ?????? ?????????? ????????????

  timeout = window.setTimeout(function () {
    toastMessage.classList.add("hidden");
    window.clearTimeout(timeout);
  }, 10000);
}; // ???????????????? ?? ???????????? ??????????????????????


var hideToastMessage = function hideToastMessage() {
  var toastMessage = document.querySelector(".toast-message");
  toastMessage.textContent = "";
  toastMessage.classList.add("hidden");
}; // ?????????????????? ?????????????? ???????????????????? ?? ????????????
// ??????, ??????????????, ??????????


var sendOrder = function sendOrder(orderJSON) {
  var orderString = JSON.stringify(orderJSON);
  var order = new FormData();
  order.append("order", orderString);
  var XHR = new XMLHttpRequest();
  XHR.open("POST", "/script.php", true);
  XHR.send(order);
};