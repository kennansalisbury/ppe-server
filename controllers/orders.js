const DB = require('../models');
const ROUTER = require('express').Router();

//helper functions
const errorCatch = require('../errorCatch') 

//GET /orders - view all orders (admin only)
ROUTER.get('/', (req, res) => {

    //if admin: view all info
    if(req.user.is_admin){
        DB.Order.find()
        .populate({
            path: 'customer',
            populate: {
                path: 'customer'
            }
        })
        .populate('item.product')
        .populate('drivers')
        .populate({
            path: 'makers',
            populate: {
                path: 'maker',
                populate: {
                    path: 'inventory',
                    populate: {path: 'product'}
                }
            }
        })
        .then(orders => {
            res.send(orders)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }
    else {
        res.status(403).send({message: 'Forbidden'})
        return
    }
    
    //OLD CODE - TO BE UPDATED
    // //if maker, driver or customer - view specific info
    // else if(req.user.maker || req.user.driver || req.user.customer) {
    //     DB.Order.find({
    //         $or: [
    //             {customer: req.user._id},
    //             {driver: req.user._id},
    //             {'productionDetails.maker': req.user._id}
    //         ]
    //     })
    //     .populate('customer')
    //     .populate('organization')
    //     .populate('driver')
    //     .populate('productOrderDetails.product')
    //     .populate('productionDetails.maker')
    //     .populate('productionDetails.product')
    //     .then(orders => {

    //         let data
    //         //if driver or maker
    //         if(req.user.maker || req.user.driver) {
    //             data = orders.map(order => {

    //                 //first map production details necessary to send back
    //                 let productionDetails
    //                 order.productionDetails ? productionDetails = order.productionDetails.map(detail => {
    //                     return({
    //                             maker: {
    //                                 name: detail.maker.firstName,
    //                                 email: detail.maker.email,
    //                                 address: detail.maker.maker.address,
    //                                 city: detail.maker.maker.city,
    //                                 state: detail.maker.maker.state,
    //                                 zipcode: detail.maker.maker.zipcode,
    //                             },
    //                             product: detail.product.name,
    //                             toBeFulfilledQty: detail.toBeFulfilledQty,
    //                             needHelp: detail.needHelp
    //                            })
    //                 }) : null 

    //                 //then map data to return back

    //                 return({
    //                     orderNumber: order.orderNumber,
    //                     productionDetails: productionDetails,
    //                     driver: order.driver ? {
    //                         firstName: order.driver.firstName,
    //                         email: order.driver.email
    //                     } : null,
    //                     customer: {
    //                         firstName: order.customer.firstName,
    //                         email: order.customer.email,
    //                         orgAffiliation: order.customer.customer.orgAffiliation
    //                     },
    //                     organization: {
    //                         name: order.organization.name,
    //                         address: order.organization.address,
    //                         city: order.organization.city,
    //                         state: order.organization.state,
    //                         zipcode: order.organization.zipcode

    //                     },
    //                     readyForDelivery: order.readyForDelivery,
    //                     collected: order.collected,
    //                     delivered: order.delivered,
    //                     orgReceived: order.orgReceived
    //                 })
    //             })
    //         }

    //         //if customer
    //         else {
    //             data = orders.map(order => {
    //                 return({
    //                     orderNumber: order.orderNumber,
    //                     productOrderDetails: order.productOrderDetails,
    //                     driver: order.driver ? {
    //                         firstName: order.driver.firstName,
    //                         email: order.driver.email
    //                     } : null,
    //                     customer: {
    //                         firstName: order.customer.firstName,
    //                         email: order.customer.email,
    //                         orgAffiliation: order.customer.customer.orgAffiliation
    //                     },
    //                     organization: {
    //                         name: order.organization.name,
    //                         address: order.organization.address,
    //                         city: order.organization.city,
    //                         state: order.organization.state,
    //                         zipcode: order.organization.zipcode
    //                     },
    //                     readyForDelivery: order.readyForDelivery,
    //                     collected: order.collected,
    //                     delivered: order.delivered,
    //                     orgReceived: order.orgReceived,
    //                     withdrawRQ: order.withdrawRQ,
    //                     createdAt: order.createdAt,
    //                     updatedAt: order.updatedAt
    //                 })
          
    //             })
    //         }
    //       res.send(data)
    //     })
    //     .catch(err => {
    //         console.log('Error finding orders', err)
    //         res.status(503).send({message: 'Internal server error'})
    //     })
    // }

    // else {
    //     res.status(403).send({message: 'Forbidden'})
    //     return
    // }

})

//POST /orders (admin only for now)
ROUTER.post('/', (req, res) => {
    if(!req.user.is_admin && !req.user.customer) {
        res.status(403).send({message: 'Forbidden'})
    }

    //if req.body indicates user data, need to create new user & customer & order
    //else req.body will include existing customer id and will need to just create new order and push onto customer.orders

    if(req.body.user) {
        //FIRST check if user exists
        //if user already exists - prompt to choose from existing customers
    DB.User.findOne({email: req.body.user.email })
    .then(user => {
        // if user exists, error
        if (user) {
            return res.status(409).send({ message: 'Email already in use'});
        };

        //if new, create new customer THEN create user THEN create order - then populate user and send token
        DB.Customer.create(req.body.customer)
        .then(newCustomer => {
            console.log('new customer created', newCustomer)
            //create new user with ref to customer id
            DB.User.create({
                first_name: req.body.user.first_name,
                last_name: req.body.user.last_name,
                email: req.body.user.email,
                password: req.body.user.password,
                phone: req.body.user.phone,
                zipcode: req.body.user.zipcode,
                region: req.body.user.region,
                customer: newCustomer._id
            })
            .then(newUser => {
                console.log('new user created', newUser)  
                //create new order
                DB.Order.create({
                    customer: newCustomer._id,
                    item: req.body.item 
                })
                .then(order => {
                    //then add order id to customer
                    DB.Customer.findByIdAndUpdate(newCustomer._id, {orders: [order._id]}, {new: true})
                    .then(updatedCustomer => {
                        console.log('order added to customer', updatedCustomer)
                        res.send(order)
                    })
                    .catch(err => {
                        console.log('Error adding order to customer', err)
                        res.status(503).send({message: 'Internal server error'})
                    })

                })
                .catch(err => {
                    console.log('Error creating order', err)
                    res.status(503).send({message: 'Internal server error'})
                })
            })
            .catch(err => {
                console.log(`Error creating new user. ${err}`);
                res.status(500).send({ message: 'Internal server error.'})
            });  
        })
        .catch(err => {
            console.log(`Error creating new customer. ${err}`);
            res.status(503).send({ message: 'Internal server error.' })
        });  
    })
    .catch(err => {
        console.log('Error checking for email', err)
        res.status(503).send({message: 'Internal server error'})
    })

       
    }
    else {
         //create new order
         DB.Order.create(req.body)
         .then(order => {
            //then add order id to customer
            DB.Customer.findByIdAndUpdate(req.body.customer, {$push : {orders: order}}, {new: true})
            .then(updatedCustomer => {
                console.log('order added to customer', updatedCustomer)
                res.send(order)
            })
         
         })
         .catch(err => {
             console.log('Error creating order', err)
             res.status(503).send({message: 'Internal server error'})
         })
    }
    
})


//GET /orders/demand - demand numbers available to everyone (not protected)
ROUTER.get('/demand', (req, res) => {
    DB.Order.find({completed_confirmed: false, cust_cancelled: false, admin_cancelled: false})
    .populate('item.product')
    .populate({
        path: 'customer',
        populate: {
            path: 'customer'
        }
    })
    .then(orders => {
        let data = orders.map(order => {
            return ({
                product: order.item.product.name,
                demand: order.item.total,
                organization: order.customer.customer.organization
            })
        })
        res.send(data)
    })
    .catch(err => {
        console.log('Error finding customers', err)
        res.status(503).send({message: 'Internal server error'})
    })

})


//PUT /:id - edit order details
ROUTER.put('/:id', (req, res) => {

    //if admin, can make updates to any order details
    if(req.user.is_admin) {
        DB.Order.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(updatedOrder => {
            res.send(updatedOrder)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }

    else {
        res.status(403).send({message: 'Forbidden'})
    }
})


//DELETE /:id - delete an order (admin only)
ROUTER.delete('/:id', (req, res) => {
    
    if(!req.user.is_admin) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    //delete order
    DB.Order.findByIdAndDelete(req.params.id)
    .then(deletedOrder => {
        res.send(deletedOrder)
    })
    .catch(err => errorCatch(err, 'Error finding and deleting order', res, 503, 'Internal Server Error'))

    //remove from drivers accounts
    DB.Driver.updateMany({orders: req.params.id}, {$pull: {orders: req.params.id}})
    .then(drivers => {
        console.log('removed from drivers?', drivers)
    })
    .catch(err => errorCatch(err, 'Error finding and deleting order from driver', res, 503, 'Internal Server Error'))

    //remove from customers accounts
    DB.Customer.updateMany({orders: req.params.id}, {$pull: {orders: req.params.id}})
    .then(customers => {
        console.log('removed from customers?', customers)
    })
    .catch(err => errorCatch(err, 'Error finding and deleting order from customer', res, 503, 'Internal Server Error'))

})


module.exports = ROUTER;