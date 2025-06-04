const accounts = JSON.parse(localStorage.getItem('accounts')) || {
  "Cash": 0,
  "Bank": 0,
  "Groceries": 0,
  "Rent": 0,
  "Utilities": 0,
  "Entertainment": 0,
  "Credit Card": 0,
  "Income": 0
};

const accountTypes = JSON.parse(localStorage.getItem('accountTypes')) || {
  "Cash": "asset",
  "Bank": "asset",
  "Groceries": "expense",
  "Rent": "expense",
  "Utilities": "expense",
  "Entertainment": "expense",
  "Credit Card": "liability",
  "Income": "income"
};

let pieChart;

function updateBalance(account, amount, isDebit) {
  const type = accountTypes[account] || "asset";
  if (!accounts[account]) accounts[account] = 0;

  const increase =
    (type === "asset" && isDebit) ||
    (type === "expense" && isDebit) ||
    (type === "liability" && !isDebit) ||
    (type === "income" && !isDebit);

  accounts[account] += increase ? amount : -amount;
  saveToLocalStorage();
}

function renderAccountBalances() {
  const balanceList = document.getElementById("balanceList");
  if (balanceList) {
    balanceList.innerHTML = '';
    for (const [account, balance] of Object.entries(accounts)) {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between';
      li.textContent = `${account}: $${balance.toFixed(2)}`;
      balanceList.appendChild(li);
    }
  }
  updateTotalBalance();
  renderPieChart();
}

function renderPieChart() {
  const ctx = document.getElementById('accountPieChart');
  if (!ctx) return;

  const labels = [];
  const data = [];

  for (const [account, balance] of Object.entries(accounts)) {
    if (balance !== 0) {
      labels.push(account);
      data.push(balance);
    }
  }

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Account Balances',
        data: data,
        backgroundColor: [
          '#4b0082', '#1e90ff', '#ff8c00', '#32cd32', '#ff69b4', '#00ced1', '#ffd700', '#dc143c'
        ],
        borderColor: '#fff',
        borderWidth: 1
      }]
    },
   options: {
  responsive: false,  // disable responsiveness
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#fff'
      }
    }
  }
}

  });
}

function saveToLocalStorage() {
  localStorage.setItem('accounts', JSON.stringify(accounts));
  localStorage.setItem('accountTypes', JSON.stringify(accountTypes));
  localStorage.setItem('entries', document.getElementById('entryList').innerHTML);
}

function loadFromLocalStorage() {
  const entries = localStorage.getItem('entries');
  if (entries) {
    document.getElementById('entryList').innerHTML = entries;
  }
}

const debitSelect = document.getElementById('debitAccount');
const creditSelect = document.getElementById('creditAccount');

if (debitSelect && creditSelect) {
  debitSelect.addEventListener('change', () => {
    const selected = debitSelect.value;
    Array.from(creditSelect.options).forEach(opt => {
      opt.disabled = opt.value === selected;
    });
  });

  creditSelect.addEventListener('change', () => {
    const selected = creditSelect.value;
    Array.from(debitSelect.options).forEach(opt => {
      opt.disabled = opt.value === selected;
    });
  });
}

const addAccountForm = document.getElementById('addAccountForm');
const newAccountName = document.getElementById('newAccountName');
const newAccountType = document.getElementById('newAccountType');

if (addAccountForm) {
  addAccountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = newAccountName.value.trim();
    const type = newAccountType.value;

    if (!name || !type) return;

    if (accounts[name]) {
      alert("Account already exists.");
      return;
    }

    accounts[name] = 0;
    accountTypes[name] = type;

    const debitOpt = new Option(name, name);
    const creditOpt = new Option(name, name);
    debitSelect.appendChild(debitOpt);
    creditSelect.appendChild(creditOpt);

    renderAccountBalances();
    saveToLocalStorage();
    addAccountForm.reset();
  });
}

function updateTotalBalance() {
  let total = 0;
  for (const [account, balance] of Object.entries(accounts)) {
    const type = accountTypes[account];
    if (type === 'asset' || type === 'income') {
      total += balance;
    } else if (type === 'liability' || type === 'expense') {
      total -= balance;
    }
  }
  const totalBalanceEl = document.getElementById('totalBalance');
  if (totalBalanceEl) {
    totalBalanceEl.textContent = `$${total.toFixed(2)}`;
  }
}

const entryForm = document.getElementById('entryForm');
if (entryForm) {
  entryForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const date = document.getElementById('entryDate').value;
    const debitAccount = document.getElementById('debitAccount').value;
    const creditAccount = document.getElementById('creditAccount').value;
    const amount = parseFloat(document.getElementById('entryAmount').value);
    const note = document.getElementById('entryNote').value;

    if (
      debitAccount === "Debit Account" ||
      creditAccount === "Credit Account" ||
      debitAccount === creditAccount
    ) {
      alert("Please select valid, different accounts.");
      return;
    }

    updateBalance(debitAccount, amount, true);
    updateBalance(creditAccount, amount, false);

    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${date} | Debit: ${debitAccount} | Credit: ${creditAccount} | Amount: $${amount} | ${note}`;
    document.getElementById('entryList').appendChild(li);

    this.reset();
    renderAccountBalances();
    saveToLocalStorage();
    Array.from(debitSelect.options).forEach(opt => opt.disabled = false);
    Array.from(creditSelect.options).forEach(opt => opt.disabled = false);
  });
}

const resetBtn = document.getElementById('resetAllBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all data?')) {
      localStorage.clear();
      window.location.reload();
    }
  });
}

window.addEventListener('load', () => {
  renderAccountBalances();
  loadFromLocalStorage();
});