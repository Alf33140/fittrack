//==================================================================================
// Controllers/exercice.controller.js Logique métier des exercices 
//
// Le controller orchestre: il valide les donnees recues,
// Appelle le modele pour accéder a la bdd, et renvoie la reponse
// Il ne contient jamais de SQL , c est le role du modele
//==================================================================================

const ExerciseModel = require('../models/exercise.model');

// liste les c ategories autiorisées (Correspond a l ENUM défini ds init.sql)
// Centralissée ici pour eviter  de la duppliquer dans chaque méthode
const VALID_CATEGORIES = ['Musculation', 'Cardio', 'Flexibilité'];

const ExerciseController = {

    // GET /api/exercice
    //Retourne la liste des filtres operationnels
  // GET /api/exercises?category=Musculation&search=squat
  async getAll(req, res) {
    try {
        //req.query contient les parametres de l url apres le ?
      // ex: /api/exercises?category=Cardio&search=corde -> (catgory: 'cardio", search: 'corde')
     
      const { category, search } = req.query;

      // Valider la catégorie si fournie
      //vALIDATION de la categorue AVANT de valider le modele
     //pour eviter d 'envoyer une requete SQL avec une valeur invalide
      if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      const exercises = await ExerciseModel.findAll({ category, search });

      //On retourne aussi le COUNT: utile côté Frontend pour afficher "X exercices"
      res.json({ exercises, count: exercises.length });

    } catch (err) {
      console.error('GetAll exercises error:', err);
      res.status(500).json({ error: 'Failed to fetch exercises.' });
    }
    },

    // --- GET /api/exercices/:id ---
    // req.params.id contient le segment dynamique de l url (ex: /exercices/)-> id = "42")
    // GET /api/exercises/:id
  async getOne(req, res) {
    try {
      const exercise = await ExerciseModel.findById(req.params.id);
      if (!exercise) return res.status(404).json({ error: 'Exercise not found.' });
      res.json({ exercise });
      //En cas d 'erreur (ex: bdd, Id invalide...)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch exercise.' });
    }
  },
  // POST /api/exercises
  // Créé un nouvel exercice , Requiert name et Category
  async create(req, res) {
    try {
      //req est parsé par express.json() (configuré server.js)
      const { name, category, muscle_group, description } = req.body;
      // Validation des champs obligatoires
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required.' });
      }
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
      const exercise = await ExerciseModel.create({ name, category, muscle_group, description });
      // 201 = created : convention REST pour signaler la creation d une ressource
      res.status(201).json({ message: 'Exercise created.', exercise });
    } catch (err) {
      console.error('Create exercise error:', err);
      res.status(500).json({ error: 'Failed to create exercise.' });
    }
  },  
  // --- PUT /api/exercices/:id ---
  // Met a jour un exercice existant .  Tous les champs sont optionnels (mise a jour partielle).
 
  async update(req, res) {
    try {
      const { name, category, muscle_group, description } = req.body;
      // on valide la categorie seulement si elle est fournie
      if (category && !VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
      // On verifie l'existance AVANT de de mettre a jour pour retourner un 404 clair
      const exercise = await ExerciseModel.findById(req.params.id);
      if (!exercise) return res.status(404).json({ error: 'Exercise not found.' });
      const updated = await ExerciseModel.update(req.params.id, { name, category, muscle_group, description });
      res.json({ message: 'Exercise updated.', exercise: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update exercise.' });
    }
  },
  // DELETE /api/exercises/:id
  // Supprime un exrecice. Echoue si l exercice est utilisé pendant une seance
  async delete(req, res) {
    try {
      const exercise = await ExerciseModel.findById(req.params.id);
      //Si il n est pas trouvé on arrete la requete
      if (!exercise) return res.status(404).json({ error: 'Exercise not found.' });

      //Si il existe on ajoute les données
      const deleted = await ExerciseModel.delete(req.params.id);
      if (!deleted) {
        return res.status(400).json({ error: 'Cannot delete exercise (may be in use by workouts).' });
      }
      res.json({ message: 'Exercise deleted.' });

    } catch (err) {
      // La contrainte FOREIGN KEY RESTRICT en Bdd leve cette rreur spécifique
      // Qd on tente de supprimer un exercice,référencé WorkoutExercice
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        // MySQL lance cette erreur quand la FK RESTRICT est violée

        return res.status(409).json({
          error: 'Cannot delete: exercise is used in one or more workouts.',
        // 409 = conflict: l operation est impossible à cause de l etat actuel
});
      }
      res.status(500).json({ error: 'Failed to delete exercise.' });
    }
  },
};

module.exports = ExerciseController;
