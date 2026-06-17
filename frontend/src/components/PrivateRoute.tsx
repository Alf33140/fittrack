//==========================================================================
// components/PrivateRoute.tsx - Protection des routes authentifiées
//
// ce composant agit comme un "garde" devant les pages privées
// Il est utlisé ds App.tsx pour developper les routes qui
// necessitent d etre connecté (Dashboard,Workout, etc...).
//===========================================================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function Privateroute() {
    // user = null  si non connecté , loading = true prendant la verif du token
    const {user, loading } = useAuth()

    //pendant que AuthContext vérifie le token (GET /Auth/me)
    // on affiche un spiner pour evityer une redirection ^prematurée vers /login

    if(loading) return <LoadingSpinner />

    // Si pas  dutilisateurs connectés , on redirige vers /login
    //'replace' remplace l entree ds l historique du navigateur:
    //appuyer "retour" apres la redirection ne parviens pas a la voie privée
    if(user) return <Navigate to="/login" replace />

    // Outlet rend le composant correspondant enfant a la route active
    //c est le mecanisme de React router v6 pour les routes imbriquées
    // Ex: <Route element={<Privateroute />}<RoutePath= "/dashboard" ..../></Route>
    return <Outlet />
 
}