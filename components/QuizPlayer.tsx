import React, { useState, useEffect } from 'react';
import { type Quiz } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { savePlayerResult, isStorageConfigured } from '../services/storageService';

const TIME_LIMIT = 15;

const QuizPlayer: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const [playerName, setPlayerName] = useState('');
    const [step, setStep] = useState<'name' | 'playing' | 'finished'>('name');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (step !== 'playing' || isAnswered) return;

        if (timeLeft === 0) {
            handleAnswerSelect(-1); // -1 for timeout
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [step, isAnswered, timeLeft]);

    const handleNameSubmit = () => {
        if (playerName.trim()) {
            setStep('playing');
        }
    };

    const handleAnswerSelect = async (optionIndex: number) => {
        if (isAnswered) return;
        
        setIsAnswered(true);
        setSelectedAnswer(optionIndex);
        
        const isCorrect = optionIndex === quiz.questions[currentQuestionIndex].answerIndex;
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }

        const isLastQuestion = currentQuestionIndex >= quiz.questions.length - 1;

        if (isLastQuestion && isStorageConfigured) {
            try {
                setIsSaving(true);
                const finalScore = score + (isCorrect ? 1 : 0);
                // On passe maintenant l'ID du quiz pour sauvegarder le score au bon endroit.
                await savePlayerResult(quiz.id, { id: Date.now().toString(), name: playerName, score: finalScore });
            } catch (error) {
                console.error("Failed to save player result:", error);
                // On peut choisir d'afficher une erreur à l'utilisateur, mais pour l'instant, le log est suffisant.
            } finally {
                setIsSaving(false);
            }
        }

        setTimeout(() => {
            if (!isLastQuestion) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setTimeLeft(TIME_LIMIT);
            } else {
                setStep('finished');
            }
        }, 2000);
    };

    const getButtonClass = (optionIndex: number) => {
        if (!isAnswered) return 'bg-indigo-600 hover:bg-indigo-500';

        const isCorrect = quiz.questions[currentQuestionIndex].answerIndex === optionIndex;
        const isSelected = selectedAnswer === optionIndex;

        if (isCorrect) return 'bg-green-600 animate-pulse';
        if (isSelected && !isCorrect) return 'bg-red-600';
        return 'bg-gray-700 opacity-50';
    };
    
    if (step === 'name') {
        return (
            <Card>
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-yellow-300">Bienvenue au Quiz de</h2>
                    <h1 className="text-3xl font-brand text-white mb-6">{quiz.title}</h1>
                    <form onSubmit={(e) => { e.preventDefault(); handleNameSubmit(); }} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Entrez votre nom"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            aria-label="Player name"
                        />
                        <Button type="submit" className="w-full">Commencer !</Button>
                    </form>
                </div>
            </Card>
        );
    }
    
    if (step === 'finished') {
        return (
            <Card>
                <div className="text-center p-4">
                    <h2 className="text-3xl font-bold text-yellow-300 mb-4">Quiz terminé !</h2>
                    <p className="text-xl text-white mb-2">Bravo, {playerName} !</p>
                    <p className="text-4xl font-bold text-yellow-300 my-6">{score} / {quiz.questions.length}</p>
                    {isSaving ? (
                        <p className="text-gray-300 animate-pulse">Enregistrement de votre score...</p>
                    ) : (
                        <p className="text-gray-300">Les résultats sont envoyés. Attendez que l'organisateur annonce le podium !</p>
                    )}
                </div>
            </Card>
        );
    }
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Card>
            <div className="p-2 relative">
                <div className="absolute top-0 left-0 h-1 bg-yellow-400 rounded-tl-xl" style={{ width: `${progressPercentage}%` }}></div>
                <div className="flex justify-between items-center mb-4 text-sm text-gray-400 pt-4">
                    <span>Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-lg text-yellow-300">{timeLeft}s</span>
                        <span>Score: {score}</span>
                    </div>
                </div>
                <p className="text-xl font-semibold mb-6 text-center text-white min-h-[6rem] flex items-center justify-center">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 ${getButtonClass(index)}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default QuizPlayer;