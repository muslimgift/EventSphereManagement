const express = require('express')
const userController = require('../Controllers/UserController')
const router = express.Router()

// http://localhost:3000/api/user
router.get("/",userController.getUsers)

// http://localhost:3000/api/user/:id
router.delete("/:id",userController.deleteUserById)

// http://localhost:3000/api/user/:id
router.patch("/:id",userController.updateUserStatus)

// http://localhost:3000/api/user/signup
router.post("/signup",userController.signupUser)

// http://localhost:3000/api/user/signin
router.post("/signin",userController.loginUser)

//http://localhost:3000/api/user/forgetpassword
router.post("/forgetpassword",userController.forgetPassword)

//http://localhost:3000/api/user/resetpassword
router.post("/resetpassword/:token", userController.resetPassword);

module.exports = router