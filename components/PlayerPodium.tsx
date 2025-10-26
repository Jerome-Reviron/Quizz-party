import React, { useState, useEffect } from 'react';
import { type PlayerResult, type Quiz } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { TrophyIcon } from './icons/Icons';
import { getPlayerResults, isStorageConfigured } from '../services/storageService';

interface PlayerPodiumProps {
    quiz: Quiz;
    score: number;
}

const PlayerPodium: React.FC<PlayerPodiumProps> = ({ quiz, score }) => {
    const [results, setResults] = useState<PlayerResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadResults = async () => {
        if (!isStorageConfigured) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const fetchedResults = await getPlayerResults(quiz.id);
        setResults(fetchedResults);
        setIsLoading(false);
    };
    
    useEffect(() => {
        loadResults();

        const intervalId = setInterval(loadResults, 15000);

        return () => {
            clearInterval(intervalId);
        };
    }, [quiz.id]);

    const sortedResults = [...results].sort((a, b) => b.score - a.score);

    const podiumColors = ['text-yellow-400', 'text-gray-300', 'text-yellow-600'];

    return (
        <Card>
            <div className="text-center mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-white">Votre score</h2>
                <p className="text-4xl font-bold text-yellow-300 my-2">{score} / {quiz.questions.length}</p>
            </div>

            <div className="text-center mb-6">
                <h1 className="font-brand text-4xl text-yellow-300 mb-2">Podium</h1>
                <p className="text-gray-300">{quiz.title}</p>
            </div>
            
            <div className="space-y-3 mb-6 min-h-[200px]">
                {isLoading && (
                    <p className="text-gray-400 text-center py-8 animate-pulse">Chargement des résultats...</p>
                )}
                {!isLoading && sortedResults.length === 0 && (
                    <p className="text-gray-400 text-center py-8">En attente des premiers résultats...</p>
                )}
                {sortedResults.map((result, index) => (
                    <div key={result.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between shadow-md animate-fade-in">
                        <div className="flex items-center gap-4">
                        <div className="w-8 text-center">
                            {index < 3 ? (
                                <TrophyIcon className={`w-8 h-8 ${podiumColors[index]}`} />
                            ) : (
                                <span className="text-gray-400 font-bold text-xl">{index + 1}</span>
                            )}
                            </div>
                            <span className="text-white font-semibold text-lg">{result.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-yellow-300 font-bold text-lg">{result.score} pts</span>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={loadResults} className="w-full" disabled={isLoading}>
                {isLoading ? 'Rafraîchissement...' : 'Rafraîchir le Podium'}
            </Button>
        </Card>
    );
};

export default PlayerPodium;