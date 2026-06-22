//==========================================================================
//pages/exercises.tsx - Gestion des exercis=ces  (crud complet)
//
//Cette page illustre plusieurs patterns avancés REACT:
// -  Debounce sur la recherche (setTimeout/clearTimeout)
// -  Modal (creation/edition) et confirmation de suppression
// -  Mise a jour optimiste : mise a jour de l etat local sans recharger tt
// -  Composant interne modal réutilisable
//===========================================================================

import React from "react";
import { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import api from '../services/api';
import { Exercise } from '../types';
import toast from "react-hot-toast";

// 'as const' typeScript infère le type littéral {'musculation'|'Cardio'|'Flexibilité'}
// au lieu du tyoe general string[]
const CATEGORIES = ['Musculation', 'Cardio', 'Flexibilité'] as const
type Category = (typeof  CATEGORIES)[number] // type union des valeurs du tableau

//Couleur des badges par categories (classe tailwind)
const  CAT_COLORS: Record<Category, string> = {
    Musculation: 'bg-indigo-500/15 text-indigo-300',
    Cardio: 'bg-amber-500/15 text-amber-300',
    Flexibilité: 'bg-emerald-500/15 text-emerald-300'
}
 // Valeurs iniatales du formulaire - separées pour initialiser facilement
const EMPTY_FORM = {
    name: '',
    category: 'Musculation' as Category,
    muscle_group: '',
    description: '',
}

const inputCls = 
    'w-full px-4 py-2.5 bg-slate-700 rounded-lg  text-sm  text-slate-100 placeholder-slate-500 focus:outline-none focus:border-transparent  transition-colors'

const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5'

export default function Exercises() {
const [exercises,  setExercises]  = useState<Exercise[]>([])
const [loading,    setLoading]    = useState(true)
const [search,     setSearch]     = useState('')
const [catFilter,  setCatFilter]  = useState<Category | ''>('')

  // etat de la modal (création/edition)
const [modalOpen,  setModalOpen]  = useState(false)
const [editTarget, setEditTarget] = useState<Exercise | null>(null)
const [form,       setForm]       = useState(EMPTY_FORM)
const [submitting, setSubmitting] = useState (false)

 // deleteId : id de l exercice à supprimer (null = modal de confirmation fermée)
const [deleteId, setDeleteId] = useState<number | null>(null)

 // Chargement des exercices avec filtres
 // Accepte les parametres optionnels pour eviter les problemes de closure
 // ( si on lisait search/catfilter depuis le scope, il pourraient etre stable)
const loadExercises = (s = search, c = catFilter) => {
const params: Record<string, string> = {}
    if (c) params.category = c
    if (s) params.search   = s
    api
        .get('/exercises', { params })
        .then((res) => setExercises(res.data.exercises))
        .catch(() => toast.error('Impossible de charger les exercices'))
        .finally(() => setLoading(false))
}


  // Rechatgement qd le filtre category change ( immédiat )
useEffect(() => { 
    loadExercises()
}, [catFilter]) 

 // Debounce sur la recherche textuelle
 // Sans Debounce, une requeteAPI serait envoyée a chaque frappe clavier
 // Avec setTimeout(350ms) , on attends 350m d'inactivité avant d'envoyer
 // clearTimeout annule le timer précédent si l utilisateur continue de taper
 // La fonction retournée par useEffect est le "cleanup" : elle s execute
 // avant le prochain effet ou le démontage du composant

useEffect(() => {
    const t = setTimeout(() => loadExercises(), 350)
    return () => clearTimeout(t) // annule si search change avant 350ms
}, [search])

const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
}


 // Ouvre la modal en mode edition (pré-remplit le formulaire avec les valeurs existantes)
const openEdit = (ex: Exercise) => {
    setEditTarget(ex)
    setForm({
        name: ex.name,
        category: ex.category,
        muscle_group: ex.muscle_group ?? '', // ?? '' : valeur par défaut si null
        description: ex.description ?? '',
    })
    setModalOpen(true)
}
 // handleChange générique ( comme ds Register.tsx) name de l'input = clé du state
const handleChange = (e: ChangeEvent < HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value})
}

