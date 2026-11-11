// Main Application Controller
import { DiscoveryFeed } from './discovery-feed.js';
import { ImageRouter } from './image-router.js';
import { SearchEngine } from './search-engine.js';
import { ImageStorage } from './image-storage.js';
import { ImageEngine } from './image-engine.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Theme Switcher Setup
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlElement = document.documentElement;
  
  const savedTheme = localStorage.getItem('forma_theme') || 'light';
  if (savedTheme === 'dark') {
    htmlElement.classList.add('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      htmlElement.classList.toggle('dark');
      const isDark = htmlElement.classList.contains('dark');
      localStorage.setItem('forma_theme', isDark ? 'dark' : 'light');
    });
  }

  // 2. Initialize Categories Navigation
  await initCategories();

  // 3. Initialize Discovery Feed & Router
  DiscoveryFeed.init();
  ImageRouter.init();

  // 4. Search & Suggestions Setup
  setupSearch();

  // 5. Saved Collection Modal Setup
  setupSavedCollectionModal();

  // 6. Add Image Modal Setup
  setupAddImageModal();

  // 7. Toast Notification Listener
  window.addEventListener('forma:toast', (e) => {
    showToast(e.detail.message);
  });
});

async function initCategories() {
  try {
    const res = await fetch('./data/categories.json');
    const categories = await res.json();
    const container = document.getElementById('category-nav-container');
    if (!container) return;

    container.innerHTML = categories.map((cat, idx) => `
      <button class="category-btn whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition flex items-center space-x-2 border ${idx === 0 ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]'}" data-category="${cat.id}">
        <i class="fa-solid ${cat.icon} text-xs"></i>
        <span>${cat.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        container.querySelectorAll('.category-btn').forEach(b => {
          b.className = 'category-btn whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition flex items-center space-x-2 border bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--text-secondary)]';
        });
        btn.className = 'category-btn whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition flex items-center space-x-2 border bg-[var(--text-primary)] text-[var(--bg-primary)] border-transparent';
        
        const cat = btn.getAttribute('data-category');
        DiscoveryFeed.filterByCategory(cat);
      });
    });
  } catch (e) {
    console.error('Failed to load categories', e);
  }
}

function setupSearch() {
  const searchInput = document.getElementById('advanced-search-input');
  const suggestionsBox = document.getElementById('search-suggestions');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    DiscoveryFeed.searchQuery(val);

    if (suggestionsBox) {
      const suggestions = SearchEngine.getSuggestions(val);
      if (suggestions.length > 0) {
        suggestionsBox.innerHTML = suggestions.map(s => `<div class="suggestion-item px-4 py-2 hover:bg-[var(--bg-primary)] cursor-pointer text-sm">${s}</div>`).join('');
        suggestionsBox.classList.remove('hidden');

        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            searchInput.value = item.textContent;
            suggestionsBox.classList.add('hidden');
            DiscoveryFeed.searchQuery(item.textContent);
          });
        });
      } else {
        suggestionsBox.classList.add('hidden');
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (suggestionsBox && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.classList.add('hidden');
    }
  });
}

function setupSavedCollectionModal() {
  const savedNavBtn = document.getElementById('saved-nav-btn');
  if (!savedNavBtn) return;

  savedNavBtn.addEventListener('click', () => {
    openSavedModal();
  });

  window.addEventListener('forma:saved-updated', () => {
    updateSavedBadgeCount();
  });
  updateSavedBadgeCount();
}

function updateSavedBadgeCount() {
  const count = ImageStorage.getSavedIds().length;
  let badge = document.getElementById('saved-badge-count');
  if (count > 0) {
    if (!badge) {
      const savedNavBtn = document.getElementById('saved-nav-btn');
      if (savedNavBtn) {
        badge = document.createElement('span');
        badge.id = 'saved-badge-count';
        badge.className = 'absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold';
        savedNavBtn.appendChild(badge);
      }
    }
    if (badge) badge.textContent = count;
  } else if (badge) {
    badge.remove();
  }
}

function openSavedModal() {
  const savedIds = ImageStorage.getSavedIds();
  const allImages = ImageEngine.getAllImages();
  const savedImages = allImages.filter(img => savedIds.includes(img.id));

  let modal = document.getElementById('saved-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'saved-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="relative w-full max-w-4xl bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl shadow-2xl overflow-hidden my-auto border border-[var(--border-color)] flex flex-col max-h-[85vh]">
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
        <h3 class="text-lg font-medium">Saved Collection (${savedImages.length})</h3>
        <button id="close-saved-modal" class="p-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="p-6 overflow-y-auto flex-1">
        ${savedImages.length > 0 ? `
          <div class="masonry-grid">
            ${savedImages.map(img => import('./masonry-engine.js').then(m => m.MasonryEngine.createCardHTML(img))).join('')}
          </div>
        ` : `
          <div class="py-20 text-center space-y-3">
            <i class="fa-regular fa-bookmark text-4xl text-[var(--text-secondary)] opacity-50"></i>
            <h4 class="text-base font-medium">Your collection is empty</h4>
            <p class="text-sm text-[var(--text-secondary)]">Save images as you discover them to curate your personal board.</p>
          </div>
        `}
      </div>
    </div>
  `;

  modal.querySelector('#close-saved-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  import('./masonry-engine.js').then(({ MasonryEngine }) => {
    MasonryEngine.bindCardEvents(modal);
  });
}

function setupAddImageModal() {
  const addBtn = document.getElementById('add-image-nav-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    openAddModal();
  });
}

