//=============================================================
//  types/index.ts - Interfaces Typescript partagées de FitTrack
//  
//  Ce fichier centralise tous les types métier de l application.
//  Chaque interface reflete exactement la structure retournée par l'API RREST
// ce qui garantit la cohérence entre le backend et le frontend
// Importez ces types ds n'importe quel composant ou service avec :
// import {user, workout, ...} from '../types'
//=============================================================

// --- User ---
// Correspond a la table User en base (sans le champ password jamais exposé)

export interface User {
    id: number
    username: string
    email: string
    weight: number | null   // null si l'utilisateur n'a pas renseigné son poids
    goal: 'lose' | 'maintain' | 'gain' //Objectif fitness (union litterale = valeurs fixes)
    created_at: string
}

// --- Exercise ---
// Exercice de la bibliothèque partagée (accessible à tous les utilisateurs)
export interface Exercise {
    id: number
    name: string
    category: 'Musculation' | 'Cardio' | 'Flexibilité' // ENUM coté MySQL
    muscle_group: string | null // null si non renseigné ( ex: exercice cardio global)
    description: string | null
    created_at: string
}

// --- WorkoutExercise ---
// Représente un exercice tel qu il a été réalisé dans une seance spécifique
// C'est la table de jointure WorkExercise enrichie des infos de l'exercice source
// Les champs sets/reps/weight_used/duration sont tous optionnels (null) selon le type
// - Musculation: sets + reps + weight_used
// - Cardio: duration (secondes)
export interface WorkoutExercise {
    id: number
    workout_id: number  //Clé étrangere vers Workout.id
    exercise_id: number //Clé Etrangère vers Exercise.id
    name: string        //Dénormalisé depuis Exercise pour l affichage immédiat
    category: string    //iedem
    muscle_group: string | null
    sets: number | null
    Reps: number | null
    weight_used: number | null  // poid en kilo
    duration: number | null     // Durée en secondes (cardio)
}

// --- Workout ---
// Seance d'entrainement appartenant a un utilisateur.
// Les champs marqués ? sont optionnels: ils ne sont présents que ds certains
// endpoints ( ex: exercises est inclus ds GET /workouts/:id mais pas ds GET /workout

export interface Workout {
    id: number
    user_id: number
    title: string
    date: string    //format DATE MySQL : "YYYY-MM-DD"
    duration:   number  | null  //durée totale en minutes
    notes:  string | null
    created_at: string
    updated_at: string
    exercise_count?: number // Nombre d'exercices, fourni par la liste (agregat SQL)
    exercises?: WorkoutExercise[] // Détail complet, fourni uniquement par GET /:id
}

// --- ProgressionStats ---
// Reponse complete de GET /api/stats/progression
// Regroupe le profil utilisateur et quatre jeux de statistiques  calculés côté backend
export interface ProgressionStats {
    user: {
        username: string
        weight: number | null
        goal: 'lose' | 'maintain' | 'gain'
        member_since: string // Date d inscription (created_at du User)
    }
    stats: {
        // Totaux globaux depuis la création du compte
        summary:{
            total_workouts: number
            total_minutes: number
            avg_duration: number        // Moyenne en minutes par seances
            unique_exercises: number    // Nombre d'exercices distincts réalisés
        }
        // Activité par mois (12 derniers mois). utilisée pour le graphique du Dashboard
        monthly: Array<{
            month:  string              //Format: "YYYY -MM", ex: "2024-06"
            workout_count: number
            total_minutes:  number
        }>
        // Repartition par categories d exercice (musculation / cardio / Flexibilité)
        byCategory: Array<{
            category: string
            exercise_count: number
            total_reps: number      //Totald es répétitions sur toutes les seances
        }>
        // Dernieres éances (pour la section "Activité recente" du Dashboard)
    }
}