// LocalStorage & Image Management Module
const STORAGE_KEYS = {
  SAVED_IMAGES: 'forma_saved_images',
  CUSTOM_IMAGES: 'forma_custom_images',
  SEARCH_HISTORY: 'forma_search_history'
};

export const ImageStorage = {
  getSavedIds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_IMAGES)) || [];
    } catch (e) {
      return [];
    }
  },

  isSaved(id) {
    return this.getSavedIds().includes(id);
  },

  toggleSave(id) {
    let saved = this.getSavedIds();
    if (saved.includes(id)) {
      saved = saved.filter(item => item !== id);
    } else {
      saved.push(id);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_IMAGES, JSON.stringify(saved));
    window.dispatchEvent(new CustomEvent('forma:saved-updated', { detail: { saved } }));
    return saved.includes(id);
  },

  getCustomImages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_IMAGES)) || [];
    } catch (e) {
      return [];
    }
  },

  addCustomImage(imageObj) {
    const custom = this.getCustomImages();
    custom.unshift(imageObj);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, JSON.stringify(custom));
    window.dispatchEvent(new CustomEvent('forma:feed-updated'));
  },

  getSearchHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
    } catch (e) {
      return [];
    }
  },

  addSearchQuery(query) {
    if (!query || query.trim() === '') return;
    let history = this.getSearchHistory().filter(q => q.toLowerCase() !== query.toLowerCase());
    history.unshift(query);
    if (history.length > 8) history = history.slice(0, 8);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
  }
};

