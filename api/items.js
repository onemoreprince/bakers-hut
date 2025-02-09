// Search items endpoint
async function handleItemSearch(req, res) {
    const searchQuery = req.query.q || '';

    try {
        const { data, error } = await window.supabaseClient
            .from('items')
            .select('*')
            .ilike('name', `%${searchQuery}%`);

        if (error) throw error;

        return res.send(renderItemsList(data));
    } catch (error) {
        console.error('Search error:', error);
        return res.send(renderError('Failed to search items'));
    }
}

// Filter items by category endpoint
async function handleItemFilter(req, res) {
    const category = req.query.value || '';

    try {
        let query = window.supabaseClient
            .from('items')
            .select('*');

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        return res.send(renderItemsList(data));
    } catch (error) {
        console.error('Filter error:', error);
        return res.send(renderError('Failed to filter items'));
    }
}

// Helper function to render items list
function renderItemsList(items) {
    if (!items.length) {
        return `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="alert alert-info">
                        No items found
                    </div>
                </td>
            </tr>
        `;
    }

    return items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>
                <div class="badge badge-ghost">${item.category}</div>
            </td>
            <td>${formatCurrency(item.price)}</td>
            <td>
                <div class="badge ${item.stock > 10 ? 'badge-success' : 'badge-warning'}">
                    ${item.stock}
                </div>
            </td>
            <td>
                <div class="flex gap-2">
                    <button class="btn btn-sm btn-ghost"
                            hx-get="./views/partials/item-form.html?id=${item.id}"
                            hx-target="#modal-content"
                            onclick="window.modal.showModal()">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-ghost text-error"
                            hx-delete="./api/items/${item.id}"
                            hx-confirm="Are you sure you want to delete this item?"
                            hx-target="#items-list">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Helper function to render error message
function renderError(message) {
    return `
        <tr>
            <td colspan="5">
                <div class="alert alert-error">
                    ${message}
                </div>
            </td>
        </tr>
    `;
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

async function loadItemsTable() {
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

    return html;
  } catch (error) {
    console.error('Error loading items:', error);
    return `
      <tr>
        <td class="text-error">Error loading items: ${error.message}</td>
      </tr>
    `;
  }
}

async function loadCategories() {
  const { data, error } = await window.supabaseClient
    .from('item_category')
    .select('*')
    .order('sequence');

  if (error) throw error;
  return data;
}

async function handleItemSave(item) {
  const { data, error } = await window.supabaseClient
    .from('items')
    .upsert(item)
    .select();

  if (error) throw error;
  return data;
}

// Export the handlers
module.exports = {
    handleItemSearch,
    handleItemFilter,
    loadItemsTable,
    loadCategories,
    handleItemSave
}; 