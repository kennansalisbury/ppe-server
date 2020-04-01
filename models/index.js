const MONGOOSE = require('mongoose')

MONGOOSE.connect(process.env.MONGODB_URI || 'mongodb://localhost/sew_strong', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

module.exports.User = require('./user')
module.exports.Organization = require('./organization')
module.exports.Product = require('./product')
module.exports.Order = require('./order')