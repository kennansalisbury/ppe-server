const DB = require('../models');
const ROUTER = require('express').Router();
const JWT = require('jsonwebtoken');

// GET /volunteers - find all volunteers and provide info depending on which type of user the rq is coming from
ROUTER.get('/', (req, res) => {
    
     //if rq coming from source other than admin, team lead, or steering team - forbidden
    if(!req.user.adminPermissions && !req.user.teamLead && !req.user.viewAllPermissions) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    //find all volunteers (teamLead, driver, or maker fields exist for the user)
    DB.User.find({
        $or:[
            {teamLead: {$exists: true}}, 
            {driver: {$exists: true}}, 
            {maker: {$exists: true}}]
    })
    .populate('teamLead.volunteerRoster')
    .populate('orders')
    .then(volunteers => {

        //if rq coming from admin or steering team, send all details
        if(req.user.adminPermissions || req.user.viewAllPermissions) {
            let unassignedMakers = volunteers.filter(volunteer => volunteer.maker && !volunteer.maker.teamLead)
            let unassignedDrivers = volunteers.filter(volunteer => volunteer.driver && !volunteer.driver.teamLead)
            let teamLeads = volunteers.filter(volunteer => volunteer.teamLead)
            
            res.send({unassignedMakers, unassignedDrivers, teamLeads})
        } 
        //if rq coming from team lead, send all info for unassigned or volunteers on their roster
        else if(req.user.teamLead) {

            //volunteer is a maker and doesn't have a team lead or has the team lead requesting 
            let makers = volunteers.filter(volunteer => volunteer.maker && (!volunteer.maker.teamLead || volunteer.maker.teamLead.toString() === req.user._id))
            
            //volunteer is a driver and doesn't have a team lead or has the team lead requesting
            let drivers = volunteers.filter(volunteer => volunteer.driver && (!volunteer.driver.teamLead || volunteer.driver.teamLead.toString() === req.user._id))
            
            res.send({makers, drivers})
        
        }
        else {
            res.status(403).send({message: 'Forbidden'})
        }
    })
    .catch(err => {
        console.log('Error finding volunteers', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

//POST /volunteers/production - volunteer/maker post new production inventory
ROUTER.post('/production', (req, res) => {
    DB.User.findById(req.user._id)
    .then(user => {
        user.maker.makerProduction.push(req.body)
        return user.save()
    })
    .then(updatedUser => {
        // sign token to updated user
        let token = JWT.sign(updatedUser.toJSON(), process.env.JWT_SECRET, {
            expiresIn: 120
        });
        res.send({ token });
    })
    .catch(err => {
        console.log('Error adding maker production inventory', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

//PUT /volunteers/production - volunteer/maker update their own production inventory
ROUTER.put('/production', (req, res) => {
    DB.User.findById(req.user._id)
    .then(user => {
        const productionItem = user.maker.makerProduction.id(req.body._id)
        productionItem.set(req.body)
        return user.save()
    })
    .then(updatedUser => {
        // sign token to updated user
        let token = JWT.sign(updatedUser.toJSON(), process.env.JWT_SECRET, {
            expiresIn: 120
        });
        res.send({ token });
    })
    .catch(err => {
        console.log('Error updating maker production', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

//POST /volunteers/pledge - volunteer/maker create a new pledge
ROUTER.post('/pledge', (req, res) => {
    DB.User.findById(req.user._id)
    .then(user => {
        user.maker.makerPledge.push(req.body)
        return user.save()
    })
    .then(updatedUser => {
        // sign token to updated user
        let token = JWT.sign(updatedUser.toJSON(), process.env.JWT_SECRET, {
            expiresIn: 120
        });
        res.send({ token });
    })
    .catch(err => {
        console.log('Error creating maker pledge', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

//PUT /volunteers/pledge - volunteer/maker update their pledge information
ROUTER.put('/production', (req, res) => {
    DB.User.findById(req.user._id)
    .then(user => {
        const pledgeItem = user.maker.makerPledge.id(req.body._id)
        pledgeItem.set(req.body)
        return user.save()
    })
    .then(updatedUser => {
        // sign token to updated user
        let token = JWT.sign(updatedUser.toJSON(), process.env.JWT_SECRET, {
            expiresIn: 120
        });
        res.send({ token });
    })
    .catch(err => {
        console.log('Error updating maker pledge', err)
        res.status(503).send({message: 'Internal server error'})
    })
})

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

//PUT /volunteers/:id - update volunteer details
ROUTER.put('/:id', (req, res) => {

    //if it is a customer or steering team member, can't use this route
    if(req.user.customer || req.user.viewAllPermissions) {
        res.status(403).send({message: 'Forbidden'})
        return
    }

    //if admin or team lead, can update team lead rosters and assign/unassign team leads to volunteers
    if(req.user.adminPermissions || req.user.teamLead) {
       
        DB.User.findById(req.params.id)
        .then(user => {
            let update
            //if maker, update team lead in maker
            if(user.maker){
                update = {
                    maker: {
                        teamLead: req.body.teamLead
                    }
                }
            }
            //if driver, update team lead in driver
            else if(user.driver){
                update = {
                    driver: {
                        teamLead: req.body.teamLead
                    }
                }
            }
            else {
                res.status(403).send({message: 'Forbidden'})
                return
            }

            let updateConfirmations = []
            DB.User.findByIdAndUpdate(req.params.id, update, {new: true})
            .then(updated => {
                updateConfirmations.push({updatedVolunteer: updated}) //front end will confirm if updated w/ response.nModified === 1
                //then update team leader volunteer roster with user._id
                DB.User.findByIdAndUpdate(req.body.teamLead, {
                    teamLead: {
                        volunteerRoster: user._id
                    }
                }, {new: true})
                .then(updated => {
                    updateConfirmations.push({updatedRoster: updated})
                    res.send(updateConfirmations)
                })
                .catch(err => {
                    console.log('Error updating team lead', err)
                    res.status(503).send('Internal server error')
                })
            })
            .catch(err => {
                console.log('Error updating volunteer', err)
                res.status(503).send('Internal server error')
            })
       })
        .catch(err => {
        console.log('Error finding volunteer', err)
        res.status(503).send('Internal server error')
        })
    
    }
    else {
        res.status(403).send({message: 'Forbidden'})
    }
})


module.exports = ROUTER;