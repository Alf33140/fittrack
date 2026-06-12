const express           = require('express');
const router            = express.Router();
const WorkoutController = require('../controllers/workout.controller');
const authMiddleware    = require('../middleware/auth.middleware');

// ALL workout  routes are protected
router.use(authMiddleware); // Toutes les routes protégées

// CRUD Séances
// GET /api/workouts
router.get('/',    WorkoutController.getAll);

//GET /api/workouts/:id 
router.get('/:id', WorkoutController.getOne);

//POST /api/workouts/
router.post('/',   WorkoutController.create);

//PUT /api/workouts/:id 
router.put('/:id', WorkoutController.update);

//DELETE /api/workouts/:id 
router.delete('/:id', WorkoutController.delete);

// Gestion des exercices DANS une séance
//POST /api/workouts/:id/exrecices 
router.post('/:id/exercises',            WorkoutController.addExercise);
// → Ajouter un exercice à la séance :id

router.patch('/:id/exercises/:weId',     WorkoutController.updateExercise);
// → Modifier les stats de l'exercice :weId dans la séance :id
// PATCH (pas PUT) : modification partielle d'une ressource
//PATCH /api/workouts/:id/exercices/weId
router.delete('/:id/exercises/:weId',    WorkoutController.removeExercise);
// → Retirer l'exercice :weId de la séance :id
//DELETE /api/workouts/:id/exercices/weId
module.exports = router;