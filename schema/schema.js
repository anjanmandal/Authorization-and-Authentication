const mongoose = require('mongoose');

const validator=require("validator");

const Userschema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please enter your name.']
    },
    email:{
        type:String,
        required:[true,'Please enter an email'],
        unique:true,//this mekes sure that the emils are valid emails........
        lowercase:true,//this convert all the emails to lowercase
        validator:[validator.isEmail,'Please enter valid email address.']
    },
    photo:String,
    password:{
        type:String,
        required:[true,'please enter a password'],
        minLength:8
    },
    confirmPassword:{
        type:String,
        required:[true,'please confirm your password'],
        //Note: You need to make sure that the both password and confirm password are same
    }


});
const User = new mongoose.model('User',Userschema);
module.exports=User;
