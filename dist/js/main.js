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
  document.addEventListener("scroll", scrollHandler); // взять данные из cookies, если есть

  updateCartCache();
  updateDataCache().then(function (r) {
    dataCache = r; // обновить таблицу с заказом

    updateCheckoutTable();
  }); // если корзина не пустая, показать кнопку

  showCartControls(checkCartCache()); // заполнить элементы управления сохранёнными данными

  fillInputs();
}); // для скрытия уведомлений,
// чтобы кнопки могли прерывать текущее и выводить свои уведомления

var timeout; // использовать кэши для корзины и для внешних данных (сократить сетевые запросы)

var cartCache = {};
var dataCache = {}; // обработка кликов

var clickHandler = function clickHandler(event) {
  // скрыть уведомление, если пользователь продолжает действия
  hideToastMessage(); // добавление в корзину для кнопок на карточках

  addToCart(event); // для кнопки показа модала

  showCheckoutModal(event); // закрыть модал

  closeCheckoutModal(event); // кнопка для отправки заказа

  makeOrder(event);
}; // обработка скролла


var scrollHandler = function scrollHandler() {
  // блюр заголовка
  blurHeader();
};

var blurHeader = function blurHeader() {
  // блюрим заголовок на фоне, для фокуса на карточках
  var header = document.querySelector(".main-header");
  var blurClass = "main-header_blur";
  var isBlurred = header.classList.contains(blurClass);
  if (!isBlurred && window.scrollY > window.innerHeight / 4) header.classList.add(blurClass);

  if (isBlurred && window.scrollY < window.innerHeight / 4) {
    header.classList.remove(blurClass);
  }
};

var addToCart = function addToCart(event) {
  // нужна кнока добавления в корзину
  var button = event.target;
  if (!button.classList.contains("card__button-to-cart")) return; // родительская карточка

  var card = button.closest("li.card"); // сколько добавить в корзину

  var qty = card.querySelector(".card__qty-input").value; // артикул для упрощения сохранения и последующего обращения

  var sku = card.dataset["sku"]; // если есть что добавить - добавляем, если нет - удалить из корзины

  if (qty > 0) {
    // корзину в cookies
    sessionStorage.setItem("cart", JSON.stringify(_objectSpread(_objectSpread({}, cartCache), {}, _defineProperty({}, sku, qty)))); // обновим кэш корзины

    cartCache = _objectSpread(_objectSpread({}, cartCache), {}, _defineProperty({}, sku, qty)); // сообщение об добавлении

    showToastMessage("".concat(dataCache[sku].title, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 "));
  } else {
    /* eslint-disable-next-line no-unused-vars */
    var _cartCache = cartCache,
        remove = _cartCache[sku],
        remaining = _objectWithoutProperties(_cartCache, [sku].map(_toPropertyKey));

    sessionStorage.setItem("cart", JSON.stringify(remaining));
    showToastMessage("".concat(dataCache[sku].title, " \u0443\u0434\u0430\u043B\u0451\u043D \u0438\u0437 \u043A\u043E\u0440\u0437\u0438\u043D\u044B "));
    cartCache = remaining;
  } // проверка надо ли показывать кнопку просмотра корзины


  showCartControls(Object.keys(cartCache).length > 0); // обновление таблицы с заказом в модале

  updateCheckoutTable();
}; // проверка пустой ли кэш
// ( используется только при первом запуске, нужно убрать )


var checkCartCache = function checkCartCache() {
  return cartCache ? Object.keys(cartCache).length > 0 : false;
}; // обновить кэш корзины, как в cookies


var updateCartCache = function updateCartCache() {
  var cart = sessionStorage.getItem("cart");
  cartCache = JSON.parse(cart);
}; // показывать или скрывать кнопку просмотра корзины
// или других элементов, которые не нужны, когда корзины пустая


var showCartControls = function showCartControls() {
  var show = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var buttonCheckout = document.querySelector(".button-checkout");
  if (show) buttonCheckout.classList.remove("button-checkout_hidden");else buttonCheckout.classList.add("button-checkout_hidden");
}; // заполнение элемнтов управления


var fillInputs = function fillInputs() {
  // если корзина пустая не надо заполнять
  var cart = cartCache ? Object.keys(cartCache) : [];
  if (!cart.length > 0) return; // заполняем поля, использя навигацию по артикулу

  cart.map(function (s) {
    var input = document.querySelector("li[data-sku='".concat(s, "'] .card__qty-input"));
    input.value = cartCache[s];
  });
}; // очистить поля ввода
// используется после заказа


var clearInputs = function clearInputs() {
  document.querySelectorAll("li.card .card__qty-input").forEach(function (i) {
    return i.value = "";
  });
}; // закрытие модала


var closeCheckoutModal = function closeCheckoutModal(event) {
  var closeModal = event.target;
  if (!closeModal.classList.contains("checkout-modal__close")) return;
  var checkoutModal = document.querySelector(".checkout-modal");
  checkoutModal.classList.add("checkout-modal_hidden");
}; // открытие модала


var showCheckoutModal = function showCheckoutModal(event) {
  var showCheckoutButton = event.target;
  if (!showCheckoutButton.classList.contains("button-checkout")) return;
  var checkoutModalHidden = document.querySelector(".checkout-modal_hidden");
  checkoutModalHidden.classList.remove("checkout-modal_hidden");
}; // обновить таблицу с заказом в модале


var updateCheckoutTable = function updateCheckoutTable() {
  var checkoutTable = document.querySelector(".checkout-modal__table__body");
  var cartIsNotEmpty = cartCache ? Object.keys(cartCache).length > 0 : false; // если корзина пустая - не обновляем

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
}; // сохранить данные json в переменную


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
}; // оформление заказа
// валидация, отправка серверу данных о заказе
// сообщение о заказе
// очистить переменные и cookies если заказ отправлен
// спрятать кнопки для корзины


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
  showToastMessage("Спасибо за заказ");
  sessionStorage.clear();
  updateCartCache();
  clearInputs();
  document.querySelector(".checkout-modal").classList.add("checkout-modal_hidden");
  document.querySelector(".button-checkout").classList.add("button-checkout_hidden");
  ym(33645739, 'reachGoal', 'order');
  return true;
}; // валидация имени
// только буквы и пробелы


