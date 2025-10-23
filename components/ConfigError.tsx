import React from 'react';
import Card from './ui/Card';
import { API_KEY, BIN_ID } from '../services/podiumService';

const ConfigError: React.FC = () => {
    return (
        <Card>
            <div className="text-center p-4">
                <h1 className="font-brand text-4xl text-red-400 mb-4">Erreur de Configuration</h1>
                <p className="text-white mb-6">Le podium et la sauvegarde des scores sont désactivés.</p>

                <div className="text-left bg-gray-900 p-4 rounded-lg text-white space-y-4 text-sm">
                    <p>L'application n'a pas réussi à charger toutes les clés nécessaires. Voici ce qui a été détecté :</p>
                    
                    <div className="space-y-2">
                        <div className={`p-2 rounded ${API_KEY ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <strong>VITE_JSONBIN_API_KEY:</strong> 
                            <span className="font-mono ml-2">{API_KEY ? "✔️ Chargée" : "❌ Manquante"}</span>
                        </div>
                        <div className={`p-2 rounded ${BIN_ID ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <strong>VITE_JSONBIN_BIN_ID:</strong>
                            <span className="font-mono ml-2">{BIN_ID ? "✔️ Chargé" : "❌ Manquant"}</span>
                        </div>
                    </div>

                    <p className="font-bold pt-2">Comment résoudre ce problème ?</p>
                    <p className="text-gray-300">Veuillez vérifier les points suivants TRÈS attentivement :</p>
                    <ul className="list-disc list-inside text-gray-400 pl-2 space-y-1">
                        <li>À la racine de votre projet, un fichier nommé très exactement <code className="bg-gray-700 p-1 rounded">.env.local</code> doit exister.</li>
                        <li>Le nom de la variable est <code className="bg-gray-700 p-1 rounded">VITE_JSONBIN_API_KEY</code>, sans aucune faute de frappe.</li>
                        <li>Il ne doit y avoir aucun espace avant ou après le signe <code className="bg-gray-700 p-1 rounded">=</code>.</li>
                        <li>
                            <strong>Action cruciale :</strong> Supprimez le fichier <code className="bg-gray-700 p-1 rounded">.env.local</code> et recréez-le en tapant manuellement (sans copier-coller) pour éviter les caractères invisibles.
                        </li>
                        <li>
                            Après toute modification, vous devez <strong>arrêter et redémarrer complètement</strong> le serveur de développement.
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default ConfigError;
