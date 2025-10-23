import React, { useState, useEffect } from 'react';
import { type Quiz, type Question } from '../types';
import { encodeData } from '../utils/urlData';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { TrashIcon } from './icons/Icons';
import { API_KEY, BIN_ID, isPodiumConfigured } from '../services/podiumService';

const QRCodeDisplay: React.FC<{ url: string }> = ({ url }) => (
    <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
        alt="QR Code"
        className="mx-auto border-4 border-white rounded-lg shadow-lg"
    />
);

type EditableQuestion = {
    id: number;
    question: string;
    options: string[];
    answerIndex: number | null;
}

const AdminDashboard: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [creationMode, setCreationMode] = useState<'manual' | null>(null);
    const [sharingQuiz, setSharingQuiz] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

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

    const handleCancelCreation = () => {
        setCreationMode(null);
        resetCreationForm();
    };
    
    const handleSaveManualQuiz = () => {
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
            if (!q.question.trim() || q.options.some(opt => !opt.trim()) || q.answerIndex === null) {
                setError("Chaque question doit avoir un texte, des réponses et une bonne réponse sélectionnée.");
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
        setCreationMode(null);
        resetCreationForm();
    };

    const handleDeleteQuiz = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ?")) {
            setQuizzes(prev => prev.filter(q => q.id !== id));
        }
    };
    
    // --- Handlers for the manual form ---
    const addQuestion = () => {
        if (editableQuestions.length === 0) {
             // Démarrer avec une question par défaut
            setEditableQuestions([{ id: Date.now(), question: '', options: ['', ''], answerIndex: null }]);
        } else {
            setEditableQuestions(prev => [...prev, { id: Date.now(), question: '', options: ['', ''], answerIndex: null }]);
        }
    };
    const removeQuestion = (id: number) => setEditableQuestions(prev => prev.filter(q => q.id !== id));
    const updateQuestionText = (id: number, text: string) => setEditableQuestions(prev => prev.map(q => q.id === id ? { ...q, question: text } : q));
    const addOption = (questionId: number) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: [...q.options, ''] } : q));
    const removeOption = (questionId: number, optionIndex: number) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q));
    const updateOptionText = (questionId: number, optionIndex: number, text: string) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? text : opt) } : q));
    const setCorrectAnswer = (questionId: number, optionIndex: number) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answerIndex: optionIndex } : q));

    // --- Render functions ---
    const renderShareModal = () => {
        if (!sharingQuiz) return null;
        const shareUrl = new URL(window.location.href);
        const encodedQuizData = encodeData(sharingQuiz);
        shareUrl.hash = `#/quiz/${encodedQuizData}`;
        const playerUrl = shareUrl.toString();

        const handleCopy = () => {
            navigator.clipboard.writeText(playerUrl).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            }).catch(err => {
                console.error('Erreur lors de la tentative de copie', err);
            });
        };
        
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-yellow-300">Partager le Quiz</h2>
                        <p className="text-lg text-white">{sharingQuiz.title}</p>
                        {playerUrl.length > 2000 && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-lg">
                                <p><strong>Attention :</strong> Ce quiz est très volumineux et le lien pourrait ne pas fonctionner sur tous les téléphones via QR code.</p>
                            </div>
                        )}
                        <QRCodeDisplay url={playerUrl} />
                        <Button onClick={handleCopy} className="w-full">{copySuccess ? 'Copié !' : 'Copier le lien'}</Button>
                        <Button variant="secondary" onClick={() => setSharingQuiz(null)}>Fermer</Button>
                    </div>
                </Card>
            </div>
        );
    };

    const renderCreationScreen = () => (
        <Card>
            <h2 className="text-2xl font-bold text-center mb-4 text-yellow-300">Création de Quiz</h2>
            <div className="space-y-6">
                <Input type="text" value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} placeholder="Titre du quiz (obligatoire)" />
                {creationMode === 'manual' && renderManualForm()}
            </div>
        </Card>
    );

    const renderManualForm = () => (
        <>
            <div className="space-y-4 pr-2 max-h-96 overflow-y-auto">
                {editableQuestions.map((q, qIndex) => (
                    <div key={q.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-yellow-300">Question {qIndex + 1}</h3>
                            <button onClick={() => removeQuestion(q.id)} className="text-gray-500 hover:text-red-400 p-1 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                        <Input type="text" placeholder="Texte de la question" value={q.question} onChange={e => updateQuestionText(q.id, e.target.value)} className="mb-3"/>
                        <div className="space-y-2">
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                    <input type="radio" name={`q_${q.id}_answer`} checked={q.answerIndex === oIndex} onChange={() => setCorrectAnswer(q.id, oIndex)} className="form-radio h-5 w-5 text-yellow-400 bg-gray-800 border-gray-600 focus:ring-yellow-500" />
                                    <Input type="text" placeholder={`Réponse ${oIndex + 1}`} value={opt} onChange={e => updateOptionText(q.id, oIndex, e.target.value)} />
                                    {q.options.length > 2 && <button onClick={() => removeOption(q.id, oIndex)} className="text-gray-500 hover:text-red-400 p-1"><TrashIcon className="w-4 h-4" /></button>}
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" onClick={() => addOption(q.id)} className="text-sm mt-3 px-3 py-1">+ Ajouter une réponse</Button>
                    </div>
                ))}
            </div>
            <Button variant="secondary" onClick={addQuestion} className="w-full mt-4">+ Ajouter une question</Button>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            <div className="flex gap-4 mt-6">
                <Button variant="secondary" onClick={handleCancelCreation} className="w-full">Annuler</Button>
                <Button onClick={handleSaveManualQuiz} className="w-full">Enregistrer le Quiz</Button>
            </div>
        </>
    );
    
    const renderDashboardHome = () => (
        <>
            <div className="text-center mb-6">
                <h1 className="font-brand text-5xl text-yellow-300 mb-2">Quiz Party</h1>
                <p className="text-gray-300 mb-4">Tableau de bord</p>
            </div>
            <div className="flex justify-center mb-6">
                <Button onClick={() => { setCreationMode('manual'); addQuestion(); }}>+ Créer un Quiz</Button>
            </div>
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
                                <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-gray-500 hover:text-red-400 p-2 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );

    return (
        <>
            {renderShareModal()}
            {creationMode ? renderCreationScreen() : renderDashboardHome()}
        </>
    );
};

export default AdminDashboard;