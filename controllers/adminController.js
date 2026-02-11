const Med = require('../models/medcine');

const listMeds = async (req, res) => {
  const meds = await Med.find();
  res.render('medecines_admin.ejs', { meds, error: null });
};

const showAddMed = (req, res) => {
  res.render('addmed.ejs', { error: null });
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
  const mte = await Med.findById(req.params.id);
  res.render('editmed.ejs', { mte, error: null });
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
  showAddMed,
  addMed,
  deleteMed,
  showEditMed,
  editMed,
};
