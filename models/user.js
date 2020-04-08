// dependencies
const BCRYPT = require('bcryptjs');
const MONGOOSE = require('mongoose');

// user schema
const userSchema = new MONGOOSE.Schema({
    first_name: {
        type: String,
        required: [true, 'first name required']
    },
    last_name: String,
    email: {
        type: String,
        required: [true, 'email required']
    },
    password: {
        type: String,
        required: [true, 'password required'],
        minlength: [8, 'password must be a minimum of 8 characters']
    },
    phone: {
        type: Number,
        required: [true, 'phone number required'],
        minlength: [10, 'phone number must be 10 digits'],
        maxlength: [10, 'phone number must be 10 digits']
    },
    zipcode: {
        type: Number,
        required: [true, 'zipcode required'],
        minlength: [5, 'zipcode must be minimum 5 digits'],
        maxlength: [9, 'zipcode can be no longer than 9 digits']
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    region: String,
    maker: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Maker'
    },
    driver: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Driver'
    },
    customer: {
        type: MONGOOSE.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    other: String
}, {
    timestamps: true
});


// hash password with bcrypt
userSchema.pre('save', function(next) {
    if(this.isNew) {
        this.password = BCRYPT.hashSync(this.password, 12)
    }
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