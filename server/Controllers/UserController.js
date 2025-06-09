const bcrypt = require('bcrypt');
const UserModel = require('../Models/UserSchema');
const { v4: uuidv4 } = require("uuid");
const transporter = require('../config/email');
let userController = {


getUsers: async (req, res) => {
  try {
    const users = await UserModel.find(); // assuming a Mongoose model
    res.json({
      message: "Users fetched successfully",
      status: true,
      users,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching users" });
  }
},

//delete

deleteUserById: async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
},

// update user status
updateUserStatus: async (req, res) => {
  const { id } = req.params;
  const { CurrentStatus } = req.body;

  if (!CurrentStatus) {
    return res.status(400).json({ status: false, message: "CurrentStatus is required" });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { CurrentStatus },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({
      status: true,
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
},
//Update User Profile
updateUserProfile: async (req, res) => {
  const { _id, facebooklink, websitelink, phonenumber, email, companyname } = req.body;

  if (!(_id && facebooklink && websitelink && phonenumber && email && companyname)) {
    return res.status(400).json({ status: false, message: "Fields are required" });
  }

  try {
    const updateData = { facebooklink, websitelink, phonenumber, email, companyname };

    if (req.file) {
      const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      updateData.logolink = logoUrl;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({
      status: true,
      message: "User Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("User Profile update error:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
},

signupUser: async (req, res) => {
        const { username,companyname,phonenumber, email, password, role,CurrentStatus } = req.body;

        if (!username || !email || !password||!companyname||!phonenumber||!CurrentStatus) {
            res.json({
                message: "required fields are missing",
                status: false
            });
        } else {

            let existingUser = await UserModel.findOne({ email })
            console.log(existingUser)

            if (existingUser) {
                res.json({
                    message: "account already exist with this email",
                    status: false
                })
            } else {
                const hashPass = await bcrypt.hash(password, 10);

                let user = {
                    username,
                    email,
                    password: hashPass,
                    role,
                    phonenumber,
                    companyname,
                    CurrentStatus,

                };

                const newUser = new UserModel(user);
                await newUser.save();

                res.json({
                    message: "user created successfully",
                    newUser,
                    status: true
                });
            }
        }
    },
loginUser: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.json({
                message: "required fields are missing",
                status: false
            });
        } else {
            const user = await UserModel.findOne({ email });

            if (!user) {
                res.json({
                    message: "No Account exist with this email! Please create first",
                    status: false
                });
            } else {

                
                const match = await bcrypt.compare(password, user.password);

                if (match){
                    res.json({
                        message: "Login successful",
                        user,
                        status: true
                    });
                } else{
                    res.json({
                        message: "Invalid password",
                        status: false
                    });
                } 
            }
        }
    },


//forget Password Code
forgetPassword: async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/resetpassword/${token}`;

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          font-size: 16px;
          color: #333333;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          font-size: 13px;
          color: #888888;
          margin-top: 30px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h2>Hello,</h2>
          <p>
            We received a request to reset the password for your account. If you
            made this request, please click the button below to set a new
            password.
          </p>
          <p style="text-align: center;">
            <a href=${resetLink} class="button" target="_blank" rel="noopener">Reset Your Password</a>
          </p>
          <p>
            If you didn’t request a password reset, you can safely ignore this
            email. Your password will remain unchanged.
          </p>
          <p>This link will expire in 15 minutes.</p>
          <p>Thank you,<br />Event Sphere Management</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Event Sphere Management. All rights reserved.</p>
          <p>
            <a href="mailto:muslimgift12345@gmail.com">muslimgift12345@gmail.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: emailHtml,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
},




//reset password 
resetPassword:async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // valid token
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
},


}

module.exports = userController;
