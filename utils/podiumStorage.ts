import { type PlayerResult } from '../types';

export const getPodiumStorageKey = (quizId: string): string => `podium_${quizId}`;

export const getPlayerResults = (quizId: string): PlayerResult[] => {
    try {
        const savedResults = localStorage.getItem(getPodiumStorageKey(quizId));
        return savedResults ? JSON.parse(savedResults) : [];
    } catch (error) {
        console.error("Failed to load results from localStorage", error);
        return [];
    }
};

export const savePlayerResult = (quizId: string, newResult: PlayerResult): void => {
    try {
        const currentResults = getPlayerResults(quizId);
        const updatedResults = [...currentResults, newResult];
        localStorage.setItem(getPodiumStorageKey(quizId), JSON.stringify(updatedResults));
        // Dispatch a storage event to notify other tabs/windows (like the podium screen)
        window.dispatchEvent(new StorageEvent('storage', {
            key: getPodiumStorageKey(quizId),
            newValue: JSON.stringify(updatedResults)
        }));
    } catch (error) {
        console.error("Failed to save result to localStorage", error);
    }
};
