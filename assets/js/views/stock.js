async function loadStockInItems() {
    try {
        const { data: items, error: itemsError } = await window.supabaseClient
            .from('items')
            .select(`
                id,
                name,
                unit,
                item_category_id,
                item_category:item_category_id (name)
            `)
            .order('name');

        if (itemsError) throw itemsError;

        const container = document.getElementById('stockin-items-list');
        container.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>
                    <div class="badge badge-ghost">
                        ${item.item_category?.name || 'Uncategorized'}
                    </div>
                </td>
                <td>
                    <input type="number" 
                           id="item-${item.id}" 
                           name="item-${item.id}" 
                           class="input input-bordered w-24" 
                           min="0" 
                           value="0">
                </td>
            </tr>
        `).join('');

        loadRestockHistory();
    } catch (error) {
        console.error('Error loading stock items:', error);
    }
}

async function loadRestockHistory() {
    try {
        const { data: restocks, error } = await window.supabaseClient
            .from('restock')
            .select(`
                id,
                stock_added_at,
                items_added
            `)
            .order('stock_added_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        const tbody = document.getElementById('restock-history');
        if (!tbody) return;

        const { data: items } = await window.supabaseClient
            .from('items')
            .select('id, name');

        const itemsMap = new Map(items.map(item => [item.id, item.name]));

        tbody.innerHTML = restocks.map(restock => {
            const itemsSummary = restock.items_added
                .map(item => `${item.quantity} ${itemsMap.get(item.id) || 'Unknown Item'}`)
                .join(', ');

            const date = new Date(restock.stock_added_at);
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);

            return `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${itemsSummary}</td>
                    <td>${restock.items_added.length} items</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading restock history:', error);
        const tbody = document.getElementById('restock-history');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-error">
                        Failed to load restock history
                    </td>
                </tr>
            `;
        }
    }
}

function attachStockInFormListener() {
  const form = document.getElementById('stockin-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const itemsAdded = [];
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
        loadStockInItems();
      }
    });
  }
} 