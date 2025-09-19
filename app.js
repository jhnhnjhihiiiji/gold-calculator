function addRow() {
  const table = document.getElementById("goldTable").getElementsByTagName('tbody')[0];
  const row = table.insertRow();

  const weightCell = row.insertCell(0);
  const percentCell = row.insertCell(1);
  const pureGoldCell = row.insertCell(2);
  const deleteCell = row.insertCell(3);

  weightCell.innerHTML = '<input type="number" class="weight" oninput="calculatePureGold()">';
  percentCell.innerHTML = '<input type="number" class="percentage" oninput="calculatePureGold()">';
  pureGoldCell.innerHTML = '<input type="text" class="pureGold" readonly>';
  deleteCell.innerHTML = '<button onclick="deleteRow(this)">❌</button>';
}

function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();
  calculatePureGold();
}

function calculatePureGold() {
  const weights = document.querySelectorAll(".weight");
  const percentages = document.querySelectorAll(".percentage");
  const pureGolds = document.querySelectorAll(".pureGold");
  let total = 0;

  for (let i = 0; i < weights.length; i++) {
    const weight = parseFloat(weights[i].value) || 0;
    const percent = parseFloat(percentages[i].value) || 0;
    const pure = ((weight * percent) / 100).toFixed(2);
    pureGolds[i].value = pure;
    total += parseFloat(pure);
  }

  document.getElementById("totalPureGold").value = total.toFixed(2);

  const issued = parseFloat(document.getElementById("goldIssued").value) || 0;
  const balance = total - issued;
  document.getElementById("balanceGold").value = balance.toFixed(2);

  calculateTotalValue();
}

function calculateTotalValue() {
  const balance = parseFloat(document.getElementById("balanceGold").value) || 0;
  const rate = parseFloat(document.getElementById("goldRate").value) || 0;
  const total = balance * rate;

  const currencySymbol = document.getElementById("currency").value;

  document.getElementById("totalValue").value = total.toFixed(2);
  document.getElementById("totalValue").previousElementSibling.innerText = `${currencySymbol} ${total.toLocaleString('en-IN')}`;

  updateFinalAmount();
}

function updateFinalAmount() {
  const totalValue = parseFloat(document.getElementById("totalValue").value) || 0;
  const givenGold = parseFloat(document.getElementById("goldGivenValue").value) || 0;
  const balance = totalValue - givenGold;

  document.getElementById("finalAmount").value = balance.toLocaleString('en-IN', {
    minimumFractionDigits: 2
  });
}

function formatCurrency(amount) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
}

function saveFinalHistory() {
  const total = parseFloat(document.getElementById("totalPureGold").value) || 0;
  const issued = parseFloat(document.getElementById("goldIssued").value) || 0;
  const balance = parseFloat(document.getElementById("balanceGold").value) || 0;

  if (total === 0) {
    alert("Please calculate and enter values before saving.");
    return;
  }

  const existing = JSON.parse(localStorage.getItem("goldHistory")) || [];
  const newRecord = {
    date: new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).replace(",", ""),
    totalPureGold: total.toFixed(2),
    goldIssued: issued.toFixed(2),
    balanceGold: balance.toFixed(2)
  };
  existing.push(newRecord);
  localStorage.setItem("goldHistory", JSON.stringify(existing));
  alert("✅ Entry saved successfully!");
}

function showHistory() {
  const modal = document.getElementById("historyModal");
  const content = document.getElementById("historyContent");
  content.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("goldHistory")) || [];
  if (history.length === 0) {
    content.innerHTML = "<p>No history available.</p>";
  } else {
    const table = document.createElement("table");
    table.border = "1";
    const header = table.insertRow();
    ["Date", "Total Gold", "Gold Issued", "Balance"].forEach(text => {
      const cell = header.insertCell();
      cell.textContent = text;
    });

    history.forEach(record => {
      const row = table.insertRow();
      row.insertCell().textContent = record.date;
      row.insertCell().textContent = record.totalPureGold;
      row.insertCell().textContent = record.goldIssued;
      row.insertCell().textContent = record.balanceGold;
    });

    content.appendChild(table);
  }

  modal.style.display = "block";
}

function closeHistory() {
  document.getElementById("historyModal").style.display = "none";
}

function exportToExcel() {
  const history = JSON.parse(localStorage.getItem("goldHistory")) || [];
  if (history.length === 0) {
    alert("No history to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Date,Total Pure Gold (g),Gold Issued (g),Balance Gold (g)\n";
  history.forEach(function (r) {
    csvContent += `"${r.date}",${r.totalPureGold},${r.goldIssued},${r.balanceGold}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "gold_history.csv");
  document.body.appendChild(link);
  link.click();
}

function beforePrint() {
  const now = new Date();

  // Set customer name
  document.getElementById("customerName").innerText = document.getElementById("customerNameInput").value || "-";

  // Auto-generate bill number, date, time, day
  document.getElementById("billNumber").innerText = now.getTime().toString().slice(-5);
  document.getElementById("currentDate").innerText = now.toLocaleDateString("en-IN");
  document.getElementById("currentTime").innerText = now.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
  document.getElementById("currentDay").innerText = now.toLocaleDateString("en-IN", { weekday: "short" });

  // Populate table rows
  const printTableBody = document.getElementById("printTableBody");
  printTableBody.innerHTML = "";
  const weights = document.querySelectorAll(".weight");
  const percentages = document.querySelectorAll(".percentage");
  const pureGolds = document.querySelectorAll(".pureGold");

  for (let i = 0; i < weights.length; i++) {
    const row = printTableBody.insertRow();
    row.insertCell(0).innerText = weights[i].value || "-";
    row.insertCell(1).innerText = percentages[i].value || "-";
    row.insertCell(2).innerText = pureGolds[i].value || "-";
  }

  // Set values
  document.getElementById("printTotalGold").innerText = document.getElementById("totalPureGold").value || "-";
  document.getElementById("printIssued").innerText = document.getElementById("goldIssued").value || "-";
  document.getElementById("printBalance").innerText = document.getElementById("balanceGold").value || "-";

  const rate = parseFloat(document.getElementById("goldRate").value) || 0;
  const total = parseFloat(document.getElementById("totalValue").value) || 0;
  const goldGiven = parseFloat(document.getElementById("goldGivenValue").value) || 0;
  const finalAmount = total - goldGiven;

  document.getElementById("printRate").innerText = formatCurrency(rate);
  document.getElementById("printValue").innerText = formatCurrency(total);
  document.getElementById("printGoldGiven").innerText = formatCurrency(goldGiven);
  document.getElementById("printFinalAmount").innerText = formatCurrency(finalAmount);
}

function printBill() {
  beforePrint();
  const input = document.getElementById("inputSection");
  const summary = document.getElementById("printSummary");

  input.style.display = "none";
  summary.style.display = "block";

  setTimeout(() => { window.print();
    summary.style.display = "none";
    input.style.display = "block";
  }, 100);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').then(function (reg) {
      console.log("Service Worker Registered", reg);
    });
  });
}