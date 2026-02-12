const Med = require('../models/medcine');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User=require("../models/User.js")
const axios = require("axios");
const dotenv=require("dotenv").config()
const listUserMeds = async (req, res) => {
  const role = req.user.role;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;
  const total = await Med.countDocuments();
  const meds = await Med.find().skip(skip).limit(limit);
  const totalPages = Math.ceil(total / limit);
  res.render('medecines_user.ejs', {
    role,
    meds,
    error: null,
    currentPage: page,
    totalPages,
  });
};
const viewDetails = async (req, res) => {
  const mtv = await Med.findById(req.params.id);
  res.render('view_details.ejs', { role:req.user?.role,mtv, error: null });
};

const showCart = async (req, res) => {
  try {
    const username = req.user.username;
    const userCart = await Cart.findOne({ username }).populate('items.medId');
    const cartItems = userCart ? userCart.items : [];
    res.render('cart.ejs', { username, cartItems, error: null });
  } catch (err) {
    console.error(err);
    res.render('cart.ejs', {
      username: req.user?.username || '',
      cartItems: [],
      error: 'Failed to load cart.',
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const medId = req.params.medid;
    const username = req.user.username;
    let userCart = await Cart.findOne({ username });

    if (!userCart) {
      userCart = new Cart({
        username,
        items: [{ medId, quantity: 1 }],
        totalQuantity: 1,
      });
    } else {
      const existingItem = userCart.items.find((item) => item.medId && item.medId.toString() === medId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        userCart.items.push({ medId, quantity: 1 });
      }

      userCart.totalQuantity = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    await userCart.save();
    res.json({ sucsess: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucsess: false });
  }
};

const addFromInventory = async (req, res) => {
  try {
    const medId = req.params.medid;
    const username = req.user.username;
    let userCart = await Cart.findOne({ username });

    if (!userCart) {
      userCart = new Cart({
        username,
        items: [{ medId, quantity: 1 }],
        totalQuantity: 1,
      });
    } else {
      const existingItem = userCart.items.find((item) => item.medId && item.medId.toString() === medId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        userCart.items.push({ medId, quantity: 1 });
      }

      userCart.totalQuantity = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    await userCart.save();
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add item to cart.');
  }
};

const deleteFromCart = async (req, res) => {
  try {
    const medId = req.params.id;
    const username = req.user.username;
    const userCart = await Cart.findOne({ username });

    if (userCart) {
      const existingItem = userCart.items.find((item) => item.medId && item.medId.toString() === medId);
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          userCart.items = userCart.items.filter((item) => item.medId.toString() !== medId);
        }
        userCart.totalQuantity = userCart.items.reduce((sum, item) => sum + item.quantity, 0);
        await userCart.save();
      }
    }

    res.json({ sucsess: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucsess: false });
  }
};
const getCheckout = async (req, res) => {
  try {
    const username = req.user.username;

    // FIX: Look in the 'Cart' model, NOT the 'User' model
    const userCart = await Cart.findOne({ username }).populate('items.medId');

    // 1. Check if cart exists and has items
    if (!userCart || !userCart.items || userCart.items.length === 0) {
       console.log("Cart is empty or not found. Redirecting to inventory.");
       return res.redirect('/user/Medcines');
    }

    const cartItems = userCart.items;

    // 2. Filter out nulls (in case a medicine was deleted from DB)
    const validItems = cartItems.filter(item => item.medId != null);

    if (validItems.length === 0) {
      return res.redirect('/user/Medcines');
    }

    // 3. Calculate Total
    let total = 0;
    validItems.forEach(item => {
      total += item.medId.price * item.quantity;
    });

    res.render('checkout.ejs', {
      user: req.user, // Pass req.user for navbar/sidebar info
      cartItems: validItems,
      total,
    });

  } catch (err) {
    console.log("Get Checkout Error:", err);
    res.redirect('/500');
  }
};

// --- FIXED POST CHECKOUT ---
const postCheckout = async (req, res) => {
  try {
    const { address, city, zip } = req.body;
    const username = req.user.username;

    // 1. FIND THE USER ID (Crucial Fix)
    // We need the _id to link the order, but req.user might only have the username.
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      console.log("Error: User not found in DB.");
      return res.redirect('/login');
    }

    // 2. Fetch the Cart
    const userCart = await Cart.findOne({ username }).populate('items.medId');

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.redirect('/cart');
    }

    // 3. Filter valid items
    const validItems = userCart.items.filter(item => item.medId != null);
    
    if (validItems.length === 0) {
        return res.redirect('/cart');
    }

    // 4. Calculate Total
    let finalTotal = 0;
    const orderItems = validItems.map(item => {
      finalTotal += item.medId.price * item.quantity;
      return {
        medicine: item.medId._id,
        quantity: item.quantity,
        price: item.medId.price
      };
    });

    // 5. Create Order using the ID we found in Step 1
    const order = new Order({
      user: userDoc._id, // <--- THIS WAS THE MISSING PART
      items: orderItems,
      totalAmount: finalTotal,
      shippingAddress: { address, city, zip },
      paymentStatus: 'PAID',
      orderDate: new Date()
    });

    await order.save();

    // 6. Clear Cart
    userCart.items = [];
    userCart.totalQuantity = 0;
    await userCart.save();

    // 7. Success
    res.render('checkout_success.ejs', {
        pageTitle: 'Order Confirmed',
        username: username
    });

  } catch (err) {
    console.log("Post Checkout Error:", err);
    res.redirect('/cart');
  }
};
const ShowcheckoutSucsess=(req,res)=>{
  res.render("checkout_success.ejs",{error:null})
}
const generateAi = async (req, res) => {
  try {
    const med = await Med.findById(req.params.id);

    if (!med) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const prompt = `Write a professional 2 sentence medical description for ${med.name} (${med.form}) and what it treats.`;
    const result = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

    res.json({
      description: result.data.choices[0].message.content,
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "AI failed" });
  }
};
module.exports = {
  listUserMeds,
  viewDetails,
  showCart,
  addFromInventory,
  ShowcheckoutSucsess,
  addToCart,
  generateAi,
  postCheckout,
  getCheckout,  
  deleteFromCart,
};
