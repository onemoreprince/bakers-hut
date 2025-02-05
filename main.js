/* main.js */

// Replace with your own Supabase project credentials
const SUPABASE_URL = 'https://tejxhpolghqoudmldqnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlanhocG9sZ2hxb3VkbWxkcW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTMwNTksImV4cCI6MjA1NDI2OTA1OX0.IrCv-9pCAJ4AUqsvYVNkxogP7xkvY4iSRfNCrxz9WfA';


// Initialize the Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Authentication (Magic Link Login) ---

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const { error } = await supabaseClient.auth.signInWithOtp({ email });
    if (error) {
      loginMessage.textContent = error.message;
    } else {
      loginMessage.textContent = 'Magic link sent! Please check your email.';
    }
  });

  // Check if a session already exists
  supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      onUserLoggedIn();
    }
  });

  // Listen for auth state changes (e.g. after clicking the magic link)
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
      onUserLoggedIn();
    } else {
      document.getElementById('auth-section').style.display = 'block';
    }
  });
});

// Called when the user is logged in: hide the login section and auto‑load the Items tab.
function onUserLoggedIn() {
  document.getElementById('auth-section').style.display = 'none';
  // Auto‑load the Items view by “clicking” the button programmatically.
  document.getElementById('items-tab').click();
}

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
  const { data, error } = await supabaseClient
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

// Attach the submission listener for the “Add New Item” form.
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

      const { error } = await supabaseClient
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
  supabaseClient
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
      const { error } = await supabaseClient
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
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope: ', registration.scope);
      }).catch(err => {
        console.error('Service Worker registration failed: ', err);
      });
  });
}