var validateName = function validateName(name) {
  var regName = /[A-Za-zА-Яа-я ]{2,}/;
  var test = regName.test(name) && name.length > 0;
  if (!test) showToastMessage("Неверный формат имени");
  return test;
}; // валидация телефона
// только цифры, пробелы, чёрточки
// всего должно быть 11 цифр


var validatePhone = function validatePhone(phone) {
  var regPhoneNoWords = /[+\d\-\s]/g;
  phone.replace(regPhoneNoWords, "");
  var regOnlyNumbers = /[^\d]+/g;
  phone = phone.replace(regOnlyNumbers, "");
  var test = phone.length == 11;
  if (!test) showToastMessage("Неверный формат телефона");
  return test;
}; // показать уведомление


var showToastMessage = function showToastMessage(message) {
  var toastMessage = document.querySelector(".toast-message");
  toastMessage.textContent = message;
  toastMessage.classList.remove("hidden"); // через 10 сек опять скрыть

  timeout = window.setTimeout(function () {
    toastMessage.classList.add("hidden");
    window.clearTimeout(timeout);
  }, 10000);
}; // очистить и скрыть уведомление


var hideToastMessage = function hideToastMessage() {
  var toastMessage = document.querySelector(".toast-message");
  toastMessage.textContent = "";
  toastMessage.classList.add("hidden");
}; // отрпавить серверу информацию о заказе
// имя, телефон, заказ


var sendOrder = function sendOrder(orderJSON) {
  var orderString = JSON.stringify(orderJSON);
  var order = new FormData();
  order.append("order", orderString);
  var XHR = new XMLHttpRequest();
  XHR.open("POST", "/script.php", true);
  XHR.send(order);
};