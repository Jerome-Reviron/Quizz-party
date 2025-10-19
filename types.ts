export interface Question {
    question: string;
    options: string[];
    answerIndex: number;
}

export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
}

export interface PlayerResult {
    id: string;
    name: string;
    score: number;
}
