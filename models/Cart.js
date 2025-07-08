const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Medcine=require("./medcine");
const Cart=new Schema({
username: String,
  items: [
    {
      medId: { type: mongoose.Schema.Types.ObjectId, ref: "Medcine" },
      quantity: { type: Number, default: 1 }
    }
  ],
  totalQuantity: { type: Number, default: 0 } // optional
});
const cart=mongoose.model("Cart",Cart);
module.exports=cart;