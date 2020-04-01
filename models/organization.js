// dependencies
const MONGOOSE = require('mongoose');
// schema
const organizationSchema = new MONGOOSE.Schema({
    name: {
        type: String,
        required: [true, 'organization name required']
    },
    address: {
        type: [String],
        required: [true, 'organization address required']
    },
    city: {
        type: String,
        required: [true, 'organization city required']
    },
    state: {
        type: String,
        required: [true, 'organization state required']
    },
    zipcode: {
        type: String,
        required: [true, 'organization zipcode required']
    },
    numberOfEmployees: {
        type: Number,
        required: [true, 'number of employees required']
    },
    customer: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    },  
    laundryCapable: Boolean
});

module.exports = MONGOOSE.model('Organization', organizationSchema);