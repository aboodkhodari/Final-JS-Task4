const API_BASE = "https://pennypath-server.vercel.app/api/v1/expenses";

// --------------------
// STATE
// --------------------
let expenses = [];
let editId = null;
let searchValue = "";
let currentPage = 1;
let limit = 5;

// --------------------
// ELEMENTS
// --------------------
const form = document.getElementById("expense-form");
const nameInput = document.getElementById("expense-name");
const dateInput = document.getElementById("expense-date");
const amountInput = document.getElementById("expense-amount");
const descInput = document.getElementById("expense-description");

const list = document.getElementById("expenses-list");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const title = document.getElementById("form-title");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const themeBtn = document.getElementById("theme-toggle");

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageNumbersBox = document.getElementById("page-numbers");
const totalBox = document.getElementById("total-expenses");

// --------------------
// INIT
// --------------------
loadExpenses();
bindEvents();

// --------------------
// API
// --------------------
async function loadExpenses() {
  try {
    const url = `${API_BASE}?page=${currentPage}&limit=${limit}&search=${searchValue}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed to load expenses");

    const result = await res.json();

    expenses = Array.isArray(result.data)
      ? result.data
      : result.data.expenses || [];

    renderExpenses();
    renderTotal();
    updatePaginationButtons();
  } catch (err) {
    alert(err.message);
  }
}

async function createExpense(data) {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to add expense");

    currentPage = 1;
    await loadExpenses();
  } catch (err) {
    alert(err.message);
  }
}

async function updateExpense(id, data) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update expense");

    await loadExpenses();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteExpense(id) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });

    if (!res.ok) throw new Error("Failed to delete expense");

    await loadExpenses();
  } catch (err) {
    alert(err.message);
  }
}

// --------------------
// RENDER
// --------------------
function renderExpenses() {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    list.innerHTML = `<div class="empty-state">No expenses found.</div>`;
    return;
  }

  list.innerHTML = expenses
    .map(
      (e) => `
      <div class="expense-item">
        <div>
          <div class="expense-name">${e.name}</div>
          <div class="expense-date">${e.date}</div>
          <div class="expense-description">${e.description || "-"}</div>
        </div>

        <div class="expense-actions">
          <div class="expense-amount">$${e.amount}</div>
          <button class="btn btn-edit" onclick="startEdit('${
            e.id
          }')">Edit</button>
          <button class="btn btn-danger" onclick="handleDelete('${
            e.id
          }')">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
}
function renderPageNumbers() {
  pageNumbersBox.innerHTML = "";
  const totalPages = expenses.length < limit ? currentPage : currentPage + 1;

  for (let i = 1; i <= totalPages; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    span.className = "page-number";

    if (i === currentPage) {
      span.classList.add("active");
    }

    span.addEventListener("click", () => {
      if (i === currentPage) return;
      currentPage = i;
      loadExpenses();
    });

    pageNumbersBox.appendChild(span);
  }
}

// --------------------
// TOTAL
// --------------------
function renderTotal() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalBox.innerHTML = `💰 Total: <strong>$${total.toFixed(2)}</strong>`;
}

// --------------------
// PAGINATION
// --------------------
function updatePaginationButtons() {
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = expenses.length < limit;

  renderPageNumbers();
}

function goPrev() {
  if (currentPage === 1) return;
  currentPage--;
  loadExpenses();
}

function goNext() {
  if (expenses.length < limit) return;
  currentPage++;
  loadExpenses();
}

// --------------------
// FORM
// --------------------
function handleSubmit(e) {
  e.preventDefault();

  const data = {
    name: nameInput.value.trim(),
    date: dateInput.value,
    amount: Number(amountInput.value),
    description: descInput.value.trim(),
  };

  if (!data.name || !data.date || !data.amount) {
    alert("Please fill all required fields");
    return;
  }

  editId ? updateExpense(editId, data) : createExpense(data);
  resetForm();
}

function startEdit(id) {
  const e = expenses.find((x) => x.id === id);
  if (!e) return;

  nameInput.value = e.name;
  dateInput.value = e.date;
  amountInput.value = e.amount;
  descInput.value = e.description;

  editId = id;
  submitBtn.textContent = "Update Expense";
  title.textContent = "Edit Expense";
  cancelBtn.style.display = "inline-block";
}

function handleDelete(id) {
  if (confirm("Delete this expense?")) {
    deleteExpense(id);
  }
}

function resetForm() {
  form.reset();
  editId = null;
  submitBtn.textContent = "Add Expense";
  title.textContent = "Add New Expense";
  cancelBtn.style.display = "none";
}

// --------------------
// SEARCH
// --------------------
function handleSearch() {
  searchValue = searchInput.value;
  currentPage = 1;
  loadExpenses();
}

// --------------------
// EVENTS
// --------------------
function bindEvents() {
  form.addEventListener("submit", handleSubmit);
  cancelBtn.addEventListener("click", resetForm);
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("input", handleSearch);
  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
}

// --------------------
// THEME
// --------------------
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark")
    ? "🌞 Light Mode"
    : "🌙 Dark Mode";
});
