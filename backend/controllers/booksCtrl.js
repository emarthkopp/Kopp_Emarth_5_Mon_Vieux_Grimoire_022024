const Book = require("../models/book");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.createBook = async (req, res, next) => {
  // Analyse de l'objet livre à partir des données de la requête
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  // Redimensionnement de l'image du livre et sauvegarde de la nouvelle image
  await sharp(req.file.path)
    .resize(500)
    .jpeg({ quality: 80})
    .toFile(path.resolve(req.file.destination, "resized", req.file.filename))
    .then(() => {
        fs.unlinkSync(req.file.path);// Suppression de l'ancienne image
    })
    .catch((error) => {
        console.error(error);
    });

    // Création d'une instance de livre avec les détails et l'URL de l'image
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  // Sauvegarde du livre dans la base de données
  book
    .save()
    .then(() => {res.status(201).json({ message: "Livre enregistré !" })})
    .catch((error) => {res.status(400).json({ error })});
};

// Fonction pour ajouter une note à un livre
exports.addRating = (req, res, next) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

   // Recherche du livre dans la base de données par son ID
  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

       // Vérification si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (existingRating) {
        existingRating.grade = rating;
      } else {
        book.ratings.push({ userId, grade: rating });
      }

         // Calcul de la note moyenne du livre
      book.averageRating =
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
        book.ratings.length;

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

// Fonction pour modifier les détails d'un livre
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
   // Recherche du livre dans la base de données par son ID
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

// Fonction pour mettre à jour la note d'un livre
exports.updateRating = (req, res, next) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      
      // Vérification si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(
        (rating) => rating.userId === userId
      );
      if (existingRating) {
        existingRating.grade = rating;
      } else {
        book.ratings.push({ userId, grade: rating });
      }

      // Calcul de la note moyenne du livre
      book.averageRating =
        book.ratings.reduce((acc, rating) => acc + rating.grade, 0) /
        book.ratings.length;

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

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
       // Vérification si l'utilisateur est le propriétaire du livre
      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      // Suppression du fichier image associé
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, (error) => {
        if (error) {
          return res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
        }
        
        Book.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Livre supprimé avec succès" });
          })
          .catch((error) => res.status(500).json({ error: "Erreur lors de la suppression du livre" }));
      });
    })
    .catch((error) => {
      res.status(500).json({ error: "Erreur lors de la recherche du livre" });
    });
};


// Fonction pour récupérer les détails d'un livre spécifique
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) // Recherche du livre par son ID
    .then((book) => res.status(200).json(book)) 
    .catch((error) => res.status(404).json({ error })); // Gestion de l'erreur si le livre n'est pas trouvé
};

// Fonction pour récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find() // Recherche de tous les livres dans la base de données
    .then((books) => res.status(200).json(books)) // Répond avec la liste des livres
    .catch((error) => res.status(400).json({ error })); // Gestion de l'erreur s'il y a un problème lors de la recherche
};

// Fonction pour récupérer les trois livres les mieux notés
exports.getBestRatedBooks = (req, res, next) => {
  Book.find() // Recherche de tous les livres dans la base de données
    .sort({ averageRating: -1 }) // Trie les livres par note moyenne dans l'ordre décroissant
    .limit(3) // Limite les résultats aux trois premiers livres
    .then((books) => res.status(200).json(books)) 
    .catch((error) => res.status(500).json({ error })); 
};
