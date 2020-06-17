# Dashboard Application Server - COVID-19 Volunteer Organization

## Routes
All routes JWT protected unless otherwise specified

|METHOD | PATH | NOTES |
| ------ | --------------- | ----------------- |
| POST    | /auth/login   | logs in user |
| POST   | /auth/signup/volunteer | signs up user of volunteer type - not protected |
| POST   | /auth/signup/volunteer | signs up user as volunteer - accommodates sign up as a maker account, a driver account, or both - not protected |
| POST    | /auth/signup/order   | signs up user as organization and saves order information - not protected |
| GET    | /auth/info    | returns existing product and org type data for including in sign up process on home page - not protected |
| GET   | /admin        | serves all data available for admin dashboard |
| PUT | /customers/:id    | update 1 organization's data (admin permission only) |
| POST    | /orders | create new order (admin permission only) |
| GET    | /orders/demand     | pulls overall demand numbers based on existing orders - not protected |
| PUT    | /orders/:id            | update existing order details (admin permission only) |
| DELETE    | /orders/:id            | delete existing order (admin permission only) |
| GET    | /products           | serves all existing products - not protected |
| POST    | /products         | create new product |
| PUT    | /profile/:id         | updates user info and reissues token |
| GET    | volunteers/inventory/:id         | if admin or current user, view user's product inventory |
| GET    | /volunteers/inventory/:id         | if admin or current user, view user's product inventory |
| PUT    | /volunteers/inventory        | create new product inventory (admin or volunteer) |
| POST    | /volunteers/account/:id         | create new type of account for a user (i.e. maker or driver) |
| PUT    | /volunteers/account/:id         | remove type of account from a user (i.e. maker or driver) |
| PUT    | /volunteers/:id         | update volunteer info (admin permission only) |