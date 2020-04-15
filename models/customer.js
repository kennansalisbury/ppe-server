// dependencies
const MONGOOSE = require('mongoose');

//schema
const customerSchema = new MONGOOSE.Schema({
    organization: {
        type: String,
        required: [true, 'organization name required']
    },
    address_one: {
        type: String,
        required: [true, 'organization address required']
    },
    address_two: String,
    city: {
        type: String,
        required: [true, 'organization city required']
    },
    state: {
        type: String,
        required: [true, 'organization state required']
    },
    num_of_employees: {
        type: Number,
        required: [true, 'number of employees required']
    },  
    orders: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    org_affiliation: {
        type: String,
        required: [true, 'affiliation to organization is required']
    },
    org_type: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'OrgType'
    }
})

module.exports = MONGOOSE.model('Customer', customerSchema);