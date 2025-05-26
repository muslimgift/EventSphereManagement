const { Schema, default: mongoose } = require("mongoose");

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    companyname:{
        type:String,
        required:true
    },
    phonenumber:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["organizer","exhibitors","attendees"],
        default:"guest"
    },
    CurrentStatus:{
        type:String,
        enum:["approved","rejected","waiting"]
    },
    resetPasswordToken: {
        type:String
    },
    resetPasswordExpires:{
        type:Date
    },

})



const UserModel = mongoose.model('user',userSchema)
module.exports = UserModel;