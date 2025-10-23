import { type PlayerResult, type Quiz } from '../types';

// La structure de données complète qui sera stockée dans notre bin JSON.
interface AppData {
    quizzes: Quiz[];
    podiums: Record<string, PlayerResult[]>; // Un objet où chaque clé est un quizId
}

// --- Configuration ---
// Les clés API sont maintenant directement intégrées dans le code pour garantir
// le fonctionnement et résoudre définitivement les erreurs 401.

const rawApiKey = "$2a$10$dSKL2LBK8zwH48fEw/Awi.wOtNl8rqH4xXC.EQTR2oh5uHkyW/Iz2";
const rawBinId = "68f6940f43b1c97be9742a29";

export const API_KEY = (rawApiKey || '').trim();
export const BIN_ID = (rawBinId || '').trim();

// Cette vérification s'assure que les clés de configuration sont présentes.
// Si les valeurs ci-dessus sont vides, l'écran d'erreur s'affichera.
export const isStorageConfigured = !!API_KEY && !!BIN_ID;

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY, 
});

// --- Fonctions de base (privées) ---

/**
 * Récupère l'intégralité des données de l'application depuis le bin.
 * En cas d'échec ou si le bin est vide, retourne une structure de données par défaut.
 */
const getAppData = async (): Promise<AppData> => {
    if (!isStorageConfigured) {
        return { quizzes: [], podiums: {} };
    }
    try {
        const response = await fetch(`${BIN_URL}/latest`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!response.ok) {
            // Si le bin n'existe pas encore (404), on retourne une structure vide.
            if (response.status === 404) {
                 return { quizzes: [], podiums: {} };
            }
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        // S'assure que la structure est valide, sinon retourne la structure par défaut.
        return data.record && Array.isArray(data.record.quizzes) && typeof data.record.podiums === 'object' 
            ? data.record 
            : { quizzes: [], podiums: {} };
    } catch (error) {
        console.error("Error getting app data:", error);
        // On retourne une structure vide en cas d'erreur pour que l'app ne plante pas
        return { quizzes: [], podiums: {} };
    }
};

/**
 * Sauvegarde l'intégralité des données de l'application dans le bin.
 * Lève une exception en cas d'erreur pour que le composant appelant puisse réagir.
 */
const saveAppData = async (data: AppData): Promise<void> => {
    if (!isStorageConfigured) return;
    try {
        const response = await fetch(BIN_URL, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Error saving app data to JSONBin: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Failed to save data. Status: ${response.status}. Check console for details.`);
        }
    } catch (error) {
        console.error("Error during saveAppData fetch operation:", error);
        throw error;
    }
};

// --- Fonctions publiques (exportées) ---

/**
 * Récupère uniquement la liste des quiz.
 */
export const getQuizzes = async (): Promise<Quiz[]> => {
    const data = await getAppData();
    return data.quizzes || [];
};

/**
 * Sauvegarde la liste complète des quiz.
 */
export const saveQuizzes = async (quizzes: Quiz[]): Promise<void> => {
    const data = await getAppData();
    data.quizzes = quizzes;
    await saveAppData(data);
};

/**
 * Récupère les résultats pour un quiz spécifique.
 */
export const getPlayerResults = async (quizId: string): Promise<PlayerResult[]> => {
    const data = await getAppData();
    return data.podiums?.[quizId] || [];
};

/**
 * Sauvegarde le résultat d'un joueur pour un quiz spécifique.
 */
export const savePlayerResult = async (quizId: string, newResult: PlayerResult): Promise<void> => {
    if (!isStorageConfigured) return;
    
    const data = await getAppData();
    
    // Initialise le podium pour ce quiz s'il n'existe pas
    if (!data.podiums) {
        data.podiums = {};
    }
    if (!data.podiums[quizId]) {
        data.podiums[quizId] = [];
    }

    const updatedPodium = [...data.podiums[quizId], newResult];
    data.podiums[quizId] = updatedPodium;

    await saveAppData(data);
};
