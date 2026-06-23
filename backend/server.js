require('dotenv').config();

const express    = require('express');
const cors       = require('cors'); 

// on importe fichiers de routes - chacun gere un groupe de routes
const authRoutes     = require('./routes/auth.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const workoutRoutes  = require('./routes/workout.routes');
const statsRoutes    = require('./routes/stats.routes');

// Création de l application Express
const app  = express();

// le port viens du .env ; si absent ,  5000 par defaut
const PORT = process.env.PORT || 5000;

//CORS(Cross Origin Ressources Sharing)
// par sécurité , les navigateurs bloquent les requetes vers un domaine différent
// ce middleware autorise explicitement le frontend (localhost:3000) à appeler l api
// sans CORS le navigateur rejetterait les requetes avant meme qu'elles arrivent
app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // autorise l envoi des cookies/headers d'auth
    méthos: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-Type', 'Authorisation'], // Autorisation JWT Bearer
}));

// --- Middlewares de parsing ---
// express.json() : lit le corps des requetes JSON et le met dans req.body
// qans lui , req.body  serait undifined pour les POST / PUT  avec le JSON
app.use(express.json());

// express.urlencoded() : lit les données des formulaires html classiques
app.use(express.urlencoded({ extended:true }));

// Route Health check
// route qui de verifier quie l API fonctionne bien
app.get('/api', (req, res) => {
    res.json({
        message: 'FitTrack API is running',
        version: '1.0.0',
        endpoints:{
            auth: '/api/exercises',
            exercises: '/api/exercises',
            workouts: '/api/workouts',
            stats: '/api/stats',
        }
    });
});

// Branchement des routes
// app.use (prefice, routeur): toutes les routes définies ds le fichier seront accessibles sous le prefixe.

app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api.workouts', workoutRoutes);
app.use('api/stats', statsRoutes);

// Middleware 404
// Ce middleware doit etre palcés après toutes les routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found'});
 });   

// Middleware de gestion des erreurs 
//Signature spéciale avec 4 paramètres
// reconnait automatiquement ce middleware comme gestionnaire d erreurs

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message});
});

// Demarrage du seveur
// On ne demarre pas  en mode test: les tests importent directement 'app' et supertest créé son propre serveur temporaire
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`FitTrack API Running on port ${PORT}`);
        console.log(`Environnement ${process.env.NODE_ENV}`);
    });
}

// Export de l'app pour les tests (supertest l importe directement)
module.exports = app;
