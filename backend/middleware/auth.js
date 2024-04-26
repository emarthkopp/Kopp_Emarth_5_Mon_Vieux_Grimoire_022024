

// Importe le module jsonwebtoken pour gérer les tokens JWT
const jwt = require('jsonwebtoken');

// Middleware pour vérifier les tokens JWT dans les requêtes HTTP
module.exports = (req, res, next) => {
   try {
       // Récupère le token JWT de l'en-tête 'Authorization' de la requête HTTP
       const token = req.headers.authorization.split(' ')[1];

       // Vérifie et décode le token JWT en utilisant la clé secrète 'RANDOM_TOKEN_SECRET'
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

       // Récupère l'ID utilisateur à partir du token décodé
       const userId = decodedToken.userId;

       // Ajoute l'ID utilisateur à l'objet 'auth' de la requête pour une utilisation ultérieure
       req.auth = {
           userId: userId
       };

       // Appelle la fonction 'next()' pour passer au middleware suivant dans la chaîne de traitement
       next();
   } catch(error) {
       // En cas d'erreur (token invalide, expiré, etc.), renvoie une réponse d'erreur 401 (Non autorisé)
       res.status(401).json({ error });
   }
};
