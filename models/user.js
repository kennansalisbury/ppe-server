// dependencies
const BCRYPT = require('bcryptjs');
const MONGOOSE = require('mongoose');

// embedded schema
const makerProductionSchema = new MONGOOSE.Schema({
    product: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    currentInventory: {
        type: Number,
        default: 0
    },
    producedToDate: {
        type: Number,
        default: 0
    },
    selfDelivery: {
        type: Boolean,
        default: false
    },
    pickUpDelivery: {
        type: Boolean,
        default: false
    }
})

const makerPledgeSchema = new MONGOOSE.Schema({
    product: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    pledgeQty: {
        type: Number,
        default: 0
    },
    pledgeGoal: {
        type: Date,
        required: [true, 'Pledge Goal Date is required']
    },
    readyForDelivery: {
        type: Boolean,
        default: false
    }
})

const makerSchema = new MONGOOSE.Schema({
    address: {
        type: String,
        required: [true, 'address is required']
    },
    city: {
        type: String,
        required: [true, 'city is required']
    },
    state: {
        type: String,
        required: [true, 'state is required'],
        maxlength: [2, 'must be two letters']
    },
    zipcode: {
        type: String,
        required: [true, 'zipcode is required'],
        minlength: [9, '9-digit zipcode required'],
        maxlength: [9, '9-digit zipcode required']
    },
    makerProduction: [makerProductionSchema],
    makerPledge: [makerPledgeSchema],
    teamLead: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    },
    needMaterials: {
        type: Boolean,
        default: false
    }
})

const driverSchema = new MONGOOSE.Schema({
    zipcode: {
        type: String,
        required: [true, 'zipcode is required'],
        minlength: [9, '9-digit zipcode required'],
        maxlength: [9, '9-digit zipcode required']
    },
    teamLead: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const teamLeadSchema = new MONGOOSE.Schema({
    address: {
        type: String,
        required: [true, 'address is required']
    },
    city: {
        type: String,
        required: [true, 'city is required']
    },
    state: {
        type: String,
        required: [true, 'state is required'],
        maxlength: [2, 'must be two letters']
    },
    zipcode: {
        type: String,
        required: [true, 'zipcode is required'],
        minlength: [9, '9-digit zipcode required'],
        maxlength: [9, '9-digit zipcode required']
    },
    volunteerRoster: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const customerSchema = new MONGOOSE.Schema({
    orgAffiliation: {
        type: String,
        required: [true, 'affiliation to organization is required']
    },
    organization: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Organization'
    }
})

// user schema
const userSchema = new MONGOOSE.Schema({
    firstName: {
        type: String,
        required: [true, 'first name required']
    },
    lastName: {
        type: String,
        required: [true, 'last name required']
    },
    username: {
        type: String,
        required: [true, 'username required']
    },
    password: {
        type: String,
        required: [true, 'password required'],
        minlength: [8, 'password must be a minimum of 8 characters']
    },
    email: {
        type: String,
        required: [true, 'email required']
    },
    phone: {
        type: String,
        required: [true, 'phone number required'],
        minlength: [10, 'please enter a valid phone number'],
        maxlength: [10, 'please enter a valid phone number']
    },
    maker: makerSchema,
    driver: driverSchema,
    teamLead: teamLeadSchema,
    customer: customerSchema,
    adminPermissions: {
        type: Boolean,
        default: false
    },
    viewAllPermissions: {
        type: Boolean,
        default: false
    },
    other: String,
    orders: [{
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Order'
    } ] 
});
// hash password with bcrypt
userSchema.pre('save', function(next) {
    this.password = BCRYPT.hashSync(this.password, 12)
    next()
});
// remove password from user object
userSchema.set('toJSON', {
    transform: (doc, user) => {
        delete user.password
        return user
    }
});
// helper function for password hash comparison
userSchema.methods.isAuthenticated = function(typedPassword) {
    return BCRYPT.compareSync(typedPassword, this.password)
};

module.exports = MONGOOSE.model('User', userSchema);