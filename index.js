const express= require("express");
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const User=require('./schema/schema.js');
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('./public'));//serving static file


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
app.post("/signup",async(req,res)=>{
    let{name,email,password,confirmPassword}=req.body;
    let user1= new User({
        name:name,
        email:email,
        password:password,
        confirmPassword:confirmPassword

    });
    user1.save().then((res)=>{
        console.log(res);
    })
})