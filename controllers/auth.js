// dependencies
require('dotenv').config();
const JWT = require('jsonwebtoken');
const DB = require('../models');
const ROUTER = require('express').Router();
const ASYNC = require('async')

// POST /auth/login
ROUTER.post('/login', (req, res) => {
    // check if email is in the system
    DB.User.findOne({ email: req.body.email})
    .populate({
        path: 'maker',
        populate: {
            path: 'inventory',
            populate: {path: 'product'}
        }
    })
    .populate({
        path: 'driver',
        populate: {path: 'orders'}
    })
    .populate({
        path: 'customer',
        populate: {path: 'orders'}
    })
    .then(user => {
        // confirm user and password exist
        if (!user || !user.password) {
            return res.status(404).send({ message: 'User not found.'});
        };
        // if user exists, check password
        if (!user.isAuthenticated(req.body.password)) {
            // invalid password, error
            return res.status(406).send({ message: 'Invalid credentials.'});
        };
        let token = JWT.sign(user.toJSON(), process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 8
        });
        res.send({ token });
    })
    .catch(err => {
        console.log(`Error in POST /auth/login. ${err}`);
        res.status(503).send({ message: 'Database error.'});
    });
});

// POST /auth/signup/volunteer - sign up for volunteer
ROUTER.post('/signup/volunteer', (req, res) => {

    // if email exists, user is already in the system. can create a failsafe for this
    DB.User.findOne({ email: req.body.email })
    .then(user => {
        // if user exists, error
        if (user) {
            return res.status(409).send({ message: 'Email already in use'});
        }
        // if not, create the user's account (maker, driver), then create a user and reference the new account
        if(req.headers['user-type'] === 'maker') {
            DB.Maker.create(req.body.maker)
            .then(newAccount => {
                let newInventories = []
                console.log('creating inventorys, right before async with req.body.inventory:', req.body.inventory)
                ASYNC.forEach(req.body.inventory, (product, done) => {
                    DB.Inventory.create({
                        product: product.product,
                        total_units: product.total_units,
                        total_inventory_to_date: product.total_inventory_to_date,
                        maker: newAccount._id
                    })
                    .then(newInventory => {
                        console.log('new inventory created', newInventory)
                        newInventories.push(newInventory)
                        done()
                    })
                    .catch(done)
                },
                //once all inventories created, add ids to maker and continue
                () => {
                    let inventoryIds = newInventories.map(inventory => inventory._id)
                    DB.Maker.findByIdAndUpdate(newAccount._id, {inventory: inventoryIds}, {new:true})
                    .then(updatedMaker => {
                        console.log('maker updated with inventorys', updatedMaker)
                        DB.User.create({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            password: req.body.password,
                            phone: req.body.phone,
                            zipcode: req.body.zipcode,
                            region: req.body.region,
                            other: req.body.other,
                            maker: updatedMaker._id
                        }) 
                        .then(user => {
                            DB.User.findById(user._id)
                            .populate({
                                path: 'maker',
                                populate: {
                                    path: 'inventory',
                                    populate: {path: 'product'}
                                }
                            })
                            .then(u => {
                                let token = JWT.sign(u.toJSON(), process.env.JWT_SECRET, {
                                    expiresIn: 120
                                });
                                res.send({ token });
                            })
                            .catch(err => {
                                console.log(`Error populating new user. ${err}`);
                                res.status(500).send({ message: 'Internal server error.'})
                            });
                        }) 
                        .catch(err => {
                            console.log(`Error creating new user. ${err}`);
                            res.status(500).send({ message: 'Internal server error.'})
                        });
                    })
                    .catch(err => {
                        console.log(`Error adding inventory to maker. ${err}`);
                        res.status(500).send({ message: 'Internal server error.'})
                    });
                })          
            })
            .catch(err => {
                console.log(`Error creating new maker account. ${err}`);
                res.status(500).send({ message: 'Internal server error.'})
            });
        }
        else if(req.headers['user-type'] === 'driver') {
            DB.Driver.create({orders: []})
            .then(newAccount => {
                DB.User.create({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    email: req.body.email,
                    password: req.body.password,
                    phone: req.body.phone,
                    zipcode: req.body.zipcode,
                    region: req.body.region,
                    other: req.body.other,
                    driver: newAccount._id
                }) 
                .then(user => {
                    let token = JWT.sign(user.toJSON(), process.env.JWT_SECRET, {
                        expiresIn: 120
                    });
                    res.send({ token });
                })
                .catch(err => {
                    console.log(`Error creating new user. ${err}`);
                    res.status(500).send({ message: 'Internal server error.'})
                });
            })
            .catch(err => {
                console.log(`Error creating new account. ${err}`);
                res.status(500).send({ message: 'Internal server error.'})
            }); 
        }
        else if(req.headers['user-type'] === 'maker+driver') { 
            DB.Driver.create({orders: []})
            .then(newDriverAccount => {
                DB.Maker.create(req.body.maker)
                .then(newMakerAccount => {
                    DB.User.create({
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email: req.body.email,
                        password: req.body.password,
                        phone: req.body.phone,
                        zipcode: req.body.zipcode,
                        region: req.body.region,
                        other: req.body.other,
                        maker: newMakerAccount._id,
                        driver: newDriverAccount._id
                    }) 
                    .then(user => {
                        DB.User.findById(user._id)
                        .populate('maker')
                        .then(u => {
                            let token = JWT.sign(u.toJSON(), process.env.JWT_SECRET, {
                                expiresIn: 120
                            });
                            res.send({ token });
                        })
                        .catch(err => {
                            console.log(`Error populating new user. ${err}`);
                            res.status(500).send({ message: 'Internal server error.'})
                        });
                    }) 
                    .catch(err => {
                        console.log(`Error creating new user. ${err}`);
                        res.status(500).send({ message: 'Internal server error.'})
                    });
                })
                .catch(err => {
                    console.log(`Error creating new account. ${err}`);
                    res.status(500).send({ message: 'Internal server error.'})
                });
            })
            .catch(err => {
                console.log(`Error creating new account. ${err}`);
                res.status(500).send({ message: 'Internal server error.'})
            }); 
        }
        else {
            DB.User.create(req.body)
            .then(user => {
                let token = JWT.sign(user.toJSON(), process.env.JWT_SECRET, {
                    expiresIn: 120
                });
                res.send({ token });
            })
            .catch(err => {
                console.log(`Error creating new user. ${err}`);
                res.status(500).send({ message: 'Internal server error.'})
            });
        }
    })
    .catch(err => {
        console.log(`Error in POST /auth/signup. ${err}`);
        res.status(503).send({ message: 'Database error checking email.' })
    });
});

