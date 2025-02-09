// Replace the import statements with regular function references
document.body.addEventListener('htmx:afterSwap', (event) => {
  if (document.getElementById('items-table')) {
    window.loadItems();
    window.attachAddItemFormListener();
    window.initItemsView();
  }
  if (document.getElementById('stockin-items-list')) {
    window.loadStockInItems();
    window.attachStockInFormListener();
  }
  if (document.getElementById('item-category')) {
    window.loadCategoriesIntoForm();
  }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope: ', registration.scope);
            }).catch(err => {
                console.error('Service Worker registration failed: ', err);
            });
    });
}

// Theme switcher and other UI initialization
document.addEventListener('DOMContentLoaded', () => {
    // Debug logging
    document.body.addEventListener('click', (e) => {
        console.log('Click detected on:', e.target);
    });

    // Theme switcher
    const themeController = document.querySelector('.theme-controller');
    if (themeController) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeController.checked = savedTheme === 'dark';

        themeController.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

// HTMX configuration
htmx.config.indicator = '.htmx-indicator';

// Loading indicator handlers
document.body.addEventListener('htmx:beforeRequest', function(evt) {
    const indicator = document.querySelector('.htmx-indicator');
    if (indicator) {
        indicator.classList.remove('opacity-0');
        indicator.classList.add('opacity-100');
    }
});

document.body.addEventListener('htmx:afterRequest', function(evt) {
    const indicator = document.querySelector('.htmx-indicator');
    if (indicator) {
        indicator.classList.add('opacity-0');
        indicator.classList.remove('opacity-100');
    }
});

// Update current view title
document.body.addEventListener('htmx:afterSwap', function(evt) {
    const contentSection = evt.detail.target;
    if (contentSection.id === 'content') {
        const viewTitle = contentSection.querySelector('h2')?.textContent || '';
        document.getElementById('current-view').textContent = viewTitle;
    }
}); 