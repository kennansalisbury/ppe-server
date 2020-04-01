const MONGOOSE = require('mongoose')
const DB = require('../../models')

let data = [
    {
        name: 'Mask', 
        startDate: new Date('March 20, 2020')
    }, 
    {
        name: 'Gown',
        startDate: new Date('April 1, 2020')
    }, 
    {
        name: 'Face Shield',
        startDate: new Date('March 25, 2020')
    }]


DB.Product.create(data).then(console.log('products seeded'))