const MONGOOSE = require('mongoose')

MONGOOSE.connect(process.env.MONGODB_URI || 'mongodb://localhost/sew_strong', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

module.exports.User = require('./user')
module.exports.Clinic = require('./organization')
module.exports.Product = require('./product')
module.exports.ProductOrder = require('./order')