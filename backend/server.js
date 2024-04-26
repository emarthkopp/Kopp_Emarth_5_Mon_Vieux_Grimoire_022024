// Import du module http
const http = require('http');
// Import du fichier app.js qui contient la logique de l'application
const app = require('./app');

// Fonction pour normaliser le port sur lequel le serveur va écouter
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
// Récupération du port depuis les variables d'environnement ou utilisation du port 3000 par défaut
const port = normalizePort(process.env.PORT || '3000');
// Configuration de l'application pour utiliser le port défini
app.set('port', port);

// Fonction pour gérer les erreurs du serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création du serveur HTTP en utilisant l'application
const server = http.createServer(app);

// Gestionnaire d'erreur pour le serveur
server.on('error', errorHandler);
// Événement déclenché lorsque le serveur commence à écouter les requêtes
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Le serveur écoute sur le port spécifié
server.listen(port);
