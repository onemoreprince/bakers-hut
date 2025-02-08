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