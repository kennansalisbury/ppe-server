const MONGOOSE = require('mongoose')
const DB = require('../../models')

let data = [
    {
        name: 'Mask', 
    }, 
    {
        name: 'Gown',
    }, 
    {
        name: 'Face Shield',
    }]

console.log(data)
// DB.Product.create(data).then(console.log('products seeded'))