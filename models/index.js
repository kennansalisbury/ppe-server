const MONGOOSE = require('mongoose')

MONGOOSE.connect(process.env.MONGODB_URI || 'mongodb://localhost/sew_strong', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

module.exports.User = require('./user')
module.exports.Maker = require('./maker')
module.exports.Driver = require('./driver')
module.exports.Customer = require('./customer')
module.exports.Product = require('./product')
module.exports.Inventory = require('./inventory')
module.exports.Order = require('./order')
module.exports.OrgType = require('./orgType')