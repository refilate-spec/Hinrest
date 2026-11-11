// Intelligent Client-Side Search Engine with suggestions & relevance scoring
import { ImageEngine } from './image-engine.js';
import { ImageStorage } from './image-storage.js';

export const SearchEngine = {
  search(query, category = 'all') {
    const allImages = ImageEngine.getAllImages();
    if (!query && category === 'all') return allImages;

    const lowerQuery = query ? query.toLowerCase().trim() : '';
    const queryTerms = lowerQuery ? lowerQuery.split(/\s+/) : [];

    const scored = allImages.map(img => {
      let score = 0;

      // Category filter match
      if (category !== 'all' && img.category.toLowerCase() !== category.toLowerCase()) {
        return { image: img, score: -1 };
      }

      if (!lowerQuery) {
        return { image: img, score: 1 };
      }

      // Title match
      if (img.title && img.title.toLowerCase().includes(lowerQuery)) {
        score += 20;
      }

      // Description match
      if (img.description && img.description.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      // Category match
      if (img.category && img.category.toLowerCase().includes(lowerQuery)) {
        score += 15;
      }

      // Tag match
      if (img.tags && Array.isArray(img.tags)) {
        img.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowerQuery)) score += 12;
          queryTerms.forEach(term => {
            if (tag.toLowerCase() === term) score += 15;
          });
        });
      }

      queryTerms.forEach(term => {
        if (img.title && img.title.toLowerCase().includes(term)) score += 5;
        if (img.description && img.description.toLowerCase().includes(term)) score += 2;
      });

      return { image: img, score };
    });

    const filtered = scored.filter(item => item.score > 0);
    filtered.sort((a, b) => b.score - a.score);

    if (lowerQuery) {
      ImageStorage.addSearchQuery(lowerQuery);
    }

    return filtered.map(item => item.image);
  },

  getSuggestions(partial) {
    if (!partial || partial.length < 2) return [];
    const lower = partial.toLowerCase();
    const images = ImageEngine.getAllImages();
    const suggestions = new Set();

    images.forEach(img => {
      if (img.title && img.title.toLowerCase().includes(lower)) {
        suggestions.add(img.title);
      }
      if (img.category && img.category.toLowerCase().includes(lower)) {
        suggestions.add(img.category);
      }
      if (img.tags) {
        img.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lower)) suggestions.add(tag);
        });
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }
};

