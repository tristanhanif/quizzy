export declare enum QuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    TRUE_FALSE = "TRUE_FALSE"
}
export declare class CreateQuestionDto {
    text: string;
    type: QuestionType;
    points: number;
    choices: string[];
    correctAnswer: string;
    timeLimit: number;
}
export declare class CreateQuizDto {
    title: string;
    description: string;
    isPublic: boolean;
    questions: CreateQuestionDto[];
}
export declare class UpdateQuizDto {
    title?: string;
    description?: string;
    isPublic?: boolean;
    questions?: CreateQuestionDto[];
}
