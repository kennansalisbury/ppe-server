// dependencies
const MONGOOSE = require('mongoose');

//schema
const driverSchema = new MONGOOSE.Schema({
    orders: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    distance_willing_to_drive: Number,
    days_available: [String],
    times_available: [String]
})

module.exports = MONGOOSE.model('Driver', driverSchema);