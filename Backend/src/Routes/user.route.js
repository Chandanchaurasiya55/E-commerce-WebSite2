const express = require('express');
const authController = require('../Controller/auth.controller');
const router = express.Router();

// user auth APIs
router.post('/user/register', authController.registerUser)
router.post('/user/login', authController.loginUser)

// router.get('/user/logout', authController.logoutUser)



module.exports = router;