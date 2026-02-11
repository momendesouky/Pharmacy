const express = require('express');
const authenticate = require('../middlewares/Authenticate');
const authorizeRole = require('../middlewares/authorizeRoles');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/user/Medcines', authenticate, authorizeRole('USER', 'ADMIN'), userController.listUserMeds);
router.get('/viewDetails/:id', userController.viewDetails);
router.get('/cart', authenticate, authorizeRole('USER'), userController.showCart);
router.post('/cart/add/:medid', authenticate, authorizeRole('USER'), userController.addToCart);
router.post('/cart/delete/:id', authenticate, authorizeRole('USER', 'ADMIN'), userController.deleteFromCart);

module.exports = router;
