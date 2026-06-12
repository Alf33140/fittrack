//=====================================================================================
//
// controllers/stats.controller.js statistiques et progression
//
// Ce controlleur est volontairement simple : il n a qu une seule
// Responsabilité - agréger les stats de l utiisateur connecté
// et les retourner en une seule reponse JSON structurée
//======================================================================================

const WorkoutModel = require('../models/workout.model');
const UserModel    = require('../models/user.model');

const StatsController = {

    // GET /api/stats/progression
    // Retourne les stats completes de l utilisateur : résumé global
    // historique mensuel, répartition par catégorie et seances recentes
  async getProgression(req, res) {
    try {
        //Une promise ou "promesse" en javascript c est un objet qui represente
        // le resultat firut d une operation asynchrone
        // Promise.all([...]) execute plusieures requetes asynchrones EN PARALLELE
        // Au lieu d'attendre la fin de la premiere pour lancer la seconde
        // (ce qui prendrait 2fois plus de temps) les deux s executent simultanément
        // La destructuration [stat, user] récupere les resultats dans l ordre.
      // Exécution parallèle des deux requêtes (plus rapide que séquentiel)
      const [stats, user] = await Promise.all([
        WorkoutModel.getProgressionStats(req.user.id),
        UserModel.findById(req.user.id),
      ]);

        // On etourne les infos utilisateur utiles pour l affichage du profil
        // (sans le mot de passe - findById le filtre deja coté modele
      res.json({
        user: {
          username:     user.username,
          weight:       user.weight,
          goal:         user.goal,
          member_since: user.created_at, // Date d inscription pour "membre depuis"
        },
        stats,
        // stats contient : summary, monthly (6 mois), byCategory, recent (5 séances)
      });
    } catch (err) {
      console.error('Stats error:', err);
      res.status(500).json({ error: 'Failed to fetch stats.' });
    }
  },
};

module.exports = StatsController;