export declare enum SessionStatus {
    WAITING = "WAITING",
    LIVE = "LIVE",
    FINISHED = "FINISHED"
}
export declare class CreateSessionDto {
    quizId: string;
    maxParticipants?: number;
    questionTimeLimit?: number;
    endTime?: string;
}
export declare class JoinSessionDto {
    roomCode: string;
}
