import React, { useState } from 'react';
import { type Quiz } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';

const QRCodeDisplay: React.FC<{ url: string }> = ({ url }) => (
    <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
        alt="QR Code"
        className="mx-auto border-4 border-white rounded-lg shadow-lg"
    />
);

interface ShareModalProps {
    quiz: Quiz;
    onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ quiz, onClose }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    // Construit l'URL de partage en se basant sur l'ID du quiz pour une URL courte et fiable.
    const baseUrl = window.location.href.split('#')[0];
    const playerUrl = `${baseUrl}#/quiz/${quiz.id}`;

    const handleCopy = () => {
        // Méthode de secours (fallback) pour les anciens navigateurs ou contextes non sécurisés
        const fallbackCopy = () => {
            const textArea = document.createElement("textarea");
            textArea.value = playerUrl;
            
            // Style pour rendre le textarea invisible et éviter tout décalage visuel
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                console.error('La copie via execCommand a échoué', err);
            }

            document.body.removeChild(textArea);
        };

        // On essaie d'abord l'API moderne `navigator.clipboard`
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(playerUrl).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            }).catch(err => {
                console.error('La copie via l\'API Clipboard a échoué, tentative avec la méthode de secours :', err);
                fallbackCopy();
            });
        } else {
            // Si l'API n'est pas dispo, on utilise directement la méthode de secours
            fallbackCopy();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-md">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-yellow-300">Partager le Quiz</h2>
                    <p className="text-lg text-white">{quiz.title}</p>
                    <QRCodeDisplay url={playerUrl} />
                    <p className="text-xs text-gray-400">Vos invités peuvent scanner ce code pour jouer !</p>
                    <Button onClick={handleCopy} className="w-full">{copySuccess ? 'Copié !' : 'Copier le lien'}</Button>
                    <Button variant="secondary" onClick={onClose}>Fermer</Button>
                </div>
            </Card>
        </div>
    );
};

export default ShareModal;