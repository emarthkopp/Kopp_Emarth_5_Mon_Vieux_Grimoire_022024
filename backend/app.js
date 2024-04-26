// Importe les modules nécessaires
const mongoose = require('mongoose'); // Pour la connexion à MongoDB
const express = require('express'); // Pour créer l'application Express
const path = require('path'); // Pour manipuler les chemins de fichiers

// Importe le module dotenv pour charger les variables d'environnement à partir du fichier .env
const dotenv = require('dotenv');
dotenv.config();

// Crée une application Express
const app = express();

// Importe les routes pour les livres et les utilisateurs
const booksRoutes = require ('./routes/booksroutes')
const userRoutes = require('./routes/user');

// Connecte l'application à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware pour parser le corps des requêtes au format JSON
app.use(express.json());

// Middleware pour gérer les CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
   // Autorise l'accès à l'API depuis n'importe quelle origine
   res.setHeader('Access-Control-Allow-Origin', '*');
   // Autorise certains en-têtes dans les requêtes
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   // Autorise certains types de méthodes HTTP
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
 });

// Middleware pour gérer les routes des livres
app.use('/api/books', booksRoutes);

// Middleware pour gérer les routes d'authentification des utilisateurs
app.use('/api/auth', userRoutes);

// Middleware pour servir les fichiers statiques dans le répertoire 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// Exporte l'application Express
module.exports = app;
