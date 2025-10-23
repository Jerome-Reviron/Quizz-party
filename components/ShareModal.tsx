import React, { useState } from 'react';
import { type Quiz } from '../types';
import { encodeData } from '../utils/urlData';
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

    // Construit l'URL de partage en retirant un éventuel hash existant de l'URL de base.
    const baseUrl = window.location.href.split('#')[0];
    const encodedQuizData = encodeData(quiz);
    const playerUrl = `${baseUrl}#/quiz/${encodedQuizData}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(playerUrl).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }).catch(err => {
            console.error('Erreur lors de la tentative de copie', err);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-md">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-yellow-300">Partager le Quiz</h2>
                    <p className="text-lg text-white">{quiz.title}</p>
                    {playerUrl.length > 2000 && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-lg">
                            <p><strong>Attention :</strong> Ce quiz est très volumineux et le lien pourrait ne pas fonctionner sur tous les téléphones via QR code.</p>
                        </div>
                    )}
                    <QRCodeDisplay url={playerUrl} />
                    <Button onClick={handleCopy} className="w-full">{copySuccess ? 'Copié !' : 'Copier le lien'}</Button>
                    <Button variant="secondary" onClick={onClose}>Fermer</Button>
                </div>
            </Card>
        </div>
    );
};

export default ShareModal;