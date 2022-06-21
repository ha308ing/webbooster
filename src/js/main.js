/* eslint-env browser */
document.addEventListener( "DOMContentLoaded", () => {
  document.addEventListener( "click", clickHandler )
  document.addEventListener( "scroll", scrollHandler )

  // взять данные из cookies, если есть
  updateCartCache()
  updateDataCache().then( r => {
    dataCache = r
    // обновить таблицу с заказом
    updateCheckoutTable()
  } )
  // если корзина не пустая, показать кнопку
  showCartControls( checkCartCache() )
  // заполнить элементы управления сохранёнными данными
  fillInputs()
} )

// для скрытия уведомлений,
// чтобы кнопки могли прерывать текущее и выводить свои уведомления
let timeout
// использовать кэши для корзины и для внешних данных (сократить сетевые запросы)
let cartCache = {}
let dataCache = {}

// обработка кликов
const clickHandler = event => {
  // скрыть уведомление, если пользователь продолжает действия
  hideToastMessage()

  // добавление в корзину для кнопок на карточках
  addToCart( event )

  // для кнопки показа модала
  showCheckoutModal( event )

  // закрыть модал
  closeCheckoutModal( event )

  // кнопка для отправки заказа
  makeOrder( event )
}

// обработка скролла
const scrollHandler = () => {
  // блюр заголовка
  blurHeader()
}

const blurHeader = () => {
  // блюрим заголовок на фоне, для фокуса на карточках
  const header = document.querySelector( ".main-header" )
  const blurClass = "main-header_blur"
  const isBlurred = header.classList.contains( blurClass )
  if ( !isBlurred && window.scrollY > window.innerHeight / 4 )
    header.classList.add( blurClass )
  if ( isBlurred && window.scrollY < window.innerHeight / 4 ) {
    header.classList.remove( blurClass )
  }
}

const addToCart = event => {
  // нужна кнока добавления в корзину
  const button = event.target
  if ( !button.classList.contains( "card__button-to-cart" ) )
    return

  // родительская карточка
  const card = button.closest( "li.card" )

  // сколько добавить в корзину
  const qty = card.querySelector( ".card__qty-input" ).value

  // артикул для упрощения сохранения и последующего обращения
  const sku = card.dataset[ "sku" ]

  // если есть что добавить - добавляем, если нет - удалить из корзины
  if ( qty > 0 ) {
    // корзину в cookies
    sessionStorage.setItem( "cart", JSON.stringify( { ...cartCache, [ sku ]: qty } ) )

    // обновим кэш корзины
    cartCache = { ...cartCache, [ sku ]: qty }

    // сообщение об добавлении
    showToastMessage( `${ dataCache[ sku ].title } добавлен в корзину ` )
  } else {
    /* eslint-disable-next-line no-unused-vars */
    let { [ sku ]: remove, ...remaining } = cartCache
    sessionStorage.setItem( "cart", JSON.stringify( remaining ) )
    showToastMessage( `${ dataCache[ sku ].title } удалён из корзины ` )
    cartCache = remaining
  }

  // проверка надо ли показывать кнопку просмотра корзины
  showCartControls( Object.keys( cartCache ).length > 0 )

  // обновление таблицы с заказом в модале
  updateCheckoutTable()
}

// проверка пустой ли кэш
// ( используется только при первом запуске, нужно убрать )
const checkCartCache = () => {
  return cartCache ? Object.keys( cartCache ).length > 0 : false
}

// обновить кэш корзины, как в cookies
const updateCartCache = () => {
  const cart = sessionStorage.getItem( "cart" )
  cartCache = JSON.parse( cart )
}

// показывать или скрывать кнопку просмотра корзины
// или других элементов, которые не нужны, когда корзины пустая
const showCartControls = ( show = false ) => {
  const buttonCheckout = document.querySelector( ".button-checkout" )
  if ( show )
    buttonCheckout.classList.remove( "button-checkout_hidden" )
  else
    buttonCheckout.classList.add( "button-checkout_hidden" )
}

// заполнение элемнтов управления
const fillInputs = () => {
  // если корзина пустая не надо заполнять
  const cart = cartCache ? Object.keys( cartCache ) : []
  if ( !cart.length > 0 ) return

  // заполняем поля, использя навигацию по артикулу
  cart.map( s => {
    let input = document.querySelector( `li[data-sku='${ s }'] .card__qty-input` )
    input.value = cartCache[ s ]
  } )
}

// очистить поля ввода
// используется после заказа
const clearInputs = () => {
  document.querySelectorAll( "li.card .card__qty-input" ).forEach( i => i.value = "" )
}

