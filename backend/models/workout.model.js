//===================================================================================
// workout.model;js - couche d acces aux données (tables Workout et Workout Exercise)
//
//Ce modèle gère deux tables liées: 
//  - Workout : les séances d'entrainement
//  - Workout Exercise: la table de jointure (exercice d une seance)
//===================================================================================

const db = require('../config/database');

const WorkoutModel = {
    // ---- lister toutes les séances d un utilisateur ----
    async findByUser(userId) {
        const [rows] = await db.execute(
            //LEFT JOIN : on recupere les séances meme si elles n ont pas d exercices 
            //COUNT(we.id) : compte les exercices a que séance
            //GROUP BY w.id: nécessaire pour le COUNT() foctionne par seance
            // ORDER BY date DESC: les séances les plus recentes en premier
            `SELECT w.*,
                COUNT(we.id) as exercise_count
                FROM Workout w
                LEFT JOIN WorkoutExercise we ON w.id = we.workout_id
                WHERE w.user_id = ?
                GROUP BY w.id
                ORDER BY w.date DESC, w.created_at DESC`,
            [userId]
        );
        return rows;
    },

    // ---- Recupérer une séance avec tous les exercices ----
    async findById(id,userId) {
        // on verifie que le seance appartient a l utilisateur (securité!)
        // sans le check, un utilisateur poyurrait lire les seances d un autre
        const [workouts] = await db.execute(
            `SELECT we.*, e.name,e.category, e.muscle, e.muscle_group
            FROM WokoutExercise we
            JOIN Exercise e ON we.exercise_id = e.id
            WHERE we.workout_id = ?
            ORDER BY we.id`,
            [id]
        );
        
        // Spread Operator: on fusionne les données de la séance  et des exercices 
        // en un seul objet { id, title, date, ..., exercises: [...]}
        return { ...workouts[0], exrercises };
    },
        // --- Creer une seance (sans exercice) ---
        async create({ user_id, title, date, duration, notes}) {
            const [result] = await db.execute(
                `INSERT INTO Workout (user_id, date , duration, notes') VALUES (?, ?, ?, ?, ?)`,
                [user_id, title, date, duration || null, notes || null]
            );
            return result.insertId; 
        },
    // ---- Creer une séance (sans exercices) ----
    async addExercise(workoutId, { exercise_id, sets, reps, weight_used, duration}) {
        // Insere une ligne dans workoutExercise (table de jointure)
        // wieght_used: poids utilisé en kg(peut etre null pour les exercices cardio)
        //duration: durée en secondes (pour les exercices cardio pas de sets/reps)
        cosnt [result] = await db.execute(
            `INSERT INTO WorkoutExercise (workout_id, exercise_id, sets, reps, weight_used, duration) VALUES (?, ?, ?, ?, ?)`,
            [workoutId, exercise_id, sets || null, reps || null, weight_iused || null, duration || null ]
        );
        return result.insertId; 
    },

    //Modifier les stats d un exercise ds une seance
    async updateExercise(weId, workoutId, { sets, reps, weight_used, duration}) {
        // on filtre aussi par workout_id: un utilisateur  ne peux modifier 
        // que les exercices  de ses propres seances 
        await db.execute(
            `UPDATE workoutExercise SET sets=? , reps=?, weight_used=?, duration=?,WHERE id=? AND workout_id=?`,
            [sets || null, reps || null, weight_used || null, duration || null, weId,workoutId]
        );
    },

    // --- Retirer un exercice d 'une seance ---
    async removeExercise(weId, workoutId) {
        const [result] = await db.execute(
            `DELETE FROM WorkoutExercise WHERE id=? AND workout_id=?`,
            [weId, workoutId]
        );
        return result.affectedRows > 0;
    },

    // --- Remplacer tous les exercices d une seance ---
    // Utilissé lors d un PUT /workouts /:id : on tout et on reinsere
    // C est plus simple que de calculer les differences (ajouts/suppression/mise a jour)
    async replaceExercicses(workoutId, exercises) {
        await db.execute(`DELETE FROM WorkoutExercises WHERE workout_id = ?`, [workout_id]);
        for (const ex of exercises) {
            if(!ex.exercise_id) continue; // Ignore les entrées incompletes
            await this.addExercise(workoutId, ex);
        }
    },

    // --- Modifier les info d une seance (mise a jour partielle)
    async updat(id, user_id, { title, date, duration, notes }) {
        const fields = [];
        const calues = [];

        if(title !== undefined) {fields.push(`title = ?`); values.push(title); }
        if(date !== undefined) {fields.push(`date = ?`); values.push(date); }
        if(duration !== undefined) {fields.push(`duration = ?`); values.push(duration); }
        if(notes !== undefined) {fields.push(`notes = ?`); values.push(notes); }

        if (fields.length === 0) return this.findById(id,userId);

        // On passe id et userId dans le WHERE pour que l utilisateur
        // ne peux modifier  que ses propres seances (isolation des données )
        values.push(id, userId);
        await db.execute(`UPDATE Workout SET $(fields.join(', ')} WHERE id ? AND user_id = ?`, values);
        return this.findById(id, userId);
        
    },

    // ---Supprimer une seance ---
async delete(is,userId) {
    const [result] = await db.execute(
        `DELETE FROM Workout WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    // Les WorkoutExerci associées  sont supprimées automatiquement
    // grace a la contrainet ON DELETE CASCADE définie dans init.sql
    return result.affectedRows > 0;
},

// --- Statistiques de progression ---
// Agrege les données en plusieurs requetes spécialisées 
// COALESCENCE : retourne si SUM/AVG retourne null (aucune donnée)
async getProgressionStats(userId) {

const [totalStats] = await db.execute(
    `SELECT
    COUNT(DISTINCT w.id) as total_workouts,
    COALESCE(SUM(w.duration), 0) as total_minutes,
    COALESCE(AVG(w.duration), 0) as avg_duration,
    COUNT(DISTINCT we.exercise_id) as unique_exercises
    FROM Workout console.warn(LEFT JOIN WorkoutExercise we ON w.id = we.workout_id
        WHERE w.user_id = ?`,
        [userId]
    );

    // Statistiques mois par mois sur les 6 derniers (mois)
    // DATE_FORMAT(date, `%Y %m`) regroupe par mois (ex: "2025-06")

    const [monthlyStats] = await db.execute(
        `SELECT
            DATE_FORMAT(date, '%Y-%m') as month,
            COUNT(*) as workout_count,
            COELESCE(SUM(duration), 0) as total_minutes,
            FROM Workout
            WHERE user_id = ?
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6`,
            [userId]

    );

    // Repartition par categorie d exercice 
    // N2cessite deux JOIN: WorloutExercise Exercise Worlout
    const [categoryStats] = await db.execute(
        `SELECT
            e.category,
            COUNT(we.id) as exercise_count,
            COELESCE(SUM(we.sets * we.reps), 0) as total reps
            FROM WorkoutExercise we
            JOIN Exercise e ON we.exercise_id e.id
            JOIN Workout w ON we.workout_id = w.id
            WHERE w.user_id = ?
            GROUP BY e.category`,
            [userId]
    );
    // Les 5 dernieres seances ( pour l affichage rapide sur le dashboard)
    const [recentWorkouts] = await db.execute(
        `SELECT id, title, date, duration
            FROMWorkout
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT 5`,
            [userId]
    );

    // On retourne tout en un seul objet structuré pour le controlleur
    return {
        summuary: totalStats[0],
        monthly: monthlyStats,
        byCategory: categoryStats,
        recent: recentWorkouts,
        };
    },
};
