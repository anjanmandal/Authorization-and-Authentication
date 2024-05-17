const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Auth');
const validator=require("validator");

const schema = new mongoose.Schema({
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
    }


})