const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
        if (editTarget) {
            // Mode Edition : PUT avec l'id de l exercice ciblé
            const res = await api.put(`exercisses/${editTarget.id}`, form)

            // Mise a jour optimiste: On remplace lélément dans l etat local
            // sans recharger  toute la liste depuis l API    
                setExercises(exercises.map((ex) => (ex.id === editTarget.id ? res.data.exercise : ex)))
                toast.success('exercice modifié')
        
    } else {
            // Mode création : POST -> on ajoute le nouvel exercice en tete de liste
        const res = await api.post('/exercises', form)
        setExercises([res.data.exercise, ...exercises])
        toast.success('Exercice créé')
    }
    setModalOpen(false)
    } catch (err: unknown) {
        const msg = 
            err  instanceof Error && 'response' in err
            ? (err as { response?: {data?: { error: string } } }).response?.data?.error
            : undefined
        toast.error(msg || 'Erreur')
    
    } finally { 
        setSubmitting(false) }
}


    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/exercices/${id}`)
            // Mise a jour optimiste: on filtre l'élément supprimé sans recharger
            setExercises(exercises.filter((ex) => ex.id !== id))
            toast.success('Exercice supprimé')

        } catch (err: unknown) {
        const msg =
            err instanceof Error && 'response' in err
            ? (err as { response?: {data?: { error: string } } }).response?.data?.error
            : undefined 
            toast.error(msg || 'Erreur')
                
            } finally { 
                
                setDeleteId(null) // Ferme la modal de confirmation quoi qu il arrive
            }

        }

        return (
            <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate100"> Exercices</h1>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-indigo-600 hover: bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    >
                        <Plus size={15} />
                        Ajouter
                    </button>
                </div>
            
            {/* Barre de Recherche + filtres catégorie */}
                <div className=" flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-l">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#1E293B] border border-slate-700 rounded-lg text-sm text-slate-100placeholder'slate slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border_transparent"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
            {/* Boutons de filtre:  '' = tous , puis les 3 categories */}
                {(['', ...CATEGORIES] as const).map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setCatFilter(cat)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            catFilter === catFilter
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#1E293B] border border-slate-700 text-slate-400 hover:text-slate-700 hover:border-slate-600' //Inactif
                            }`}
                    >
                        {cat === '' ? 'Tous' : cat}
                    </button>
                    ))}
                </div>          
            </div>
             {/* Grille d'exercices — rendu conditionnel selon l'état */}
            {loading ? (
                <p className="text-slate-500 text-sm">Chargement...</p>
            ) : exercises.length === 0 ? (
                <div className="text-center py-20">
                <p className="text-slate-500 text-sm">Aucun exercice trouvé</p>
                <button onClick={openCreate} className="mt-3 text-indigo-400 text-sm hover:underline">
                    Créer un exercice →
                </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((ex) => (
                    <div
                    key={ex.id} // key : identifiant unique requis par React pour les listes
                    className="bg-[#1E293B] border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-3"
                    >
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-200 text-sm leading-snug">{ex.name}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${CAT_COLORS[ex.category]}`}>
                        {ex.category}
                        </span>
                    </div>
                        {ex.muscle_group && <p className="text-xs text-slate-500"> {ex.muscle_group }</p>}
                        {ex.description && <p className="text-xs  text-slate-600 line-clamp-2">{ex.description }</p>}
                        <div className="flex gap-3 mt-auto pt-2 border-t border-slate-700/50">
                            <button onClick={() => openEdit(ex)} className="flex  items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
                                <Pencil size={12} /> Modifier    
                            </button>
                            {/* setDeletId(ex) — rendu conditionnel selon l'état */}
                            <button onClick={() => setDeleteId(ex.id)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors ml-auto">
                                    <Trash2 size={12} /> Supprimer    
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        {/* Modal création/édition — montée conditionnellement dans le DOM */}
        {modalOpen && (
            <Modal onClose={() => setModalOpen(false)} title={editTarget ? "Modifier l'exercice" : 'Nouvel exercice'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={labelCls}>Nom *</label>
                        <input name="name" required value={form.name} onChange={handleChange} className={inputCls} placeholder="Développé couché" />
                    </div>
                    <div>
                    <label className={labelCls}>Catégorie *</label>
                    <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                        {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
                    </select>
                    </div>
                    <div>
                        <label className={labelCls}>Groupe musculaire</label>
                        <input name="muscle_group" value={form.muscle_group} onChange={handleChange} className={inputCls} placeholder="Pectoraux, Triceps..." />
                    </div>
                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} />
                    </div>
                    <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700/40 transition-colors">
                        Annuler
                    </button>
                    <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                        {submitting ? 'Enregistrement...' : editTarget ? 'Enregistrer' : 'Créer'}
                    </button>
                    </div>
                </form>
            </Modal>
        )}
    {/* Modal de confirmation de suppression */}
    {/* deleteId !== null : condition pour afficher la modal */}
    {deleteId !== null && (
        <Modal onClose={() => setDeleteId(null)} title="Supprimer l'exercice">
            <p className="text-sm text-slate-400 mb-6">Es-tu sûr ? Cette action est irréversible.</p>
            <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-600 text-slate-300 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700/40 transition-colors">
                Annuler
                </button>
                {/* On passe deleteId (non-null ici grâce à la condition ci-dessus) */}
                <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Supprimer
                </button>
            </div>
        </Modal>
        )}
    </div>
)
}    