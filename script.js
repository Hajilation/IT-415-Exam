// =====================================================
// CampusCafeteriaPOS - script.js
// =====================================================

// ---------- 1. Data ----------
// Hard-coded menu list (matches the menu in index.html)
const products = [
  { id: 1, name: "Rice (Plain)",        price: 15, category: "Rice"   },
  { id: 2, name: "Fried Chicken (1 pc)", price: 65, category: "Viands" },
  { id: 3, name: "Pork Adobo",          price: 60, category: "Viands" },
  { id: 4, name: "Vegetable Side Dish", price: 35, category: "Viands" },
  { id: 5, name: "Iced Tea (cup)",      price: 20, category: "Drinks" },
  { id: 6, name: "Bottled Water",       price: 20, category: "Drinks" }
];

// The current order starts empty.
// Each order item looks like: { id, name, price, quantity }
let cart = [];

// Tracks whether the current order has already been paid and receipted.
// false = order is still open, true = already paid (start a new transaction)
let isPaymentCompleted = false;

// ---------- 2. Find the parts of the page we need ----------
const productGrid     = document.getElementById("product-grid");
const cartBody        = document.getElementById("cart-body");
const summaryItems    = document.getElementById("summary-items");
const summarySubtotal = document.getElementById("summary-subtotal");
const summaryTotal    = document.getElementById("summary-total");
const summaryChange   = document.getElementById("summary-change");

const studentNameInput   = document.getElementById("student-name");
const studentIdInput     = document.getElementById("student-id");
const orderTypeSelect    = document.getElementById("order-type");
const paymentMethodSelect = document.getElementById("payment-method");
const amountPaidField    = document.getElementById("amount-paid");

// ---------- 3. Helper function ----------
// Turns 15 into "₱15.00"
function formatPrice(amount) {
  return "₱" + amount.toFixed(2);
}

// ---------- 4. Show the menu ----------
// Items are shown under their category heading (Rice, Viands, Drinks)
function displayProducts() {
  productGrid.innerHTML = "";

  let currentCategory = "";

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Print a new heading whenever the category changes
    if (product.category !== currentCategory) {
      currentCategory = product.category;
      productGrid.innerHTML += `
        <h3 class="category-title">${currentCategory}</h3>
      `;
    }

    productGrid.innerHTML += `
      <div class="product">
        <h4>${product.name}</h4>
        <p class="price">${formatPrice(product.price)}</p>
        <button data-id="${product.id}">Add to order</button>
      </div>
    `;
  }
}

// ---------- 5. Order actions ----------

// Add a menu item to the order
function addToCart(productId) {
  // Is this item already in the order?
  const existingItem = cart.find(function (item) {
    return item.id === productId;
  });

  if (existingItem) {
    // Yes: just increase its quantity
    existingItem.quantity += 1;
  } else {
    // No: find the product and add it with quantity 1
    const product = products.find(function (p) {
      return p.id === productId;
    });

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  displayCart();
}

// Make the quantity go up by 1
function increaseQuantity(productId) {
  const item = cart.find(function (item) {
    return item.id === productId;
  });

  item.quantity += 1;
  displayCart();
}

// Make the quantity go down by 1, but never below 1
function decreaseQuantity(productId) {
  const item = cart.find(function (item) {
    return item.id === productId;
  });

  if (item.quantity > 1) {
    item.quantity -= 1;
  }

  displayCart();
}

// Remove an item from the order completely
function removeItem(productId) {
  // Keep every item EXCEPT the one being removed
  cart = cart.filter(function (item) {
    return item.id !== productId;
  });

  displayCart();
}

// ---------- 6. Calculations ----------

// Total Amount = sum of all subtotals
// Subtotal = Unit Price x Quantity
function calculateTotal() {
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    const subtotal = cart[i].price * cart[i].quantity;
    total += subtotal;
  }

  return total;
}

// Count all pieces in the order (2 rice + 3 iced teas = 5)
function countItems() {
  let count = 0;

  for (let i = 0; i < cart.length; i++) {
    count += cart[i].quantity;
  }

  return count;
}

// Show the live change under "Amount paid"
function updateChange() {
  if (!summaryChange) {
    return;
  }

  const amountPaid = Number(amountPaidField.value);
  const change = amountPaid - calculateTotal();

  // Only show change when the payment covers the total
  if (amountPaidField.value !== "" && change >= 0) {
    summaryChange.textContent = formatPrice(change);
  } else {
    summaryChange.textContent = formatPrice(0);
  }
}

// ---------- 7. Show the order ----------
function displayCart() {
  cartBody.innerHTML = "";

  if (cart.length === 0) {
    // Empty order message
    cartBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-cart">
          No items yet. Choose an item from the menu above.
        </td>
      </tr>
    `;
  } else {
    // One table row for each item in the order
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const subtotal = item.price * item.quantity;

      // The minus button is disabled when quantity is 1
      const disableMinus = item.quantity <= 1 ? "disabled" : "";

      cartBody.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${formatPrice(item.price)}</td>
          <td>
            <div class="qty-controls">
              <button class="qty-btn" data-action="decrease" data-id="${item.id}"
                      aria-label="Decrease quantity of ${item.name}" ${disableMinus}>-</button>
              <span class="qty-number">${item.quantity}</span>
              <button class="qty-btn" data-action="increase" data-id="${item.id}"
                      aria-label="Increase quantity of ${item.name}">+</button>
            </div>
          </td>
          <td>${formatPrice(subtotal)}</td>
          <td>
            <button class="remove-btn" data-action="remove" data-id="${item.id}"
                    aria-label="Remove ${item.name} from order">Remove</button>
          </td>
        </tr>
      `;
    }
  }

  // Update the order summary
  const total = calculateTotal();

  if (summaryItems) {
    summaryItems.textContent = countItems();
  }

  if (summarySubtotal) {
    summarySubtotal.textContent = formatPrice(total);
  }

  if (summaryTotal) {
    summaryTotal.textContent = formatPrice(total);
  }

  updateChange();
}

