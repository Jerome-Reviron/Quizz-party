import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import QuizPlayer from './components/QuizPlayer';
import PodiumManager from './components/PodiumManager';
import Login from './components/Login';
import ConfigError from './components/ConfigError';
import { type Quiz } from './types';
import { isStorageConfigured, getQuizById } from './services/storageService';

const App: React.FC = () => {
    const [route, setRoute] = useState<string>('home');
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);

    useEffect(() => {
        // Vérifier si l'admin est déjà connecté dans la session
        if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            setIsAdminLoggedIn(true);
        }

        const handleHashChange = async () => {
            const hash = window.location.hash;
            let newRoute = 'home';
            let quizId: string | null = null;

            if (hash.startsWith('#/quiz/')) {
                newRoute = 'play';
                quizId = hash.substring(7);
            } else if (hash.startsWith('#/podium/')) {
                newRoute = 'podium';
                quizId = hash.substring(9);
            }
            
            setRoute(newRoute);

            if (quizId) {
                setIsLoadingQuiz(true);
                setQuizData(null); 
                try {
                    const fetchedQuiz = await getQuizById(quizId);
                    if (fetchedQuiz) {
                        setQuizData(fetchedQuiz);
                    } else {
                        console.error(`Quiz with ID ${quizId} not found.`);
                        window.location.hash = '#/';
                    }
                } catch (error) {
                    console.error("Failed to fetch quiz data:", error);
                    window.location.hash = '#/';
                } finally {
                    setIsLoadingQuiz(false);
                }
            } else {
                setQuizData(null);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const handleLoginSuccess = () => {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        setIsAdminLoggedIn(true);
    };

    const renderContent = () => {
        if (!isStorageConfigured) {
            return <ConfigError />;
        }

        if (isLoadingQuiz) {
            return <div className="text-center p-8 text-xl animate-pulse text-white">Chargement du quiz...</div>;
        }
        
        switch (route) {
            case 'play':
                return quizData ? <QuizPlayer quiz={quizData} /> : <div className="text-center p-8 text-white">Quiz non trouvé.</div>;
            case 'podium':
                return quizData ? <PodiumManager quiz={quizData} /> : <div className="text-center p-8 text-white">Podium non trouvé.</div>;
            case 'home':
            default:
                return isAdminLoggedIn ? <AdminDashboard /> : <Login onLoginSuccess={handleLoginSuccess} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default App;