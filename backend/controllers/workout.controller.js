//===========================================================================
// Controller/Workout.controller.js Logique métier des éances
// 
// Il gere les opérations CRUD sur les séances ET les exercices
// d'une séance (ajout, modification, suppression d un exercice)
// rq.user est injecté par auth Middleware (contient id, email, username)
//============================================================================

const WorkoutModel = require('../models/workout.model');

const WorkoutController = {

  // GET /api/workouts — séances de l'utilisateur connecté seulement
  // Retourne toutes les seances de l'utilisateur connecté
  async getAll(req, res) {
    try {
        // req.user.id est l'id de l utilisateur authentifié (depuis le JWT)
        // Chaque Utilisateur NE VOIT QUE SES SEANCES isolation garantie côté SQL
      const workouts = await WorkoutModel.findAllByUser(req.user.id);
        // On renvoie la liste des eances et leur nb total en JSON

      res.json({ workouts, count: workouts.length });
    } catch (err) {
        // Si erreur, on l affiche ds les logs serveur pour debug
      console.error('GetAll workouts error:', err);
        // Et on renvoie une erreur 500 au client
      res.status(500).json({ error: 'Failed to fetch workouts.' });
    } 
  },
  // GET /api/workouts/:id
  // Retourne une seance avec ses exercices détaillés
  async getOne(req, res) {
    try {
      // findById prend aussi user_id pour s'assurer qu'on ne lit
      // pas les séances d'un autre utilisateur (sécurité IDOR) on  vérifie l appartenance
      // Un utilisateur ne peux acceder a la seance d un autre du coup
      const workout = await WorkoutModel.findById(req.params.id, req.user.id);
      if (!workout) return res.status(404).json({ error: 'Workout not found.' });
      res.json({ workout });
    } catch (err) {
         res.status(500).json({ error: 'Failed to fetch workout.' });
    }
  },
    // POST /api/workouts
    // créé une seance avec des exercices en une seule requete
  async create(req, res) {
    try {
      const { title, date, duration, notes, exercises } = req.body;
      if (!title || !date) {
        return res.status(400).json({ error: 'Title and date are required.' });
      }

      //ETAPE 1. Création de la séance (sans exercices)
      const workoutId = await WorkoutModel.create({
        user_id: req.user.id, 
        title, 
        date, 
        duration, 
        notes,
      });

      // ETAPE 2. Ajout des exercices si fournis ds le body
      // Array.siArray() vérifie que exercices est bien un tableau (pas undefined)
      if (Array.isArray(exercises) && exercises.length > 0) {
        for (const ex of exercises) {
          if (!ex.exercise_id) continue; // ignore les entrées sans exercice
          await WorkoutModel.addExercise(workoutId, ex);
        }
      }

      // ETAPE 3. On relit la séance complète (avec exercices) pour la reponse
      const workout = await WorkoutModel.findById(workoutId, req.user.id);
      res.status(201).json({ message: 'Workout created.', workout });

    } catch (err) {
      console.error('Create workout error:', err);
      res.status(500).json({ error: 'Failed to create workout.' });
    }
  },
  // PUT /api/workouts/:id
  // Met à jour une séance et remplace completement les exercices
  async update(req, res) {
    try {
      const { title, date, duration, notes, exercises } = req.body;

      // verification d existence et appartenance AVANT LA MODIFICATION
      const existing = await WorkoutModel.findById(req.params.id, req.user.id);
      if (!existing) return res.status(404).json({ error: 'Workout not found.' });

      await WorkoutModel.update(req.params.id, req.user.id, { title, date, duration, notes });

      // Si exercises est fourni : On remplace tt (DELETE + INSERT)
      // Plus simple que de calculer le diff entre ancien et nouvel état
      if (Array.isArray(exercises)) {
        await WorkoutModel.replaceExercises(req.params.id, exercises);
        // replaceExercises : DELETE puis INSERT → liste propre à chaque PUT
      }

      const workout = await WorkoutModel.findById(req.params.id, req.user.id);
      res.json({ message: 'Workout updated.', workout });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update workout.' });
    }
  },
  // POST /api/workouts/:id/exercises 
  // Ajoute un exercice aune seance existente
  async addExercise(req, res) {
    try {
        // On verifie que le seance existe et appartient a l'utilisateur
      const workout = await WorkoutModel.findById(req.params.id, req.user.id);
      if (!workout) return res.status(404).json({ error: 'Workout not found.' });

      const { exercise_id, sets, reps, weight_used, duration } = req.body;
      if (!exercise_id) return res.status(400).json({ error: 'exercise_id is required.' });

      await WorkoutModel.addExercise(req.params.id, { exercise_id, sets, reps, weight_used, duration });

      // On retourne la seance mise a jour (avec le nouvel exrecice inclus)
      const updated = await WorkoutModel.findById(req.params.id, req.user.id);
         res.status(201).json({ message: 'Exercise added.', workout: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add exercise.' });
    }
  },
  // PATCH /api/workouts/:id/exercises/:weId 
  //Modifier les stats (séries, répétitions, poids) d'un exercice dans une seance
  async updateExercise(req, res) {
    try {
      const workout = await WorkoutModel.findById(req.params.id, req.user.id);
      if (!workout) return res.status(404).json({ error: 'Workout not found.' });

      const { sets, reps, weight_used, duration } = req.body;
        // req.params.weId = id dans WorloutExercice ( la table de jointure)
        //req.params.id = id de la seance (pour verifier l appartenance)
      await WorkoutModel.updateExercise(req.params.weId, req.params.id,
        { sets, reps, weight_used, duration });

      const updated = await WorkoutModel.findById(req.params.id, req.user.id);
      res.json({ message: 'Exercise updated.', workout: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update exercise.' });
    }
  },
  // DELETE /api/workouts/:id/exercises/:weId 
  // retire un exercice d 'une seance (sans supprimer l exercice lui-meme)
  async removeExercise(req, res) {
    try {
    // On récupere la seance (workout) en bdd avec identification du user concerne
      const workout = await WorkoutModel.findById(req.params.id, req.user.id); 
    // Si la seance n existe pas pas ou appartient a un autre user -> erreur 404
      if (!workout) return res.status(404).json({ error: 'Workout not found.' });
    // On supprime l'exercice de la seance grace a son ID(id exercice et id seance)
      const deleted = await WorkoutModel.removeExercise(req.params.weId, req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Exercise not found in this workout.' });
    // On récupère la séance a nouveau, mais sans l exercice qui aété supprimé
      const updated = await WorkoutModel.findById(req.params.id, req.user.id);
      res.json({ message: 'Exercise removed.', workout: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove exercise.' });
    }
  },
// DELETE /api/workouts/:id
// Supprime une seance ET TOUS SES EXERCICES (CASCADE dans la BDD)
  async delete(req, res) {
    try {
    // delete() retourne false si la seance n existe pas ou n appartient pas a l'user
      const deleted = await WorkoutModel.delete(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ error: 'Workout not found.' });
      res.json({ message: 'Workout deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete workout.' });
    }
  },
};

module.exports = WorkoutController;
