const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const user=new Schema({
    username:String,
    password:String,
    email:String,
    role:{
        type:String,
        enum:["ADMIN","USER"],
        default:"USER"
    },
})
const User=mongoose.model("User",user);
module.exports= User;