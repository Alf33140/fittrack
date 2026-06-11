//Ce fichier exporte un pool de connexion

const mysql = require('mysql2/promise');

// --- Qu est ce qu un pool de connexion?
// Etablir une connexion mssql  à chaque requete est couteux (environ 100ms)
// Un pool maintient eun ensemble de connexions ouvertes et pretes a l emploi
// Quand une requete arrive , elle prends une connexion qui est disponible et l utilises
// puis la relache dans le pool (elle n est pas fermée elle est juste réutilisée)

const pool = mysql.createPool({
    // les valeurs viennent du .env
    host: process.env.DB_PORT || 'mysql',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'fittrack',
    user: process.env.DB_USER || 'fittrack_user',
    password: process.env.DB_PASSWORD || 'fittrack_pass',

    charset: 'utf8mb4',
// si toutes les connxions sonty prise ca met en attente le temps qu une connexion soit libre
    waitForConnections: true,
// nombre de connexions simultanées dans le pool
    connexionLimit: 10,
// 0 = file d attente illimitée
    queueLimit: 0,
// stocke les dates en UTC dans mySQL
    timezone: '+00:00',
});

// test de connexion  au demarrage
// On vérifie immédiatement que mySQL  est joignable
// getconnection() prends une connexion du pool 

pool.getConnection()
    .then(conn => {
        console.log('MySQL connected Successfully');
        conn.release(); // toujours liberer la connexion apres usage
    })
    .catch(err => {
        console.error('MySQL connection failed', err.message);
    });

    // Export du pool
    module.exports = pool;