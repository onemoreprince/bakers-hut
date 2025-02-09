const express = require('express');
const { handleItemSearch, handleItemFilter, handleItemSave } = require('./api/items');

const app = express();

// Parse JSON bodies
app.use(express.json());

// Items API routes
app.get('/api/items/search', handleItemSearch);
app.get('/api/items/filter', handleItemFilter);
app.post('/api/items', async (req, res) => {
    try {
        const result = await handleItemSave(req.body);
        const html = await loadItemsTable(); // This function is already defined in your api/items.js
        res.send(html);
    } catch (error) {
        res.status(500).send(`
            <div class="alert alert-error">
                Error saving item: ${error.message}
            </div>
        `);
    }
}); 