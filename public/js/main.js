/**
 * ============================================================================
 * NIM HAN KOREAN MART - Marilao Branch
 * File: /js/main.js
 * Description: Standalone Vanilla JavaScript (Interactive Shopping List, Filters, Secret Staff Trigger)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Secret 10-Click Logo Trigger for Staff Access
  const REQUIRED_LOGO_CLICKS = 10;
  const CLICK_WINDOW_MS = 8000;
  let clickCount = 0;
  let firstClickTime = 0;
  let resetTimer = null;

  const logoEl = document.getElementById('secretLogoTrigger');
  const staffModal = document.getElementById('staffAccessModal');
  const closeStaffBtn = document.getElementById('closeStaffModal');

  if (logoEl && staffModal) {
    logoEl.addEventListener('click', () => {
      const now = Date.now();
      if (clickCount === 0 || (now - firstClickTime) > CLICK_WINDOW_MS) {
        clickCount = 1;
        firstClickTime = now;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          clickCount = 0;
          firstClickTime = 0;
        }, CLICK_WINDOW_MS);
      } else {
        clickCount++;
      }

      if (clickCount >= REQUIRED_LOGO_CLICKS) {
        clearTimeout(resetTimer);
        clickCount = 0;
        firstClickTime = 0;
        staffModal.hidden = false;
        staffModal.style.display = 'flex';
      }
    });

    closeStaffBtn?.addEventListener('click', () => {
      staffModal.hidden = true;
      staffModal.style.display = 'none';
    });
  }

  // 2. Light / Dark Mode Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('nimhan_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeBtnText(true);
  }

  themeToggleBtn?.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('nimhan_theme', isDark ? 'dark' : 'light');
    updateThemeBtnText(isDark);
  });

  function updateThemeBtnText(isDark) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
  }

  // 3. Walk-In Shopping List State (localStorage)
  let walkInList = JSON.parse(localStorage.getItem('nimhan_walkin_list') || '[]');
  const walkInDrawer = document.getElementById('walkInDrawer');
  const openWalkInBtn = document.getElementById('openWalkInBtn');
  const closeWalkInBtn = document.getElementById('closeWalkInBtn');
  const walkInCounterBadge = document.getElementById('walkInCounterBadge');
  const walkInItemsContainer = document.getElementById('walkInItemsContainer');
  const walkInTotalAmount = document.getElementById('walkInTotalAmount');
  const clearWalkInBtn = document.getElementById('clearWalkInBtn');
  const printWalkInBtn = document.getElementById('printWalkInBtn');

  function saveAndRenderWalkIn() {
    localStorage.setItem('nimhan_walkin_list', JSON.stringify(walkInList));
    const totalCount = walkInList.reduce((acc, item) => acc + item.qty, 0);
    const totalPhp = walkInList.reduce((acc, item) => acc + (item.price * item.qty), 0);

    if (walkInCounterBadge) {
      walkInCounterBadge.textContent = totalCount;
    }

    if (walkInTotalAmount) {
      walkInTotalAmount.textContent = `₱${totalPhp.toFixed(2)}`;
    }

    if (walkInItemsContainer) {
      if (walkInList.length === 0) {
        walkInItemsContainer.innerHTML = '<p style="color: var(--text-faint); font-size: 13px; text-align: center; margin: 20px 0;">Your Walk-In list is currently empty. Tap "+ Add to List" on any available grocery item below!</p>';
        return;
      }

      walkInItemsContainer.innerHTML = walkInList.map((item) => `
        <div class="walkin-item-row">
          <div class="item-info">
            <h4>${item.name}</h4>
            <p>₱${item.price.toFixed(2)} each · Total: ₱${(item.price * item.qty).toFixed(2)}</p>
          </div>
          <div class="item-qty-controls">
            <button onclick="window.updateWalkInQty('${item.id}', -1)">-</button>
            <span style="font-weight: 700; font-size: 13px; min-width: 18px; text-align: center;">${item.qty}</span>
            <button onclick="window.updateWalkInQty('${item.id}', 1)">+</button>
            <button onclick="window.removeWalkInItem('${item.id}')" style="color: #C8102E; margin-left: 6px;">×</button>
          </div>
        </div>
      `).join('');
    }
  }

  window.addToWalkIn = function(id, name, price) {
    const existing = walkInList.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      walkInList.push({ id, name, price: Number(price), qty: 1 });
    }
    saveAndRenderWalkIn();
    walkInDrawer?.classList.add('is-open');
  };

  window.updateWalkInQty = function(id, change) {
    const item = walkInList.find(i => i.id === id);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) {
      walkInList = walkInList.filter(i => i.id !== id);
    }
    saveAndRenderWalkIn();
  };

  window.removeWalkInItem = function(id) {
    walkInList = walkInList.filter(i => i.id !== id);
    saveAndRenderWalkIn();
  };

  openWalkInBtn?.addEventListener('click', () => {
    walkInDrawer?.classList.add('is-open');
  });

  closeWalkInBtn?.addEventListener('click', () => {
    walkInDrawer?.classList.remove('is-open');
  });

  clearWalkInBtn?.addEventListener('click', () => {
    walkInList = [];
    saveAndRenderWalkIn();
  });

  printWalkInBtn?.addEventListener('click', () => {
    window.print();
  });

  saveAndRenderWalkIn();

  // 4. Product Flashcards Search, Category Filter & Sorting
  const productSearch = document.getElementById('productSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const productSort = document.getElementById('productSort');
  const productGrid = document.getElementById('productGrid');

  let activeCategory = 'ALL';

  function applyProductFilters() {
    if (!productGrid) return;
    const cards = Array.from(productGrid.querySelectorAll('.product-flashcard'));
    const query = (productSearch?.value || '').toLowerCase().trim();

    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const cat = card.dataset.category || '';

      const matchesQuery = !query || name.includes(query);
      const matchesCategory = activeCategory === 'ALL' || cat === activeCategory;

      if (matchesQuery && matchesCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Sorting
    const sortVal = productSort?.value || 'featured';
    const visibleCards = cards.filter(c => c.style.display !== 'none');

    visibleCards.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price) || 0;
      const priceB = parseFloat(b.dataset.price) || 0;
      const nameA = a.dataset.name || '';
      const nameB = b.dataset.name || '';

      if (sortVal === 'price-asc') return priceA - priceB;
      if (sortVal === 'price-desc') return priceB - priceA;
      if (sortVal === 'name-asc') return nameA.localeCompare(nameB);
      return 0; // featured default
    });

    visibleCards.forEach(card => productGrid.appendChild(card));
  }

  productSearch?.addEventListener('input', applyProductFilters);
  productSort?.addEventListener('change', applyProductFilters);

  if (categoryFilter) {
    categoryFilter.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        categoryFilter.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat || 'ALL';
        applyProductFilters();
      });
    });
  }
});
