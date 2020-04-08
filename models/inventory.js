// dependencies
const MONGOOSE = require('mongoose');
// schema
const inventorySchema = new MONGOOSE.Schema({
    product_name: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    total_units: {
        type: Number,
        required: [true, 'Must include product inventory quantity']
    }
});

module.exports = MONGOOSE.model('Inventory', inventorySchema);