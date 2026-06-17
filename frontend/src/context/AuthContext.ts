import { createContext } from 'react'
import { User } from '../types'
// --- Type TypeScript ---
//Interface decrivant les donnees que le contexte expose
export interface RegisterData {
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
export const AuthContext = createContext<AuthContextType | null>(null)
