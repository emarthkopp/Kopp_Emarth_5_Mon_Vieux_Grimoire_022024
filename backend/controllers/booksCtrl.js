const Book = require("../models/book");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  console.log(bookObject)
  delete bookObject._id;
  delete bookObject._userId;
  await sharp(req.file.path)
    .resize(500)
    .jpeg({ quality: 80})
    .toFile(path.resolve(req.file.destination, "resized", req.file.filename))
    .then(() => {
        fs.unlinkSync(req.file.path);
    })
    .catch((error) => {
        console.error(error);
    });
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
console.log(book)
  book
    .save()
    .then(() => {res.status(201).json({ message: "Livre enregistré !" })})
    .catch((error) => {res.status(400).json({ error })});
};

exports.addRating = (req, res, next) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (existingRating) {
        // Mettre à jour la note existante
        existingRating.grade = rating;
      } else {
        // Ajouter une nouvelle note
        book.ratings.push({ userId, grade: rating });
      }

      // Recalculer la moyenne des notes
      book.averageRating =
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
        book.ratings.length;

      // Sauvegarder les modifications
      book.save()
      .then((book) => {
        res.status(200).json(book);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.updateRating = (req, res, next) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (existingRating) {
        // Mettre à jour la note existante
        existingRating.grade = rating;
      } else {
        // Ajouter une nouvelle note
        book.ratings.push({ userId, grade: rating });
      }

      // Recalculer la moyenne des notes
      book.averageRating =
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
        book.ratings.length;

      // Sauvegarder les modifications
      book.save()
      .then((book) => {
        res.status(200).json(book);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};


exports.deleteBook = (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = thing.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(500).json({ error }));
};
