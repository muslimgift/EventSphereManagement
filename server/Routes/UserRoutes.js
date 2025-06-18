const express = require('express')
const userController = require('../Controllers/UserController')
const router = express.Router()
const upload = require('../middleware/uploadMiddlewear');


router.get("/",userController.getUsers)


router.delete("/:id",userController.deleteUserById)

router.patch("/:id",userController.updateUserStatus)


router.post("/signup",userController.signupUser)


router.post("/signin",userController.loginUser)


router.post("/forgetpassword",userController.forgetPassword)



router.post("/updateprofile", upload.single("logolink"), userController.updateUserProfile);


router.post("/resetpassword/:token", userController.resetPassword);

module.exports = router