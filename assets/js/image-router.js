// Image Detail Modal & Router State Management
import { ImageEngine } from './image-engine.js';
import { ImageStorage } from './image-storage.js';
import { ImageShare } from './image-share.js';
import { RelatedEngine } from './related-engine.js';
import { MasonryEngine } from './masonry-engine.js';

export const ImageRouter = {
  currentOpenId: null,

  init() {
    window.addEventListener('popstate', () => {
      const hash = window.location.hash;
      if (hash.startsWith('#image=')) {
        const id = hash.replace('#image=', '');
        this.openDetailModal(id, false);
      } else {
        this.closeDetailModal(false);
      }
    });

    // Check initial load hash
    const hash = window.location.hash;
    if (hash.startsWith('#image=')) {
      const id = hash.replace('#image=', '');
      setTimeout(() => this.openDetailModal(id, false), 200);
    }

    // Close on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentOpenId) {
        this.closeDetailModal();
      }
    });
  },

  openDetailModal(id, updateHistory = true) {
    const image = ImageEngine.getImageById(id);
    if (!image) return;

    this.currentOpenId = id;
    if (updateHistory) {
      history.pushState({ imageId: id }, '', `#image=${id}`);
    }

    let modal = document.getElementById('image-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'image-detail-modal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 overflow-y-auto';
      document.body.appendChild(modal);
    }

    const isSaved = ImageStorage.isSaved(image.id);

    modal.innerHTML = `
      <div class="relative w-full max-w-5xl bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-3xl shadow-2xl overflow-hidden my-auto border border-[var(--border-color)] flex flex-col max-h-[92vh]">
        
        <!-- Modal Top Bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div class="flex items-center space-x-3">
            <span class="text-xs uppercase tracking-widest px-3 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full text-[var(--text-secondary)] font-medium">
              ${image.category || 'Discovery'}
            </span>
            <span class="text-xs text-[var(--text-secondary)]">Source: ${image.source || 'FORMA Editorial'}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button id="modal-save-btn" class="flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium transition ${isSaved ? 'bg-amber-600 text-white' : 'bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)]'}">
              <i class="fa-solid fa-bookmark"></i>
              <span>${isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button id="modal-share-btn" class="p-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition text-[var(--text-primary)]" title="Share">
              <i class="fa-solid fa-share-nodes"></i>
            </button>
            <button id="modal-copy-btn" class="p-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition text-[var(--text-primary)]" title="Copy Link">
              <i class="fa-solid fa-link"></i>
            </button>
            <button id="modal-close-btn" class="p-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition text-[var(--text-primary)] ml-2" title="Close">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body Content -->
        <div class="overflow-y-auto flex-1 p-6 md:p-8 space-y-8">
          
          <!-- Image Presentation (No crop, contain style, zoomable) -->
          <div class="relative flex items-center justify-center bg-black/5 dark:bg-black/40 rounded-2xl p-4 min-h-[350px] md:min-h-[500px] zoom-container">
            <img src="${image.image}" alt="${image.title}" class="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg zoom-target cursor-zoom-in" id="zoomable-modal-image" />
          </div>

          <!-- Title & Destination / Actions -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div>
              <h2 class="text-2xl md:text-3xl font-light tracking-tight">${image.title}</h2>
              <p class="text-[var(--text-secondary)] mt-2 max-w-2xl leading-relaxed text-sm md:text-base">${image.description || ''}</p>
            </div>
            
            <div class="flex items-center space-x-3 shrink-0">
              ${image.destinationUrl ? `
                <a href="${image.destinationUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-2 px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-md">
                  <span>Visit Destination</span>
                  <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                </a>
              ` : `
                <a href="${image.image}" target="_blank" rel="noopener noreferrer" class="flex items-center space-x-2 px-6 py-3 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-[var(--text-primary)] font-medium text-sm transition">
                  <span>Open Original</span>
                  <i class="fa-solid fa-expand text-xs"></i>
                </a>
              `}
            </div>
          </div>

          <!-- Tags -->
          ${image.tags && image.tags.length > 0 ? `
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mr-2">Tags:</span>
              ${image.tags.map(tag => `<span class="px-3 py-1 rounded-full text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">#${tag}</span>`).join('')}
            </div>
          ` : ''}

          <!-- Related Discovery Section -->
          <div class="pt-6 border-t border-[var(--border-color)]">
            <h3 class="text-lg font-light tracking-tight mb-6">More Like This</h3>
            <div id="modal-related-grid" class="masonry-grid">
              <!-- Dynamically populated related items -->
            </div>
          </div>

        </div>
      </div>
    `;

    // Modal Event Listeners
    document.getElementById('modal-close-btn').addEventListener('click', () => this.closeDetailModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeDetailModal();
    });

    document.getElementById('modal-save-btn').addEventListener('click', () => {
      const saved = ImageStorage.toggleSave(image.id);
      const btn = document.getElementById('modal-save-btn');
      if (saved) {
        btn.className = 'flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium transition bg-amber-600 text-white';
        btn.innerHTML = '<i class="fa-solid fa-bookmark"></i><span>Saved</span>';
      } else {
        btn.className = 'flex items-center space-x-1.5 px-4 py-2 rounded-full text-sm font-medium transition bg-[var(--bg-primary)] hover:bg-[var(--border-color)] border border-[var(--border-color)]';
        btn.innerHTML = '<i class="fa-solid fa-bookmark"></i><span>Save</span>';
      }
    });

    document.getElementById('modal-share-btn').addEventListener('click', () => ImageShare.shareImage(image));
    document.getElementById('modal-copy-btn').addEventListener('click', () => ImageShare.copyToClipboard(image.destinationUrl || window.location.href));

    // Zoom interaction on modal image click
    const zoomImg = document.getElementById('zoomable-modal-image');
    let isZoomed = false;
    zoomImg.addEventListener('click', () => {
      isZoomed = !isZoomed;
      if (isZoomed) {
        zoomImg.style.transform = 'scale(1.6)';
        zoomImg.style.cursor = 'zoom-out';
      } else {
        zoomImg.style.transform = 'scale(1)';
        zoomImg.style.cursor = 'zoom-in';
      }
    });

    // Populate Related Images
    const relatedContainer = document.getElementById('modal-related-grid');
    const relatedImages = RelatedEngine.getRelatedImages(image, 4);
    if (relatedImages.length > 0) {
      relatedContainer.innerHTML = relatedImages.map(rel => MasonryEngine.createCardHTML(rel)).join('');
      // Bind click on related items
      relatedContainer.querySelectorAll('.forma-card').forEach(card => {
        card.addEventListener('click', () => {
          const relId = card.getAttribute('data-id');
          this.openDetailModal(relId, true);
        });
      });
    } else {
      relatedContainer.innerHTML = '<p class="text-sm text-[var(--text-secondary)] col-span-full">No related discoveries found.</p>';
    }
  },

  closeDetailModal(updateHistory = true) {
    this.currentOpenId = null;
    const modal = document.getElementById('image-detail-modal');
    if (modal) modal.remove();
    if (updateHistory && window.location.hash.startsWith('#image=')) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
    }
  }
};

