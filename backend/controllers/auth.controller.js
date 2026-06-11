//==============================================================
// controller/auth.controller.js - logique dauthentification
//
//Recoit la requete (req) du routeur, effectue
//la logique metier (validation, appels au modele) puis envoie
// la reponse (res) . il ne fait jamais de SQL directement:
// C'est le rôle du modele (UserModel).
//============================================================

const jwt       = require('jsonwebtoken');
const UserModel = require('../models/user.model');

// ── Utilitaire de genration du token : génère un JWT signé ──────────────
//jwt.sign(payload,secret,options) créé u token signé
//Le payload contioens les données accessibles sans vérifications (non chifrées !)
// Ne jamais mettre le mot de passe ou des données sensibles.
const generateToken = (user) => {
  return jwt.sign(
    // Payload : données encodées dans le token (lisibles côté client)
    { id: user.id, email: user.email, username: user.username },
    // Secret : clé de signature (JAMAIS dans le code, toujours dans .env)
process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const AuthController = {

  // ── POST /api/auth/register ──────────────────────────────────────
  // créé un nouveau compte utilisateur et retourne un token JWT
  async register(req, res) {
    try {
        // req.body contient les données envoyées par le client en JSON
      const { username, email, password, weight, goal } = req.body;

      // Validation côté serveur - ne jamais faire confiance au client
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required.' });
      }
      //400 = Bad Request : La requete est mal formée
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      // Vérification unicité email et username
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already in use.' });
        // 409 = Conflict (ressource existe déjà)
      }
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken.' });
      }

      // Création (le model hash le mot de passe avec bcrypt)
      const userId = await UserModel.create({ username, email, password, weight, goal });
      //on recupere l'utilisateur sans le mot de passe pour la reponse
      const user   = await UserModel.findById(userId);
      const token  = generateToken(user);
 
    // 201 = Created (nouvelle ressource créée)
    res.status(201).json({ 
        message: 'Account created successfully.',
        token, 
        user 
    });
     
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Failed to create account.' });
    }
  },

  // ── POST /api/auth/login ─────────────────────────────────────────
  // Vérifie les identifiants et retourne un token JWT si valides.
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

    // Recherche de l utilisateur par email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
        // On ne précise PAS si c'est l'email ou le mot de passe qui est faux
        // (sécurité : évite l'énumération d'utilisateurs)
      }
    // bcript.compare() compare le mot de passe en clair avec le hash en base
      const isValid = await UserModel.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      // Destructuring : on retire le password du user avant de l'envoyer et on garde le reste ds 'userWithoutPassword'
      // La convention '_' signale une variable intentionnelement  non utilisée
      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(user);

      res.json({ 
        message: 'Login successful.', 
        token, 
        user: userWithoutPassword 
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
  },

  // ── GET /api/auth/me ─────────────────────────────────────────────
  // retourne le profil de l 'utilisateur actuellement connecté
  // Cette route est protégée: authMiddleware a déja vérifié le JWT
  // et plaé l identité dans req.user vant d arriver ici.
  async me(req, res) {
    try {
      // req.user est attaché par authMiddleware
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch profile.' });
    }
  },
};

module.exports = AuthController;