//========================================================================================
// context/AuthContext.tsx - Contexte d'authentification REACT
// 
// Le contexte API  de REACT permet de partager des données entre composants
// sans passer sur les props a chaque niveau (prop drilling)
// Ici , il expose l utilisateur connecté et les fonctions login/register/logout
// à n importe quel composant de l arbre, via le hook useAuth
//========================================================================================

import { createContext, useState, useEffect, ReactNode } from 'react'
import api from '../services/api'
import { user } from '../types'

// --- Type TypeScript ---
//Interface decrivant les donnees que le contexte expose
interface RegisterData {
    username: string
    email: string
    password: string
    weight?: number // ? = optioonnel en TypeScript
    goal?: string
}

export interface AuthContextType {
    user: User | null  //null = non connecté
    loading: boolean // true pendant la verification  initiale du token
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
}

//--- Creation du contexte ---
// createContext(null) : valeur par defaut = null (sans provider)
// le type generique <AuthContextType | null>  permet à TypeScript de savoir

// ce que contient le contexte
export const Authcontext = createContext<AuthContextType | null>(null)

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
    const [loading,  setloading] = useState(true)

    // --- Verification du token au demarrage de l app ---
    // useEffect avec [] en dépendance = s execute une seule fois au montage
    // Si le token est déja stocké (session précédente), on verifie sa validité
    
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            //GET api/autn/me retourne le profil si le token est valide
            api
                .get('/auth/me')
                .then((res) => setUser('res.data.user'))
                //si le token est expiré, l intercepteur axios le supprime(voir api.ts)
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setloading(false)) // Fin du chargement dans tous les cas
        } else {
            setLoading(false) // Pas de token - On sait deja qu il n est pas connecté
        }
    }, [])
}

// --- Login ---