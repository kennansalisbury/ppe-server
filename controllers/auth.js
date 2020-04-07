// dependencies
require('dotenv').config();
const JWT = require('jsonwebtoken');
const DB = require('../models');
const ROUTER = require('express').Router();
const ASYNC = require('async')

// POST /auth/login
ROUTER.post('/login', (req, res) => {
    console.log(req.body.email)
    // check if email is in the system
    DB.User.findOne({ email: req.body.email})
    .populate('driver.teamLead')
    .populate('maker.teamLead')
    .populate('teamLead.volunteerRoster')
    .populate('orders')
    .populate('makerPledge')
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
        };
        // if not, check for username
        DB.User.findOne({username: req.body.username})
        .then(username => {
            //if username exists, error
            if(username) {
                return res.status(409).send({ message: 'Username already in use'});
            }
            // if not, create
            DB.User.create(req.body)
            .then(newUser => {
                // sign token to user
                let token = JWT.sign(newUser.toJSON(), process.env.JWT_SECRET, {
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
            console.log(`Error in POST /auth/signup. ${err}`);
            res.status(503).send({ message: 'Database error checking username.' })
        });  
    })
    .catch(err => {
        console.log(`Error in POST /auth/signup. ${err}`);
        res.status(503).send({ message: 'Database error checking email.' })
    });
});

//POST /auth/signup/order - sign up customer & place order request
ROUTER.post('/signup/order', (req, res) => {
    
    // res.send('test')
    //FIRST check if user exists, THEN check if organization exists
        //if user already exists - prompt to log in and place order from there
        //if org already exists - this org already exists in our system, please use the existing login information to log in and place order from there or contact info@sewstrong if you believe this is an error
    
    //IF USER & ORG ARE NEW, create new organization THEN create user THEN create order

    let data = []
    //check user email and username for existing in database
    DB.User.findOne({ $or: [{email: req.body.user.email }, {username: req.body.user.username}]})
    .then(user => {
        // if user exists, error
        if (user) {
            return res.status(409).send({ message: 'Email or username already in use'});
        };
        // if not, check for organization with same name/zipcode or same address/zipcode
        DB.Organization.findOne({
            $or: [
                {name: req.body.organization.name, zipcode: req.body.organization.zipcode},
                {address: req.body.organization.address, zipcode: req.body.organization.zipcode}
            ]
        })
        .then(organization => {
            //if org exists, error
            if(organization) {
                return res.status(409).send({message: 'Organization with the same name and zipcode, or same address already exists'})
            }
            
            //else, create new org
            DB.Organization.create(req.body.organization)
            .then(newOrganization => {
                data.push(newOrganization)
                console.log('new organization created', newOrganization)

                //create new user
                DB.User.create({
                    firstName: req.body.user.firstName,
                    lastName: req.body.user.lastName,
                    username: req.body.user.username,
                    password: req.body.user.password,
                    email: req.body.user.email,
                    phone: req.body.user.phone,
                    customer: {
                        orgAffiliation: req.body.user.customer.orgAffiliation,
                        organization: newOrganization._id
                    }
                })
                .then(newUser => {
                    console.log('new user created', newUser)
                    let newOrders = []
                    ASYNC.forEach(req.body.productOrderDetails, (productOrder, done) => {
                        DB.Order.create({
                            orderNumber: Math.floor(Math.random() * 100000000),
                            productOrderDetails: productOrder,
                            customer: newUser._id,
                            organization: newOrganization._id
                        })
                        .then(newOrder => {
                            console.log('new order created', newOrder)
                            newOrders.push(newOrder)
                            done()
                        })
                        .catch(done)
                        }, 
                        //once all orders created, add them to the data, and add the ids to the user
                        () => {
                        data.push(newOrders)
                        let orderIds = newOrders.map(order => order._id)
                        
                        //add order ids to user
                        DB.User.findByIdAndUpdate(newUser._id, {orders: orderIds}, {new: true})
                        .then(updatedUser => {
                            console.log('user updated', updatedUser)
                            // sign token to user
                            let token = JWT.sign(updatedUser.toJSON(), process.env.JWT_SECRET, {
                                expiresIn: 120
                            });
                            res.send({ token })
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
            console.log(`Error checking for organization. ${err}`);
            res.status(503).send({ message: 'Internal server error' })
        })
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