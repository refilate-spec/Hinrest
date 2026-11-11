// Infinite Discovery Feed Engine with Batch Rendering & Intersection Observer
import { ImageEngine } from './image-engine.js';
import { MasonryEngine } from './masonry-engine.js';
import { SearchEngine } from './search-engine.js';

export const DiscoveryFeed = {
  currentQuery: '',
  currentCategory: 'all',
  currentImages: [],
  renderedCount: 0,
  batchSize: 8,
  isLoading: false,
  observer: null,

  async init() {
    await ImageEngine.init();
    this.currentImages = SearchEngine.search(this.currentQuery, this.currentCategory);
    this.renderInitial();
    this.setupInfiniteScroll();

    window.addEventListener('forma:feed-updated', () => {
      this.refresh();
    });
  },

  refresh() {
    this.currentImages = SearchEngine.search(this.currentQuery, this.currentCategory);
    this.renderedCount = 0;
    const grid = document.getElementById('discovery-grid');
    if (grid) grid.innerHTML = '';
    this.loadMoreBatch();
  },

  renderInitial() {
    const grid = document.getElementById('discovery-grid');
    if (!grid) return;
    grid.innerHTML = '';
    this.renderedCount = 0;
    this.loadMoreBatch();
  },

  loadMoreBatch() {
    if (this.isLoading) return;
    const grid = document.getElementById('discovery-grid');
    if (!grid) return;

    if (this.renderedCount >= this.currentImages.length) {
      this.renderSentinel(false);
      return;
    }

    this.isLoading = true;
    this.renderSentinel(true);

    setTimeout(() => {
      const nextBatch = this.currentImages.slice(this.renderedCount, this.renderedCount + this.batchSize);
      this.renderedCount += nextBatch.length;

      // Remove sentinel before appending
      const sentinel = document.getElementById('feed-sentinel');
      if (sentinel) sentinel.remove();

      if (nextBatch.length > 0) {
        const html = nextBatch.map(img => MasonryEngine.createCardHTML(img)).join('');
        grid.insertAdjacentHTML('beforeend', html);
        MasonryEngine.bindCardEvents(grid);
      }

      this.isLoading = false;
      this.renderSentinel(this.renderedCount < this.currentImages.length);
    }, 300);
  },

  renderSentinel(show) {
    const grid = document.getElementById('discovery-grid');
    if (!grid) return;
    let sentinel = document.getElementById('feed-sentinel');
    if (sentinel) sentinel.remove();

    if (show) {
      const sentinelHTML = `
        <div id="feed-sentinel" class="col-span-full py-12 flex justify-center items-center">
          <div class="flex items-center space-x-3 text-[var(--text-secondary)]">
            <div class="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm font-medium">Discovering more...</span>
          </div>
        </div>
      `;
      grid.insertAdjacentHTML('afterend', sentinelHTML);
      // Re-observe sentinel
      if (this.observer && sentinelHTML) {
        const newSentinel = document.getElementById('feed-sentinel');
        if (newSentinel) this.observer.observe(newSentinel);
      }
    } else if (this.currentImages.length === 0) {
      const emptyHTML = `
        <div id="feed-sentinel" class="col-span-full py-20 text-center space-y-4">
          <i class="fa-solid fa-compass text-4xl text-[var(--text-secondary)] opacity-50"></i>
          <h3 class="text-lg font-medium">No discoveries found</h3>
          <p class="text-sm text-[var(--text-secondary)]">Try searching for something else or explore another category.</p>
        </div>
      `;
      grid.insertAdjacentHTML('afterend', emptyHTML);
    }
  },

  setupInfiniteScroll() {
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.loadMoreBatch();
        }
      });
    }, options);

    const sentinel = document.getElementById('feed-sentinel');
    if (sentinel) this.observer.observe(sentinel);
  },

  filterByCategory(category) {
    this.currentCategory = category;
    this.refresh();
  },

  searchQuery(query) {
    this.currentQuery = query;
    this.refresh();
  }
};

