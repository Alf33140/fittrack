//===================================================================================
//services/api.ts Instance axios centralisée

// Axios est une librairie pour faire des requetes http: depuis le navigateur.
// Plutot que de creer une nouvelle instance à chaque appel, on le configure
// une seule ici avec les reglages communs (baseURL, token JWT, gestion 401).
// tous les fichiers du frontend importent cette instance au lieu d axios directement
//====================================================================================

import axios from 'axios'

//axios.create() retourne une instance Axios préconfigurée
// baseURL: toutes les requuetes seront relatives a /api
// Ex: api.get('/auth/me') envoie GET /api/auth/me
// le proxi Vite (vite.config.ts) redirige /api - http://backend:5000
const api = axios.create({
    baseURL: '/api',
})

//====================================================================================
// INTERCEPTEUR DE REQUETE (avant envoi)
//====================================================================================
// Gere les erreurs http de facon centralisée
// Premier argument: callback appelé  si la reponse est un succes (2xx)
// Deuxieme argument: callback appelé si la reponse est une erreur
api.interceptors.request.use((config) => {
  // Le token est stocké dans localStorage après le login
  const token = localStorage.getItem('token')
  if (token) {
    // Format attendu par le backend : "Bearer eyJhbGci..."
    config.headers.Authorization = `Bearer ${token}`
  }
  return config // On retourne la config modifiée pour continuer la requête
})

//=====================================================================================
// INTERRUPTEUR DE REPONSE
//=====================================================================================
// Gere les erreurs http de facon centralisée
// Premier argument: callback appelé  si la reponse est un succes (2xx)
// Deuxieme argument: callback appelé si la reponse est une erreur
api.interceptors.response.use(
    (response) => response,
    
    (error) => {
        //401 = token expiré ou invalide - on deconnecte l utlisateur
        //sans cet interrupteur, il faudrait gerer ce cas ds chaque composants
        if(error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'

            //on propage l erreur pour que les composants puisse aussi la gerer si besoin
        }
        return Promise.reject(error)
    }
        // Succes: on laisse passer la reponse sans modification
   
) 

export default api
