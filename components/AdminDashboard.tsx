
import React, { useState, useEffect } from 'react';
import { type Quiz, type Question } from '../types';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { TrashIcon, PencilIcon } from './icons/Icons';
import { getQuizzes, saveQuizzes, deleteQuizAndPodium } from '../services/storageService';
import ShareModal from './ShareModal';

type EditableQuestion = {
    id: number;
    question: string;
    options: string[];
    answerIndex: number | null;
}

const AdminDashboard: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(null);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
    const [sharingQuiz, setSharingQuiz] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [newQuizTitle, setNewQuizTitle] = useState('');
    const [editableQuestions, setEditableQuestions] = useState<EditableQuestion[]>([]);
    
    useEffect(() => {
        const loadQuizzes = async () => {
            setIsLoading(true);
            const fetchedQuizzes = await getQuizzes();
            setQuizzes(fetchedQuizzes);
            setIsLoading(false);
        };
        loadQuizzes();
    }, []);

    const resetEditorForm = () => {
        setNewQuizTitle('');
        setEditableQuestions([]);
        setError(null);
    };

    const handleCancelEditor = () => {
        setEditorMode(null);
        setEditingQuizId(null);
        resetEditorForm();
    };

    const handleStartCreate = () => {
        setEditorMode('create');
        addQuestion();
    };

    const handleStartEdit = (quizToEdit: Quiz) => {
        setEditorMode('edit');
        setEditingQuizId(quizToEdit.id);
        setNewQuizTitle(quizToEdit.title);
        // On donne un ID unique à chaque question pour la gestion de l'état dans React
        setEditableQuestions(quizToEdit.questions.map((q, index) => ({
            ...q,
            id: Date.now() + index 
        })));
    };
    
    const handleSaveQuiz = async () => {
        setError(null);
        if (!newQuizTitle.trim()) {
            setError("Le quiz doit avoir un titre.");
            return;
        }
        
        const finalQuestions: Question[] = editableQuestions
            .map(q => {
                const isComplete = q.question.trim() !== '' && q.options.every(opt => opt.trim() !== '') && q.answerIndex !== null;
                if (isComplete) {
                    return {
                        question: q.question,
                        options: q.options,
                        answerIndex: q.answerIndex!,
                    };
                }
                return null;
            })
            .filter((q): q is Question => q !== null);

        if (finalQuestions.length !== editableQuestions.length || editableQuestions.length === 0) {
             setError("Chaque quiz doit avoir au moins une question, et chaque question doit être complète (texte, réponses non vides, et bonne réponse sélectionnée).");
            return;
        }

        try {
            setIsSaving(true);
            let updatedQuizzes: Quiz[];

            if (editorMode === 'edit' && editingQuizId) {
                // Mode édition : on met à jour le quiz existant
                updatedQuizzes = quizzes.map(q => 
                    q.id === editingQuizId 
                    ? { ...q, title: newQuizTitle, questions: finalQuestions } 
                    : q
                );
            } else {
                // Mode création : on ajoute un nouveau quiz
                const newQuiz: Quiz = {
                    id: Date.now().toString(),
                    title: newQuizTitle,
                    questions: finalQuestions,
                };
                updatedQuizzes = [newQuiz, ...quizzes];
            }
            
            await saveQuizzes(updatedQuizzes);
            setQuizzes(updatedQuizzes);
            handleCancelEditor(); // Réinitialise et retourne au dashboard

        } catch (error) {
            console.error("Failed to save quiz:", error);
            setError("Une erreur est survenue lors de la sauvegarde. Vérifiez votre configuration et la console pour plus de détails.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteQuiz = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible et effacera également tous les scores associés.")) {
            try {
                const updatedQuizzes = await deleteQuizAndPodium(id);
                setQuizzes(updatedQuizzes);
            } catch (e) {
                console.error("Failed to delete quiz", e);
                setError("Une erreur est survenue lors de la suppression du quiz.");
            }
        }
    };
    
    const addQuestion = () => {
        const newQuestion: EditableQuestion = { id: Date.now(), question: '', options: ['', ''], answerIndex: null };
        setEditableQuestions(prev => [...prev, newQuestion]);
    };
    const removeQuestion = (id: number) => setEditableQuestions(prev => prev.filter(q => q.id !== id));
    const updateQuestionText = (id: number, text: string) => setEditableQuestions(prev => prev.map(q => q.id === id ? { ...q, question: text } : q));
    const addOption = (questionId: number) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: [...q.options, ''] } : q));
    const removeOption = (questionId: number, optionIndex: number) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q));
    const updateOptionText = (questionId: number, optionIndex: number, text: string) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? text : opt) } : q));
    const setCorrectAnswer = (questionId: number, optionIndex: number) => setEditableQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answerIndex: optionIndex } : q));

    const renderEditorScreen = () => (
        <Card>
            <h2 className="text-2xl font-bold text-center mb-4 text-yellow-300">
                {editorMode === 'edit' ? 'Modification de Quiz' : 'Création de Quiz'}
            </h2>
            <div className="space-y-6">
                <Input type="text" value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} placeholder="Titre du quiz (obligatoire)" />
                {renderManualForm()}
            </div>
        </Card>
    );

    const renderManualForm = () => (
        <>
            <div className="space-y-4 pr-2 max-h-[60vh] overflow-y-auto">
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
                <Button variant="secondary" onClick={handleCancelEditor} className="w-full">Annuler</Button>
                <Button onClick={handleSaveQuiz} className="w-full" disabled={isSaving}>
                    {isSaving ? 'Sauvegarde...' : (editorMode === 'edit' ? 'Enregistrer les modifications' : 'Enregistrer le Quiz')}
                </Button>
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
                <Button onClick={handleStartCreate}>+ Créer un Quiz</Button>
            </div>
            <Card>
                <h2 className="text-2xl font-bold text-center mb-4 text-white">Mes Quiz</h2>
                <div className="space-y-3 min-h-[100px]">
                    {isLoading && <p className="text-gray-400 text-center py-4 animate-pulse">Chargement des quiz...</p>}
                    {!isLoading && quizzes.length === 0 && <p className="text-gray-400 text-center py-4">Vous n'avez pas encore créé de quiz.</p>}
                    {!isLoading && quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                            <span className="text-white font-semibold">{quiz.title}</span>
                            <div className="flex items-center gap-2">
                                <Button onClick={() => setSharingQuiz(quiz)} className="px-3 py-1 text-sm">Partager</Button>
                                <Button variant="secondary" onClick={() => window.location.hash = `#/podium/${quiz.id}`} className="px-3 py-1 text-sm">Podium</Button>
                                <button onClick={() => handleStartEdit(quiz)} className="text-gray-400 hover:text-white p-2 rounded-full"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteQuiz(quiz.id)} className="text-gray-400 hover:text-red-400 p-2 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );

    return (
        <>
            {sharingQuiz && <ShareModal quiz={sharingQuiz} onClose={() => setSharingQuiz(null)} />}
            {editorMode ? renderEditorScreen() : renderDashboardHome()}
        </>
    );
};

export default AdminDashboard;