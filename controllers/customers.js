const DB = require('../models');
const ROUTER = require('express').Router();

//GET /customers - show all customers & organizations info - if admin
ROUTER.get('/', (req, res) => {
    if(!req.user.is_admin) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    DB.User.find({customer: {$exists: true}})
    .populate({
        path: 'customer',
        populate: {
            path: 'orders',
            populate: {path: 'item.product'}
        }
    })
    .then(customers => {
        res.send(customers)
    })
    .catch(err => {
        console.log('Error finding customers', err)
        res.status(503).send({message: 'Internal server error'})
    })
})









//NOT UPDATED/NOT NEEDED FOR V1(I DONT THINK)


//GET /customers/:id - show 1 customer info (customer should be only one to need this route)
ROUTER.get('/:id', (req, res) => {
    if(!req.user.customer){
        res.status(403).send({message: 'Forbidden'})
        return
    }

    DB.User.findById(req.params.id)
    .populate('orders')
    .then(user => {
        res.send(user)
    })
    .catch(err => {
        console.log('Error finding customer', err)
        res.status(503).send({message: 'Internal server error'})
    })
})


//PUT /customers/:id - update 1 customer info (customer should be only one to need this route)
ROUTER.put('/:id', (req, res) => {
    if(!req.user.customer){
        res.status(403).send({message: 'Forbidden'})
        return
    }

    DB.User.findByIdAndUpdate(req.params.id, req.body, {new: true})
    .then(updatedUser => {
        res.send(updatedUser)
    })
    .catch(err => {
        console.log('Error updating customer', err)
        res.status(503).send({message: 'Internal server error'})
    })
})



module.exports = ROUTER;