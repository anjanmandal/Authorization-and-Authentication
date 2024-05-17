const express= require("express");
const app=express();
app.listen(8080,()=>{
    console.log("listening to port 8080");
})
app.use("/",(req,res)=>{
    console.log("server started..");
})