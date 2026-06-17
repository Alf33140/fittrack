//===================================================================================
//pages/Login.tsx - Page De connexion
//
// Composant de page React : rendu par React Router qd l URL est /login
// gere un formulaire controlé , un appel API asynchrone , et la navigation
// programmation vers /Dashboard apres une connexion resusie
//===================================================================================

//FormEvent : type de le venement  < form on Submit>
import { useState, FormEvent } from 'react'

//Link : lien interne React router  (pas de rechargement de Page)
// useNavigate : hook pour naviguer programmatiquement (navigate('/dashboard'))
import { Link, useNavigate } from 'react-router-dom'
import   { Dumbbell } from 'lucide-react'

// Toast: notification UI non bloquante (succes/erreur en bas d ecran)
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
    // On récupere la fonction login depuis le contexte global
    const { login } = useAuth()
    const navigate = useNavigate()

    //---  Etat local du formulaire (composant contrôlés)  ---
    // En React,  un 'composant contrôlé' est un input dont value est liée
    // a un etat (useState) . Chaque frappe met a jour l'etat via onChange
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    //loading ; desactive le bouton pendant l appel API (evite les double soumission)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        // e.preventdefault() empeche le rechargementd e page  par default du navigateur
        e.preventDefault()
        setLoading(true)
        try {
            // login()  est une fonction async qui fait POST /api/auth/loginù
            // et met a jour  le contexte si succès (stocke le token + user)
            await login(email, password)
            navigate('/dashboard')

        } catch (err: unknown) {
            // Extraction du message d erreur envoyé par l'API dans err.response.data.error
            // La chade checks (instanceof + 'response' in err) est necessaire car 
            //Typescript ne connait pas la structure d une erreur Axios
            const message = 
                err instanceof Error && 'response' in err
                ? (err as { response?: { data?: {error?: string } } }).response?.data?.error
                : undefined  
            toast.error(message || 'Email ou mot de passe incorrect')
        
        } finally {
            // finally s'execute toujours (succes ou erreur) - On remet loading à false
            setLoading(false)
        }
    }


return (
    <div className='min-h-screen bg-[#0F1172A] flex items-center justify-center p-4'>
        <div className='w-full max-w-sm'>
            {/* LOGO */}
            <div className='text-center mb-8'>
                <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bd-gradient-to-br from-indigo-500 to-violet-600 mb-4'>
                    <Dumbbell size={28} className='text-white' />
                </div>
                <h1 className="text-2xl font-bold text-slate-100">FitTrack</h1>
                <p className='text-slate-400 text-sm mt-1'>Connecte-toi à ton espace</p>
            </div>

            <div className='bg-[#1E293B] border border-slate-700/50 rounded-2xl p-6'>
            {/* onSubmit sur le formulaire (onClick sur le bouton):
            permet aussi la soumission via la touche entrée */}
            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block text smfont-medium text-slate-300 mb-1.5'>
                        Email
                    </label>
                    {/* Input contrôlé */}
                    <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'
                        placeholder="ton@mail.com"
                    />
                </div>
         
<div>
                    <label className='block text smfont-medium text-slate-300 mb-1.5'>
                        Mot de Passe
                    </label>
                    {/* Input contrôlé */}
                    <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors'
                        placeholder="......."
                    />
                </div>
                {/* disabled= {loading} : empeche de cliquer pluseurs fois pendant l'appel API */}
                <button
                    type="submit"
                    disabled={loading}
                    className='w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2'
                >
                    {/* Rendu conditionnel du texte selobn l"etat de chargement */}
                    {loading ? 'Connexion.... ' : 'Se connecter'}

                </button>
            </form>
            <p className='text-center text-sm text-slate-500 mt-5'>
                Pas de compte? {' '}
                {/* Link remplace le <a href> navigation sans rechargement de page*/}
                <Link to="/register" className='text-indigo-400 hover:text-indigo-300 font-medium transition-colors'>
                S'inscrire
                </Link>
            </p>
        </div>
    </div>
    </div>
    )

}