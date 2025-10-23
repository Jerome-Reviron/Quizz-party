import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    // PROPRIÉTÉ ESSENTIELLE POUR GITHUB PAGES
    base: "/Quizz-party/",
      
    // Le bloc 'define' a été supprimé.
    // On laisse Vite gérer les variables d'environnement préfixées par VITE_
    // automatiquement. C'est la méthode standard et la plus fiable.
      
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
});
