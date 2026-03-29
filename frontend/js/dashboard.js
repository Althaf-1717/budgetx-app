class DashboardUI {
  constructor() {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.token = localStorage.getItem('token');
    
    if (!this.token || !this.user) {
      window.location.href = 'index.html';
      return;
    }

    this.chart = null;
    this.budgetLimits = this.user.budgetLimits || {};
    
    this.init();
  }

  async init() {
    this.setupUserUI();
    this.bindEvents();
    
    // Fetch budget limits from server
    await this.fetchBudgets();
    // Load expenses
    await window.tracker.fetchExpenses();
    // Converter is initialized globally in converter.js
  }

  setupUserUI() {
    const nameDisplay = document.getElementById('userNameDisplay');
    const avatar = document.getElementById('userAvatar');
    if (nameDisplay) nameDisplay.innerText = this.user.name;
    if (avatar) avatar.innerText = this.user.name.charAt(0).toUpperCase();
  }

  bindEvents() {
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'index.html';
    });

    const toggleBtn = document.getElementById('toggleExpenseFormBtn');
    const formContainer = document.getElementById('expenseFormContainer');
    
    toggleBtn?.addEventListener('click', () => {
      formContainer.classList.toggle('active');
    });

    document.getElementById('addExpenseForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const expense = {
        amount: parseFloat(document.getElementById('expAmount').value),
        currency: document.getElementById('expCurrency').value,
        category: document.getElementById('expCategory').value,
        date: document.getElementById('expDate').value,
        description: document.getElementById('expDesc').value
      };
      
      const res = await window.tracker.addExpense(expense);
      if(res){
         e.target.reset();
         formContainer.classList.remove('active');
      }
    });

    document.getElementById('filterCategory')?.addEventListener('change', () => {
      window.tracker.renderExpenses();
    });

    document.getElementById('filterCurrency')?.addEventListener('change', () => {
      window.tracker.renderExpenses();
    });
  }

  async fetchBudgets() {
    try {
      const res = await fetch('https://budgetx-app.onrender.com/api/expenses/budget', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      if(data.success) {
        this.budgetLimits = data.data;
      }
    } catch (err) {
      console.error('Failed to fetch budgets');
    }
  }

  async saveLimits() {
    try {
      // In a real app we'd open a modal. For simplicity, we just prompt here.
      const newFood = prompt("Enter Food limit:", this.budgetLimits.Food);
      if(newFood === null) return;

      const body = {
        Food: parseFloat(newFood) || 0
      };

      const res = await fetch('https://budgetx-app.onrender.com/api/expenses/budget', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if(data.success){
        this.budgetLimits = data.data;
        this.updateDashboard();
        window.tracker.showToast('Budgets updated successfully');
      }
    } catch(err) {
      window.tracker.showToast('Failed to update budgets', true);
    }
  }

  updateDashboard() {
    this.updateStats();
    this.updateChart();
    this.updateBudgetProgress();
  }

  updateStats() {
    const expenses = window.tracker.expenses;
    let totalUsd = 0;
    const catCount = {};
    const currCount = {};

    expenses.forEach(e => {
      // Convert everything to USD for total stats
      totalUsd += window.converter.convert(e.amount, e.currency, 'USD');
      
      catCount[e.category] = (catCount[e.category] || 0) + 1;
      currCount[e.currency] = (currCount[e.currency] || 0) + 1;
    });

    document.getElementById('statTotalExpenses').innerText = expenses.length;
    
    // Animate number for total converted
    window.converter.animateNumber('statTotalConverted', totalUsd, 'USD');

    // Top Category
    const topCat = Object.keys(catCount).sort((a,b) => catCount[b] - catCount[a])[0];
    document.getElementById('statTopCategory').innerText = topCat || '-';

    // Top Currency
    const topCurr = Object.keys(currCount).sort((a,b) => currCount[b] - currCount[a])[0];
    document.getElementById('statTopCurrency').innerText = topCurr || '-';
  }

  updateBudgetProgress() {
    const container = document.getElementById('budgetProgressBars');
    const suggContainer = document.getElementById('budgetSuggestionsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    suggContainer.innerHTML = '';

    const expenses = window.tracker.expenses;
    const currentMonth = new Date().getMonth();

    const categoryTotals = {};
    expenses.forEach(e => {
      const expDate = new Date(e.date);
      if(expDate.getMonth() === currentMonth) {
         // Simplify to just adding amounts assuming they are standard or mapped to USD.
         // In full production, compare strictly by base currency.
         const usdAmt = window.converter.convert(e.amount, e.currency, 'USD');
         categoryTotals[e.category] = (categoryTotals[e.category] || 0) + usdAmt;
      }
    });

    const categories = ['Food', 'Travel', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'];
    
    categories.forEach(cat => {
      const limit = this.budgetLimits[cat] || 0;
      if (limit === 0) return; // Skip if no budget set

      const spent = categoryTotals[cat] || 0;
      const percent = Math.min((spent / limit) * 100, 100);
      
      let statusClass = '';
      if (percent >= 100) statusClass = 'danger';
      else if (percent >= 80) statusClass = 'warning';

      container.innerHTML += `
        <div class="budget-item">
          <div class="budget-header">
            <span>${cat}</span>
            <span>${spent.toFixed(0)} / ${limit} USD (${percent.toFixed(0)}%)</span>
          </div>
          <div class="progress-bg">
            <div class="progress-fill ${statusClass}" style="width: 0%" data-target="${percent}"></div>
          </div>
        </div>
      `;

      // Smart Suggestions logic
      if(percent >= 100) {
        suggContainer.innerHTML += `<span class="suggestion-chip"><i class="fa-solid fa-triangle-exclamation" style="color:#FF3B30"></i> You've exceeded your ${cat} budget!</span> `;
      } else if (percent >= 80) {
        suggContainer.innerHTML += `<span class="suggestion-chip"><i class="fa-solid fa-circle-exclamation" style="color:#FF9500"></i> You've spent ${percent.toFixed(0)}% of your ${cat} budget.</span> `;
      }
    });

    if(container.innerHTML === '') {
      container.innerHTML = '<div style="text-align: center; color: #777; font-size: 14px; padding: 10px;">No budgets set. Click Save Limits to set up. (Default Food demo available via prompt)</div>';
    } else {
      // Trigger animations
      setTimeout(() => {
        document.querySelectorAll('.progress-fill').forEach(el => {
          el.style.width = el.dataset.target + '%';
        });
      }, 100);
    }
  }

  updateChart() {
    const ctx = document.getElementById('spendingDonutChart');
    if (!ctx) return;

    const expenses = window.tracker.expenses;
    const catData = {};

    expenses.forEach(e => {
       const usdAmt = window.converter.convert(e.amount, e.currency, 'USD');
       catData[e.category] = (catData[e.category] || 0) + usdAmt;
    });

    const labels = Object.keys(catData);
    const data = Object.values(catData);

    const colors = ['#FF6B00', '#FF9500', '#FFCC00', '#34C759', '#5AC8FA', '#5856D6', '#8E8E93'];

    if (this.chart) this.chart.destroy();

    if(data.length === 0) {
       // Placeholder
       this.chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
             labels: ['No Data'],
             datasets: [{ data: [1], backgroundColor: ['#EAEAEA'] }]
          },
          options: { plugins: { legend: { display: false } }, cutout: '70%'}
       });
       return;
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        animation: {
          animateScale: true,
          animateRotate: true
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { family: 'Inter', size: 12 }
            }
          }
        }
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('spendingDonutChart')) {
    window.dashboardUI = new DashboardUI();
  }
});
