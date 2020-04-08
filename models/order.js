// dependencies
const MONGOOSE = require('mongoose');
// schema
const productOrderDetailsSchema = new MONGOOSE.Schema({
    product: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    orgRequestQty: Number,
    toBeFulfilledQty: Number
})

const productionDetailsSchema = new MONGOOSE.Schema({
    maker: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    toBeFulfilledQty: Number,
    needHelp: {
        type: Boolean,
        default: false
    }
})

const orderSchema = new MONGOOSE.Schema({
    customer: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    },
    accepted: {
        type: Boolean,
        required: [true, 'in_progress status required'],
        default: false
    },
    in_progress: {
        type: Boolean,
        required: [true, 'in_progress status required'],
        default: false
    },
    ready_for_delivery: {
        type: Boolean,
        required: [true, 'ready_for_delivery status required'],
        default: false
    },
    in_delivery: {
        type: Boolean,
        required: [true, 'in_delivery status required'],
        default: false
    },
    completed: {
        type: Boolean,
        required: [true, 'completed status required'],
        default: false
    },
    completed_confirmed: {
        type: Boolean,
        required: [true, 'completed_confirmed status required'],
        default: false
    },
    cust_cancelled: {
        type: Boolean,
        required: [true, 'cust_cancelled status required'],
        default: false
    },
    admin_cancelled: {
        type: Boolean,
        required: [true, 'admin_cancelled status required'],
        default: false
    },
    item: {
        product: {
            type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product'
        },
        total: Number
    },
    drivers: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    }],
    makers: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    }]
},{
    timestamps: true
});

module.exports = MONGOOSE.model('Order', orderSchema);