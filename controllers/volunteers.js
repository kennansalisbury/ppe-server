const DB = require('../models');
const ROUTER = require('express').Router();

// GET /volunteers - find all volunteers and provide info depending on which type of user the rq is coming from
ROUTER.get('/', (req, res) => {


     //if rq coming from source other than admin, team lead, or steering team - forbidden
    if(req.headers['adminpermissions'] === 'false' && req.headers['isteamlead'] === 'false' && req.headers['viewallpermissions'] === 'false') {
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
        if(req.headers['adminpermissions'] === 'true' || req.headers['viewallpermissions'] === 'true') {
            let unassignedMakers = volunteers.filter(volunteer => volunteer.maker && !volunteer.maker.teamLead)
            let unassignedDrivers = volunteers.filter(volunteer => volunteer.driver && !volunteer.driver.teamLead)
            let teamLeads = volunteers.filter(volunteer => volunteer.teamLead)
            
            res.send({unassignedMakers, unassignedDrivers, teamLeads})
        } 
        //if rq coming from team lead, send all info for unassigned or volunteers on their roster
        else if(req.headers['isteamlead'] === 'true') {

            //volunteer is a maker and doesn't have a team lead or has the team lead requesting 
            let makers = volunteers.filter(volunteer => volunteer.maker && (!volunteer.maker.teamLead || volunteer.maker.teamLead.toString() === req.headers['_id']))
            
            //volunteer is a driver and doesn't have a team lead or has the team lead requesting
            let drivers = volunteers.filter(volunteer => volunteer.driver && (!volunteer.driver.teamLead || volunteer.driver.teamLead.toString() === req.headers['_id']))
            
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

module.exports = ROUTER;