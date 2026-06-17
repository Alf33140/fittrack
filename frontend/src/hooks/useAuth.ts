//=======================================================
// hooks/useAuth.ts - Hook personnalisé pour accéder au contexte d'auth
//
// un hook React est une fonction qui commence par "use" et peux appeler
// d'autres hooks (useState, useContext, useEffect,...)
//celui-ci encapsule useContext(AuthContext) pour deux raisons :
// 1: Interface plus propre :useAuth() au lieu de useContext(AuthContext)
// 2: Sécurité: leve une erreur claire si utilisé hors du provider

import { useContext } from 'react'
import {AuthContext, AuthContextType} from '../context/AuthContext'

// le type de retour AuthContextType (jamais null) grace a la verification ci dessous
export function useAuth(): AuthContextType{
    const context = useContext(AuthContext)

    // si context est null , c est qu on a appelé useAuth() ds un composant
    //qui n est pas enveloppé par <AuthProvider> dans l arbre react
    // Cette erreur aide a detecter les bugs de configuration tot
    if(!context) throw new Error('useAuth must be used within AuthProvider')

    return context
}