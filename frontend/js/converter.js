class CurrencyConverter {
  constructor() {
    this.rates = {};
    this.base = 'USD';
    this.init();
  }

  async init() {
    await this.fetchRates();
    this.populateDropdowns();
    this.setupListeners();
    this.triggerConvert();
  }

  async fetchRates() {
    try {
      const res = await fetch('https://budgetx-app.onrender.com/api/expenses/rates');
      const data = await res.json();
      if (data.success) {
        this.rates = data.rates;
        this.base = data.base;
        document.getElementById('lastUpdatedTime').innerText = 'Live Feed 🟢';
      }
    } catch (error) {
      console.error('Failed to fetch rates', error);
      // Fallback mock rates
      this.rates = {
        USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.15, JPY: 151.20,
        AED: 3.67, CAD: 1.35, SGD: 1.34, AUD: 1.53, CHF: 0.89
      };
      document.getElementById('lastUpdatedTime').innerText = 'Offline Mode';
    }
  }

  populateDropdowns() {
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const filterCurrency = document.getElementById('filterCurrency');
    const expCurrency = document.getElementById('expCurrency');

    const currencies = Object.keys(this.rates);
    
    let optionsHtml = '';
    currencies.forEach(cur => {
      optionsHtml += `<option value="${cur}">${cur}</option>`;
    });

    if (fromSelect && toSelect) {
      fromSelect.innerHTML = optionsHtml;
      toSelect.innerHTML = optionsHtml;
      fromSelect.value = 'USD';
      toSelect.value = 'EUR';
    }

    if (filterCurrency) filterCurrency.innerHTML += optionsHtml;
    if (expCurrency) {
      expCurrency.innerHTML = optionsHtml;
      expCurrency.value = 'USD';
    }
  }

  setupListeners() {
    const amtInput = document.getElementById('convertAmount');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const swapBtn = document.getElementById('swapBtn');

    if (amtInput) amtInput.addEventListener('input', () => this.triggerConvert());
    if (fromSelect) fromSelect.addEventListener('change', () => this.triggerConvert());
    if (toSelect) toSelect.addEventListener('change', () => this.triggerConvert());
    
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        swapBtn.classList.toggle('rotate');
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        this.triggerConvert();
      });
    }
  }

  triggerConvert() {
    const amtInput = document.getElementById('convertAmount');
    if (!amtInput) return;
    
    const amount = parseFloat(amtInput.value) || 0;
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;

    const fromRate = this.rates[from];
    const toRate = this.rates[to];

    // Convert from 'from' to Base, then Base to 'to'
    const result = (amount / fromRate) * toRate;
    
    this.animateNumber('convertResult', result, to);
    
    // Update rate info
    const singleRate = (1 / fromRate) * toRate;
    document.getElementById('exchangeRateInfo').innerText = `1 ${from} = ${singleRate.toFixed(4)} ${to}`;
  }

  convert(amount, from, to) {
    if(!this.rates[from] || !this.rates[to]) return amount;
    return (amount / this.rates[from]) * this.rates[to];
  }

  animateNumber(id, endValue, currency) {
    const el = document.getElementById(id);
    const startValue = parseFloat(el.innerText) || 0;
    const duration = 500;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = startValue + (endValue - startValue) * progress;
      
      el.innerText = `${current.toFixed(2)} ${currency}`;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}

// Global instance
window.converter = new CurrencyConverter();
