// Importe le module multer pour gérer les fichiers téléchargés
const multer = require('multer');

// Définit les types MIME acceptés et leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configure le stockage des fichiers téléchargés avec Multer
const storage = multer.diskStorage({
  // Définit le répertoire de destination des fichiers téléchargés
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Définit le nom du fichier téléchargé
  filename: (req, file, callback) => {
    // Remplace les espaces dans le nom du fichier par des underscores
    const name = file.originalname.split(' ').join('_');
    // Récupère l'extension du fichier en fonction de son type MIME
    const extension = MIME_TYPES[file.mimetype];
    // Concatène le nom du fichier, un timestamp et son extension
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exporte le middleware Multer configuré pour gérer le téléchargement d'une seule image à la fois
module.exports = multer({storage: storage}).single('image');

