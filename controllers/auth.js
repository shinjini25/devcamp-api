const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {

    const { name, email, password, role } = req.body;

    //create user
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    // // grab token and send to email
    // const confirmEmailToken = user.generateEmailConfirmToken();

    // // Create reset url
    // const confirmEmailURL = `${req.protocol}://${req.get(
    //     'host',
    // )}/api/v1/auth/confirmemail?token=${confirmEmailToken}`;

    // const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;

    // user.save({ validateBeforeSave: false });

    // const sendResult = await sendEmail({
    //     email: user.email,
    //     subject: 'Email confirmation token',
    //     message,
    // });

    sendTokenResponse(user, 200, res);
});


// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    //validate emil & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    //check for match password 
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        //30 DAYS FROM NOW
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    //seding cookie to client side along with json
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
    });
};


// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
    // user is already available in req due to the protect middleware
    const user = req.user;

    res.status(200).json({
        success: true,
        data: user,
    });
});


// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});