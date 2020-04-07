const MONGOOSE = require('mongoose')
const DB = require('../../models')

let makerFirstNames = ['Allie', 'Bob']
let driverFirstNames = ['Cathy', 'Devon']
let teamLeadFirstNames = ['Edgar', 'Frank']
let adminFirstNames = ['Gilda', 'Harriet']
let customerFirstNames =  ['Ivar', 'Jack']
let steeringTeamFirstNames = ['Joanne', 'Susan']
let zipcodes = ['981037768', '981013097', '981083844']

DB.Product.find()
.then(products => {
    let makerProduction = products.map(product => {
        return ({
            product: product._id,
            inventory: 10
        })
    })


    let makerData = makerFirstNames.map((name, index) => ({
        firstName: name,
        lastName: `${name}ington`,
        username: `${name.toLowerCase()}123`,
        password: `password${name.toLowerCase()}123`,
        email: `${name.toLowerCase()}123@gmail.com`,
        phone: `1234567890`,
        maker: {
            address: `123 ${name} St.`,
            city: 'Seattle',
            state: 'WA',
            zipcode: zipcodes[(Math.floor(Math.random() * zipcodes.length))],
            makerProduction
        },
        other: ''
    }))
// console.log(makerData)
// DB.User.create(makerData).then(console.log('makers seeded'))
})

let driverData = driverFirstNames.map((name, index) => ({
    firstName: name,
    lastName: `${name}ington`,
    username: `${name.toLowerCase()}123`,
    password: `password${name.toLowerCase()}123`,
    email: `${name}123@gmail.com`,
    phone: `1234567890`,
    driver: {
        zipcode: zipcodes[(Math.floor(Math.random() * zipcodes.length))]
    }
}))

let teamLeadData = teamLeadFirstNames.map((name, index) => ({
    firstName: name,
    lastName: `${name}ington`,
    username: `${name.toLowerCase()}123`,
    password: `password${name.toLowerCase()}123`,
    email: `${name}123@gmail.com`,
    phone: `1234567890`,
    teamLead: {
        address: `123 ${name} St.`,
        city: 'Seattle',
        state: 'WA',
        zipcode: zipcodes[(Math.floor(Math.random() * zipcodes.length))],
    }
}))


let adminData = adminFirstNames.map((name, index) => ({
    firstName: name,
    lastName: `${name}ington`,
    username: `${name.toLowerCase()}123`,
    password: `password${name.toLowerCase()}123`,
    email: `${name}123@gmail.com`,
    phone: `1234567890`,
    adminPermissions: true
}))

let steeringTeamData = steeringTeamFirstNames.map((name, index) => ({
    firstName: name,
    lastName: `${name}ington`,
    username: `${name.toLowerCase()}123`,
    password: `password${name.toLowerCase()}123`,
    email: `${name}123@gmail.com`,
    phone: `1234567890`,
    viewAllPermissions: true
}))

// DB.User.create(driverData).then(console.log('drivers seeded'))
// DB.User.create(teamLeadData).then(console.log('teamLeads seeded'))
// DB.User.create(adminData).then(console.log('admins seeded'))
// DB.User.create(steeringTeamData).then(console.log('steeringTeams seeded'))

DB.Organization.find().then(organizations => {
    let organizationIds = organizations.map(org => org._id)

    let customerData = customerFirstNames.map((name, index) => ({
        firstName: name,
        lastName: `${name}ington`,
        username: `${name.toLowerCase()}123`,
        password: `password${name.toLowerCase()}123`,
        email: `${name}123@gmail.com`,
        phone: `1234567890`,
        customer: {
            orgAffiliation: 'org admin',
            organization: `${organizationIds[Math.floor(Math.random() * organizationIds.length)]}`
        }
    }))

    DB.User.create(customerData).then(console.log('customers seeded'))

})