function openAddModal() {
  let modal = document.getElementById('add-image-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'add-image-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="relative w-full max-w-lg bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl shadow-2xl overflow-hidden my-auto border border-[var(--border-color)]">
      <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
        <h3 class="text-lg font-medium">Add Visual Discovery</h3>
        <button id="close-add-modal" class="p-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <form id="add-image-form" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Image URL *</label>
          <input type="url" id="add-url" required placeholder="https://example.com/image.jpg" class="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-amber-600" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Title *</label>
          <input type="text" id="add-title" required placeholder="Minimalist Study" class="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-amber-600" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Category *</label>
          <select id="add-category" class="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-amber-600">
            <option value="architecture">Architecture</option>
            <option value="interior">Interior</option>
            <option value="art">Art & Design</option>
            <option value="nature">Nature & Mood</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Description</label>
          <textarea id="add-desc" rows="3" placeholder="Describe this visual piece..." class="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-amber-600"></textarea>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Destination URL (Optional)</label>
          <input type="url" id="add-destination" placeholder="https://..." class="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-amber-600" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Tags (Comma separated)</label>
          <input type="text" id="add-tags" placeholder="minimal, architecture, design" class="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-amber-600" />
        </div>
        <button type="submit" class="w-full py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-md mt-4">
          Publish Discovery
        </button>
      </form>
    </div>
  `;

  modal.querySelector('#close-add-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector('#add-image-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageUrl = document.getElementById('add-url').value.trim();
    const title = document.getElementById('add-title').value.trim();
    const category = document.getElementById('add-category').value;
    const description = document.getElementById('add-desc').value.trim();
    const destinationUrl = document.getElementById('add-destination').value.trim();
    const tagsInput = document.getElementById('add-tags').value.trim();

    const isValid = await ImageEngine.validateImageURL(imageUrl);
    if (!isValid) {
      showToast('Invalid or unreachable image URL.');
      return;
    }

    const newImage = {
      id: 'forma_custom_' + Date.now(),
      title,
      image: imageUrl,
      destinationUrl: destinationUrl && (destinationUrl.startsWith('http://') || destinationUrl.startsWith('https://')) ? destinationUrl : '',
      description,
      category,
      tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [category],
      relatedIds: [],
      source: 'User Upload'
    };

    ImageStorage.addCustomImage(newImage);
    modal.remove();
    showToast('Discovery added successfully!');
  });
}

function showToast(message) {
  let toast = document.getElementById('forma-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'forma-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-[var(--text-primary)] text-[var(--bg-primary)] px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium transition transform translate-y-20 opacity-0 duration-300';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  setTimeout(() => {
    toast.classList.remove('translate-y-20', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

