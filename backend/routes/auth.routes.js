// =======================================================
// routes/auth.routes.js - Definition des routes d 'authentification
// Le routeur Express regroupe les routes d un meme domaine fonctionnel
// il est monté ds server.js sous le prefixe /api/auth.
// son role : reier une url methode http à un controlleur
//======================================================

const express        = require('express');

//express.Router() crée un mini routeur indépendant qu on peux exporter
// et brancher dans server.js avec api.use('/api/auth', authRoutes)

const router         = express.Router();

const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

//POST /api/auth/register - creation de compte (publique , pas de JWT requis)
router.post('/register', AuthController.register);

//POST /api/auth/login - connexion (publique, pas de JWT requis)
router.post('/login', AuthController.login);

// GET /api/auth/me — PROTÉGÉ par JWT
// authMiddleware s'exécute AVANT AuthController.me
// Si le token est invalide, authMiddleware retourne 401 et stoppe la chaîne
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
