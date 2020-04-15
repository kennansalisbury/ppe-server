const MONGOOSE = require('mongoose')
const DB = require('../../models')

let data = [
    {
        name: 'Outpatient Clinic', 
    }, 
    {
        name: 'Senior Center',
    }, 
    {
        name: 'Skilled Nursing Facility',
    },
    {
        name: 'Congregate Housing',
    },
    {
        name: 'Community Health Organization',
    },
    {
        name: 'Specialty Clinic',
    },
    {
        name: 'Educational Institution',
    },
    {
        name: 'Pharmacy',
    },
    {
        name: 'Home Health Agency',
    },
    {
        name: 'Essential Worker',
    }
]

// console.log(data)
DB.OrgType.create(data).then(console.log('orgtypes seeded'))