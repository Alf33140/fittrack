//========================================================================================
// context/AuthContext.tsx - Contexte d'authentification REACT
// 
// Le contexte API  de REACT permet de partager des données entre composants
// sans passer sur les props a chaque niveau (prop drilling)
// Ici , il expose l utilisateur connecté et les fonctions login/register/logout
// à n importe quel composant de l arbre, via le hook useAuth
//========================================================================================

import { useState, useEffect, type ReactNode } from 'react'
import api from '../services/api.ts'
import {AuthContext, RegisterData} from './AuthContext'
import { type User } from '../types/index.ts'


//=============================================================================
//AuthProvider - Composant qui enveloppe l application
//=============================================================================
//{children} : les composants enfants a rendre ( toute l app ds App.tsx)
// ReactNode : type TypeScript pour n importe quel contenu rendable

export function AuthProvider({ children }: { children: ReactNode }) {
    // user: l'utilisateur
    const [user, setUser] = useState<User | null>(null)

    // loading: empeche d'afficher une page avant de savoir si l'user est connecté
    // Evite le flash  de la page login avant la redirection vers le dashboard
    const [loading,  setLoading] = useState(() => {
        return !!localStorage.getItem('token')
    })

    // --- Verification du token au demarrage de l app ---
    // useEffect avec [] en dépendance = s execute une seule fois au montage
    // Si le token est déja stocké (session précédente), on verifie sa validité
    
    useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data.user))

        .catch(() => localStorage.removeItem('token'))

        .finally(() => setLoading(false))

    }
  }, [])


// --- Login ---
// async/await : onattends la reponse avant de continuer
// Lance une except la requete echoue (catch géré dans le composant login)
    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', {email, password})
        localStorage.setItem('token', res.data.token) //persiste le token entre les sessions
        setUser(res.data.user)
    }

// --- Register ---
// Meme logique que login: le backend créé le compte ET retourne le token
    const register = async (data: RegisterData) => {
        const res = await api.post('/auth/register', data)
        localStorage.setItem('token', res.data.token)
        setUser(res.data.user)
    }

// --- Logout ---
// coté Client: on supprime le token et on vide l etat
// coté Serveur: les JWT sont stateless (pas de session a invalider)

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null) // React re rend les composants - PrivateRoute redirige vers /login
    }

// Rendu du Provider ---
// AuthContext.Provider rend les valeurs accessibles à tous les composants enfants
// via useContext(AuthContext) ou le hook useAuth (hooks/useAuth.ts)
    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    )
}