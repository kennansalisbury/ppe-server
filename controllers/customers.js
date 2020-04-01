const DB = require('../models');
const ROUTER = require('express').Router();

//GET /customers - show all customers & organizations info - if admin, steering team, or team lead
ROUTER.get('/', (req, res) => {
    if(!req.user.adminPermissions && !req.user.viewAllPermissions && !req.user.teamLead) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    DB.User.find({customer: {$exists: true}})
    .populate('orders')
    .populate('customer.organization')
    .then(customers => {
        res.send(customers)
    })
    .catch(err => {
        console.log('Error finding customers', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

//GET /customers/demand - demand numbers available to everyone (not protected)
ROUTER.get('/demand', (req, res) => {
    DB.User.find({customer: {$exists: true}})
    .populate('orders')
    .then(customers => {
        //grab orders
        let customersWithOrders = customers.filter(customer => customer.orders)
        let orders = customersWithOrders.map(customer => customer.orders)
        
        //filter out orders not completed (!delivered)
        let inProgressOrders = orders.filter(order => !order.delivered)

        //return demand numbers
        let data = inProgressOrders.map(order => order.productOrderDetails)
        res.send(data)
    })
    .catch(err => {
        console.log('Error finding customers', err)
        res.status(503).send({message: 'Internal server error'})
    })

})

//GET /customers/:id - show 1 customer info (customer should be only one to need this route)



//GET /customers/:id - update 1 customer info (customer should be only one to need this route)




module.exports = ROUTER;