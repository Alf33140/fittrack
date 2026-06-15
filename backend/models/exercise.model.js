//=====================================================================
//model.exercise.model.js 
//
//=====================================================================

const db = require('../config/database');

const exerciseModel = {

    // --- Lister les exercices avec les filtres optionnels ---
    async findAll({category,search} = {}) {
        // On démarre avec une condition toujours vraie (WHERE 1=1)
        // pour pouvoir ajouter des AND dynamiquement sans se soucier du premier AND
        let query = 'SELECT * FROM Exercise WHERE 1=1';
        const values = [];

        //filtrage par categorie (si fourni dans  ?category=...)
        if (category) {
            query += ' AND category = ?';

            //query + 'AND category = ?' = query
            values.push(category);
        }
    

    //Recherche textuelle sur le nom OU le groupe musculaire
    // LIKE avec % = contient (ex:%squat% trouve  "Front SQuat" , "Back Squat",...)

    if (search) {
        query += ' AND (name LIKE ? OR muscle_group LIKE ?)';
        values.push(`%${search}%`, `%${search}%`);

    }
    query += ' ORDER BY category, name';
    const [rows] = await db.execute(query, values);
    return rows;
    }, 
   
   
   // --- Creer un exercice ---
   async create({ name, category, muscle_group, description }) {
    const [result] = await db.execute(
        'INSERT INTO Exercise (name, category, muscle_group, description) VALUES (?, ?, ?, ?)',
        [name, category, muscle_group || null, description || null]
    );

    // On relit l'exercice créé depuis la bdd pour retourner l objet complet
    // (avec l'id, created_at,etc...) plutot que juste l'insertId
    return this.findById(result.insertId);

   },

   // ---- Mettre a jour un exercice (mise a jour partielle) ----
   async update(id, { name, category, muscle_group, description }) {

    // Meme technique que UserModel.update : construction dynamique
    // pour ne modifier que les champs effectivement fournis
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name);}
    if (category !== undefined) {fields.push('category = ?'); values.push(category);}
    if (muscle_group !== undefined) {fields.push('muscle_group = ?'); values.push(muscle_group);}
    if (description !== undefined) {fields.push('description =?'); values.push(description);}
   

   // Aucun champ a modifier - on retourne l existant sans toucher la bdd
   if (fields.length === 0) return this.findById(id);

   values.push(id);
   await db.execute(`UPDATE Exercise SET ${fields.join(', ')} WHERE id = ?`, values);
   return this.findById(id);
},
   // --- Supprimer un exercice ---

   async delete(id) {
    const [result] = await db.execute('DELETE FROM Exercise WHERE id = ?', [id]);

        //affectedRows indique combiend e lignes ont été supprimées
        //Si 0 l exercice n existait pas (ou est protégé par un contrainte FK).
        // La contrainte RESTRICT en BDD levera une rreur ER_ROW_IS_REFERENCED_2
        // si lexercice est utilisé dans un WorkOutExecise (gere dans le controlleur)
        return result.affectedRows > 0;
    },
   };

   module.exports = exerciseModel;