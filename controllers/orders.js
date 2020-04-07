const DB = require('../models');
const ROUTER = require('express').Router();

//GET /orders - view all orders (admin, steering team and team leads only)
ROUTER.get('/', (req, res) => {

    //if admin or steering team or team lead: view all info
    if(req.user.adminPermissions || req.user.viewAllPermissions || req.user.teamLead){
        DB.Order.find()
        .populate('customer')
        .populate('organization')
        .populate('driver')
        .populate('productOrderDetails.product')
        .populate('productionDetails.maker')
        .populate('productionDetails.product')
        .then(orders => {
            res.send(orders)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }
    
    //if maker, driver or customer - view specific info
    else if(req.user.maker || req.user.driver || req.user.customer) {
        DB.Order.find({
            $or: [
                {customer: req.user._id},
                {driver: req.user._id},
                {'productionDetails.maker': req.user._id}
            ]
        })
        .populate('customer')
        .populate('organization')
        .populate('driver')
        .populate('productOrderDetails.product')
        .populate('productionDetails.maker')
        .populate('productionDetails.product')
        .then(orders => {

            let data
            //if driver or maker
            if(req.user.maker || req.user.driver) {
                data = orders.map(order => {

                    //first map production details necessary to send back
                    let productionDetails
                    order.productionDetails ? productionDetails = order.productionDetails.map(detail => {
                        return({
                                maker: {
                                    name: detail.maker.firstName,
                                    email: detail.maker.email,
                                    address: detail.maker.maker.address,
                                    city: detail.maker.maker.city,
                                    state: detail.maker.maker.state,
                                    zipcode: detail.maker.maker.zipcode,
                                },
                                product: detail.product.name,
                                toBeFulfilledQty: detail.toBeFulfilledQty,
                                needHelp: detail.needHelp
                               })
                    }) : null 

                    //then map data to return back

                    return({
                        orderNumber: order.orderNumber,
                        productionDetails: productionDetails,
                        driver: order.driver ? {
                            firstName: order.driver.firstName,
                            email: order.driver.email
                        } : null,
                        customer: {
                            firstName: order.customer.firstName,
                            email: order.customer.email,
                            orgAffiliation: order.customer.customer.orgAffiliation
                        },
                        organization: {
                            name: order.organization.name,
                            address: order.organization.address,
                            city: order.organization.city,
                            state: order.organization.state,
                            zipcode: order.organization.zipcode

                        },
                        readyForDelivery: order.readyForDelivery,
                        collected: order.collected,
                        delivered: order.delivered,
                        orgReceived: order.orgReceived
                    })
                })
            }

            //if customer
            else {
                data = orders.map(order => {
                    return({
                        orderNumber: order.orderNumber,
                        productOrderDetails: order.productOrderDetails,
                        driver: order.driver ? {
                            firstName: order.driver.firstName,
                            email: order.driver.email
                        } : null,
                        customer: {
                            firstName: order.customer.firstName,
                            email: order.customer.email,
                            orgAffiliation: order.customer.customer.orgAffiliation
                        },
                        organization: {
                            name: order.organization.name,
                            address: order.organization.address,
                            city: order.organization.city,
                            state: order.organization.state,
                            zipcode: order.organization.zipcode
                        },
                        readyForDelivery: order.readyForDelivery,
                        collected: order.collected,
                        delivered: order.delivered,
                        orgReceived: order.orgReceived,
                        withdrawRQ: order.withdrawRQ,
                        createdAt: order.createdAt,
                        updatedAt: order.updatedAt
                    })
          
                })
            }
          res.send(data)
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

})

//PUT /:id - edit order details
ROUTER.put('/:id', (req, res) => {

    //if admin, can make updates to any order details
    if(req.user.adminPermissions) {
        DB.Order.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(updatedOrder => {
            res.send(updatedOrder)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }

    //if team lead can make updates to assigned driver, production details/makers etc., qty to be fulfilled, and order status items
    if(req.user.teamLead){
        DB.Order.findByIdAndUpdate(
            req.params.id, 
            {
                driver: req.body.driver, 
                productionDetails: req.body.productionDetails, 
                "productOrderDetails.toBeFulfilledQty": req.body.toBeFulfilledQty,
                collected: req.body.collected,
                delivered: req.body.delivered,
                readyForDelivery: req.body.readyForDelivery
            }, 
            {new: true}
        )
        .then(updatedOrder => {
            res.send(updatedOrder)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }

    // if driver can make updates to order status - collected/delivered
    if(req.user.driver) {
        DB.Order.findByIdAndUpdate(
            req.params.id, 
            {
                collected: req.body.collected,
                delivered: req.body.delivered,
            }, 
            {new: true}
        )
        .then(updatedOrder => {
            res.send(updatedOrder)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }
    // if customer can make updates to: 
        //status updates - org received, withdrawRQ,
        // qty requested (if inventory not collected yet)

    if(req.user.customer) {
        DB.Order.findByIdAndUpdate(
            req.params.id, 
            {
                productOrderDetails: {
                    orgRequestQty: req.body.orgRequestQty
                },
                withdrawRQ: req.body.withdrawRQ,
                orgReceived: req.body.orgReceived
            }, 
            {new: true}
        )
        .then(updatedOrder => {
            res.send(updatedOrder)
        })
        .catch(err => {
            console.log('Error finding orders', err)
            res.status(503).send({message: 'Internal server error'})
        })

    }

    if(!req.user.customer && !req.user.driver && !req.user.teamLead && !req.user.adminPermissions) {
        res.status(403).send({message: 'Forbidden'})
    }
})

//GET /orders/demand - demand numbers available to everyone (not protected)
ROUTER.get('/demand', (req, res) => {
    DB.Order.find({delivered: false, orgReceived: false})
    .populate('organization')
    .populate('productOrderDetails.product')
    .then(orders => {
        let data = orders.map(order => {
            console.log(order)
            return ({
                product: order.productOrderDetails.product.name,
                demand: order.productOrderDetails.orgRequestQty,
                organization: order.organization.name
            })
        })
        res.send(data)
    })
    .catch(err => {
        console.log('Error finding customers', err)
        res.status(503).send({message: 'Internal server error'})
    })

})



module.exports = ROUTER;