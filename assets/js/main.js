// --- HTMX & Supabase Data Functions ---

// After HTMX swaps in new content, determine which view has loaded.
document.body.addEventListener('htmx:afterSwap', (event) => {
  // For the Items view:
  if (document.getElementById('items-table')) {
    loadItems();
    attachAddItemFormListener();
  }
  // For the Stock In view:
  if (document.getElementById('stockin-items-list')) {
    loadStockInItems();
    attachStockInFormListener();
  }
});

// Function to load all items into the Items table (unchanged from before)
async function loadItems() {
  const { data, error } = await window.supabaseClient
    .from('items')
    .select('*');
  if (error) {
    console.error('Error fetching items:', error);
    return;
  }
  const tbody = document.getElementById('items-table-body');
  tbody.innerHTML = ''; // Clear any existing rows
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.unit}</td>
      <td>${item.cost_price}</td>
      <td>${item.selling_price}</td>
      <td>${item.category}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Attach the submission listener for the "Add New Item" form.
function attachAddItemFormListener() {
  const form = document.getElementById('add-item-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const newItem = {
        name: formData.get('name'),
        unit: formData.get('unit'),
        cost_price: parseFloat(formData.get('cost_price')),
        selling_price: parseFloat(formData.get('selling_price')),
        category: formData.get('category')
      };

      const { error } = await window.supabaseClient
        .from('items')
        .insert(newItem);
      if (error) {
        alert("Error adding item: " + error.message);
      } else {
        alert("Item added successfully!");
        form.reset();
        loadItems(); // Refresh the table with the new item
      }
    });
  }
}

// --- Stock In Functions ---

// Load available items (id and name) into the Stock In view.
function loadStockInItems() {
  window.supabaseClient
    .from('items')
    .select('id, name')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching items for stock-in:', error);
        return;
      }
      const container = document.getElementById('stockin-items-list');
      container.innerHTML = ''; // Clear container
      data.forEach(item => {
        // For each item, create a label and a number input for quantity.
        const div = document.createElement('div');
        div.classList.add('stockin-item');
        div.innerHTML = `
          <label for="item-${item.id}">${item.name}</label>
          <input type="number" id="item-${item.id}" name="item-${item.id}" placeholder="Quantity" min="0" value="0">
        `;
        container.appendChild(div);
      });
    });
}


// Attach the submission listener for the Stock In form.
function attachStockInFormListener() {
  const form = document.getElementById('stockin-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const itemsAdded = [];
      // Iterate over all form entries; keys are in the format "item-<id>"
      for (let [key, value] of formData.entries()) {
        if (key.startsWith('item-')) {
          const quantity = parseFloat(value);
          if (quantity > 0) {
            const id = key.replace('item-', '');
            itemsAdded.push({ id: parseInt(id), quantity });
          }
        }
      }
      if (itemsAdded.length === 0) {
        alert("Please enter quantity for at least one item.");
        return;
      }
      const { error } = await window.supabaseClient
        .from('restock')
        .insert([{ items_added: itemsAdded }]);
      if (error) {
        console.error('Error inserting restock record:', error);
        alert("Error adding stock-in: " + (error.message || JSON.stringify(error)));
      } else {
        alert("Stock-in recorded successfully!");
        form.reset();
        // Reload the items list in the Stock In view to reset the quantities.
        loadStockInItems();
      }
    });
  }
}

// --- Service Worker Registration for PWA ---
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

document.addEventListener('DOMContentLoaded', () => {
    // Add this debug code
    document.body.addEventListener('click', (e) => {
        console.log('Click detected on:', e.target);
    });

    // Test HTMX loading
    console.log('HTMX loaded:', typeof htmx !== 'undefined');
    
    // Ensure HTMX is loaded before making any AJAX calls
    if (typeof htmx !== 'undefined') {
        // Optional: Enable HTMX logging during development
        // htmx.logAll();
        
        // Load default view (sales) only if content section exists
        const contentSection = document.getElementById('content');
        if (contentSection) {
            htmx.ajax('GET', '/views/sales.html', '#content');
        }
    } else {
        console.error('HTMX is not loaded properly');
    }

    // Theme switcher
    const themeController = document.querySelector('.theme-controller');
    if (themeController) {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeController.checked = savedTheme === 'dark';

        // Add event listener with immediate effect
        themeController.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

// HTMX loading indicator
htmx.config.indicator = '.htmx-indicator';

// Update the current view title when content changes
document.body.addEventListener('htmx:afterSwap', (event) => {
    const currentViewElement = document.getElementById('current-view');
    if (!currentViewElement) return;
    
    // Extract view name from the request path
    const path = event.detail.requestConfig?.path;
    if (!path) return;
    
    // Get the view name from the path and capitalize it
    const viewName = path
        .split('/')
        .pop()
        .replace('.html', '')
        .charAt(0)
        .toUpperCase() + 
        path
        .split('/')
        .pop()
        .replace('.html', '')
        .slice(1);
    
    currentViewElement.textContent = viewName;
});

// Debug logging during development
htmx.logAll();

// Add loading indicator handlers
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