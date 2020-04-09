// dependencies
const MONGOOSE = require('mongoose');
// schema
const inventorySchema = new MONGOOSE.Schema({
    product: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    total_units: {
        type: Number,
        required: [true, 'Must include product inventory quantity']
    },
    maker: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Maker'
    },
    total_inventory_to_date: Number
});

module.exports = MONGOOSE.model('Inventory', inventorySchema);