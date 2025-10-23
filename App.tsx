import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/AdminDashboard';
import QuizPlayer from './components/QuizPlayer';
import PodiumManager from './components/PodiumManager';
import Login from './components/Login';
import ConfigError from './components/ConfigError';
import { type Quiz } from './types';
import { decodeData } from './utils/urlData';
import { isStorageConfigured } from './services/storageService';

const App: React.FC = () => {
    const [route, setRoute] = useState<string>('home');
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

    useEffect(() => {
        // Vérifier si l'admin est déjà connecté dans la session
        if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
            setIsAdminLoggedIn(true);
        }

        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/quiz/')) {
                try {
                    const encodedData = hash.substring(7);
                    const decodedData = decodeData<Quiz>(encodedData);
                    setQuizData(decodedData);
                    setRoute('play');
                } catch (error) {
                    console.error("Failed to decode quiz data:", error);
                    window.location.hash = '#/';
                    setRoute('home');
                }
            } else if (hash.startsWith('#/podium/')) {
                try {
                    const encodedData = hash.substring(9);
                    const decodedData = decodeData<Quiz>(encodedData);
                    setQuizData(decodedData);
                    setRoute('podium');
                } catch (error) {
                    console.error("Failed to decode podium data:", error);
                    window.location.hash = '#/';
                    setRoute('home');
                }
            } else {
                setRoute('home');
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
        // Le garde-fou de configuration utilise maintenant le nouveau service.
        if (!isStorageConfigured) {
            return <ConfigError />;
        }
        
        switch (route) {
            case 'play':
                return quizData ? <QuizPlayer quiz={quizData} /> : <div className="text-center p-8">Chargement du quiz...</div>;
            case 'podium':
                return quizData ? <PodiumManager quiz={quizData} /> : <div className="text-center p-8">Chargement du podium...</div>;
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