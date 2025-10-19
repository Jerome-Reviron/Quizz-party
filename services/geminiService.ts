import { GoogleGenAI, Type } from "@google/genai";
import { type Question } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (theme: string, questionCount: number, optionCount: number): Promise<Question[]> => {
    const prompt = `Génère un quiz humoristique de ${questionCount} questions à choix multiples sur le thème suivant : "${theme}". Les questions doivent être drôles, un peu personnelles mais jamais gênantes, et parfaites pour une soirée d'anniversaire entre amis. Pour chaque question, fournis ${optionCount} options de réponse et indique l'index de la bonne réponse (de 0 à ${optionCount - 1}). Assure-toi qu'il n'y ait qu'une seule bonne réponse.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: {
                                type: Type.STRING,
                                description: "La question posée."
                            },
                            options: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.STRING
                                },
                                description: `Un tableau de ${optionCount} réponses possibles.`
                            },
                            answerIndex: {
                                type: Type.INTEGER,
                                description: `L'index (0-${optionCount-1}) de la bonne réponse dans le tableau d'options.`
                            }
                        },
                        required: ["question", "options", "answerIndex"]
                    }
                }
            }
        });

        const quizDataString = response.text.trim();
        const quizData = JSON.parse(quizDataString) as Question[];
        
        // Basic validation
        if (!Array.isArray(quizData) || quizData.length === 0 || quizData.some(q => !q.question || !q.options || q.options.length !== optionCount || q.answerIndex === undefined)) {
            throw new Error("Les données du quiz reçues de l'API sont invalides ou ne correspondent pas à la demande.");
        }

        return quizData;

    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Impossible de générer le quiz. Veuillez réessayer ou modifier votre demande.");
    }
};
