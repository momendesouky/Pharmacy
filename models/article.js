const mongoose = require("mongoose");
const Schema=mongoose.Schema;
const articleSchema=new Schema({
    title:String,
    body:String,
})
const article=mongoose.model("Article",articleSchema);
module.exports=article;