const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Med=new Schema({
  name: { type: String, required: true },          
  category: String,                                
  form: String,                                    
  strength: String,                                
  price: Number,                                   
  quantity: Number,                               
  expiryDate: Date,
  imageUrl:String,
});
const med=mongoose.model("Medcine",Med);
module.exports=med;