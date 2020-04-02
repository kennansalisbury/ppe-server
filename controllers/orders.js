const DB = require('../models');
const ROUTER = require('express').Router();

//GET /orders - view all orders (admin, steering team and team leads only)
ROUTER.get('/', (req, res) => {
    if(!req.user.adminPermissions && !req.user.viewAllPermissions && !req.user.teamLead){
        res.status(403).send({message: 'Forbidden'})
        return
    }

    DB.Order.find()
    .populate('productOrderDetails.product')
    .populate('productionDetail.maker')
    .populate('productionDetail.product')
    .populate('driver')
    .populate('customer')
    .then(orders => {
        res.send(orders)
    })
    .catch(err => {
        console.log('Error finding orders', err)
        res.status(503).send({message: 'Internal server error'})
    })

})

module.exports = ROUTER;