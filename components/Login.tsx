import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';

const ADMIN_PASSWORD = "1234"; // Simple hardcoded password

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setError('');
            onLoginSuccess();
        } else {
            setError('Code d\'accès incorrect.');
        }
    };

    return (
        <Card>
            <div className="text-center">
                <h1 className="font-brand text-5xl text-yellow-300 mb-2">Quiz Party</h1>
                <p className="text-gray-300 mb-8">Espace Administrateur</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le code d'accès"
                    aria-label="Code d'accès"
                />
                <Button type="submit" className="w-full">
                    Connexion
                </Button>
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            </form>
        </Card>
    );
};

export default Login;
