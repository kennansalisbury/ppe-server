const DB = require('../models');
const ROUTER = require('express').Router();
const JWT = require('jsonwebtoken');

// GET /volunteers - find all volunteers (admin)
ROUTER.get('/', (req, res) => {
    
     //if rq coming from source other than admin
    if(!req.user.is_admin) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    //find all volunteers (!customer fields exist for the user)
    DB.User.find({customer: {$exists: false}, is_admin: false})
    .populate({
        path: 'maker',
        populate: {
            path: 'inventory',
            populate: {path: 'product'}
        }
    })
    .populate('driver')
    .then(volunteers => {
        res.send(volunteers)
    })
    .catch(err => {
        console.log('Error finding volunteers', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

//PUT /volunteers/inventory - volunteer/maker post new production inventory
ROUTER.put('/inventory', (req, res) => {

    //if not admin or user w/ maker id === req.body.maker, send forbidden
    if(!req.user.is_admin && (req.user.maker && (req.user.maker._id != req.body.maker))) {
        res.status(403).send({message: 'Forbidden'})
        return
    }
    
    //check if inventory already exists for this maker for this product
        //if does, update within the inventory model and then send back the updated inventory
        //if does not, create new inventory in inventory model, then find maker for current user and push inventory id into inventory array
            //will need to create new token

    //check inventory for document with current maker and productid in req.body
    DB.Inventory.findOne({maker: req.body.maker, product: req.body.product})
    .then(inventory => {

        console.log('makerid', req.body.maker, 'productid', req.body.product)

        //if exists, update
        if(inventory) {
            console.log('inventory already exists', inventory)
            DB.Inventory.findByIdAndUpdate(inventory._id, req.body, {new: true})
            .then(updatedInventory => {
                console.log('updated inventory', updatedInventory)
                res.send(updatedInventory)
            })
            .catch(err => {
                console.log('Error updating inventory', err)
                res.status(503).send({message: 'Internal server error'})
            })
        }
        else {
            //otherwise, create new & push into maker
            console.log('inventory does not exist, creating:', req.body)
            DB.Inventory.create(req.body)
            .then(newInventory => {
                DB.Maker.findById(req.body.maker)
                .then(maker => {
                    maker.inventory.push(newInventory._id)
                    maker.save()
                    .then(updatedMaker => {
                        res.send(updatedMaker)
                    })
                    .catch(err => {
                        console.log('Error adding inventory to maker', err)
                        res.status(503).send({message: 'Internal server error'})
                    })
                })
                .catch(err => {
                    console.log('Error finding maker', err)
                    res.status(503).send({message: 'Internal server error'})
                })
            })
            .catch(err => {
                console.log('Error creating inventory', err)
                res.status(503).send({message: 'Internal server error'})
            })
        }
    })
    .catch(err => {
        console.log('Error looking for inventory', err)
        res.status(503).send({message: 'Internal server error'})
    })
 
})


//PUT /volunteers/:id - update volunteer info (admin)
ROUTER.put('/:id', (req, res) => {

    //if it not admin, can't use this route (for now)
    if(!req.user.is_admin) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    //if data posted has a req.body.maker
        //first find maker and make those updates, then find user and update with req.body.user
    if(req.body.maker) {
        DB.User.findById(req.params.id)
        .then(user => {
            console.log('id:', req.params.id, 'user:', user)
            DB.Maker.findByIdAndUpdate(user.maker._id, req.body.maker, {new: true})
            .then(maker => {
                DB.User.findByIdAndUpdate(req.params.id, req.body.user, {new: true})
                .then(updatedUser => {
                    res.send(updatedUser)
                })
                .catch(err => {
                    console.log('Error updating volunteer', err)
                    res.status(503).send('Internal server error')
                })
            })
            .catch(err => {
                console.log('Error updating maker info', err)
                res.status(503).send('Internal server error')
            })
        })
        .catch(err => {
            console.log('Error finding volunteer', err)
            res.status(503).send('Internal server error')
        })
    }
    //if there is no req.body.maker, just update with req.body
    else {
        DB.User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(updatedUser => {
            res.send(updatedUser)
        })
        .catch(err => {
            console.log('Error updating volunteer', err)
            res.status(503).send('Internal server error')
        })
    }
})



///NOT UPDATED/NOT NEEDED FOR V1


// GET /volunteers/:id - if team lead, view only if self, on team roster or unassigned; if maker or driver, view only if self or assigned team lead
ROUTER.get('/:id', (req, res) => {
    
    if(req.user.teamLead || req.user.maker || req.user.driver) {
        DB.User.findById(req.params.id)
        .populate('driver.teamLead')
        .populate('maker.teamLead')
        .populate('teamLead.volunteerRoster')
        .populate('orders')
        .then(volunteer => {
            if(req.params.id === req.user._id) {
                res.send(volunteer)
            }
            else if(req.user.teamLead) {

                //if team lead requesting, can view volunteer if on team roster or unassigned
                if(volunteer.maker && (!volunteer.maker.teamLead || volunteer.maker.teamLead._id === req.user._id)) {
                    res.send(volunteer)  
                }
                else if(volunteer.driver && (!volunteer.driver.teamLead || volunteer.driver.teamLead._id === req.user._id)) {
                    res.send(volunteer)
                }
                else {
                    res.status(403).send({message: 'Forbidden'})
                }
            }
            //if maker is requesting, can view volunteer if it is their assigned team leader
            else if(req.user.maker) {

                if(volunteer.teamLead && req.params.id === req.user.maker.teamLead) {
                    res.send(volunteer)
                }
                else {
                    res.status(403).send({message: 'Forbidden'})
                }
            }
            else {
                //if driver is requesting, can view volunteer if it is their assigned team leader
                if(volunteer.teamLead && req.params.id === req.user.driver.teamLead) {
                    res.send(volunteer)
                }
                else {
                    res.status(403).send({message: 'Forbidden'})
                }
            }
        })
        .catch(err => {
            console.log('Error finding volunteer', err)
            res.status(503).send({message: 'Internal server error'})
        })
    }
    else {
        res.status(403).send({message: 'Forbidden'})
    }

})




module.exports = ROUTER;