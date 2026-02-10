const express=require("express");
const app=express();
const mongoose=require("mongoose");
const cors=require("cors");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cookie=require("cookie-parser");
require("dotenv").config();
const User=require("./models/User");
const Med=require("./models/medcine");
const cart=require("./models/Cart");
const authorizeRole = require("./middlewares/authorizeRoles");
const authenticate=require("./middlewares/Authenticate");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie());
app.use('/uploads', express.static('uploads'));
const multer = require("multer");
const path = require("path");
const { error } = require("console");
// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to save
  },
  filename: (req, file, cb) => {
    const ext=file.mimetype.split("/")[1];
    const filename = `Photo-${Date.now()}.${ext}`;
    cb(null, filename); 
  },
});

const upload = multer({ storage });

mongoose.connect(process.env.mongoUrl).then(()=>{
console.log("connected");
}).catch(()=>{
    console.log("error");
})

app.get("/login",(request,response)=>{
  const error = request.query.error || null;
    response.render("login.ejs",{error:error});
})
app.post("/login",async(request,response)=>{
    const{username,password}=request.body;
    const user=await User.findOne({username:username});
    if(!user){
      return response.redirect("/login?error=User Not Found");
    }
    const matchpss=await bcrypt.compare(password,user.password);
    if (user&&matchpss) {
    const token=jwt.sign({username:user.username,email:user.email,role:user.role},process.env.Jwt_secretKey);
    response.cookie("token",token,{httpOnly:true});
    response.redirect("/user/Medcines");
    }
   else {
    response.redirect("/login?error=Please Enter Valid Cardinalties");
  }
});
app.get("/signup",(request,response)=>{
    response.render("signup.ejs",{error:null});
})
app.post("/signup", async (request, response) => {
const { username, email, password,} = request.body;
if (!username || !email || !password) {
    return response.render("signup.ejs", {massage:null,error: "All fields are required." });
  }

  if (password.length < 6) {
    return response.render("signup.ejs", {massage:null, error: "Password must be at least 6 characters." });
  }
  const existingUser=await User.findOne({username});
  if(existingUser){
    return response.render("signup.ejs",{error:"User Already Exists"});
  }
  //hashing password
  const hashedPss=await bcrypt.hash(password,10);
  const reg = new User();
  reg.username = username;
  reg.email = email;
  reg.password = hashedPss;
  await reg.save()
  response.redirect("/login");
});
app.get("/admin/Medcines",authenticate,authorizeRole("ADMIN"), async (req, res) => {
  const meds = await Med.find();
  res.render("medecines_admin.ejs", { meds, error: null });
});

app.get("/admin/Medcines/add",authenticate,authorizeRole("ADMIN"),(req,res)=>{
    res.render("addmed.ejs",{error:null});
})
app.post("/admin/Medcines/add",authenticate,authorizeRole("ADMIN"),upload.single("image"),async(req,res)=>{
const{name,form,price}=req.body;
const imageUrl=req.file ? "/uploads/" + req.file.filename : "";
const m=new Med();
m.name=name;
m.form=form;
m.price=price;
m.imageUrl=imageUrl;
await m.save();
res.redirect("/admin/Medcines");
})
app.post("/delete/:id",authenticate,authorizeRole("ADMIN"),async(req,res)=>{
const m_id=req.params.id;
await Med.findByIdAndDelete(m_id);
res.redirect("/admin/Medcines")
})
app.get("/edit/:id",authenticate,authorizeRole("ADMIN"),async(req,res)=>{
    const m_id=req.params.id;
    const mte=await Med.findById(m_id);
    res.render("editmed.ejs",{mte,error:null});
})
app.post("/edit/:id",authenticate,authorizeRole("ADMIN"),upload.single("image"),async(req,res)=>{
    const{name,form,price}=req.body;
    const m_id=req.params.id;
    const mte=await Med.findById(m_id);
    mte.name=name;
    mte.form=form;
    mte.price=price;
     if (req.file) {
      mte.imageUrl = "/uploads/" + req.file.filename;
    }
    await mte.save();
    res.redirect("/admin/Medcines");
})
app.get("/user/Medcines",authenticate,authorizeRole("USER","ADMIN"),async(req,res)=>{
  const role=req.user.role;
  const page = parseInt(req.query.page) || 1;
  const limit = 6; 
  const skip = (page - 1) * limit;

  const total = await Med.countDocuments();
  const meds = await Med.find().skip(skip).limit(limit);

  const totalPages = Math.ceil(total / limit);

  res.render("medecines_user.ejs", {
    role,
    meds,
    error: null,
    currentPage: page,
    totalPages
  });
})
app.get("/",async(req,res)=>{
  res.render("Home.ejs",{error:null});
})
app.get("/cart",authenticate,authorizeRole("USER"), async (req, res) => {
  try {
    const username = req.user.username;
    const userCart = await cart.findOne({ username }).populate("items.medId");
    const cartItems = userCart ? userCart.items : [];
    res.render("cart.ejs", { username, cartItems, error: null });
  } catch (err) {
    console.error(err);
    res.render("cart.ejs", { username: req.user?.username || "", cartItems: [], error: "Failed to load cart." });
  }
});

app.post("/cart/add/:medid",authenticate,authorizeRole("USER"), async (req, res) => {
  try {
    const mta = req.params.medid;
    const username = req.user.username;
    let userCart = await cart.findOne({ username });

    if (!userCart) {
      userCart = new cart({
        username,
        items: [{ medId: mta, quantity: 1 }],
        totalQuantity: 1
      });
    } else {
      const existingItem = userCart.items.find(item =>
  item.medId && item.medId.toString() === mta
);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        userCart.items.push({ medId: mta, quantity: 1 });
      }

      userCart.totalQuantity = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    await userCart.save();
    res.json({ success: true });


  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add item to cart.");
  }
});
app.post("/cart/addfrominvetory/:medid",authenticate,authorizeRole("USER"), async (req, res) => {
  try {
    const mta = req.params.medid;
    const username = req.user.username;
    let userCart = await cart.findOne({ username });

    if (!userCart) {
      userCart = new cart({
        username,
        items: [{ medId: mta, quantity: 1 }],
        totalQuantity: 1
      });
    } else {
      const existingItem = userCart.items.find(item =>
  item.medId && item.medId.toString() === mta
);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        userCart.items.push({ medId: mta, quantity: 1 });
      }

      userCart.totalQuantity = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    await userCart.save();
    res.redirect("/cart")


  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add item to cart.");
  }
});
app.get("/viewDetails/:id",async(req,res)=>{
const mtv_id=req.params.id;
const mtv=await Med.findById(mtv_id);
res.render("view_details.ejs",{mtv,error:null});
})
app.post("/cart/delete/:id",authenticate,authorizeRole("USER","ADMIN"),async(req,res)=>{
const mtd_id=req.params.id;
const username = req.user.username;
let userCart = await cart.findOne({ username });
const existingItem = userCart.items.find(item =>
  item.medId && item.medId.toString() === mtd_id)
if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity -= 1; // Decrease quantity
    } else {
      userCart.items = userCart.items.filter(item =>
        item.medId.toString() !== mtd_id
      );
    }
    await userCart.save();
  }
  res.json({ success: true });

});
app.get("/logout",(req,res)=>{
  res.clearCookie("token");
  res.redirect("/login");
})
app.listen(process.env.port,()=>{
    console.log("Iam connected on port 8000");
})
