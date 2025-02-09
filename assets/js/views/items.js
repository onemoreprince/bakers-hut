// Items view specific functions
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
        loadItems();
      }
    });
  }
}

// Instead of ES6 exports, attach to window
window.loadItems = async function() {
  // existing loadItems code
};

window.attachAddItemFormListener = function() {
  // existing attachAddItemFormListener code
};

// Initialize items view
async function initItemsView() {
  const itemsTable = document.getElementById('items-table');
  if (itemsTable) {
    const html = await loadItemsTable();
    itemsTable.innerHTML = html;
  }
}

// Handle item form submission
async function handleItemForm(form) {
  const formData = new FormData(form);
  const item = {
    name: formData.get('name'),
    unit: formData.get('unit'),
    cost_price: parseFloat(formData.get('cost_price')),
    selling_price: parseFloat(formData.get('selling_price')),
    item_category_id: parseInt(formData.get('item_category_id'))
  };

  const itemId = formData.get('id');
  if (itemId) {
    item.id = parseInt(itemId);
  }

  try {
    await handleItemSave(item);
    modal.close();
    initItemsView();
  } catch (error) {
    alert('Error saving item: ' + error.message);
  }
}

// Edit item handler
async function editItem(itemId) {
  const modal = document.getElementById('modal');
  const item = document.querySelector(`tr[data-item-id="${itemId}"]`).dataset.item;
  const parsedItem = JSON.parse(item);

  // Load the form
  await htmx.ajax('GET', './views/partials/item-form.html', '#modal-content');
  
  // Update form title
  document.getElementById('form-title').textContent = 'Edit Item';
  
  // Populate form fields
  document.getElementById('item-id').value = parsedItem.id;
  document.getElementById('item-name').value = parsedItem.name;
  document.getElementById('item-unit').value = parsedItem.unit;
  document.getElementById('item-cost-price').value = parsedItem.cost_price;
  document.getElementById('item-selling-price').value = parsedItem.selling_price;
  document.getElementById('item-category').value = parsedItem.item_category_id;

  modal.showModal();
}

// Load categories into form
async function loadCategoriesIntoForm() {
  const categorySelect = document.getElementById('item-category');
  if (categorySelect) {
    try {
      const categories = await loadCategories();
      categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
      ).join('');
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
}

// Attach to window for global access
window.initItemsView = initItemsView;
window.handleItemForm = handleItemForm;
window.editItem = editItem;
window.loadCategoriesIntoForm = loadCategoriesIntoForm; 