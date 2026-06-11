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
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch exercise.' });
    }
  },
} 