//POST /auth/signup/order - sign up customer & place order request
ROUTER.post('/signup/order', (req, res) => {
    
    // res.send('test')
    //FIRST check if user exists
        //if user already exists - prompt to log in and place order from there
    
    //if new, create new customer THEN create user THEN create order - then populate user and send token
    
    //check user email and username for existing in database
    DB.User.findOne({email: req.body.email })
    .then(user => {
        // if user exists, error
        if (user) {
            return res.status(409).send({ message: 'Email or username already in use'});
        };
        //else, create new customer
        DB.Customer.create(req.body.customer)
        .then(newCustomer => {
            console.log('new customer created', newCustomer)
            //create new user
            DB.User.create({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                zipcode: req.body.zipcode,
                region: req.body.region,
                customer: newCustomer._id
            })
            .then(newUser => {
                console.log('new user created', newUser)
                let newOrders = []
                ASYNC.forEach(req.body.productOrderDetails, (productOrder, done) => {
                    DB.Order.create({
                        customer: newUser._id,
                        item: productOrder
                    })
                    .then(newOrder => {
                        console.log('new order created', newOrder)
                        newOrders.push(newOrder)
                        done()
                    })
                    .catch(done)
                    }, 
                    //once all orders created, add them to the data, and add the ids to the customer
                    () => {
                    
                    let orderIds = newOrders.map(order => order._id)
                    
                    //add order ids to customer
                    DB.Customer.findByIdAndUpdate(newCustomer._id, {orders: orderIds}, {new: true})
                    .then(updatedCustomer => {
                        console.log('customer updated', updatedCustomer)

                        DB.User.findById(newUser._id)
                        .populate('customer')
                        .then(user => {
                            // sign token to user
                            let token = JWT.sign(user.toJSON(), process.env.JWT_SECRET, {
                                expiresIn: 120
                            });
                            res.send({ token })
                        })
                        .catch(err => {
                            console.log('Error populating new user', err)
                            res.status(503).send('Internal server error')
                        })
                        
                    })
                    .catch(err => {
                        console.log('Error updating user', err)
                        res.status(503).send('Internal server error')
                    })
                })     
            })
            .catch(err => {
                console.log(`Error creating new user. ${err}`);
                res.status(500).send({ message: 'Internal server error.'})
            });  
        })
        .catch(err => {
            console.log(`Error creating new organization. ${err}`);
            res.status(503).send({ message: 'Internal server error.' })
        });  
    })
    .catch(err => {
        console.log('Error checking for email', err)
        res.status(503).send({message: 'Internal server error'})
    })


})

// GET /current/user
ROUTER.get('/current/user', (req, res) => {
    // if user is logged in, req.user should have data
    console.log(req.user);
    if (!req.user || !req.user._id) {
        return res.status(417).send({ message: 'Expectation failed. Check config.' });
    };
        // Data from token issue
        // If updating user, sign token again after update
    res.send({ user: req.user });
});

module.exports = ROUTER;