// element vars
let wrapperEl = document.querySelector(".wrapper")
let productListWrapperEl = document.querySelector(".product-list")
let cartHeaderEl = document.querySelector(".cart .headline")
let cartListWrapperEl = document.querySelector(".cart-items")
let cartWrapperEl = document.querySelector(".cart")
let modalListEl = document.querySelector(".modal .order-items")
let startNewOrderBtnEl = document.querySelector(".start-new-order")
let modalWrapperEl = document.querySelector('.modal-wrapper')
let totalOderPriceCartEl = document.querySelector('.cart .order-total .price')
let totalOderPriceModalEl = document.querySelector('.modal .order-total .price')
let viewCart = document.querySelector('.view-cart .quantity')

// fetch data from from local data.json file
let productList = async () => {
  let res = await fetch("./data.json")
  let json = await res.json()
  return json
}

// get item from local storage, render local storage item only if available 
let localItem = JSON.parse(localStorage.getItem('cartItems'))
let cartItems = localItem !== null ? localItem : [];


// some useful vars
let data = []
let totalOderPrice = 0;
let totalOrderQuantity = 0

// format currency
function formatCurrency(price) {
  return new Intl.NumberFormat("en-Us", { style: "currency", currency: "USD" }).format(
    price,
  )
}


// render product list
async function renderProductList() {
  data = await productList()
  productListWrapperEl.innerHTML = ""
  data.map((item, index) => {
    let html = `
      <li class="list" id='list'>
        <!-- top/image -->
        <div class="top">
          <div class="image">
            <img class="desktop" src=${item.image.desktop} alt="image of ${item.name}">
            <img class="tablet" src=${item.image.tablet} alt="image of ${item.name}">
            <img class="mobile" src=${item.image.mobile} alt="image of ${item.name}">
          </div>
            
          <!-- buttons -->
          <div class="action">
            <!-- add item -->
            <button class="add-to-cart">
              <img src="assets/images/icon-add-to-cart.svg" alt="">
              Add to Cart
            </button>
            <!-- decrease/increase quantity -->
            <div class="increase-decrease-quantity">
              <!-- decrease -->
              <div role="button" class="decrease minus" onclick="handleQuantityChange(${index}, this)">
                <img src="assets/images/icon-decrement-quantity.svg" alt="">
              </div>
              <span>1</span>
              <!-- increase -->
              <div role="button" class="increase plus" onclick="handleQuantityChange(${index}, this)">
                <img src="assets/images/icon-increment-quantity.svg" alt="">
              </div>
            </div>
          </div>
        </div>
        <!-- bottom/text -->
        <div class="bottom">
          <h3 class="product-name">
            ${item.category}
          </h3>
          <p class="product-desc">${item.name}</p>
          <span class="product-price">${formatCurrency(item.price)}</span>
        </div>
      </li>
      `
    productListWrapperEl.innerHTML += html
  })

  // these elements can only be asign to var here since elements (product list) on top will wait for json file to be loaded before rendered
  let listEl = productListWrapperEl.querySelectorAll('.list')
  let addToCartBtn = productListWrapperEl.querySelectorAll('.add-to-cart')
  let confirmOrderBtn = document.querySelector(".confirm-order-btn")
  
  let listNameEl = null
  let actionEl = null
  let quantityEl = null
  
  // loop through product list element, hide there 'add-to-cart' button, then show 'increase-or-decrease' button only if the item is already added to cart

  Object.values(listEl).map(element => {
    listNameEl = element.querySelector('.product-desc')//name of each product list element
    actionEl = element.querySelector('.action')//contains both add-to-cart button and increase-or-decrease' button
    quantityEl = actionEl.querySelector('.increase-decrease-quantity span')//element representing product quantity
    if([...cartItems].map(cart => cart.name).includes(listNameEl.textContent)) {
      // show increase-or-decrease' button and hide add-to-cart button using active class defined in css only if product is found or included in cartItems 
      actionEl.classList.add('active')

      // assign quantity of item in cartItems to the corresponding quantity inside 'increase-or-decrease' button element
      let txt = cartItems.filter(item => {
        return item.name === listNameEl.textContent  
      })
      quantityEl.innerHTML = txt[0].quantity
    }
  })

  // add onclick event to addToCartBtn btn to invoke addToCart() func 
  addToCartBtn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      addToCart([...data][index])
    })
  })

  // add onclick event to confirmOrderBtn btn to invoke showModal() func 
  confirmOrderBtn.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    showModal()
  })

}

