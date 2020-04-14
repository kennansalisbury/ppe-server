//dependencies
require('dotenv').config();
const JWT = require('jsonwebtoken');
const DB = require('../models');
const ROUTER = require('express').Router();

// PUT /profile/:id - edit user info and reissue token
ROUTER.put('/:id', (req, res) => {
    DB.User.findByIdAndUpdate(req.params.id, req.body, {new: true})
    .then(updatedUser => {
        let token = JWT.sign(updatedUser.toJSON(), process.env.JWT_SECRET, {
            expiresIn: 60 * 15
        })
        res.send({ token })
    })
    .catch(err => {
        console.log('Error updating user', err)
        res.status(503).send({message: 'Internal server error'})
    })
})


//NEED THIS ROUTE? Going to have all of their user info in their token
// GET /profile/:id - show user info
ROUTER.get('/:id', (req, res) => {
    DB.User.findById(req.params.id)
    .then(user => {
        res.send(user)
    })
    .catch(err => {
        console.log('Error finding user', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

module.exports = ROUTER;