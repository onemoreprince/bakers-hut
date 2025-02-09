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
    try {
      // First get categories ordered by sequence
      const { data: categories, error: catError } = await window.supabaseClient
        .from('item_category')
        .select('*')
        .order('sequence');

      if (catError) throw catError;

      // Then get items with their categories
      const { data: items, error: itemError } = await window.supabaseClient
        .from('items')
        .select(`
          *,
          item_category:item_category_id (name)
        `)
        .order('name');

      if (itemError) throw itemError;

      // Group items by category
      const groupedItems = {};
      categories.forEach(cat => {
        groupedItems[cat.id] = items.filter(item => item.item_category_id === cat.id);
      });

      // Generate HTML
      let html = '';
      categories.forEach(category => {
        html += `
          <thead>
            <tr>
              <th>${category.name}</th>
            </tr>
          </thead>
          <tbody>
        `;

        const categoryItems = groupedItems[category.id] || [];
        if (categoryItems.length === 0) {
          html += `
            <tr>
              <td class="text-gray-500">No items in this category</td>
            </tr>
          `;
        } else {
          categoryItems.forEach(item => {
            html += `
              <tr class="hover:bg-base-300 cursor-pointer"
                  onclick="editItem(${item.id})"
                  data-item='${JSON.stringify(item)}'>
                <td>${item.name}</td>
              </tr>
            `;
          });
        }

        html += '</tbody>';
      });

      itemsTable.innerHTML = html;
    } catch (error) {
      console.error('Error loading items:', error);
      itemsTable.innerHTML = `
        <tr>
          <td class="text-error">Error loading items: ${error.message}</td>
        </tr>
      `;
    }
  }
}

// Edit item handler
async function editItem(itemId) {
  const modal = document.getElementById('modal');
  const itemRow = document.querySelector(`tr[onclick*="editItem(${itemId})"]`);
  const item = JSON.parse(itemRow.dataset.item);

  // Load the form
  await htmx.ajax('GET', './views/partials/item-form.html', '#modal-content');
  
  // Update form title
  document.getElementById('form-title').textContent = 'Edit Item';
  
  // Populate form fields
  document.getElementById('item-id').value = item.id;
  document.getElementById('item-name').value = item.name;
  document.getElementById('item-unit').value = item.unit;
  document.getElementById('item-cost-price').value = item.cost_price;
  document.getElementById('item-selling-price').value = item.selling_price;
  document.getElementById('item-category').value = item.item_category_id;

  modal.showModal();
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
    const { error } = await window.supabaseClient
      .from('items')
      .upsert(item);

    if (error) throw error;
    
    modal.close();
    initItemsView();
  } catch (error) {
    alert('Error saving item: ' + error.message);
  }
}

// Load categories into form
async function loadCategoriesIntoForm() {
  const categorySelect = document.getElementById('item-category');
  if (categorySelect) {
    try {
      const { data: categories, error } = await window.supabaseClient
        .from('item_category')
        .select('*')
        .order('sequence');

      if (error) throw error;
      
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