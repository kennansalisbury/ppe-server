const DB = require('../models');
const ROUTER = require('express').Router();

//GET  /products - All products
ROUTER.get('/', (req, res) => {
    DB.Product.find().then(products => res.send(products))
    .catch(err => {
        console.log('Error finding products', err)
        res.status(503).send('Internal server error')
    })
})


//POST /products - Create new product (admin only)
ROUTER.post('/', (req, res) => {
    
    if(req.user.adminPermissions) {

        DB.Product.create(req.body)
        .then(product => res.send({message: `${product.name} : ${product.startDate}`}))
        .catch(err => {
            console.log('Error creating product', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }
    else {
        res.status(403).send({message: 'Forbidden'})
    }
   
})

module.exports = ROUTER;