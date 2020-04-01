// dependencies
require('dotenv').config();
const CORS = require('cors');
const EXPRESS = require('express');
const EXPRESS_JWT = require('express-jwt');
const MORGAN = require('morgan');
const ROWDY_LOGGER = require('rowdy-logger');
// app and logger instantiation
const APP = EXPRESS();
const ROWDY_RESULTS = ROWDY_LOGGER.begin(APP);
// middleware config
APP.use(CORS());
APP.use(MORGAN('dev'));
APP.use(EXPRESS.urlencoded({ extended: false }));
APP.use(EXPRESS.json());
// auth routes
APP.use('/auth', EXPRESS_JWT({
    secret: process.env.JWT_SECRET
}).unless({
    path: [
        { url: '/auth/login', methods: ['POST']},
        { url: '/auth/signup/volunteer', methods: ['POST']},
        { url: '/auth/signup/order', methods: ['POST']}
    ]
}), require('./controllers/auth'));
// // protected routes
// APP.use('/producers', EXPRESS_JWT({
//     secret: process.env.JWT_SECRET
// }), require('./controllers/producers'))
// APP.use('/clinics', EXPRESS_JWT({
//     secret: process.env.JWT_SECRET
// }), require('./controllers/clinics'))
// APP.use('/orders', EXPRESS_JWT({
//     secret: process.env.JWT_SECRET
// }), require('./controllers/orders'))
// APP.use('/products', EXPRESS_JWT({
//     secret: process.env.JWT_SECRET
// }), require('./controllers/products'))

//open routes for testing
// APP.use('/producers', require('./controllers/producers'));
// APP.use('/clinics', require('./controllers/clinics'));
// APP.use('/orders', require('./controllers/orders'));
// APP.use('/products', require('./controllers/products'));

APP.get('/', (req, res) => {
    res.send({message: 'Server running'})
})

// port set up
APP.listen(process.env.PORT, () => {
    console.log(`Keeping it ${process.env.PORT}`)
    ROWDY_RESULTS.print()
});