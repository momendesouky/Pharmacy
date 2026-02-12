const Med = require('../models/medcine');
const Users = require('../models/User');

const listMeds = async (req, res) => {
  const meds = await Med.find();
  const username=req.user.username
  res.render('medecines_admin.ejs', {meds,username, error: null });
};

const listUsers = async (req, res) => {
  const users = await Users.find();
  const username=req.user.username
  res.render('medecines_admin_users.ejs', {users,username, error: null });
};
const DeleteUser = async (req, res) => {
  const usertodelete_id=req.params.id
  await Users.findByIdAndDelete(usertodelete_id);
  res.json({sucsses:true})
};

const showAddMed = (req, res) => {
  const username=req.user.username
  res.render('addmed.ejs', { username,error: null });
};

const addMed = async (req, res) => {
  const { name, form, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const m = new Med();
  m.name = name;
  m.form = form;
  m.price = price;
  m.imageUrl = imageUrl;
  await m.save();

  res.redirect('/admin/Medcines');
};

const deleteMed = async (req, res) => {
  await Med.findByIdAndDelete(req.params.id);
  res.redirect('/admin/Medcines');
};

const showEditMed = async (req, res) => {
  const username=req.user.username
  const mte = await Med.findById(req.params.id);
  res.render('editmed.ejs', { username,mte, error: null });
};

const editMed = async (req, res) => {
  const { name, form, price } = req.body;
  const mte = await Med.findById(req.params.id);

  mte.name = name;
  mte.form = form;
  mte.price = price;

  if (req.file) {
    mte.imageUrl = `/uploads/${req.file.filename}`;
  }

  await mte.save();
  res.redirect('/admin/Medcines');
};


module.exports = {
  listMeds,
  listUsers,
  DeleteUser,
  showAddMed,
  addMed,
  deleteMed,
  showEditMed,
  editMed,
};
