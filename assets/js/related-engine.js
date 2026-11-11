// Relevance Scoring Engine for Related Image Discovery
import { ImageEngine } from './image-engine.js';

export const RelatedEngine = {
  getRelatedImages(currentImage, limit = 4) {
    const allImages = ImageEngine.getAllImages().filter(img => img.id !== currentImage.id);
    
    const scored = allImages.map(img => {
      let score = 0;
      
      // 1. Explicit relatedIds match (+15 points)
      if (currentImage.relatedIds && currentImage.relatedIds.includes(img.id)) {
        score += 15;
      }

      // 2. Category match (+10 points)
      if (currentImage.category && img.category && currentImage.category.toLowerCase() === img.category.toLowerCase()) {
        score += 10;
      }

      // 3. Tag intersection (+4 points per matching tag)
      if (currentImage.tags && img.tags) {
        const matchingTags = currentImage.tags.filter(tag => 
          img.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
        );
        score += matchingTags.length * 4;
      }

      // 4. Keyword / Title similarity
      if (currentImage.title && img.title) {
        const currentWords = currentImage.title.toLowerCase().split(/\s+/);
        const imgWords = img.title.toLowerCase().split(/\s+/);
        const commonWords = currentWords.filter(w => w.length > 3 && imgWords.includes(w));
        score += commonWords.length * 2;
      }

      return { image: img, score };
    });

    // Sort by score descending, with a fallback randomization for low scores to keep discovery fresh
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return Math.random() - 0.5;
    });

    return scored.slice(0, limit).map(item => item.image);
  }
};

