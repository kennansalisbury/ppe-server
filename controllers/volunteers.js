const DB = require('../models');
const ROUTER = require('express').Router();

// GET /volunteers - find all volunteers and provide info depending on which type of user the rq is coming from
ROUTER.get('/', (req, res) => {
    console.log(req.user)

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


// GET /volunteers/:id - if team lead, view only if self, on team roster or unassigned; if maker or driver, view only if self or assigned team lead
ROUTER.get('/:id', (req, res) => {
    
    if(req.user.teamLead || req.user.maker || req.user.driver) {
        DB.User.findById(req.params.id)
        .then(volunteer => {
            if(req.params.id === req.user._id) {
                res.send(volunteer)
            }
            else if(req.user.teamLead) {

                //if team lead requesting, can view volunteer if on team roster or unassigned
                if(volunteer.maker && (!volunteer.maker.teamLead || volunteer.maker.teamLead.toString() === req.user._id)) {
                    res.send(volunteer)  
                }
                else if(volunteer.driver && (!volunteer.driver.teamLead || volunteer.driver.teamLead.toString() === req.user._id)) {
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