import React from 'react';
import Card from './ui/Card';

const ConfigError: React.FC = () => {
    return (
        <Card>
            <div className="text-center p-4">
                <h1 className="font-brand text-4xl text-red-400 mb-4">Erreur de Configuration</h1>
                <p className="text-white mb-6">Le podium et la sauvegarde des scores sont désactivés.</p>

                <div className="text-left bg-gray-900 p-4 rounded-lg text-white space-y-4 text-sm">
                    <p>Il semble que les clés de connexion au service de sauvegarde n'aient pas été correctement configurées.</p>

                    <p className="font-bold pt-2">Action requise :</p>
                    <p className="text-gray-300">Veuillez suivre ces étapes pour résoudre le problème :</p>
                    <ul className="list-disc list-inside text-gray-400 pl-2 space-y-2">
                        <li>
                            Ouvrez le fichier : <br />
                            <code className="bg-gray-700 p-1 rounded text-yellow-300">services/storageService.ts</code>
                        </li>
                        <li>
                            Au début de ce fichier, trouvez ces lignes :
                            <pre className="bg-black p-2 rounded-md mt-1 text-xs whitespace-pre-wrap">
                                <code>
{`const rawApiKey = "VOTRE_CLÉ_API_JSONBIN_ICI";
const rawBinId = "VOTRE_BIN_ID_JSONBIN_ICI";`}
                                </code>
                            </pre>
                        </li>
                        <li>Remplacez <code className="bg-gray-700 p-1 rounded">"VOTRE_CLÉ_API_JSONBIN_ICI"</code> par votre clé "X-Master-Key" de JSONBin.</li>
                        <li>Remplacez <code className="bg-gray-700 p-1 rounded">"VOTRE_BIN_ID_JSONBIN_ICI"</code> par l'identifiant de votre bin (l'ID se trouve dans l'URL de votre bin).</li>
                        <li>Sauvegardez le fichier. L'application devrait se recharger automatiquement et fonctionner.</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default ConfigError;