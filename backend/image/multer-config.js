const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'image');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');


// const multer = require('multer');
// const sharp = require('sharp');

// const MIME_TYPES = {
//   'image/jpg': 'jpg',
//   'image/jpeg': 'jpg',
//   'image/png': 'png'
// };

// const storage = multer.memoryStorage(); 
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 
//   },
//   fileFilter: (req, file, cb) => {
//     if (MIME_TYPES[file.mimetype]) {
//       cb(null, true);
//     } else {
//       cb(new Error('Format de fichier non pris en charge'), false);
//     }
//   }
// }).single('image');

// const resizeImage = async (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }

//   try {
//     const imageBuffer = req.file.buffer;
//     const resizedImageBuffer = await sharp(imageBuffer)
//       .resize({ width: 800 }) 
//       .toBuffer();

//     req.file.buffer = resizedImageBuffer;
//     next();
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { upload, resizeImage };
