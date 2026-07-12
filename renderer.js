// renderer.js - Quản lý chi tiêu cho Electron

// ----- State -----
let items = [];
const STORAGE_KEY = 'spending_history_demo';

// DOM refs
const nameInput = document.getElementById('itemName');
const priceInput = document.getElementById('itemPrice');
const addBtn = document.getElementById('addBtn');
const historyList = document.getElementById('historyList');
const topThreeContainer = document.getElementById('topThreeContainer');
const clearBtn = document.getElementById('clearHistoryBtn');

// ----- Lấy ngày hiện tại -----
function getTodayString() {
  return new Date().toLocaleDateString('vi-VN');
}

// ----- Lưu & tải dữ liệu (dùng localStorage) -----
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const todayStr = getTodayString();
        // Cập nhật dữ liệu cũ (nếu có) để có id và date
        items = parsed
          .filter(i => i && typeof i.name === 'string' && typeof i.price === 'number')
          .map(i => ({
            ...i,
            id: i.id || Date.now() + Math.random(), // Thêm ID nếu dữ liệu cũ chưa có
            date: i.date || todayStr // Thêm ngày nếu dữ liệu cũ chưa có
          }));
        return;
      }
    }
  } catch (e) { /* ignore */ }
  items = [];
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ----- Helper functions -----
function getTopThree() {
  const sorted = [...items].sort((a, b) => b.price - a.price);
  return sorted.slice(0, 3);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ----- Render functions -----
function renderTopThree() {
  const top = getTopThree();
  if (top.length === 0) {
    topThreeContainer.innerHTML = `<div class="empty-state">Chưa có khoản chi nào</div>`;
    return;
  }

  const rankClasses = ['rank-1', 'rank-2', 'rank-3'];
  let html = '';
  top.forEach((item, index) => {
    const rank = index + 1;
    const rankClass = rankClasses[index] || '';
    const priceFormatted = item.price.toLocaleString('vi-VN') + 'k'; // Hiển thị 'k' như bạn yêu cầu
    html += `
      <div class="top-item ${rankClass}">
        <span class="name">
          <span class="badge">#${rank}</span>
          ${escapeHtml(item.name)}
        </span>
        <span class="price">${priceFormatted}</span>
      </div>
    `;
  });
  topThreeContainer.innerHTML = html;
}

function renderHistory() {
  if (items.length === 0) {
    historyList.innerHTML = `<div class="empty-state" style="text-align:center; padding: 1rem 0;">📭 Chưa có khoản chi nào</div>`;
    return;
  }

  const todayStr = getTodayString();
  const reversed = [...items].reverse(); // Đảo ngược để khoản chi mới nhất lên đầu
  
  // Lấy các ngày duy nhất
  const uniqueDates = [...new Set(reversed.map(item => item.date))];
  
  let html = '';
  
  uniqueDates.forEach(date => {
    // Lọc các item thuộc ngày này
    const dateItems = reversed.filter(item => item.date === date);
    // Tính tổng tiền trong ngày
    const dateTotal = dateItems.reduce((sum, item) => sum + item.price, 0);
    
    const displayDate = date === todayStr ? 'Hôm nay' : date;
    const totalFormatted = dateTotal.toLocaleString('vi-VN') + 'k';
    
    html += `
      <div class="date-group">
        <div class="date-header">
          <span>📅 ${displayDate}</span>
          <span class="date-total">${totalFormatted}</span>
        </div>
        <ul class="date-items">
    `;
    
    dateItems.forEach(item => {
      const priceFormatted = item.price.toLocaleString('vi-VN') + 'k';
      html += `
        <li>
          <span class="h-name">${escapeHtml(item.name)}</span>
          <span>
            <span class="h-price">${priceFormatted}</span>
            <button class="h-remove" data-id="${item.id}" title="Xóa">✕</button>
          </span>
        </li>
      `;
    });
    
    html += `
        </ul>
      </div>
    `;
  });

  historyList.innerHTML = html;

  // Gắn sự kiện xóa bằng ID
  document.querySelectorAll('.h-remove').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseFloat(this.getAttribute('data-id'));
      if (!isNaN(id)) {
        removeItemById(id);
      }
    });
  });
}

function renderAll() {
  renderTopThree();
  renderHistory();
}

// ----- Actions -----
function addItem() {
  const name = nameInput.value.trim();
  const priceRaw = priceInput.value.trim();

  if (!name) {
    alert('Vui lòng nhập tên khoản chi.');
    nameInput.focus();
    return;
  }
  if (priceRaw === '') {
    alert('Vui lòng nhập số tiền.');
    priceInput.focus();
    return;
  }
  const priceNum = parseFloat(priceRaw);
  if (isNaN(priceNum) || priceNum <= 0) {
    alert('Số tiền phải là số dương.');
    priceInput.value = '';
    priceInput.focus();
    return;
  }

  // Thêm ID và Date khi tạo mới
  items.push({ 
    id: Date.now(),
    name: name, 
    price: priceNum,
    date: getTodayString()
  });
  
  saveToStorage();

  nameInput.value = '';
  priceInput.value = '';
  nameInput.focus();

  renderAll();
}

function removeItemById(id) {
  items = items.filter(item => item.id !== id);
  saveToStorage();
  renderAll();
}

function clearAllHistory() {
  if (items.length === 0) return;
  if (confirm('Xóa tất cả lịch sử chi tiêu?')) {
    items = [];
    saveToStorage();
    renderAll();
  }
}

// ----- Event listeners -----
addBtn.addEventListener('click', addItem);

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    priceInput.focus();
  }
});

priceInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addItem();
  }
});

clearBtn.addEventListener('click', clearAllHistory);

// ----- Khởi tạo -----
loadFromStorage();
renderAll();

// Lưu khi đóng ứng dụng
window.addEventListener('beforeunload', function() {
  saveToStorage();
});