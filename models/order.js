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
    orderNumber: {
        type: Number,
        required: true
    },
    productOrderDetails: productOrderDetailsSchema,
    productionDetails: [productionDetailsSchema],
    driver: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    },
    customer: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    },
    organization: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    readyForDelivery: {
        type: Boolean,
        default: false
    },
    collected: {
        type: Boolean,
        required: [true, 'collection status required'],
        default: false
    },
    delivered: {
        type: Boolean,
        required: [true, 'delivery status required'],
        default: false
    },
    orgReceived: {
        type: Boolean,
        required: [true, 'collection status required'],
        default: false
    },
    withdrawRQ: {
        type: Boolean,
        required: [true, 'delivery status required'],
        default: false
    },
    timestamps: Date
});

module.exports = MONGOOSE.model('Order', orderSchema);