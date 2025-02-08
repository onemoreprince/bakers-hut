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
                            hx-get="/views/partials/item-form.html?id=${item.id}"
                            hx-target="#modal-content"
                            onclick="window.modal.showModal()">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-ghost text-error"
                            hx-delete="/api/items/${item.id}"
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

// Export the handlers
module.exports = {
    handleItemSearch,
    handleItemFilter
}; 