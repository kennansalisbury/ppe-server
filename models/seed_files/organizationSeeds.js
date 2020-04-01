const MONGOOSE = require('mongoose')
let DB = require('../../models')

let organizations = [{
    name: 'Richmond Pediatrics',
    address: '367 NW Richmond Beach Rd',
    city: 'Shoreline'
}, {
    name: 'Skagit Pediatrics',
    address: '2101 Little Mountain Lane',
    city: 'Mount Vernon'
}, {
    name: 'Neighbor Care Health - Columbia City',
    address: '4400 37th Ave S.',
    city: 'Seattle'
}, {
    name: 'Mount St. Vincent',
    address: '4831 35th Ave SW',
    city: 'Seattle'

}, {
    name: 'University Place Pediatric Clinic',
    address: '1033 Regents Blvd # 102',
    city: 'Fircrest'
}, {
    name: 'Mercer Island Pediatrics',
    address: '9675 SE 36th Ste 100',
    city: 'Mercer Island'
}]

let zipcodes = ['981037768', '981013097', '981083844']


// DB.User.find({customer: {$exists: true}})
// .then(users => {

    // let userIds = users.map(user => user._id)

let data = organizations.map((clinic, index) => ({
    name: clinic.name,
    address: clinic.address,
    city: clinic.city,
    state: 'WA',
    zipcode: zipcodes[(Math.floor(Math.random() * zipcodes.length))],
    numberOfEmployees: Math.floor(Math.random() * 100),
    // customer: `${userIds[Math.floor(Math.random() * userIds.length)]}`,
    laundryCapable: true
}))

DB.Organization.create(data).then(console.log('organizations seeded'))
// console.log(data)

// })