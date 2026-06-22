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
                            className="w-full pl-9 pr-4 py-2.5 bg-["
        
        )
        </div>