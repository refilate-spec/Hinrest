// Independent Sharing Engine & Web Share API handler
export const ImageShare = {
  async shareImage(image) {
    const shareData = {
      title: image.title || 'FORMA Visual Discovery',
      text: image.description || 'Discovered on FORMA — Premium Visual Discovery Ecosystem.',
      url: image.destinationUrl || `${window.location.origin}${window.location.pathname}#image=${image.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
    
    // Fallback to clipboard
    return this.copyToClipboard(shareData.url);
  },

  copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
      window.dispatchEvent(new CustomEvent('forma:toast', { detail: { message: 'Link copied to clipboard!' } }));
      return true;
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      window.dispatchEvent(new CustomEvent('forma:toast', { detail: { message: 'Failed to copy link.' } }));
      return false;
    });
  }
};

