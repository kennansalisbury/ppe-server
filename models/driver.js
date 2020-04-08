// dependencies
const MONGOOSE = require('mongoose');

//schema
const driverSchema = new MONGOOSE.Schema({
    orders: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Order'
    }]
})

module.exports = MONGOOSE.model('Driver', driverSchema);