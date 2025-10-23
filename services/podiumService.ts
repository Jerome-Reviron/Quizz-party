import { type PlayerResult } from '../types';

// =====================================================================================
// !! ATTENTION : MODIFICATION TEMPORAIRE POUR DÉBOGAGE !!
// =====================================================================================
// Le problème de lecture de la clé API depuis .env.local persiste à cause de l'environnement.
// Pour vous débloquer, nous allons temporairement mettre la clé API directement ici.
//
// **N'oubliez pas de supprimer cette clé avant de partager votre code !**
//
const TEMPORARY_API_KEY = '$2a$10$dSKL2LBK8zwH48fEw/Awi.wOtNl8rqH4xXC.EQTR2oh5uHkyW/Iz2';
// =====================================================================================


const rawApiKey = import.meta.env.VITE_JSONBIN_API_KEY;
const rawBinId = import.meta.env.VITE_JSONBIN_BIN_ID;

// SÉCURITÉ AJOUTÉE: .trim() supprime les espaces invisibles qui peuvent causer des erreurs 401.
// On utilise la clé temporaire en priorité pour le débogage.
export const API_KEY = (TEMPORARY_API_KEY || rawApiKey || '').trim();
export const BIN_ID = (rawBinId || '').trim();

export const isPodiumConfigured = !!API_KEY && !!BIN_ID;

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY, 
});

/**
 * Récupère la liste complète des résultats depuis JSONBin.io.
 */
export const getPlayerResults = async (): Promise<PlayerResult[]> => {
    if (!isPodiumConfigured) {
        return [];
    }
    
    try {
        const response = await fetch(`${BIN_URL}/latest`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return [];
            }
            return []; 
        }

        const data = await response.json();
        const results = data.record || [];

        if (!Array.isArray(results)) {
            return [];
        }
        
        return results;

    } catch (error) {
        return [];
    }
};

/**
 * Sauvegarde le résultat d'un nouveau joueur sur JSONBin.io.
 */
export const savePlayerResult = async (newResult: PlayerResult): Promise<void> => {
    if (!isPodiumConfigured) {
        return;
    }
    
    try {
        const currentResults = await getPlayerResults();
        
        if (!Array.isArray(currentResults)) {
            return;
        }

        const updatedResults = [...currentResults, newResult];
        
        const response = await fetch(BIN_URL, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updatedResults),
        });

        if (!response.ok) {
            return; 
        }

    } catch (error) {
        // Silently fail in production
    }
};