// закрытие модала
const closeCheckoutModal = event => {
  const closeModal = event.target
  if ( !closeModal.classList.contains( "checkout-modal__close" ) )
    return
  const checkoutModal = document.querySelector( ".checkout-modal" )
  checkoutModal.classList.add( "checkout-modal_hidden" )
}

// открытие модала
const showCheckoutModal = event => {
  const showCheckoutButton = event.target
  if ( !showCheckoutButton.classList.contains( "button-checkout" ) )
    return
  const checkoutModalHidden = document.querySelector( ".checkout-modal_hidden" )
  checkoutModalHidden.classList.remove( "checkout-modal_hidden" )
}

// обновить таблицу с заказом в модале
const updateCheckoutTable = () => {
  const checkoutTable = document.querySelector( ".checkout-modal__table__body" )
  const cartIsNotEmpty = cartCache ? Object.keys( cartCache ).length > 0 : false
  // если корзина пустая - не обновляем
  if ( !cartIsNotEmpty ) return
  const cart = cartIsNotEmpty ? Object.keys( cartCache ) : []
  checkoutTable.innerHTML = ""
  cart.map( c => {
    const tr = document.createElement( "tr" )
    const tdTitle = document.createElement( "td" )
    tdTitle.textContent = dataCache[ c ].title
    const tdQty = document.createElement( "td" )
    tdQty.textContent = cartCache[ c ]
    const tdPrice = document.createElement( "td" )
    tdPrice.textContent = dataCache[ c ].price
    tr.append( tdTitle, tdPrice, tdQty )
    checkoutTable.append( tr )
  } )
}

// сохранить данные json в переменную
const updateDataCache = () => {
  return new Promise( res => {
    const XHR = new XMLHttpRequest()
    XHR.onload = function () {
      let response = JSON.parse( this.responseText )
      let cards = response.cards
      cards.map( c => {
        const sku = c.sku
        dataCache[ sku ] = c
      } )
      res( dataCache )
    }
    XHR.open( "GET", "data.json", true )
    XHR.send()
  } )
}

// оформление заказа
// валидация, отправка серверу данных о заказе
// сообщение о заказе
// очистить переменные и cookies если заказ отправлен
// спрятать кнопки для корзины
const makeOrder = event => {
  const orderButton = event.target
  if ( !orderButton.classList.contains( "checkout-modal__button" ) )
    return
  let validation = false
  const phone = document.querySelector( ".checkout-modal__form__phone" ).value
  const validationPhone = validation || validatePhone( phone )
  const name = document.querySelector( ".checkout-modal__form__name" ).value
  const validationName = validation || validateName( name )
  if ( !( validationName && validationPhone ) ) return
  sendOrder( { name, phone, cart: cartCache } )
  showToastMessage( "Спасибо за заказ" )
  sessionStorage.clear()
  updateCartCache()
  clearInputs()
  document.querySelector( ".checkout-modal" ).classList.add( "checkout-modal_hidden" )
  document.querySelector( ".button-checkout" ).classList.add( "button-checkout_hidden" )
  ym( 33645739, 'reachGoal', 'order' )
  return true
}

// валидация имени
// только буквы и пробелы
const validateName = ( name ) => {
  const regName = /[A-Za-zА-Яа-я ]{2,}/
  const test = regName.test( name ) && name.length > 0
  if ( !test ) showToastMessage( "Неверный формат имени" )
  return test
}

// валидация телефона
// только цифры, пробелы, чёрточки
// всего должно быть 11 цифр
const validatePhone = ( phone ) => {
  const regPhoneNoWords = /[+\d\-\s]/g
  phone.replace( regPhoneNoWords, "" )
  const regOnlyNumbers = /[^\d]+/g
  phone = phone.replace( regOnlyNumbers, "" )
  const test = ( phone.length == 11 )
  if ( !test ) showToastMessage( "Неверный формат телефона" )
  return test
}

// показать уведомление
const showToastMessage = ( message ) => {
  const toastMessage = document.querySelector( ".toast-message" )
  toastMessage.textContent = message
  toastMessage.classList.remove( "hidden" )

  // через 10 сек опять скрыть
  timeout = window.setTimeout( () => { toastMessage.classList.add( "hidden" ); window.clearTimeout( timeout ) }, 10000 )
}

// очистить и скрыть уведомление
const hideToastMessage = () => {
  const toastMessage = document.querySelector( ".toast-message" )
  toastMessage.textContent = ""
  toastMessage.classList.add( "hidden" )
}

// отрпавить серверу информацию о заказе
// имя, телефон, заказ
const sendOrder = ( orderJSON ) => {
  const orderString = JSON.stringify( orderJSON )
  const order = new FormData()
  order.append( "order", orderString )
  const XHR = new XMLHttpRequest()
  XHR.open( "POST", "/script.php", true )
  XHR.send( order )
}