// ---------- 8. Listen for button clicks ----------

// Clicks on "Add to order" buttons in the menu
productGrid.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (button) {
    // data-id is text, so Number() turns "3" into 3
    addToCart(Number(button.dataset.id));
  }
});

// Clicks on the +, -, and Remove buttons in the order table
cartBody.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const productId = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") {
    increaseQuantity(productId);
  } else if (action === "decrease") {
    decreaseQuantity(productId);
  } else if (action === "remove") {
    removeItem(productId);
  }
});

// Update the change while the cashier types the amount paid
amountPaidField.addEventListener("input", updateChange);

// ---------- 9. Start the page ----------
displayProducts();
displayCart();

// =====================================================
// 10. PAYMENT AND RECEIPT SYSTEM
// =====================================================

const placeOrderButton = document.getElementById("place-order");
const receiptContent   = document.getElementById("receipt-content");

// Generate random transaction number
function generateTransactionNumber() {
  return "TRX-" + Math.floor(Math.random() * 100000);
}

// Nice label for the payment method shown on the receipt
function paymentMethodLabel(value) {
  if (value === "cash") {
    return "Cash";
  }
  return value;
}

// Process payment
function processPayment() {

  // Stop duplicate payments and receipts for the same order
  if (isPaymentCompleted) {
    alert("This order has already been paid. Please start a new transaction.");
    return;
  }

  const amountPaidInput = amountPaidField.value.trim();
  const amountPaid = Number(amountPaidInput);
  const total = calculateTotal();

  // Validation 1: Order must not be empty
  if (cart.length === 0) {
    alert("The order is empty. Please add at least one item.");
    return;
  }

  // Validation 2: Customer details
  if (studentNameInput.value.trim() === "") {
    alert("Please enter the customer name.");
    return;
  }

  if (studentIdInput.value.trim() === "") {
    alert("Please enter the student ID.");
    return;
  }

  // Validation 3: Payment method
  if (paymentMethodSelect.value === "") {
    alert("Please choose a payment method.");
    return;
  }

  // Validation 4: Payment must be a valid, non-negative number.
  // Blank, spaces only, non-numeric, and negative amounts all fail here.
  if (amountPaidInput === "" || !isFinite(amountPaid) || amountPaid < 0) {
    alert("Please enter a valid payment amount.");
    return;
  }

  // Validation 5: Payment must cover the order total.
  // Exact payments and overpayments pass this check.
  if (amountPaid < total) {
    alert("Insufficient payment. Please enter at least " + formatPrice(total) + ".");
    return;
  }

  const change = amountPaid - total;

  generateReceipt(amountPaid, change);

  // Reached only if every validation passed and the receipt was created
  isPaymentCompleted = true;
}

// Create receipt
function generateReceipt(amountPaid, change) {

  let receiptHTML = `
    <h3>Campus Cafeteria</h3>

    <p>Transaction No: ${generateTransactionNumber()}</p>
    <p>Date: ${new Date().toLocaleString()}</p>
    <p>Customer: ${studentNameInput.value.trim()}</p>
    <p>Student ID: ${studentIdInput.value.trim()}</p>
    <p>Order type: ${orderTypeSelect.value === "take-out" ? "Take-out" : "Dine-in"}</p>

    <hr>
  `;

  // Add ordered items
  for (let i = 0; i < cart.length; i++) {
    const item = cart[i];
    const subtotal = item.price * item.quantity;

    receiptHTML += `
      <div class="summary-line">
        <span>${item.name} x ${item.quantity}</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
    `;
  }

  receiptHTML += `
    <hr>

    <div class="summary-line summary-total">
      <span>Total</span>
      <span>${formatPrice(calculateTotal())}</span>
    </div>

    <p>Payment method: ${paymentMethodLabel(paymentMethodSelect.value)}</p>
    <p>Amount Paid: ${formatPrice(amountPaid)}</p>
    <p>Change: ${formatPrice(change)}</p>

    <p>Payment successful!</p>

    <button onclick="newTransaction()">New Transaction</button>
  `;

  receiptContent.innerHTML = receiptHTML;
}

// Reset everything for the next customer
function newTransaction() {

  cart = [];
  isPaymentCompleted = false;

  studentNameInput.value = "";
  studentIdInput.value = "";
  orderTypeSelect.value = "dine-in";
  paymentMethodSelect.value = "";
  amountPaidField.value = "";

  displayCart();

  receiptContent.innerHTML = `
    <h3>Campus Cafeteria</h3>
    <p>No transaction yet.</p>
  `;
}

// Button click
placeOrderButton.addEventListener("click", processPayment);