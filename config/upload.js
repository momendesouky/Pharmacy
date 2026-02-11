const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const filename = `Photo-${Date.now()}.${ext}`;
    cb(null, filename);
  },
});

module.exports = multer({ storage });