// render cart func 
function renderCart() {
  // hide cart if no item in cartItems
  if (!cartItems.length) {
    cartWrapperEl.classList.remove('active')
  }
  else {
  // show cart if item in cartItems
  cartWrapperEl.classList.add('active')
  }

  cartListWrapperEl.innerHTML = ''
  cartItems.forEach(item => {
    cartListWrapperEl.innerHTML += `
      <li class="item">
        <!-- item left -->
        <div class="left">
          <!-- name -->
          <h3 class="item-name">${item.name}</h3>
          <div class="item-details">
            <span class="quantity">${item.quantity}x</span>
            <p aria-label="price per quantity" class="quantity-price">
              <span>@</span>${formatCurrency(item.price)}
            </p>
            <p
              aria-label="total price of quantities"
              class="total-quantity-price"
            >
              ${formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        </div>
        <!-- item right -->
        <div aria-label="remove item" class="remove-item">
          <img src="assets/images/icon-remove-item.svg" alt="" />
        </div>
      </li>
    `
  })

  // remove item from cart 
  let removeItemBtns = document.querySelectorAll('.remove-item')
  for (let i = 0; i < removeItemBtns.length; i++) {
    const btn = removeItemBtns[i];
    let itemToRemove = cartItems[i]
    btn.addEventListener('click', () => removeFromCart(itemToRemove))
  }
 
  totalOderPrice = cartItems.length ? cartItems.map(list => list.price * list.quantity).reduce((total, num) => total + num) : 0;

  totalOrderQuantity = cartItems.length ? `${cartItems.map(list => list.quantity).reduce((total, num) => total + num)}` : `${0}`

  cartHeaderEl.innerHTML = `Your Cart (${totalOrderQuantity})`
  
  totalOderPriceCartEl.textContent = formatCurrency(totalOderPrice)  
}

// render cart quantity on top of page
function renderViewCart() {
  viewCart.innerHTML = totalOrderQuantity
}

// render interface 
function renderUi() {
  renderProductList()
  renderCart()
  renderViewCart()
}
renderUi()

// add to cart func 
function addToCart(item) {
  let quantity = 1;
  if(cartItems.some(list => list.name === item.name)) return
  cartItems.unshift({
    ...item,
    quantity
  })
  saveItems()
  renderUi()  
}

// save to local storage
function saveItems() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems))
}

// remove item from cart 
function removeItems() {
  localStorage.clear('cartItems')
}

// increase or decrease quantity of item 
function handleQuantityChange(index, el) {
  let product = data[index]
  let quantityToChange = cartItems.filter((item) => item.name == product.name) 
    if (el.classList.contains('minus')) {
      quantityToChange[0].quantity--
      // remove from cart if item less than 1
      if(quantityToChange[0].quantity < 1) {
        removeFromCart(quantityToChange[0])        
      }
    }
    else if (el.classList.contains('plus')) {
      quantityToChange[0].quantity++
    }
    renderUi()
}

// remove item from cart func 
function removeFromCart(itemToRemove) {  
  cartItems = cartItems.filter(item => {    
    return item != itemToRemove
  })
  saveItems()
  renderUi() 
}

// show modal func 
function showModal() {
  renderModal()
  wrapperEl.classList.add("has-modal")
}

// hide modal func 
function hideModal() {
  wrapperEl.classList.remove("has-modal")
}

// render modal elements 
function renderModal() {
  modalListEl.innerHTML = ''
  cartItems.map((item) => {
    modalListEl.innerHTML += `
      <li class="item">
            <!-- item left -->
            <div class="left">
              <img src=${item.image.thumbnail} alt=${item.name}>

              <div class="item-details">
                <h3 class="item-name">
                  ${item.name}
                </h3>
                <div class="quantity-and-price">
                  <span class="quantity">${item.quantity}</span>
                  <p aria-label="price per quantity" class="quantity-price"><span>@</span>${
                    formatCurrency(item.price)
                  }</p>
                </div>
              </div> 
            </div>
            <!-- item right -->
            <p aria-label="total price of quantities" class="total-quantity-price">${formatCurrency(item.price * item.quantity)
            }</p>
          </li>
    `
  })
  totalOderPriceModalEl.textContent = formatCurrency(totalOderPrice)

  // add loading state for 2 secs
  modalWrapperEl.querySelector('.loading').classList.add('loading-state')
  modalWrapperEl.querySelector('.modal').style.display = 'none'

  // remove loading ans display modal after 2 secs
  setTimeout(() => {
      modalWrapperEl.querySelector('.modal').style.display = 'initial'
      modalWrapperEl.querySelector('.loading').classList.remove('loading-state')
  }, 2000);
}

// start new order func 
startNewOrderBtnEl.addEventListener("click", () => {
  // clear cart items and re-render UI
  cartItems = []
  removeItems()
  renderUi()

  // add loading and hide modal
  modalWrapperEl.querySelector('.loading').classList.add('loading-state')
  modalWrapperEl.querySelector('.modal').style.display = 'none'
  
  // remove loading with modal wrapper and reload page after 2 secs 
  setTimeout(() => {
      hideModal()
      modalWrapperEl.querySelector('.loading').classList.remove('loading-state')
      location.reload()
  }, 2000);
})

