//======================================================
// routes/exercices.routes.js - Définition des routes des exrecices
//
//Toutes les routes ici sont protegées par AthMiddleware
// au lieu de passer par auMiddleware sur chaque route indiciduellement
// On l applique une seule fois avec router.use() : il s execute 
//automatiquement avant TOUTES les routes déclarées avec lui
//======================================================

const express            = require('express');
const router             = express.Router();
const ExerciseController = require('../controllers/exercise.controller');
const authMiddleware     = require('../middleware/auth.middleware');

// Applique authMiddleware à TOUTES les routes de ce router
// Plus efficace que de l'ajouter sur chaque route individuellement
router.use(authMiddleware);

// Applique AuthMiddleware sur toutes les routes de ce fichier 
// Plus concis que de l écrire  sur chaque router
//GET /api/exercices? category=Musculation&search=squat
router.get('/',    ExerciseController.getAll);  

//GET /api/exercices/:id
router.get('/:id', ExerciseController.getOne);    // GET /api/exercises/42

//POST /api/exercices/ Créé un exercice
router.post('/',   ExerciseController.create);   // POST /api/exercises

//PUT /api/exercices/:id Met a jour un exercice complet
router.put('/:id', ExerciseController.update);   // PUT /api/exercises/42

//DELETE /api/exercices/:id Supprime un exerce
router.delete('/:id', ExerciseController.delete); // DELETE /api/exercises/42

module.exports = router;