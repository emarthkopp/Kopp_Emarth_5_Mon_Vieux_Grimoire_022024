const express = require('express');
// const auth = require('auth');

const router = express.Router();

const bookCtrl = require('../controllers/booksCtrl');

router.post("/", bookCtrl.createBook );
router.put("/:id", bookCtrl.modifyBook );
router.delete("/:id", bookCtrl.deleteBook );
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);

module.exports = router;