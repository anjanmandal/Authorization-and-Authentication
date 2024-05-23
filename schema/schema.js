const mongoose = require('mongoose');
const bcrypt=require('bcryptjs')
const validator=require("validator");
const crypto=require('crypto');

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
        validate:{//tbis will only work for save and create...
            validator:function(val){
                return val===this.password;
            },
            message:'password and confirm password doesnot match..'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date


});
Userschema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

//below we are creating instance method that will compare the passoword provided by user in login with the already stored passoword in database.
//instace method is the method that can be used by all the object or document of the User collection..
Userschema.methods.comparePassword=async function (pass,passindb){
    return await bcrypt.compare(pass,passindb);

}
Userschema.methods.isChangedPassword=async function (tokenTIME){
    if(!passwordChangedAt){
        return true;
    }
    //here you have to convert the date at which passwordword was change to time and convert it to second
    const passwordChangedTime=parseInt(this.passwordChangedAt.getTime()/1000,10);
    return passwordChangedTime>tokenTIME;
}
//method to create reset token

Userschema.methods.createResetPasswordToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
//we cannot just store this token we have to encrypt this token...
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex') // name of algorithm,
    this.passwordResetTokenExpires=Date.now()+10*60*100//converted to milisecond...
    console.log(resetToken);
    return resetToken;
}
 
const User = new mongoose.model('User',Userschema);
module.exports=User;
