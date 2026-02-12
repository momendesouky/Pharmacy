const express = require('express');
const authenticate = require('../middlewares/Authenticate');
const authorizeRole = require('../middlewares/authorizeRoles');
const upload = require('../config/upload');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/admin/Medcines', authenticate, authorizeRole('ADMIN'), adminController.listMeds);
router.get('/admin/Users', authenticate, authorizeRole('ADMIN'), adminController.listUsers);
router.get('/admin/Medcines/add', authenticate, authorizeRole('ADMIN'), adminController.showAddMed);
router.post('/admin/users/delete/:id',authenticate, authorizeRole('ADMIN'), adminController.DeleteUser)
router.post('/admin/Medcines/add', authenticate, authorizeRole('ADMIN'), upload.single('image'), adminController.addMed);
router.post('/delete/:id', authenticate, authorizeRole('ADMIN'), adminController.deleteMed);
router.get('/edit/:id', authenticate, authorizeRole('ADMIN'), adminController.showEditMed);
router.post('/edit/:id', authenticate, authorizeRole('ADMIN'), upload.single('image'), adminController.editMed);

module.exports = router;
