// dependencies
const MONGOOSE = require('mongoose');
// schema
const orgTypeSchema = new MONGOOSE.Schema({
    name: {
        type: String,
        required: [true, 'organization type is required']
    }
});

module.exports = MONGOOSE.model('OrgType', orgTypeSchema);