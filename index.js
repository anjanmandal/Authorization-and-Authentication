const express= require("express");
const app=express();
const config =require('dotenv')
config.config();
const mongoose=require('mongoose');
const path=require('path');
const User=require('./schema/schema.js');
const customError=require("./ErrorHandler/ExpressError.js");
const jwt=require('jsonwebtoken');
const util=require('util');
const sendEmail=require("./nodemailer  ");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('./public'));//serving static file

const signToken=(id)=>{
    return jwt.sign({id},process.env.SECRET_STR,{expiresIn:'1h'});
}

main().then(()=>{
    console.log("Connected to DB..")
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Auth');
}

app.listen(8080,()=>{
    console.log("listening to port 8080");
})
app.use("/",(req,res,next)=>{
    console.log("server started..");
    next();

});
app.get("/signup",(req,res)=>{
    console.log("got it")
    res.render("signUp.ejs");
})

const midwareToProtectInfo = async (req, res, next) => {
    // Read the token from the authorization header
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    let token;
    
    if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
        token = authHeader.split(' ')[1];
    }

    // If no token is provided, return an error
    if (!token) {
        return next(new customError(400, "Please log in!"));
    }

    // Validate the token
    try {
        const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
        console.log(decodedToken);
        const user=await User.findById(decodedToken.id);// Store decoded token in the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return next(new customError(400, "Token validation failed!"));
    }

    //chek if the user exists or not because sometimes even if the user is logged in server might delete its accoutn..
    if(!user){
        next(new customError(401,"User doesnot exists"))
    }

    //if the user change his passoword when token was issued..
    const isPasswordChanged=await user.isChangedPassword(decodedToken.iat);
    if(isPasswordChanged){
        next(new customError(401,"Your password was changed recently please login again.."))
    }
    req.user=user;

}
app.get("/forgot-password",(req,res)=>{
    res.render("changePass.ejs");
})
app.post("/change-password",async (req,res)=>{
    //three things need to be done here
    //1. Check if the user exists or not it not throw err
    //2. Generate a random reset token, this token doesnot need to be that strong so we will import one library "crypto". const crypto= require("crypto")
    //3. Send the token back to the user email
    //1
    let {email}=req.body;
    const user=await User.findOne({email});
    if(!user){
        next(new customError(404,"couldnot find the user with given email."))
    }
    const resetToken=user.createResetPasswordToken();
    await user.save({validateBeforeSave:false});
   await sendEmail();

})

app.post("/signup",async(req,res)=>{
    let{name,email,password,confirmPassword}=req.body;
    let user1= new User({
        name:name,
        email:email,
        password:password,
        confirmPassword:confirmPassword

    });
    try {
        await user1.save();
        console.log('User saved successfully.');
    } catch (err) {
        if (err.name === 'ValidationError') {
            // Handle validation error
            for (let field in err.errors) {
                console.error(`Validation error: ${err.errors[field].message}`);
            }
        } else {
            // Handle other errors
            console.error('An error occurred:', err);
        }
    }
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.post("/login",async(req,res,next)=>{
    let{email,password}=req.body;
    console.log(email)
    if(!email || !password){
   return next(new customError(400,"invalid email or password"));
    }
    let user=await User.findOne({email});
   if(!user || !(await user.comparePassword(password,user.password))){
    return next(new customError(400,"Incorrect email or passoword")) ;
   }
   const token=signToken(user._id);
   console.log(token);
   res.render("alluser.ejs",{token})
});
app.get("/alluser",midwareToProtectInfo,(req,res)=>{
    console.log(req.header.authorization)

})
app.use("/login",(err,req,res,next)=>{
    console.log("error occured");
    let{status=500 ,message="some error occured"}=err;
    res.status(status).send(message);

})
