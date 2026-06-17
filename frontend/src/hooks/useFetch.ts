//=============================================================================
// hook/useFetch.ts - Hook generique pour les appels API GET
// 
// Ce hook centralise la logique repetitive de tout appel API:
// - Etat de chargement (loading)[]
// - Données reçues (data)
// - Gestion d'erreurs (error)
// - Possibilité de relancer la requete (refetch)
// 
// le <T> est un generique TypeScript: il permet de typer le résultat
// à l usage : ex: useFetch<{ exercises: Exercise[] }> ('/Exercises')
//===============================================================================

import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

//interface décrivant ce que retourne le hook
interface UseFetchResult<T> {
    data: T | null // null avant la premiere reponse
    loading: boolean //true pendant la requete en cours
    error: string | null
    refetch: () => void //Fonction pour relancer la requete manuellement

}

export function useFetch<T>(url: string): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // useCallack memorise la fonction fetchData pour eviter qu elle soit
    // recréé a cvhaque render. Sans cel, le useEffect ci dessous se declencherait
    // en boucle infinie car fetchData serait une noule référence à chaque fois
    const fetchData = useCallback(() => {
    //     Promise.resolve()
    //         .then(() => {
    //             setLoading(true)
    //             setError(null) 
    //         })
    //         .then(() => api.get<T>(url))
    //         .then((res: { data: T}) => setData(res.data))
    //         .catch(() => setError('Impossible de charger les données'))
    //         .finally(() => setLoading(false))
    // }, [url])

        // setLoading(true)
        // setError(null)
        api
            .get<T>(url)
            .then((res: { data: T}) => setData(res.data))
            .catch(() => setError('Impossible de charger les données'))
            .finally(() => setLoading(false))

    }, [url])

    //useEffect declenche fetchdata au montage du composant
    // et de nouveau si fetchData change ( c est a dire si url change)
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // refetch expose fetchData: les composants peuvent rappeler manuellement
    // la requete apres une creation / modification pour actualiser l affichage
    return {data, loading, error, refetch: fetchData}
}

