const Med = require('../models/medcine');
const Cart = require('../models/Cart');

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
  res.render('view_details.ejs', { mtv, error: null });
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
    res.redirect('/cart');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add item to cart.');
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
    res.redirect('/user/Medcines');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add item to cart.');
  }
};

const deleteFromCart = async (req, res) => {
  const medId = req.params.id;
  const username = req.user.username;
  const userCart = await Cart.findOne({ username });

  const existingItem = userCart.items.find((item) => item.medId && item.medId.toString() === medId);
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
    } else {
      userCart.items = userCart.items.filter((item) => item.medId.toString() !== medId);
    }
    await userCart.save();
  }

  res.redirect('/cart');
};

module.exports = {
  listUserMeds,
  viewDetails,
  showCart,
  addFromInventory,
  addToCart,
  deleteFromCart,
};
