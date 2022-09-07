# devcamp-api

A RESTful Backend API to manage bootcamps, courses, user authentication & authorization. 

## Tech stack used:
NodeJS
ExpressJS
MongoDB, Mongoose

## Top features:
- converts user given bootcamp address to store it as a GeoJSON object in MongoDB using geocoding
- advanced querying such as filtering (based on tuition costs, within given raidus, etc), pagination, sorting, etc.
- hashing of passwords before storing in the database for added security
- JWT-token based user authentication
- authorization based on user roles (user/publisher/admin)
- add bootcamp photo, modify bootcamps, add/edit courses

Full API documentation: https://documenter.getpostman.com/view/16018602/VVBQYV4E#4d6041b0-e376-484f-9713-37d1e7cd1244 
