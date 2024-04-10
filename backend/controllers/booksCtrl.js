const Book = require("../models/book");

const fs = require("fs");

exports.createBook = (req, res, next) => {
  
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  console.log(bookObject);
  console.log(req.file.filename);
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
  console.log(book, "2");
};

exports.addRating = (req, res, next) => {
  const { userId, grade } = req.body;
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
        existingRating.grade = grade;
      } else {
        // Ajouter une nouvelle note
        book.ratings.push({ userId, grade });
      }

      // Recalculer la moyenne des notes
      book.averageRating =
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
        book.ratings.length;

      // Sauvegarder les modifications
      return book.save();
    })
    .then(() => {
      res.status(200).json({ message: "Note ajoutée avec succès" });
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
  console.log(req.body)
  const { userId, grade } = req.body;
  const bookId = req.params.id;
  let bookUpdated = {}
  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      // Rechercher la note de l'utilisateur dans le livre
      const userRatingIndex = book.ratings.findIndex(
        (rating) => rating.userId === userId
      );
      // Mettre à jour la note si elle existe
      if (userRatingIndex !== -1) {
        book.ratings[userRatingIndex].grade = grade;
        // Recalculer la moyenne des notes
        book.averageRating =
          book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
          book.ratings.length;
        // Sauvegarder les modifications
        return book.save();
      } else {
        book.ratings.push({ userId, grade });
        book.averageRating =
          book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
          book.ratings.length;
      }
      bookUpdated = {...book}
    })
    .then(() => {
      Book.findOne({ _id: req.params.id })
      .then((book) => res.status(200).json(book))
      .catch((error) => res.status(404).json({ error }));
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
