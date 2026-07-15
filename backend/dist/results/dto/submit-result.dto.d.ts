export declare class AnswerDto {
    questionId: string;
    answer: string;
    score: number;
}
export declare class SubmitResultDto {
    sessionId: string;
    totalScore: number;
    answers: AnswerDto[];
}
export declare class LeaderboardEntry {
    participantId: string;
    participantName: string;
    score: number;
    rank: number;
}
