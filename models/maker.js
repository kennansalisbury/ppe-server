// dependencies
const MONGOOSE = require('mongoose');

//schema
const makerSchema = new MONGOOSE.Schema({
    address_one: {
        type: String,
        required: [true, 'address is required']
    },
    address_two: String,
    city: {
        type: String,
        required: [true, 'city is required']
    },
    state: {
        type: String,
        required: [true, 'state is required'],
        maxlength: [2, 'must be two letters']
    },
    inventory: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Inventory'
    },
    total_inventory_to_date: Number,
    is_team_lead: {
        type: Boolean,
        default: false
    }
})

module.exports = MONGOOSE.model('Maker', makerSchema);