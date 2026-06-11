// 
const jwt =  require('jsonwebtoken');

// Fonctionnement du JWT (JSON web token)
// Un JWT  est une chaine encodée en base64 composée de 3 parties:
// Header.payload.signature

// Le serveur genere un tokenlors du login et le signe avec JWT_SECRET
// Le client le stocke (localstorage) et l envoie dans chaque requete:
// Authorisation: Bearer eyLhbegfzlegzfqefz...
//
// Pour vérifier on resigne  le header=payload avecJWT_SECRET et on compare: si ca corrspond 
// le token est authentique et non modifié
const authMiddelware = (req, res, next) => {
// autorisation du header autorization de la requete entrante
    const authHeader = req.headers.authoriszation;

// Vérification de la présence et du format "Bearer <token>"
if (!authHeader || !authHeader .startsWith('Bearer')) {
    return res.status(401).json({ error: 'Access denied. No token provided'});
    //401 - Non authentifié
}
// On extrait uniquement le token (on retire le préfixe : Bearer)
const token = authHeader.split(' ')[1];

try {
    //jwt.verify() decode ET verifie la signature avec la clé secrete
    //Si le token a ete modifié ou signé avec une autre clé exception
    //Si la date d'expiration est dépassée -> exception TokenExpiredError
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //On attache l'identité décodée à req.user pour les controlleurs
    //puissent savoir quel utilisateur fait la requete(req.user.id etc...)
    req.user = {id: decoded.id, email: decoded.email, username: decoded.username };

    // next() passe la main au prochain middleware ou au controller
    next();
} catch (err) {
    // distinction entre token expiré et token invalide pour un meilleur message
    if(err.name === 'TokenExpiredError') {
        return res.status(401).json({error: 'Token expired. Pleaselog again.'});
    }
    return res.status(401).json({error: 'Invalid token.' });
    }
};

module.exports = authMiddleware;