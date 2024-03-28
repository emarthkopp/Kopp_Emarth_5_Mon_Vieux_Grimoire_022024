const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../image/multer-config');
const bookCtrl = require('../controllers/booksCtrl');

const router = express.Router();

router.get("/", bookCtrl.getAllBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook );
router.delete("/:id", auth, bookCtrl.deleteBook );

module.exports = router;






