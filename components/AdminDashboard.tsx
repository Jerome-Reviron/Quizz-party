import React, { useState, useEffect } from 'react';
import { type Quiz, type Question } from '../types';
import { encodeData } from '../utils/urlData';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { TrashIcon } from './icons/Icons';

const QRCodeDisplay: React.FC<{ url: string }> = ({ url }) => (
    <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
        alt="QR Code"
        className="mx-auto border-4 border-white rounded-lg shadow-lg"
    />
);

// We need a temporary shape for questions during creation
type EditableQuestion = {
    id: number;
    question: string;
    options: string[];
    answerIndex: number | null;
}

const AdminDashboard: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [sharingQuiz, setSharingQuiz] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Form state for manual creation
    const [newQuizTitle, setNewQuizTitle] = useState('');
    const [editableQuestions, setEditableQuestions] = useState<EditableQuestion[]>([]);

    useEffect(() => {
        const savedQuizzes = localStorage.getItem('quizzes');
        if (savedQuizzes) {
            setQuizzes(JSON.parse(savedQuizzes));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
    }, [quizzes]);
    
    const resetCreationForm = () => {
        setNewQuizTitle('');
        setEditableQuestions([]);
        setError(null);
    };

    const handleStartCreating = () => {
        resetCreationForm();
        setIsCreating(true);
    };

    const handleCancelCreation = () => {
        setIsCreating(false);
        resetCreationForm();
    };
    
    const handleSaveQuiz = () => {
        setError(null);
        if (!newQuizTitle.trim()) {
            setError("Le quiz doit avoir un titre.");
            return;
        }
        if (editableQuestions.length === 0) {
            setError("Le quiz doit contenir au moins une question.");
            return;
        }

        const finalQuestions: Question[] = [];
        for (const q of editableQuestions) {
            if (!q.question.trim()) {
                setError("Toutes les questions doivent avoir un texte.");
                return;
            }
            if (q.options.some(opt => !opt.trim())) {
                setError("Toutes les options de réponse doivent avoir un texte.");
                return;
            }
            if (q.answerIndex === null) {
                setError("Chaque question doit avoir une bonne réponse de sélectionnée.");
                return;
            }
            finalQuestions.push({
                question: q.question,
                options: q.options,
                answerIndex: q.answerIndex,
            });
        }
        
        const newQuiz: Quiz = {
            id: Date.now().toString(),
            title: newQuizTitle,
            questions: finalQuestions,
        };

        setQuizzes(prev => [newQuiz, ...prev]);
        setIsCreating(false);
        resetCreationForm();
    };


    const handleDeleteQuiz = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz et tous ses scores ?")) {
            setQuizzes(prev => prev.filter(q => q.id !== id));
            localStorage.removeItem(`podium_${id}`);
        }
    };
    
    // --- Handlers for the manual form ---
    const addQuestion = () => {
        setEditableQuestions(prev => [...prev, { id: Date.now(), question: '', options: ['', ''], answerIndex: null }]);
    };

    const removeQuestion = (id: number) => {
        setEditableQuestions(prev => prev.filter(q => q.id !== id));
    };
    
    const updateQuestionText = (id: number, text: string) => {
        setEditableQuestions(prev => prev.map(q => q.id === id ? { ...q, question: text } : q));
    };

    const addOption = (questionId: number) => {
        setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: [...q.options, ''] } : q));
    };

    const removeOption = (questionId: number, optionIndex: number) => {
         setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q));
    };
    
    const updateOptionText = (questionId: number, optionIndex: number, text: string) => {
         setEditableQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = text;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };
    
    const setCorrectAnswer = (questionId: number, optionIndex: number) => {
        setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answerIndex: optionIndex } : q));
    };

    // --- Render functions ---

    const renderShareModal = () => {
        if (!sharingQuiz) return null;

        const shareUrl = new URL(window.location.href);
        const encodedQuizData = encodeData(sharingQuiz);
        shareUrl.hash = `#/quiz/${encodedQuizData}`;
        
        const playerUrl = shareUrl.toString();
        const isUrlTooLong = playerUrl.length > 2000;
        
        const handleCopy = () => {
            navigator.clipboard.writeText(playerUrl).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        };

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-yellow-300">Partager le Quiz</h2>
                        <p className="text-lg text-white">{sharingQuiz.title}</p>
                        
                        {isUrlTooLong && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-lg">
                                <p className="font-bold">Attention : URL très longue</p>
                                <p>Ce quiz est très volumineux. Certains téléphones pourraient avoir du mal à ouvrir ce lien via le QR code. Si cela se produit, essayez de créer un quiz avec moins de questions.</p>
                            </div>
                        )}

                        <QRCodeDisplay url={playerUrl} />
                        
                        <Button onClick={handleCopy} className="w-full">
                            {copySuccess ? 'Copié !' : 'Copier le lien'}
                        </Button>

                        <Button variant="secondary" onClick={() => setSharingQuiz(null)}>Fermer</Button>
                    </div>
                </Card>
            </div>
        );
    };

    const renderCreationForm = () => (
         <Card>
            <h2 className="text-2xl font-bold text-center mb-4 text-yellow-300">Création de Quiz</h2>
            <div className="space-y-6">
                <Input type="text" value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} placeholder="Titre du quiz" />
                
                <div className="space-y-4">
                    {editableQuestions.map((q, qIndex) => (
                        <div key={q.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-yellow-300">Question {qIndex + 1}</h3>
                                <button onClick={() => removeQuestion(q.id)} className="text-gray-500 hover:text-red-400 p-1 rounded-full hover:bg-gray-700">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <Input type="text" placeholder="Texte de la question" value={q.question} onChange={e => updateQuestionText(q.id, e.target.value)} className="mb-3"/>
                            
                            <div className="space-y-2">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <input type="radio" name={`q_${q.id}_answer`} checked={q.answerIndex === oIndex} onChange={() => setCorrectAnswer(q.id, oIndex)} className="form-radio h-5 w-5 text-yellow-400 bg-gray-800 border-gray-600 focus:ring-yellow-500" />
                                        <Input type="text" placeholder={`Réponse ${oIndex + 1}`} value={opt} onChange={e => updateOptionText(q.id, oIndex, e.target.value)} />
                                        {q.options.length > 2 && (
                                            <button onClick={() => removeOption(q.id, oIndex)} className="text-gray-500 hover:text-red-400 p-1">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                             <Button variant="secondary" onClick={() => addOption(q.id)} className="text-sm mt-3 px-3 py-1">+ Ajouter une réponse</Button>
                        </div>
                    ))}
                </div>

                <Button variant="secondary" onClick={addQuestion} className="w-full">+ Ajouter une question</Button>
                
                {error && <p className="text-red-400 text-center">{error}</p>}

                <div className="flex gap-4">
                    <Button variant="secondary" onClick={handleCancelCreation} className="w-full">Annuler</Button>
                    <Button onClick={handleSaveQuiz} className="w-full">Enregistrer le Quiz</Button>
                </div>
            </div>
        </Card>
    );

    return (
        <>
            {renderShareModal()}
            
            {isCreating ? renderCreationForm() : (
                 <>
                    <div className="text-center mb-6">
                        <h1 className="font-brand text-5xl text-yellow-300 mb-2">Quiz Party</h1>
                        <p className="text-gray-300 mb-4">Tableau de bord</p>
                    </div>
                    <Button onClick={handleStartCreating} className="w-full mb-6">
                       + Créer un nouveau quiz
                    </Button>
                    <Card>
                        <h2 className="text-2xl font-bold text-center mb-4 text-white">Mes Quiz</h2>
                        <div className="space-y-3">
                            {quizzes.length === 0 && <p className="text-gray-400 text-center py-4">Vous n'avez pas encore créé de quiz.</p>}
                            {quizzes.map(quiz => (
                                <div key={quiz.id} className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                                    <span className="text-white font-semibold">{quiz.title}</span>
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => setSharingQuiz(quiz)} className="px-3 py-1 text-sm">Partager</Button>
                                        <Button variant="secondary" onClick={() => window.location.hash = `#/podium/${encodeData(quiz)}`} className="px-3 py-1 text-sm">Podium</Button>
                                        <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-gray-700">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}
        </>
    );
};

export default AdminDashboard;