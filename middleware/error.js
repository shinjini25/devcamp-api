const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    console.log(err.stack);

    //Mongoose bad objectId / badly formatted 
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    //Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }

    //Mongoose validation error
    //errors is an array and message is a property in all the errors (inside the errors array)
    if (err.name === 'ValidationError') {
        //Object.values() returns an array whose elements are the enumerable property values found on the object.
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
    });
};

module.exports = errorHandler; 
