# FORMA — Premium Visual Discovery Ecosystem

FORMA is an independent, premium visual discovery web application inspired by Pinterest's masonry presentation, image exploration, and continuous discovery experience, built with pure vanilla web technologies.

## Tech Stack

- **HTML5 & CSS3**
- **Tailwind CSS (v4)**
- **Vanilla JavaScript (ES6+ Modules)**
- **Intersection Observer API**
- **Native Web Share API**
- **LocalStorage Persistence**

## Architecture

- `index.html`: Main shell, hero section, responsive navigation, and container grids.
- `assets/css/custom.css`: CSS columns masonry layout, dark/light theme variables, and zoom transitions.
- `assets/js/image-engine.js`: Loads default and user-added custom image databases.
- `assets/js/masonry-engine.js`: Handles card rendering and hover states.
- `assets/js/image-router.js`: Manages modal routing, pinch/click zoom, and detail views.
- `assets/js/image-share.js`: Web Share API integration & clipboard fallback.
- `assets/js/related-engine.js`: Scoring algorithm for related image recommendations.
- `assets/js/discovery-feed.js`: Infinite scrolling, Intersection Observer, and batch rendering.
- `assets/js/search-engine.js`: Intelligent client-side keyword search & suggestions.
- `assets/js/image-storage.js`: LocalStorage state manager for saved collections and custom uploads.

## Running Locally

Simply serve the root directory using any static file server (e.g. Live Server in VS Code, Python HTTP server, or static hosting on GitHub/Cloudflare Pages).
