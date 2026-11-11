// Image Database Engine (Loads JSON + LocalStorage custom images)
import { ImageStorage } from './image-storage.js';

let masterImageCache = [];

export const ImageEngine = {
  async init() {
    try {
      const response = await fetch('./data/images.json');
      const defaultImages = await response.json();
      const customImages = ImageStorage.getCustomImages();
      // Combine custom images (user added) on top of default database
      masterImageCache = [...customImages, ...defaultImages];
      return masterImageCache;
    } catch (error) {
      console.error('Failed to load image database, falling back to local custom items.', error);
      masterImageCache = ImageStorage.getCustomImages();
      return masterImageCache;
    }
  },

  getAllImages() {
    const customImages = ImageStorage.getCustomImages();
    // Ensure newly added custom images are always present
    const defaultIds = new Set(masterImageCache.map(img => img.id));
    const newCustoms = customImages.filter(img => !defaultIds.has(img.id));
    if (newCustoms.length > 0) {
      masterImageCache = [...newCustoms, ...masterImageCache];
    }
    return masterImageCache;
  },

  getImageById(id) {
    return this.getAllImages().find(img => img.id === id) || null;
  },

  async validateImageURL(url) {
    return new Promise((resolve) => {
      if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        resolve(false);
        return;
      }
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
};

