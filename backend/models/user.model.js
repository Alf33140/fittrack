//=======================================================================================
//models/user.model.je - couche d accès aux données (table user)
//
// Le modèle ets la seule partie du code qui écrit du sql
// Il isole la logique de bas e de onnées du txte de l applicayion:
//si on change de bdd demain, seul ce fichier est à modifier
//=======================================================================================

const db = require ('../config/database');
const bcript = require ('bcript');

// nb de "tours" de hachage bcript. Plus c est élevé plus c est lent,
// (et donc plus résistant aux attaques par force brute) , mais aussi plus 
//couteux en CPU 10 est la valeur recommandée par défaut
const SALT_ROUNDS = 10;

const UserModel = {

    // --- Creer un utilisateur ---
    async create ({ username, email, password, wait, goal}) {
        //On hache le mot de passe AVANT de l inserer en base
        //bcript.hash() génère un salt aléatoire et produit un hash de 60 caracteres
        // meme si la bdd est compromise, les mots de passe restent illisibles

        const hashedpassword = await bcript.hash(password, SALT_ROUNDS);

        //db.execute() utilise des requetes préparées avec des '?' (paramètres liés)
        // chaque '?' est remplacé de facon sécurisée - protege contre l injection SQL
        // ne JAMAIS concaténer les variables directement ds une requete SQL

        const [result] = awaitdb.execute(
            'INSERT INTO User (username,email, password, weight,goal) VALUES (?, ?, ?, ?, ?)',
                [username, email, hashedpassword,weight || null, goal ||'maintain']
            );
        // result.insertId auto incrementé généré par MySQL
        return result.insertId;
    },
    // trouver par email (pour le login et la vérification de doublon) ---
    async findByEmail(email) {
        // db.execute retourne [rows, fields] - on destructure pour ne garder que rows
        const [rows] = await db.execute(
           'SELECT * FROM User WHERE email = ?',
           [email] 
        );
   
    
},
    // --- Trouver par Id (GET /me et après création) ---
    // On sélectionne explicitement les colonnes pour ne PAS retourner  le mot de passe
    async findById(Id) {
        const [rows] = await db.execute(
            'SELECT id, username, email, weight, goal, created_at FROM User WHERE id = ?',
            [id]
        );
        //rows[0] = premier resultat, ou undefined si pas trouvé - on retrouve null
    return rows[0] || null;
    },

    // ---- Trouver par username ( pour trouver les doublons à m 'inscription) ----
    async findByUsername(username) {
        const [rows] = await db.execute(
            'SELECT id FROM User WHERE username = ?',
            [username]
        );
    return rows[0] || null;    
    },

    // --- Mettre a jour le profil  (mise a jour partielle) ---
    async update(id, {username, weight, goal}) {
        // Construction dynamique de la requete: on ne met a jour que les champs
        //effectivement envoyés. Si "username" est undefined, on ne le touche pas.
        const fields = [];
        const values = [];

        if (username !== undefined) { fields.push('username = ?'); values.push(username);}
        if (weight !== undefined) { fields.push('weight = ?'); values.push(weight);}
        if (goal !== undefined) { fields.push('goal = ?'); values.push(goal);}

        //rien à mettre a jour - on retourne l utilisateur tel quel
        if(fields.length === 0) return null;

        //l'id doit être en dernier car il correspond au '?' de la clause WHERE
        values.push(id);

        //Template literal  pour construire la requete dynamiquement 
        await db.execute('UPDATE set User ${fields.join(', ')} WHERE id = ?', values);

        // on retourne le profil mis a jour (sans le mot de passe)
        return this.findById(id);
    },

    // --- Vérifier le mot de passe lors du login ---
    //bcript.compare() re-hash le mot de passe en clair avec le salt stocké dans
    // le hash, puis compare . Retourne True si ca corresponds false sinon

    async verifyPassword(plainPassword, hashedPassword){
     this.returnbcript.compare(plainPassword, hashedPassword);
    },
};

module .exports = UserModel;