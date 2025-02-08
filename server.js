const express = require('express');
const { handleItemSearch, handleItemFilter } = require('./api/items');

const app = express();

// Items API routes
app.get('/api/items/search', handleItemSearch);
app.get('/api/items/filter', handleItemFilter); 