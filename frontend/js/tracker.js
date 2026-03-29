class ExpenseTracker {
  constructor() {
    this.expenses = [];
    this.token = localStorage.getItem('token');
    
    // Add toast to DOM if missing dynamically
    if(!document.getElementById('toastContainer')){
      const tc = document.createElement('div');
      tc.id = 'toastContainer';
      tc.className = 'toast-container';
      document.body.appendChild(tc);
    }
  }

  showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-check-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  async fetchExpenses() {
    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      if (data.success) {
        this.expenses = data.data;
        this.renderExpenses();
        if(window.dashboardUI) window.dashboardUI.updateDashboard(); // notify dashboard UI to refresh charts/stats
      }
    } catch (err) {
      console.error(err);
      this.showToast('Failed to load expenses', true);
    }
  }

  async addExpense(expenseData) {
    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      if (data.success) {
        this.expenses.unshift(data.data); // Add to top
        this.renderExpenses();
        if(window.dashboardUI) window.dashboardUI.updateDashboard();
        this.showToast('Expense added successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      this.showToast('Failed to add expense', true);
      return false;
    }
  }

  async deleteExpense(id) {
    try {
      const res = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await res.json();
      if (data.success) {
        this.expenses = this.expenses.filter(e => e._id !== id);
        // Add slide out animation before re-rendering
        const el = document.querySelector(`[data-id="${id}"]`);
        if(el) {
          el.style.transform = 'translateX(-100px)';
          el.style.opacity = '0';
          setTimeout(() => {
            this.renderExpenses();
            if(window.dashboardUI) window.dashboardUI.updateDashboard();
          }, 300);
        } else {
          this.renderExpenses();
          if(window.dashboardUI) window.dashboardUI.updateDashboard();
        }
        this.showToast('Expense deleted');
      }
    } catch (err) {
      console.error(err);
      this.showToast('Failed to delete expense', true);
    }
  }

  getIconForCategory(cat) {
    const icons = {
      Food: 'fa-utensils',
      Travel: 'fa-plane',
      Shopping: 'fa-bag-shopping',
      Health: 'fa-heart-pulse',
      Entertainment: 'fa-gamepad',
      Utilities: 'fa-bolt',
      Other: 'fa-receipt'
    };
    return icons[cat] || icons.Other;
  }

  renderExpenses() {
    const list = document.getElementById('expensesList');
    if (!list) return;

    const catFilter = document.getElementById('filterCategory').value;
    const curFilter = document.getElementById('filterCurrency').value;

    const filtered = this.expenses.filter(e => {
      const catMatch = catFilter === 'All' || e.category === catFilter;
      const curMatch = curFilter === 'All' || e.currency === curFilter;
      return catMatch && curMatch;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div style="text-align: center; color: var(--text-gray); padding: 20px;">No expenses found. Add one!</div>';
      return;
    }

    list.innerHTML = '';
    filtered.forEach(e => {
      const dateStr = new Date(e.date).toLocaleDateString();
      const item = document.createElement('div');
      item.className = 'expense-item';
      item.dataset.id = e._id;
      item.innerHTML = `
        <div class="expense-info">
          <span class="category-badge"><i class="fa-solid ${this.getIconForCategory(e.category)}"></i> ${e.category}</span>
          <div class="expense-desc">${e.description || 'No description'}</div>
          <div class="expense-date">${dateStr}</div>
        </div>
        <div class="expense-actions">
          <div class="expense-amount">${e.amount.toFixed(2)} ${e.currency}</div>
          <button class="delete-btn" onclick="tracker.deleteExpense('${e._id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  }
}

// Global instance
window.tracker = new ExpenseTracker();
