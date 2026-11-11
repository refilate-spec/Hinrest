// Masonry Card Rendering & Interaction Bindings
import { ImageStorage } from './image-storage.js';
import { ImageShare } from './image-share.js';
import { ImageRouter } from './image-router.js';

export const MasonryEngine = {
  createCardHTML(image) {
    const isSaved = ImageStorage.isSaved(image.id);
    return `
      <div class="masonry-item forma-card group relative bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-[var(--card-shadow)] transition duration-300 hover:-translate-y-1 cursor-pointer" data-id="${image.id}">
        
        <!-- Image Container -->
        <div class="relative w-full overflow-hidden bg-black/5 dark:bg-black/30">
          <img src="${image.image}" alt="${image.title}" loading="lazy" class="w-full h-auto object-cover transition duration-500 group-hover:scale-105" />
          
          <!-- Hover Overlay Controls (Desktop) -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-between p-4">
            
            <!-- Top Controls -->
            <div class="flex items-center justify-between w-full">
              <span class="text-xs font-medium px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full">
                ${image.category || 'Discovery'}
              </span>
              <div class="flex items-center space-x-2">
                <button class="save-card-btn p-2.5 rounded-full backdrop-blur-md transition ${isSaved ? 'bg-amber-600 text-white' : 'bg-black/60 text-white hover:bg-black/80'}" data-id="${image.id}" title="Save">
                  <i class="fa-solid fa-bookmark"></i>
                </button>
              </div>
            </div>

            <!-- Bottom Controls -->
            <div class="flex items-center justify-between w-full">
              <div class="text-white text-xs font-light truncate max-w-[160px]">
                ${image.title}
              </div>
              <div class="flex items-center space-x-2">
                <button class="share-card-btn p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition" data-id="${image.id}" title="Share">
                  <i class="fa-solid fa-share-nodes"></i>
                </button>
                ${image.destinationUrl ? `
                  <a href="${image.destinationUrl}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white backdrop-blur-md transition" title="Visit Destination" onclick="event.stopPropagation();">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                ` : ''}
              </div>
            </div>

          </div>
        </div>

        <!-- Card Footer (Title & Subtitle for clean editorial look) -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium tracking-tight truncate max-w-[200px]">${image.title}</h4>
            <p class="text-xs text-[var(--text-secondary)] mt-0.5">${image.source || 'FORMA Curated'}</p>
          </div>
          <button class="mobile-save-btn sm:hidden p-2 text-[var(--text-secondary)] hover:text-amber-600" data-id="${image.id}">
            <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
          </button>
        </div>

      </div>
    `;
  },

  bindCardEvents(containerElement) {
    containerElement.querySelectorAll('.forma-card').forEach(card => {
      const id = card.getAttribute('data-id');

      // Click card body to open detail modal
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        ImageRouter.openDetailModal(id, true);
      });

      // Save button binding
      const saveBtn = card.querySelector('.save-card-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const saved = ImageStorage.toggleSave(id);
          saveBtn.className = `save-card-btn p-2.5 rounded-full backdrop-blur-md transition ${saved ? 'bg-amber-600 text-white' : 'bg-black/60 text-white hover:bg-black/80'}`;
        });
      }

      // Mobile save button
      const mobileSaveBtn = card.querySelector('.mobile-save-btn');
      if (mobileSaveBtn) {
        mobileSaveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const saved = ImageStorage.toggleSave(id);
          mobileSaveBtn.innerHTML = `<i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i>`;
        });
      }

      // Share button binding
      const shareBtn = card.querySelector('.share-card-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          import('./image-engine.js').then(({ ImageEngine }) => {
            const img = ImageEngine.getImageById(id);
            if (img) ImageShare.shareImage(img);
          });
        });
      }
    });
  }
};

