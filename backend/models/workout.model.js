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

    // ---- Recupérer une séance avec tous le sexercices ----
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

    